from celery import Celery
from app.core.config import settings

celery_app = Celery(
    "worker",
    broker=f"redis://{settings.REDIS_HOST}:{settings.REDIS_PORT}/{settings.REDIS_DB}",
    backend=f"redis://{settings.REDIS_HOST}:{settings.REDIS_PORT}/{settings.REDIS_DB}"
)

celery_app.conf.task_routes = {
    "app.tasks.*": {"queue": "main-queue"}
}

celery_app.conf.beat_schedule = {
    "check-birthdays-every-day": {
        "task": "app.tasks.birthday_tasks.check_birthdays",
        "schedule": 86400.0,  # 24 horas (em segundos)
    },
    "process-pending-messages": {
        "task": "app.tasks.message_tasks.process_pending_messages",
        "schedule": 60.0,  # a cada minuto
    }
}
