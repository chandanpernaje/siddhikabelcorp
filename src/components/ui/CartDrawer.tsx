import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  X,
  Trash2,
  Plus,
  Minus,
  FileSpreadsheet,
  ArrowRight,
  ShieldCheck,
  Percent,
} from "lucide-react";
import { useCart } from "../../context/CartContext";
import { RFQModal } from "./RFQModal";

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isOpen,
    closeCart,
    updateQty,
    stepUpQty,
    stepDownQty,
    removeFromCart,
    clearCart,
    totalItems,
    subtotal,
    gstAmount,
    grandTotal,
    discountRate,
    discountAmount,
  } = useCart();
  const navigate = useNavigate();
  const [isRfqModalOpen, setIsRfqModalOpen] = useState(false);

  if (!isOpen && !isRfqModalOpen) return null;

  const handleProceedToQuotation = () => {
    setIsRfqModalOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Dimmed backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-md bg-slate-50 border-l border-slate-200 text-slate-900 flex flex-col shadow-2xl">
          {/* Drawer Header with Premium Light Grey Background */}
          <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-slate-50 shadow-sm text-slate-900">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-slate-200/60 border border-slate-300 flex items-center justify-center shrink-0">
                <FileSpreadsheet className="w-5 h-5 text-slate-500" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-bold text-slate-900 tracking-tight truncate">
                  Quotation Cart (RFQ)
                </h3>
                <span className="text-xs text-slate-500 font-medium truncate block">
                  {totalItems} item{totalItems === 1 ? "" : "s"} scheduled for formal pricing
                </span>
              </div>
            </div>
            <button
              onClick={closeCart}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors shrink-0"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tiered OEM Discount Notice */}
          {discountRate > 0 && (
            <div className="bg-red-50 border-b border-red-200 px-6 py-2.5 flex items-center gap-2 text-xs text-red-900 font-medium">
              <Percent className="w-4 h-4 shrink-0 text-red-600" />
              <span className="break-words">
                Tiered Project Discount Applied: <strong>{(discountRate * 100).toFixed(0)}% Off</strong> contract rates!
              </span>
            </div>
          )}

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4 divide-y divide-slate-100">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
                <FileSpreadsheet className="w-12 h-12 text-slate-300 mb-3" />
                <h4 className="text-sm font-bold text-slate-800 mb-1">
                  Your Quotation Schedule is Empty
                </h4>
                <p className="text-xs text-slate-500 mb-6 max-w-xs leading-relaxed break-words">
                  Browse ÖLFLEX® cables, Eaton switchgear, or Mennekes plugs to generate instant project quotations.
                </p>
                <button
                  onClick={() => {
                    closeCart();
                    navigate("/#catalog");
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-xs font-bold text-slate-800 rounded-xl transition-colors shadow-2xs"
                >
                  Browse Product Catalog
                </button>
              </div>
            ) : (
              cart.map((item) => {
                const isMeter = item.unit === "meter";
                return (
                  <div key={item.id} className="py-4 flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-3 min-w-0">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5 text-[10px] uppercase font-mono text-slate-400 mb-1 font-bold">
                          <span className="text-red-700 bg-red-50 px-1.5 py-0.5 rounded border border-red-200">{item.brand}</span>
                          <span>·</span>
                          <span className="truncate max-w-[150px]">{item.partNo}</span>
                        </div>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-2 break-words">
                          {item.name}
                        </h4>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 transition-colors shrink-0"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Quantity Stepper & Price Calculation */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 min-w-0">
                      <div className="flex items-center border border-slate-300 rounded-lg bg-slate-50 p-0.5 shadow-2xs">
                        <button
                          onClick={() => stepDownQty(item.id)}
                          className="px-2 py-1 text-slate-700 hover:text-slate-950 rounded hover:bg-slate-200 transition-colors font-bold text-xs flex items-center gap-0.5"
                          title={isMeter ? "Decrease by 25 meters" : "Decrease quantity"}
                        >
                          <Minus className="w-3 h-3" />
                          {isMeter && <span className="text-[10px] font-mono">25</span>}
                        </button>
                        <span className="px-2.5 sm:px-3 text-xs font-mono font-bold text-slate-950 tabular-nums">
                          {item.qty} {item.unit}
                        </span>
                        <button
                          onClick={() => stepUpQty(item.id)}
                          className="px-2 py-1 text-slate-700 hover:text-slate-950 rounded hover:bg-slate-200 transition-colors font-bold text-xs flex items-center gap-0.5"
                          title={isMeter ? "Increase by 25 meters (e.g. 100m -> 125m)" : "Increase quantity"}
                        >
                          <Plus className="w-3 h-3" />
                          {isMeter && <span className="text-[10px] font-mono">25</span>}
                        </button>
                      </div>

                      <div className="text-right min-w-0">
                        <div className="text-xs sm:text-sm font-mono font-bold text-slate-950 tabular-nums">
                          ₹{(item.price * item.qty).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono truncate">
                          @ ₹{item.price.toFixed(2)}/{item.unit}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Drawer Footer & Action */}
          {cart.length > 0 && (
            <div className="border-t border-slate-200 bg-slate-50/80 p-6 space-y-4">
              <div className="space-y-1.5 text-xs">
                {discountAmount > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Gross Material:</span>
                    <span className="font-mono tabular-nums">
                      ₹{(subtotal + discountAmount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                )}
                {discountAmount > 0 && (
                  <div className="flex justify-between text-red-700 font-semibold">
                    <span>Project Tier Discount ({(discountRate * 100).toFixed(0)}%):</span>
                    <span className="font-mono tabular-nums">
                      -₹{discountAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>Taxable Value:</span>
                  <span className="font-mono tabular-nums font-medium text-slate-900">
                    ₹{subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>GST (18% Harmonized):</span>
                  <span className="font-mono tabular-nums font-medium text-slate-900">
                    ₹{gstAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-bold text-slate-900">
                  <span>Estimated Total (Incl. GST):</span>
                  <span className="text-[#c52328] font-mono tabular-nums text-base font-black">
                    ₹{grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  onClick={handleProceedToQuotation}
                  className="w-full py-3.5 px-4 rounded-xl bg-[#c52328] hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-red-600/20 active:scale-98 transition-all"
                >
                  <span>Proceed to RFQ Form</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="flex items-center justify-between text-[11px] text-slate-500 px-1 font-medium">
                  <div className="flex items-center gap-1.5 text-emerald-700">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Request Bulk Quotation</span>
                  </div>
                  <button
                    onClick={clearCart}
                    className="hover:text-rose-600 transition-colors"
                  >
                    Clear All
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <RFQModal 
        productName="Bulk Project Bill of Materials"
        isOpen={isRfqModalOpen}
        onClose={() => setIsRfqModalOpen(false)}
      />
    </div>
  );
};
