"use server";
import {
  deleteImagesFromCloudinary,
  uploadImagesToCloudinary,
} from "@/lib/cloudinary";
import { createClient } from "@/lib/supabase/server";

async function checkAdminAuth() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        authorized: false,
        error: "Not authenticated. Please log in.",
      };
    }

    const { data: adminUser, error: adminError } = await supabase
      .from("admin_users")
      .select("id, email, full_name")
      .eq("id", user.id)
      .maybeSingle();

    if (adminError) {
      console.error("Error checking admin status:", adminError);
      return {
        authorized: false,
        error: "Failed to verify admin access",
      };
    }

    if (!adminUser) {
      return {
        authorized: false,
        error: "Unauthorized - Admin access required",
      };
    }

    return {
      authorized: true,
      user: {
        ...user,
        is_admin: true,
        full_name: adminUser.full_name,
      },
    };
  } catch (error) {
    console.error("Auth check error:", error);
    return {
      authorized: false,
      error: "Authentication error occurred",
    };
  }
}

/* ================================
   Get All Products
================================ */
export async function getAllProducts() {
  try {
    const auth = await checkAdminAuth();
    if (!auth.authorized) {
      return {
        success: false,
        products: [],
        error: auth.error,
      };
    }

    const supabase = await createClient();

    const { data: products, error } = await supabase
      .from("products")
      .select(
        `
          *,
          category:categories (
            id,
            name,
            slug
          ),
          variants:product_variants (
            id,
            size,
            stock
          )
        `,
      )
      .order("created_at", { ascending: false });

    if (error) throw error;

    return { success: true, products: products || [] };
  } catch (error) {
    console.error("Error fetching products:", error.message);
    return { success: false, products: [], error: error.message };
  }
}

/* ================================
   Add New Product
================================ */

export async function addNewProduct(proccessedProductData, imageFiles) {
  try {
    const auth = await checkAdminAuth();
    if (!auth.authorized) {
      return {
        success: false,
        error: auth.error,
      };
    }
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
    const productData = {
      ...proccessedProductData,
      images: imageUrls,
    };

    const supabase = await createClient();
    const { data: product, error: productError } = await supabase
      .from("products")
      .insert({
        name: productData.name,
        description: productData.description,
        price: productData.price,
        discount: productData.discount,
        color: productData.color,
        category_id: productData.category_id,
        status: productData.status,
        size_type: productData.size_type,
        images: productData.images,
      })
      .select()
      .single();

    if (productError) {
      throw new Error(`Failed to create product: ${productError.message}`);
    }

    // Insert product variants
    if (productData.variants && productData.variants.length > 0) {
      const variantsToInsert = productData.variants.map((variant) => ({
        product_id: product.id,
        size: variant.size,
        stock: variant.stock,
      }));

      const { error: variantsError } = await supabase
        .from("product_variants")
        .insert(variantsToInsert);

      if (variantsError) {
        await supabase.from("products").delete().eq("id", product.id);
        throw new Error(`Failed to create variants: ${variantsError.message}`);
      }
    }

    // ✅ Return success response
    return { success: true, product };
  } catch (error) {
    console.error("Error adding new product:", error.message);
    return { success: false, error: error.message };
  }
}

/* ================================
   Edit Product
================================ */

export async function updateProduct(productId, productData) {
  try {
    const auth = await checkAdminAuth();
    if (!auth.authorized) {
      return {
        success: false,
        error: auth.error,
      };
    }

    const supabase = await createClient();

    // Update the product
    const { data: product, error: productError } = await supabase
      .from("products")
      .update({
        name: productData.name,
        description: productData.description,
        price: productData.price,
        discount: productData.discount,
        color: productData.color,
        category_id: productData.category_id,
        status: productData.status,
        size_type: productData.size_type,
        images: productData.images,
      })
      .eq("id", productId)
      .select()
      .single();

    if (productError) {
      throw new Error(`Failed to update product: ${productError.message}`);
    }

    // Handle variants update
    if (productData.variants && productData.variants.length > 0) {
      // Delete existing variants
      const { error: deleteError } = await supabase
        .from("product_variants")
        .delete()
        .eq("product_id", productId);

      if (deleteError) {
        throw new Error(
          `Failed to delete old variants: ${deleteError.message}`,
        );
      }

      // Insert new variants
      const variantsToInsert = productData.variants.map((variant) => ({
        product_id: productId,
        size: variant.size,
        stock: variant.stock,
      }));

      const { error: variantsError } = await supabase
        .from("product_variants")
        .insert(variantsToInsert);

      if (variantsError) {
        throw new Error(`Failed to create variants: ${variantsError.message}`);
      }
    }

    return { success: true, product };
  } catch (error) {
    console.error("Error editing product:", error.message);
    return { success: false, error: error.message };
  }
}

/* ================================
   Get Product By ID
================================ */

export async function getProductById(productId) {
  try {
    const supabase = await createClient();

    const { data: product, error } = await supabase
      .from("products")
      .select(
        `
          *,
          category:categories (
            id,
            name,
            slug
          ),
          variants:product_variants (
            id,
            size,
            stock
          )
        `,
      )
      .eq("id", productId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return {
          success: false,
          product: null,
          error: "Product not found",
        };
      }
      throw error;
    }

    return { success: true, product };
  } catch (error) {
    console.error("Error fetching product:", error.message);
    return { success: false, product: null, error: error.message };
  }
}
export async function deleteProduct(productId, imagesArray) {
  // ...auth check...

  // Delete from Cloudinary using the images we already have
  if (imagesArray && imagesArray.length > 0) {
    try {
      await deleteImagesFromCloudinary(imagesArray);
    } catch (error) {
      console.error("❌ Failed to delete images from Cloudinary:", error);
    }
  }

  const supabase = await createClient();

  // Delete variants
  await supabase.from("product_variants").delete().eq("product_id", productId);

  // Delete product
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", productId);
  if (error) throw new Error(`Failed to delete product: ${error.message}`);

  return { success: true, message: "Product deleted successfully" };
}
/* ================================
   Get Product Images By ID
================================ */

export async function getProductImagesById(productId) {
  try {
    const auth = await checkAdminAuth();
    if (!auth.authorized) {
      return {
        success: false,
        images: [],
        error: auth.error,
      };
    }

    const supabase = await createClient();

    const { data: product, error } = await supabase
      .from("products")
      .select("images")
      .eq("id", productId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return {
          success: false,
          images: [],
          error: "Product not found",
        };
      }
      throw error;
    }

    return {
      success: true,
      images: product.images || [],
    };
  } catch (error) {
    console.error("Error fetching product images:", error.message);
    return {
      success: false,
      images: [],
      error: error.message,
    };
  }
}

// actions/products.js (or wherever your public actions are)
export async function getActiveProducts() {
  try {
    const supabase = await createClient();

    const { data: products, error } = await supabase
      .from("products")
      .select(
        `
          *,
          category:categories (
            id,
            name,
            slug
          ),
          variants:product_variants (
            id,
            size,
            stock
          )
        `,
      )
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return { success: true, products: products || [] };
  } catch (error) {
    console.error("Error fetching active products:", error.message);
    return { success: false, products: [], error: error.message };
  }
}
