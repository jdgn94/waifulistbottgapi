'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert(
			"waifus",
      [
        {
          name: 'Rin Tohsaka',
          nickname: '',
          age: 17,
          servant: 0,
          waifu_type_id: 2,
          franchise_id: 1,
          public_id: 'kqvlsisdde9k1nsvjo6f',
          image_url: 'https://res.cloudinary.com/jdgn94/image/upload/v1601933164/Waifu%20List%20Bot%20Telegram/kqvlsisdde9k1nsvjo6f.png'
        },
        {
          name: 'Ishtar',
          nickname: 'Rider',
          age: 17,
          servant: 1,
          waifu_type_id: 2,
          franchise_id: 1,
          public_id: 'hdjphyqekjdurfbiqxuq',
          image_url: 'https://res.cloudinary.com/jdgn94/image/upload/v1601933349/Waifu%20List%20Bot%20Telegram/hdjphyqekjdurfbiqxuq.jpg'
        },
        {
          name: 'Ereshkigal',
          nickname: 'Lancer',
          age: 17,
          servant: 1,
          waifu_type_id: 2,
          franchise_id: 1,
          public_id: 'pluqwyyjog5q4smzlptw',
          image_url: 'https://res.cloudinary.com/jdgn94/image/upload/v1601937170/Waifu%20List%20Bot%20Telegram/pluqwyyjog5q4smzlptw.jpg'
        },
      ]
    );
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("waifus", null, {});
  }
};
