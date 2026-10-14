import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  X,
  FileSpreadsheet,
  Plus,
  Check,
  ZoomIn,
  ArrowRight,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";
import type { Product } from "../../types";
import { PRODUCTS_DATA } from "../../data/products";
import { useCart } from "../../context/CartContext";

interface CategoryProductsModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryTitle: string;
  categoryDesc?: string;
  categoryBrand?: string;
  onZoomImage?: (img: string, title: string, partNo?: string) => void;
  onRequestQuote?: (topic: string) => void;
}

export const CategoryProductsModal: React.FC<CategoryProductsModalProps> = ({
  isOpen,
  onClose,
  categoryTitle,
  categoryDesc,
  categoryBrand = "LAPP KABEL",
  onZoomImage,
  onRequestQuote,
}) => {
  const { addToCart, cart } = useCart();
  const [selectedCoreFilter, setSelectedCoreFilter] = useState<string>("all");

  if (!isOpen) return null;

  // Filter products relevant to this category title or brand
  const titleLower = categoryTitle.toLowerCase();
  let relevantProducts: Product[] = [];

  if (titleLower.includes("ölflex") || titleLower.includes("flexible control")) {
    relevantProducts = PRODUCTS_DATA.filter(
      (p) => p.brand === "LAPP KABEL" && p.name.toLowerCase().includes("ölflex")
    );
  } else if (titleLower.includes("unitronic") || titleLower.includes("data")) {
    relevantProducts = PRODUCTS_DATA.filter(
      (p) =>
        p.brand === "LAPP KABEL" &&
        (p.name.toLowerCase().includes("unitronic") || p.category === "data")
    );
  } else if (titleLower.includes("etherline") || titleLower.includes("ethernet") || titleLower.includes("profinet")) {
    relevantProducts = PRODUCTS_DATA.filter(
      (p) =>
        p.brand === "LAPP KABEL" &&
        (p.name.toLowerCase().includes("etherline") || p.name.toLowerCase().includes("ethernet"))
    );
  } else if (titleLower.includes("skintop") || titleLower.includes("gland")) {
    relevantProducts = PRODUCTS_DATA.filter(
      (p) =>
        p.brand === "LAPP KABEL" &&
        (p.name.toLowerCase().includes("skintop") || p.name.toLowerCase().includes("gland") || p.category === "accessories")
    );
  } else if (titleLower.includes("silvyn") || titleLower.includes("conduit")) {
    relevantProducts = PRODUCTS_DATA.filter(
      (p) =>
        p.brand === "LAPP KABEL" &&
        (p.name.toLowerCase().includes("silvyn") || p.name.toLowerCase().includes("conduit"))
    );
  } else if (titleLower.includes("epic") || titleLower.includes("connector")) {
    relevantProducts = PRODUCTS_DATA.filter(
      (p) =>
        p.brand === "LAPP KABEL" &&
        (p.name.toLowerCase().includes("epic") || p.name.toLowerCase().includes("connector"))
    );
  } else {
    relevantProducts = PRODUCTS_DATA.filter((p) => p.brand === categoryBrand);
  }

  // Fallback to general LAPP products if specific subset is small
  if (relevantProducts.length === 0) {
    relevantProducts = PRODUCTS_DATA.filter((p) => p.brand === categoryBrand);
  }

  const isOlflexCategory = titleLower.includes("ölflex") || titleLower.includes("flexible control");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-5xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200 text-slate-900 my-auto flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-200 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white flex items-center justify-between gap-4 shrink-0 shadow-sm">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold mb-0.5">
              <span>{categoryBrand}</span>
              <span>·</span>
              <span>Authorized Stockist Schedule</span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-white tracking-tight truncate">
              {categoryTitle}
            </h3>
            {categoryDesc && (
              <p className="text-xs text-slate-300 font-medium line-clamp-1 max-w-2xl mt-0.5">
                {categoryDesc}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isOlflexCategory && (
              <Link
                to="/olflex-cables"
                onClick={onClose}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all shadow-sm"
              >
                <span>Full 100+ Specs Configurator</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body / Products List */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Action Callout for ÖLFLEX full table */}
          {isOlflexCategory && (
            <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  <span>Looking for specific ÖLFLEX® core combinations (e.g. 4G2.5, 12G1.5, 25G0.75)?</span>
                </div>
                <p className="text-[11px] text-amber-800">
                  Explore our dedicated ÖLFLEX Cable Center with live technical datasheets, outer diameters, copper index, and CSV export.
                </p>
              </div>
              <Link
                to="/olflex-cables"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold whitespace-nowrap shadow-sm flex items-center gap-1.5 shrink-0"
              >
                <span>Open 100+ Specs Table</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {relevantProducts.map((product) => {
              const isInCart = cart.some((i) => i.id === product.id);
              const isMeter = product.unit === "meter";

              return (
                <div
                  key={product.id}
                  className="rounded-2xl bg-white border border-slate-200 flex flex-col justify-between hover:border-amber-400 hover:shadow-lg transition-all group overflow-hidden"
                >
                  {/* Product Image Slot with Zoom Trigger */}
                  <div className="relative aspect-[4/3] bg-slate-50 flex items-center justify-center p-4 border-b border-slate-100 overflow-hidden">
                    <img
                      src={product.image || "/images/card-olflex.jpg"}
                      alt={product.name}
                      referrerPolicy="no-referrer"
                      className="max-h-36 object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-sm cursor-pointer"
                      onClick={() => onZoomImage && onZoomImage(product.image || "/images/card-olflex.jpg", product.name, product.partNo)}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = "/images/card-olflex.jpg";
                      }}
                    />

                    {/* Zoom In Button Badge */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onZoomImage) {
                          onZoomImage(product.image || "/images/card-olflex.jpg", product.name, product.partNo);
                        }
                      }}
                      className="absolute bottom-2.5 right-2.5 px-2 py-1 rounded-lg bg-white/95 hover:bg-amber-50 border border-slate-300 text-slate-800 text-[10px] font-bold flex items-center gap-1 shadow-md transition-colors"
                      title="Zoom In image (+/-)"
                    >
                      <ZoomIn className="w-3.5 h-3.5 text-amber-500" />
                      <span>Zoom +</span>
                    </button>

                    <div className="absolute top-2.5 left-2.5 text-[10px] font-mono text-emerald-800 font-bold bg-white/95 px-2 py-0.5 rounded border border-emerald-300 shadow-2xs">
                      Ready Stock
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 text-[10px] uppercase font-mono text-slate-400 mb-1.5 font-bold">
                        <span className="text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                          {product.brand}
                        </span>
                        <span>·</span>
                        <span className="text-slate-600 font-bold">{product.partNo}</span>
                      </div>

                      <Link
                        to={`/product-detail?id=${product.id}`}
                        onClick={onClose}
                        className="text-xs sm:text-sm font-bold text-slate-900 hover:text-amber-600 transition-colors line-clamp-2 mb-2 break-words leading-snug"
                      >
                        {product.name}
                      </Link>

                      {/* Specs */}
                      <ul className="space-y-1 mb-4 text-[11px] text-slate-600">
                        {product.specs.slice(0, 2).map((s, idx) => (
                          <li key={idx} className="line-clamp-1 flex items-baseline gap-1.5">
                            <span className="text-amber-500 font-bold">▪</span>
                            <span className="truncate">{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Price and CTA */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 mt-auto">
                      <div>
                        <span className="text-[9px] uppercase font-mono text-slate-400 font-bold block">
                          Contract Rate
                        </span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-sm sm:text-base font-black font-mono text-slate-950">
                            ₹{product.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                          </span>
                          <span className="text-[10px] text-slate-500">/{product.unit}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => addToCart(product, isMeter ? 100 : 1)}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-2xs whitespace-nowrap ${
                            isInCart
                              ? "bg-emerald-100 border border-emerald-400 text-emerald-900"
                              : "bg-amber-500 hover:bg-amber-600 text-white"
                          }`}
                          title={isMeter ? "Add standard 100m to quotation" : "Add item"}
                        >
                          {isInCart ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>In Quote</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <span className="text-xs text-slate-500 font-medium">
            Official LAPP Kabel factory warranty &amp; batch test certificates included.
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                onClose();
                if (onRequestQuote) onRequestQuote(categoryTitle);
              }}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-amber-400" />
              <span>Request Custom BOM Quote</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
