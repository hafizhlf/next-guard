'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('servers', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false,
      },
      private_key: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      public_key: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      ip_address: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false,
      },
      public_ip: {
        type: Sequelize.STRING,
        unique: false,
        allowNull: true,
      },
      port: {
        type: Sequelize.INTEGER,
        unique: true,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('Online', 'Offline', 'Maintenance'),
        defaultValue: 'Offline',
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        onUpdate: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('servers');
  }
};
