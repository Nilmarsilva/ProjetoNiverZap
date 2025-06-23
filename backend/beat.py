import os
import sys

# Adicionar o diretório raiz ao PYTHONPATH
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.core.celery_app import celery_app

if __name__ == "__main__":
    celery_app.start(["beat", "--loglevel=info"])
