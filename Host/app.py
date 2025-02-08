# -*- coding: utf-8 -*-
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
from routes import setup_routes
import sys

class CommandServer:
    def __init__(self):
        app = FastAPI()
        app.add_middleware(
            CORSMiddleware,
            allow_origins=["*"],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )
        self.app = app

        logging.basicConfig(level=logging.INFO)

        setup_routes(self.app)

    def run(self):
        import uvicorn
        uvicorn.run(self.app, host="0.0.0.0", port=5000)

if __name__ == '__main__':
    server = CommandServer()
    server.run()
