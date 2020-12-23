'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class special_image_relation extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  special_image_relation.init({
    special_image_id: DataTypes.INTEGER,
    waifu_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'special_image_relation',
  });
  return special_image_relation;
};