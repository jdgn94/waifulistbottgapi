'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert(
			"franchises",
			[
				{ name: 'Fate Series', nickname: '' },
				{ name: 'Dungeon ni Deai wo Motomeru no wa Machigatte Iru Darou ka', nickname: 'Danmachi' },
				{ name: 'Re:Zero Kara Hajimeru Isekai Seikatsu', nickname: 'Re:Zero' },
				{ name: 'Konosubarashi Sekaini Shukufuku wo', nickname: 'KonoSuba' },
				{ name: 'Kanojo Okarishimasu', nickname: '' },
				{ name: 'Nekopara', nickname: '' },
				{ name: 'Domestic na Kanojo', nickname: 'Dome x Kano' },
				{ name: 'Sora no Otoshimono', nickname: '' },
				{ name: '5-toubun no Hanayome', nickname: '' },
				{ name: 'Code Geass', nickname: '' },
				{ name: 'Darling in the FranXX', nickname: '' },
				{ name: 'No Game No Life', nickname: '' },
				{ name: 'Nisekoi', nickname: '' },
				{ name: 'Ore no Imouto ga Konna ni Kawaii Wake ga Nai', nickname: 'Oreimo' },
				{ name: 'Yahari Ore no Seishun Love Come wa Machigatteiru', nickname: 'Oregairu' }
			],
			{}
		);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("franchises", null, {});
  }
};
