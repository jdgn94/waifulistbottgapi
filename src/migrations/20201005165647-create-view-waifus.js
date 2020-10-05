'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(`
      CREATE OR REPLACE VIEW view_waifus AS
        SELECT 
          w.id AS waifu_id,
          w.name,
          w.nickname,
          w.age,
          w.servant,
          w.image_url,
          wt.id AS waifu_type_id,
          wt.name AS waifu_type_name,
          f.id AS franchise_id,
          f.name AS franchise_name,
          f.nickname AS franchise_nickname
        FROM
          waifus AS w
          INNER JOIN waifu_types AS wt ON wt.id = w.waifu_type_id 
          INNER JOIN franchises AS f ON f.id = w.franchise_id 
    `);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query('DROP VIEW view_waifus;');
  }
};
