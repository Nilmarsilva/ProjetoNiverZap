/**
 * Migração para criar a tabela de clientes (contatos)
 */
exports.up = function(knex) {
  return knex.schema.createTable('customers', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('organization_id').references('id').inTable('organizations').onDelete('CASCADE');
    table.string('name', 255).notNullable();
    table.string('phone', 20).notNullable();
    table.string('email', 255);
    table.date('birth_date');
    table.jsonb('tags');
    table.jsonb('custom_fields');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at');
    table.string('status', 20).defaultTo('active');
    
    // Índices para otimização de consultas
    table.index('organization_id');
    // Índice para busca rápida de aniversariantes
    table.index([knex.raw('EXTRACT(MONTH FROM birth_date)'), knex.raw('EXTRACT(DAY FROM birth_date)')], 'idx_birth_date');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('customers');
};
