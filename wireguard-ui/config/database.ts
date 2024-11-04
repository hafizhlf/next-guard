// src/config/database.ts
import { Sequelize } from 'sequelize';

const config = {
  development: {
    dialect: 'sqlite' as const,
    storage: './database.sqlite',
    logging: false,
  },
  test: {
    dialect: 'sqlite' as const,
    storage: ':memory:',
    logging: false,
  },
  production: {
    dialect: 'sqlite' as const,
    storage: './database.sqlite',
    logging: false,
  },
};

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env as keyof typeof config];

export const sequelize = new Sequelize({
  ...dbConfig
});

export default config;