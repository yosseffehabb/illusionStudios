// lib/orderKeys.js

/**
 * Centralized React Query keys for orders
 * Ensures consistency between server prefetch and client hooks
 */
export const orderKeys = {
  all: ["orders"],

  /**
   * Infinite query key with normalized filters
   */
  infinite: (filters = {}) => {
    const normalized = {
      status: filters.status || null,
    };
    return [...orderKeys.all, "infinite", normalized];
  },

  /**
   * Search query key with normalized filters
   */
  search: (query = "", filters = {}) => {
    const normalized = {
      status: filters.status || null,
    };
    return [...orderKeys.all, "search", query, normalized];
  },

  /**
   * Stats query key
   */
  stats: () => [...orderKeys.all, "stats"],

  /**
   * Detail queries
   */
  details: () => [...orderKeys.all, "detail"],
  detail: (id) => [...orderKeys.details(), id],

  /**
   * Customer queries (public)
   */
  byPhone: (phone) => [...orderKeys.all, "customer", "phone", phone],
  byOrderNumber: (orderNumber) => [
    ...orderKeys.all,
    "customer",
    "orderNumber",
    orderNumber,
  ],
};