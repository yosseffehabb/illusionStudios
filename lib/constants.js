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