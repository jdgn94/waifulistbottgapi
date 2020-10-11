'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      'waifu_lists',
      'waifu_id',
      {
        type: Sequelize.INTEGER,
        references: {
          model: 'waifus',
          key: 'id'
        },
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
      }
    );
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.removeColumn(
      'waifu_lists',
      'waifu_id'
    );
  }
};
