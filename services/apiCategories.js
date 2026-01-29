"use server"
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function checkAdminAuth() {
    try {
      const supabase = await createClient();
  
      // Get current user
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
  
      // Check if user exists in admin_users table
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

  export async function getCategoriesWithCounts() {
    try {

        const auth = await checkAdminAuth();
        if (!auth.authorized) {
          return {
            success: false,
            categories: [],
            error: auth.error,
          };
        }

      const supabase = await createClient();
  
      const { data: categories, error } = await supabase
        .from("categories")
        .select("*")
        .order("name", { ascending: true });
  
      if (error) throw error;
  
      const categoriesWithCounts = await Promise.all(
        categories.map(async (category) => {
          const { count, error: countError } = await supabase
            .from("products")
            .select("*", { count: "exact", head: true })
            .eq("category_id", category.id);
  
          return {
            ...category,
            productCount: countError ? 0 : count || 0,
          };
        })
      );
  
      return { success: true, categories: categoriesWithCounts };
    } catch (error) {
      console.error("Error fetching categories with counts:", error.message);
      return { success: false, categories: [], error: error.message };
    }
  }


//   * ---------------------- Add Category ---------------------- */
export async function addCategory({ name, slug }) {
  try {
    const auth = await checkAdminAuth();
    if (!auth.authorized) {
      return {
        success: false,
        category: null,
        error: auth.error,
      };
    }
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("categories")
      .insert({ name, slug })
      .select()
      .single();

    if (error) throw error;

    // Revalidate categories page
    revalidatePath("/admin/categories");

    return { success: true, category: data };
  } catch (error) {
    console.error("Error adding category:", error.message);
    return { success: false, category: null, error: error.message };
  }
}

/* ---------------------- Delete Category ---------------------- */
export async function deleteCategory(id) {
    const auth = await checkAdminAuth();
    if (!auth.authorized) {
      return {
        success: false,
        deleted: [],
        error: auth.error,
      };
    }
  try {
    const supabase = await createClient();

    // Check if category has products
    const { count, error: countError } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("category_id", id);

    if (countError) throw countError;

    if (count > 0) {
      throw new Error(
        `Cannot delete category. ${count} product(s) are using it.`
      );
    }

    // Delete category
    const { data, error } = await supabase
      .from("categories")
      .delete()
      .eq("id", id);

    if (error) throw error;

    // Revalidate categories page
    revalidatePath("/admin/categories");

    return { success: true, deleted: data || [] };
  } catch (error) {
    console.error("Error deleting category:", error.message);
    return { success: false, deleted: [], error: error.message };
  }
}
