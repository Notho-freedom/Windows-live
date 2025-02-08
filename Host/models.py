# -*- coding: utf-8 -*-
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Configuration de la base de donn�es SQLite
engine = create_engine('sqlite:///commands.db')
Base = declarative_base()

# D�finition du mod�le de commande
class Command(Base):
    __tablename__ = 'commands'
    id = Column(Integer, primary_key=True)
    command_text = Column(String)

# Cr�ation de la table
Base.metadata.create_all(engine)

# Cr�ation d'une session
Session = sessionmaker(bind=engine)
session = Session()
