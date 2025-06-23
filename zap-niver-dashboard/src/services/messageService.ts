import { supabase } from '@/lib/store/supabase'

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
 * Serviço para gerenciar mensagens no Supabase
 */
export const messageService = {
  /**
   * Busca todas as mensagens do usuário
   */
  async getUserMessages(userId: string): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao buscar mensagens:', error)
      throw error
    }

    return data || []
  },

  /**
   * Conta o total de mensagens enviadas pelo usuário no mês atual
   */
  async countMonthlyMessages(userId: string): Promise<number> {
    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString()

    const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'sent')
      .gte('sent_at', firstDayOfMonth)
      .lte('sent_at', lastDayOfMonth)

    if (error) {
      console.error('Erro ao contar mensagens do mês:', error)
      throw error
    }

    return count || 0
  },

  /**
   * Busca as mensagens recentes do usuário
   */
  async getRecentMessages(userId: string, limit: number = 5): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*, contacts(name)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Erro ao buscar mensagens recentes:', error)
      throw error
    }

    return data || []
  },

  /**
   * Busca uma mensagem específica pelo ID
   */
  async getMessageById(id: string): Promise<Message | null> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error(`Erro ao buscar mensagem ${id}:`, error)
      throw error
    }

    return data
  },

  /**
   * Cria uma nova mensagem
   */
  async createMessage(message: Omit<Message, 'id' | 'created_at'>): Promise<Message> {
    const { data, error } = await supabase
      .from('messages')
      .insert([message])
      .select()
      .single()

    if (error) {
      console.error('Erro ao criar mensagem:', error)
      throw error
    }

    return data
  },

  /**
   * Atualiza o status de uma mensagem
   */
  async updateMessageStatus(id: string, status: Message['status'], sentAt?: string): Promise<Message> {
    const updateData: any = { status }
    if (sentAt) updateData.sent_at = sentAt

    const { data, error } = await supabase
      .from('messages')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error(`Erro ao atualizar status da mensagem ${id}:`, error)
      throw error
    }

    return data
  },

  /**
   * Exclui uma mensagem
   */
  async deleteMessage(id: string): Promise<void> {
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', id)

    if (error) {
      console.error(`Erro ao excluir mensagem ${id}:`, error)
      throw error
    }
  }
}
