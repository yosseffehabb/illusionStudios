"use server";
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
