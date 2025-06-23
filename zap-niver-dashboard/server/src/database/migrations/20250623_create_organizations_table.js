/**
 * Migração para criar a tabela de organizações (clientes do NiverZap)
 */
exports.up = function(knex) {
  return knex.schema.createTable('organizations', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('name', 255).notNullable();
    table.string('email', 255).unique();
    table.string('phone', 20);
    table.uuid('plan_id').references('id').inTable('plans').onDelete('SET NULL');
    table.string('asaas_customer_id', 255);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at');
    table.string('status', 20).defaultTo('active');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('organizations');
};
