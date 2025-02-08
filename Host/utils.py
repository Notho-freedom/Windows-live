# -*- coding: utf-8 -*-
import re, os
import json
import logging
import socket
import requests
import psutil
import platform
import subprocess
from fastapi.responses import JSONResponse
from fastapi import HTTPException
from datetime import datetime
import wmi
from pathlib import Path
import ctypes
import random
import mss
import time
import io
from PIL import Image
import numpy as np
import mimetypes
import magic


wmi_instance = wmi.WMI()

COMMAND_HISTORY = []

SPI_SETDESKWALLPAPER = 20
SPIF_UPDATEINIFILE = 0x01
SPIF_SENDCHANGE = 0x02





def get_mime_type(file_path):
    # Utiliser mimetypes
    try:
        mime_type, encoding = mimetypes.guess_type(file_path)
        if mime_type:
            return mime_type
    except Exception as e:
        print(f"Erreur avec mimetypes: {e}")


    # Utiliser la commande file via subprocess
    try:
        result = subprocess.run(['file', '--mime-type', '-b', file_path], stdout=subprocess.PIPE)
        mime_type = result.stdout.decode().strip()
        if mime_type:
            return mime_type
    except Exception as e:
        print(f"Erreur avec subprocess: {e}")

    return None


# Définir la structure SHQUERYRBINFO
class SHQUERYRBINFO(ctypes.Structure):
    _fields_ = [("cbSize", ctypes.c_ulong),
                ("i64Size", ctypes.c_longlong),
                ("i64NumItems", ctypes.c_longlong)]

# Fonction pour obtenir l'état de la corbeille
def get_recycle_bin_state():
    rb_info = SHQUERYRBINFO()
    rb_info.cbSize = ctypes.sizeof(SHQUERYRBINFO)
    result = ctypes.windll.shell32.SHQueryRecycleBinW(None, ctypes.byref(rb_info))
    if result != 0:  # S_OK
        raise OSError("Failed to query Recycle Bin state")
    return rb_info

# Fonction pour vider la corbeille
def empty_recycle_bin():
    result = ctypes.windll.shell32.SHEmptyRecycleBinW(None, None, 0)
    if result != 0:  # S_OK
        raise OSError("Failed to empty Recycle Bin")


def validate_command(command):
    # Validation de la commande pour éviter les injections
    if not re.match(r'^[a-zA-Z0-9_\- ]+$', command):
        return False
    return True

def load_scripts():
    try:
        with open('utils.json', 'r') as f:
            return json.load(f)
    except Exception as e:
        logging.error(f"Erreur lors du chargement des scripts : {e}")
        return {}

def get_system_info():
    hostname = socket.gethostname()
    ip_addresses = socket.gethostbyname_ex(hostname)[2]

    try:
        public_ip = requests.get('https://api.ipify.org').text
    except requests.RequestException as e:
        logging.error(f"Erreur lors de la récupération de l'adresse IP publique : {e}")
        public_ip = "Erreur lors de la récupération de l'adresse IP publique"

    partitions_info = []

    network_info = {}
    for interface, addrs in psutil.net_if_addrs().items():
        network_info[interface] = [{'address': addr.address, 'family': str(addr.family)} for addr in addrs]

    cpu_info = {
        'count': psutil.cpu_count(),
        'frequency': psutil.cpu_freq()._asdict(),
        'usage': psutil.cpu_percent(interval=1)
    }

    memory_info = {
        'total': psutil.virtual_memory().total,
        'available': psutil.virtual_memory().available,
        'used': psutil.virtual_memory().used,
        'percent': psutil.virtual_memory().percent
    }

    processes_info = []
    for proc in psutil.process_iter(['pid', 'name', 'cpu_percent', 'memory_info']):
        processes_info.append(proc.info)

    users_info = []
    for user in psutil.users():
        users_info.append({
            'username': user.name,
            'terminal': user.terminal,
            'host': user.host,
            'started': user.started
        })

    system_info = {
        'hostname': hostname,
        'os': platform.system(),
        'os_version': platform.version(),
        'kernel_version': platform.uname().release,
        'architecture': platform.architecture(),
        'partitions': partitions_info,
        'network': network_info,
        'cpu': cpu_info,
        'memory': memory_info,
        'processes': processes_info,
        'users': users_info,
        'web_servers': get_web_server_info()  # Informations sur les serveurs web
    }

    return JSONResponse(content={
        'ip_addresses': ip_addresses,
        'public_ip': public_ip,
        'system_info': system_info
    })


