"use strict";

import { Model, Sequelize, Optional, literal, DataTypes } from "sequelize";

interface SpecialImageAttributes {
  id: number;
  franchiseId: number;
  publicId: string;
  imageUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

interface SpecialImageCreationAttributes
  extends Optional<SpecialImageAttributes, "id" | "createdAt" | "updatedAt"> {}

export interface SpecialImageInstance
  extends Model<SpecialImageAttributes, SpecialImageCreationAttributes>,
    SpecialImageAttributes {}

export default (sequelize: Sequelize) => {
  const SpecialImageModel = sequelize.define<SpecialImageInstance>(
    "special_image",
    {
      id: {
        allowNull: false,
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      franchiseId: { type: DataTypes.INTEGER },
      publicId: { type: DataTypes.STRING },
      imageUrl: { type: DataTypes.STRING },
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
    }
  );

  SpecialImageModel.hasMany(sequelize.models.franchise, {
    foreignKey: "franchiseId",
  });

  return SpecialImageModel;
};
