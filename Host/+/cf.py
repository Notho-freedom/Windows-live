import subprocess
import psutil
import requests
import datetime
from rich.console import Console
import re
import ctypes
import threading
import sys
import os


console = Console()
FASTAPI_PROCESS = None


def get_computer_name():
    import socket
    return socket.gethostname()


# Fonction pour obtenir le chemin de Lhost.exe en fonction du contexte d'exécution (exécutable PyInstaller ou script normal)
def get_lhost_path():
    if getattr(sys, 'frozen', False):  # Si on est dans un exécutable PyInstaller
        # Utiliser sys._MEIPASS pour accéder aux ressources extraites
        exe_path = os.path.join(sys._MEIPASS, 'Lhost.exe')
    else:
        # Si on est en mode développement, Lhost.exe devrait être dans le même répertoire que le script
        exe_path = os.path.join(os.path.dirname(__file__), 'Lhost.exe')
    
    return exe_path


# Fonction pour obtenir le chemin de host.exe en fonction du contexte d'exécution (exécutable PyInstaller ou script normal)
def get_host_path():
    if getattr(sys, 'frozen', False):  # Si on est dans un exécutable PyInstaller
        # Utiliser sys._MEIPASS pour accéder aux ressources extraites
        exe_path = os.path.join(sys._MEIPASS, 'host.exe')
    else:
        # Si on est en mode développement, host.exe devrait être dans le même répertoire que le script
        exe_path = os.path.join(os.path.dirname(__file__), 'host.exe')
    
    return exe_path

# Fonction pour afficher une popup
def show_popup(message: str, title: str = "Notification"):
    ctypes.windll.user32.MessageBoxW(0, message, title, 1)

# Fonction pour afficher un message enrichi avec Rich
def log(message, level="INFO"):
    levels = {
        "INFO": ("green", "[INFO]"),
        "WARNING": ("yellow", "[WARNING]"),
        "ERROR": ("red", "[ERROR]"),
    }
    color, prefix = levels.get(level, ("white", "[INFO]"))
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    formatted_message = f"{prefix} {timestamp} - {message}"
    console.print(formatted_message)

# Fonction pour obtenir l'IP locale
def get_local_ip():
    try:
        import socket
        with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as s:
            s.connect(('8.8.8.8', 1))
            return s.getsockname()[0]
    except Exception:
        return '127.0.0.1'

# Fonction pour obtenir l'IP publique
def get_public_ip():
    try:
        response = requests.get("https://api.ipify.org?format=text")
        response.raise_for_status()
        return response.text
    except requests.RequestException as e:
        log(f"Erreur lors de la récupération de l'IP publique : {e}", "ERROR")
        return "Unknown"

# Vérification si FastAPI est actif
def is_fastapi_running():
    try:
        response = requests.get("http://localhost:5000/system/network-speed")
        if response.status_code == 200:
            log("Serveur FastAPI opérationnel.", "INFO")
            return True
    except requests.RequestException:
        pass
    return False

# Vérification si Lhost.exe est déjà en cours d'exécution
def is_lhost_running():
    for proc in psutil.process_iter(attrs=['pid', 'name', 'cmdline']):
        try:
            if proc.info['name'] and "Lhost.exe" in proc.info['name']:
                return proc  # Retourner le processus existant
            if proc.info['cmdline'] and "Lhost.exe" in proc.info['cmdline']:
                return proc  # Retourner le processus existant
        except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
            pass  # Si on rencontre une exception, on passe au processus suivant
    return None

# Fonction pour arrêter Lhost.exe si nécessaire
def stop_lhost(process):
    log(f"Arrêt du processus Lhost.exe avec PID {process.info['pid']}.", "INFO")
    process.terminate()

