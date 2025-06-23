import os
import sys
import subprocess
import time
import signal
import logging
from multiprocessing import Process

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("run_dev")

# Processos
processes = []

def run_api():
    """Executa a API FastAPI"""
    logger.info("Iniciando API FastAPI...")
    subprocess.run([sys.executable, "start.py"], check=True)

def run_worker():
    """Executa o worker do Celery"""
    logger.info("Iniciando worker do Celery...")
    subprocess.run([sys.executable, "worker.py"], check=True)

def run_beat():
    """Executa o beat do Celery"""
    logger.info("Iniciando beat do Celery...")
    subprocess.run([sys.executable, "beat.py"], check=True)

def signal_handler(sig, frame):
    """Manipulador de sinais para encerrar os processos"""
    logger.info("Encerrando todos os processos...")
    for process in processes:
        if process.is_alive():
            process.terminate()
    sys.exit(0)

def main():
    """Função principal"""
    # Registrar manipulador de sinais
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    # Testar conexões
    logger.info("Testando conexões...")
    result = subprocess.run([sys.executable, "test_connection.py"], check=False)
    
    if result.returncode != 0:
        logger.error("Falha ao testar conexões. Verifique as configurações e tente novamente.")
        sys.exit(1)
    
    # Iniciar processos
    api_process = Process(target=run_api)
    worker_process = Process(target=run_worker)
    beat_process = Process(target=run_beat)
    
    processes.extend([api_process, worker_process, beat_process])
    
    # Iniciar processos
    api_process.start()
    logger.info("API FastAPI iniciada (PID: %d)", api_process.pid)
    
    time.sleep(2)  # Aguardar a API iniciar
    
    worker_process.start()
    logger.info("Worker do Celery iniciado (PID: %d)", worker_process.pid)
    
    beat_process.start()
    logger.info("Beat do Celery iniciado (PID: %d)", beat_process.pid)
    
    logger.info("Ambiente de desenvolvimento iniciado com sucesso!")
    logger.info("API disponível em: http://localhost:8000")
    logger.info("Documentação da API: http://localhost:8000/docs")
    logger.info("Pressione Ctrl+C para encerrar todos os processos")
    
    # Aguardar processos
    try:
        api_process.join()
        worker_process.join()
        beat_process.join()
    except KeyboardInterrupt:
        logger.info("Interrupção detectada. Encerrando processos...")
        for process in processes:
            if process.is_alive():
                process.terminate()

if __name__ == "__main__":
    main()
