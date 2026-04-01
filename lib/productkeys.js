export const ProductKeys = {
  all: ["products"],
  list: (filters = {}) => [...ProductKeys.all, "list", filters],
  activeList: () => [...ProductKeys.all, "active", "list"],
  activeDetail: (id) => [...ProductKeys.all, "active", "detail", id],
  detail: (id) => [...ProductKeys.all, "detail", id],
};
