/**
 * Controlador para gerenciamento de contatos
 */

// Modelo temporário de contatos (será substituído pelo banco de dados)
const contactsDb = new Map();

// Gerar um ID único
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
};

// Função auxiliar para verificar se uma data de aniversário é hoje
const isBirthdayToday = (birthDate) => {
  if (!birthDate) return false;
  
  const today = new Date();
  const birth = new Date(birthDate);
  
  return today.getMonth() === birth.getMonth() && 
         today.getDate() === birth.getDate();
};

// Função auxiliar para verificar se uma data de aniversário está nos próximos X dias
const isUpcomingBirthday = (birthDate, days = 30) => {
  if (!birthDate) return false;
  
  const today = new Date();
  const birth = new Date(birthDate);
  const futureDate = new Date(today);
  futureDate.setDate(today.getDate() + days);
  
  // Ajustar para o ano atual
  const thisYearBirthday = new Date(today.getFullYear(), birth.getMonth(), birth.getDate());
  
  // Se o aniversário deste ano já passou, verificar para o próximo ano
  if (thisYearBirthday < today) {
    thisYearBirthday.setFullYear(today.getFullYear() + 1);
  }
  
  // Verificar se está dentro do período especificado
  return thisYearBirthday <= futureDate;
};

const contactController = {
  /**
   * Obter todos os contatos do usuário atual
   */
  getUserContacts: async (req, res) => {
    try {
      const userId = req.user.id;
      const contacts = [];
      
      // Buscar contatos do usuário
      for (const [_, contact] of contactsDb) {
        if (contact.user_id === userId) {
          contacts.push(contact);
        }
      }
      
      // Ordenar por nome
      contacts.sort((a, b) => a.name.localeCompare(b.name));
      
      res.status(200).json({ contacts });
    } catch (error) {
      console.error('Erro ao buscar contatos:', error);
      res.status(500).json({ error: 'Erro ao buscar contatos' });
    }
  },
  
  /**
   * Contar o total de contatos do usuário
   */
  countUserContacts: async (req, res) => {
    try {
      const userId = req.user.id;
      let count = 0;
      
      // Contar contatos do usuário
      for (const [_, contact] of contactsDb) {
        if (contact.user_id === userId) {
          count++;
        }
      }
      
      res.status(200).json({ count });
    } catch (error) {
      console.error('Erro ao contar contatos:', error);
      res.status(500).json({ error: 'Erro ao contar contatos' });
    }
  },
  
  /**
   * Buscar aniversariantes do dia
   */
  getTodayBirthdays: async (req, res) => {
    try {
      const userId = req.user.id;
      const birthdays = [];
      
      // Buscar contatos do usuário que fazem aniversário hoje
      for (const [_, contact] of contactsDb) {
        if (contact.user_id === userId && isBirthdayToday(contact.birth_date)) {
          birthdays.push(contact);
        }
      }
      
      // Ordenar por nome
      birthdays.sort((a, b) => a.name.localeCompare(b.name));
      
      res.status(200).json({ contacts: birthdays });
    } catch (error) {
      console.error('Erro ao buscar aniversariantes:', error);
      res.status(500).json({ error: 'Erro ao buscar aniversariantes' });
    }
  },
  
  /**
   * Buscar próximos aniversariantes
   */
  getUpcomingBirthdays: async (req, res) => {
    try {
      const userId = req.user.id;
      const days = parseInt(req.query.days) || 30;
      const birthdays = [];
      
      // Buscar contatos do usuário que fazem aniversário nos próximos X dias
      for (const [_, contact] of contactsDb) {
        if (contact.user_id === userId && isUpcomingBirthday(contact.birth_date, days)) {
          birthdays.push(contact);
        }
      }
      
      // Ordenar por proximidade da data
      birthdays.sort((a, b) => {
        const dateA = new Date(a.birth_date);
        const dateB = new Date(b.birth_date);
        
        const today = new Date();
        const thisYearA = new Date(today.getFullYear(), dateA.getMonth(), dateA.getDate());
        const thisYearB = new Date(today.getFullYear(), dateB.getMonth(), dateB.getDate());
        
        if (thisYearA < today) thisYearA.setFullYear(today.getFullYear() + 1);
        if (thisYearB < today) thisYearB.setFullYear(today.getFullYear() + 1);
        
        return thisYearA.getTime() - thisYearB.getTime();
      });
      
      res.status(200).json({ contacts: birthdays });
    } catch (error) {
      console.error('Erro ao buscar próximos aniversariantes:', error);
      res.status(500).json({ error: 'Erro ao buscar próximos aniversariantes' });
    }
  },
  
  /**
   * Buscar um contato pelo ID
   */
  getContactById: async (req, res) => {
    try {
      const contactId = req.params.id;
      const userId = req.user.id;
      
      // Buscar o contato
      const contact = contactsDb.get(contactId);
      
      if (!contact) {
        return res.status(404).json({ error: 'Contato não encontrado' });
      }
      
      // Verificar se o contato pertence ao usuário
      if (contact.user_id !== userId) {
        return res.status(403).json({ error: 'Acesso negado' });
      }
      
      res.status(200).json({ contact });
    } catch (error) {
      console.error('Erro ao buscar contato:', error);
      res.status(500).json({ error: 'Erro ao buscar contato' });
    }
  },
  
  /**
   * Criar um novo contato
   */
  createContact: async (req, res) => {
    try {
      const userId = req.user.id;
      const contactData = req.body;
      
      // Validar campos obrigatórios
      if (!contactData.name || !contactData.phone) {
        return res.status(400).json({ error: 'Nome e telefone são obrigatórios' });
      }
      
      // Criar o contato
      const id = generateId();
      const newContact = {
        id,
        user_id: userId,
        name: contactData.name,
        phone: contactData.phone,
        birth_date: contactData.birth_date || null,
        email: contactData.email || null,
        address: contactData.address || null,
        group: contactData.group || null,
        notes: contactData.notes || null,
        custom_fields: contactData.custom_fields || {},
        created_at: new Date().toISOString()
      };
      
      // Salvar o contato
      contactsDb.set(id, newContact);
      
      res.status(201).json({ 
        message: 'Contato criado com sucesso',
        contact: newContact
      });
    } catch (error) {
      console.error('Erro ao criar contato:', error);
      res.status(500).json({ error: 'Erro ao criar contato' });
    }
  },
  
  /**
   * Atualizar um contato existente
   */
  updateContact: async (req, res) => {
    try {
      const contactId = req.params.id;
      const userId = req.user.id;
      const contactData = req.body;
      
      // Buscar o contato
      const contact = contactsDb.get(contactId);
      
      if (!contact) {
        return res.status(404).json({ error: 'Contato não encontrado' });
      }
      
      // Verificar se o contato pertence ao usuário
      if (contact.user_id !== userId) {
        return res.status(403).json({ error: 'Acesso negado' });
      }
      
      // Atualizar o contato
      const updatedContact = {
        ...contact,
        ...contactData,
        id: contactId, // Garantir que o ID não seja alterado
        user_id: userId, // Garantir que o user_id não seja alterado
        updated_at: new Date().toISOString()
      };
      
      // Salvar o contato atualizado
      contactsDb.set(contactId, updatedContact);
      
      res.status(200).json({ 
        message: 'Contato atualizado com sucesso',
        contact: updatedContact
      });
    } catch (error) {
      console.error('Erro ao atualizar contato:', error);
      res.status(500).json({ error: 'Erro ao atualizar contato' });
    }
  },
  
  /**
   * Excluir um contato
   */
  deleteContact: async (req, res) => {
    try {
      const contactId = req.params.id;
      const userId = req.user.id;
      
      // Buscar o contato
      const contact = contactsDb.get(contactId);
      
      if (!contact) {
        return res.status(404).json({ error: 'Contato não encontrado' });
      }
      
      // Verificar se o contato pertence ao usuário
      if (contact.user_id !== userId) {
        return res.status(403).json({ error: 'Acesso negado' });
      }
      
      // Excluir o contato
      contactsDb.delete(contactId);
      
      res.status(200).json({ message: 'Contato excluído com sucesso' });
    } catch (error) {
      console.error('Erro ao excluir contato:', error);
      res.status(500).json({ error: 'Erro ao excluir contato' });
    }
  }
};

module.exports = contactController;
