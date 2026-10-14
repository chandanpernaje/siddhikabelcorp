import React, { useState, useMemo, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Search,
  ShoppingCart,
  User,
  Menu,
  X,
  Zap,
  ArrowRight,
} from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { PRODUCTS_DATA, ALL_OLFLEX_PRODUCTS } from "../../data/products";

export const Header: React.FC = () => {
  const { totalItems, subtotal, openCart } = useCart();
  const { user, openAuthModal, openAccountModal } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const navigate = useNavigate();
  const location = useLocation();
  const inputRef = useRef<HTMLInputElement>(null);

  const allSearchableProducts = useMemo(() => {
    const olflexMapped = ALL_OLFLEX_PRODUCTS.map(p => ({
      id: p.partNo,
      name: p.name,
      partNo: p.partNo,
      brand: p.brand || "LAPP KABEL",
      price: p.price,
      unit: "meter",
      image: "/images/cable-olflex-cores.png",
      application: p.desc || "Industrial Cable",
    }));
    return [...PRODUCTS_DATA, ...olflexMapped];
  }, []);

  // Filter products based on search query
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return allSearchableProducts.filter(
      (p) =>
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.partNo && p.partNo.toLowerCase().includes(q)) ||
        (p.brand && p.brand.toLowerCase().includes(q)) ||
        (p.application && p.application.toLowerCase().includes(q))
    ).slice(0, 8); // Show max 8 results
  }, [searchQuery, allSearchableProducts]);

  // Reset highlighted index when results change
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [filteredProducts]);

  // Focus input when search opens
  useEffect(() => {
    if (searchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [searchOpen]);

  const navigateToProduct = (productId: string) => {
    navigate(`/product/${productId}`);
    setSearchOpen(false);
    setSearchQuery("");
    setHighlightedIndex(-1);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    // If a product is highlighted, navigate to that product
    if (highlightedIndex >= 0 && highlightedIndex < filteredProducts.length) {
      navigateToProduct(filteredProducts[highlightedIndex].id);
      return;
    }

    // If there's exactly one result or results exist, navigate to the first match
    if (filteredProducts.length > 0) {
      navigateToProduct(filteredProducts[0].id);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < filteredProducts.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : filteredProducts.length - 1
      );
    } else if (e.key === "Escape") {
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string, isMobile: boolean = false) => {
    if (isMobile) {
      setMobileMenuOpen(false);
    }
    
    if (path.startsWith("/#") && location.pathname === "/") {
      e.preventDefault();
      const id = path.replace("/#", "");
      const element = document.getElementById(id);
      
      if (element) {
        const headerOffset = 90; // Approximate height of the sticky header
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth"
        });
        window.history.pushState(null, "", path);
      }
    }
  };

  const navLinks = [
    { label: "Products", path: "/#brand-portfolios" },
    { label: "Industries & Solutions", path: "/industries" },
    { label: "Company", path: "/#about" },
    { label: "Contact", path: "/#contact" },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-white text-slate-900 border-b border-slate-200 shadow-sm relative backdrop-blur-xl">
        {/* Bottom glowing multi-color brand accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-zinc-500 via-red-500 to-zinc-400 pointer-events-none" />

        <div className="w-[95%] max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
          {/* Zone 1: Official Siddhi Kabel Logo Lockup */}
          <Link
            to="/"
            className="flex items-center shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded-xl hover:opacity-80 transition-opacity"
            title="Siddhi Kabel Corporation - Authorized Industrial Distributor"
          >
            <img
              src="/images/siddhi-kabel-lockup.png"
              alt="Siddhi Kabel Corporation"
              className="h-8 sm:h-12 w-auto object-contain transition-transform hover:scale-102"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src = "/images/siddhi-kabel-logo.png";
              }}
            />
          </Link>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8 text-sm font-semibold text-slate-800">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.path}
                onClick={(e) => handleNavClick(e, link.path, false)}
                className={`transition-colors py-1 hover:text-red-600 ${
                  location.hash === link.path.replace("/", "")
                    ? "text-red-600 font-bold"
                    : "text-slate-800"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Zone 3: Search, Client Portal & Quotation Cart */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Search Trigger Button */}
            <button
              onClick={() => setSearchOpen(true)}
              className="h-9 w-9 sm:h-11 sm:w-auto px-0 sm:px-3 text-slate-700 hover:text-sky-600 hover:bg-sky-50 rounded-lg sm:rounded-xl transition-colors flex items-center justify-center gap-2 border border-slate-200 shrink-0 bg-white"
              title="Search industrial parts"
              aria-label="Search"
            >
              <Search className="w-[18px] h-[18px] sm:w-4 sm:h-4 text-slate-700 shrink-0" />
              <span className="hidden xl:inline text-xs font-medium text-slate-500">Search Products</span>
            </button>

            {/* Account Profile / Login Button */}
            {user ? (
              <button
                onClick={openAccountModal}
                className="hidden sm:flex h-9 w-9 sm:h-11 sm:w-auto items-center justify-center gap-2 px-0 sm:px-3 rounded-lg sm:rounded-xl bg-white sm:bg-slate-100 border border-slate-200 text-xs text-slate-800 hover:bg-slate-200 transition-colors shrink-0"
                title="Manage B2B Profile & RFQs"
              >
                <div className="w-5 h-5 sm:w-5 sm:h-5 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-[10px] sm:text-[10px] shrink-0">
                  {user.name.charAt(0)}
                </div>
                <span className="hidden sm:block max-w-[110px] truncate font-medium">
                  {user.company || user.name}
                </span>
              </button>
            ) : (
              <button
                onClick={() => openAuthModal("signin")}
                className="hidden sm:flex h-9 w-9 sm:h-11 sm:w-auto px-0 sm:px-3 rounded-lg sm:rounded-xl bg-white sm:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-800 hover:text-slate-900 hover:bg-slate-200 transition-colors items-center justify-center gap-1.5 shrink-0"
              >
                <User className="w-[18px] h-[18px] sm:w-3.5 sm:h-3.5 text-red-600 shrink-0" />
                <span className="hidden sm:inline">Sign In / Sign Up</span>
              </button>
            )}

            {/* Quotation Cart Button */}
            <button
              onClick={openCart}
              className="flex items-center justify-center gap-2 sm:gap-2.5 h-9 w-9 sm:h-11 sm:w-auto px-0 sm:px-3 rounded-lg sm:rounded-xl bg-[#c52328] sm:bg-gradient-to-r sm:from-red-600 sm:via-red-700 sm:to-red-800 hover:opacity-90 sm:hover:from-red-700 sm:hover:to-red-900 text-white font-bold transition-all group relative active:scale-95 border border-transparent sm:border-red-500/40 shrink-0 shadow-none sm:shadow-md sm:shadow-red-600/20"
              aria-label="Quotation Cart"
            >
              <div className="relative shrink-0 flex items-center justify-center">
                <ShoppingCart className="w-[18px] h-[18px] sm:w-4 sm:h-4 text-white sm:group-hover:scale-105 transition-transform" />
                {totalItems > 0 && (
                  <span className="absolute -top-3 -right-3 sm:-top-2.5 sm:-right-3.5 bg-slate-600 sm:bg-zinc-900 text-white border-2 border-white sm:border-zinc-700 font-bold sm:font-black text-[9px] rounded-full min-w-[20px] px-1 h-5 flex items-center justify-center tabular-nums shadow-sm">
                    {totalItems > 99 ? "99+" : totalItems}
                  </span>
                )}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-red-100/90 leading-none">
                  Quotation Cart
                </span>
                <span className="text-[11px] font-mono font-black text-white tabular-nums">
                  ₹{subtotal.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                </span>
              </div>
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="lg:hidden h-9 w-9 sm:h-11 sm:w-auto px-0 sm:px-3 bg-white text-slate-700 hover:text-slate-900 rounded-lg sm:rounded-xl hover:bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 shrink-0" /> : <Menu className="w-5 h-5 shrink-0" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-4 sm:px-6 py-4 space-y-3.5 shadow-xl text-slate-900">
            <div className="space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.path}
                  onClick={(e) => handleNavClick(e, link.path, true)}
                  className="block px-3 py-2.5 text-sm font-semibold text-slate-800 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-3">
              {user ? (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAccountModal();
                  }}
                  className="text-xs font-semibold text-blue-600 flex items-center gap-1.5"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>{user.company || user.name}</span>
                </button>
              ) : (
                <div className="flex items-center gap-2 w-full">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      openAuthModal("signin");
                    }}
                    className="flex-1 py-2 px-3 rounded-xl bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <User className="w-4 h-4 text-white" />
                    <span>Sign In</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Elegant Full Search Modal Overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-start justify-center pt-16 sm:pt-28 px-4" onClick={() => { setSearchOpen(false); setSearchQuery(""); }}>
          <div
            className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-2xl relative animate-in fade-in zoom-in duration-150 text-slate-900 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <Search className="w-4 h-4 text-sky-600" />
                <span>Search Products</span>
              </div>
              <button
                onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input */}
            <form onSubmit={handleSearch} className="px-5 py-4">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search by product name, part number, or brand..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  autoFocus
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-16 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold px-2 py-1 rounded-md hover:bg-slate-100"
                  >
                    Clear
                  </button>
                )}
              </div>
            </form>

            {/* Product Results */}
            {searchQuery.trim() && (
              <div className="border-t border-slate-100">
                {filteredProducts.length > 0 ? (
                  <div className="max-h-[360px] overflow-y-auto">
                    <div className="px-5 pt-3 pb-1">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        {filteredProducts.length} Product{filteredProducts.length !== 1 ? 's' : ''} Found
                      </span>
                    </div>
                    {filteredProducts.map((product, index) => (
                      <button
                        key={product.id}
                        onClick={() => navigateToProduct(product.id)}
                        className={`w-full flex items-center gap-4 px-5 py-3 text-left transition-colors ${
                          highlightedIndex === index
                            ? "bg-sky-50 border-l-2 border-sky-500"
                            : "hover:bg-slate-50 border-l-2 border-transparent"
                        }`}
                      >
                        {/* Product Image */}
                        <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-contain p-1"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.onerror = null;
                              target.src = "/images/card-olflex.jpg";
                            }}
                          />
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-bold text-slate-900 truncate">
                            {product.name}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[11px] font-semibold text-blue-600">
                              {product.brand}
                            </span>
                            <span className="text-slate-300">·</span>
                            <span className="text-[11px] font-mono text-slate-500">
                              {product.partNo}
                            </span>
                          </div>
                        </div>

                        {/* Price & Arrow */}
                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-right">
                            <span className="text-sm font-black font-mono text-slate-900">
                              ₹{product.price.toLocaleString("en-IN")}
                            </span>
                            <span className="text-[10px] text-slate-400 block">
                              /{product.unit}
                            </span>
                          </div>
                          <ArrowRight className="w-4 h-4 text-slate-400" />
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="px-5 py-8 text-center">
                    <div className="text-sm font-semibold text-slate-500">
                      No products found for "{searchQuery}"
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      Try searching by product name, part number, or brand
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Quick Search Hints (shown when no query) */}
            {!searchQuery.trim() && (
              <div className="px-5 pb-5 border-t border-slate-100 pt-3">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Popular Quick Searches:
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  {["ÖLFLEX CLASSIC 110", "EATON PKZM0", "Mennekes 32A Plug", "Partex PA-1"].map((term) => (
                    <button
                      key={term}
                      onClick={() => setSearchQuery(term)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-sky-100 hover:text-sky-800 text-slate-700 rounded-lg transition-colors font-medium"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Keyboard hint */}
            <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center gap-4 text-[10px] text-slate-400 font-medium">
              <span><kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-mono shadow-xs">↑↓</kbd> Navigate</span>
              <span><kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-mono shadow-xs">Enter</kbd> Go to product</span>
              <span><kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-mono shadow-xs">Esc</kbd> Close</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};


