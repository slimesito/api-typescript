import dotenv from 'dotenv';

dotenv.config();

export const config = {
  server: {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'secret-key-default',
    expiresIn: '24h',
  },
  db: {
    url: process.env.DATABASE_URL,
  }
};