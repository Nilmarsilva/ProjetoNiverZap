/**
 * Migração para adicionar campos de perfil à tabela de usuários
 */
exports.up = function(knex) {
  return knex.schema.alterTable('users', function(table) {
    // Campos de dados pessoais
    table.string('phone', 20);
    table.string('mobile_phone', 20);
    table.string('document_type', 10); // 'cpf' ou 'cnpj'
    table.string('document', 20);
    table.date('birth_date');
    
    // Campos de endereço
    table.string('address', 255);
    table.string('address_number', 20);
    table.string('complement', 255);
    table.string('neighborhood', 100);
    table.string('city', 100);
    table.string('state', 2);
    table.string('zipcode', 10);
    
    // Campos para pessoa jurídica
    table.string('company_name', 255);
    table.string('trading_name', 255);
    
    // Campos adicionais
    table.string('profile_image', 255);
    table.boolean('is_profile_complete').defaultTo(false);
    
    // Remover campo asaas_customer_id (já que estamos migrando para Stripe)
    table.dropColumn('asaas_customer_id');
    
    // Adicionar campo stripe_customer_id
    table.string('stripe_customer_id', 255);
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('users', function(table) {
    // Remover campos adicionados
    table.dropColumn('phone');
    table.dropColumn('mobile_phone');
    table.dropColumn('document_type');
    table.dropColumn('document');
    table.dropColumn('birth_date');
    table.dropColumn('address');
    table.dropColumn('address_number');
    table.dropColumn('complement');
    table.dropColumn('neighborhood');
    table.dropColumn('city');
    table.dropColumn('state');
    table.dropColumn('zipcode');
    table.dropColumn('company_name');
    table.dropColumn('trading_name');
    table.dropColumn('profile_image');
    table.dropColumn('is_profile_complete');
    table.dropColumn('stripe_customer_id');
    
    // Restaurar campo asaas_customer_id
    table.string('asaas_customer_id', 255);
  });
};
