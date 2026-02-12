"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { rateLimit } from "@/lib/utils/rateLimit";
import {
  sanitizeSearchInput,
  sanitizePhone,
  isValidPhone,
} from "@/lib/utils/orderHelpers";
import { RATE_LIMITS, PAGINATION } from "@/lib/constants";

// ============================================
// AUTHENTICATION HELPER
// ============================================

/**
 * Check if current user is authenticated as admin
 * Uses your existing auth setup with admin_users table
 */
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

// ============================================
// PUBLIC FUNCTIONS (Customer-facing)
// ============================================

/**
 * PUBLIC: Get orders by phone number (for customers)
 * Rate-limited to prevent abuse
 */
export async function getOrdersByPhone(phone) {
  try {
    // Validate input
    if (!phone || !isValidPhone(phone)) {
      return {
        success: false,
        orders: [],
        error: "Please enter a valid phone number",
      };
    }

    // Sanitize phone
    const sanitized = sanitizePhone(phone);

    // Rate limiting - 10 requests per minute per phone
    const limit = rateLimit(
      `phone:${sanitized}`,
      RATE_LIMITS.PUBLIC_PHONE_SEARCH.MAX_REQUESTS,
      RATE_LIMITS.PUBLIC_PHONE_SEARCH.WINDOW_MS,
    );

    if (!limit.allowed) {
      return {
        success: false,
        orders: [],
        error: `Too many requests. Please try again in ${limit.retryAfter} seconds.`,
      };
    }

    const supabase = await createClient();

    const { data: orders, error } = await supabase
      .from("orders")
      .select(
        `
        id,
        order_number,
        customer_name,
        customer_phone,
        status,
        total_price,
        shipping_address,
        created_at,
        order_items (
          id,
          product_name,
          product_color,
          size,
          quantity,
          unit_price,
          subtotal
        )
      `,
      )
      .eq("customer_phone", sanitized)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return {
      success: true,
      orders: orders || [],
    };
  } catch (error) {
    console.error("Error fetching orders by phone:", error);
    return {
      success: false,
      orders: [],
      error: "Unable to fetch orders. Please try again later.",
    };
  }
}

/**
 * PUBLIC: Get single order by order number (for customers)
 * Rate-limited to prevent abuse
 */
export async function getOrderByNumber(orderNumber) {
  try {
    if (!orderNumber || orderNumber.trim().length === 0) {
      return {
        success: false,
        order: null,
        error: "Please enter an order number",
      };
    }

    const sanitized = orderNumber.trim().toUpperCase();

    // Rate limiting - 20 requests per minute per order number
    const limit = rateLimit(
      `order:${sanitized}`,
      RATE_LIMITS.PUBLIC_ORDER_NUMBER.MAX_REQUESTS,
      RATE_LIMITS.PUBLIC_ORDER_NUMBER.WINDOW_MS,
    );

    if (!limit.allowed) {
      return {
        success: false,
        order: null,
        error: `Too many requests. Please try again in ${limit.retryAfter} seconds.`,
      };
    }

    const supabase = await createClient();

    const { data: order, error } = await supabase
      .from("orders")
      .select(
        `
        id,
        order_number,
        customer_name,
        customer_phone,
        status,
        total_price,
        shipping_address,
        created_at,
        order_items (
          id,
          product_name,
          product_color,
          size,
          quantity,
          unit_price,
          subtotal
        )
      `,
      )
      .eq("order_number", sanitized)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return {
          success: false,
          order: null,
          error: "Order not found",
        };
      }
      throw error;
    }

    return {
      success: true,
      order,
    };
  } catch (error) {
    console.error("Error fetching order by number:", error);
    return {
      success: false,
      order: null,
      error: "Unable to fetch order. Please try again later.",
    };
  }
}

// ============================================
// ADMIN FUNCTIONS (Protected)
// ============================================

/**
 * ADMIN: Get paginated orders with infinite scroll support
 */
