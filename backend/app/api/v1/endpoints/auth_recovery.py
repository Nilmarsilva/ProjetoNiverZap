from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Any

from app.core.config import settings
from app.db.database import get_db_connection
from app.schemas.auth import PasswordRecoveryRequest, PasswordResetRequest
from app.services.email_service import email_service
from app.services.user_service import UserService
from app.utils.security import get_password_hash
import uuid
from datetime import datetime, timedelta
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/recover-password", status_code=status.HTTP_200_OK)
async def recover_password(request: PasswordRecoveryRequest) -> Any:
    """
    Inicia o processo de recuperação de senha enviando um email com um link para redefinição
    """
    db = get_db_connection()
    
    try:
        # Verificar se o usuário existe
        user = await UserService.get_user_by_email(request.email)
        if not user:
            # Não revelar se o email existe ou não por questões de segurança
            return {"message": "Se o email estiver cadastrado, você receberá um link de recuperação."}
        
        # Gerar token único para recuperação
        recovery_token = str(uuid.uuid4())
        
        # Salvar token no banco com expiração de 24 horas
        expiration = datetime.utcnow() + timedelta(hours=24)
        
        # Verificar se já existe um token para este usuário e atualizar
        query = """
        SELECT * FROM password_recoveries WHERE user_id = $1
        """
        existing_recovery = await db.execute(query, [user.id])
        
        if existing_recovery.get('data'):
            # Atualizar token existente
            update_query = """
            UPDATE password_recoveries 
            SET token = $1, expires_at = $2 
            WHERE user_id = $3
            RETURNING *
            """
            await db.execute(update_query, [recovery_token, expiration, user.id])
        else:
            # Criar novo token
            insert_query = """
            INSERT INTO password_recoveries (id, user_id, token, expires_at)
            VALUES ($1, $2, $3, $4)
            RETURNING *
            """
            await db.execute(insert_query, [str(uuid.uuid4()), user.id, recovery_token, expiration])
        
        # Enviar email com o token
        email_sent = email_service.send_password_recovery_email(user.email, recovery_token)
        
        if not email_sent:
            logger.error(f"Falha ao enviar email de recuperação para {user.email}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Não foi possível enviar o email de recuperação"
            )
        
        return {"message": "Email de recuperação enviado com sucesso"}
    
    except Exception as e:
        logger.error(f"Erro ao processar recuperação de senha: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao processar a solicitação de recuperação de senha"
        )

@router.get("/verify-recovery-token/{token}", status_code=status.HTTP_200_OK)
async def verify_recovery_token(token: str) -> Any:
    """
    Verifica se um token de recuperação é válido
    """
    db = get_db_connection()
    
    try:
        query = """
        SELECT * FROM password_recoveries 
        WHERE token = $1 AND expires_at > $2
        """
        result = await db.execute(query, [token, datetime.utcnow()])
        
        if not result.get('data'):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Token inválido ou expirado"
            )
        
        return {"valid": True}
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao verificar token de recuperação: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao verificar token de recuperação"
        )

@router.post("/reset-password", status_code=status.HTTP_200_OK)
async def reset_password(request: PasswordResetRequest) -> Any:
    """
    Redefine a senha do usuário usando um token de recuperação
    """
    db = get_db_connection()
    
    try:
        # Verificar se o token é válido
        query = """
        SELECT * FROM password_recoveries 
        WHERE token = $1 AND expires_at > $2
        """
        result = await db.execute(query, [request.token, datetime.utcnow()])
        
        if not result.get('data'):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Token inválido ou expirado"
            )
        
        recovery = result.get('data')[0]
        user_id = recovery.get('user_id')
        
        # Obter o usuário
        user = await UserService.get_user_by_id(user_id)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuário não encontrado"
            )
        
        # Atualizar a senha
        hashed_password = get_password_hash(request.new_password)
        
        update_query = """
        UPDATE users SET hashed_password = $1 WHERE id = $2
        RETURNING *
        """
        await db.execute(update_query, [hashed_password, user_id])
        
        # Remover o token de recuperação
        delete_query = """
        DELETE FROM password_recoveries WHERE token = $1
        """
        await db.execute(delete_query, [request.token])
        
        return {"message": "Senha redefinida com sucesso"}
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao redefinir senha: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao redefinir a senha"
        )
