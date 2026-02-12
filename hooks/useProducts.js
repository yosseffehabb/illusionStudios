"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllProducts, addNewProduct } from "@/services/apiProducts";
import toast from "react-hot-toast";
import { ProductKeys } from "@/lib/productkeys";
import { uploadImagesToCloudinary } from "@/lib/cloudinary";
import { useRouter } from "next/navigation"; // Add this import

/* ================================
   Get Products
================================ */
export function useProducts(options = {}) {
  return useQuery({
    queryKey: ProductKeys.list({}),
    queryFn: async () => {
      const result = await getAllProducts();

      if (!result?.success) {
        throw new Error(result?.error || "Failed to fetch products");
      }

      return result.products;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: Boolean(options.enabled ?? true),
  });
}

export function useAddProduct() {
  const queryClient = useQueryClient();
  const router = useRouter(); // Add this hook

  return useMutation({
    mutationFn: async ({ productData, imageFiles }) => {
      // 1. Upload images to Cloudinary first
      let imageUrls = [];
      if (imageFiles && imageFiles.length > 0) {
        try {
          imageUrls = await uploadImagesToCloudinary(imageFiles);
        } catch (error) {
          throw new Error(`Image upload failed: ${error.message}`);
        }
      }

      // 2. Add image URLs to product data
      const completeProductData = {
        ...productData,
        images: imageUrls,
      };

      // 3. Call API to create product
      const result = await addNewProduct(completeProductData);

      if (!result?.success) {
        throw new Error(result?.error || "Failed to add product");
      }

      return result.product;
    },

    onMutate: async (newProduct) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: ProductKeys.list() });

      // Snapshot previous value
      const previousProducts = queryClient.getQueryData(ProductKeys.list());

      // Optimistically update (optional - you might skip this since images need to upload)
      // queryClient.setQueryData(ProductKeys.list(), (old) => {
      //   const optimisticProduct = {
      //     id: `temp-${Date.now()}`,
      //     ...newProduct.productData,
      //   };
      //   return [...(old || []), optimisticProduct];
      // });

      return { previousProducts };
    },

    onError: (error, _variables, context) => {
      // Rollback on error
      if (context?.previousProducts) {
        queryClient.setQueryData(ProductKeys.list(), context.previousProducts);
      }
      console.error("Product creation failed:", error);
      toast.error(error?.message || "Failed to create product");
    },

    onSuccess: () => {
      // Refetch to get real server data
      queryClient.invalidateQueries({ queryKey: ProductKeys.all });
      toast.success("Product added successfully");
      router.push("/admin/products");
    },
  });
}
