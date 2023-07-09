import { WaifuImageModel, WaifuImageOutput } from "../models/waifu_image.model";
import { WaifuRarityModel } from "../models/waifu_rarity.model";

import { getRandom } from "../../bot/utils/utils";

const getRandomWaifuByType = async (imageTypeId: number) => {
  try {
    const waifuImages = (await WaifuImageModel.findAll({
      include: [{ model: WaifuRarityModel, as: "WaifuRarity" }],
      where: { imageTypeId },
    })) as WaifuImageOutput[];

    const position = getRandom(1, waifuImages.length);

    return waifuImages[position];
  } catch (error) {
    logger.error(`${error}: File waifus.utils; Function getRandomWaifuByType`);
    throw error;
  }
};

export default { getRandomWaifuByType };
