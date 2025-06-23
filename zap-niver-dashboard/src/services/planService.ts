import axios from 'axios';
// Removida a importação do authService que não está sendo encontrado

export interface Plan {
  id: string
  name: string
  description: string
  price: number
  message_limit: number
  is_active: boolean
  features?: string[]
  created_at: string
}

// URL base da API (será substituída pela URL real do backend)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Dados mockados para desenvolvimento
const mockPlans: Plan[] = [
  {
    id: '1',
    name: 'Básico',
    description: 'Plano básico para pequenos negócios',
    price: 49.90,
    message_limit: 1000,
    is_active: true,
    features: ['Até 1.000 mensagens/mês', '1 número de WhatsApp', 'Suporte por email'],
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Profissional',
    description: 'Plano ideal para médias empresas',
    price: 99.90,
    message_limit: 5000,
    is_active: true,
    features: ['Até 5.000 mensagens/mês', '3 números de WhatsApp', 'Suporte prioritário', 'Templates ilimitados'],
    created_at: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Empresarial',
    description: 'Plano completo para grandes empresas',
    price: 199.90,
    message_limit: 20000,
    is_active: true,
    features: ['Até 20.000 mensagens/mês', '10 números de WhatsApp', 'Suporte 24/7', 'API personalizada', 'Relatórios avançados'],
    created_at: new Date().toISOString()
  }
];

/**
 * Serviço para gerenciar planos
 */
export const planService = {
  /**
   * Busca todos os planos ativos
   */
  async getActivePlans(): Promise<Plan[]> {
    try {
      // Implementação temporária com dados mockados
      return mockPlans.filter(plan => plan.is_active).sort((a, b) => a.price - b.price);
      
      // Implementação real (comentada por enquanto)
      /*
      const token = authService.getToken();
      const response = await axios.get(`${API_URL}/plans/active`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
      */
    } catch (error) {
      console.error('Erro ao buscar planos ativos:', error);
      throw error;
    }
  },

  /**
   * Busca todos os planos (ativos e inativos)
   */
  async getAllPlans(): Promise<Plan[]> {
    try {
      // Implementação temporária com dados mockados
      return [...mockPlans].sort((a, b) => a.price - b.price);
      
      // Implementação real (comentada por enquanto)
      /*
      const token = authService.getToken();
      const response = await axios.get(`${API_URL}/plans`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
      */
    } catch (error) {
      console.error('Erro ao buscar todos os planos:', error);
      throw error;
    }
  },

  /**
   * Busca um plano específico pelo ID
   */
  async getPlanById(id: string): Promise<Plan | null> {
    try {
      // Implementação temporária com dados mockados
      const plan = mockPlans.find(p => p.id === id);
      if (!plan) {
        return this.getDefaultPlan(id);
      }
      return plan;
      
      // Implementação real (comentada por enquanto)
      /*
      const token = authService.getToken();
      const response = await axios.get(`${API_URL}/plans/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
      */
    } catch (error) {
      console.error(`Erro ao buscar plano ${id}:`, error);
      return this.getDefaultPlan(id);
    }
  },

  /**
   * Retorna um plano padrão quando o plano não é encontrado
   * Isso é útil para desenvolvimento e quando há problemas de conexão
   */
  getDefaultPlan(id: string): Plan {
    // Mapeamento de planos padrão baseado no ID
    const defaultPlans: Record<string, Plan> = {
      '3': {
        id: '3',
        name: 'Premium',
        description: 'Plano Premium com recursos avançados',
        price: 49.90,
        message_limit: 1000,
        is_active: true,
        created_at: new Date().toISOString()
      },
      '2': {
        id: '2',
        name: 'Básico',
        description: 'Plano Básico com recursos essenciais',
        price: 29.90,
        message_limit: 500,
        is_active: true,
        created_at: new Date().toISOString()
      },
      '1': {
        id: '1',
        name: 'Gratuito',
        description: 'Plano Gratuito com recursos limitados',
        price: 0,
        message_limit: 100,
        is_active: true,
        created_at: new Date().toISOString()
      }
    }
    
    // Retorna o plano específico ou um plano genérico
    return defaultPlans[id] || {
      id: id || 'default',
      name: 'Premium',
      description: 'Plano Premium',
      price: 49.90,
      message_limit: 1000,
      is_active: true,
      created_at: new Date().toISOString()
    }
  },

  /**
   * Cria um novo plano
   */
  async createPlan(plan: Omit<Plan, 'id' | 'created_at'>): Promise<Plan> {
    try {
      // Implementação temporária com dados mockados
      const newPlan: Plan = {
        ...plan,
        id: `plan_${Math.random().toString(36).substring(2, 9)}`,
        created_at: new Date().toISOString()
      };
      
      // Em um ambiente real, isso seria persistido no banco de dados
      mockPlans.push(newPlan);
      
      return newPlan;
      
      // Implementação real (comentada por enquanto)
      /*
      const token = authService.getToken();
      const response = await axios.post(`${API_URL}/plans`, plan, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
      */
    } catch (error) {
      console.error('Erro ao criar plano:', error);
      throw error;
    }
  },

  /**
   * Atualiza um plano existente
   */
  async updatePlan(id: string, plan: Partial<Omit<Plan, 'id' | 'created_at'>>): Promise<Plan> {
    try {
      // Implementação temporária com dados mockados
      const index = mockPlans.findIndex(p => p.id === id);
      if (index === -1) {
        throw new Error(`Plano com ID ${id} não encontrado`);
      }
      
      // Atualiza o plano no array mockado
      mockPlans[index] = {
        ...mockPlans[index],
        ...plan
      };
      
      return mockPlans[index];
      
      // Implementação real (comentada por enquanto)
      /*
      const token = authService.getToken();
      const response = await axios.put(`${API_URL}/plans/${id}`, plan, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
      */
    } catch (error) {
      console.error(`Erro ao atualizar plano ${id}:`, error);
      throw error;
    }
  },

  /**
   * Exclui um plano
   */
  async deletePlan(id: string): Promise<void> {
    try {
      // Implementação temporária com dados mockados
      const index = mockPlans.findIndex(p => p.id === id);
      if (index === -1) {
        throw new Error(`Plano com ID ${id} não encontrado`);
      }
      
      // Remove o plano do array mockado
      mockPlans.splice(index, 1);
      
      // Implementação real (comentada por enquanto)
      /*
      const token = authService.getToken();
      await axios.delete(`${API_URL}/plans/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      */
    } catch (error) {
      console.error(`Erro ao excluir plano ${id}:`, error);
      throw error;
    }
  }
}
