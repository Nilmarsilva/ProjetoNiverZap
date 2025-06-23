import React from 'react';
import { ConfigProvider } from './contexts/ConfigContext';

/**
 * Componente mínimo que apenas renderiza texto, sem usar o hook useConfig
 */
const MinimalConfigContent: React.FC = () => {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1 style={{ color: '#333' }}>DataZap - Teste Mínimo com ConfigProvider</h1>
      <p>Este componente está envolvido pelo ConfigProvider, mas não usa o hook useConfig.</p>
      
      <div style={{ 
        marginTop: '20px', 
        padding: '15px', 
        backgroundColor: '#f5f5f5', 
        borderRadius: '5px' 
      }}>
        <h2 style={{ fontSize: '18px', marginBottom: '10px' }}>Configurações Disponíveis:</h2>
        <ul style={{ paddingLeft: '20px' }}>
          <li>WhatsApp</li>
          <li>Interface</li>
          <li>Notificações</li>
          <li>Datas Comemorativas</li>
          <li>Segurança</li>
          <li>Backup</li>
          <li>Limites</li>
        </ul>
      </div>
    </div>
  );
};

/**
 * Componente que envolve o conteúdo com o ConfigProvider
 */
const MinimalConfigTest: React.FC = () => {
  return (
    <ConfigProvider>
      <MinimalConfigContent />
    </ConfigProvider>
  );
};

export default MinimalConfigTest;
