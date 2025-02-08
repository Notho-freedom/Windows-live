# -*- coding: utf-8 -*-
from models import Session, Command

# Liste de nouvelles commandes à ajouter
new_commands = [
    "ls -ltrh",
    "cd /opt",
    "mkdir -p /var/www/html",
    "rm -rf /tmp/*",
    "git fetch --all",
    "git merge origin/master",
    "python3 -m pip install --upgrade pip",
    "source /etc/environment",
    "pip install flask",
    "pip install django",
    "pip install fastapi",
    "docker pull ubuntu:latest",
    "docker images",
    "docker rmi image_id",
    "docker-compose restart",
    "kubectl get configmaps",
    "kubectl get secrets",
    "kubectl rollout restart deployment/deployment_name",
    "systemctl list-units --type=service",
    "systemctl daemon-reload",
    "journalctl -f",
    "crontab -e -u user",
    "chmod 777 /path/to/file",
    "chown user:group /path/to/file",
    "df -hT",
    "du -sh /var/log/*",
    "ps -eo pid,comm,%mem,%cpu --sort=-%mem",
    "kill -SIGKILL pid",
    "top -b -n 1",
    "htop -u user",
    "ifconfig wlan0",
    "ping -t 5 google.com",
    "netstat -s",
    "ssh-copy-id user@hostname",
    "scp -r /local/path user@hostname:/remote/path",
    "wget -c http://example.com/file.zip",
    "curl -I http://example.com",
    "tar -czvf archive.tar.gz folder/",
    "zip -r -9 archive.zip folder/",
    "unzip -o archive.zip",
    "find / -type d -name 'folder_name'",
    "grep -v 'pattern' file.txt",
    "sed '1d' file.txt",
    "awk '{print $3, $2, $1}' file.txt",
    "sort -n file.txt",
    "uniq -u file.txt",
    "head -n -10 file.txt",
    "tail -n 20 file.txt",
    "diff -c file1.txt file2.txt",
    "man bash",
    "alias la='ls -A'",
    "unalias la",
    "export PATH=/usr/local/bin:$PATH",
    "source ~/.bash_profile",
    "history -d 100",
    "clear && echo 'Terminal cleared!'",
    "exit 1"
]

session = Session()

# Récupérer les commandes existantes
existing_commands = session.query(Command.command_text).all()
existing_commands = [command[0] for command in existing_commands]

# Ajouter uniquement les nouvelles commandes qui ne sont pas déjà présentes
for command_text in new_commands:
    if command_text not in existing_commands:
        new_command = Command(command_text=command_text)
        session.add(new_command)

session.commit()
