import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Eye, Check, ShieldCheck, Zap } from "lucide-react";
import type { Product } from "../../types";
import { useCart } from "../../context/CartContext";

interface ProductCardProps {
  product: Product;
  onQuickView: (product: Product) => void;
  onDirectQuote?: (product: Product) => void;
  customLink?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onQuickView,
  customLink,
}) => {
  const { addToCart, cart } = useCart();
  const navigate = useNavigate();
  
  const isLappCat1 = product.id === "lapp-cat-1";
  const isLappOtherCat = product.id.startsWith("lapp-cat-") && product.id !== "lapp-cat-1";
  const isLappCategory = isLappCat1 || isLappOtherCat;
  
  const isInCart = !isLappCategory && cart.some((item) => item.id === product.id);

  // Dynamic rich brand styling matching each industrial manufacturer
  const getBrandStyle = (brand: string) => {
    const b = brand.toLowerCase();
    if (b.includes("lapp")) {
      return {
        cardBg: "bg-gradient-to-b from-orange-500/10 via-orange-50/70 to-white",
        cardBorder: "border-orange-200/90 hover:border-orange-400 hover:shadow-orange-500/20",
        topStrip: "border-t-4 border-t-orange-500",
        imageBg: "bg-gradient-to-b from-orange-100/50 via-orange-50/40 to-white",
        badge: "bg-orange-100/90 text-orange-900 border-orange-300 font-bold",
        titleHover: "hover:text-orange-700",
        bullet: "text-orange-500",
        priceText: "text-orange-950",
        btnGradient: "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-md shadow-orange-500/25",
        accentGlow: "group-hover:shadow-orange-500/15",
      };
    }
    if (b.includes("eaton")) {
      return {
        cardBg: "bg-gradient-to-b from-blue-500/10 via-sky-50/70 to-white",
        cardBorder: "border-blue-200/90 hover:border-blue-400 hover:shadow-blue-500/20",
        topStrip: "border-t-4 border-t-blue-500",
        imageBg: "bg-gradient-to-b from-blue-100/50 via-sky-50/40 to-white",
        badge: "bg-blue-100/90 text-blue-900 border-blue-300 font-bold",
        titleHover: "hover:text-blue-700",
        bullet: "text-blue-500",
        priceText: "text-blue-950",
        btnGradient: "bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white shadow-md shadow-blue-500/25",
        accentGlow: "group-hover:shadow-blue-500/15",
      };
    }
    if (b.includes("mennekes")) {
      return {
        cardBg: "bg-gradient-to-b from-red-600/10 via-red-50/70 to-white",
        cardBorder: "border-red-200/90 hover:border-red-500 hover:shadow-red-600/20",
        topStrip: "border-t-4 border-t-red-600",
        imageBg: "bg-gradient-to-b from-red-100/50 via-red-50/40 to-white",
        badge: "bg-red-100/90 text-red-900 border-red-300 font-bold",
        titleHover: "hover:text-red-700",
        bullet: "text-red-600",
        priceText: "text-red-950",
        btnGradient: "bg-gradient-to-r from-red-700 to-red-600 hover:from-red-800 hover:to-red-700 text-white shadow-md shadow-red-600/25",
        accentGlow: "group-hover:shadow-red-600/15",
      };
    }
    if (b.includes("partex")) {
      return {
        cardBg: "bg-gradient-to-b from-zinc-500/10 via-zinc-50/70 to-white",
        cardBorder: "border-zinc-200/90 hover:border-zinc-400 hover:shadow-zinc-500/20",
        topStrip: "border-t-4 border-t-zinc-500",
        imageBg: "bg-gradient-to-b from-zinc-100/50 via-zinc-50/40 to-white",
        badge: "bg-zinc-100/90 text-zinc-900 border-zinc-300 font-bold",
        titleHover: "hover:text-zinc-700",
        bullet: "text-zinc-500",
        priceText: "text-zinc-950",
        btnGradient: "bg-gradient-to-r from-zinc-600 to-zinc-500 hover:from-zinc-700 hover:to-zinc-600 text-white shadow-md shadow-zinc-500/25",
        accentGlow: "group-hover:shadow-zinc-500/15",
      };
    }
    return {
      cardBg: "bg-gradient-to-b from-purple-500/10 via-purple-50/70 to-white",
      cardBorder: "border-purple-200/90 hover:border-purple-400 hover:shadow-purple-500/20",
      topStrip: "border-t-4 border-t-purple-500",
      imageBg: "bg-gradient-to-b from-purple-100/50 via-purple-50/40 to-white",
      badge: "bg-purple-100/90 text-purple-900 border-purple-300 font-bold",
      titleHover: "hover:text-purple-700",
      bullet: "text-purple-500",
      priceText: "text-purple-950",
      btnGradient: "bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-700 hover:to-indigo-600 text-white shadow-md shadow-purple-500/25",
      accentGlow: "group-hover:shadow-purple-500/15",
    };
  };

  const style = getBrandStyle(product.brand);

  return (
    <div
      className={`group relative flex flex-col rounded-3xl h-full ${style.cardBg} border ${style.cardBorder} ${style.topStrip} transition-all duration-300 hover:-translate-y-1.5 shadow-sm hover:shadow-xl ${style.accentGlow} overflow-hidden`}
    >
      {/* Product Image Slot with tinted brand background */}
      <div className={`relative aspect-[4/3] ${style.imageBg} flex items-center justify-center p-2 sm:p-4 overflow-hidden border-b border-slate-200/70`}>
        {product.image ? (
          customLink ? (
            <Link to={customLink} className="w-full h-full block">
              <img
                src={product.image}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain p-1 sm:p-2 group-hover:scale-108 transition-transform duration-500 ease-out drop-shadow-sm"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src = "/images/card-olflex.jpg";
                }}
              />
            </Link>
          ) : isLappCat1 ? (
            <Link to="/olflex-cables" className="w-full h-full block">
              <img
                src={product.image}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain p-1 sm:p-2 group-hover:scale-108 transition-transform duration-500 ease-out drop-shadow-sm"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src = "/images/card-olflex.jpg";
                }}
              />
            </Link>
          ) : (
            <Link to={`/product/${product.id}`} className="w-full h-full block">
              <img
                src={product.image}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain p-1 sm:p-2 group-hover:scale-108 transition-transform duration-500 ease-out drop-shadow-sm"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src = "/images/card-olflex.jpg";
                }}
              />
            </Link>
          )
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-white/60 rounded-lg">
            <ShieldCheck className="w-8 h-8 sm:w-10 sm:h-10 mb-2 opacity-50 text-blue-500" />
            <span className="text-[10px] sm:text-xs uppercase tracking-wider font-mono font-bold text-center">Industrial Part</span>
          </div>
        )}
      </div>

      {/* Card Content & Metadata */}
      <div className="flex flex-col flex-1 p-3 sm:p-4 items-center text-center justify-center space-y-2">
        {/* Brand pill/logo equivalent */}
        <div>
          <span className={`px-2.5 py-1 rounded-lg border text-[10px] sm:text-[11px] tracking-wider uppercase font-bold ${style.badge}`}>
            {product.brand}
          </span>
        </div>

        {/* Product Title */}
        {customLink ? (
          <Link
            to={customLink}
            className={`text-[12px] sm:text-sm font-bold text-slate-900 ${style.titleHover} transition-colors line-clamp-2 leading-snug`}
          >
            {product.name}
          </Link>
        ) : isLappCat1 ? (
          <Link
            to="/olflex-cables"
            className={`text-[12px] sm:text-sm font-bold text-slate-900 ${style.titleHover} transition-colors line-clamp-2 leading-snug`}
          >
            {product.name}
          </Link>
        ) : (
          <Link
            to={`/product/${product.id}`}
            onClick={() => window.scrollTo(0,0)}
            className={`text-[12px] sm:text-sm font-bold text-slate-900 ${style.titleHover} transition-colors line-clamp-2 leading-snug`}
          >
            {product.name}
          </Link>
        )}
      </div>
    </div>
  );
};
