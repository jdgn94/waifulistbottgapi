import { Model, DataTypes, Optional, literal, Sequelize } from "sequelize";

import { SpecialImageModel } from "./special_image.model";
import { WaifuImageModel } from "./waifu_image.model";

export interface ImageTypeAttributes {
  id: number;
  name: string;
  icon: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ImageTypeInput
  extends Optional<
    ImageTypeAttributes,
    "id" | "icon" | "createdAt" | "updatedAt"
  > {}

export interface ImageTypeOutput
  extends Model<ImageTypeAttributes, ImageTypeInput>,
    ImageTypeAttributes {
  SpecialImages?: SpecialImageModel[];
  WaifuImages?: WaifuImageModel[];
}

export class ImageTypeModel
  extends Model<ImageTypeAttributes, ImageTypeInput>
  implements ImageTypeInput
{
  public id!: number;
  public name!: string;
  public icon!: string;
  public createdAt!: Date;
  public updatedAt!: Date;
}

const createModel = (sequelize: Sequelize) => {
  ImageTypeModel.init(
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      icon: {
        type: DataTypes.STRING,
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
      tableName: "image_types",
      timestamps: false,
      paranoid: true,
      modelName: "ImageTypes",
      sequelize,
    }
  );
};

export default createModel;
