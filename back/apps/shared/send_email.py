import sib_api_v3_sdk
import concurrent.futures
from sib_api_v3_sdk.rest import ApiException
from config.config import settings
from apps.shared.utils import get_logger

logger = get_logger()

def send_email_from_server_from_brevo(to_email, content):
    configuration = sib_api_v3_sdk.Configuration()
    configuration.api_key['api-key'] = settings.BREVO_EMAIL_API_KEY
    
    api_instance = sib_api_v3_sdk.TransactionalEmailsApi(
        sib_api_v3_sdk.ApiClient(configuration)
    )

    email = sib_api_v3_sdk.SendSmtpEmail(
        to=[{"email": to_email}],
        sender={"email": settings.BREVO_EMAIL_API_EMAIL, "name": "Kvarthub"},
        subject="Otp",
        html_content=content,
    )

    try:
        response = api_instance.send_transac_email(email)
        # Normalize SDK response into JSON-serializable data for API responses
        if hasattr(response, "to_dict"):
            return response.to_dict()
        if hasattr(response, "message_id"):
            return {"message_id": response.message_id}
        return {"detail": str(response)}
    except ApiException as e:
        print("Error sending email:", e)
        return None


def send_otp_with_fallback(email, otp, timeout=8):
    """
    Send OTP with fallback from Brevo to SMTP.
    
    Tries Brevo first, falls back to Django SMTP if Brevo fails.
    Uses concurrent.futures with timeout for reliability.
    
    Args:
        email: Recipient email address
        otp: OTP code to send
        timeout: Maximum seconds to wait for email send (default 8s)
    
    Returns:
        Serializable response dict on success, None on failure
    """
    from apps.users.repository import send_otp_email
    
    def try_send():
        try:
            # Primary provider: Brevo
            result = send_email_from_server_from_brevo(email, otp)
            if result:
                logger.info(f"OTP sent via Brevo to {email}")
                return result
        except Exception as e:
            logger.info(f"Brevo provider failed: {e}")
        
        try:
            # Fallback: SMTP
            result = send_otp_email(email, otp)
            logger.info(f"OTP sent via SMTP to {email}")
            return result
        except Exception as e2:
            logger.info(f"Both providers failed: {e2}")
            raise Exception("Unable to send OTP")

    with concurrent.futures.ThreadPoolExecutor() as executor:
        future = executor.submit(try_send)
        try:
            return future.result(timeout=timeout)
        except concurrent.futures.TimeoutError:
            logger.error(f"OTP sending timed out after {timeout}s")
            raise Exception("OTP sending timed out")
