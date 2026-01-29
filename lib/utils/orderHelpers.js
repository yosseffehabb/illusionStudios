// lib/utils/orderHelpers.js

/**
 * Get Tailwind classes for order status badges
 */
export function getStatusColor(status) {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      confirmed: "bg-blue-100 text-blue-800 border-blue-200",
      out_for_delivery: "bg-purple-100 text-purple-800 border-purple-200",
      delivered: "bg-green-100 text-green-800 border-green-200",
      cancelled: "bg-red-100 text-red-800 border-red-200",
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-200";
  }
  
  /**
   * Get icon configuration for order status
   */
  export function getStatusIconConfig(status) {
    const configs = {
      pending: {
        bgColor: "bg-yellow-50",
        iconColor: "text-yellow-600",
        borderColor: "border-yellow-200",
      },
      confirmed: {
        bgColor: "bg-blue-50",
        iconColor: "text-blue-600",
        borderColor: "border-blue-200",
      },
      out_for_delivery: {
        bgColor: "bg-purple-50",
        iconColor: "text-purple-600",
        borderColor: "border-purple-200",
      },
      delivered: {
        bgColor: "bg-green-50",
        iconColor: "text-green-600",
        borderColor: "border-green-200",
      },
      cancelled: {
        bgColor: "bg-red-50",
        iconColor: "text-red-600",
        borderColor: "border-red-200",
      },
    };
  
    return (
      configs[status] || {
        bgColor: "bg-gray-50",
        iconColor: "text-gray-600",
        borderColor: "border-gray-200",
      }
    );
  }
  
  /**
   * Format status string for display
   */
  export function formatStatus(status) {
    if (!status) return "";
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }
  
  /**
   * Format date for display
   */
  export function formatDate(dateString) {
    if (!dateString) return "";
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  
  /**
   * Format full date with year
   */
  export function formatFullDate(dateString) {
    if (!dateString) return "";
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  
  /**
   * Sanitize search input to prevent SQL injection
   */
  export function sanitizeSearchInput(input) {
    if (!input) return "";
    // Escape special SQL LIKE characters
    return input.replace(/[%_\\]/g, "\\$&").trim();
  }
  
  /**
   * Sanitize phone number
   */
  export function sanitizePhone(phone) {
    if (!phone) return "";
    // Remove all non-numeric characters except + - () and spaces
    return phone.replace(/[^\d+\-\s()]/g, "").trim();
  }
  
  /**
   * Validate phone number format
   */
  export function isValidPhone(phone) {
    if (!phone) return false;
    const cleaned = phone.replace(/\D/g, "");
    return cleaned.length >= 10 && cleaned.length <= 15;
  }
  
  /**
   * Format price with currency
   */
  export function formatPrice(price, currency = "L.E") {
    if (price === null || price === undefined) return "0 " + currency;
    return `${Number(price).toLocaleString()} ${currency}`;
  }