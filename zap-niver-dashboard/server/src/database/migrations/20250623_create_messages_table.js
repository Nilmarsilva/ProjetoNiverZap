/**
 * Migração para criar a tabela de mensagens
 */
exports.up = function(knex) {
  return knex.schema.createTable('messages', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('organization_id').references('id').inTable('organizations').onDelete('CASCADE');
    table.uuid('customer_id').references('id').inTable('customers').onDelete('CASCADE');
    table.uuid('template_id').references('id').inTable('message_templates').onDelete('SET NULL');
    table.text('content').notNullable();
    table.string('status', 50).defaultTo('pending');
    table.timestamp('sent_at');
    table.timestamp('scheduled_for');
    table.jsonb('metadata');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    
    // Índices para otimização de consultas
    table.index('organization_id');
    table.index('customer_id');
    table.index(['status', 'scheduled_for']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('messages');
};
