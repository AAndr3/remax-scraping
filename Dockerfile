# Usa imagem base com Node.js e Chromium já incluído
FROM mcr.microsoft.com/playwright:v1.42.1-jammy

# Cria diretório de trabalho
WORKDIR /app

# Copia os ficheiros
COPY . .

# Instala dependências
RUN npm install

# Expõe a porta
EXPOSE 3333

# Comando para correr o servidor
CMD ["node", "index.js"]
