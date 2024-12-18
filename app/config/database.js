const config = {
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

module.exports = dbConfig
