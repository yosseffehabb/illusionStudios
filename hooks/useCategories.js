"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  getCategoriesWithCounts,
  addCategory,
  deleteCategory,
} from "@/services/apiCategories";
import toast from "react-hot-toast";

/* ================================
   Query Keys
================================ */
const categoryKeys = {
  all: ["categories"],
  list: () => ["categories", "list"],
};

/* ================================
   Get Categories
================================ */
export function useCategories(options = {}) {
  return useQuery({
    queryKey: categoryKeys.list(),
    queryFn: async () => {
      const result = await getCategoriesWithCounts();

      if (!result?.success) {
        throw new Error(result?.error || "Failed to fetch categories");
      }

      return result.categories;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: Boolean(options.enabled ?? true),
  });
}

/* ================================
   Add Category
================================ */
export function useAddCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, slug }) => {
      const result = await addCategory({ name, slug });

      if (!result?.success) {
        throw new Error(result?.error || "Failed to add category");
      }

      return result.category;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      toast.success("category is added successfully")
    },
    onError: (_error, _id, context) => {
        if (context?.previousCategories) {
          queryClient.setQueryData(
            categoryKeys.list(),
            context.previousCategories
          );
        }
        toast.error("there is an error adding category")
      },
  });
}

/* ================================
   Delete Category
================================ */
export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const result = await deleteCategory(id);

      if (!result?.success) {
        throw new Error(result?.error || "Failed to delete category");
      }

      return id;
    },

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: categoryKeys.list() });

      const previousCategories =
        queryClient.getQueryData(categoryKeys.list());

      queryClient.setQueryData(categoryKeys.list(), (old) =>
        old?.filter((cat) => cat.id !== id)
      );

      return { previousCategories };
    },

    onError: (_error, _id, context) => {
      if (context?.previousCategories) {
        queryClient.setQueryData(
          categoryKeys.list(),
          context.previousCategories
        );
      }
      toast.error("there is an error deleting category")
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      toast.success("category is deleted successfully")
    },
  });
}
