const redis = require('redis');
const { promisify } = require('util');
const logger = require('../utils/logger');

/**
 * Serviço de cache utilizando Redis para melhorar o desempenho da aplicação
 * em ambiente distribuído com load balancing.
 */
class CacheService {
  constructor() {
    this.client = null;
    this.getAsync = null;
    this.setAsync = null;
    this.delAsync = null;
    this.expireAsync = null;
    this.keysAsync = null;
    this.connected = false;
    this.enabled = process.env.REDIS_ENABLED === 'true';
  }

  /**
   * Inicializa a conexão com o Redis
   */
  async connect() {
    if (!this.enabled) {
      logger.info('Cache Redis desabilitado por configuração');
      return;
    }

    try {
      const redisHost = process.env.REDIS_HOST || 'localhost';
      const redisPort = process.env.REDIS_PORT || 6379;
      const redisPassword = process.env.REDIS_PASSWORD;
      
      const redisOptions = {
        host: redisHost,
        port: redisPort,
        retry_strategy: (options) => {
          if (options.error && options.error.code === 'ECONNREFUSED') {
            logger.error('Conexão com Redis recusada. Tentando novamente em 5 segundos...');
            return 5000;
          }
          return Math.min(options.attempt * 100, 3000);
        }
      };
      
      if (redisPassword) {
        redisOptions.password = redisPassword;
      }

      this.client = redis.createClient(redisOptions);

      this.getAsync = promisify(this.client.get).bind(this.client);
      this.setAsync = promisify(this.client.set).bind(this.client);
      this.delAsync = promisify(this.client.del).bind(this.client);
      this.expireAsync = promisify(this.client.expire).bind(this.client);
      this.keysAsync = promisify(this.client.keys).bind(this.client);

      this.client.on('connect', () => {
        this.connected = true;
        logger.info(`Conectado ao Redis em ${redisHost}:${redisPort}`);
      });

      this.client.on('error', (err) => {
        this.connected = false;
        logger.error(`Erro na conexão com Redis: ${err.message}`);
      });

      this.client.on('reconnecting', () => {
        logger.info('Reconectando ao Redis...');
      });

    } catch (error) {
      logger.error(`Erro ao inicializar Redis: ${error.message}`);
      this.connected = false;
    }
  }

  /**
   * Verifica se o serviço de cache está disponível
   * @returns {boolean} Status da conexão
   */
  isConnected() {
    return this.enabled && this.connected;
  }

  /**
   * Obtém um valor do cache
   * @param {string} key - Chave do cache
   * @returns {Promise<any>} Valor armazenado ou null se não encontrado
   */
  async get(key) {
    if (!this.isConnected()) return null;
    
    try {
      const data = await this.getAsync(key);
      if (!data) return null;
      
      return JSON.parse(data);
    } catch (error) {
      logger.error(`Erro ao obter valor do cache (${key}): ${error.message}`);
      return null;
    }
  }

  /**
   * Armazena um valor no cache
   * @param {string} key - Chave do cache
   * @param {any} value - Valor a ser armazenado
   * @param {number} ttl - Tempo de vida em segundos (opcional)
   * @returns {Promise<boolean>} Sucesso da operação
   */
  async set(key, value, ttl = null) {
    if (!this.isConnected()) return false;
    
    try {
      const serializedValue = JSON.stringify(value);
      
      if (ttl) {
        await this.setAsync(key, serializedValue, 'EX', ttl);
      } else {
        await this.setAsync(key, serializedValue);
      }
      
      return true;
    } catch (error) {
      logger.error(`Erro ao definir valor no cache (${key}): ${error.message}`);
      return false;
    }
  }

  /**
   * Remove um valor do cache
   * @param {string} key - Chave do cache
   * @returns {Promise<boolean>} Sucesso da operação
   */
  async delete(key) {
    if (!this.isConnected()) return false;
    
    try {
      await this.delAsync(key);
      return true;
    } catch (error) {
      logger.error(`Erro ao excluir valor do cache (${key}): ${error.message}`);
      return false;
    }
  }

  /**
   * Remove todos os valores do cache que correspondem a um padrão
   * @param {string} pattern - Padrão de chaves a serem removidas
   * @returns {Promise<number>} Número de chaves removidas
   */
  async deleteByPattern(pattern) {
    if (!this.isConnected()) return 0;
    
    try {
      const keys = await this.keysAsync(pattern);
      if (keys.length === 0) return 0;
      
      await this.delAsync(keys);
      return keys.length;
    } catch (error) {
      logger.error(`Erro ao excluir valores do cache por padrão (${pattern}): ${error.message}`);
      return 0;
    }
  }

  /**
   * Define o tempo de expiração de uma chave
   * @param {string} key - Chave do cache
   * @param {number} ttl - Tempo de vida em segundos
   * @returns {Promise<boolean>} Sucesso da operação
   */
  async expire(key, ttl) {
    if (!this.isConnected()) return false;
    
    try {
      await this.expireAsync(key, ttl);
      return true;
    } catch (error) {
      logger.error(`Erro ao definir expiração no cache (${key}): ${error.message}`);
      return false;
    }
  }

  /**
   * Fecha a conexão com o Redis
   */
  async close() {
    if (this.client && this.connected) {
      this.client.quit();
      this.connected = false;
      logger.info('Conexão com Redis fechada');
    }
  }
}

// Exporta uma instância única do serviço de cache
const cacheService = new CacheService();
module.exports = cacheService;
