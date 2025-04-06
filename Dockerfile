# Usar imagem oficial do Node.js com suporte para Playwright
FROM mcr.microsoft.com/playwright:v1.42.1-jammy

# Definir diretório de trabalho
WORKDIR /app

# Copiar package.json e instalar dependências
COPY package.json package-lock.json* ./
RUN npm install

# Copiar os restantes ficheiros do projeto
COPY . .

# Expor a porta que o servidor usa
EXPOSE 3333

# Comando para arrancar o servidor
CMD ["npm", "start"]