export async function getPaginatedOrders({
  page = 0,
  limit = PAGINATION.DEFAULT_PAGE_SIZE,
  status = null,
} = {}) {
  try {
    // Check admin authorization
    const auth = await checkAdminAuth();
    if (!auth.authorized) {
      return {
        success: false,
        orders: [],
        totalCount: 0,
        hasMore: false,
        error: auth.error,
      };
    }

    const supabase = await createClient();

    const from = page * limit;
    const to = from + limit - 1;

    let query = supabase
      .from("orders")
      .select(
        `
        *,
        order_items (
          id,
          product_id,
          product_name,
          product_color,
          product_sku,
          size,
          quantity,
          unit_price,
          discount,
          subtotal
        )
      `,
        { count: "exact" },
      )
      .order("created_at", { ascending: false })
      .range(from, to);

    // Apply status filter if provided
    if (status && status !== "all" && status !== null) {
      query = query.eq("status", status);
    }

    const { data: orders, error, count } = await query;

    if (error) throw error;

    return {
      success: true,
      orders: orders || [],
      totalCount: count || 0,
      hasMore: count ? to < count - 1 : false,
      nextPage: count && to < count - 1 ? page + 1 : null,
    };
  } catch (error) {
    console.error("Error fetching paginated orders:", error);
    return {
      success: false,
      orders: [],
      totalCount: 0,
      hasMore: false,
      error: error.message || "Failed to fetch orders",
    };
  }
}

/**
 * ADMIN: Search orders with filters
 */
export async function searchOrdersPaginated(searchQuery, filters = {}) {
  try {
    // Check admin authorization
    const auth = await checkAdminAuth();
    if (!auth.authorized) {
      return {
        success: false,
        orders: [],
        totalCount: 0,
        error: auth.error,
      };
    }

    // Sanitize search input to prevent SQL injection
    const sanitized = sanitizeSearchInput(searchQuery);

    const supabase = await createClient();

    let query = supabase
      .from("orders")
      .select(
        `
        *,
        order_items (
          id,
          product_id,
          product_name,
          product_color,
          product_sku,
          size,
          quantity,
          unit_price,
          discount,
          subtotal
        )
      `,
      )
      .order("created_at", { ascending: false });

    // Search across multiple fields
    if (sanitized) {
      query = query.or(
        `customer_name.ilike.%${sanitized}%,order_number.ilike.%${sanitized}%,customer_phone.ilike.%${sanitized}%`,
      );
    }

    // Status filter
    if (filters.status && filters.status !== "all") {
      query = query.eq("status", filters.status);
    }

    const { data: orders, error } = await query;

    if (error) throw error;

    return {
      success: true,
      orders: orders || [],
      totalCount: orders?.length || 0,
    };
  } catch (error) {
    console.error("Error searching orders:", error);
    return {
      success: false,
      orders: [],
      totalCount: 0,
      error: error.message || "Failed to search orders",
    };
  }
}

/**
 * ADMIN: Get optimized order statistics
 */
export async function getOrderStatsOptimized() {
  try {
    // Check admin authorization
    const auth = await checkAdminAuth();
    if (!auth.authorized) {
      return {
        success: false,
        stats: null,
        error: auth.error,
      };
    }

    const supabase = await createClient();

    // Lightweight query - only fetch status and total_price
    const { data: orders, error } = await supabase
      .from("orders")
      .select("status, total_price");

    if (error) throw error;

    const stats = {
      total: orders.length,
      pending: orders.filter((o) => o.status === "pending").length,
      confirmed: orders.filter((o) => o.status === "confirmed").length,
      out_for_delivery: orders.filter((o) => o.status === "out_for_delivery")
        .length,
      delivered: orders.filter((o) => o.status === "delivered").length,
      cancelled: orders.filter((o) => o.status === "cancelled").length,
      totalRevenue: orders
        .filter((o) => o.status !== "cancelled")
        .reduce((sum, o) => sum + Number(o.total_price || 0), 0),
    };

    return {
      success: true,
      stats,
    };
  } catch (error) {
    console.error("Error fetching order stats:", error);
    return {
      success: false,
      stats: null,
      error: error.message || "Failed to fetch statistics",
    };
  }
}

