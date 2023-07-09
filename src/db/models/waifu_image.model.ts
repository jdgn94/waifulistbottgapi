import { Model, DataTypes, Optional, literal, Sequelize } from "sequelize";

import { WaifuRarityModel } from "./waifu_rarity.model";
import { ImageTypeModel } from "./image_type.model";

export interface WaifuImageAttributes {
  id: number;
  // waifuRarityId: number;
  imageTypeId: number;
  publicId: string;
  publicUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WaifuImageInput
  extends Optional<WaifuImageAttributes, "id" | "createdAt" | "updatedAt"> {}

export interface WaifuImageOutput
  extends Model<WaifuImageAttributes, WaifuImageInput>,
    WaifuImageAttributes {
  ImageType?: ImageTypeModel;
  WaifuRarity?: WaifuRarityModel;
}

export class WaifuImageModel
  extends Model<WaifuImageAttributes, WaifuImageInput>
  implements WaifuImageInput
{
  public id!: number;
  public imageTypeId!: number;
  public publicId!: string;
  public publicUrl!: string;
  public createdAt!: Date;
  public updatedAt!: Date;
}

const createModel = (sequelize: Sequelize) => {
  WaifuImageModel.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        autoIncrement: true,
        primaryKey: true,
      },
      imageTypeId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        references: { model: ImageTypeModel, key: "id" },
      },
      publicId: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },
      publicUrl: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: literal("CURRENT_TIMESTAMP()"),
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: literal("CURRENT_TIMESTAMP()"),
        onUpdate: "NOW()",
      },
    },
    {
      tableName: "waifu_images",
      timestamps: false,
      paranoid: true,
      modelName: "WaifuImages",
      sequelize,
    }
  );

  WaifuImageModel.hasOne(ImageTypeModel, {
    foreignKey: "id",
    sourceKey: "imageTypeId",
    as: "ImageType",
    constraints: false,
  });

  ImageTypeModel.hasMany(WaifuImageModel, {
    foreignKey: "imageTypeId",
    sourceKey: "id",
    constraints: false,
  });
};

export default createModel;
