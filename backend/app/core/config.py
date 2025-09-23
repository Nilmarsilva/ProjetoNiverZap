from typing import List, Union
from pydantic import AnyHttpUrl, validator
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    PROJECT_NAME: str = "NiverZap API"
    
    # CORS
    BACKEND_CORS_ORIGINS: List[Union[str, AnyHttpUrl]] = []

    @validator("BACKEND_CORS_ORIGINS", pre=True)
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)
    
    # Supabase
    SUPABASE_URL: str
    SUPABASE_KEY: str
    SUPABASE_SERVICE_KEY: str
    
    # Banco de Dados PostgreSQL
    POSTGRES_HOST: str = "postgres"
    POSTGRES_PORT: int = 5432
    POSTGRES_DB: str = "niverzap"
    POSTGRES_USER: str = "niverzap"
    POSTGRES_PASSWORD: str = "change_me"
    POSTGRES_SSL: str = "disable"
    
    # Redis
    REDIS_HOST: str = "redis"
    REDIS_PORT: int = 6379
    REDIS_DB: int = 0
    
    # Celery
    CELERY_BROKER_URL: str = "redis://redis:6379/0"
    CELERY_RESULT_BACKEND: str = "redis://redis:6379/0"
    
    # WhatsApp Integrations
    ZAPI_INSTANCE: str = ""
    ZAPI_TOKEN: str = ""
    
    WHATSAPP_OFFICIAL_PHONE_ID: str = ""
    WHATSAPP_OFFICIAL_TOKEN: str = ""
    WHATSAPP_OFFICIAL_VERSION: str = "v18.0"
    
    EVOLUTION_API_URL: str = ""
    EVOLUTION_API_KEY: str = ""
    
    # Payment integrations (optional)
    ASAAS_API_KEY: str = ""
    MONETIZZE_API_KEY: str = ""
    
    # Email settings
    EMAIL_SMTP_SERVER: str = "smtp.hostinger.com"
    EMAIL_SMTP_PORT: int = 465
    EMAIL_SENDER: str = "senhas@authbrasil.com.br"
    EMAIL_PASSWORD: str = "q6DR1DI?"
    EMAIL_USE_SSL: bool = True
    
    # Frontend URL para links de recuperação de senha
    FRONTEND_URL: str = "http://localhost:3000"
    
    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
