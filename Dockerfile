# Imagem base leve com suporte a Playwright
FROM mcr.microsoft.com/playwright:v1.42.1-jammy

# Define a pasta de trabalho
WORKDIR /app

# Copia os ficheiros necessários
COPY package*.json ./
COPY index.js ./

# Instala as dependências
RUN npm install

# Copia tudo o resto (se tiveres mais ficheiros)
COPY . .

# Expõe a porta que o app usa
EXPOSE 3333

# Comando para correr o servidor
CMD ["node", "index.js"]
