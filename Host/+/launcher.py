import subprocess
import re
import requests
import socket
import ctypes
import sys
import os
import time
import threading
from queue import Queue

# Variable pour éviter les popups en boucle
popup_shown = False

# Fonction pour gérer les logs et afficher des popups
def log(message, level="INFO", popup=False):
    global popup_shown

    levels = {
        "INFO": "\033[92m[INFO]\033[0m",      # Vert
        "WARNING": "\033[93m[WARNING]\033[0m",  # Jaune
        "ERROR": "\033[91m[ERROR]\033[0m"     # Rouge
    }

    # Format structuré pour le log
    formatted_message = f"{levels.get(level, '[INFO]')} {time.strftime('%Y-%m-%d %H:%M:%S')} - {message}"
    print(formatted_message)

    # Affichage du popup une seule fois (ex. pour l'initialisation ou erreur)
    if popup and not popup_shown:
        if level in ["ERROR", "WARNING"]:  # Conditionner l'affichage aux erreurs et avertissements
            ctypes.windll.user32.MessageBoxW(0, message, level, 1)
        popup_shown = True


def is_port_open(port, host="127.0.0.1"):
    """Vérifie si un port est ouvert."""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex((host, port)) == 0


def run_subprocess(command, error_message):
    """Exécute une commande subprocess avec gestion des erreurs."""
    try:
        process = subprocess.Popen(
            command,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        return process
    except FileNotFoundError:
        log(f"{error_message} - Fichier introuvable.", "ERROR", True)
        raise
    except Exception as e:
        log(f"Erreur critique lors du lancement de subprocess : {e}", "ERROR", True)
        raise


def start_fastapi_server():
    """Démarre le serveur FastAPI."""
    python_executable = sys.executable
    # Assurez-vous que le chemin d'app.py est correct après empaquetage
    server_file = os.path.join(sys._MEIPASS, "app.py") if getattr(sys, 'frozen', False) else os.path.join(os.getcwd(), "app.py")

    if not os.path.isfile(server_file):
        error = f"Fichier app.py introuvable : {server_file}"
        log(error, "ERROR", True)
        raise FileNotFoundError(error)

    process = run_subprocess([python_executable, server_file], "Impossible de démarrer le serveur FastAPI.")

    log("Démarrage du serveur FastAPI...", "INFO")
    for _ in range(10):  # Essayer pendant 10 secondes
        if is_port_open(5000):
            log("Serveur FastAPI opérationnel.", "INFO", True)
            return process

        time.sleep(1)

    log("Échec : Le serveur FastAPI ne s'est pas lancé.", "ERROR", True)
    print(process.stdout.read())
    print(process.stderr.read())
    process.terminate()
    raise RuntimeError("Le serveur FastAPI n'a pas démarré.")


def start_cloudflare_tunnel():
    """Démarre un tunnel Cloudflare et capture l'URL."""
    # Assurez-vous que le chemin vers host.exe est correct après empaquetage
    cloudflare_executable = os.path.join(
        sys._MEIPASS, "host.exe") if getattr(sys, 'frozen', False) else os.path.join(os.getcwd(), "host.exe")

    if not os.path.isfile(cloudflare_executable):
        error = f"Cloudflare Tunnel (host.exe) introuvable à : {cloudflare_executable}"
        log(error, "ERROR", True)
        raise FileNotFoundError(error)

    process = run_subprocess(
        [cloudflare_executable, "tunnel",  "--url", "http://localhost:5000"," --cors"],
        "Impossible de lancer le tunnel Cloudflare."
    )

    log("Démarrage du tunnel Cloudflare...", "INFO")
    for line in process.stdout:
        match = re.search(r"https://[^\s]+", line)
        if match:
            url = match.group(0)
            log(f"URL capturée : {url}", "INFO", True)
            return process, url

    log("Échec : Aucun URL capturé depuis Cloudflare.", "ERROR", True)
    process.terminate()
    raise RuntimeError("Tunnel Cloudflare non fonctionnel.")


def send_post_request(ip, url):
    """Envoie une requête POST avec les informations IP et URL."""
    post_url = 'https://test.ora-app.genesis-company.net/index.php'
    data = {'ip': ip, 'link': url}
    headers = {"User-Agent": "Python FastAPI Client"}

    try:
        response = requests.post(post_url, json=data, headers=headers)
        if response.status_code == 200:
            response_data = response.json()
            message = response_data.get('message', 'Aucun message')
            code = response_data.get('code', 'Aucun code')
            log("Données envoyées avec succès.", "INFO", True)
            log(f"Message : {message} - Code : {code}", "INFO", True)
        else:
            error_message = f"Erreur dans la requête POST : {response.text}"
            log(error_message, "ERROR", True)
    except requests.RequestException as e:
        log(f"Erreur lors de l'envoi de la requête POST : {e}", "ERROR", True)


def read_process_output(process, queue):
    """Lit la sortie d'un processus et la place dans une queue."""
    for line in process.stdout:
        queue.put(line.strip())


def main():
    """Point d'entrée principal."""
    log("Démarrage des services...", "INFO")
    try:
        fastapi_process = start_fastapi_server()

        try:
            cloudflare_process, url = start_cloudflare_tunnel()
        except Exception as e:
            fastapi_process.terminate()
            log(f"Erreur lors du démarrage du tunnel Cloudflare : {e}", "ERROR", True)
            return

        ip = socket.gethostbyname(socket.gethostname())
        send_post_request(ip, url)

        log("Tous les services sont opérationnels.", "INFO", True)
        log("Appuyez sur CTRL+C pour arrêter.", "INFO")

        # Créer des queues pour collecter les sorties
        fastapi_queue = Queue()
        cloudflare_queue = Queue()

        # Lancer des threads pour lire les sorties des processus
        fastapi_thread = threading.Thread(target=read_process_output, args=(fastapi_process, fastapi_queue))
        cloudflare_thread = threading.Thread(target=read_process_output, args=(cloudflare_process, cloudflare_queue))

        fastapi_thread.start()
        cloudflare_thread.start()

        # Alterner l'affichage des lignes des deux processus
        while True:
            if not fastapi_queue.empty():
                log(fastapi_queue.get(), "INFO")
            if not cloudflare_queue.empty():
                log(cloudflare_queue.get(), "INFO")

            time.sleep(0.5)  # Pause pour gérer l'alternance

    except KeyboardInterrupt:
        log("\nArrêt des services...", "INFO", True)
    except Exception as e:
        log(f"Erreur critique : {e}", "ERROR", True)
    finally:
        if 'fastapi_process' in locals() and fastapi_process:
            fastapi_process.terminate()
        if 'cloudflare_process' in locals() and cloudflare_process:
            cloudflare_process.terminate()
        log("Services arrêtés.", "INFO", True)


if __name__ == "__main__":
    main()