def get_web_server_info():
    web_servers = ['nginx', 'apache2']  # Liste des serveurs web é surveiller
    web_server_info = []

    for proc in psutil.process_iter(['pid', 'name', 'cpu_percent', 'memory_info']):
        if proc.info['name'] in web_servers:
            web_server_info.append(proc.info)

    return web_server_info


def execute_command_directly(command, ip_address, shell_type):
    # Préparer la commande en fonction du type de shell
    if shell_type == "powershell":
        shell_command = f'powershell -Command "{command}"'
    else:
        shell_command = command  # CMD n'a pas besoin de préfixe

    encodings_to_try = ['utf-8', 'cp1252', 'latin-1', 'utf-16', 'utf-32', 'ascii', 'mac_roman', 'iso-8859-15']

    for encoding in encodings_to_try:
        try:
            # Exécuter la commande
            output = subprocess.check_output(shell_command, shell=True, stderr=subprocess.STDOUT, encoding=encoding)
            COMMAND_HISTORY.append({'command': command, 'output': output, 'ip': ip_address})
            logging.info(f"Commande exécutée : {command} par {ip_address}")

            return JSONResponse(content={'success': True, 'command': command, 'output': output})

        except subprocess.CalledProcessError as e:
            logging.error(f"Erreur lors de l'exécution de la commande '{command}': {e.output}")
            COMMAND_HISTORY.append({'command': command, 'error': e.output, 'ip': ip_address})

            return JSONResponse(content={'success': False, 'command': command, 'error': e.output})

        except UnicodeDecodeError:
            logging.warning(f"Erreur de décodage avec l'encodage '{encoding}'. Essai avec un autre encodage.")

    # Si tous les essais échouent, retourner la sortie brute
    try:
        output = subprocess.check_output(shell_command, shell=True, stderr=subprocess.STDOUT)
        logging .error(f"Tous les essais d'encodage ont échoué.\n Sortie brute :\n\n {output}")
        return JSONResponse(content={'success': False, 'command': command, 'error': 'Erreur de décodage. Sortie brute.', 'raw_output': output.decode('latin-1', errors='replace')})
    except Exception as e:
        logging.error(f"Erreur lors de la récupération de la sortie brute : {e}")
        return JSONResponse(content={'success': False, 'command': command, 'error': 'Erreur lors de la récupération de la sortie brute.'})



def get_directory_contents(directory: str):
    """Récupère les fichiers et dossiers dans un répertoire avec leurs informations."""
    if not os.path.exists(directory):
        raise HTTPException(status_code=404, detail=f"Répertoire non trouvé : {directory}")
    
    if not os.path.isdir(directory):
        raise HTTPException(status_code=400, detail=f"Le chemin fourni n'est pas un répertoire : {directory}")
    
    contents = []
    try:
        for item in os.listdir(directory):
            full_path = os.path.join(directory, item)
            stat = os.stat(full_path)
            contents.append({
                "name": item,
                "path": full_path,
                "type": "directory" if os.path.isdir(full_path) else "file",
                "size": stat.st_size,
                "last_modified": datetime.fromtimestamp(stat.st_mtime).isoformat(),
                "is_hidden": item.startswith('.'),
            })
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la lecture du répertoire : {str(e)}")
    
    return contents



