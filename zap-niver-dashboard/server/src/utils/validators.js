/**
 * Utilitários para validação de dados
 */

const validators = {
  /**
   * Validar email
   * @param {string} email - Email para validar
   * @returns {boolean} - true se válido, false caso contrário
   */
  isValidEmail: (email) => {
    if (!email) return false;
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },
  
  /**
   * Validar CPF
   * @param {string} cpf - CPF para validar (com ou sem máscara)
   * @returns {boolean} - true se válido, false caso contrário
   */
  isValidCPF: (cpf) => {
    if (!cpf) return false;
    
    // Remover caracteres não numéricos
    cpf = cpf.replace(/[^0-9]/g, '');
    
    // Verificar se tem 11 dígitos
    if (cpf.length !== 11) return false;
    
    // Verificar se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cpf)) return false;
    
    // Validar dígitos verificadores
    let sum = 0;
    let remainder;
    
    // Primeiro dígito verificador
    for (let i = 1; i <= 9; i++) {
      sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    }
    
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.substring(9, 10))) return false;
    
    // Segundo dígito verificador
    sum = 0;
    for (let i = 1; i <= 10; i++) {
      sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    }
    
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.substring(10, 11))) return false;
    
    return true;
  },
  
  /**
   * Validar CNPJ
   * @param {string} cnpj - CNPJ para validar (com ou sem máscara)
   * @returns {boolean} - true se válido, false caso contrário
   */
  isValidCNPJ: (cnpj) => {
    if (!cnpj) return false;
    
    // Remover caracteres não numéricos
    cnpj = cnpj.replace(/[^0-9]/g, '');
    
    // Verificar se tem 14 dígitos
    if (cnpj.length !== 14) return false;
    
    // Verificar se todos os dígitos são iguais
    if (/^(\d)\1{13}$/.test(cnpj)) return false;
    
    // Validar dígitos verificadores
    let size = cnpj.length - 2;
    let numbers = cnpj.substring(0, size);
    const digits = cnpj.substring(size);
    let sum = 0;
    let pos = size - 7;
    
    // Primeiro dígito verificador
    for (let i = size; i >= 1; i--) {
      sum += parseInt(numbers.charAt(size - i)) * pos--;
      if (pos < 2) pos = 9;
    }
    
    let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(digits.charAt(0))) return false;
    
    // Segundo dígito verificador
    size += 1;
    numbers = cnpj.substring(0, size);
    sum = 0;
    pos = size - 7;
    
    for (let i = size; i >= 1; i--) {
      sum += parseInt(numbers.charAt(size - i)) * pos--;
      if (pos < 2) pos = 9;
    }
    
    result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(digits.charAt(1))) return false;
    
    return true;
  },
  
  /**
   * Validar telefone
   * @param {string} phone - Telefone para validar (com ou sem máscara)
   * @returns {boolean} - true se válido, false caso contrário
   */
  isValidPhone: (phone) => {
    if (!phone) return false;
    
    // Remover caracteres não numéricos
    phone = phone.replace(/[^0-9]/g, '');
    
    // Verificar se tem entre 10 e 11 dígitos (com ou sem DDD)
    return phone.length >= 10 && phone.length <= 11;
  },
  
  /**
   * Validar CEP
   * @param {string} zipcode - CEP para validar (com ou sem máscara)
   * @returns {boolean} - true se válido, false caso contrário
   */
  isValidZipCode: (zipcode) => {
    if (!zipcode) return false;
    
    // Remover caracteres não numéricos
    zipcode = zipcode.replace(/[^0-9]/g, '');
    
    // Verificar se tem 8 dígitos
    return zipcode.length === 8;
  },
  
  /**
   * Formatar CPF com máscara
   * @param {string} cpf - CPF sem máscara
   * @returns {string} - CPF formatado
   */
  formatCPF: (cpf) => {
    if (!cpf) return '';
    
    // Remover caracteres não numéricos
    cpf = cpf.replace(/[^0-9]/g, '');
    
    // Aplicar máscara
    return cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
  },
  
  /**
   * Formatar CNPJ com máscara
   * @param {string} cnpj - CNPJ sem máscara
   * @returns {string} - CNPJ formatado
   */
  formatCNPJ: (cnpj) => {
    if (!cnpj) return '';
    
    // Remover caracteres não numéricos
    cnpj = cnpj.replace(/[^0-9]/g, '');
    
    // Aplicar máscara
    return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  },
  
  /**
   * Formatar telefone com máscara
   * @param {string} phone - Telefone sem máscara
   * @returns {string} - Telefone formatado
   */
  formatPhone: (phone) => {
    if (!phone) return '';
    
    // Remover caracteres não numéricos
    phone = phone.replace(/[^0-9]/g, '');
    
    // Aplicar máscara conforme o tamanho
    if (phone.length === 11) {
      return phone.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
    } else if (phone.length === 10) {
      return phone.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
    }
    
    return phone;
  },
  
  /**
   * Formatar CEP com máscara
   * @param {string} zipcode - CEP sem máscara
   * @returns {string} - CEP formatado
   */
  formatZipCode: (zipcode) => {
    if (!zipcode) return '';
    
    // Remover caracteres não numéricos
    zipcode = zipcode.replace(/[^0-9]/g, '');
    
    // Aplicar máscara
    return zipcode.replace(/^(\d{5})(\d{3})$/, '$1-$2');
  }
};

module.exports = validators;