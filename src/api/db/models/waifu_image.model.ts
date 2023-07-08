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
  // public waifuRarityId!: number;
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
        type: DataTypes.INTEGER,
        allowNull: true,
        autoIncrement: true,
        primaryKey: true,
      },
      // waifuRarityId: {
      //   type: DataTypes.INTEGER,
      //   allowNull: true,
      //   references: { model: WaifuRarityModel, key: "id" },
      // },
      imageTypeId: {
        type: DataTypes.INTEGER,
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
      // indexes: [
      //   {
      //     name: "waifu_images",
      //     fields: [{ name: "waifu_rarity  _id" }, { name: "image_type_id" }],
      //     unique: true,
      //   },
      // ],
      sequelize,
    }
  );

  // WaifuImageModel.hasOne(WaifuRarityModel, {
  //   foreignKey: "id",
  //   sourceKey: "waifuRarityId",
  //   as: "WaifuRarity",
  // });
  WaifuImageModel.hasOne(ImageTypeModel, {
    foreignKey: "id",
    sourceKey: "imageTypeId",
    as: "ImageType",
  });

  // WaifuRarityModel.hasOne(WaifuImageModel, {
  //   foreignKey: "waifuRarityId",
  //   sourceKey: "id",
  //   as: "WaifuImage",
  // });
  ImageTypeModel.hasMany(WaifuImageModel, {
    foreignKey: "imageTypeId",
    sourceKey: "id",
  });
};

export default createModel;
