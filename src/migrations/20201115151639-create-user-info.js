'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('user_infos', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
      },
      chat_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'chats',
          key: 'id'
        },
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
      },
      level: {
        type: Sequelize.INTEGER,
        defaultValue: 1
      },
      points: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      exp: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      limit_exp: {
        type: Sequelize.INTEGER,
        defaultValue: 100
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
    await queryInterface.dropTable('user_infos');
  }
};