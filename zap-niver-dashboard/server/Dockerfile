FROM node:16

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências
RUN npm install

# Copiar o restante dos arquivos da aplicação
COPY . .

# Expor a porta que a aplicação usa
EXPOSE 5001

# Comando para iniciar a aplicação
CMD ["node", "src/server.js"]
