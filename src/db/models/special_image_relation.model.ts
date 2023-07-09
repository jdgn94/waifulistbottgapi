import { Model, DataTypes, Optional, literal, Sequelize } from "sequelize";

import { SpecialImageModel } from "./special_image.model";
import { WaifuRarityModel } from "./waifu_rarity.model";

interface SpecialImageRelationAttributes {
  id: number;
  specialImageId: number;
  waifuRarityId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SpecialImageRelationInput
  extends Optional<
    SpecialImageRelationAttributes,
    "id" | "createdAt" | "updatedAt"
  > {}

export interface SpecialImageRelationOutput
  extends Model<SpecialImageRelationAttributes, SpecialImageRelationInput>,
    SpecialImageRelationAttributes {
  SpecialImage?: SpecialImageModel;
  WaifuRarity?: WaifuRarityModel;
}

export class SpecialImageRelationModel
  extends Model<SpecialImageRelationAttributes, SpecialImageRelationInput>
  implements SpecialImageRelationAttributes
{
  public id!: number;
  public specialImageId!: number;
  public waifuRarityId!: number;
  public createdAt!: Date;
  public updatedAt!: Date;
}

const createModel = (sequelize: Sequelize) => {
  SpecialImageRelationModel.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      specialImageId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: SpecialImageModel, key: "id" },
      },
      waifuRarityId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: WaifuRarityModel, key: "id" },
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: literal("CURRENT_TIMESTAMP()"),
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: literal("CURRENT_TIMESTAMP()"),
        onUpdate: "NOW()",
      },
    },
    {
      tableName: "special_image_relations",
      timestamps: false,
      paranoid: true,
      modelName: "SpecialImageRelations",
      sequelize,
    }
  );

  SpecialImageRelationModel.hasOne(SpecialImageModel, {
    foreignKey: "id",
    sourceKey: "specialImageId",
    as: "SpecialImage",
    constraints: false,
  });
  SpecialImageRelationModel.hasOne(WaifuRarityModel, {
    foreignKey: "id",
    sourceKey: "waifuRarityId",
    as: "WaifuRarity",
    constraints: false,
  });

  SpecialImageModel.hasMany(SpecialImageRelationModel, {
    foreignKey: "specialImageId",
    sourceKey: "id",
    constraints: false,
  });
  WaifuRarityModel.hasMany(SpecialImageRelationModel, {
    foreignKey: "waifuRarityId",
    sourceKey: "id",
    constraints: false,
  });
};

export default createModel;
