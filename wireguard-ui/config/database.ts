// config/database.ts
import { Sequelize } from 'sequelize';

export const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite',
  logging: false,
});

// export const sequelize = new Sequelize('sqlite::memory:')