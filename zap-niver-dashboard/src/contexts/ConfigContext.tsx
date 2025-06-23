import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import configService, { ConfigCategory } from '@/services/configService';

// Interface para o contexto de configurações
interface ConfigContextType {
  configs: Record<ConfigCategory, any>;
  loading: boolean;
  updateConfig: (category: ConfigCategory, data: any) => Promise<boolean>;
  refreshConfigs: () => Promise<void>;
  resetConfig: (categories: ConfigCategory[] | 'all') => Promise<boolean>;
}

// Valor padrão do contexto
const defaultContextValue: ConfigContextType = {
  configs: {
    whatsapp: null,
    interface: null,
    notifications: null,
    dates: null,
    security: null,
    backup: null,
    limits: null,
  },
  loading: true,
  updateConfig: async () => false,
  refreshConfigs: async () => {},
  resetConfig: async () => false,
};

// Criação do contexto
const ConfigContext = createContext<ConfigContextType>(defaultContextValue);

// Props para o provider
interface ConfigProviderProps {
  children: ReactNode;
}

/**
 * Provider para o contexto de configurações
 * 
 * Gerencia o estado global das configurações da aplicação
 */
export const ConfigProvider: React.FC<ConfigProviderProps> = ({ children }) => {
  // Estado para armazenar as configurações
  const [configs, setConfigs] = useState<Record<ConfigCategory, any>>(defaultContextValue.configs);
  const [loading, setLoading] = useState<boolean>(true);

  // Função para carregar todas as configurações
  const loadConfigurations = async () => {
    try {
      setLoading(true);
      const allConfigs = await configService.getAllConfigurations();
      setConfigs(allConfigs);
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    } finally {
      setLoading(false);
    }
  };

  // Carregar configurações ao montar o componente
  useEffect(() => {
    loadConfigurations();
  }, []);

  // Função para atualizar uma categoria de configuração
  const updateConfig = async (category: ConfigCategory, data: any): Promise<boolean> => {
    try {
      const success = await configService.updateConfigurations(category, data);
      
      if (success) {
        // Atualiza o estado local apenas se a operação for bem-sucedida
        setConfigs(prev => ({
          ...prev,
          [category]: data
        }));
      }
      
      return success;
    } catch (error) {
      console.error(`Erro ao atualizar configurações de ${category}:`, error);
      return false;
    }
  };

  // Função para recarregar todas as configurações
  const refreshConfigs = async (): Promise<void> => {
    await loadConfigurations();
  };
  
  // Função para resetar configurações para os valores padrão
  const resetConfig = async (categories: ConfigCategory[] | 'all'): Promise<boolean> => {
    try {
      const success = await configService.resetConfigurations(categories);
      
      if (success) {
        // Recarregar configurações após o reset
        await loadConfigurations();
      }
      
      return success;
    } catch (error) {
      console.error('Erro ao resetar configurações:', error);
      return false;
    }
  };

  // Valor do contexto
  const contextValue: ConfigContextType = {
    configs,
    loading,
    updateConfig,
    refreshConfigs,
    resetConfig
  };

  return (
    <ConfigContext.Provider value={contextValue}>
      {children}
    </ConfigContext.Provider>
  );
};

/**
 * Hook para usar o contexto de configurações
 * 
 * Facilita o acesso às configurações em qualquer componente
 */
export const useConfig = (): ConfigContextType => {
  const context = useContext(ConfigContext);
  
  if (!context) {
    throw new Error('useConfig deve ser usado dentro de um ConfigProvider');
  }
  
  return context;
};

export default ConfigProvider;
