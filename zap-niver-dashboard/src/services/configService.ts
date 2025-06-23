/**
 * Serviço para gerenciar configurações globais
 * 
 * Fornece métodos para obter e atualizar configurações
 * Inicialmente usa localStorage como fallback, preparado para integração com API
 */

// Tipos de configurações
export type ConfigCategory = 
  | 'whatsapp' 
  | 'interface' 
  | 'notifications' 
  | 'dates' 
  | 'security' 
  | 'backup' 
  | 'limits';

// Função auxiliar para obter configurações do localStorage
const getFromLocalStorage = (category: ConfigCategory): any => {
  try {
    const data = localStorage.getItem(`${category}Config`);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`Erro ao obter configurações de ${category} do localStorage:`, error);
    return null;
  }
};

// Função auxiliar para salvar configurações no localStorage
const saveToLocalStorage = (category: ConfigCategory, data: any): void => {
  try {
    localStorage.setItem(`${category}Config`, JSON.stringify(data));
  } catch (error) {
    console.error(`Erro ao salvar configurações de ${category} no localStorage:`, error);
  }
};

// Serviço de configurações
export const configService = {
  // Obter todas as configurações
  getAllConfigurations: async (): Promise<Record<ConfigCategory, any>> => {
    // Quando integrado com API, será substituído por uma chamada axios
    // return axios.get(`${API_URL}/configurations`);
    
    // Por enquanto, usa localStorage
    const categories: ConfigCategory[] = [
      'whatsapp', 'interface', 'notifications', 
      'dates', 'security', 'backup', 'limits'
    ];
    
    const configs: Partial<Record<ConfigCategory, any>> = {};
    
    for (const category of categories) {
      configs[category] = getFromLocalStorage(category);
    }
    
    return configs as Record<ConfigCategory, any>;
  },
  
  // Obter configurações por categoria
  getConfigurationsByCategory: async (category: ConfigCategory): Promise<any> => {
    // Quando integrado com API, será substituído por uma chamada axios
    // return axios.get(`${API_URL}/configurations/${category}`);
    
    // Por enquanto, usa localStorage
    return getFromLocalStorage(category);
  },
  
  // Atualizar configurações por categoria
  updateConfigurations: async (category: ConfigCategory, data: any): Promise<boolean> => {
    try {
      // Quando integrado com API, será substituído por uma chamada axios
      // await axios.put(`${API_URL}/configurations/${category}`, data);
      
      // Por enquanto, usa localStorage
      saveToLocalStorage(category, data);
      return true;
    } catch (error) {
      console.error(`Erro ao atualizar configurações de ${category}:`, error);
      return false;
    }
  },
  
  // Resetar configurações para os valores padrão
  resetConfigurations: async (categories: ConfigCategory[] | 'all'): Promise<boolean> => {
    try {
      // Quando integrado com API, será substituído por uma chamada axios
      // await axios.post(`${API_URL}/configurations/reset`, { categories });
      
      // Por enquanto, usa localStorage
      const categoriesToReset = categories === 'all' 
        ? ['whatsapp', 'interface', 'notifications', 'dates', 'security', 'backup', 'limits'] as ConfigCategory[]
        : categories;
      
      for (const category of categoriesToReset) {
        localStorage.removeItem(`${category}Config`);
      }
      
      return true;
    } catch (error) {
      console.error(`Erro ao resetar configurações:`, error);
      return false;
    }
  }
};

export default configService;
