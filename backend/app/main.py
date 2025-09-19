from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.v1.api import api_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    description="API para envio automático de mensagens de aniversário via WhatsApp",
    version="1.0.0"
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000", "http://127.0.0.1:3001"],  # Especificar origens permitidas
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=[
        "Accept",
        "Accept-Language", 
        "Content-Language",
        "Content-Type",
        "Authorization",
        "X-Requested-With",
        "Access-Control-Allow-Origin",
        "Access-Control-Allow-Methods",
        "Access-Control-Allow-Headers"
    ],
    expose_headers=["Content-Length"],
    max_age=600  # Cache de 10 minutos para preflight requests
)

# Incluir rotas da API
app.include_router(api_router, prefix="/api")

@app.get("/")
async def root():
    return {
        "message": "Bem-vindo à API do NiverZap",
        "docs": f"/docs",
        "version": "1.0.0"
    }
