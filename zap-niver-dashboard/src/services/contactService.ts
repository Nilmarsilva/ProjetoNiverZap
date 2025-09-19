import apiService from './apiService';

export interface Contact {
  id: string
  user_id: string
  name: string
  phone: string
  birthday: string
  notes?: string
  created_at: string
  email?: string
  address?: string
  group?: string
  custom_fields?: Record<string, any>
  birth_date?: string // Mantido para compatibilidade com código existente
}

/**
 * Serviço para gerenciar contatos através da API
 */
export const contactService = {
  /**
   * Busca todos os contatos do usuário
   */
  async getUserContacts(): Promise<Contact[]> {
    try {
      const response = await apiService.get('/contacts')
      // A API retorna um objeto ContactList com { contacts: [...], total: number }
      return response.data.contacts || []
    } catch (error) {
      console.error('Erro ao buscar contatos:', error)
      return []
    }
  },

  /**
   * Conta o total de contatos do usuário
   */
  async countUserContacts(): Promise<number> {
    try {
      const response = await apiService.get('/contacts/count')
      return response.data.count || 0
    } catch (error) {
      console.error('Erro ao contar contatos:', error)
      return 0
    }
  },

  /**
   * Busca os aniversariantes do dia
   */
  async getTodayBirthdays(): Promise<Contact[]> {
    try {
      const response = await apiService.get('/contacts/birthdays/today')
      return response.data.contacts || []
    } catch (error) {
      console.error('Erro ao buscar aniversariantes:', error)
      return []
    }
  },

  /**
   * Busca todos os eventos comemorativos do dia (aniversários e outras datas)
   */
  async getTodayEvents(userId: string): Promise<any[]> {
    try {
      // Tenta buscar do banco de dados primeiro
      const birthdays = await this.getTodayBirthdays();
      
      // Transformamos os aniversariantes em eventos
      const birthdayEvents = birthdays.map(contact => ({
        id: `birthday-${contact.id}`,
        contactId: contact.id,
        contactName: contact.name,
        contactPhone: contact.phone,
        eventType: 'aniversario',
        eventDate: contact.birth_date,
        eventName: 'Aniversário',
        name: contact.name,
        birth_date: contact.birth_date
      }));
      
      // Retorna dados reais se existirem
      if (birthdayEvents.length > 0) {
        return birthdayEvents;
      }
      
      // Se não houver dados reais, usa dados mockados
      console.log('Usando dados mockados para eventos de hoje');
      
      // Dados mockados para desenvolvimento
      return [
        {
          id: 'birthday-mock-1',
          contactId: 'mock-1',
          contactName: 'Ana Silva',
          contactPhone: '(11) 98765-4321',
          eventType: 'aniversario',
          eventDate: new Date().toISOString(),
          eventName: 'Aniversário',
          name: 'Ana Silva',
          birth_date: new Date().toISOString()
        },
        {
          id: 'mothers-day-mock-1',
          contactId: 'mock-2',
          contactName: 'Maria Oliveira',
          contactPhone: '(11) 97654-3210',
          eventType: 'dia-das-maes',
          eventDate: new Date().toISOString(),
          eventName: 'Dia das Mães',
          name: 'Maria Oliveira',
          birth_date: new Date().toISOString()
        }
      ];
    } catch (error) {
      console.error('Erro ao buscar eventos do dia:', error);
      
      // Em caso de erro, retorna dados mockados
      return [
        {
          id: 'birthday-mock-1',
          contactId: 'mock-1',
          contactName: 'Ana Silva',
          contactPhone: '(11) 98765-4321',
          eventType: 'aniversario',
          eventDate: new Date().toISOString(),
          eventName: 'Aniversário',
          name: 'Ana Silva',
          birth_date: new Date().toISOString()
        }
      ];
    }
  },

  /**
   * Busca os próximos aniversariantes (próximos X dias)
   */
  async getUpcomingBirthdays(days: number = 30): Promise<Contact[]> {
    try {
      const response = await apiService.get(`/contacts/birthdays/upcoming?days=${days}`)
      return response.data.contacts || []
    } catch (error) {
      console.error('Erro ao buscar próximos aniversariantes:', error)
      return []
    }
  },

  /**
   * Busca os próximos eventos comemorativos (próximos X dias)
   */
  async getUpcomingEvents(userId: string, days: number = 30): Promise<any[]> {
    try {
      // Tenta buscar do banco de dados primeiro
      const birthdays = await this.getUpcomingBirthdays(days);
      
      // Transformamos os aniversariantes em eventos
      const birthdayEvents = birthdays.map(contact => ({
        id: `birthday-${contact.id}`,
        contactId: contact.id,
        contactName: contact.name,
        contactPhone: contact.phone,
        eventType: 'aniversario',
        eventDate: contact.birth_date,
        eventName: 'Aniversário',
        birth_date: contact.birth_date,
        name: contact.name
      }));
      
      // Retorna dados reais se existirem
      if (birthdayEvents.length > 0) {
        return birthdayEvents;
      }
      
      // Se não houver dados reais, usa dados mockados
      console.log('Usando dados mockados para próximos eventos');
      
      // Criar datas para os próximos dias
      const today = new Date();
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);
      
      const twoWeeksLater = new Date(today);
      twoWeeksLater.setDate(today.getDate() + 14);
      
      const threeWeeksLater = new Date(today);
      threeWeeksLater.setDate(today.getDate() + 21);
      
      // Dados mockados para desenvolvimento
      return [
        {
          id: 'birthday-mock-1',
          contactId: 'mock-1',
          contactName: 'Ana Silva',
          contactPhone: '(11) 98765-4321',
          eventType: 'aniversario',
          eventDate: nextWeek.toISOString(),
          eventName: 'Aniversário',
          birth_date: nextWeek.toISOString(),
          name: 'Ana Silva'
        },
        {
          id: 'birthday-mock-2',
          contactId: 'mock-2',
          contactName: 'João Santos',
          contactPhone: '(11) 97654-3210',
          eventType: 'aniversario',
          eventDate: twoWeeksLater.toISOString(),
          eventName: 'Aniversário',
          birth_date: twoWeeksLater.toISOString(),
          name: 'João Santos'
        },
        {
          id: 'mothers-day-mock-1',
          contactId: 'mock-3',
          contactName: 'Maria Oliveira',
          contactPhone: '(11) 96543-2109',
          eventType: 'dia-das-maes',
          eventDate: threeWeeksLater.toISOString(),
          eventName: 'Dia das Mães',
          birth_date: threeWeeksLater.toISOString(),
          name: 'Maria Oliveira'
        },
        {
          id: 'fathers-day-mock-1',
          contactId: 'mock-4',
          contactName: 'Carlos Pereira',
          contactPhone: '(11) 95432-1098',
          eventType: 'dia-dos-pais',
          eventDate: threeWeeksLater.toISOString(),
          eventName: 'Dia dos Pais',
          birth_date: threeWeeksLater.toISOString(),
          name: 'Carlos Pereira'
        }
      ];
    } catch (error) {
      console.error('Erro ao buscar próximos eventos:', error);
      
      // Em caso de erro, retorna dados mockados
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      
      return [
        {
          id: 'birthday-mock-1',
          contactId: 'mock-1',
          contactName: 'Ana Silva',
          contactPhone: '(11) 98765-4321',
          eventType: 'aniversario',
          eventDate: nextWeek.toISOString(),
          eventName: 'Aniversário',
          birth_date: nextWeek.toISOString(),
          name: 'Ana Silva'
        }
      ];
    }
  },

  /**
   * Busca um contato específico pelo ID
   */
  async getContactById(id: string): Promise<Contact | null> {
    try {
      const response = await apiService.get(`/contacts/${id}`)
      // A API retorna diretamente o objeto contact, não dentro de um objeto { contact: ... }
      return response.data || null
    } catch (error) {
      console.error('Erro ao buscar contato:', error)
      return null
    }
  },

  /**
   * Cria um novo contato
   */
  async createContact(contact: Omit<Contact, 'id' | 'created_at'>): Promise<Contact> {
    try {
      console.log('Enviando dados para criar contato:', JSON.stringify(contact, null, 2));
      const response = await apiService.post('/contacts', contact)
      console.log('Resposta ao criar contato:', response.data);
      // A API retorna diretamente o objeto contact, não dentro de um objeto { contact: ... }
      return response.data
    } catch (error) {
      console.error('Erro ao criar contato:', error)
      throw new Error('Falha ao criar contato')
    }
  },

  /**
   * Atualiza um contato existente
   */
  async updateContact(id: string, contact: Partial<Omit<Contact, 'id' | 'created_at'>>): Promise<Contact> {
    try {
      const response = await apiService.put(`/contacts/${id}`, contact)
      // A API retorna diretamente o objeto contact, não dentro de um objeto { contact: ... }
      return response.data
    } catch (error) {
      console.error('Erro ao atualizar contato:', error)
      throw new Error('Falha ao atualizar contato')
    }
  },

  /**
   * Exclui um contato
   */
  async deleteContact(id: string): Promise<void> {
    try {
      await apiService.delete(`/contacts/${id}`)
    } catch (error) {
      console.error('Erro ao excluir contato:', error)
      throw new Error('Falha ao excluir contato')
    }
  }
}
