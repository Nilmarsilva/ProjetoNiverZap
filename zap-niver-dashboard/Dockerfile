FROM node:18-alpine as build

WORKDIR /app

# Copiar arquivos de configuração
COPY package.json package-lock.json ./

# Instalar dependências
RUN npm ci

# Copiar o código fonte
COPY . .

# Construir a aplicação
RUN npm run build

# Estágio de produção
FROM nginx:alpine

# Copiar arquivos de build para o nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Copiar configuração personalizada do nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expor a porta
EXPOSE 3000

# Iniciar o nginx
CMD ["nginx", "-g", "daemon off;"]
