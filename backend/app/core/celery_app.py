"""
Celery application configuration.
Sets up the Celery instance with Redis as broker and backend.
"""

from celery import Celery

from app.core.config import settings

# Create Celery instance
celery_app = Celery(
    "codepilot",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
)

# Celery configuration
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=300,  # 5 minutes max per task
    task_soft_time_limit=240,  # Soft limit at 4 minutes
    worker_prefetch_multiplier=1,  # Fair task distribution
    worker_max_tasks_per_child=100,  # Prevent memory leaks
)

# Auto-discover tasks from the tasks module
celery_app.autodiscover_tasks(["app.tasks"])
