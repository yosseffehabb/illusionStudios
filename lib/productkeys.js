export const ProductKeys = {
  all: ["products"],
  list: (filters = {}) => [...ProductKeys.all, "list", filters],
  detail: (id) => [...ProductKeys.all, "detail", id],
};
