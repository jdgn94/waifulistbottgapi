"use strict";

import { Model, Sequelize, Optional, literal, DataTypes } from "sequelize";

import SpecialImage from "./special_image";
import Waifu from "./waifu";

interface SpecialImageRelationAttributes {
  id: number;
  specialImageId: number;
  waifuId: number;
  createdAt: Date;
  updatedAt: Date;
}

interface SpecialImageRelationCreationAttributes
  extends Optional<
    SpecialImageRelationAttributes,
    "id" | "createdAt" | "updatedAt"
  > {}

export interface SpecialImageRelationInstance
  extends Model<
      SpecialImageRelationAttributes,
      SpecialImageRelationCreationAttributes
    >,
    SpecialImageRelationAttributes {}

export default (sequelize: Sequelize) => {
  const WaifuModel = Waifu(sequelize);
  const SpecialImageModel = SpecialImage(sequelize);

  const SpecialImageRelationModel =
    sequelize.define<SpecialImageRelationInstance>("special_image_relation", {
      id: {
        allowNull: false,
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      specialImageId: { type: DataTypes.INTEGER },
      waifuId: { type: DataTypes.INTEGER },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: literal("CURRENT_TIMESTAMP()"),
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: literal(
          "CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP()"
        ),
      },
    });

  SpecialImageRelationModel.hasMany(WaifuModel, {
    foreignKey: "specialImageId",
  });
  SpecialImageRelationModel.hasMany(SpecialImageModel, {
    foreignKey: "waifuId",
  });

  return SpecialImageRelationModel;
};
