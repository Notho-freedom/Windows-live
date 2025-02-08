# -*- coding: latin -*-
from fastapi import APIRouter, Request, HTTPException, WebSocket, WebSocketDisconnect
from utils import (validate_command, load_scripts, 
                   get_system_info, execute_command_directly, 
                   suspend_process, resume_process, 
                   terminate_process, get_web_server_info, 
                   get_storage_devices, get_network_interfaces, 
                   get_usb_devices, get_active_connections, 
                   get_detailed_processes, get_running_programs, 
                   sleep_machine, hibernate_machine, 
                   is_hibernate_enabled, enable_hibernate, 
                   set_wallpaper, choose_random_image,
                   download_image, generate_screen_stream,
                   get_directory_contents,get_current_wallpaper,
                   get_recycle_bin_state, empty_recycle_bin,
                   get_mime_type)
import psutil
import logging
import random,os
from datetime import datetime, timedelta
import subprocess
from wakeonlan import send_magic_packet
import time
import speedtest
import ctypes
import json
import win32evtlog
from fastapi.responses import FileResponse,StreamingResponse
from pathlib import Path
from pydantic import BaseModel
import os
from sse_starlette import EventSourceResponse
import base64
import asyncio
import io
from PIL import ImageGrab
from starlette.responses import StreamingResponse


router = APIRouter()

COMMAND_HISTORY = []
connections = []
RESTRICTED_COMMANDS = ["ls", "pwd", "echo"]
SCRIPTS = load_scripts()
IMAGES_DIR = r"C:\Windows\Web\Screen"

THEMES = {
    'dark': {
        'background': 'bg-black',
        'textColor': 'text-white',
        'promptColor': 'text-gray-400',
        'rootColor': 'text-green-500'
    },
    'light': {
        'background': 'bg-gray-200',
        'textColor': 'text-black',
        'promptColor': 'text-gray-800',
        'rootColor': 'text-gray-600'
    },
    'windows': {
        'background': 'bg-blue-800',
        'textColor': 'text-cyan-300',
        'promptColor': 'text-gold',
        'rootColor': 'text-white'
    },
    'ubuntu': {
        'background': 'bg-[#300a24]',
        'textColor': 'text-white',
        'promptColor': 'text-white',
        'rootColor': 'ubt-root'
    },
    'kali': {
        'background': 'bg-gray-900',
        'textColor': 'text-white',
        'promptColor': 'ubt-root',
        'rootColor': 'text-blue-800'
    },
    'macos': {
        'background': 'bg-gray-100',
        'textColor': 'text-black',
        'promptColor': 'text-gray-600',
        'rootColor': 'text-gray-700'
    }
}

SETTINGS = {
    'fontSize': 'clamp(0.75rem, 2vw, 1rem)',
    'theme': random.choice(list(THEMES.keys())),
    'image': None,
    'imageOpacity': 1,
    'shell_type': 'cmd'  # Valeur par défaut
}

def setup_routes(app):
    app.include_router(router)
    





def capture_screen():
    screen = ImageGrab.grab()
    return screen

@router.websocket("/ws/live_screen")
async def live_screen(websocket: WebSocket):
    await websocket.accept()

    while True:
        img = capture_screen()

        buf = io.BytesIO()
        img.save(buf, format="JPEG")
        buf.seek(0)

        await websocket.send_bytes(buf.read())

        await asyncio.sleep(0.1)



class CodeData(BaseModel):
    code: str

def show_popup(message: str, title: str = "Code Received"):
    ctypes.windll.user32.MessageBoxW(0, message, title, 1)

@router.post("/")
async def receive_code(data: CodeData):
    show_popup(f"Code received: {data.code}")
    return {"message": "Code received successfully", "code": data.code}

    
@router.post("/set-shell-type")
async def set_shell_type(request: Request):
    data = await request.json()
    shell_type = data.get('shell_type')
    
    if shell_type not in ["cmd", "powershell"]:
        raise HTTPException(status_code=400, detail="Invalid shell type. Use 'cmd' or 'powershell'.")

    SETTINGS['shell_type'] = shell_type
    return {"message": f'Shell type changed to {shell_type}', "shell_type": SETTINGS['shell_type']} 
    

@router.post("/execute")
async def execute_command(request: Request):
    data = await request.json()
    command = data.get('command')

    if not command or not validate_command(command):
        logging.error("Commande vide, manquante ou invalide.")
        raise HTTPException(status_code=400, detail="Commande vide, manquante ou invalide.")

    if command in RESTRICTED_COMMANDS:
        logging.warning(f"Tentative d'exécution d'une commande non autorisée : {command}")
        raise HTTPException(status_code=403, detail="Commande non autorisée.")

    ip_address = request.client.host
    connections.append({'ip': ip_address, 'command': command, 'timestamp': datetime.now()})

    # Utiliser le type de shell stocké dans SETTINGS
    shell_type = SETTINGS.get('shell_type', 'cmd')
    
    # Exécuter la commande directement et obtenir la sortie
    output = execute_command_directly(command, ip_address, shell_type)
    COMMAND_HISTORY.append(command)  # Ajout de la commande à l'historique
    return output

