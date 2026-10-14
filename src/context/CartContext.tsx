import React, { createContext, useContext, useState, useEffect } from "react";
import type { CartItem, Product, OlflexProduct } from "../types";
import { useToast } from "./ToastContext";

interface CartContextType {
  cart: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addToCart: (product: Product, qty?: number) => void;
  addCustomItem: (item: Omit<CartItem, "qty">, qty?: number) => void;
  addOlflexItem: (product: OlflexProduct, qty?: number) => void;
  updateQty: (id: string, qty: number) => void;
  stepUpQty: (id: string) => void;
  stepDownQty: (id: string) => void;
  removeFromCart: (id: string) => void;
  loadCart: (items: CartItem[]) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  gstAmount: number;
  grandTotal: number;
  discountRate: number;
  discountAmount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "siddhi_quotation_cart_v2";

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        const parsed: CartItem[] = JSON.parse(stored);
        // Normalize any meter quantities: cables start at min 100m, and values like 101, 102 or between 100-125 directly snap to 125
        return parsed.map((item) => {
          if (item.unit === "meter") {
            if (item.qty < 100) return { ...item, qty: 100 };
            if (item.qty === 101 || item.qty === 102 || (item.qty > 100 && item.qty < 125)) {
              return { ...item, qty: 125 };
            }
          }
          return item;
        });
      }
      return [
        {
          id: "lapp-01",
          name: "ÖLFLEX® CLASSIC 110 Control Cable (3G1.5)",
          partNo: "LAPP-1119203",
          brand: "LAPP KABEL",
          price: 68.5,
          unit: "meter",
          qty: 100,
          hsnCode: "85444990",
        },
        {
          id: "menn-01",
          name: "Mennekes CEE Industrial Plug 16A 5-Pin (3P+N+E)",
          partNo: "MENN-013-16A",
          brand: "MENNEKES",
          price: 540.0,
          unit: "piece",
          qty: 5,
          hsnCode: "85366990",
        },
      ];
    } catch {
      return [];
    }
  });

  const [isOpen, setIsOpen] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.error("Failed to save cart to localStorage", e);
    }
  }, [cart]);

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);
  const toggleCart = () => setIsOpen((prev) => !prev);

  const addToCart = (product: Product, qty?: number) => {
    // If unit is meter, standard starting quantity is 100m, steps by 25m to 125m
    const isMeter = product.unit === "meter";
    const defaultQty = isMeter ? 100 : 1;
    const validQty = qty !== undefined && qty > 0 ? qty : defaultQty;

    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) => {
          if (item.id !== product.id) return item;
          if (isMeter) {
            // When already in cart, increment by 25m (never +1/101/102)
            const inc = validQty >= 25 ? Math.ceil(validQty / 25) * 25 : 25;
            let nextTotal: number;
            if (item.qty < 100) {
              nextTotal = 100;
            } else if (item.qty === 100 || item.qty === 101 || item.qty === 102) {
              // Directly moves 25 to 125
              nextTotal = 125;
            } else {
              nextTotal = Math.floor(item.qty / 25) * 25 + inc;
            }
            return { ...item, qty: nextTotal };
          }
          return { ...item, qty: item.qty + validQty };
        });
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          partNo: product.partNo,
          brand: product.brand,
          price: product.price,
          unit: product.unit,
          qty: isMeter ? Math.max(100, Math.ceil(validQty / 25) * 25) : validQty,
          hsnCode: product.hsnCode || "85444990",
        },
      ];
    });
    showToast(`Added ${product.name} to Quotation Cart`, "success");
  };

  const addCustomItem = (item: Omit<CartItem, "qty">, qty?: number) => {
    const isMeter = item.unit === "meter";
    const defaultQty = isMeter ? 100 : 1;
    const validQty = qty !== undefined && qty > 0 ? qty : defaultQty;

    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) => {
          if (i.id !== item.id) return i;
          if (isMeter) {
            const inc = validQty >= 25 ? Math.ceil(validQty / 25) * 25 : 25;
            const nextTotal = i.qty < 100 ? 100 : (i.qty === 100 || i.qty === 101 || i.qty === 102) ? 125 : Math.floor(i.qty / 25) * 25 + inc;
            return { ...i, qty: nextTotal };
          }
          return { ...i, qty: i.qty + validQty };
        });
      }
      return [
        ...prev,
        {
          ...item,
          qty: isMeter ? Math.max(100, Math.ceil(validQty / 25) * 25) : validQty,
        },
      ];
    });
    showToast(`Added ${item.name} to Quotation Cart`, "success");
  };

  const addOlflexItem = (product: OlflexProduct, qty: number = 100) => {
    const validQty = Math.max(100, Math.ceil(qty / 25) * 25);
    const id = `olflex-${product.partNo}`;
    setCart((prev) => {
      const existing = prev.find((item) => item.id === id);
      if (existing) {
        const inc = qty >= 25 ? Math.ceil(qty / 25) * 25 : 25;
        const nextTotal = existing.qty < 100 ? 100 : (existing.qty === 100 || existing.qty === 101 || existing.qty === 102) ? 125 : Math.floor(existing.qty / 25) * 25 + inc;
        return prev.map((item) =>
          item.id === id ? { ...item, qty: nextTotal } : item
        );
      }
      return [
        ...prev,
        {
          id,
          name: product.name,
          partNo: product.partNo,
          brand: product.brand || "LAPP KABEL",
          price: product.price,
          unit: "meter",
          qty: validQty,
          hsnCode: "85444990",
        },
      ];
    });
    showToast(`Added ${product.name} (${validQty}m) to Quotation Cart`, "success");
  };

  const updateQty = (id: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(id);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        if (item.unit === "meter") {
          // If count entered is 101 or 102 or between 100 and 125, snap directly to 125
          if (qty === 101 || qty === 102 || (qty > 100 && qty < 125)) {
            return { ...item, qty: 125 };
          }
          if (qty < 25) {
            return { ...item, qty: 25 };
          }
        }
        return { ...item, qty };
      })
    );
  };

  // Step up quantity: for cables/meters, 100 moves directly by 25 to 125, 150, 175...
  // If count was 101 or 102, it directly moves to 125
  const stepUpQty = (id: string) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        if (item.unit === "meter") {
          let nextQty: number;
          if (item.qty < 100) {
            nextQty = 100;
          } else if (item.qty === 100 || item.qty === 101 || item.qty === 102 || item.qty < 125) {
            // From 100m, directly moves by 25 to 125m
            nextQty = 125;
          } else {
            nextQty = Math.floor(item.qty / 25) * 25 + 25;
          }
          return { ...item, qty: nextQty };
        }
        return { ...item, qty: item.qty + 1 };
      })
    );
  };

  // Step down quantity: for cables/meters, steps down by 25m (e.g. 150 -> 125 -> 100 -> 75)
  const stepDownQty = (id: string) => {
    setCart((prev) => {
      const target = prev.find((i) => i.id === id);
      if (!target) return prev;
      if (target.unit === "meter") {
        let prevQty: number;
        if (target.qty > 125) {
          prevQty = Math.ceil(target.qty / 25) * 25 - 25;
        } else if (target.qty > 100 && target.qty <= 125) {
          // From 125 (or 101/102), steps down to 100
          prevQty = 100;
        } else if (target.qty === 100) {
          prevQty = 75;
        } else {
          prevQty = target.qty - 25;
        }

        if (prevQty <= 0) {
          return prev.filter((i) => i.id !== id);
        }
        return prev.map((i) => (i.id === id ? { ...i, qty: prevQty } : i));
      } else {
        if (target.qty <= 1) {
          return prev.filter((i) => i.id !== id);
        }
        return prev.map((i) => (i.id === id ? { ...i, qty: i.qty - 1 } : i));
      }
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
    showToast("Item removed from quotation schedule", "info");
  };

  const clearCart = () => {
    setCart([]);
    showToast("Quotation cart cleared", "info");
  };

  const loadCart = (items: CartItem[]) => {
    setCart(items);
  };

  const totalItems = cart.reduce((acc, item) => acc + item.qty, 0);
  const rawSubtotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);

  // B2B tiered incentive discounts
  let discountRate = 0;
  if (rawSubtotal >= 100000) {
    discountRate = 0.08; // 8% project discount
  } else if (rawSubtotal >= 40000) {
    discountRate = 0.04; // 4% wholesale tier
  }

  const discountAmount = rawSubtotal * discountRate;
  const subtotal = rawSubtotal - discountAmount;
  const gstAmount = subtotal * 0.18; // 18% standard industrial electrical GST
  const grandTotal = subtotal + gstAmount;

  return (
    <CartContext.Provider
      value={{
        cart,
        isOpen,
        openCart,
        closeCart,
        toggleCart,
        addToCart,
        addCustomItem,
        addOlflexItem,
        updateQty,
        stepUpQty,
        stepDownQty,
        removeFromCart,
        loadCart,
        clearCart,
        totalItems,
        subtotal,
        gstAmount,
        grandTotal,
        discountRate,
        discountAmount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
