import { GardenItem, GardenSeed } from "@cass-commands/grow_garden";
import { gardenShop } from "./GardenShop";

export interface ShopItem {
  icon: string;
  name: string;
  key: string;
  flavorText: string;
  price: number;
  rarity: string;
  stockLimit?: number;
  stockChance: number;
  inStock: boolean;
  onPurchase: (args: { moneySet: { inventory: GardenItem[] } }) => void;
  [key: string]: unknown;
}

export interface ItemBalanceResult {
  name: string;
  key: string;
  score: number;
  price: number;
  baseValue: number;
  harvests: number;
  growthTime: number;
  pricePerHarvest: number;
  profitPerHarvest: number;
  timeEfficiency: number;
  costEfficiency: number;
  rarity: string;
  item: GardenSeed;
  stockChance: number;
}
export function evaluateItemBalance(
  shopItem: gardenShop.GardenShopItem
): ItemBalanceResult | null {
  let inventoryItem: GardenItem | null = null;
  const mockMoneySet = {
    inventory: [] as GardenItem[],
  };

  shopItem.onPurchase({ moneySet: mockMoneySet });
  inventoryItem = mockMoneySet.inventory[0] || null;

  if (
    !inventoryItem ||
    inventoryItem.type !== "gardenSeed" ||
    !inventoryItem.cropData
  ) {
    return null;
  }

  const { cropData, name, key } = inventoryItem;
  const { baseValue, growthTime, harvests, yields = 1 } = cropData;
  const { price, rarity } = shopItem;

  const totalYields = yields;
  const harvestsPerYield = Math.floor(harvests / yields);
  const totalHarvests = harvestsPerYield * totalYields;

  // const totalValue = baseValue * totalYields;
  const pricePerYield = price / totalHarvests;
  const profitPerYield = baseValue - pricePerYield;
  const totalProfit = profitPerYield * totalYields;

  const totalGrowthTime = growthTime * totalYields;
  const timeEfficiency = totalProfit / totalGrowthTime;
  const costEfficiency = totalProfit / price;

  const score =
    (profitPerYield * 0.4 +
      timeEfficiency * 0.3 +
      costEfficiency * 0.2 +
      baseValue * 0.1) /
    10;

  return {
    name,
    key,
    score: Number(score.toFixed(6)),
    price,
    baseValue,
    harvests,
    growthTime,
    pricePerHarvest: Number((price / totalHarvests).toFixed(2)),
    profitPerHarvest: Number((totalProfit / totalHarvests).toFixed(2)),
    timeEfficiency: Number(timeEfficiency.toFixed(8)),
    costEfficiency: Number(costEfficiency.toFixed(2)),
    rarity,
    stockChance: shopItem.stockChance,
    item: inventoryItem,
  };
}
