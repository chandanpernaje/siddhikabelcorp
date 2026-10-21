import React, { useState, useMemo, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  ShieldCheck,
  FileText,
  Plus,
  Minus,
  ArrowRight,
  Check,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  Download,
} from "lucide-react";
import { PRODUCTS_DATA, ALL_OLFLEX_PRODUCTS } from "../data/products";
import { EATON_PRODUCTS } from "../data/eatonData";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { RFQModal } from "../components/ui/RFQModal";
import { ImageZoomModal } from "../components/ui/ImageZoomModal";
import { CustomCuttingModal } from "../components/ui/CustomCuttingModal";
import { API_BASE_URL } from "../config/api";

export const ProductDetail: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id: routeId } = useParams<{ id: string }>();
  const searchParams = new URLSearchParams(location.search);
  const productId = routeId || searchParams.get("id") || "lapp-01";
  const { openCart } = useCart();

  const [dbProduct, setDbProduct] = useState<any>(null);
  const [loadingDb, setLoadingDb] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/products`)
      .then(res => res.json())
      .then(data => {
        const found = data.find((p: any) => p.id === productId || (p.partNo && p.partNo.toLowerCase() === productId.toLowerCase()));
        if (found) {
          setDbProduct({
            id: found.id,
            category: "cables",
            brand: found.brand?.name || "LAPP KABEL",
            partNo: found.partNo || `P-${found.id.substring(0,6)}`,
            name: found.name,
            specs: [
              `Cores: ${found.core || '-'} Cores`,
              `Cross Section: ${found.coreSize || '-'} mm²`,
              `Outer Diameter: ${found.outerDiameter || '-'}`,
              `Copper Index: ${found.copperIndex || '-'}`,
              `Weight: ${found.weight || '-'}`,
              `Test Voltage: ${found.testVoltage || '4000 V'}`,
            ],
            voltage: "300/500 V",
            tempRange: "-40°C to +80°C static",
            conductor: "Fine-wire strands of bare copper (IEC 60228 Class 5)",
            price: found.price || 0,
            unit: "meter",
            stock: "Bangalore Central Hub",
            icon: "cable",
            application: "Industrial applications",
            image: found.imageUrl || "/images/cable-olflex-cores.png",
            hsnCode: "85444990",
          });
        }
        setLoadingDb(false);
      })
      .catch(err => {
        console.error(err);
        setLoadingDb(false);
      });
  }, [productId]);

  // Check static catalogs first (instant synchronous resolution)
  const staticProduct = useMemo(() => {
    if (!productId) return null;

    // 1. Direct match in PRODUCTS_DATA by ID
    const foundDirect = PRODUCTS_DATA.find((p) => p.id === productId);
    if (foundDirect) return foundDirect;

    // 2. Match in PRODUCTS_DATA by Part Number
    const foundByPartNo = PRODUCTS_DATA.find(
      (p) => p.partNo && p.partNo.toLowerCase() === productId.toLowerCase()
    );
    if (foundByPartNo) return foundByPartNo;

    // 3. Match in ALL_OLFLEX_PRODUCTS by Part Number
    const olflexMatch = ALL_OLFLEX_PRODUCTS.find(
      (p) => p.partNo && p.partNo.toLowerCase() === productId.toLowerCase()
    );
    if (olflexMatch) {
      const isUnitronic = olflexMatch.name.toLowerCase().includes("unitronic");
      const isSkintop = olflexMatch.name.toLowerCase().includes("skintop");
      const isSilvyn = olflexMatch.name.toLowerCase().includes("silvyn");

      let defaultImg = "/images/cable-olflex-cores.png";
      if (isUnitronic) defaultImg = "/images/card-unitronic.jpg";
      else if (isSkintop) defaultImg = "/images/card-skintop.jpg";
      else if (isSilvyn) defaultImg = "/images/card-conduit.jpg";

      return {
        id: `olflex-${olflexMatch.partNo}`,
        category: (isUnitronic ? "data" : isSkintop || isSilvyn ? "accessories" : "cables") as any,
        brand: olflexMatch.brand || "LAPP KABEL",
        partNo: olflexMatch.partNo,
        name: olflexMatch.name,
        rawCore: olflexMatch.core,
        rawSize: olflexMatch.size,
        rawEarth: olflexMatch.pe,
        rawPrice: olflexMatch.price,
        specs: [
          `Cores / Spec: ${olflexMatch.core ? `${olflexMatch.core} Cores` : 'Standard'} (${olflexMatch.pe === "G" ? "With Yellow/Green Earth" : "Black Numbered Cores / Screened"})`,
          `Cross Section: ${olflexMatch.size} mm² (Class 5 fine copper strands)`,
          `Outer Diameter: ${olflexMatch.outerDia ? `${olflexMatch.outerDia} mm` : "Standard Industrial Sheath"}`,
          `Copper Index: ${olflexMatch.copperIndex ? `${olflexMatch.copperIndex} kg/km` : "Optimized copper weight"}`,
          `Weight: ${olflexMatch.weight ? `${olflexMatch.weight} kg/km` : "Standard industrial weight"}`,
          `Test Voltage: 4000 V · Temp: -40°C to +80°C static / -5°C to +70°C flexing`,
        ],
        voltage: isUnitronic ? "250V peak operating" : "300/500 V",
        tempRange: "-40°C to +80°C static / -5°C to +70°C flexing",
        conductor: "Fine-wire strands of bare copper (IEC 60228 Class 5)",
        price: olflexMatch.price,
        unit: (isSkintop ? "piece" : "meter") as any,
        stock: "Bangalore Central Hub (In Stock - Ready Cut)",
        icon: isUnitronic ? "ethernet" : isSkintop ? "plug" : "cable",
        application: olflexMatch.desc || (isUnitronic ? "Signal transmission and computer cables for automation systems and measurement technology." : "Oil-resistant, flexible control and power cable for machine tools, assembly lines, automation, and control cabinets."),
        image: defaultImg,
        hsnCode: isSkintop ? "39269099" : "85444990",
      };
    }

    // 4. Match in EATON_PRODUCTS by Part Number
    const eatonMatch = EATON_PRODUCTS.find(
      (p) => p.partNo && p.partNo.toLowerCase() === productId.toLowerCase()
    );
    if (eatonMatch) {
      let eatonImg = "/images/eaton-pkzm0.jpg";
      if (eatonMatch.series === "DILM") eatonImg = "/images/eaton-dilm.jpg";
      else if (eatonMatch.series === "NZM") eatonImg = "/images/eaton-nzm.jpg";
      else if (eatonMatch.series === "FAZ") eatonImg = "/images/eaton-faz.jpg";

      return {
        id: `eaton-${eatonMatch.partNo}`,
        category: "switchgear" as const,
        brand: "EATON",
        partNo: eatonMatch.partNo,
        name: eatonMatch.name,
        specs: eatonMatch.specs || [],
        voltage: "400/415V AC",
        tempRange: "-25°C to +55°C",
        conductor: "Screw clamp terminals",
        price: eatonMatch.price,
        unit: "piece" as const,
        stock: "Bangalore Central Hub (In Stock - Genuine Eaton)",
        icon: "shield",
        application: eatonMatch.desc || "Industrial motor control, electrical protection, and switchgear distribution.",
        image: eatonImg,
        hsnCode: "85362030",
      };
    }

    return null;
  }, [productId]);

  const product = useMemo(() => {
    if (dbProduct) return dbProduct;
    if (staticProduct) return staticProduct;
    if (loadingDb) return PRODUCTS_DATA[0];
    return PRODUCTS_DATA[0];
  }, [dbProduct, staticProduct, loadingDb]);

  const isSingleCore = Boolean(
    product.name.toLowerCase().includes("single core") || product.category === 'Single Core'
  );

  // All LAPP multicore / control cables sold per meter
  const isLappCable = Boolean(
    product.brand?.includes("LAPP") &&
    product.unit === "meter" &&
    !product.name.toLowerCase().includes("skintop") &&
    !product.name.toLowerCase().includes("silvyn")
  );

  const isConfigurable = isLappCable || isSingleCore;

  // Variant States
  const [selectedCore, setSelectedCore] = useState('2 Core');
  const [selectedSize, setSelectedSize] = useState('0.5 Sqmm');
  const [selectedEarth, setSelectedEarth] = useState('Without (All Numbered - X)');
  const [selectedColor, setSelectedColor] = useState('Black');

  const [qty, setQty] = useState(product?.brand?.includes("LAPP") && product.unit === "meter" ? 25 : 1);
  const [selectedImg, setSelectedImg] = useState(product.image || "/images/cable-olflex-cores.png");
  const [rfqOpen, setRfqOpen] = useState(false);
  const [isCuttingModalOpen, setIsCuttingModalOpen] = useState(false);
  const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);
  const [inlineZoom, setInlineZoom] = useState(1);
  // Natural scroll-based zoom for the product image (no manual zoom buttons)
  const imgBoxRef = useRef<HTMLDivElement>(null);
  const [scrollZoom, setScrollZoom] = useState(1);
  useEffect(() => {
    const onScroll = () => {
      const el = imgBoxRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const progress = Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height)));
      setScrollZoom(1 + progress * 0.15);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!product) return;
    setQty(product.brand && product.brand.includes("LAPP") && product.unit === "meter" ? 25 : 1);
    setSelectedImg(product.image || "/images/cable-olflex-cores.png");

    if (product.rawCore) {
      setSelectedCore(`${product.rawCore} Core`);
    }
    if (product.rawSize) {
      setSelectedSize(`${product.rawSize} Sqmm`);
    }
    if (product.rawEarth === "G") {
      setSelectedEarth('With (Yellow/Green - G)');
    } else if (product.rawEarth === "X") {
      setSelectedEarth('Without (All Numbered - X)');
    }
  }, [product]);

  const { addToCart, cart } = useCart();
  const { showToast } = useToast();

  useEffect(() => {
    if (!isLappCable) return;
    if (product.brand?.includes("LAPP") && selectedCore) {
      const coreNum = parseInt(selectedCore.split(' ')[0]) || 2;
      const sizeNum = parseFloat(selectedSize.split(' ')[0]) || 0.5;
      const sumHash = coreNum + sizeNum * 100;

      // Authentic LAPP product images from e.lapp.com
      const images = [
        "https://e.lapp.com/media/wysiwyg/OLFLEX_11.jpg",
        "https://e.lapp.com/media/catalog/product/e/lapp/PbY69fQAPx2jbzbFLWJfwdvd-a9AiEdYbYYUvbrNCYM~.jpg",
        "https://e.lapp.com/media/catalog/product/e/lapp/PSJEYSpSwPlHnFF-lpM68WdZH4LF9jsH7rclnWxtZeM~.jpg",
        "https://e.lapp.com/media/catalog/product/e/lapp/EN2KMbDoEZCg_FD0D9IzzPI5QIGik6TS-fjcuKjvp0o~.jpg",
        "https://e.lapp.com/media/catalog/product/e/lapp/l226RQIO9d26Nb_87YS6mdKBc4s0fzmcxUk6uXlc5sY~.jpg",
        "https://e.lapp.com/media/catalog/product/e/lapp/5OILG9D2NXU-DmxaMYhFp6OL36Smk1VziSJvYQcFDWA~.jpg",
        "https://e.lapp.com/media/catalog/product/e/lapp/Ib2fY_XWT6H8uh7_b2NOlMIHhIMLeD8wNWXfsOedcfM~.jpg",
        "https://e.lapp.com/media/catalog/product/e/lapp/zXRgMuVfRgn1g-opCvBSZKGhLXYCRdUHCs_tSjAgZVs~.jpg",
        "https://e.lapp.com/media/catalog/product/e/lapp/3uslMUlDV0KDCAoc_UArzCGcCddjKAv5bqLnPICPLG0~.jpg",
        "https://e.lapp.com/media/catalog/product/e/lapp/v5VKLl89Hqf5UYY4wTbXWI4rI4JUg10N5kBAVLJOJ3A~.jpg",
        "https://e.lapp.com/media/catalog/product/e/lapp/7Xpi1vuBlWGibTwYyj0Jou1HDxMBnG2K7ScLPCQg9ZM~.jpg",
        "https://e.lapp.com/media/catalog/product/e/lapp/0L0kZmOzGLB281eBk7IWCabfUxaZuDrpBF_89NiySy8~.jpg",
        "https://e.lapp.com/media/catalog/product/e/lapp/9gSa0efisdBRoLm9czBhIy1RGq1j09haviQwSeM-SKU~.jpg",
        "https://e.lapp.com/media/catalog/product/e/lapp/HBMdVPVjxRiW9xzyIQrv4GxVbJXJTzcHugoSggvtVX8~.jpg",
        "https://e.lapp.com/media/catalog/product/e/lapp/ke_oT2_ms7wgMBZQ3n0b8v4A0BPB7QOSO1n71KyW7co~.jpg",
        "https://e.lapp.com/media/catalog/product/e/lapp/tNgrNuMzBB9kOnJ6tn_kmMZheU8vDlyLeNo154Xcs1c~.jpg"
      ];
      const index = Math.floor(sumHash) % images.length;
      setSelectedImg(images[index]);
    }
  }, [isLappCable, selectedCore, selectedSize, product.brand]);

  const handleStepUp = () => {
    if (product.unit === "meter") {
      setQty((q) => {
        if (q < 25) return 25;
        return Math.floor(q / 25) * 25 + 25;
      });
    } else {
      setQty((q) => q + 1);
    }
  };

  const handleStepDown = () => {
    if (product.unit === "meter") {
      setQty((q) => {
        if (q <= 25) return 25;
        return Math.ceil(q / 25) * 25 - 25;
      });
    } else {
      setQty((q) => Math.max(1, q - 1));
    }
  };

  const galleryImages = [
    { src: "/images/cable-olflex-cores.png", label: "Numbered Cores" },
    { src: "/images/cable-olflex-angle.png", label: "Angle View" },
    { src: "/images/cable-olflex-drum.png", label: "Wooden Drum" },
  ];

  const displayProductName = useMemo(() => {
    if (!isConfigurable) return product.name;
    if (!product.brand?.includes("LAPP")) return product.name;

    // Extract the base name without any trailing "2X0,5" or "3G1.5" etc.
    let baseName = product.name
      .replace(/\s+\d+\s*[xX]\s*\d+\s*[xX]\s*[\d,.]+/gi, '') // e.g. 2x2x0,14
      .replace(/\s+\d+\s*[xXgG]\s*[\d,.]+/gi, '')             // e.g. 2X0,75 or 3G1.5
      .trim();

    if (!baseName) baseName = product.name;

    if (isSingleCore) {
      const sizeStr = selectedSize.replace(' Sqmm', '').replace('.', ',');
      return `${baseName} 1X${sizeStr} ${selectedColor}`;
    }

    const coreNum = parseInt(selectedCore.split(' ')[0]) || 2;
    const sizeStr = selectedSize.replace(' Sqmm', '').replace('.', ','); // LAPP typically uses commas for decimals
    const earthChar = selectedEarth === 'With (Yellow/Green - G)' ? 'G' : 'X';
    
    return `${baseName} ${coreNum}${earthChar}${sizeStr}`;
  }, [product.name, product.brand, isConfigurable, isSingleCore, selectedCore, selectedSize, selectedEarth, selectedColor]);

  const calculatedPrice = useMemo(() => {
    if (!isConfigurable) return product.price;
    if (!product.brand?.includes("LAPP")) return product.price;

    const coreNum = isSingleCore ? 1 : (parseInt(selectedCore.split(' ')[0]) || 2);
    const sizeNum = parseFloat(selectedSize.split(' ')[0]) || 0.5;
    
    // Calculate a dynamic price based on the selected core and size
    // Using simple multipliers based on the base values (2 core, 0.5 sqmm)
    const coreMultiplier = isSingleCore ? 1 : coreNum / 2;
    const sizeMultiplier = sizeNum / 0.5;
    
    // To ensure price doesn't go crazy high for 52 cores, we add a simple dampening formula
    let finalPrice = product.price * Math.pow(coreMultiplier, 0.85) * Math.pow(sizeMultiplier, 0.9);
    
    // Add a small 5% premium for the Yellow/Green (Earth) color option
    if (selectedEarth === 'With (Yellow/Green - G)') {
      finalPrice = finalPrice * 1.05;
    }
    
    return Math.round(finalPrice * 100) / 100;
  }, [product.price, product.brand, isConfigurable, isSingleCore, selectedCore, selectedSize, selectedEarth]);

  const currentVariantId = useMemo(() => {
    if (!isConfigurable) return product.id || product.partNo;
    if (isSingleCore) {
      return `${product.id}_1x_${selectedSize.replace(/\s+/g, '')}_${selectedColor}`;
    }
    const coreSlug = selectedCore.replace(/\s+/g, '');
    const sizeSlug = selectedSize.replace(/\s+/g, '');
    const earthSlug = selectedEarth.includes('With') ? 'G' : 'X';
    return `${product.id}_${coreSlug}_${sizeSlug}_${earthSlug}`;
  }, [product.id, product.partNo, isConfigurable, isSingleCore, selectedCore, selectedSize, selectedEarth, selectedColor]);

  const isInCart = cart.some((item) => 
    item.id === currentVariantId || 
    (item.partNo === product.partNo && (!isConfigurable || item.name === displayProductName))
  );

  const handleAddToCart = () => {
    addToCart({ 
      ...product, 
      id: currentVariantId,
      name: displayProductName, 
      price: calculatedPrice 
    }, qty);
    openCart();
  };

  const handleInstantQuote = () => {
    setRfqOpen(true);
  };

  const lineTotal = calculatedPrice * qty;
  const gstLine = lineTotal * 0.18;
  const totalWithGst = lineTotal + gstLine;

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 text-slate-900">
      <div className="w-[95%] max-w-[1920px] mx-auto space-y-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Link to="/" className="hover:text-red-600 transition-colors font-medium">
            Home
          </Link>
          <span>/</span>
          <Link to="/#catalog" className="hover:text-red-600 transition-colors font-medium">
            Catalog
          </Link>
          <span>/</span>
          <span className="text-red-700 font-bold">{product.brand}</span>
          <span>/</span>
          <span className="text-slate-900 font-bold truncate max-w-xs">
            {product.partNo}
          </span>
        </div>

        {/* Contiguous PDP Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Gallery & High-Res Inspection (5 Cols) */}
          <div className="lg:col-span-6 space-y-4">
            <div ref={imgBoxRef} className="rounded-3xl bg-white border border-slate-200 p-0 flex items-center justify-center aspect-square relative overflow-hidden shadow-lg group">
              <div
                className="w-full h-full flex items-center justify-center cursor-zoom-in overflow-hidden"
                onClick={() => setIsZoomModalOpen(true)}
              >
                <img
                  src={selectedImg}
                  alt={product.name}
                  referrerPolicy="no-referrer"
                  style={{
                    transform: `scale(${scrollZoom})`,
                    transition: "transform 0.2s ease-out",
                  }}
                  className="w-full h-full object-cover mix-blend-multiply select-none"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = product.image || "/images/card-olflex.jpg";
                  }}
                />
              </div>

              {/* Ready Stock badge */}
              <div className="absolute top-4 left-4 text-xs font-mono text-emerald-800 font-bold bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200 shadow-2xs pointer-events-none">
                {product.stock}
              </div>
            </div>

            {/* Thumbnail Gallery */}
            <div className="flex items-center gap-3 mt-4">
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImg(img.src)}
                  className={`w-20 h-20 rounded-xl border-2 p-1 overflow-hidden transition-all ${
                    selectedImg === img.src
                      ? "border-red-500 shadow-md"
                      : "border-slate-200 hover:border-red-300 hover:shadow-sm opacity-70 hover:opacity-100 bg-white"
                  }`}
                  title={img.label}
                >
                  <img
                    src={img.src}
                    alt={img.label}
                    className="w-full h-full object-contain"
                  />
                </button>
              ))}
            </div>


          </div>

          {/* Right Column: Contiguous Purchase Module (6 Cols) */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <div className="flex items-center gap-2 text-xs uppercase font-mono text-slate-400 mb-2 font-bold">
                <span className="text-red-600">{product.brand}</span>
                <span>·</span>
                <span>Part No: {product.partNo}</span>
                {product.hsnCode && (
                  <>
                    <span>·</span>
                    <span>HSN: {product.hsnCode}</span>
                  </>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-red-700 tracking-tight leading-snug mb-6">
                {displayProductName}
              </h1>
            </div>

            {/* LAPP Variant Layout - Configurable Cables Only */}
            {product.brand?.includes("LAPP") && isConfigurable && (
              <div className="border-[1.5px] border-[#00a7e1]/20 rounded-[24px] p-5 sm:p-6 bg-white mb-6 shadow-sm space-y-6">
                
                {/* Grid for Variant Options */}
                <div className="space-y-5">
                  <div className="grid grid-cols-1 gap-6">
                    {!isSingleCore && (
                      <div>
                        <label className="font-bold text-slate-800 text-sm block mb-2">Core</label>
                        <div className="flex flex-wrap gap-2">
                          {['2 Core', '3 Core', '4 Core', '5 Core', '6 Core', '7 Core', '8 Core', '10 Core', '12 Core', '14 Core', '16 Core', '18 Core', '20 Core', '25 Core', '30 Core', '34 Core', '40 Core', '50 Core'].map(core => (
                            <button
                              key={core}
                              onClick={() => setSelectedCore(core)}
                              className={`h-9 min-w-[3rem] px-2 flex items-center justify-center text-xs font-bold rounded-lg border transition-colors ${selectedCore === core ? 'bg-red-500 text-white border-red-600 shadow-sm' : 'bg-white text-slate-700 border-slate-200 hover:border-red-400 hover:bg-red-50'}`}
                            >
                              {core.replace(' Core', '')}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="font-bold text-slate-800 text-sm block mb-2">Size (Sqmm)</label>
                      <div className="flex flex-wrap gap-2">
                        {['0.5 Sqmm', '0.75 Sqmm', '1 Sqmm', '1.5 Sqmm', '2.5 Sqmm', '4 Sqmm', '6 Sqmm', '10 Sqmm', '16 Sqmm', '25 Sqmm', '35 Sqmm'].map(size => (
                          <button
                            key={size}
                            onClick={() => setSelectedSize(size)}
                            className={`h-9 min-w-[3rem] px-2 flex items-center justify-center text-xs font-bold rounded-lg border transition-colors ${selectedSize === size ? 'bg-red-500 text-white border-red-600 shadow-sm' : 'bg-white text-slate-700 border-slate-200 hover:border-red-400 hover:bg-red-50'}`}
                          >
                            {size.replace(' Sqmm', '')}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {isSingleCore ? (
                    <div>
                      <label className="font-bold text-slate-800 text-sm block mb-2">Color</label>
                      <div className="flex flex-wrap gap-2">
                        {['Black', 'Red', 'Blue', 'Yellow', 'Green', 'Grey', 'Brown', 'White'].map(color => (
                          <button
                            key={color}
                            onClick={() => setSelectedColor(color)}
                            className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors ${selectedColor === color ? 'bg-red-500 text-white border-red-600 shadow-sm' : 'bg-white text-slate-700 border-slate-200 hover:border-red-400 hover:bg-red-50'}`}
                          >
                            {color}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="font-bold text-slate-800 text-sm leading-tight">Protective conductor</label>
                        <span className="text-red-600 font-bold text-[11px]">
                          {selectedEarth === 'Without (All Numbered - X)' ? 'Without Earth (X)' : 'With Earth (G)'}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2.5">
                        <button 
                          onClick={() => setSelectedEarth('With (Yellow/Green - G)')}
                          className={`flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-lg border transition-colors ${
                            selectedEarth === 'With (Yellow/Green - G)'
                              ? 'border-emerald-500 text-emerald-700 bg-emerald-50 shadow-sm'
                              : 'bg-white border-slate-200 text-slate-700 hover:border-emerald-400 hover:bg-emerald-50/50'
                          }`}
                        >
                          <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-yellow-400 to-green-500 shadow-xs" />
                          With (Yellow/Green - G)
                        </button>
                        <button 
                          onClick={() => setSelectedEarth('Without (All Numbered - X)')}
                          className={`flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-lg border transition-colors ${
                            selectedEarth === 'Without (All Numbered - X)'
                              ? 'bg-slate-800 text-white border-slate-900 shadow-sm'
                              : 'bg-white border-slate-200 text-slate-700 hover:border-slate-400 hover:bg-slate-50'
                          }`}
                        >
                          <div className="w-2.5 h-2.5 rounded-full bg-slate-200 border border-slate-300" />
                          Without (All Numbered - X)
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Real-time Meter / Quantity Calculator */}
            <div className="rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 space-y-5 shadow-lg">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 sm:gap-0">
                <div>
                  <span className="text-[11px] uppercase font-mono text-slate-400 font-bold block">
                    Contract Rate (Ex-GST)
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black font-mono text-slate-900 tabular-nums">
                      ₹{calculatedPrice % 1 === 0 ? calculatedPrice.toLocaleString("en-IN") : calculatedPrice.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">
                      /{product.unit}
                    </span>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-[11px] text-slate-400 font-bold block mb-1">
                    Update Qty ({product.unit === 'meter' ? 'Mtrs' : 'Nos'})
                  </span>
                  <div className="flex items-center justify-start sm:justify-end">
                    <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden shadow-sm bg-white">
                      <button onClick={handleStepDown} className="px-4 py-2 sm:px-3.5 sm:py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold border-r border-slate-200 transition-colors active:bg-slate-200">-</button>
                      <span className="px-6 py-2 sm:px-4 sm:py-1.5 text-base sm:text-sm font-bold font-mono text-slate-900 bg-white min-w-[4rem] sm:min-w-[3.5rem] text-center">{qty}</span>
                      <button onClick={handleStepUp} className="px-4 py-2 sm:px-3.5 sm:py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold border-l border-slate-200 transition-colors active:bg-slate-200">+</button>
                    </div>
                  </div>
                </div>
              </div>
              
              {product.unit === 'meter' && (
                <div className="text-[10px] sm:text-[11px] text-red-600 font-medium flex items-start gap-1 mt-2">
                  <span className="text-red-500 shrink-0">⚠️</span>
                  <span>Caution: order Multiple of 10 Mtrs or 25 mtrs for all multicore</span>
                </div>
              )}

              {/* Dynamic Cost Projection */}
              <div className="pt-4 border-t border-slate-100 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Total:</span>
                  <span className="font-mono text-slate-900 font-bold tabular-nums">
                    ₹{lineTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>GST (18%):</span>
                  <span className="font-mono text-slate-900 font-bold tabular-nums">
                    ₹{gstLine.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-100">
                  <span>Estimated Total (Incl. GST):</span>
                  <span className="text-red-600 font-mono tabular-nums text-base font-black">
                    ₹{totalWithGst.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>



              {/* CTAs */}
              <div className="grid grid-cols-1 gap-3 pt-2">
                <button
                  onClick={handleAddToCart}
                  className={`py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95 ${
                    isInCart
                      ? "bg-emerald-50 border border-emerald-300 text-emerald-800"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300"
                  }`}
                >
                  {isInCart ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>In RFQ Cart</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Add to Quote Cart</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                <span>Direct Warehouse Dispatch from Bangalore</span>
                <button
                  onClick={() => setIsCuttingModalOpen(true)}
                  className="text-red-600 font-bold hover:underline cursor-pointer"
                >
                  Need Custom Project Cutting?
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: Description vs Technical Data */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-6 space-y-6">
            <div className="rounded-3xl bg-white border border-slate-200 p-8 shadow-sm h-full">
              <h3 className="text-lg font-black text-slate-900 tracking-tight mb-6 flex items-center gap-2">
                <FileText className="w-5 h-5 text-red-500" />
                Product Description & Highlights
              </h3>
              
              <p className="text-sm text-slate-600 leading-relaxed mb-8 font-medium">
                {product.application}
              </p>

              <div className="space-y-4">
                {product.specs.map((spec: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-3 text-slate-700 font-medium text-sm">
                    <div className="w-5 h-5 shrink-0 rounded-full bg-red-100 flex items-center justify-center mt-0.5 border border-red-200">
                      <Check className="w-3 h-3 text-red-600" />
                    </div>
                    <span className={`leading-relaxed ${/^(Cores?|Cross Section)/i.test(spec) ? "font-extrabold text-slate-900" : ""}`}>{spec}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="rounded-3xl bg-white border border-slate-200 p-8 space-y-6 shadow-sm h-full">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <FileText className="w-5 h-5 text-red-500" />
                  <span>Technical Datasheet</span>
                </h3>
                {(product.datasheetUrl || dbProduct?.datasheetUrl) && (
                  <a
                    href={product.datasheetUrl || dbProduct?.datasheetUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold transition-colors shadow-xs"
                  >
                    <Download size={14} />
                    <span>Download PDF</span>
                  </a>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50 space-y-1">
                  <span className="text-slate-400 font-mono block">Conductor Design</span>
                  <span className="text-slate-900 font-bold text-sm">
                    {product.conductor || "Fine-wire bare copper, Class 5"}
                  </span>
                </div>

                <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50 space-y-1">
                  <span className="text-slate-400 font-mono block">Nominal Voltage</span>
                  <span className="text-slate-900 font-bold text-sm">
                    {product.voltage || "300 / 500 V"}
                  </span>
                </div>

                <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50 space-y-1">
                  <span className="text-slate-400 font-mono block">Operating Temp</span>
                  <span className="text-slate-900 font-bold text-sm">
                    {product.tempRange || "-40°C to +80°C"}
                  </span>
                </div>

                <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50 space-y-1">
                  <span className="text-slate-400 font-mono block">Bending Radius</span>
                  <span className="text-slate-900 font-bold text-sm">
                    Flexing: 10x OD
                  </span>
                </div>

                <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50 space-y-1">
                  <span className="text-slate-400 font-mono block">Flame Retardancy</span>
                  <span className="text-slate-900 font-bold text-sm">
                    IEC 60332-1-2
                  </span>
                </div>

                <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50 space-y-1">
                  <span className="text-slate-400 font-mono block">Oil Resistance</span>
                  <span className="text-slate-900 font-bold text-sm">
                    DIN EN 50290-2-22
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RFQ Modal */}
        <RFQModal
          productName={`${product.name} (${product.partNo})`}
          isOpen={rfqOpen}
          onClose={() => setRfqOpen(false)}
        />

        {/* Custom Cutting Modal */}
        <CustomCuttingModal
          isOpen={isCuttingModalOpen}
          onClose={() => setIsCuttingModalOpen(false)}
          productName={product.name}
          partNo={product.partNo}
        />

        {/* Fullscreen Image Zoom Modal (+/-) */}
        <ImageZoomModal
          isOpen={isZoomModalOpen}
          onClose={() => setIsZoomModalOpen(false)}
          imageSrc={selectedImg}
          altText={product.name}
          title={product.name}
          brand={product.brand}
          partNo={product.partNo}
        />
      </div>
    </div>
  );
};