from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DEBUG: bool = True

    # Database
    ENGINE: str
    NAME : str
    USER : str
    PASSWORD : str
    HOST : str
    PORT : str
    # Security
    # ACCESS_TOKEN_EXPIRE_MINUTES: int = 60*24  # 1 day
    SECRET_KEY: str

    # CORS
    ALLOWED_HOSTS: list[str] = ["*"]

    # Optional external services
    EMAIL_HOST: str = "smtp.example.com"
    EMAIL_PORT: int = 587
    EMAIL_USER: str
    EMAIL_PASSWORD: str

    class Config:
        env_file = ".env"

# Create a single instance to import anywhere
settings = Settings()
