from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, PasswordRecovery
from app.schemas.auth import PasswordRecoveryRequest, PasswordResetRequest
from app.services.email_service import email_service
from app.utils.security import create_token, get_password_hash, verify_token
from datetime import datetime, timedelta
import uuid
import logging

router = APIRouter(
    prefix="/auth",
    tags=["auth"]
)

logger = logging.getLogger(__name__)

@router.post("/recover-password", status_code=status.HTTP_200_OK)
async def recover_password(request: PasswordRecoveryRequest, db: Session = Depends(get_db)):
    """
    Inicia o processo de recuperação de senha enviando um email com um link para redefinição
    """
    # Verificar se o usuário existe
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        # Não revelar se o email existe ou não por questões de segurança
        return {"message": "Se o email estiver cadastrado, você receberá um link de recuperação."}
    
    # Gerar token único para recuperação
    recovery_token = str(uuid.uuid4())
    
    # Salvar token no banco com expiração de 24 horas
    expiration = datetime.utcnow() + timedelta(hours=24)
    
    # Verificar se já existe um token para este usuário e atualizar
    existing_recovery = db.query(PasswordRecovery).filter(PasswordRecovery.user_id == user.id).first()
    
    if existing_recovery:
        existing_recovery.token = recovery_token
        existing_recovery.expires_at = expiration
    else:
        new_recovery = PasswordRecovery(
            user_id=user.id,
            token=recovery_token,
            expires_at=expiration
        )
        db.add(new_recovery)
    
    try:
        db.commit()
        
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
        db.rollback()
        logger.error(f"Erro ao processar recuperação de senha: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao processar a solicitação de recuperação de senha"
        )

@router.get("/verify-recovery-token/{token}", status_code=status.HTTP_200_OK)
async def verify_recovery_token(token: str, db: Session = Depends(get_db)):
    """
    Verifica se um token de recuperação é válido
    """
    recovery = db.query(PasswordRecovery).filter(PasswordRecovery.token == token).first()
    
    if not recovery or recovery.expires_at < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token inválido ou expirado"
        )
    
    return {"valid": True}

@router.post("/reset-password", status_code=status.HTTP_200_OK)
async def reset_password(request: PasswordResetRequest, db: Session = Depends(get_db)):
    """
    Redefine a senha do usuário usando um token de recuperação
    """
    recovery = db.query(PasswordRecovery).filter(PasswordRecovery.token == request.token).first()
    
    if not recovery or recovery.expires_at < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token inválido ou expirado"
        )
    
    # Obter o usuário
    user = db.query(User).filter(User.id == recovery.user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado"
        )
    
    # Atualizar a senha
    hashed_password = get_password_hash(request.new_password)
    user.hashed_password = hashed_password
    
    # Remover o token de recuperação
    db.delete(recovery)
    
    try:
        db.commit()
        return {"message": "Senha redefinida com sucesso"}
    except Exception as e:
        db.rollback()
        logger.error(f"Erro ao redefinir senha: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao redefinir a senha"
        )
