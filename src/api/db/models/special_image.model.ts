import { Model, DataTypes, Optional, literal, Sequelize } from "sequelize";

import { FranchiseModel } from "./franchise.model";
import { ImageTypeModel } from "./image_type.model";
import { SpecialImageRelationModel } from "./special_image_relation.model";
import { UserSpecialListModel } from "./user_special_list.model";

interface SpecialImageAttributes {
  id: number;
  franchiseId: number;
  imageTypeId: number;
  points: number;
  publicId: string;
  imageUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SpecialImageInput
  extends Optional<SpecialImageAttributes, "id" | "createdAt" | "updatedAt"> {}

export interface SpecialImageOutput
  extends Model<SpecialImageAttributes, SpecialImageInput>,
    SpecialImageAttributes {
  Franchise?: FranchiseModel;
  ImageType?: ImageTypeModel;
  SpecialImageRelations?: SpecialImageRelationModel[];
  UserSpecialLists?: UserSpecialListModel[];
}

export class SpecialImageModel
  extends Model<SpecialImageAttributes, SpecialImageInput>
  implements SpecialImageAttributes
{
  public id!: number;
  public franchiseId!: number;
  public imageTypeId!: number;
  public points!: number;
  public publicId!: string;
  public imageUrl!: string;
  public createdAt!: Date;
  public updatedAt!: Date;
}

const createModel = (sequelize: Sequelize) => {
  SpecialImageModel.init(
    {
      id: {
        allowNull: false,
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      franchiseId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: FranchiseModel, key: "id" },
      },
      imageTypeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: ImageTypeModel, key: "id" },
      },
      points: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      publicId: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      imageUrl: {
        type: DataTypes.STRING,
        allowNull: true,
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
      tableName: "special_images",
      timestamps: false,
      paranoid: true,
      modelName: "SpecialImages",
      sequelize,
    }
  );

  SpecialImageModel.hasOne(FranchiseModel, {
    foreignKey: "id",
    sourceKey: "franchiseId",
    as: "Franchise",
  });
  SpecialImageModel.hasOne(ImageTypeModel, {
    foreignKey: "id",
    sourceKey: "imageTypeId",
    as: "ImageType",
  });

  FranchiseModel.hasMany(SpecialImageModel, {
    foreignKey: "franchiseId",
    sourceKey: "id",
  });
  ImageTypeModel.hasMany(SpecialImageModel, {
    foreignKey: "imageTypeId",
    sourceKey: "id",
  });
};

export default createModel;
