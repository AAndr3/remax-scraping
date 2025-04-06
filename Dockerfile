FROM mcr.microsoft.com/playwright:v1.42.1-jammy

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

EXPOSE 3333
CMD ["npm", "start"]
