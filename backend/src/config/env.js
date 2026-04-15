import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

function normalize(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizePassword(value) {
  return normalize(value).replace(/\s+/g, '');
}

const requiredKeys = ['DB_HOST', 'DB_USER', 'DB_NAME'];

for (const key of requiredKeys) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

export const env = {
  port: Number(process.env.PORT || 4000),
  nodeEnv: normalize(process.env.NODE_ENV) || 'development',
  dbHost: normalize(process.env.DB_HOST),
  dbPort: Number(process.env.DB_PORT || 3306),
  dbUser: normalize(process.env.DB_USER),
  dbPassword: normalize(process.env.DB_PASSWORD),
  dbName: normalize(process.env.DB_NAME),
  jwtSecret: normalize(process.env.JWT_SECRET) || 'dev-secret',
  smtpHost: normalize(process.env.SMTP_HOST),
  smtpPort: Number(process.env.SMTP_PORT || 587),
  smtpUser: normalize(process.env.SMTP_USER),
  smtpPassword: normalizePassword(process.env.SMTP_PASSWORD),
  smtpFrom: normalize(process.env.SMTP_FROM) || normalize(process.env.SMTP_USER)
};
