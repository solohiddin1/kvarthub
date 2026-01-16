from celery import shared_task
from django.core.management import call_command
from apps.shared.utils import get_logger

logger = get_logger()


@shared_task
def charge_daily_listings_task():
    """
    Celery task to charge daily fees for all active listings.
    This task runs automatically via Celery Beat scheduler.
    """
    logger.info("Starting daily listing charge task")
    
    try:
        # Call the management command
        call_command('charge_daily_listings')
        logger.info("Daily listing charge task completed successfully")
    except Exception as e:
        logger.error(f"Error in daily listing charge task: {str(e)}")
        raise
