import { Sequelize, Dialect } from 'sequelize'
import dbConfig from '@/config/database'

const sequelize = new Sequelize({
  dialect: dbConfig.dialect as Dialect,
  storage: dbConfig.storage,
  logging: dbConfig.logging,
  pool: dbConfig.pool,
});

export { sequelize };
