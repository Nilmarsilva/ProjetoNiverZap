/**
 * Migração para criar a tabela de templates de mensagens
 */
exports.up = function(knex) {
  return knex.schema.createTable('message_templates', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('organization_id').references('id').inTable('organizations').onDelete('CASCADE');
    table.string('name', 255).notNullable();
    table.text('content').notNullable();
    table.jsonb('variables');
    table.string('type', 50).defaultTo('birthday');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at');
    
    // Índice para busca rápida por organização
    table.index('organization_id');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('message_templates');
};
