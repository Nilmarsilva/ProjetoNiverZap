/**
 * Migração para criar a tabela de assinaturas
 */
exports.up = function(knex) {
  return knex.schema.createTable('subscriptions', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('organization_id').references('id').inTable('organizations').onDelete('CASCADE');
    table.uuid('plan_id').references('id').inTable('plans').onDelete('SET NULL');
    table.string('asaas_subscription_id', 255);
    table.string('status', 50).defaultTo('active');
    table.timestamp('start_date').defaultTo(knex.fn.now());
    table.timestamp('end_date');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at');
    
    // Índice para busca rápida por organização
    table.index('organization_id');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('subscriptions');
};
