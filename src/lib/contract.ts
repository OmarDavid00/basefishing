import type { Address, Hex } from "viem";

export const CONTRACT_ADDRESS =
  "0xE93b6f5fd4c34Ddd7Cc708cC75D92aD8B8D72020" as Address;

export const BUILDER_CODE = "bc_0olsigbg";

export const DATA_SUFFIX =
  "0x62635f306f6c73696762670b0080218021802180218021802180218021" as Hex;

export const FISHING_ITEMS = [
  "Small Salmon",
  "Golden Tuna",
  "Crystal Fish",
  "Ancient Shark",
  "Ghost Jellyfish",
  "Alien Rubber Duck",
  "Tiny Fish",
  "Blue Sardine",
  "Silver Carp",
  "Dark Ocean Box",
  "Broken Pirate Clock",
] as const;

export const fishingAbi = [
  {
    type: "function",
    name: "dailyFishing",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [],
  },
  {
    type: "function",
    name: "deepSeaFishing",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [],
  },
  {
    type: "function",
    name: "getPlayer",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [
      { name: "totalCatches", type: "uint256" },
      { name: "totalFish", type: "uint256" },
      { name: "totalRareFish", type: "uint256" },
      { name: "totalLegendaryFish", type: "uint256" },
      { name: "totalStrangeItems", type: "uint256" },
      { name: "combo", type: "uint256" },
      { name: "highestCombo", type: "uint256" },
      { name: "fishingXP", type: "uint256" },
      { name: "title", type: "string" },
    ],
  },
  {
    type: "function",
    name: "hasDiscovered",
    stateMutability: "view",
    inputs: [
      { name: "user", type: "address" },
      { name: "item", type: "string" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    type: "function",
    name: "getHistoryLength",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "getHistoryRecord",
    stateMutability: "view",
    inputs: [
      { name: "user", type: "address" },
      { name: "index", type: "uint256" },
    ],
    outputs: [
      { name: "timestamp", type: "uint256" },
      { name: "itemName", type: "string" },
      { name: "rarity", type: "uint256" },
      { name: "isDailyFishing", type: "bool" },
    ],
  },
  {
    type: "function",
    name: "getTopFisher",
    stateMutability: "view",
    inputs: [],
    outputs: [
      { name: "player", type: "address" },
      { name: "catches", type: "uint256" },
    ],
  },
  {
    type: "function",
    name: "getTopLegendHunter",
    stateMutability: "view",
    inputs: [],
    outputs: [
      { name: "player", type: "address" },
      { name: "legendaryFish", type: "uint256" },
    ],
  },
  {
    type: "function",
    name: "totalPlatformCatches",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "totalLegendaryCaught",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "totalStrangeItemsFound",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "event",
    name: "FishCaught",
    inputs: [
      { name: "player", type: "address", indexed: true },
      { name: "itemName", type: "string", indexed: false },
      { name: "rarity", type: "uint256", indexed: false },
    ],
  },
] as const;
