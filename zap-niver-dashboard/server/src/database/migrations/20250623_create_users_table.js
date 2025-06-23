/**
 * Migração para criar a tabela de usuários
 */
exports.up = function(knex) {
  return knex.schema.createTable('users', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('organization_id').references('id').inTable('organizations').onDelete('CASCADE');
    table.string('name', 255).notNullable();
    table.string('email', 255).notNullable().unique();
    table.string('password', 255).notNullable();
    table.string('role', 50).defaultTo('user');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at');
    table.timestamp('last_login');
    table.boolean('is_active').defaultTo(true);
    
    // Índice para busca rápida por organização
    table.index('organization_id');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('users');
};