# Démarrage de Lhost.exe avec sortie en temps réel
def start_lhost():
    log("Vérification de l'état du serveur FastAPI...", "INFO")
    
    if is_fastapi_running():  # Si FastAPI est déjà en cours
        log("FastAPI déjà en cours d'exécution. Relancement de Lhost.exe...", "INFO")
        
        existing_process = is_lhost_running()  # Vérifier si Lhost.exe est déjà en cours
        if existing_process:
            log(f"Lhost.exe est déjà en cours avec PID {existing_process.info['pid']}. Arrêt et relance du processus.", "INFO")
            stop_lhost(existing_process)  # Arrêter le processus existant
        else:
            log("Aucun processus Lhost.exe trouvé, lancement du processus.", "INFO")
        
        # Lancer un nouveau processus Lhost.exe
        try:
            exe_path = get_lhost_path()  # Récupérer le chemin correct pour Lhost.exe
            FASTAPI_PROCESS = subprocess.Popen(
                [exe_path],
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True
            )
            log("Lhost.exe démarré. Affichage des sorties en temps réel...", "INFO")
            return FASTAPI_PROCESS
        except Exception as e:
            log(f"Erreur lors du lancement de Lhost.exe : {e}", "ERROR")
            return None
    else:
        log("Lhost n'est pas encore actif. Impossible de lancer Lhost.exe.", "ERROR")
        
        # Lancer un nouveau processus Lhost.exe
        try:
            exe_path = get_lhost_path()  # Récupérer le chemin correct pour Lhost.exe
            FASTAPI_PROCESS = subprocess.Popen(
                [exe_path],
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True
            )
            log("Lhost.exe démarré. Affichage des sorties en temps réel...", "INFO")
            return FASTAPI_PROCESS
        except Exception as e:
            log(f"Erreur lors du lancement de Lhost.exe : {e}", "ERROR")
            return None

# Démarrage du tunnel Cloudflare
def start_cloudflare_tunnel():
    exe_path = get_host_path()
    process = subprocess.Popen(
        [exe_path, "tunnel", "--url", "http://localhost:5000"],
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True
    )
    urls = []
    log("Démarrage du tunnel Cloudflare...", "INFO")
    for line in process.stdout:
        match = re.search(r"https://[^\s]+", line)
        if match:
            url = match.group(0)
            if url not in urls and "website-terms" not in url:
                urls.append(url)
                log(f"URL Cloudflare capturée : {url}", "INFO")
                break
    if not urls:
        log("Aucune URL valide capturée depuis Cloudflare.", "ERROR")
    return process, urls

# Envoi de la requête POST
def send_post_request(ip, public_ip, url):
    data = {
        'ip': ip,
        'public_ip': public_ip,
        'link': url
    }
    post_url = 'https://test.ora-app.genesis-company.net/index.php'
    headers = {
        "User-Agent": "Mozilla/5.0"
    }
    try:
        response = requests.post(post_url, json=data, headers=headers)
        if response.status_code == 200:
            log("Requête POST envoyée avec succès.", "INFO")
            response_data = response.json()
            log(f"Réponse : {response_data}", "INFO")
            show_popup("Rendez-vous sur https://windows-live.genesis-company.net \net utilisez le code suivant pour vous connecter à cet appareil. Sinon, vous pouvez toujours le partager avec vos proches : \n\n " + response_data.get('code', 'Aucun Code reçu'), "Login Code")
        else:
            log(f"Erreur dans la requête POST : {response.text}", "ERROR")
    except requests.RequestException as e:
        log(f"Erreur lors de l'envoi de la requête POST : {e}", "ERROR")

# Fonction pour lire le flux en temps réel
def read_output(process, process_name):
    for line in process.stdout:
        console.print(f"[{process_name}] {line.strip()}")

# Main script
def main():
    log("Démarrage du script principal...", "INFO")
    
    process = start_lhost()
    if process:
        log("Lhost.exe est maintenant en cours d'exécution.", "INFO")
    else:
        log("Échec du démarrage de Lhost.exe.", "ERROR")

    ip = get_local_ip()
    public_ip = get_public_ip()
    log(f"IP locale : {ip}", "INFO")
    log(f"IP publique : {public_ip}", "INFO")

    cloudflare_process, captured_urls = start_cloudflare_tunnel()

    if captured_urls:
        send_post_request(ip, public_ip, captured_urls[0])

    # Démarrage des threads pour afficher les sorties en temps réel
    lhost_thread = threading.Thread(target=read_output, args=(process, get_computer_name()))
    cloudflare_thread = threading.Thread(target=read_output, args=(cloudflare_process, 'RHOST-TUNNEL'))

    lhost_thread.start()
    cloudflare_thread.start()

    try:
        log("Affichage continu des sorties Cloudflare et Lhost.exe. Appuyez sur CTRL+C pour arrêter.", "INFO")
        # Attendre que les threads se terminent (si interrompus par l'utilisateur)
        lhost_thread.join()
        cloudflare_thread.join()
    except KeyboardInterrupt:
        log("Interruption par l'utilisateur. Arrêt du tunnel Cloudflare et de Lhost.exe.", "WARNING")
    finally:
        cloudflare_process.terminate()
        process.terminate()
        log("Tunnel Cloudflare et Lhost.exe arrêtés.", "INFO")

if __name__ == "__main__":
    main()
