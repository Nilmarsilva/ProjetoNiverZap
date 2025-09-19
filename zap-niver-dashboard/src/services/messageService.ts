import { supabase } from '@/lib/store/apiClient'

export interface Message {
  id: string
  user_id: string
  contact_id: string
  template_id: string
  content: string
  status: 'pending' | 'sent' | 'failed'
  scheduled_at: string
  sent_at?: string
  created_at: string
}

/**
 * Serviço para gerenciar mensagens
 */
export const messageService = {
  /**
   * Busca todas as mensagens do usuário
   */
  async getUserMessages(userId: string): Promise<Message[]> {
    try {
      // Usar o método order corretamente com o novo apiClient
      const result = supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false })
      
      const { data, error } = await result.execute()

      if (error) {
        console.error('Erro ao buscar mensagens:', error)
        throw error
      }

      return data || []
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error)
      return []
    }
  },

  /**
   * Conta o total de mensagens enviadas pelo usuário no mês atual
   */
  async countMonthlyMessages(userId: string): Promise<number> {
    try {
      const now = new Date()
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
      const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString()

      // Usar o novo apiClient para contar mensagens
      const result = supabase
        .from('messages')
        .select('*')
      
      const { data, error } = await result.execute()

      if (error) {
        console.error('Erro ao contar mensagens do mês:', error)
        throw error
      }

      // Filtrar os resultados manualmente
      const filteredData = data?.filter(msg => 
        msg.user_id === userId && 
        msg.status === 'sent' && 
        msg.sent_at >= firstDayOfMonth && 
        msg.sent_at <= lastDayOfMonth
      ) || []

      return filteredData.length
    } catch (error) {
      console.error('Erro ao contar mensagens do mês:', error)
      return 0
    }
  },

  /**
   * Busca as mensagens recentes do usuário
   */
  async getRecentMessages(userId: string, limit: number = 5): Promise<Message[]> {
    try {
      // Usar o método order corretamente com o novo apiClient
      const result = supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false })
      
      const { data, error } = await result.execute()

      if (error) {
        console.error('Erro ao buscar mensagens recentes:', error)
        throw error
      }

      // Filtrar e limitar os resultados manualmente
      const filteredData = data?.filter(msg => msg.user_id === userId).slice(0, limit) || []

      return filteredData
    } catch (error) {
      console.error('Erro ao buscar mensagens recentes:', error)
      return []
    }
  },

  /**
   * Busca uma mensagem específica pelo ID
   */
  async getMessageById(id: string): Promise<Message | null> {
    try {
      // Usar o método select corretamente com o novo apiClient
      const result = supabase
        .from('messages')
        .select('*')
      
      const { data, error } = await result.execute()

      if (error) {
        console.error(`Erro ao buscar mensagem ${id}:`, error)
        throw error
      }

      // Encontrar a mensagem pelo ID manualmente
      const message = data?.find(msg => msg.id === id) || null

      return message
    } catch (error) {
      console.error(`Erro ao buscar mensagem ${id}:`, error)
      return null
    }
  },

  /**
   * Cria uma nova mensagem
   */
  async createMessage(message: Omit<Message, 'id' | 'created_at'>): Promise<Message> {
    try {
      // Usar o método insert corretamente com o novo apiClient
      const { data, error } = await supabase
        .from('messages')
        .insert(message)

      if (error) {
        console.error('Erro ao criar mensagem:', error)
        throw error
      }

      return data
    } catch (error) {
      console.error('Erro ao criar mensagem:', error)
      throw error
    }
  },

  /**
   * Atualiza o status de uma mensagem
   */
  async updateMessageStatus(id: string, status: Message['status'], sentAt?: string): Promise<Message> {
    try {
      const updateData: any = { status }
      if (sentAt) updateData.sent_at = sentAt

      // Usar o método update corretamente com o novo apiClient
      const { data, error } = await supabase
        .from('messages')
        .update(updateData)
        .eq('id', id)

      if (error) {
        console.error(`Erro ao atualizar status da mensagem ${id}:`, error)
        throw error
      }

      return data
    } catch (error) {
      console.error(`Erro ao atualizar status da mensagem ${id}:`, error)
      throw error
    }
  },

  /**
   * Exclui uma mensagem
   */
  async deleteMessage(id: string): Promise<void> {
    try {
      // Usar o método delete corretamente com o novo apiClient
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', id)

      if (error) {
        console.error(`Erro ao excluir mensagem ${id}:`, error)
        throw error
      }
    } catch (error) {
      console.error(`Erro ao excluir mensagem ${id}:`, error)
      throw error
    }
  }
}
