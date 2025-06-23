/**
 * Migração para criar a tabela de eventos (logging e auditoria)
 */
exports.up = function(knex) {
  return knex.schema.createTable('events', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('organization_id').references('id').inTable('organizations').onDelete('CASCADE');
    table.uuid('user_id').references('id').inTable('users').onDelete('SET NULL');
    table.string('event_type', 100).notNullable();
    table.string('entity_type', 100);
    table.uuid('entity_id');
    table.jsonb('details');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    
    // Índices para otimização de consultas
    table.index('organization_id');
    table.index('event_type');
    table.index('created_at');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('events');
};
