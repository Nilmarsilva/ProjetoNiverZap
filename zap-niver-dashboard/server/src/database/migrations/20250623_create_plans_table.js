/**
 * Migração para criar a tabela de planos
 * Esta tabela deve ser criada antes da organizations, pois há uma referência
 */
exports.up = function(knex) {
  return knex.schema.createTable('plans', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('name', 255).notNullable();
    table.text('description');
    table.decimal('price', 10, 2).notNullable();
    table.string('billing_cycle', 20).defaultTo('monthly');
    table.integer('max_contacts');
    table.integer('max_templates');
    table.jsonb('features');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('plans');
};
