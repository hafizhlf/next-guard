import { Sequelize } from 'sequelize'; // Importing Sequelize

// Define your config type for better type checking
interface DBConfig {
  dialect: 'sqlite';
  storage: string;
  logging: boolean;
  pool: {
    max: number;
    min: number;
    acquire: number;
    idle: number;
  };
}

const config: { [key: string]: DBConfig } = {
  development: {
    dialect: 'sqlite',
    storage: './database/database.sqlite',
    logging: false,
    pool: {
      max: 1,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  },
  test: {
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false,
    pool: {
      max: 1,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  },
  production: {
    dialect: 'sqlite',
    storage: './database/database.sqlite',
    logging: false,
    pool: {
      max: 1,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  },
};

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

// Initialize Sequelize with the selected config
const sequelize = new Sequelize(dbConfig);

export { sequelize, config };  // Exporting sequelize and config for use in other parts of the app