def get_current_wallpaper() -> str:
    """
    Récupère le chemin de l'image d'arrière-plan actuelle du bureau.
    """
    SPI_GETDESKWALLPAPER = 0x0073
    # Buffer pour le chemin du fichier (max 260 caractères pour Windows)
    buffer_length = 260
    buffer = ctypes.create_unicode_buffer(buffer_length)
    ctypes.windll.user32.SystemParametersInfoW(SPI_GETDESKWALLPAPER, buffer_length, buffer, 0)
    return buffer.value






def get_storage_devices():
    """Récupère les informations sur les périphériques de stockage."""
    devices = []
    for disk in wmi_instance.Win32_LogicalDisk():
        devices.append({
            "device": disk.DeviceID,
            "volume_name": disk.VolumeName,
            "file_system": disk.FileSystem,
            "size": int(disk.Size) // (1024**3) if disk.Size else None,
            "free_space": int(disk.FreeSpace) // (1024**3) if disk.FreeSpace else None
        })
    return devices

def get_network_interfaces():
    """Récupère les interfaces réseau et leurs statuts."""
    interfaces = []
    for nic in psutil.net_if_addrs():
        stats = psutil.net_if_stats()[nic]
        interfaces.append({
            "name": nic,
            "is_up": stats.isup,
            "speed": stats.speed if stats.speed else "Unknown",
            "addresses": [
                {"address": addr.address, "family": str(addr.family)} for addr in psutil.net_if_addrs()[nic]
            ]
        })
    return interfaces

def get_usb_devices():
    """Récupère les périphériques USB connectés."""
    usb_devices = []
    for usb in wmi_instance.Win32_USBControllerDevice():
        device = usb.Dependent
        usb_devices.append({
            "name": device.Name,
            "description": device.Description,
            "device_id": device.DeviceID
        })
    return usb_devices

def get_active_connections():
    """Récupère les connexions réseau actives."""
    connections = []
    for conn in psutil.net_connections(kind='inet'):
        connections.append({
            "local_address": f"{conn.laddr.ip}:{conn.laddr.port}" if conn.laddr else None,
            "remote_address": f"{conn.raddr.ip}:{conn.raddr.port}" if conn.raddr else None,
            "status": conn.status,
            "pid": conn.pid
        })
    return connections

def get_system_info():
    """Route pour récupérer toutes les informations système."""
    return {
        "storage_devices": get_storage_devices(),
        "network_interfaces": get_network_interfaces(),
        "usb_devices": get_usb_devices(),
        "active_connections": get_active_connections()
    }
    
def get_detailed_processes():
    """Récupère des détails complets sur les processus en cours."""
    processes = []
    for proc in psutil.process_iter(['pid', 'name', 'cpu_percent', 'memory_percent', 'status', 'username', 'exe', 'create_time']):
        try:
            processes.append({
                "pid": proc.info['pid'],
                "name": proc.info['name'],
                "cpu_usage": proc.info['cpu_percent'],
                "memory_usage": proc.info['memory_percent'],
                "status": proc.info['status'],
                "user": proc.info['username'],
                "path": proc.info['exe'],  # Chemin d'exécution
                "start_time": proc.info['create_time']  # Timestamp de début
            })
        except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
            continue
    return processes


def suspend_process(pid: int):
    """Suspend un processus."""
    try:
        proc = psutil.Process(pid)
        proc.suspend()
        return {"message": f"Processus {pid} suspendu avec succès."}
    except psutil.NoSuchProcess:
        return {"error": f"Processus {pid} introuvable."}
    except psutil.AccessDenied:
        return {"error": "Permission refusée pour suspendre le processus."}

def resume_process(pid: int):
    """Reprend un processus suspendu."""
    try:
        proc = psutil.Process(pid)
        proc.resume()
        return {"message": f"Processus {pid} repris avec succès."}
    except psutil.NoSuchProcess:
        return {"error": f"Processus {pid} introuvable."}
    except psutil.AccessDenied:
        return {"error": "Permission refusée pour reprendre le processus."}

