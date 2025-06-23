/**
 * Seed para criar os planos padrão do sistema
 */
exports.seed = async function(knex) {
  // Limpa a tabela de planos antes de inserir novos dados
  await knex('plans').del();
  
  // Insere os planos padrão
  await knex('plans').insert([
    {
      id: '550e8400-e29b-41d4-a716-446655440000', // UUID fixo para o plano gratuito
      name: 'Plano Gratuito',
      description: 'Plano básico com recursos limitados',
      price: 0.00,
      billing_period: 'monthly',
      max_contacts: 50,
      max_templates: 3,
      features: JSON.stringify({
        whatsapp_integration: true,
        custom_templates: true,
        bulk_import: false,
        analytics: false,
        api_access: false
      }),
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440001', // UUID fixo para o plano básico
      name: 'Plano Básico',
      description: 'Ideal para pequenos negócios',
      price: 29.90,
      billing_period: 'monthly',
      max_contacts: 200,
      max_templates: 10,
      features: JSON.stringify({
        whatsapp_integration: true,
        custom_templates: true,
        bulk_import: true,
        analytics: true,
        api_access: false
      }),
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440002', // UUID fixo para o plano profissional
      name: 'Plano Profissional',
      description: 'Para empresas em crescimento',
      price: 79.90,
      billing_period: 'monthly',
      max_contacts: 1000,
      max_templates: 30,
      features: JSON.stringify({
        whatsapp_integration: true,
        custom_templates: true,
        bulk_import: true,
        analytics: true,
        api_access: true
      }),
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440003', // UUID fixo para o plano empresarial
      name: 'Plano Empresarial',
      description: 'Solução completa para grandes empresas',
      price: 199.90,
      billing_period: 'monthly',
      max_contacts: 5000,
      max_templates: 100,
      features: JSON.stringify({
        whatsapp_integration: true,
        custom_templates: true,
        bulk_import: true,
        analytics: true,
        api_access: true
      }),
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    }
  ]);
};
