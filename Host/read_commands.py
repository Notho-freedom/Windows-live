# -*- coding: utf-8 -*-
from models import Session, Command

# Lecture des commandes
session = Session()
commands = session.query(Command).all()
for command in commands:
    print(command.command_text)