@router.get("/server-stats")
async def server_stats():
    uptime = datetime.now() - datetime.fromtimestamp(psutil.boot_time())
    stats = {
        'cpu_usage': psutil.cpu_percent(interval=1),
        'memory_usage': psutil.virtual_memory().percent,
        'disk_usage': psutil.disk_usage('/').percent,
        'uptime': str(uptime)
    }
    return stats

@router.get("/connections")
async def get_connections(ip: str = None):
    filtered_connections = [conn for conn in connections if conn['ip'] == ip] if ip else connections
    return filtered_connections

@router.post("/manage-whitelist")
async def manage_whitelist(request: Request):
    data = await request.json()
    command = data.get('command')
    action = data.get('action')

    if not command or action not in ["add", "remove"]:
        raise HTTPException(status_code=400, detail="Commande ou action manquante ou invalide.")

    if action == "add":
        if command not in RESTRICTED_COMMANDS:
            RESTRICTED_COMMANDS.append(command)
            logging.info(f"Commande ajoutée à la liste blanche : {command}")
            return {"message": f"Commande ajoutée : {command}"}
        return {"message": "Commande déjà présente dans la liste blanche."}

    elif action == "remove":
        if command in RESTRICTED_COMMANDS:
            RESTRICTED_COMMANDS.remove(command)
            logging.info(f"Commande retirée de la liste blanche : {command}")
            return {"message": f"Commande retirée : {command}"}
        raise HTTPException(status_code=404, detail=" Commande non trouvée dans la liste blanche.")