/**
 * ADMIN: Get single order by ID (with all details)
 */
export async function getOrderById(orderId) {
  try {
    // Check admin authorization
    const auth = await checkAdminAuth();
    if (!auth.authorized) {
      return {
        success: false,
        order: null,
        error: auth.error,
      };
    }

    const supabase = await createClient();

    const { data: order, error } = await supabase
      .from("orders")
      .select(
        `
        *,
        order_items (
          id,
          product_id,
          product_name,
          product_color,
          product_sku,
          size,
          quantity,
          unit_price,
          discount,
          subtotal
        )
      `,
      )
      .eq("id", orderId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return {
          success: false,
          order: null,
          error: "Order not found",
        };
      }
      throw error;
    }

    return {
      success: true,
      order,
    };
  } catch (error) {
    console.error("Error fetching order:", error);
    return {
      success: false,
      order: null,
      error: error.message || "Order not found",
    };
  }
}

// ============================================
// ADMIN MUTATIONS
// ============================================

/**
 * ADMIN: Update order status
 */
export async function updateOrderStatus(orderId, newStatus) {
  try {
    // Check admin authorization
    const auth = await checkAdminAuth();
    if (!auth.authorized) {
      return {
        success: false,
        error: auth.error,
      };
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("orders")
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)
      .select()
      .single();

    if (error) throw error;

    // Revalidate pages
    revalidatePath("/admin/orders");
    revalidatePath("/admin");

    return {
      success: true,
      order: data,
    };
  } catch (error) {
    console.error("Error updating order status:", error);
    return {
      success: false,
      error: error.message || "Failed to update order status",
    };
  }
}

/**
 * ADMIN: Delete order
 */
export async function deleteOrder(orderId) {
  try {
    // Check admin authorization
    const auth = await checkAdminAuth();
    if (!auth.authorized) {
      return {
        success: false,
        error: auth.error,
      };
    }

    const supabase = await createClient();

    // First, delete associated order_items (if they exist and have cascade delete disabled)
    // If you have ON DELETE CASCADE in your database, you can skip this step
    const { error: itemsError } = await supabase
      .from("order_items")
      .delete()
      .eq("order_id", orderId);

    if (itemsError) {
      console.error("Error deleting order items:", itemsError);
      // Continue anyway as CASCADE might handle it
    }

    // Delete the order
    const { error } = await supabase.from("orders").delete().eq("id", orderId);

    if (error) throw error;

    // Revalidate pages
    revalidatePath("/admin/orders");
    revalidatePath("/admin");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error deleting order:", error);
    return {
      success: false,
      error: error.message || "Failed to delete order",
    };
  }
}

// ============================================
// LEGACY FUNCTIONS (For backward compatibility)
// ============================================

/**
 * ADMIN: Get all orders
 * @deprecated Use getPaginatedOrders instead for better performance
 */
export async function getAllOrders() {
  return getPaginatedOrders({ page: 0, limit: 1000 });
}

/**
 * ADMIN: Get orders by status
 * @deprecated Use getPaginatedOrders with status filter instead
 */
export async function getOrdersByStatus(status) {
  return getPaginatedOrders({ page: 0, limit: 1000, status });
}

/**
 * ADMIN: Get recent orders
 * @deprecated Use getPaginatedOrders with limit instead
 */
export async function getRecentOrders(limit = 10) {
  return getPaginatedOrders({ page: 0, limit });
}

/**
 * ADMIN: Get order stats
 * @deprecated Use getOrderStatsOptimized instead
 */
export async function getOrderStats() {
  return getOrderStatsOptimized();
}

/**
 * ADMIN: Search orders (legacy)
 * @deprecated Use searchOrdersPaginated instead
 */
export async function searchOrders(query) {
  return searchOrdersPaginated(query, {});
}
