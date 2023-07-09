import { Model, DataTypes, Optional, literal, Sequelize } from "sequelize";

import { UserModel } from "./user.model";
import { SpecialImageModel } from "./special_image.model";

interface UserSpecialListAttributes {
  id: number;
  specialImageId: number;
  userId: number;
  createdAt: Date;
  updatedAt: Date;
}

interface UserSpecialListInput
  extends Optional<
    UserSpecialListAttributes,
    "id" | "createdAt" | "updatedAt"
  > {}

export interface UserSpecialListOutput
  extends Model<UserSpecialListAttributes, UserSpecialListInput>,
    UserSpecialListAttributes {
  SpecialImage?: SpecialImageModel;
  User?: UserModel;
}

export class UserSpecialListModel
  extends Model<UserSpecialListAttributes, UserSpecialListInput>
  implements UserSpecialListAttributes
{
  public id!: number;
  public specialImageId!: number;
  public userId!: number;
  public createdAt!: Date;
  public updatedAt!: Date;
}

const createModel = (sequelize: Sequelize) => {
  UserSpecialListModel.init(
    {
      id: {
        allowNull: false,
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      specialImageId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        references: { model: SpecialImageModel, key: "id" },
      },
      userId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        references: { model: UserModel, key: "id" },
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
      tableName: "user_special_lists",
      timestamps: false,
      paranoid: true,
      modelName: "UserSpecialLists",
      sequelize,
    }
  );

  UserSpecialListModel.hasOne(SpecialImageModel, {
    foreignKey: "id",
    sourceKey: "specialImageId",
    as: "SpecialImage",
    constraints: false,
  });
  UserSpecialListModel.hasOne(UserModel, {
    foreignKey: "id",
    sourceKey: "userId",
    as: "User",
    constraints: false,
  });

  SpecialImageModel.hasMany(UserSpecialListModel, {
    foreignKey: "specialImageId",
    sourceKey: "id",
    constraints: false,
  });
  UserModel.hasMany(UserSpecialListModel, {
    foreignKey: "userId",
    sourceKey: "id",
    constraints: false,
  });
};

export default createModel;
