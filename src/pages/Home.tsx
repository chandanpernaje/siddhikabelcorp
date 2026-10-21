import React, { useState, useMemo, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  CheckCircle2,
  FileSpreadsheet,
  ArrowRight,
  Search,
  Zap,
  Phone,
  Mail,
  MapPin,
  Clock,
  Upload,
  Paperclip,
  Award,
  Truck,
  Users,
  X,
  Lock,
} from "lucide-react";
import { PRODUCTS_DATA, CATEGORIES, BRANDS } from "../data/products";
import { ProductCard } from "../components/products/ProductCard";
import { QuickViewModal } from "../components/ui/QuickViewModal";
import { RFQModal } from "../components/ui/RFQModal";
import { CustomCuttingModal } from "../components/ui/CustomCuttingModal";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import type { Product, QuotationDocument, QuotationItem } from "../types";

export const Home: React.FC = () => {
  const location = useLocation();
  const { addToCart } = useCart();
  const { user, isAuthenticated, openAuthModal, saveQuote } = useAuth();
  const { showToast } = useToast();

  // Carousel State
  const [currentSlide, setCurrentSlide] = useState(0);

  // Catalog Filtering State
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedBrand, setSelectedBrand] = useState("lapp");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc" | "name">("featured");
  const [showCatalog, setShowCatalog] = useState(true);

  // Modals
  const [brandModal, setBrandModal] = useState<string | null>(null);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [rfqModalOpen, setRfqModalOpen] = useState(false);
  const [isCuttingModalOpen, setIsCuttingModalOpen] = useState(false);
  const [rfqProductName, setRfqProductName] = useState<string | null>(null);
  const [rfqProductPrice, setRfqProductPrice] = useState<number | null>(null);

  // RFQ Form Section State
  const [rfqCompany, setRfqCompany] = useState(user?.company || "");
  const [rfqName, setRfqName] = useState(user?.name || "");
  const [rfqEmail, setRfqEmail] = useState(user?.email || "");
  const [rfqPhone, setRfqPhone] = useState(user?.phone || "");
  const [rfqGstin, setRfqGstin] = useState(user?.gstin || "");
  const [rfqCategory, setRfqCategory] = useState("lapp");
  const [rfqQuantity, setRfqQuantity] = useState("500");
  const [rfqCity, setRfqCity] = useState(user?.city || "Bangalore");
  const [rfqNotes, setRfqNotes] = useState("");
  const [rfqFiles, setRfqFiles] = useState<{ name: string; size: number }[]>([]);
  const [rfqSubmitting, setRfqSubmitting] = useState(false);
  const [rfqSuccessRef, setRfqSuccessRef] = useState<string | null>(null);

  // Sync user state to RFQ form if user logs in
  useEffect(() => {
    if (user) {
      if (!rfqCompany) setRfqCompany(user.company || "");
      if (!rfqName) setRfqName(user.name);
      if (!rfqEmail) setRfqEmail(user.email);
      if (!rfqPhone) setRfqPhone(user.phone || "");
      if (!rfqGstin) setRfqGstin(user.gstin || "");
    }
  }, [user]);

  // Handle URL hashes for smooth scrolling & catalog visibility
  useEffect(() => {
    if (location.hash === "#catalog" || location.search.includes("search")) {
      setShowCatalog(true);
    }
    if (location.hash) {
      const id = location.hash.replace("#", "");
      const el = document.getElementById(id);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: "smooth" });
        }, 150);
      }
    }
    const params = new URLSearchParams(location.search);
    const search = params.get("search");
    if (search) {
      setSearchQuery(search);
      setShowCatalog(true);
    }
  }, [location]);

  // Auto-advance Carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 5);
    }, 12000);
    return () => clearInterval(timer);
  }, []);

  // Touch swipe support for mobile
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (Math.abs(distance) >= minSwipeDistance) {
      if (distance > 0) {
        // Swipe left → next slide
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      } else {
        // Swipe right → previous slide
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
      }
    }
    setTouchStart(null);
    setTouchEnd(null);
  };

  const slides = [
    {
      brand: "LAPP KABEL STUTTGART",
      origin: "Germany",
      logo: "/images/logo-lapp.png",
      tagline: "World's First Flexible Control Cable | Ready Stock",
      headline: "ÖLFLEX® CLASSIC 110",
      description:
        "High flexibility, flame retardant to IEC 60332-1, and certified oil resistance. Available in over 100 core and cross-section combinations directly from Bangalore warehouse.",
      img: "/images/promo-lapp.jpg",
      badge: "VDE REG. NO. 7030",
      ctaText: "Open ÖLFLEX® Center",
      ctaLink: "/olflex-cables",
      productSampleId: "lapp-01",
      bgClass: "bg-gradient-to-r from-orange-100 via-orange-50 to-white border-orange-200",
      pillClass: "bg-orange-200 text-orange-800 border-orange-300",
      btnClass: "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-orange-500/30",
      cardBorder: "border-orange-300",
      taglineColor: "text-orange-600",
      textColor: "text-slate-900",
      descColor: "text-slate-700",
      btnSecondary: "bg-white hover:bg-orange-50 border-orange-200 text-orange-900",
      badgeClass: "bg-orange-200 text-orange-800 border-orange-300",
      cardOverlay: "bg-white/80",
      cardBottom: "bg-white/90 border-orange-100 text-slate-800",
      iconColor: "text-orange-500",
      fullBg: "bg-orange-50"
    },
    {
      brand: "EATON - MOELLER",
      origin: "Germany / USA",
      logo: "/images/logo-eaton.png",
      tagline: "Motor Protection Breakers & Contactors",
      headline: "PKZM0 & DILM Series",
      description:
        "Switching capacity up to 150 kA, differential phase-failure sensitivity, and electronic wide-range coil technology for modern automated industrial panels.",
      img: "/images/promo-eaton.jpg",
      badge: "DIRECT FACTORY RATES",
      ctaText: "Explore Eaton Switchgear",
      ctaLink: "/about-eaton",
      productSampleId: "eaton-01",
      bgClass: "bg-gradient-to-r from-sky-100 via-slate-100/70 to-white border-sky-200",
      pillClass: "bg-sky-200 text-sky-900 border-sky-300",
      btnClass: "bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white shadow-blue-500/30",
      cardBorder: "border-sky-300",
      taglineColor: "text-sky-700",
      textColor: "text-slate-900",
      descColor: "text-slate-700",
      btnSecondary: "bg-white hover:bg-slate-100 border-slate-300 text-slate-800",
      badgeClass: "bg-slate-200 text-slate-800 border-slate-300",
      cardOverlay: "bg-white/80",
      cardBottom: "bg-white/90 border-sky-100 text-slate-800",
      iconColor: "text-sky-600",
      fullBg: "bg-sky-50"
    },
    {
      brand: "MENNEKES GERMANY",
      origin: "Germany",
      logo: "/images/logo-mennekes.png",
      tagline: "Industrial CEE Pin & Sleeve Standards",
      headline: "IP44 & IP67 Plugs & Sockets",
      description:
        "Manufactured using robust Polyamide 6 material and premium nickel-plated contacts for ultimate durability. We offer exclusive factory box rates tailored for machine builders and large-scale industrial projects.",
      img: "/images/promo-mennekes.jpg",
      badge: "OEM BOX RATES",
      ctaText: "Explore Mennekes",
      ctaLink: "/about-mennekes",
      productSampleId: "menn-01",
      bgClass: "bg-gradient-to-r from-red-50 via-white to-red-50/90 border-red-200/50",
      pillClass: "bg-red-100 text-red-700 border-red-200",
      btnClass: "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-red-500/30",
      cardBorder: "border-red-200",
      taglineColor: "text-red-600",
      textColor: "text-slate-900",
      descColor: "text-slate-600",
      btnSecondary: "bg-white hover:bg-red-50 border-red-200 text-red-900",
      badgeClass: "bg-red-100 text-red-700 border-red-200",
      cardOverlay: "bg-white/80",
      cardBottom: "bg-white/90 border-red-100 text-slate-800",
      iconColor: "text-red-500",
      fullBg: "bg-red-50"
    },
    {
      brand: "PARTEX SWEDEN",
      origin: "Sweden",
      logo: "/images/logo-partex.png",
      tagline: "Swedish Precision Wire Identification",
      headline: "PA Markers & ProMark Series",
      description:
        "Interlocking chevron cut guarantees alignment. Self-extinguishing UL94-V0 PVC and high-speed portable thermal printers for control panel builders and switchboard makers.",
      img: "/images/promo-partex.jpg",
      badge: "FREE SAMPLE KIT ON RFQ",
      ctaText: "Explore Partex Marking",
      ctaLink: "/about-partex",
      productSampleId: "partex-01",
      bgClass: "bg-gradient-to-r from-slate-100 via-white to-slate-100/90 border-slate-200/50",
      pillClass: "bg-slate-200 text-slate-700 border-slate-300",
      btnClass: "bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white shadow-slate-500/30",
      cardBorder: "border-slate-300",
      taglineColor: "text-slate-600",
      textColor: "text-slate-900",
      descColor: "text-slate-600",
      btnSecondary: "bg-white hover:bg-slate-50 border-slate-300 text-slate-900",
      badgeClass: "bg-slate-200 text-slate-700 border-slate-300",
      cardOverlay: "bg-white/80",
      cardBottom: "bg-white/90 border-slate-200 text-slate-800",
      iconColor: "text-slate-500",
      fullBg: "bg-slate-50"
    },
    {
      brand: "LAPP INDIA",
      origin: "India",
      logo: "/images/logo-lapp.png",
      tagline: "🔥 Clearance Sale — Limited Time Only!",
      headline: "Clearance Sale - 50% OFF",
      description:
        "This would be limited time sale. Act quickly! Massive clearance on genuine LAPP products. Direct factory warranty, full GST ITC eligible. Stock is limited, first come first served.",
      img: "/images/slider5.jpg",
      badge: "CLEARANCE SALE",
      ctaText: "Shop Now — Hurry!",
      ctaLink: "#catalog",
      productSampleId: "lapp-01",
      bgClass: "bg-gradient-to-r from-orange-100 via-orange-50 to-white border-orange-200",
      pillClass: "bg-orange-200 text-orange-800 border-orange-300",
      btnClass: "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-orange-500/30",
      cardBorder: "border-orange-300",
      taglineColor: "text-orange-600",
      textColor: "text-slate-900",
      descColor: "text-slate-700",
      btnSecondary: "bg-white hover:bg-orange-50 border-orange-200 text-orange-900",
      badgeClass: "bg-orange-200 text-orange-800 border-orange-300",
      cardOverlay: "bg-white/80",
      cardBottom: "bg-white/90 border-orange-100 text-slate-800",
      iconColor: "text-orange-500",
      fullBg: "bg-orange-50",
      isFullBanner: false
    }
  ] as const;

  // Filter Catalog
  const filteredProducts = useMemo(() => {
    let result = [...PRODUCTS_DATA];

    if (selectedCategory !== "all") {
      result = result.filter((p) => p.category === selectedCategory || p.id === selectedCategory);
    }

    if (selectedBrand !== "all") {
      result = result.filter((p) => p.brand.toLowerCase().includes(selectedBrand.toLowerCase()));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.partNo.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.specs.some((s) => s.toLowerCase().includes(q))
      );
    }

    if (sortBy === "price-asc") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === "name") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [selectedCategory, selectedBrand, searchQuery, sortBy]);

  const handleRfqFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const arr = Array.from(e.target.files).map((f) => ({
        name: f.name,
        size: f.size,
      }));
      setRfqFiles((prev) => [...prev, ...arr]);
      showToast(`Attached ${arr.length} file(s) to RFQ`, "info");
    }
  };

  const handleRfqSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !user) {
      showToast("Please log in or create an account to submit an RFQ to our team.", "error");
      openAuthModal("signin");
      return;
    }

    setRfqSubmitting(true);

    const refNo = `SE-BOM-${Date.now().toString().slice(-6)}`;

    const qty = parseFloat(rfqQuantity) || 100;
    const estRate = 85.0;
    const sub = qty * estRate;
    const gst = sub * 0.18;

    const mockItem: QuotationItem = {
      id: `bom-${Date.now()}`,
      partNo: "BOM-SCHEDULE",
      name: `Project BOM Schedule (${rfqCategory.toUpperCase()})`,
      brand: rfqCategory.toUpperCase(),
      hsnCode: "85444990",
      unit: "lot",
      qty: 1,
      unitPrice: sub,
      totalBeforeTax: sub,
      gstRate: 18,
      gstAmount: gst,
      totalWithTax: sub + gst,
    };

    const doc: QuotationDocument = {
      id: refNo,
      quoteNo: refNo,
      date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      validUntil: new Date(Date.now() + 30 * 86400000).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      customerName: rfqName,
      companyName: rfqCompany,
      gstin: rfqGstin,
      email: rfqEmail,
      phone: rfqPhone,
      address: "Project Site Delivery",
      city: rfqCity,
      state: "Karnataka",
      pincode: "560001",
      items: [mockItem],
      subtotal: sub,
      cgst: gst / 2,
      sgst: gst / 2,
      igst: 0,
      isInterstate: false,
      freight: 0,
      grandTotal: sub + gst,
      deliveryTerms: "Ex-Bangalore Central Warehouse",
      paymentTerms: "Standard Corporate Credit Terms",
      status: "Generated",
      notes: rfqNotes,
    };

    const success = await saveQuote(doc);
    setRfqSubmitting(false);
    if (success) {
      setRfqSuccessRef(refNo);
      showToast("Quotation request registered! Reference generated.", "success");
    }
  };

  const brandCardStyles: Record<string, { bg: string; border: string; strip: string; badge: string; text: string }> = {
    lapp: {
      bg: "bg-gradient-to-br from-orange-500/15 via-orange-50 to-amber-100/70",
      border: "border-orange-300 hover:border-orange-500 shadow-orange-500/10",
      strip: "border-t-4 border-t-orange-500",
      badge: "bg-orange-200 text-orange-950 font-bold",
      text: "text-orange-800 hover:text-orange-950",
    },
    eaton: {
      bg: "bg-gradient-to-br from-blue-500/15 via-sky-50 to-blue-100/70",
      border: "border-blue-300 hover:border-blue-500 shadow-blue-500/10",
      strip: "border-t-4 border-t-blue-500",
      badge: "bg-blue-200 text-blue-950 font-bold",
      text: "text-blue-800 hover:text-blue-950",
    },
    mennekes: {
      bg: "bg-gradient-to-br from-red-500/15 via-red-50 to-red-100/70",
      border: "border-red-300 hover:border-red-500 shadow-red-500/10",
      strip: "border-t-4 border-t-red-500",
      badge: "bg-red-200 text-red-950 font-bold",
      text: "text-red-800 hover:text-red-950",
    },
    partex: {
      bg: "bg-gradient-to-br from-slate-500/15 via-slate-50 to-gray-100/70",
      border: "border-slate-300 hover:border-slate-500 shadow-slate-500/10",
      strip: "border-t-4 border-t-slate-500",
      badge: "bg-slate-200 text-slate-950 font-bold",
      text: "text-slate-800 hover:text-slate-950",
    },
  };

  return (
    <main className="flex flex-col gap-0">
      {/* Spacer wrapper for sections after the hero */}
      {/* ======================================================== */}
      {/* HERO BANNER CAROUSEL SLIDER                               */}
      {/* ======================================================== */}
      {/* ======================================================== */}
      {/* HERO BANNER CAROUSEL SLIDER                               */}
      {/* ======================================================== */}
      {/* ======================================================== */}
      {/* HERO BANNER CAROUSEL SLIDER                               */}
      {/* ======================================================== */}
      <section className="w-full text-slate-900 bg-white border-b border-slate-200 shadow-sm relative overflow-hidden">
        <div className="w-full relative">
          <div className="relative" onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
            {slides.map((slide, idx) => {
              const isActive = idx === currentSlide;
              if (!isActive) return null;


              if ((slide as any).isFullBanner) {
                return (
                  <div
                    key={slide.brand}
                    className={`relative w-full min-h-[260px] sm:min-h-[300px] md:min-h-[340px] z-10 animate-in fade-in duration-500 cursor-pointer overflow-hidden ${slide.fullBg}`}
                    onClick={() => {
                      setSelectedCategory("all");
                      setSelectedBrand("lapp");
                      setShowCatalog(true);
                      setTimeout(() => {
                        const catEl = document.getElementById("catalog");
                        if (catEl) catEl.scrollIntoView({ behavior: "smooth" });
                      }, 100);
                    }}
                  >
                    <img src={slide.img} alt="Clearance Sale" className="absolute inset-0 w-full h-full object-cover object-center" />
                  </div>
                );
              }

              return (
                <div
                  key={slide.brand}
                  className={`w-full relative z-10 animate-in fade-in duration-500 ${slide.bgClass}`}
                >
                  <div className="w-[95%] max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_420px] gap-5 lg:gap-8 items-center pt-6 pb-14 lg:pt-8 lg:pb-14">
                  {/* Left Side — Text Container */}
                  <div className="flex flex-col justify-center space-y-3.5 z-10">
                    {/* Brand Logo & Country Origin Pill */}
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="bg-white px-3 py-1.5 rounded-xl flex items-center shadow-sm border border-slate-100 h-10">
                        <img src={slide.logo} alt={slide.brand} className="h-6 sm:h-7 object-contain" />
                      </div>
                      <span className={`text-[11px] font-mono uppercase px-2.5 py-1 rounded-md font-bold ${slide.pillClass}`}>
                        {slide.origin}
                      </span>
                      {slide.badge && (
                        <span className={`text-[11px] font-mono uppercase px-2.5 py-1 rounded-md font-bold ${slide.badgeClass}`}>
                          {slide.badge}
                        </span>
                      )}
                    </div>

                    {/* Subtitle / Eyebrow Text */}
                    <span className={`${slide.taglineColor} font-extrabold text-xs tracking-widest uppercase`}>
                      {slide.tagline}
                    </span>

                    {/* Main Heading */}
                    <h1 className={`text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight ${slide.textColor}`}>
                      {slide.headline}
                    </h1>

                    {/* Description Paragraph */}
                    <p className={`${slide.descColor} text-xs sm:text-sm max-w-3xl leading-snug font-medium`}>
                      {slide.description}
                    </p>

                    {/* CTA Buttons Group */}
                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <Link
                        to={slide.ctaLink}
                        className={`px-5 py-2 font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 shadow-md ${slide.btnClass}`}
                      >
                        <span>{slide.ctaText}</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>

                      <button
                        onClick={() => {
                          const brandId = slide.brand.toLowerCase().includes("lapp")
                            ? "lapp"
                            : slide.brand.toLowerCase().includes("eaton")
                            ? "eaton"
                            : slide.brand.toLowerCase().includes("mennekes")
                            ? "mennekes"
                            : "partex";
                          setSelectedBrand(brandId);
                          setSelectedCategory("all");
                          setShowCatalog(true);
                          setTimeout(() => {
                            const catEl = document.getElementById("catalog");
                            if (catEl) catEl.scrollIntoView({ behavior: "smooth" });
                          }, 100);
                        }}
                        className={`px-4 py-2 font-bold text-xs rounded-xl transition-colors backdrop-blur-sm flex items-center gap-2 cursor-pointer shadow-sm ${slide.btnSecondary}`}
                      >
                        <span>Explore {slide.brand.split(" ")[0]} Catalog ⚡</span>
                      </button>
                    </div>
                  </div>

                  {/* Right Side — Image / Media Container */}
                  <div className="relative flex justify-center lg:justify-end items-center z-10 w-full mt-0">
                    <div 
                      className={`relative w-full max-w-[420px] aspect-[16/10] rounded-2xl overflow-hidden border ${slide.cardBorder} shadow-2xl ${slide.cardOverlay} group cursor-pointer`}
                      onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
                    >
                      <img src={slide.img} alt={slide.brand} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      <div className={`absolute bottom-0 inset-x-0 backdrop-blur-md p-3 px-4 border-t flex justify-between items-center text-xs font-semibold ${slide.cardBottom}`}>
                        <span>{slide.brand}</span>
                        <Zap className={`w-4 h-4 ${slide.iconColor}`} />
                      </div>
                    </div>
                  </div>
                  </div>
                </div>
              );
            })}

            {/* Navigation Arrows */}
            <button
              onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
              aria-label="Previous Slide"
              className="absolute left-1 top-[80%] sm:top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-slate-800 border border-slate-200 flex items-center justify-center transition-all z-20 cursor-pointer shadow-md backdrop-blur-sm"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
              aria-label="Next Slide"
              className="absolute right-1 top-[80%] sm:top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-slate-800 border border-slate-200 flex items-center justify-center transition-all z-20 cursor-pointer shadow-md backdrop-blur-sm"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Carousel Indicator Dots */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-2.5 rounded-full transition-all cursor-pointer ${
                    idx === currentSlide
                      ? "w-7 bg-blue-500 shadow-sm"
                      : "w-2.5 bg-slate-300 hover:bg-slate-400"
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* AUTHORIZED BRAND PORTFOLIO CARDS                         */}
      {/* ======================================================== */}
      <section className="w-full pt-16 pb-8 bg-white text-slate-900">
        <div className="w-[95%] max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center text-center space-y-3 mb-10">
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
              Trusted Partners
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
              Our Authorised Brand Partners
            </h2>
            <p className="text-sm sm:text-base text-slate-500 font-medium max-w-2xl">
              Siddhi Kabel is the certified regional distributor and factory-direct partner for world-leading electrical brands.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {BRANDS.map((brand) => {
              const bStyle = brandCardStyles[brand.id] || brandCardStyles.partex;
              return (
                <a
                  key={brand.id}
                  href={`#brand-section-${brand.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    const el = document.getElementById(`brand-section-${brand.id}`);
                    if (el) {
                      const yOffset = -80; // Adjust for sticky header
                      const y = el.getBoundingClientRect().top + window.scrollY + yOffset;
                      window.scrollTo({ top: y, behavior: 'smooth' });
                    }
                  }}
                  className={`group relative flex flex-col items-center text-center p-6 sm:p-8 rounded-2xl border transition-all duration-300 overflow-hidden ${bStyle.bg} ${bStyle.border} ${bStyle.strip}`}
                >
                  <div className="bg-white w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center shadow-sm border border-white/50 mb-5 relative z-10 group-hover:scale-105 transition-transform duration-300">
                    <img src={brand.logo} alt={brand.name} className="max-w-[70%] max-h-[70%] object-contain" />
                  </div>
                  <h3 className={`text-lg sm:text-xl font-black tracking-tight mb-2 relative z-10 ${bStyle.text}`}>
                    {brand.name}
                  </h3>
                  <p className="text-sm text-slate-600 font-medium relative z-10 leading-snug">
                    <span className="block font-bold text-slate-400 text-xs mb-0.5 uppercase tracking-wider">{brand.origin}</span>
                    {brand.description.split('.')[0]}
                  </p>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 1. AUTHORIZED BRAND PORTFOLIOS: CONTINUOUS CATALOG */}
      {/* ======================================================== */}
      <section id="brand-portfolios" className="w-full scroll-mt-24 pt-12 lg:pt-16 pb-12 lg:pb-16 bg-slate-50 border-y border-slate-200 text-slate-900 shadow-sm">
        <div className="w-[95%] max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10 lg:space-y-12">
{BRANDS.map((brand: any) => {
            const brandProducts = PRODUCTS_DATA.filter((p) => p.brand.toLowerCase().includes(brand.id));
            const displayProducts = brandProducts.slice(0, 6);
            
            if (displayProducts.length === 0) return null;
            
            const brandStyles: any = {
              lapp: { bg: "bg-orange-500", text: "text-orange-600", hover: "hover:bg-orange-600" },
              eaton: { bg: "bg-blue-600", text: "text-blue-600", hover: "hover:bg-blue-700" },
              mennekes: { bg: "bg-red-600", text: "text-red-600", hover: "hover:bg-red-700" },
              partex: { bg: "bg-zinc-600", text: "text-zinc-700", hover: "hover:bg-zinc-700" },
            };
            const bStyle = brandStyles[brand.id] || brandStyles.partex;
            
            // Map the link to dedicated pages
            const brandLink = `/about-${brand.id}`;

            return (
              <div id={`brand-section-${brand.id}`} key={brand.id} className="space-y-4 lg:space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Brand Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-slate-200 pb-4">
                  {/* Left Side: Text */}
                  <div className="space-y-1 flex-1">
                    <Link to={brandLink} onClick={() => window.scrollTo(0,0)} className="hover:opacity-80 transition-opacity">
                      <h3 className={`text-2xl sm:text-3xl font-black tracking-tight ${bStyle.text}`}>
                        {brand.name.split(" ")[0]} Products
                      </h3>
                    </Link>
                    <p className="hidden sm:block text-sm text-slate-500 font-medium max-w-xl line-clamp-1">{brand.description}</p>
                  </div>
                  
                  {/* Right Side: Logo & Button */}
                  <div className="flex items-center gap-4 shrink-0 justify-between sm:justify-end w-full sm:w-auto">
                    <Link to={brandLink} onClick={() => window.scrollTo(0,0)} className="bg-white p-2.5 rounded-2xl border border-slate-200 shadow-sm h-14 sm:h-16 w-32 sm:w-40 flex items-center justify-center shrink-0 hover:border-blue-400 hover:shadow-md transition-all">
                      <img src={brand.logo} alt={brand.name} className="max-h-8 sm:max-h-10 w-auto object-contain" />
                    </Link>
                    
                    {brandProducts.length > 6 && (
                      <Link
                        to={brandLink}
                        onClick={() => window.scrollTo(0,0)}
                        className={`hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white ${bStyle.bg} ${bStyle.hover} transition-all hover:scale-105 shadow-md shrink-0`}
                      >
                        View More
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    )}
                  </div>
                </div>

                {/* 6 Products Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
                  {displayProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      customLink={
                        product.id === "lapp-cat-1" ? "/olflex-cables" :
                        product.id === "lapp-cat-2" ? "/olflex-cables?group=unitronic" :
                        product.id === "lapp-cat-3" ? "/olflex-cables?group=uniplus" :
                        product.id === "lapp-cat-4" ? "/olflex-cables?group=skintop" :
                        product.id === "lapp-cat-5" ? "/olflex-cables?group=silvyn" :
                        product.id === "lapp-cat-6" ? "/olflex-cables?group=infra" :
                        brand.path
                      }
                      onQuickView={(p) => setQuickViewProduct(p)}
                      onDirectQuote={(p) => { setRfqProductName(`${p.name} (${p.partNo})`); setRfqProductPrice(p.price); setRfqModalOpen(true); }}
                    />
                  ))}
                </div>

                {/* Mobile View More */}
                {brandProducts.length > 6 && (
                  <div className="sm:hidden flex justify-center pt-2">
                    <Link
                      to={brandLink}
                      onClick={() => window.scrollTo(0,0)}
                      className={`flex w-full justify-center items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white ${bStyle.bg} shadow-md`}
                    >
                      View All {brand.name.split(" ")[0]}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>


      {/* ======================================================== */}
      {/* 7. ABOUT COMPANY SECTION                                 */}
      {/* ======================================================== */}
      <section id="about" className="w-full scroll-mt-24 pt-8 lg:pt-12 pb-12 lg:pb-16 bg-white border-b border-slate-200 text-slate-900 shadow-sm">
        <div className="w-[95%] max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Text Content */}
            <div className="space-y-4">
              <div className="text-xs font-mono uppercase tracking-wider text-blue-700 font-bold">
                Company Profile
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Siddhi Kabel Corporation Private Limited
              </h2>
              <div className="space-y-3 text-sm sm:text-base text-slate-700 leading-relaxed font-medium">
                <p>
                  Siddhi Kabel Corporation Private Limited is one of the leading and reliable suppliers of world class Industrial Electrical, Automation & Safety Products.
                </p>
                <p>
                  We at Siddhi Kabel specialize in providing solutions for high quality industrial products. Our primary focus is to service the needs of our customers for high quality products and services, with more than 15 years of experience in industrial Electrical field and association with leading national and multinational customers & Suppliers, Siddhi Kabel offers superior quality products coupled with best technical support.
                </p>
              </div>
            </div>

            {/* Image Content */}
            <div className="relative w-full rounded-2xl overflow-hidden shadow-xl border border-slate-200 group bg-slate-50 flex items-center justify-center">
              <div className="absolute inset-0 bg-slate-900/5 group-hover:bg-transparent transition-colors duration-500 z-10 pointer-events-none" />
              <img 
                src="/images/company-profile.jpg" 
                alt="Industrial Automation and Robotics - Siddhi Kabel" 
                className="w-full h-auto object-contain group-hover:scale-105 transition-transform duration-700 ease-out"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-200/80 text-xs">
            <div className="space-y-2 p-5 rounded-2xl bg-gradient-to-br from-blue-500/10 via-blue-50/60 to-white border border-blue-200 shadow-xs">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span>15+ Years Experience</span>
              </h4>
              <p className="text-slate-600 leading-relaxed font-medium">
                More than 15 years of technical experience in the industrial electrical field, serving leading national and multinational customers & suppliers with best technical support.
              </p>
            </div>

            <div className="space-y-2 p-5 rounded-2xl bg-gradient-to-br from-blue-500/10 via-sky-50/60 to-white border border-blue-200 shadow-xs flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2 mb-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <span>Warehouse Infrastructure</span>
                </h4>
                <p className="text-slate-600 leading-relaxed font-medium">
                  Equipped with motorized cable decoilers, drum handling cranes, and specialized cutting stations to provide exact length requirements without charging for unnecessary scrap.
                </p>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setIsCuttingModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                >
                  <span>Need Custom Cutting? Request Lengths</span>
                </button>
              </div>
            </div>

            <div className="space-y-2 p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-emerald-50/60 to-white border border-emerald-200 shadow-xs">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Transparent Commercials</span>
              </h4>
              <p className="text-slate-600 leading-relaxed font-medium">
                Full 18% GST Input Tax Credit (ITC) compliance, formal commercial quotations with price firm commitments, and structured credit facilities for verified industrial corporate accounts.
              </p>
            </div>
            </div>
            {/* 4 Trust Metrics Cards */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-8 border-t border-slate-200/80">
          {/* Card 1: Amber / Ready stock */}
          <div className="space-y-2 p-5 rounded-2xl bg-gradient-to-br from-blue-500/10 via-blue-50/60 to-white border border-blue-200 shadow-xs">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-500" />
              <span>25,000m+ Ready Stock</span>
            </h4>
            <p className="text-slate-600 leading-relaxed font-medium text-xs">
              Maintained in Bangalore central depot across ÖLFLEX® cables, CEE plugs, and motor breakers.
            </p>
          </div>

          {/* Card 2: Blue / OEM Genuine */}
          <div className="space-y-2 p-5 rounded-2xl bg-gradient-to-br from-blue-500/10 via-sky-50/60 to-white border border-blue-200 shadow-xs">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Award className="w-4 h-4 text-blue-500" />
              <span>100% OEM Genuine</span>
            </h4>
            <p className="text-slate-600 leading-relaxed font-medium text-xs">
              Direct factory warranty with manufacturer batch test reports (VDE, UL, CSA, CE, RoHS).
            </p>
          </div>

          {/* Card 3: Emerald / Rapid Dispatch */}
          <div className="space-y-2 p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-emerald-50/60 to-white border border-emerald-200 shadow-xs">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Truck className="w-4 h-4 text-emerald-500" />
              <span>24-48 Hrs Dispatch</span>
            </h4>
            <p className="text-slate-600 leading-relaxed font-medium text-xs">
              Immediate same-day or next-day dispatch for Peenya, Bommasandra, Hosur, and South-India sites.
            </p>
          </div>

          {/* Card 4: Purple / Corporate Clients */}
          <div className="space-y-2 p-5 rounded-2xl bg-gradient-to-br from-purple-500/10 via-purple-50/60 to-white border border-purple-200 shadow-xs">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-500" />
              <span>1,200+ Corporate Clients</span>
            </h4>
            <p className="text-slate-600 leading-relaxed font-medium text-xs">
              Trusted by automation OEMs, panel builders, switchgear fabricators, and infrastructure leaders.
            </p>
          </div>
          </div>
        </div>
      </section>


      {/* ======================================================== */}
      {/* 5. RFQ & BULK QUOTATION FORM: CLEAN WHITE PANEL          */}
      {/* ======================================================== */}
      {/* ======================================================== */}
      {/* 5. RFQ & BULK QUOTATION FORM: CLEAN WHITE PANEL          */}
      {/* ======================================================== */}
      <section id="rfq" className="w-full bg-white scroll-mt-24 pt-6 lg:pt-8 pb-6 lg:pb-8 text-slate-900 relative">
        <div className="w-[95%] max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="rounded-3xl bg-white border border-slate-200 shadow-xl p-6 sm:p-10 lg:p-12 relative overflow-hidden">
          {/* Subtle blue background glow */}
          <div aria-hidden="true" className="absolute top-0 right-0 w-96 h-96 rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />

          <div className="max-w-3xl mb-8 space-y-2 relative z-10">
            <div className="text-xs font-mono uppercase tracking-wider text-blue-700 flex items-center gap-2 font-bold">
              <FileSpreadsheet className="w-4 h-4 text-blue-600" />
              <span>B2B Commercial Procurement Desk</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Request a Bulk Project Quotation (RFQ)
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              Submit your project schedule, cable sizing requirements, or upload an Excel Bill of Materials (BOM). Our engineering sales desk generates official GST quotations with delivery timeline commitments.
            </p>
          </div>

          {rfqSuccessRef ? (
            <div className="border border-emerald-200 bg-emerald-50 rounded-3xl p-8 text-center space-y-4 max-w-2xl mx-auto">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-300">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                Quotation Request Dispatched!
              </h3>
              <div className="font-mono text-emerald-800 bg-white px-4 py-2 rounded-xl border border-emerald-300 inline-block text-sm font-bold shadow-xs">
                Quotation Reference: <strong>{rfqSuccessRef}</strong>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed max-w-md mx-auto font-medium">
                Your quotation has been compiled and saved to your Corporate Portal. An official commercial copy has been submitted for dispatch review.
              </p>
              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <Link
                  to="/quotation"
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md"
                >
                  View Quotation Document &amp; Print PDF
                </Link>
                <button
                  onClick={() => setRfqSuccessRef(null)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 font-bold text-xs rounded-xl transition-colors"
                >
                  Submit Another RFQ
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleRfqSubmit} className="space-y-4 text-xs relative z-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-800 font-bold mb-1">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex Automation Pvt Ltd"
                    value={rfqCompany}
                    onChange={(e) => setRfqCompany(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-800 font-bold mb-1">
                    Contact Officer *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Purchasing / Project Engineer"
                    value={rfqName}
                    onChange={(e) => setRfqName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-800 font-bold mb-1">
                    Corporate Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="procurement@company.com"
                    value={rfqEmail}
                    onChange={(e) => setRfqEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-800 font-bold mb-1">
                    Phone / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 99000 48877"
                    value={rfqPhone}
                    onChange={(e) => setRfqPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-800 font-bold mb-1">
                    Delivery Site City *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Bangalore, Chennai, Pune..."
                    value={rfqCity}
                    onChange={(e) => setRfqCity(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-800 font-bold mb-1">
                    Buyer GSTIN (for ITC 18%)
                  </label>
                  <input
                    type="text"
                    placeholder="29ABCDE1234F1Z5"
                    value={rfqGstin}
                    onChange={(e) => setRfqGstin(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white font-mono uppercase"
                    maxLength={15}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-800 font-bold mb-1">
                    Primary Product Line
                  </label>
                  <select
                    value={rfqCategory}
                    onChange={(e) => setRfqCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-blue-500 font-semibold"
                  >
                    <option value="lapp">LAPP Kabel Flexible Cables &amp; Wires</option>
                    <option value="eaton">EATON Moeller Switchgear &amp; Starters</option>
                    <option value="mennekes">MENNEKES CEE Industrial Plugs</option>
                    <option value="partex">PARTEX Sweden Marking Systems</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-800 font-bold mb-1">
                    Estimated Meters / Quantity
                  </label>
                  <input
                    type="text"
                    value={rfqQuantity}
                    onChange={(e) => setRfqQuantity(e.target.value)}
                    placeholder="e.g. 500m of 4G2.5, 20x 32A 5P plugs"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-800 font-bold mb-1">
                  Bill of Materials (BOM) Details &amp; Specifications
                </label>
                <textarea
                  rows={3}
                  value={rfqNotes}
                  onChange={(e) => setRfqNotes(e.target.value)}
                  placeholder="Mention exact part numbers, cable sizes (e.g. 3G1.5, 4G4.0, 7G1.0), required drum cutting lengths, and site delivery dates..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white leading-relaxed font-medium"
                />
              </div>

              {/* Upload Dropzone */}
              <div>
                <label className="block text-slate-800 font-bold mb-1 flex items-center justify-between">
                  <span>Attach Excel BOM / Drawing / RFQ Schedule (Optional)</span>
                  <span className="text-[11px] text-slate-500 font-normal">Max 25MB each</span>
                </label>
                <label className="border border-dashed border-slate-300 hover:border-blue-500 bg-slate-50 hover:bg-blue-50/50 rounded-2xl p-5 flex flex-col items-center justify-center cursor-pointer transition-colors text-center">
                  <Upload className="w-5 h-5 text-blue-600 mb-1" />
                  <span className="text-slate-900 font-bold">Drop BOM spreadsheet or click to browse</span>
                  <span className="text-[11px] text-slate-500 font-medium">Excel (.xlsx, .csv), PDF, CAD, ZIP</span>
                  <input
                    type="file"
                    multiple
                    onChange={handleRfqFileChange}
                    className="hidden"
                  />
                </label>
                {rfqFiles.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {rfqFiles.map((f, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 text-[11px] font-medium"
                      >
                        <Paperclip className="w-3.5 h-3.5 text-blue-600" />
                        <span className="truncate max-w-[180px]">{f.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {!isAuthenticated && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2.5 text-xs text-amber-900 shadow-2xs">
                  <div className="p-1 bg-amber-100 rounded-lg text-amber-700 shrink-0 mt-0.5">
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-amber-950 text-xs">Login Required to Submit RFQ</div>
                    <div className="text-[11px] text-amber-800 leading-tight mt-0.5">
                      RFQs cannot be dispatched to admin without logging in. Please sign in or register your corporate account.
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-2">
                {!isAuthenticated ? (
                  <button
                    type="button"
                    onClick={() => {
                      showToast("Please log in or create an account to submit your RFQ.", "info");
                      openAuthModal("signin");
                    }}
                    className="w-full py-4 bg-amber-600 hover:bg-amber-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Login or Register to Submit RFQ</span>
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={rfqSubmitting}
                    className="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all active:scale-98 disabled:opacity-50 cursor-pointer"
                  >
                    {rfqSubmitting ? "Submitting Request..." : "Submit Request for Quotation"}
                  </button>
                )}
              </div>
            </form>
          )}
          </div>
        </div>
      </section>


      {/* Global Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onRequestQuoteNow={(p) => {
          setQuickViewProduct(null);
          setRfqProductName(`${p.name} (${p.partNo})`);
          setRfqModalOpen(true);
        }}
      />

      {/* Global RFQ Modal */}
      <RFQModal
        productName={rfqProductName}
        productPrice={rfqProductPrice}
        isOpen={rfqModalOpen}
        onClose={() => {
          setRfqModalOpen(false);
          setRfqProductName(null);
          setRfqProductPrice(null);
        }}
      />

      {/* Global Custom Cutting Modal */}
      <CustomCuttingModal
        isOpen={isCuttingModalOpen}
        onClose={() => setIsCuttingModalOpen(false)}
      />
    </main>
  );
};