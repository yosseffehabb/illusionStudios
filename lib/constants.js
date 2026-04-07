// lib/constants.js

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 50,
  SEARCH_DEBOUNCE_MS: 300,
  INFINITE_SCROLL_THRESHOLD: "100px",
};

export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "out_for_delivery",
  "delivered",
  "cancelled",
];

export const PRODUCT_STATUS = ["active", "offline"];
export const PRODUCT_SIZE_TYPE = ["numeric", "letter"];

export const RATE_LIMITS = {
  PUBLIC_PHONE_SEARCH: {
    MAX_REQUESTS: 10,
    WINDOW_MS: 60000, // 1 minute
  },
  PUBLIC_ORDER_NUMBER: {
    MAX_REQUESTS: 20,
    WINDOW_MS: 60000,
  },
};

export const CACHE_TIMES = {
  STATS: {
    STALE_TIME: 1000 * 60 * 5, // 5 minutes
    GC_TIME: 1000 * 60 * 10, // 10 minutes
  },
  ORDERS: {
    STALE_TIME: 1000 * 60 * 2, // 2 minutes
    GC_TIME: 1000 * 60 * 5, // 5 minutes
  },
  SEARCH: {
    STALE_TIME: 1000 * 60 * 1, // 1 minute
    GC_TIME: 1000 * 60 * 3, // 3 minutes
  },
};

export const GOVERNORATES = [
  { id: 1, name: "Cairo", shipping_fee: 100 },
  { id: 2, name: "Giza", shipping_fee: 100 },
  { id: 3, name: "Alexandria", shipping_fee: 100 },
  { id: 4, name: "Dakahlia", shipping_fee: 100 },
  { id: 5, name: "Red Sea", shipping_fee: 100 },
  { id: 6, name: "Beheira", shipping_fee: 100 },
  { id: 7, name: "Fayoum", shipping_fee: 100 },
  { id: 8, name: "Gharbia", shipping_fee: 100 },
  { id: 9, name: "Ismailia", shipping_fee: 100 },
  { id: 10, name: "Menofia", shipping_fee: 100 },
  { id: 11, name: "Minya", shipping_fee: 100 },
  { id: 12, name: "Qalyubia", shipping_fee: 100 },
  { id: 13, name: "New Valley", shipping_fee: 100 },
  { id: 14, name: "Suez", shipping_fee: 100 },
  { id: 15, name: "Aswan", shipping_fee: 100 },
  { id: 16, name: "Assiut", shipping_fee: 100 },
  { id: 17, name: "Beni Suef", shipping_fee: 100 },
  { id: 18, name: "Port Said", shipping_fee: 100 },
  { id: 19, name: "Damietta", shipping_fee: 100 },
  { id: 20, name: "Sharkia", shipping_fee: 100 },
  { id: 21, name: "South Sinai", shipping_fee: 100 },
  { id: 22, name: "Kafr El Sheikh", shipping_fee: 100 },
  { id: 23, name: "Matrouh", shipping_fee: 100 },
  { id: 24, name: "Luxor", shipping_fee: 100 },
  { id: 25, name: "Qena", shipping_fee: 100 },
  { id: 26, name: "North Sinai", shipping_fee: 100 },
  { id: 27, name: "Sohag", shipping_fee: 100 },
];
