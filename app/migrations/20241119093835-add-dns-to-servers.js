'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('servers', 'dns', {
      type: Sequelize.STRING,
      allowNull: true, // Set to true to allow null values
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('servers', 'dns');
  }
};
