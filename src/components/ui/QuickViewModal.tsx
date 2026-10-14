import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  X,
  Check,
  Plus,
  Minus,
  ShieldCheck,
  FileText,
  ExternalLink,
} from "lucide-react";
import type { Product } from "../../types";
import { useCart } from "../../context/CartContext";

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onRequestQuoteNow?: (product: Product) => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({
  product,
  isOpen,
  onClose,
  onRequestQuoteNow,
}) => {
  const [qty, setQty] = useState<number>(100);
  const { addToCart, cart } = useCart();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (product) {
      setQty(product.unit === "meter" ? 100 : 1);
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const isLappCat1 = product.id === "lapp-cat-1";
  const isLappOtherCat = product.id.startsWith("lapp-cat-") && product.id !== "lapp-cat-1";
  const isLappCategory = isLappCat1 || isLappOtherCat;
  const isInCart = !isLappCategory && cart.some((i) => i.id === product.id);

  const handleStepUp = () => {
    if (product.unit === "meter") {
      setQty((q) => {
        if (q < 100) return 100;
        if (q === 100 || q === 101 || q === 102 || q < 125) return 125;
        return Math.floor(q / 25) * 25 + 25;
      });
    } else {
      setQty((q) => q + 1);
    }
  };

  const handleStepDown = () => {
    if (product.unit === "meter") {
      setQty((q) => {
        if (q > 125) return Math.ceil(q / 25) * 25 - 25;
        if (q <= 125 && q > 100) return 100;
        if (q === 100) return 75;
        return Math.max(25, q - 25);
      });
    } else {
      setQty((q) => Math.max(1, q - 1));
    }
  };

  const handleAdd = () => {
    addToCart(product, qty);
  };

  const handleCustomQuote = () => {
    onClose();
    if (onRequestQuoteNow) {
      onRequestQuoteNow(product);
    } else {
      navigate("/quotation");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-3xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200 text-slate-900">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 text-slate-400 hover:text-slate-700 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left: Product Media */}
          <div className="bg-slate-50 p-8 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-200 relative">
            <div className="w-full aspect-square flex items-center justify-center p-4">
              <img
                src={product.image || "/images/card-olflex.jpg"}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="max-h-64 object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src = "/images/card-olflex.jpg";
                }}
              />
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-emerald-700 font-mono font-bold bg-white px-3 py-1 rounded-md border border-emerald-200 shadow-2xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>{product.stock}</span>
            </div>
          </div>

          {/* Right: Technical Details & Actions */}
          <div className="p-6 md:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs uppercase font-mono text-slate-400 mb-1.5 font-bold">
                <span className="text-amber-600">{product.brand}</span>
                <span>·</span>
                <span>{product.partNo}</span>
              </div>

              <h3 className="text-lg font-bold text-slate-900 mb-3 leading-snug">
                {product.name}
              </h3>

              {/* Technical Spec List */}
              <div className="mb-6 space-y-2">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Technical Specifications
                </div>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {product.specs.map((s, idx) => (
                    <li key={idx} className="flex items-baseline gap-2">
                      <span className="text-amber-500 font-mono text-[10px]">▪</span>
                      <span>{s}</span>
                    </li>
                  ))}
                  {product.voltage && (
                    <li className="flex items-baseline gap-2 text-slate-600">
                      <span className="text-slate-400 font-mono text-[10px]">▪</span>
                      <span>Voltage Rating: <strong className="text-slate-900">{product.voltage}</strong></span>
                    </li>
                  )}
                  {product.tempRange && (
                    <li className="flex items-baseline gap-2 text-slate-600">
                      <span className="text-slate-400 font-mono text-[10px]">▪</span>
                      <span>Temp Range: <strong className="text-slate-900">{product.tempRange}</strong></span>
                    </li>
                  )}
                  {product.hsnCode && (
                    <li className="flex items-baseline gap-2 text-slate-600">
                      <span className="text-slate-400 font-mono text-[10px]">▪</span>
                      <span>HSN Code: <strong className="text-slate-900 font-mono">{product.hsnCode}</strong></span>
                    </li>
                  )}
                </ul>
              </div>

              {/* Application Note */}
              {product.application && (
                <div className="mb-6 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                  <span className="font-bold text-slate-800">Application: </span>
                  {product.application}
                </div>
              )}
            </div>

            {/* Pricing and Stepper (Hidden for LAPP Categories) */}
            {!isLappCategory && (
              <>
                <div className="pt-4 border-t border-slate-200 space-y-4">
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-[10px] uppercase font-mono text-slate-400">
                        B2B Contract Rate (Ex-GST)
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-black font-mono text-slate-900 tabular-nums">
                          ₹{product.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </span>
                        <span className="text-xs text-slate-500">/{product.unit}</span>
                      </div>
                    </div>

                    <div className="flex items-center border border-slate-300 rounded-lg bg-slate-50 p-1 shadow-2xs">
                      <button
                        onClick={handleStepDown}
                        className="px-2 py-1 text-slate-700 hover:text-slate-900 rounded font-bold text-xs"
                        title={product.unit === "meter" ? "Decrease by 25m" : "Decrease"}
                      >
                        - {product.unit === "meter" && <span className="text-[10px] font-mono">25</span>}
                      </button>
                      <span className="px-2.5 text-xs font-mono font-bold text-slate-900 tabular-nums">
                        {qty} {product.unit}
                      </span>
                      <button
                        onClick={handleStepUp}
                        className="px-2 py-1 text-slate-700 hover:text-slate-900 rounded font-bold text-xs"
                        title={product.unit === "meter" ? "Increase by 25m (e.g. 100m -> 125m)" : "Increase"}
                      >
                        + {product.unit === "meter" && <span className="text-[10px] font-mono">25</span>}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={handleAdd}
                      className={`py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 ${
                        isInCart
                          ? "bg-emerald-50 border border-emerald-300 text-emerald-800"
                          : "bg-amber-500 hover:bg-amber-600 text-white shadow-sm"
                      }`}
                    >
                      {isInCart ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Update Schedule</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          <span>Add to Quote Cart</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={handleCustomQuote}
                      className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-900 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5 text-amber-500" />
                      <span>Formal Quotation</span>
                    </button>
                  </div>
                </div>
              </>
            )}

            {isLappCategory && (
              <div className="pt-4 border-t border-slate-200">
                <button
                  onClick={() => {
                    onClose();
                    if (isLappCat1) {
                      navigate("/olflex-cables");
                    } else {
                      if (window.location.pathname !== "/") {
                        navigate("/");
                        setTimeout(() => {
                          const el = document.getElementById("rfq");
                          if (el) el.scrollIntoView({ behavior: "smooth" });
                        }, 100);
                      } else {
                        const el = document.getElementById("rfq");
                        if (el) el.scrollIntoView({ behavior: "smooth" });
                      }
                    }
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white shadow-sm font-bold text-sm transition-all"
                >
                  {isLappCat1 ? "View Detailed LAPP Catalog" : "Request a Bulk Quote"}
                </button>
              </div>
            )}

            <div className="text-center mt-4">
                <Link
                  to={`/product-detail?id=${product.id}`}
                  onClick={onClose}
                  className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-amber-600 transition-colors font-medium"
                >
                  <span>View Full Technical Data Sheet &amp; Approvals</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};
