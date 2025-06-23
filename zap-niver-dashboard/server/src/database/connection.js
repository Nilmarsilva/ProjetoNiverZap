const knex = require('knex');
const config = require('../../knexfile');

// Determina o ambiente (development ou production)
const environment = process.env.NODE_ENV || 'development';

// Cria a conexão com o banco de dados
const connection = knex(config[environment]);

module.exports = connection;