@router.post("/run-script")
async def run_script(request: Request):
    data = await request.json()
    script_name = data.get('script')

    if not script_name:
        raise HTTPException(status_code=400, detail="Nom du script manquant.")

    script_content = SCRIPTS.get(script_name)

    if not script_content:
        raise HTTPException(status_code=404, detail="Script non trouvé.")

    try:
        exec(script_content)
        return {"message": "Script exécuté avec succès."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de l'exécution du script : {str(e)}")

@router.post("/disconnect-inactive")
async def disconnect_inactive():
    inactive_time_limit = timedelta(minutes=5)
    current_time = datetime.now()
    for conn in connections[:]:  # Utiliser une copie de la liste pour éviter les problèmes de modification
        if current_time - conn['timestamp'] > inactive_time_limit:
            connections.remove(conn)
    return {"message": "Connexions inactives déconnectées."}

@router.get("/history")
async def get_history():
    return COMMAND_HISTORY

@router.get("/system-info")
async def system_info(request: Request):
    return get_system_info()

@router.get("/settings")
async def get_settings():
    return SETTINGS

@router.post("/predict-command")
async def predict_command_route(request: Request):
    data = await request.json()
    input_command = data.get('input_command')
    if not input_command:
        raise HTTPException(status_code=400, detail="Commande d'entrée manquante.")
    # next_command = predict_next_command(input_command, tokenizer, max_length)
    next_command = True  # Placeholder pour la prédiction
    return {"next_command": next_command}

@router.post("/get-theme")
async def get_theme(request: Request):
    theme = request.query_params.get('theme')
    if theme in THEMES:
        return {"success": True, "theme": THEMES[theme]}
    else:
        return {"error": f'Theme not found: {theme}'}, 404

@router.post("/set-theme")
async def set_theme(request: Request):
    data = await request.json()
    theme = data.get('theme')
    if theme in THEMES:
        SETTINGS['theme'] = theme
        return {"message": f'Theme changed to {theme}', "theme": THEMES[theme]}
    else:
        return {"error": f'Invalid theme: {theme}'}, 400

@router.post("/set-font-size")
async def set_font_size(request: Request):
    data = await request.json()
    font_size = data.get('fontSize')
    SETTINGS['fontSize'] = font_size
    return {"message": f'Font size changed to {font_size}', "fontSize": font_size}

@router.post("/set-background-image")
async def set_background_image(request: Request):
    data = await request.json()
    image_url = data.get('imageUrl')
    SETTINGS['image'] = image_url
    return {"message": f'Background image set to {image_url}', "image": SETTINGS['image']}

@router.post("/set-image-opacity")
async def set_image_opacity(request: Request):
    data = await request.json()
    opacity = data.get('opacity')
    if 0 <= opacity <= 1:
        SETTINGS['imageOpacity'] = opacity
        return {"message": f'Image opacity set to {opacity}', "imageOpacity": SETTINGS['imageOpacity']}
    else:
        return {"error": 'Invalid opacity value. Must be between 0 and 1.'}, 400
    
    
@router.post("/system/directory_contents")
async def list_directory_contents(request: Request):
    data = await request.json()
    directory = data.get('directory')
    return get_directory_contents(directory) 
    


@router.get("/system/current_wallpaper_image")
def serve_current_wallpaper():
    """
    Retourne l'image d'arrière-plan actuelle sous forme de fichier.
    """
    wallpaper = get_current_wallpaper()
    if not wallpaper:
        raise HTTPException(status_code=404, detail="Aucun arrière-plan trouvé")
    return FileResponse(wallpaper, media_type="image/jpeg")


@router.get("/system/resources")
def get_resources():
    """Récupère l'utilisation actuelle des ressources système."""
    disk_usage = {}
    for disk in psutil.disk_partitions():
        try:
            usage = psutil.disk_usage(disk.mountpoint)._asdict()
            disk_usage[disk.device] = usage
        except PermissionError:
            # Ignorer les périphériques non prêts ou inaccessible
            disk_usage[disk.device] = {"error": "Device not ready or inaccessible"}

    return {
        "cpu_usage": psutil.cpu_percent(interval=1),
        "memory": psutil.virtual_memory()._asdict(),
        "disk": disk_usage,
        "network": psutil.net_io_counters()._asdict(),
    }

@router.get("/system/random-image")
async def get_random_image():
    """
    Endpoint to serve a random image as a FileResponse.
    """
    try:
        # Get a list of all files in the directory
        files = [f for f in os.listdir(IMAGES_DIR) if os.path.isfile(os.path.join(IMAGES_DIR, f))]
        
        # Filter for image files (optional, if specific file types are required)
        image_extensions = {".jpg", ".jpeg", ".png", ".bmp"}
        images = [f for f in files if os.path.splitext(f)[1].lower() in image_extensions]
        
        if not images:
            raise HTTPException(status_code=404, detail="No image files found in the directory.")
        
        # Pick a random image
        random_image = random.choice(images)
        
        # Full path to the image
        image_path = os.path.join(IMAGES_DIR, random_image)
        
        # Return the image as a FileResponse
        return FileResponse(image_path)
    
    except Exception as e:
        # Handle unexpected errors
        raise HTTPException(status_code=500, detail=f"Error occurred: {str(e)}")


@router.get("/system/images")
async def list_images():
    """
    Endpoint to return a list of available image filenames in the directory.
    """
    try:
        # Get a list of all files in the directory
        files = [f for f in os.listdir(IMAGES_DIR) if os.path.isfile(os.path.join(IMAGES_DIR, f))]
        
        # Filter for image files (optional, if specific file types are required)
        image_extensions = {".jpg", ".jpeg", ".png", ".bmp"}
        images = [f for f in files if os.path.splitext(f)[1].lower() in image_extensions]
        
        if not images:
            raise HTTPException(status_code=404, detail="No image files found in the directory.")
        
        # Return the list of image filenames
        return {"images": images}
    
    except Exception as e:
        # Handle unexpected errors
        raise HTTPException(status_code=500, detail=f"Error occurred: {str(e)}")

    

@router.post("/system/image/")
async def get_image(request: Request):
    """
    Endpoint to serve a specific image by its filename.
    """
    try:
        # Récupérer les données JSON envoyées par la requête
        data = await request.json()
        image_name = data.get('image_name')

        if not image_name:
            raise HTTPException(status_code=400, detail="Le nom de l'image est requis.")
        
        # Empêche l'usage de chemins relatifs pour éviter les attaques
        if ".." in image_name or os.path.isabs(image_name):
            raise HTTPException(status_code=400, detail="Nom de fichier invalide.")
        
        # Full path to the image
        image_path = os.path.join(IMAGES_DIR, image_name)

        # Vérifier si l'image existe
        if not os.path.exists(image_path) or not os.path.isfile(image_path):
            raise HTTPException(status_code=404, detail="Image non trouvée.")

        # Retourner l'image en tant que réponse de fichier
        return FileResponse(image_path)

    except Exception as e:
        # En cas d'erreur inattendue
        print(f"Erreur: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur : {str(e)}")
    
@router.get("/recycle_bin_state")
def read_recycle_bin_state():
    try:
        rb_info = get_recycle_bin_state()
        return {
            "size": rb_info.i64Size,
            "num_items": rb_info.i64NumItems
        }
    except OSError as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/empty_recycle_bin")
def clear_recycle_bin():
    try:
        empty_recycle_bin()
        return {"message": "Recycle Bin emptied successfully"}
    except OSError as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/sse/current_wallpaper_image", response_class=StreamingResponse)
async def wallpaper_updates():
    def event_publisher():
        try:
            # Vérifiez que l'image existe
            image_path = get_current_wallpaper()
            if not os.path.exists(image_path):
                raise FileNotFoundError("Le fichier image n'a pas été trouvé")

            while True:
                # Encodage de l'image en Base64
                with open(image_path, "rb") as image_file:
                    image_data = image_file.read()
                    base64_encoded = base64.b64encode(image_data).decode('utf-8')

                # Émission de l'image encodée sous forme SSE
                yield f"data: {base64_encoded}\n\n"

                # Pause entre les envois pour éviter une surcharge
                time.sleep(5)
        except Exception as e:
            # Gestion des erreurs
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    return StreamingResponse(event_publisher(), media_type="text/event-stream")


async def sse_resources():
    """Génère des événements SSE pour les ressources système en temps réel."""
    while True:
        disk_usage = {}
        for disk in psutil.disk_partitions():
            try:
                usage = psutil.disk_usage(disk.mountpoint)._asdict()
                disk_usage[disk.device] = usage
            except PermissionError:
                disk_usage[disk.device] = {"error": "Device not ready or inaccessible"}
            except Exception as e:
                disk_usage[disk.device] = {"error": f"Erreur: {str(e)}"}

        resources = {
            "cpu_usage": psutil.cpu_percent(interval=1),
            "memory": psutil.virtual_memory()._asdict(),
            "disk": disk_usage,
            "network": psutil.net_io_counters()._asdict(),
        }
        yield "data: " + json.dumps(resources) + "\n\n"
        await asyncio.sleep(10)  # Mise à jour toutes les 10 secondes

@router.get("/sse/resources")
async def sse_resources_endpoint():
    """Endpoint SSE pour envoyer les ressources système en temps réel."""
    return StreamingResponse(sse_resources(), media_type="text/event-stream")


@router.get("/sse/recycle_bin_state")
async def recycle_bin_state_updates():
    def event_publisher():
        try:
            previous_state = None
            while True:
                rb_info = get_recycle_bin_state()
                current_state = {
                    "size": rb_info.i64Size,
                    "num_items": rb_info.i64NumItems
                }
                # Vérifie si l'état a changé
                if current_state != previous_state:
                    yield f"data: {json.dumps(current_state)}\n\n"
                    previous_state = current_state
                
                # Intervalle pour limiter la charge CPU
                time.sleep(2)
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
    
    return EventSourceResponse(event_publisher(), media_type="text/event-stream")






















@router.websocket("/ws/current_wallpaper_image")
async def websocket_current_wallpaper(websocket: WebSocket):
    """WebSocket pour envoyer l'image d'arrière-plan sous forme de bytes."""
    await websocket.accept()
    try:
        while True:
            wallpaper_path = get_current_wallpaper()  # Assurez-vous que cette fonction retourne le bon chemin
            if not wallpaper_path:
                await websocket.send_json({"error": "Aucun arrière-plan trouvé"})
            else:
                try:
                    with open(wallpaper_path, "rb") as image_file:
                        image_bytes = image_file.read()
                    await websocket.send_bytes(image_bytes)
                except Exception as e:
                    await websocket.send_json({"error": f"Erreur lors de l'ouverture de l'image: {str(e)}"})
            await asyncio.sleep(10)  # Mise à jour toutes les 10 secondes
    except WebSocketDisconnect:
        print("Client déconnecté")

@router.websocket("/ws/resources")
async def websocket_resources(websocket: WebSocket):
    """WebSocket pour envoyer les ressources système en temps réel."""
    await websocket.accept()
    try:
        while True:
            disk_usage = {}
            for disk in psutil.disk_partitions():
                try:
                    usage = psutil.disk_usage(disk.mountpoint)._asdict()
                    disk_usage[disk.device] = usage
                except PermissionError:
                    disk_usage[disk.device] = {"error": "Device not ready or inaccessible"}
                except Exception as e:
                    disk_usage[disk.device] = {"error": f"Erreur: {str(e)}"}

            resources = {
                "cpu_usage": psutil.cpu_percent(interval=1),
                "memory": psutil.virtual_memory()._asdict(),
                "disk": disk_usage,
                "network": psutil.net_io_counters()._asdict(),
            }

            await websocket.send_json(resources)
            await asyncio.sleep(10)  # Mise à jour toutes les 10 secondes
    except WebSocketDisconnect:
        print("Client déconnecté")



    






   
   
   
   
   
   
   
    
@router.post("/process/suspend/{pid}")
def suspend(pid: int):
    """Suspend un processus."""
    result = suspend_process(pid)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result

@router.post("/process/resume/{pid}")
def resume(pid: int):
    """Reprend un processus suspendu."""
    result = resume_process(pid)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result

@router.delete("/process/terminate/{pid}")
def terminate(pid: int):
    """Arrête un processus."""
    result = terminate_process(pid)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result

import os

@router.post("/system/reboot")
def reboot_system():
    """Redémarre la machine."""
    try:
        os.system("shutdown /r /t 0")
        return {"message": "Redémarrage en cours..."}
    except Exception as e:
        return {"error": str(e)}

    
@router.post("/system/shutdown")
def shutdown_system():
    """Éteint la machine."""
    try:
        os.system("shutdown /s /t 0")
        return {"message": "Extinction en cours..."}
    except Exception as e:
        return {"error": str(e)}

@router.get("/programs")
def list_running_programs():
    """Route pour lister les programmes en cours d'exécution."""
    return {"programs": get_running_programs()}


@router.post("/system/sleep")
def sleep():
    """Route pour mettre la machine en veille."""
    result = sleep_machine()
    if "error" in result:
        raise HTTPException(status_code=500, detail=result["error"])
    return result

@router.post("/system/hibernate")
def hibernate():
    """Route pour mettre la machine en veille prolongée."""
    result = hibernate_machine()
    if "error" in result:
        raise HTTPException(status_code=500, detail=result["error"])
    return result

@router.get("/system/hibernate/status")
def check_hibernate_status():
    """Vérifie si la veille prolongée est activée."""
    result = is_hibernate_enabled()
    if "error" in result:
        raise HTTPException(status_code=500, detail=result["error"])
    return result

@router.post("/system/hibernate/enable")
def enable_hibernate_route():
    """Active la veille prolongée."""
    result = enable_hibernate(True)
    if "error" in result:
        raise HTTPException(status_code=500, detail=result["error"])
    return result

@router.post("/system/hibernate/disable")
def disable_hibernate_route():
    """Désactive la veille prolongée."""
    result = enable_hibernate(False)
    if "error" in result:
        raise HTTPException(status_code=500, detail=result["error"])
    return result

@router.get("/system/disk-status")
def disk_status():
    """Retourne l'état des disques durs (espace libre et utilisé)."""
    disk_info = psutil.disk_partitions()
    disk_usage = {}
    for partition in disk_info:
        usage = psutil.disk_usage(partition.mountpoint)
        disk_usage[partition.device] = {
            "total": usage.total,
            "used": usage.used,
            "free": usage.free,
            "percent": usage.percent
        }
    return {"disk_usage": disk_usage}

@router.get("/system/cpu-temperature")
def cpu_temperature():
    """Retourne la température actuelle du CPU (si supportée par le système)."""
    try:
        # Si psutil supporte la récupération de la température
        temperatures = psutil.sensors_temperatures()
        if "coretemp" in temperatures:
            return {"cpu_temperature": temperatures["coretemp"]}
        else:
            return {"error": "Pas de capteur de température disponible."}
    except Exception as e:
        return {"error": str(e)}

@router.get("/system/alert/cpu")
def cpu_alert():
    """Retourne une alerte si l'utilisation du CPU dépasse 80%."""
    cpu_usage = psutil.cpu_percent(interval=1)
    if cpu_usage > 80:
        return {"alert": f"Utilisation du CPU élevée : {cpu_usage} %"}
    return {"status": "CPU usage normal", "cpu_usage": cpu_usage}

@router.get("/system/memory-status")
def memory_status():
    """Retourne l'utilisation de la mémoire physique et virtuelle."""
    memory = psutil.virtual_memory()
    swap = psutil.swap_memory()
    return {
        "memory": {
            "total": memory.total,
            "used": memory.used,
            "free": memory.free,
            "percent": memory.percent
        },
        "swap": {
            "total": swap.total,
            "used": swap.used,
            "free": swap.free,
            "percent": swap.percent
        }
    }

@router.post("/system/update")
def system_update():
    """Route pour effectuer une mise à jour système."""
    try:
        # Exemple pour une mise à jour de Windows, ou tu peux intégrer des commandes personnalisées
        os.system("powershell -Command \"Install-Module -Name PowerShellGet -Force -AllowClobber\"")
        return {"message": "Mise à jour système réussie."}
    except Exception as e:
        return {"error": str(e)}

@router.post("/system/wake")
def wake_computer(mac_address: str):
    """Réveille la machine via Wake-on-LAN."""
    try:
        send_magic_packet(mac_address)
        return {"message": "Paquet magique envoyé pour réveiller la machine."}
    except Exception as e:
        return {"error": str(e)}

@router.get("/system/network-speed")
def get_network_speed():
    """Retourne le débit Internet (en Mo/s) de la machine."""
    # Obtenez les statistiques du réseau
    net_io_before = psutil.net_io_counters()
    time.sleep(1)  # Attendre une seconde pour obtenir un échantillon après
    net_io_after = psutil.net_io_counters()

    # Calculer la différence dans les octets envoyés et reçus
    bytes_sent = net_io_after.bytes_sent - net_io_before.bytes_sent
    bytes_recv = net_io_after.bytes_recv - net_io_before.bytes_recv

    # Convertir les octets en Mo
    bytes_per_second_sent = bytes_sent / 1024 / 1024
    bytes_per_second_recv = bytes_recv / 1024 / 1024

    return {
        "sent_speed_mb_per_sec": round(bytes_per_second_sent, 2),
        "recv_speed_mb_per_sec": round(bytes_per_second_recv, 2),
    }


@router.get("/system/internet-speed")
def internet_speed():
    """Retourne la vitesse de connexion Internet."""
    try:
        st = speedtest.Speedtest()
        st.get_best_server()  # Trouve le meilleur serveur
        download_speed = st.download() / 1_000_000  # Convertir en Mb/s
        upload_speed = st.upload() / 1_000_000  # Convertir en Mb/s
        ping = st.results.ping  # Temps de ping en ms

        return {
            "download_speed_mbps": round(download_speed, 2),
            "upload_speed_mbps": round(upload_speed, 2),
            "ping_ms": ping
        }
    except Exception as e:
        return {"error": str(e)}

# 1. Lister les fichiers d'un répertoire
@router.get("/system/list-files")
def list_files(path: str):
    """Retourne la liste des fichiers dans un répertoire."""
    try:
        files = os.listdir(path)
        return {"files": files}
    except Exception as e:
        return {"error": str(e)}

# 2. Créer un répertoire
@router.post("/system/create-dir")
def create_dir(path: str):
    """Crée un répertoire à l'emplacement donné."""
    try:
        os.makedirs(path, exist_ok=True)
        return {"message": f"Répertoire créé à {path}"}
    except Exception as e:
        return {"error": str(e)}

# 3. Supprimer un fichier
@router.delete("/system/delete-file")
def delete_file(path: str):
    """Supprime un fichier à l'emplacement donné."""
    try:
        os.remove(path)
        return {"message": f"Fichier supprimé: {path}"}
    except Exception as e:
        return {"error": str(e)}

# 4. Exécuter une commande système
@router.get("/system/exec-cmd")
def exec_cmd(command: str):
    """Exécute une commande système et retourne la sortie."""
    try:
        result = os.popen(command).read()
        return {"result": result}
    except Exception as e:
        return {"error": str(e)}

# 5. Vérifier si un fichier ou répertoire existe
@router.get("/system/file-exists")
def file_exists(path: str):
    """Vérifie si un fichier ou répertoire existe à l'emplacement donné."""
    exists = os.path.exists(path)
    return {"exists": exists}

# 6. Récupérer l'environnement système
@router.get("/system/env-vars")
def env_vars():
    """Retourne les variables d'environnement du système."""
    env = os.environ
    return {"env": dict(env)}

# 7. Changer de répertoire de travail
@router.post("/system/change-dir")
def change_dir(path: str):
    """Change le répertoire de travail courant."""
    try:
        os.chdir(path)
        return {"message": f"Répertoire de travail changé vers {path}"}
    except Exception as e:
        return {"error": str(e)}

# 8. Vérifier les permissions d'un fichier
@router.get("/system/check-permissions")
def check_permissions(path: str):
    """Vérifie les permissions d'un fichier."""
    try:
        permissions = {
            "read": os.access(path, os.R_OK),
            "write": os.access(path, os.W_OK),
            "execute": os.access(path, os.X_OK),
        }
        return {"permissions": permissions}
    except Exception as e:
        return {"error": str(e)}

# 9. Renommer un fichier ou répertoire
@router.post("/system/rename")
def rename_file_or_dir(old_name: str, new_name: str):
    """Renomme un fichier ou répertoire."""
    try:
        os.rename(old_name, new_name)
        return {"message": f"{old_name} renommé en {new_name}"}
    except Exception as e:
        return {"error": str(e)}

# 10. Supprimer un répertoire
@router.delete("/system/delete-dir")
def delete_dir(path: str):
    """Supprime un répertoire à l'emplacement donné."""
    try:
        os.rmdir(path)
        return {"message": f"Répertoire supprimé: {path}"}
    except Exception as e:
        return {"error": str(e)}

# Route pour obtenir des informations sur les utilisateurs et les groupes
@router.get("/system/users-and-groups")
def get_users_and_groups():
    """Retourne les informations sur les utilisateurs et groupes système."""
    try:
        # Récupérer les utilisateurs connectés
        users = psutil.users()
        
        # Récupérer les groupes d'utilisateurs
        groups = []  # On peut ajouter des informations supplémentaires sur les groupes si nécessaire
        
        # Exemple d'utilisation de os pour obtenir les groupes (sur Windows, c'est limité)
        import os
        current_user = os.getlogin()
        
        return {"users": users, "groups": groups, "current_user": current_user}
    except Exception as e:
        return {"error": str(e)}
    

# Route pour récupérer les permissions d'un fichier
@router.get("/system/check-permissions")
def check_permissions(path: str):
    """Vérifie les permissions d'un fichier sous Windows."""
    try:
        if not os.path.exists(path):
            return {"error": f"Le fichier ou répertoire {path} n'existe pas"}
        
        # Utilisation de icacls pour vérifier les permissions (commande spécifique Windows)
        result = subprocess.run(["icacls", path], capture_output=True, text=True)
        if result.returncode == 0:
            return {"permissions": result.stdout}
        else:
            return {"error": "Erreur lors de la récupération des permissions"}
    except Exception as e:
        return {"error": str(e)}

# Route pour modifier les permissions d'un fichier
@router.post("/system/set-permissions")
def set_permissions(path: str, user: str, permission: str):
    """Modifie les permissions d'un fichier sous Windows."""
    try:
        if not os.path.exists(path):
            return {"error": f"Le fichier ou répertoire {path} n'existe pas"}

        # Utilisation de icacls pour modifier les permissions (exemple : donner la permission "full" à un utilisateur)
        command = ["icacls", path, "/grant", f"{user}:{permission}"]
        result = subprocess.run(command, capture_output=True, text=True)

        if result.returncode == 0:
            return {"message": f"Permissions {permission} accordées à {user} sur {path}"}
        else:
            return {"error": "Erreur lors de la modification des permissions"}
    except Exception as e:
        return {"error": str(e)}
    
    
# Route pour augmenter la priorité d'un processus et lui attribuer plus de ressources
@router.post("/system/set-super-process")
def set_super_process(pid: int):
    """Augmente la priorité d'un processus et lui attribue plus de ressources système."""
    try:
        # Vérifier si le processus existe
        process = psutil.Process(pid)
        
        # Donner une priorité maximale au processus (HIGH_PRIORITY_CLASS sous Windows)
        process.nice(psutil.HIGH_PRIORITY_CLASS)
        
        # Pour forcer l'utilisation du CPU à fond, on peut mettre un "loop" qui fait tourner le CPU
        # On peut également utiliser un "infinite loop" pour forcer le processus à monopoliser les ressources CPU.
        process.cpu_affinity([0])  # Optionnel: fixons l'affinité CPU (par exemple, sur un seul cœur)
        
        return {"message": f"Le processus {pid} est maintenant super prioritaire et consommera plus de ressources."}
    
    except psutil.NoSuchProcess:
        raise HTTPException(status_code=404, detail="Processus non trouvé")
    except psutil.AccessDenied:
        raise HTTPException(status_code=403, detail="Accès refusé, vous devez avoir des privilèges d'administrateur")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur : {str(e)}")
    
    
# Route pour récupérer les événements système Windows
@router.get("/system/event-logs")
def get_event_logs(log_type: str = "System", max_events: int = 10):
    """Retourne les derniers événements du journal Windows sous format JSON."""
    try:
        # Ouvrir le journal des événements Windows (par défaut, on lit le journal "System")
        server = "localhost"  # Nom de l'ordinateur, "localhost" pour la machine locale
        hand = win32evtlog.OpenEventLog(server, log_type)
        
        # Récupérer les derniers événements
        events = []
        total_records = win32evtlog.GetNumberOfEventLogRecords(hand)

        # Limiter le nombre d'événements à retourner
        count = min(total_records, max_events)

        # Lire les événements à partir du journal
        for i in range(count):
            event = win32evtlog.ReadEventLog(hand, win32evtlog.EVENTLOG_BACKWARDS_READ | win32evtlog.EVENTLOG_SEQUENTIAL_READ, 0)
            for e in event:
                event_info = {
                    "time": e.TimeGenerated.Format(),
                    "event_id": e.EventID,
                    "type": e.EventType,
                    "category": e.EventCategory,
                    "source": e.SourceName,
                    "user": e.ComputerName,
                    "message": e.StringInserts if e.StringInserts else "No message"
                }
                events.append(event_info)
        
        return {"events": events}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur : {str(e)}")
    
@router.get("/session/status")
def get_user_session_status(username: str):
    """Retourne le statut de la session utilisateur : connecté ou déconnecté."""
    try:
        for user in psutil.users():
            if user.name == username:
                return {"username": username, "status": "connected", "terminal": user.term}
        return {"username": username, "status": "disconnected"}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur : {str(e)}")
    
    
@router.post("/session/block")
def block_user(username: str):
    """Bloque un utilisateur en le déconnectant."""
    try:
        # Utiliser 'logoff' pour déconnecter l'utilisateur
        subprocess.run(f"shutdown /l /f /t 0", shell=True, check=True)  # Déconnexion immédiate
        return {"message": f"L'utilisateur {username} a été déconnecté."}
    
    except subprocess.CalledProcessError as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la déconnexion de l'utilisateur : {str(e)}")
    
    
@router.post("/session/switch")
def switch_session(session_id: int):
    """Change la session utilisateur."""
    try:
        # Utilisation de la commande 'tscon' pour changer de session
        subprocess.run(f"tscon {session_id} /dest:console", shell=True, check=True)
        return {"message": f"Session {session_id} activée."}
    
    except subprocess.CalledProcessError as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors du changement de session : {str(e)}")
    
@router.post("/session/lock")
def lock_computer():
    """Verrouille l'ordinateur."""
    try:
        ctypes.windll.user32.LockWorkStation()  # Utilisation de l'API Windows pour verrouiller l'ordinateur
        return {"message": "L'ordinateur a été verrouillé."}
    
    except Exception as e:
        return {"error": f"Erreur : {str(e)}"}
    

@router.get("/sessions/active")
def list_active_sessions():
    """Retourne la liste des sessions utilisateurs actives."""
    try:
        active_sessions = []
        for user in psutil.users():
            session_info = {
                "username": user.name,
                "terminal": user.term,
                "host": user.host,
                "started": user.started
            }
            active_sessions.append(session_info)
        return {"sessions": active_sessions}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur : {str(e)}")


@router.post("/session/logoff")
def logoff_user(session_id: int):
    """Déconnecte un utilisateur spécifique par ID de session."""
    try:
        # Utilisation de la commande 'logoff' pour déconnecter l'utilisateur par ID
        subprocess.run(f"logoff {session_id}", shell=True, check=True)
        return {"message": f"L'utilisateur de la session {session_id} a été déconnecté."}
    
    except subprocess.CalledProcessError as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la déconnexion : {str(e)}")

@router.post("/system/empty_recycle_bin")
def empty_recycle_bin():
    """Vide la corbeille du système."""
    try:
        subprocess.run('rd /s /q C:\\$Recycle.Bin', shell=True, check=True)
        return {"message": "La corbeille a été vidée avec succès."}
    except subprocess.CalledProcessError as e:
        raise HTTPException(status_code=500, detail=f"Erreur : {str(e)}")
    
@router.get("/system/installed_apps")
def get_installed_apps():
    """Retourne la liste des applications installées sur le système."""
    try:
        installed_apps = subprocess.check_output("wmic product get name", shell=True)
        return {"installed_apps": installed_apps.decode().splitlines()}
    except subprocess.CalledProcessError as e:
        return {"error": f"Erreur : {str(e)}"}
    
@router.post("/system/change_wallpaper")
def change_wallpaper(image_path: str):
    """Change l'arrière-plan du bureau avec l'image spécifiée."""
    try:
        set_wallpaper(image_path)
        return {"message": f"L'arrière-plan a été changé avec l'image : {image_path}"}
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur : {str(e)}")
    
# Route pour changer l'arrière-plan avec une image aléatoire
@router.post("/system/change_random_wallpaper")
def change_random_wallpaper(directory: str):
    """Change l'arrière-plan avec une image aléatoire du répertoire donné."""
    try:
        image_path = str(choose_random_image(directory))
        set_wallpaper(image_path)
        return {"message": f"L'arrière-plan a été changé avec l'image aléatoire : {image_path}"}
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur : {str(e)}")
    
# Route pour changer l'arrière-plan avec une image téléchargée depuis une URL
@router.post("/system/change_wallpaper_from_url")
def change_wallpaper_from_url(url: str, save_directory: str = "C:/Temp/"):
    """Change l'arrière-plan avec une image téléchargée depuis une URL."""
    try:
        # Créer un nom de fichier unique pour l'image téléchargée
        image_name = url.split("/")[-1]
        save_path = os.path.join(save_directory, image_name)
        
        # Télécharge l'image et la sauvegarde
        download_image(url, save_path)
        
        # Change l'arrière-plan avec l'image téléchargée
        set_wallpaper(save_path)
        
        return {"message": f"L'arrière-plan a été changé avec l'image téléchargée depuis l'URL : {url}"}
    
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur : {str(e)}")

@router.get("/system/serve_file/")
def serve_file(file_path: str):
    """Retourne un fichier à partir du système pour le visualiser ou le télécharger."""
    file_path = Path(file_path)

    if not file_path.is_file():
        raise HTTPException(status_code=404, detail="Fichier non trouvé")

    return FileResponse(file_path)


@router.post("/system/stream_file/")
async def stream_file(request: Request):
    """Retourne un fichier à partir du système pour le visualiser ou le télécharger."""
    data = await request.json()
    file_path = data.get('file_path')
    file_path = Path(file_path)
    print(file_path)
    if not file_path.is_file():
        raise HTTPException(status_code=404, detail="Fichier non trouvé")

    # Déterminer le type de contenu (MIME type) du fichier
    content_type = get_mime_type(file_path)
    if content_type is None:
        content_type = "application/octet-stream"

    try:
        return StreamingResponse(file_path.open(mode="rb"), media_type=content_type)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de l'ouverture du fichier: {e}")

    
    
# Route pour diffuser le contenu de l'écran en continu
@router.get("/system/live_screen")
def live_screen():
    """Retourne un flux vidéo de l'écran en temps réel"""
    return StreamingResponse(generate_screen_stream(), media_type="image/jpeg")
