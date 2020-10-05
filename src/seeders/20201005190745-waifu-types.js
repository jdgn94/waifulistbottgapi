'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert(
			"waifu_types",
      [
        { name: 'Loli' },
        { name: 'Normal' },
        { name: 'Opaisosa' },
        { name: 'Super opaisosa' }
      ]
    );
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("waifu_types", null, {});
  }
};
