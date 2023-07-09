import {
  WaifuTypeAttributes,
  WaifuTypeModel,
} from "../models/waifu_type.model";

const waifuTypes: WaifuTypeAttributes[] = [
  {
    id: 1,
    name: "Loli",
    createdAt: new Date("2020-10-06 15:03:07"),
    updatedAt: new Date("2020-10-06 15:03:07"),
  },
  {
    id: 2,
    name: "Normal",
    createdAt: new Date("2020-10-06 15:03:07"),
    updatedAt: new Date("2020-10-06 15:03:07"),
  },
  {
    id: 3,
    name: "Milf",
    createdAt: new Date("2020-10-06 15:03:07"),
    updatedAt: new Date("2020-10-06 15:03:07"),
  },
  {
    id: 4,
    name: "Super Milf",
    createdAt: new Date("2020-10-06 15:03:07"),
    updatedAt: new Date("2020-10-06 15:03:07"),
  },
  {
    id: 5,
    name: "Super Loli",
    createdAt: new Date("2020-10-06 15:03:07"),
    updatedAt: new Date("2020-10-06 15:03:07"),
  },
  {
    id: 6,
    name: "Gotica",
    createdAt: new Date("2020-10-06 15:03:07"),
    updatedAt: new Date("2020-10-06 15:03:07"),
  },
  {
    id: 7,
    name: "Loli Tetona",
    createdAt: new Date("2020-10-06 15:03:07"),
    updatedAt: new Date("2020-10-06 15:03:07"),
  },
  {
    id: 8,
    name: "Tetona",
    createdAt: new Date("2020-10-06 15:03:07"),
    updatedAt: new Date("2020-10-06 15:03:07"),
  },
];

const insert = async () => {
  await WaifuTypeModel.bulkCreate(waifuTypes, { updateOnDuplicate: ["id"] });
};

export default insert;
