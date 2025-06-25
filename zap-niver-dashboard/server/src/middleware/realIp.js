/**
 * Middleware para identificar o IP real do cliente
 * Útil quando a aplicação está atrás de um proxy/load balancer
 */
const realIpMiddleware = (req, res, next) => {
  // Obtém o IP real do cliente a partir dos headers do proxy
  req.realIp = req.headers['x-forwarded-for']?.split(',')[0].trim() || 
               req.headers['x-real-ip'] || 
               req.connection.remoteAddress;
  
  // Adiciona o IP ao objeto de log para rastreamento
  req.log = {
    ...req.log,
    clientIp: req.realIp,
    timestamp: new Date().toISOString()
  };
  
  next();
};

module.exports = realIpMiddleware;