def terminate_process(pid: int):
    """Arrête un processus."""
    try:
        proc = psutil.Process(pid)
        proc.terminate()
        return {"message": f"Processus {pid} arrêté avec succès."}
    except psutil.NoSuchProcess:
        return {"error": f"Processus {pid} introuvable."}
    except psutil.AccessDenied:
        return {"error": "Permission refusée pour arrêter le processus."}

def get_running_programs():
    """Récupère les programmes visibles en cours d'exécution."""
    programs = []
    wmi_instance = wmi.WMI()
    for process in wmi_instance.Win32_Process():
        try:
            if process.ExecutablePath:  # Filtre les processus ayant un chemin d'exécution
                programs.append({
                    "pid": process.ProcessId,
                    "name": process.Name,
                    "path": process.ExecutablePath,
                    "user": process.GetOwner()[0] if process.GetOwner() else "Système",
                })
        except Exception:
            continue
    return programs


def sleep_machine():
    """Met la machine en veille."""
    try:
        os.system("rundll32.exe powrprof.dll,SetSuspendState 0,1,0")
        return {"message": "La machine est en veille."}
    except Exception as e:
        return {"error": str(e)}
    
def hibernate_machine():
    """Met la machine en veille prolongée."""
    try:
        os.system("shutdown /h")
        return {"message": "La machine est en veille prolongée."}
    except Exception as e:
        return {"error": str(e)}

def is_hibernate_enabled():
    """Vérifie si la veille prolongée est activée."""
    try:
        result = subprocess.run(["powercfg", "-a"], capture_output=True, text=True)
        return {"hibernate_enabled": "Veille prolongée" in result.stdout}
    except Exception as e:
        return {"error": str(e)}

def enable_hibernate(enable: bool):
    """Active ou désactive la veille prolongée."""
    try:
        command = "powercfg /hibernate on" if enable else "powercfg /hibernate off"
        os.system(command)
        state = "activée" if enable else "désactivée"
        return {"message": f"Veille prolongée {state} avec succès."}
    except Exception as e:
        return {"error": str(e)}


# Fonction pour changer l'arrière-plan
def set_wallpaper(image_path: str):
    if not Path(image_path).is_file():
        raise FileNotFoundError(f"L'image spécifiée n'a pas été trouvée : {image_path}")
    
    result = ctypes.windll.user32.SystemParametersInfoW(
        SPI_SETDESKWALLPAPER, 0, image_path, SPIF_UPDATEINIFILE | SPIF_SENDCHANGE
    )
    
    if result == 0:
        raise Exception("Erreur lors du changement d'arrière-plan.")
    return True

# Fonction pour choisir une image aléatoire dans un répertoire
def choose_random_image(directory: str):
    images = [f for f in Path(directory).glob('*') if f.suffix.lower() in ['.jpg', '.png', '.bmp', '.jpeg']]
    if not images:
        raise FileNotFoundError("Aucune image valide trouvée dans le répertoire.")
    return random.choice(images)


# Fonction pour télécharger une image depuis une URL et la sauvegarder localement
def download_image(url: str, save_path: str):
    try:
        response = requests.get(url)
        response.raise_for_status()  # Vérifie que la requête a réussi
        with open(save_path, 'wb') as file:
            file.write(response.content)
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=400, detail=f"Erreur lors du téléchargement de l'image : {e}")

# Fonction pour capturer une image de l'écran
def capture_screen():
    with mss.mss() as sct:
        monitor = sct.monitors[1]  # 1 pour le premier écran, sinon choisir selon les écrans
        screenshot = sct.grab(monitor)
        img = Image.frombytes('RGB', (screenshot.width, screenshot.height), screenshot.rgb)
        return img

# Fonction pour convertir l'image en un flux binaire
def generate_screen_stream():
    while True:
        # Capturer une image de l'écran
        img = capture_screen()

        # Convertir l'image en bytes
        buf = io.BytesIO()
        img.save(buf, format="JPEG")
        buf.seek(0)

        # Envoyer le flux d'images sous forme de réponse HTTP
        yield buf.read()
        time.sleep(0.01)  # Petite pause pour limiter la fréquence du flux
