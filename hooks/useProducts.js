"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllProducts,
  addNewProduct,
  getProductById,
  deleteProduct,
  updateProduct,
  getProductImagesById,
  getActiveProducts,
} from "@/services/apiProducts";
import toast from "react-hot-toast";
import { ProductKeys } from "@/lib/productkeys";
import { uploadImagesToCloudinary } from "@/lib/cloudinary";
import { useRouter } from "next/navigation";

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
/* ================================
   Get Active Products
================================ */
export function useActiveProducts(options = {}) {
  return useQuery({
    queryKey: ProductKeys.list({ status: "active" }),
    queryFn: async () => {
      const result = await getActiveProducts();

      if (!result?.success) {
        throw new Error(result?.error || "Failed to fetch active products");
      }

      return result.products;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: Boolean(options.enabled ?? true),
  });
}

/* ================================
   Get Product By ID
================================ */
export function useProductById(productId, options = {}) {
  return useQuery({
    queryKey: ProductKeys.detail(productId),
    queryFn: async () => {
      const result = await getProductById(productId);

      if (!result?.success) {
        throw new Error(result?.error || "Failed to fetch product");
      }

      return result.product;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: Boolean(productId && (options.enabled ?? true)),
  });
}

/* ================================
   Add Product
================================ */

// 1- process the form data
// 2-recive image files and uploadthem to claudenary
// 3-compine images urls and the data we proccessed and upload to supa
export function useAddProduct() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async ({ formData, imageFiles }) => {
      // ✅ 1. process data
      const proccessedProductData = {
        ...formData,
        price: parseFloat(formData.price),
        discount: parseInt(formData.discount),
        variants: formData.variants.map((v) => ({
          size: v.size,
          stock: parseInt(v.stock),
        })),
      };

      let uploadedImages = [];

      try {
        // ✅ 2. upload images
        if (imageFiles && imageFiles.length > 0) {
          uploadedImages = await uploadImagesToCloudinary(imageFiles);
        }

        // ✅ 3. combine data
        const finalProduct = {
          ...proccessedProductData,
          images: uploadedImages, // [{url, publicId}]
        };

        // ✅ 4. send to backend
        const result = await addNewProduct(finalProduct);

        if (!result?.success) {
          throw new Error(result?.error || "Failed to add product");
        }

        return result.product;
      } catch (error) {
        // 💣 rollback uploaded images لو حصل fail
        if (uploadedImages.length > 0) {
          try {
            await deleteImagesFromCloudinary(
              uploadedImages.map((img) => img.publicId),
            );
          } catch (cleanupError) {
            console.error("Cleanup failed:", cleanupError);
          }
        }

        throw error;
      }
    },

    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ProductKeys.list() });

      const previousProducts = queryClient.getQueryData(ProductKeys.list());

      return { previousProducts };
    },

    onError: (error, _variables, context) => {
      if (context?.previousProducts) {
        queryClient.setQueryData(ProductKeys.list(), context.previousProducts);
      }

      console.error("Product creation failed:", error);
      toast.error(error?.message || "Failed to create product");
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ProductKeys.all });

      toast.success("Product added successfully");
      router.push("/admin/products");
    },
  });
}
/* ================================
   Update Product
================================ */
export function useUpdateProduct() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async ({
      productId,
      formData,
      existingImageUrls = [],
      newImageFiles = [],
    }) => {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        discount: parseInt(formData.discount),
        variants: formData.variants.map((v) => ({
          size: v.size,
          stock: parseInt(v.stock),
        })),
      };

      let imageUrls = [...existingImageUrls];

      if (newImageFiles && newImageFiles.length > 0) {
        try {
          const uploadedUrls = await uploadImagesToCloudinary(newImageFiles);
          imageUrls = [...imageUrls, ...uploadedUrls];
        } catch (error) {
          throw new Error(`Image upload failed: ${error.message}`);
        }
      }

      if (imageUrls.length === 0) {
        throw new Error("At least one product image is required");
      }

      productData.images = imageUrls;

      const result = await updateProduct(productId, productData);

      if (!result?.success) {
        throw new Error(result?.error || "Failed to update product");
      }

      return result.product;
    },

    onMutate: async ({ productId }) => {
      await queryClient.cancelQueries({
        queryKey: ProductKeys.detail(productId),
      });
      const previousProduct = queryClient.getQueryData(
        ProductKeys.detail(productId),
      );
      return { previousProduct };
    },

    onError: (error, { productId }, context) => {
      if (context?.previousProduct) {
        queryClient.setQueryData(
          ProductKeys.detail(productId),
          context.previousProduct,
        );
      }
      console.error("Product update failed:", error);
      toast.error(error?.message || "Failed to update product");
    },

    onSuccess: (_, { productId }) => {
      queryClient.invalidateQueries({
        queryKey: ProductKeys.detail(productId),
      });
      queryClient.invalidateQueries({ queryKey: ProductKeys.list() });
      toast.success("Product updated successfully");
      router.push("/admin/products");
    },
  });
}

/* ================================
   Delete Product
================================ */
export function useDeleteProduct() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (productId, images) => {
      // The server action handles both Cloudinary deletion and DB deletion
      const result = await deleteProduct(productId, images);

      if (!result.success) {
        throw new Error(result.error || "Failed to delete product");
      }

      return result;
    },

    onMutate: async ({ productId }) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: ProductKeys.list() });

      // Snapshot previous value
      const previousProducts = queryClient.getQueryData(ProductKeys.list());

      // Optimistically remove the product from the UI
      queryClient.setQueryData(ProductKeys.list(), (old) =>
        old?.filter((product) => product.id !== productId),
      );

      return { previousProducts };
    },

    onError: (error, { productId }, context) => {
      // Rollback on error
      if (context?.previousProducts) {
        queryClient.setQueryData(ProductKeys.list(), context.previousProducts);
      }
      console.error("Product deletion failed:", error);
      toast.error(error?.message || "Failed to delete product");
    },

    onSuccess: () => {
      // Refetch to get real server data
      queryClient.invalidateQueries({ queryKey: ProductKeys.all });
      toast.success("Product deleted successfully");
      router.push("/admin/products");
    },
  });
}
