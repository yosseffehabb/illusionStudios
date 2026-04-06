"use client";

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useRef,
} from "react";

const CartContext = createContext();

const CART_STORAGE_KEY = "cart";

/* ─────────────────────────────────────────
   Helpers
───────────────────────────────────────── */
function calcTotals(cart) {
  const totalItems = cart.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = cart.reduce((sum, i) => {
    const effectivePrice =
      i.discount > 0 ? i.unit_price * (1 - i.discount / 100) : i.unit_price;
    return sum + effectivePrice * i.quantity;
  }, 0);
  return { totalItems, subtotal: parseFloat(subtotal.toFixed(2)) };
}

function saveToStorage(cart) {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch {
    // storage quota exceeded or unavailable — fail silently
  }
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/* ─────────────────────────────────────────
   Initial state — always empty on first render
   so server HTML matches client HTML (no hydration mismatch).
   localStorage is loaded in a useEffect after mount.
───────────────────────────────────────── */
const initialState = {
  cart: [],
  totalItems: 0,
  subtotal: 0,
  isLoading: false,
  error: "",
};

/* ─────────────────────────────────────────
   Reducer
───────────────────────────────────────── */
function reducer(state, action) {
  switch (action.type) {
    case "loading":
      return { ...state, isLoading: true };

    case "cart/loaded": {
      const cart = action.payload;
      return { ...state, cart, ...calcTotals(cart), isLoading: false };
    }

    case "cart/addItem": {
      const incoming = action.payload;
      const existingIndex = state.cart.findIndex(
        (i) => i.product_id === incoming.product_id && i.size === incoming.size,
      );

      let updatedCart;
      if (existingIndex !== -1) {
        // Item already in cart — increase quantity (capped at stock)
        updatedCart = state.cart.map((item, idx) =>
          idx === existingIndex
            ? {
                ...item,
                quantity: Math.min(
                  item.quantity + incoming.quantity,
                  item.stock_quantity,
                ),
              }
            : item,
        );
      } else {
        // New item
        updatedCart = [...state.cart, incoming];
      }

      return { ...state, cart: updatedCart, ...calcTotals(updatedCart) };
    }

    case "cart/incQtty": {
      const { product_id, size } = action.payload;
      const updatedCart = state.cart.map((item) =>
        item.product_id === product_id && item.size === size
          ? {
              ...item,
              quantity: Math.min(item.quantity + 1, item.stock_quantity),
            }
          : item,
      );
      return { ...state, cart: updatedCart, ...calcTotals(updatedCart) };
    }

    case "cart/decQtty": {
      const { product_id, size } = action.payload;
      const updatedCart = state.cart
        .map((item) =>
          item.product_id === product_id && item.size === size
            ? { ...item, quantity: item.quantity - 1 }
            : item,
        )
        .filter((item) => item.quantity > 0); // auto-remove when hitting 0
      return { ...state, cart: updatedCart, ...calcTotals(updatedCart) };
    }

    case "cart/deleteItem": {
      const { product_id, size } = action.payload;
      const updatedCart = state.cart.filter(
        (item) => !(item.product_id === product_id && item.size === size),
      );
      return { ...state, cart: updatedCart, ...calcTotals(updatedCart) };
    }

    case "cart/clear":
      return {
        ...state,
        cart: [],
        totalItems: 0,
        subtotal: 0,
      };

    case "error":
      return { ...state, isLoading: false, error: action.payload };

    case "clear/error":
      return { ...state, error: "" };

    default:
      throw new Error(`Unknown action type: ${action.type}`);
  }
}

/* ─────────────────────────────────────────
   Provider
───────────────────────────────────────── */
function CartProvider({ children }) {
  const [{ cart, isLoading, subtotal, totalItems, error }, dispatch] =
    useReducer(reducer, initialState);

  // Track hydration without triggering rerenders.
  // This prevents writing the empty initial cart before we load persisted data.
  const hasHydratedFromStorage = useRef(false);

  // After mount: load persisted cart from localStorage
  useEffect(() => {
    const saved = loadFromStorage();
    if (saved.length > 0) {
      dispatch({ type: "cart/loaded", payload: saved });
    }
    hasHydratedFromStorage.current = true;
  }, []);

  // Persist cart to localStorage on every change (client only)
  useEffect(() => {
    if (!hasHydratedFromStorage.current) return;
    saveToStorage(cart);
  }, [cart]);
  /* ── Actions ── */
  function addItem(item) {
    dispatch({ type: "cart/addItem", payload: item });
  }

  function deleteItem(productId, size) {
    dispatch({
      type: "cart/deleteItem",
      payload: { product_id: productId, size },
    });
  }

  function incrementQuantity(productId, size) {
    dispatch({
      type: "cart/incQtty",
      payload: { product_id: productId, size },
    });
  }

  function decrementQuantity(productId, size) {
    dispatch({
      type: "cart/decQtty",
      payload: { product_id: productId, size },
    });
  }

  function clearCart() {
    dispatch({ type: "cart/clear" });
  }

  function clearError() {
    dispatch({ type: "clear/error" });
  }

  /* ── Query helpers ── */
  function getCartItem(productId, size) {
    const item = cart.find(
      (i) => i.product_id === productId && i.size === size,
    );
    return {
      exists: !!item,
      quantity: item?.quantity ?? 0,
    };
  }

  return (
    <CartContext.Provider
      value={{
        cart,
        isLoading,
        subtotal,
        totalItems,
        error,
        addItem,
        deleteItem,
        incrementQuantity,
        decrementQuantity,
        clearCart,
        clearError,
        getCartItem,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

/* ─────────────────────────────────────────
   Hook
───────────────────────────────────────── */
function useCart() {
  const context = useContext(CartContext);
  if (context === undefined)
    throw new Error("useCart must be used within a CartProvider");
  return context;
}

export { CartProvider, useCart };
