'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn(
        'user_infos',
        'favorite_pages',
        {
          defaultValue: 1,
          type: Sequelize.INTEGER,
        }
      ),
      queryInterface.addColumn(
        'user_infos',
        'favorite_pages_purchases',
        {
          defaultValue: 0,
          type: Sequelize.INTEGER,
        }
      ),
      queryInterface.addColumn(
        'user_infos',
        'exp_multipler',
        {
          defaultValue: 1,
          type: Sequelize.DOUBLE,
        }
      ),
      queryInterface.addColumn(
        'user_infos',
        'exp_multipler_expire',
        {
          type: Sequelize.DATE,
        }
      ),
      queryInterface.addColumn(
        'user_infos',
        'total_bets',
        {
          type: Sequelize.INTEGER,
          defaultValue: 0,
        }
      ),
      queryInterface.addColumn(
        'user_infos',
        'total_bets_won',
        {
          type: Sequelize.INTEGER,
          defaultValue: 0,
        }
      ),
      queryInterface.addColumn(
        'user_infos',
        'total_bets_lost',
        {
          type: Sequelize.INTEGER,
          defaultValue: 0,
        }
      ),
      queryInterface.addColumn(
        'user_infos',
        'total_bets_points',
        {
          type: Sequelize.INTEGER,
          defaultValue: 0,
        }
      ),
      queryInterface.addColumn(
        'user_infos',
        'total_bets_points_won',
        {
          type: Sequelize.INTEGER,
          defaultValue: 0,
        }
      ),
      queryInterface.addColumn(
        'user_infos',
        'jail',
        {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        }
      ),
      queryInterface.addColumn(
        'user_infos',
        'jail_expire',
        {
          type: Sequelize.DATE
        }
      )
    ])
  },

  down: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('user_infos', 'favorite_pages'),
      queryInterface.removeColumn('user_infos', 'favorite_pages_purchases'),
      queryInterface.removeColumn('user_infos', 'exp_multipler'),
      queryInterface.removeColumn('user_infos', 'exp_multipler_expire'),
      queryInterface.removeColumn('user_infos', 'total_bets'),
      queryInterface.removeColumn('user_infos', 'total_bets_won'),
      queryInterface.removeColumn('user_infos', 'total_bets_lost'),
      queryInterface.removeColumn('user_infos', 'total_bets_points'),
      queryInterface.removeColumn('user_infos', 'total_bets_points_won'),
      queryInterface.removeColumn('user_infos', 'jail'),
      queryInterface.removeColumn('user_infos', 'jail_expire')
    ]);
  }
};
