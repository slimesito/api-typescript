# CAMBIO: Usamos "slim" (Debian) en lugar de "alpine" para máxima compatibilidad
FROM node:20-slim

WORKDIR /app

# Instalamos OpenSSL (necesario para Prisma) usando apt-get (Debian)
RUN apt-get update -y && apt-get install -y openssl

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

COPY . .

# Generamos el cliente de Prisma
RUN npx prisma generate

EXPOSE 3000

CMD ["npm", "run", "start"]