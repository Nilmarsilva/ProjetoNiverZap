import { supabase } from '@/lib/store/supabase'

export interface Template {
  id: string
  user_id: string
  name: string
  content: string
  is_active: boolean
  created_at: string
}

/**
 * Serviço para gerenciar templates de mensagens no Supabase
 */
export const templateService = {
  /**
   * Busca todos os templates do usuário
   */
  async getUserTemplates(userId: string): Promise<Template[]> {
    const { data, error } = await supabase
      .from('templates')
      .select('*')
      .eq('user_id', userId)
      .order('name', { ascending: true })

    if (error) {
      console.error('Erro ao buscar templates:', error)
      throw error
    }

    return data || []
  },

  /**
   * Conta o total de templates ativos do usuário
   */
  async countActiveTemplates(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from('templates')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_active', true)

    if (error) {
      console.error('Erro ao contar templates ativos:', error)
      throw error
    }

    return count || 0
  },

  /**
   * Busca um template específico pelo ID
   */
  async getTemplateById(id: string): Promise<Template | null> {
    const { data, error } = await supabase
      .from('templates')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error(`Erro ao buscar template ${id}:`, error)
      throw error
    }

    return data
  },

  /**
   * Cria um novo template
   */
  async createTemplate(template: Omit<Template, 'id' | 'created_at'>): Promise<Template> {
    const { data, error } = await supabase
      .from('templates')
      .insert([template])
      .select()
      .single()

    if (error) {
      console.error('Erro ao criar template:', error)
      throw error
    }

    return data
  },

  /**
   * Atualiza um template existente
   */
  async updateTemplate(id: string, template: Partial<Omit<Template, 'id' | 'created_at'>>): Promise<Template> {
    const { data, error } = await supabase
      .from('templates')
      .update(template)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error(`Erro ao atualizar template ${id}:`, error)
      throw error
    }

    return data
  },

  /**
   * Exclui um template
   */
  async deleteTemplate(id: string): Promise<void> {
    const { error } = await supabase
      .from('templates')
      .delete()
      .eq('id', id)

    if (error) {
      console.error(`Erro ao excluir template ${id}:`, error)
      throw error
    }
  }
}
