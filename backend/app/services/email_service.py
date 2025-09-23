import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

class EmailService:
    def __init__(self):
        self.smtp_server = settings.EMAIL_SMTP_SERVER
        self.port = settings.EMAIL_SMTP_PORT
        self.sender_email = settings.EMAIL_SENDER
        self.password = settings.EMAIL_PASSWORD
        
    def send_password_recovery_email(self, recipient_email: str, recovery_token: str) -> bool:
        """
        Envia um email de recuperação de senha para o usuário
        
        Args:
            recipient_email: Email do destinatário
            recovery_token: Token de recuperação de senha
            
        Returns:
            bool: True se o email foi enviado com sucesso, False caso contrário
        """
        try:
            # Criar a mensagem
            message = MIMEMultipart("alternative")
            message["Subject"] = "Recuperação de Senha - NiverZap"
            message["From"] = self.sender_email
            message["To"] = recipient_email
            
            # Criar o link de recuperação
            recovery_link = f"{settings.FRONTEND_URL}/reset-password/{recovery_token}"
            
            # Texto simples
            text = f"""
            Recuperação de Senha - NiverZap
            
            Você solicitou a recuperação de senha para sua conta no NiverZap.
            
            Para redefinir sua senha, clique no link abaixo ou copie e cole no seu navegador:
            
            {recovery_link}
            
            Este link expirará em 24 horas.
            
            Se você não solicitou esta recuperação, ignore este email.
            
            Atenciosamente,
            Equipe NiverZap
            """
            
            # Versão HTML
            html = f"""
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <h2 style="color: #10B981;">Recuperação de Senha</h2>
                    </div>
                    
                    <p>Olá,</p>
                    
                    <p>Você solicitou a recuperação de senha para sua conta no NiverZap.</p>
                    
                    <p>Para redefinir sua senha, clique no botão abaixo:</p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="{recovery_link}" style="background-color: #10B981; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">
                            Redefinir Senha
                        </a>
                    </div>
                    
                    <p>Ou copie e cole o link abaixo no seu navegador:</p>
                    
                    <p style="background-color: #f5f5f5; padding: 10px; border-radius: 4px; word-break: break-all;">
                        {recovery_link}
                    </p>
                    
                    <p><strong>Este link expirará em 24 horas.</strong></p>
                    
                    <p>Se você não solicitou esta recuperação, ignore este email.</p>
                    
                    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; font-size: 12px; color: #666;">
                        <p>Atenciosamente,<br>Equipe NiverZap</p>
                    </div>
                </div>
            </body>
            </html>
            """
            
            # Anexar partes à mensagem
            part1 = MIMEText(text, "plain")
            part2 = MIMEText(html, "html")
            message.attach(part1)
            message.attach(part2)
            
            # Criar conexão segura e enviar email
            context = ssl.create_default_context()
            with smtplib.SMTP_SSL(self.smtp_server, self.port, context=context) as server:
                server.login(self.sender_email, self.password)
                server.sendmail(self.sender_email, recipient_email, message.as_string())
                
            logger.info(f"Email de recuperação enviado para {recipient_email}")
            return True
            
        except Exception as e:
            logger.error(f"Erro ao enviar email de recuperação: {str(e)}")
            return False

email_service = EmailService()
