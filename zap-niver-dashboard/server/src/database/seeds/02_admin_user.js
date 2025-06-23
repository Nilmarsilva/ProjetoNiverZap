/**
 * Seed para criar o usuário administrador e sua organização
 */
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

exports.seed = async function(knex) {
  // Primeiro, criamos a organização administradora
  const adminOrgId = '550e8400-e29b-41d4-a716-446655440100'; // UUID fixo para organização admin
  
  // Verifica se a organização já existe
  const existingOrg = await knex('organizations').where({ id: adminOrgId }).first();
  
  if (!existingOrg) {
    await knex('organizations').insert({
      id: adminOrgId,
      name: 'NiverZap Admin',
      email: 'admin@niverzap.com',
      phone: '11999999999',
      plan_id: '550e8400-e29b-41d4-a716-446655440003', // Plano Empresarial
      status: 'active',
      created_at: new Date(),
      updated_at: new Date()
    });
  }
  
  // Agora, criamos o usuário administrador
  const adminUserId = '550e8400-e29b-41d4-a716-446655440101'; // UUID fixo para usuário admin
  
  // Verifica se o usuário já existe
  const existingUser = await knex('users').where({ id: adminUserId }).first();
  
  if (!existingUser) {
    // Gera o hash da senha
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash('Admin@123', saltRounds);
    
    await knex('users').insert({
      id: adminUserId,
      organization_id: adminOrgId,
      name: 'Administrador',
      email: 'admin@niverzap.com',
      password: hashedPassword,
      role: 'admin',
      status: 'active',
      created_at: new Date(),
      updated_at: new Date()
    });
  }
};
