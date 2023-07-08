import { Model, DataTypes, Optional, literal, Sequelize } from "sequelize";

import { BetModel } from "./bet.model";
import { SpecialImageModel } from "./special_image.model";
import { WaifuModel } from "./waifu.model";

export interface FranchiseAttributes {
  id: number;
  name: string;
  nickname: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface FranchiseInput
  extends Optional<FranchiseAttributes, "id" | "createdAt" | "updatedAt"> {}

export interface FranchiseOutput
  extends Model<FranchiseAttributes, FranchiseInput>,
    FranchiseAttributes {
  Bets?: BetModel[];
  SpecialImages?: SpecialImageModel[];
  Waifus?: WaifuModel[];
}

export class FranchiseModel
  extends Model<FranchiseAttributes, FranchiseInput>
  implements FranchiseAttributes
{
  public id!: number;
  public name!: string;
  public nickname!: string | null;
  public createdAt!: Date;
  public updatedAt!: Date;
}

const createModel = (sequelize: Sequelize) => {
  FranchiseModel.init(
    {
      id: {
        allowNull: false,
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      nickname: {
        type: DataTypes.STRING,
        defaultValue: null,
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
      tableName: "franchises",
      timestamps: false,
      paranoid: true,
      modelName: "Franchises",
      sequelize,
    }
  );
};

export default createModel;
