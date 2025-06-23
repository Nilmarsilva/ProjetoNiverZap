/**
 * Migração para habilitar a extensão uuid-ossp no PostgreSQL
 * Esta extensão é necessária para gerar UUIDs automaticamente
 */
exports.up = function(knex) {
  return knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
};

exports.down = function(knex) {
  return knex.raw('DROP EXTENSION IF EXISTS "uuid-ossp"');
};
