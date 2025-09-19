import { supabase } from '@/lib/store/apiClient'

export interface Template {
  id: string
  user_id: string
  name: string
  content: string
  is_active: boolean
  created_at: string
}

/**
 * Serviço para gerenciar templates de mensagens
 */
export const templateService = {
  /**
   * Busca todos os templates do usuário
   */
  async getUserTemplates(userId: string): Promise<Template[]> {
    try {
      // Usar o método order corretamente com o novo apiClient
      const result = supabase
        .from('templates')
        .select('*')
        .order('name', { ascending: true })
      
      const { data, error } = await result.execute()

      if (error) {
        console.error('Erro ao buscar templates:', error)
        throw error
      }

      // Filtrar os resultados manualmente
      const filteredData = data?.filter(template => template.user_id === userId) || []

      return filteredData
    } catch (error) {
      console.error('Erro ao buscar templates:', error)
      return []
    }
  },

  /**
   * Conta o total de templates ativos do usuário
   */
  async countActiveTemplates(userId: string): Promise<number> {
    try {
      // Usar o novo apiClient para contar templates
      const result = supabase
        .from('templates')
        .select('*')
      
      const { data, error } = await result.execute()

      if (error) {
        console.error('Erro ao contar templates ativos:', error)
        throw error
      }

      // Filtrar os resultados manualmente
      const filteredData = data?.filter(template => 
        template.user_id === userId && 
        template.is_active === true
      ) || []

      return filteredData.length
    } catch (error) {
      console.error('Erro ao contar templates ativos:', error)
      return 0
    }
  },

  /**
   * Busca um template específico pelo ID
   */
  async getTemplateById(id: string): Promise<Template | null> {
    try {
      // Usar o método select corretamente com o novo apiClient
      const result = supabase
        .from('templates')
        .select('*')
      
      const { data, error } = await result.execute()

      if (error) {
        console.error(`Erro ao buscar template ${id}:`, error)
        throw error
      }

      // Encontrar o template pelo ID manualmente
      const template = data?.find(tpl => tpl.id === id) || null

      return template
    } catch (error) {
      console.error(`Erro ao buscar template ${id}:`, error)
      return null
    }
  },

  /**
   * Cria um novo template
   */
  async createTemplate(template: Omit<Template, 'id' | 'created_at'>): Promise<Template> {
    try {
      // Usar o método insert corretamente com o novo apiClient
      const { data, error } = await supabase
        .from('templates')
        .insert(template)

      if (error) {
        console.error('Erro ao criar template:', error)
        throw error
      }

      return data
    } catch (error) {
      console.error('Erro ao criar template:', error)
      throw error
    }
  },

  /**
   * Atualiza um template existente
   */
  async updateTemplate(id: string, template: Partial<Omit<Template, 'id' | 'created_at'>>): Promise<Template> {
    try {
      // Usar o método update corretamente com o novo apiClient
      const { data, error } = await supabase
        .from('templates')
        .update(template)
        .eq('id', id)

      if (error) {
        console.error(`Erro ao atualizar template ${id}:`, error)
        throw error
      }

      return data
    } catch (error) {
      console.error(`Erro ao atualizar template ${id}:`, error)
      throw error
    }
  },

  /**
   * Exclui um template
   */
  async deleteTemplate(id: string): Promise<void> {
    try {
      // Usar o método delete corretamente com o novo apiClient
      const { error } = await supabase
        .from('templates')
        .delete()
        .eq('id', id)

      if (error) {
        console.error(`Erro ao excluir template ${id}:`, error)
        throw error
      }
    } catch (error) {
      console.error(`Erro ao excluir template ${id}:`, error)
      throw error
    }
  }
}
