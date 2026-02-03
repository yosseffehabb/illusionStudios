"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {
  getCategoriesWithCounts,
  addCategory,
  deleteCategory,
} from "@/services/apiCategories";

import toast from "react-hot-toast";
import { CategoryKeys } from "@/lib/categoryKeys";

/* ================================
   Get Categories
================================ */
export function useCategories(options = {}) {
  return useQuery({
    queryKey: CategoryKeys.list(),
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
   Add Category (with Optimistic Update)
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

    onMutate: async (newCategory) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: CategoryKeys.list() });

      // Snapshot previous value
      const previousCategories = queryClient.getQueryData(CategoryKeys.list());

      // Optimistically update
      queryClient.setQueryData(CategoryKeys.list(), (old) => {
        const optimisticCategory = {
          id: `temp-${Date.now()}`,
          name: newCategory.name,
          slug: newCategory.slug,
          productCount: 0,
        };

        return [...(old || []), optimisticCategory];
      });

      return { previousCategories };
    },

    onError: (error, _variables, context) => {
      // Rollback on error
      if (context?.previousCategories) {
        queryClient.setQueryData(
          CategoryKeys.list(),
          context.previousCategories,
        );
      }
      toast.error(error?.message || "Error adding category");
    },

    onSuccess: () => {
      // Refetch to get real server data
      queryClient.invalidateQueries({ queryKey: CategoryKeys.all });
      toast.success("Category added successfully");
    },
  });
}

/* ================================
   Delete Category (with Optimistic Update)
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
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: CategoryKeys.list() });

      // Snapshot previous value
      const previousCategories = queryClient.getQueryData(CategoryKeys.list());

      // Optimistically remove from cache
      queryClient.setQueryData(CategoryKeys.list(), (old) =>
        old?.filter((cat) => cat.id !== id),
      );

      return { previousCategories };
    },

    onError: (error, _id, context) => {
      // Rollback on error
      if (context?.previousCategories) {
        queryClient.setQueryData(
          CategoryKeys.list(),
          context.previousCategories,
        );
      }
      toast.error(error?.message || "Error deleting category");
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CategoryKeys.all });
      toast.success("Category deleted successfully");
    },
  });
}
