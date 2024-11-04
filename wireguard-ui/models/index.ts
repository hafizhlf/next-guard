// src/models/index.ts
import { Sequelize } from 'sequelize';
import User from './user';
import config from '../config/database';

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env as keyof typeof config];

export const sequelize = new Sequelize({
  ...dbConfig
});

const models = {
  User: User
};

Object.values(models).forEach((model: any) => {
  if (model.associate) {
    model.associate(models);
  }
});

export default models;