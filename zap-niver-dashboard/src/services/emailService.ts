import apiService from './apiService';

/**
 * Serviço para gerenciar operações relacionadas a emails
 */
export const emailService = {
  /**
   * Envia um email de recuperação de senha
   * @param email Email do usuário que solicitou a recuperação
   */
  async sendPasswordRecoveryEmail(email: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await apiService.post('/auth/recover-password', { email });
      return { 
        success: true,
        message: 'Email de recuperação enviado com sucesso'
      };
    } catch (error: any) {
      console.error('Erro ao enviar email de recuperação:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Não foi possível enviar o email de recuperação'
      };
    }
  },

  /**
   * Verifica se um token de recuperação de senha é válido
   * @param token Token de recuperação
   */
  async verifyRecoveryToken(token: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await apiService.get(`/auth/verify-recovery-token/${token}`);
      return { 
        success: true,
        message: 'Token válido'
      };
    } catch (error: any) {
      console.error('Erro ao verificar token de recuperação:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Token inválido ou expirado'
      };
    }
  },

  /**
   * Redefine a senha do usuário usando um token de recuperação
   * @param token Token de recuperação
   * @param newPassword Nova senha
   */
  async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await apiService.post('/auth/reset-password', { 
        token,
        newPassword
      });
      return { 
        success: true,
        message: 'Senha redefinida com sucesso'
      };
    } catch (error: any) {
      console.error('Erro ao redefinir senha:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Não foi possível redefinir a senha'
      };
    }
  }
};
