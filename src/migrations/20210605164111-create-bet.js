'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('bets', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_info_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'user_infos',
          key: 'id'
        },
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
      },
      franchise_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'franchises',
          key: 'id'
        },
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
      },
      quantity: {
        type: Sequelize.INTEGER
      },
      active: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP()')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP()')
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('bets');
  }
};