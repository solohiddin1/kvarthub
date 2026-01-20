import os
from celery import Celery
from celery.schedules import crontab
from apps.shared.utils import get_logger

logger = get_logger()
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'kvarthub.settings')

app = Celery('kvarthub')

# Using a string here means the worker doesn't have to serialize
# the configuration object to child processes.
# - namespace='CELERY' means all celery-related configuration keys
#   should have a `CELERY_` prefix.
app.config_from_object('django.conf:settings', namespace='CELERY')

app.autodiscover_tasks()

# Configure Celery Beat schedule
app.conf.beat_schedule = {
    'charge-daily-listings': {
        'task': 'apps.payment.tasks.charge_daily_listings_task',
        'schedule': crontab(hour=0, minute=1),
    },
}

app.conf.timezone = 'UTC'


@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}')
    logger.info(f'Debug Task Executed: {self.request!r}')
