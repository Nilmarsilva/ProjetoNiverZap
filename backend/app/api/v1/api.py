from fastapi import APIRouter

from app.api.v1.endpoints import users, auth, contacts, templates, messages, plans

api_router = APIRouter()

# Rotas de autenticação
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])

# Rotas de usuários
api_router.include_router(users.router, prefix="/users", tags=["users"])

# Rotas de contatos
api_router.include_router(contacts.router, prefix="/contacts", tags=["contacts"])

# Rotas de templates
api_router.include_router(templates.router, prefix="/templates", tags=["templates"])

# Rotas de mensagens
api_router.include_router(messages.router, prefix="/messages", tags=["messages"])

# Rotas de planos
api_router.include_router(plans.router, prefix="/plans", tags=["plans"])
