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
} from "lucide-react";
import { PRODUCTS_DATA, ALL_OLFLEX_PRODUCTS } from "../data/products";
import { EATON_PRODUCTS } from "../data/eatonData";
import { MENNEKES_PRODUCTS } from "../data/mennekesData";
import { PARTEX_PRODUCTS } from "../data/partexData";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { RFQModal } from "../components/ui/RFQModal";
import { ImageZoomModal } from "../components/ui/ImageZoomModal";
import { CustomCuttingModal } from "../components/ui/CustomCuttingModal";
import { SpecialRequirementModal } from "../components/ui/SpecialRequirementModal";
import { ColourSwatch } from "../components/ui/ColourSwatch";
import { API_BASE_URL } from "../config/api";
import { CORE_TO_SQMM_MAP } from "../config/cableSpecs";
import { resolveProductDatasheet, getMatchedProductGroup } from "../config/productGroups";

// Helper to format specifications: where only 25 is present, show 25A
const formatSpecificationText = (text: string | null | undefined): string => {
  if (!text) return '';
  const trimmed = text.trim();
  const normalized = text.replace(/(\d+),(\d+)/g, '$1.$2');
  if (trimmed === '25' || trimmed === '25 A') return '25A';
  if (/^25\s*(?:a|amp|amperes?|amps?)$/i.test(trimmed)) return '25A';
  return normalized
    .replace(/(?:Rating|Current|Capacity|Rated Current|Spec|Specification)\s*:\s*25\b(?!\s*(?:mm|sqmm|core))/gi, '$&: 25A')
    .replace(/\b25\s*(?:amps?|amperes?)\b/gi, '25A');
};

const getBrandFallback = (brand?: any, name?: string) => {
  const b = (typeof brand === 'object' ? brand?.name : brand || '').toLowerCase();
  const n = (name || '').toLowerCase();
  if (b.includes('eaton') || n.includes('pkzm') || n.includes('dilm') || n.includes('breaker') || n.includes('contactor')) return '/images/promo-eaton.jpg';
  if (b.includes('mennekes') || n.includes('powertop') || n.includes('amaxx') || n.includes('socket') || n.includes('plug')) return '/images/promo-mennekes.jpg';
  if (b.includes('partex') || n.includes('promark') || n.includes('pa ') || n.includes('marker')) return '/images/promo-partex.jpg';
  if (n.includes('skintop') || n.includes('gland')) return '/images/card-skintop.jpg';
  if (n.includes('silvyn') || n.includes('conduit')) return '/images/card-conduit.jpg';
  if (n.includes('unitronic')) return '/images/card-unitronic.jpg';
  if (n.includes('uniplus')) return '/images/card-uniplus.jpg';
  return '/images/card-olflex.jpg';
};

export const ProductDetail: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id: routeId } = useParams<{ id: string }>();
  const searchParams = new URLSearchParams(location.search);
  const productId = routeId || searchParams.get("id") || "lapp-01";
  const { openCart } = useCart();

  const [dbProduct, setDbProduct] = useState<any>(null);
  const [allDbProducts, setAllDbProducts] = useState<any[]>([]);
  const [loadingDb, setLoadingDb] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/products`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setAllDbProducts(data);
          const found = data.find((p: any) => p.id === productId || p._id === productId || (p.partNo && p.partNo.toLowerCase() === productId.toLowerCase()));
          if (found) {
            const resolvedSqmm = found.sqmm || found.coreSize || (found.size ? String(found.size) : null);
            setDbProduct({
              id: found.id,
              category: found.categoryName || "cables",
              brand: found.brand?.name || found.brandName || "LAPP KABEL",
              partNo: found.partNo || `P-${found.id.substring(0, 6)}`,
              name: found.name,
              core: found.core,
              coreSize: found.coreSize,
              sqmm: resolvedSqmm,
              colour: found.colour,
              uom: found.uom || 'Meter',
              specs: [
                ...(found.core ? [`Cores: ${found.core} Cores`] : []),
                ...(resolvedSqmm ? [`Conductor Cross Section: ${resolvedSqmm} mm²`] : []),
                ...(found.colour ? [`Cable Colour: ${found.colour}`] : []),
                ...(found.uom ? [`UOM: ${found.uom}`] : []),
                ...(found.outerDiameter ? [`Outer Diameter: ${found.outerDiameter}`] : []),
                ...(found.copperIndex ? [`Copper Index: ${found.copperIndex} kg/km`] : []),
                ...(found.weight ? [`Weight: ${found.weight}`] : []),
                ...(found.testVoltage ? [`Test Voltage: ${found.testVoltage}`] : ['Test Voltage: 4000 V']),
              ],
              voltage: "300/500 V",
              tempRange: "-40°C to +80°C static",
              conductor: "Fine-wire strands of bare copper (IEC 60228 Class 5)",
              price: found.price || 0,
              unit: (found.uom || 'meter').toLowerCase(),
              stock: "Bangalore Central Hub",
              icon: "cable",
              application: found.description || "Industrial applications",
              image: found.imageUrl || "/images/cable-olflex-cores.png",
              datasheetUrl: found.datasheetUrl || found.categoryDatasheetUrl || (found.category && found.category.datasheetUrl) || '',
              hsnCode: found.hsnCode || "85444990",
            });
          }
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
      else if (eatonMatch.series === "RMQ") eatonImg = "/images/eaton-rmq.jpg";
      else if (eatonMatch.series === "PowerXL") eatonImg = "/images/eaton-drives.jpg";

      return {
        id: `eaton-${eatonMatch.partNo}`,
        category: "switchgear" as const,
        brand: "EATON",
        partNo: eatonMatch.partNo,
        name: eatonMatch.name,
        specs: (eatonMatch.specs || []).map(formatSpecificationText),
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

    // 5. Match in MENNEKES_PRODUCTS by Part Number
    const mennMatch = MENNEKES_PRODUCTS.find(
      (p) => p.partNo && p.partNo.toLowerCase() === productId.toLowerCase()
    );
    if (mennMatch) {
      let mennImg = "/images/menn-powertop.jpg";
      if (mennMatch.series === "Panel Sockets") mennImg = "/images/menn-panel.jpg";
      else if (mennMatch.series === "AMAXX") mennImg = "/images/menn-amaxx.jpg";
      else if (mennMatch.series === "DUO") mennImg = "/images/menn-duo.jpg";
      else if (mennMatch.series === "EverGUM") mennImg = "/images/menn-evergum.jpg";
      else if (mennMatch.series === "Phase Inverters") mennImg = "/images/menn-phase.jpg";

      return {
        id: `menn-${mennMatch.partNo}`,
        category: "switchgear" as const,
        brand: "MENNEKES",
        partNo: mennMatch.partNo,
        name: mennMatch.name,
        specs: (mennMatch.specs || []).map(formatSpecificationText),
        voltage: mennMatch.voltage || "400V AC",
        tempRange: "-25°C to +55°C",
        conductor: "Heavy-duty nickel-plated contacts",
        price: mennMatch.price,
        unit: "piece" as const,
        stock: "Bangalore Central Hub (In Stock - Genuine Mennekes)",
        icon: "plug",
        application: mennMatch.desc || "Industrial CEE pin and sleeve connections for harsh industrial environments.",
        image: mennImg,
        hsnCode: "85366990",
      };
    }

    // 6. Match in PARTEX_PRODUCTS by Part Number
    const partexMatch = PARTEX_PRODUCTS.find(
      (p) => p.partNo && p.partNo.toLowerCase() === productId.toLowerCase()
    );
    if (partexMatch) {
      let partexImg = "/images/partex-pa.jpg";
      if (partexMatch.series === "ProMark") partexImg = "/images/partex-promark.jpg";
      else if (partexMatch.series === "PO") partexImg = "/images/partex-po.jpg";
      else if (partexMatch.series === "PC") partexImg = "/images/partex-pc.jpg";
      else if (partexMatch.series === "PKS") partexImg = "/images/partex-pks.jpg";
      else if (partexMatch.series === "Cable Ties") partexImg = "/images/partex-ties.jpg";

      return {
        id: `partex-${partexMatch.partNo}`,
        category: "accessories" as const,
        brand: "PARTEX",
        partNo: partexMatch.partNo,
        name: partexMatch.name,
        specs: (partexMatch.specs || []).map(formatSpecificationText),
        voltage: "N/A (Wire Marking)",
        tempRange: "-30°C to +60°C",
        conductor: "Self-extinguishing PVC / AISI 316 Stainless",
        price: partexMatch.price,
        unit: "piece" as const,
        stock: "Bangalore Central Hub (In Stock - Genuine Partex)",
        icon: "shield",
        application: partexMatch.desc || "Swedish precision wire, cable and component marking systems.",
        image: partexImg,
        hsnCode: "39269099",
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
  const [selectedColor, setSelectedColor] = useState('Black');

  const matchedGroup = useMemo(() => {
    return getMatchedProductGroup(product?.name || dbProduct?.name);
  }, [product?.name, dbProduct?.name]);

  const activeDatasheetUrl = useMemo(() => {
    return resolveProductDatasheet(
      product?.name || dbProduct?.name,
      product?.datasheetUrl || dbProduct?.datasheetUrl,
      (product as any)?.categoryDatasheetUrl || dbProduct?.categoryDatasheetUrl
    );
  }, [product, dbProduct]);

  const [qty, setQty] = useState(product?.brand?.includes("LAPP") && product.unit === "meter" ? 25 : 1);
  const [selectedImg, setSelectedImg] = useState(product.image || "/images/cable-olflex-cores.png");
  const [rfqOpen, setRfqOpen] = useState(false);
  const [isCuttingModalOpen, setIsCuttingModalOpen] = useState(false);
  const [isSpecialEnquiryModalOpen, setIsSpecialEnquiryModalOpen] = useState(false);
  const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);
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
    } else if (product.core) {
      const c = parseInt(String(product.core).replace(/[^0-9]/g, ''), 10);
      if (c && !isNaN(c)) setSelectedCore(`${c} Core`);
    }

    if (product.rawSize) {
      setSelectedSize(`${product.rawSize} Sqmm`);
    } else if (product.sqmm || product.coreSize) {
      const s = String(product.sqmm || product.coreSize).replace(/[^0-9.,]/g, '');
      if (s) setSelectedSize(`${s} Sqmm`);
    }
  }, [product]);

  const { addToCart, cart } = useCart();
  const { showToast } = useToast();

  const coreNum = useMemo(() => {
    if (isSingleCore) return 1;
    return parseInt(selectedCore.split(' ')[0], 10) || 2;
  }, [isSingleCore, selectedCore]);

  const sizeNum = useMemo(() => {
    return parseFloat(selectedSize.split(' ')[0]) || 0.5;
  }, [selectedSize]);

  // Requirement 2: Automatic standard earth determination without cluttering UI with green buttons
  const earthChar = useMemo(() => {
    if (isSingleCore || coreNum < 3) return 'X';
    if (product.name && /\d+X[\d,.]+/i.test(product.name)) return 'X';
    return 'G'; // Standard multicore >= 3 cores comes with Earth G (e.g. 5G4, 4G2.5, 3G1.5)
  }, [isSingleCore, coreNum, product.name]);

  // Requirement 5: Cross-section and required core details only; remove unnecessary Five Core option
  const availableCoreOptions = useMemo(() => {
    if (isSingleCore) return ['1 Core'];

    const rawCoreNum = product.rawCore || (dbProduct?.core ? parseInt(dbProduct.core, 10) : null);

    const isDedicated234 = (rawCoreNum === 2 || rawCoreNum === 3 || rawCoreNum === 4) &&
      (Boolean(product.name?.includes('2X')) || Boolean(product.name?.includes('3X')) || Boolean(product.name?.includes('3G')) || Boolean(product.name?.includes('4X')) || Boolean(product.name?.includes('4G')));

    const validSizesFor5Core = CORE_TO_SQMM_MAP['5'] || [];
    const is5CoreValidForSize = validSizesFor5Core.some(s => Math.abs(parseFloat(s) - sizeNum) < 0.001);

    // Standard cores (clean list of 18 cores)
    let cores = ['2 Core', '3 Core', '4 Core', '5 Core', '6 Core', '7 Core', '8 Core', '10 Core', '12 Core', '14 Core', '16 Core', '18 Core', '20 Core', '25 Core', '30 Core', '34 Core', '40 Core', '50 Core'];

    // If dedicated 2/3/4-core cable without 5-core or if 5-core not valid for size, remove unnecessary Five Core
    if (isDedicated234 || !is5CoreValidForSize) {
      cores = cores.filter(c => c !== '5 Core');
    }

    return cores;
  }, [isSingleCore, product.rawCore, dbProduct?.core, product.name, sizeNum]);

  // Cross-section options: only valid sizes for the selected core
  const availableSizeOptions = useMemo(() => {
    const validSqmms = CORE_TO_SQMM_MAP[coreNum.toString()];
    const standardSizes = ['0.5 Sqmm', '0.75 Sqmm', '1 Sqmm', '1.5 Sqmm', '2.5 Sqmm', '4 Sqmm', '6 Sqmm', '10 Sqmm', '16 Sqmm', '25 Sqmm', '35 Sqmm'];
    if (!validSqmms || validSqmms.length === 0) return standardSizes;
    return standardSizes.filter(s => {
      const val = parseFloat(s.split(' ')[0]);
      return validSqmms.some(v => Math.abs(parseFloat(v) - val) < 0.001);
    });
  }, [coreNum]);

  // Ensure selected options remain valid when switching
  useEffect(() => {
    if (availableSizeOptions.length > 0 && !availableSizeOptions.includes(selectedSize)) {
      setSelectedSize(availableSizeOptions[0]);
    }
  }, [availableSizeOptions, selectedSize]);

  useEffect(() => {
    if (availableCoreOptions.length > 0 && !availableCoreOptions.includes(selectedCore)) {
      setSelectedCore(availableCoreOptions[0]);
    }
  }, [availableCoreOptions, selectedCore]);

  // Requirement 1 & 2: Dynamic Part Number matching across static LAPP data & DB
  const matchedVariant = useMemo(() => {
    if (!isConfigurable) return null;

    const prodNameLower = (product.name || '').toLowerCase();
    const prodPartLower = (product.partNo || '').toLowerCase();

    const isSy = prodNameLower.includes('sy') || prodPartLower.includes('sy');
    const isCy = prodNameLower.includes('cy') || prodPartLower.includes('cy');
    const is100 = prodNameLower.includes('100') || prodPartLower.includes('100');
    const isUnitronic = prodNameLower.includes('unitronic');

    // 1. Search in ALL_OLFLEX_PRODUCTS
    const candidates = ALL_OLFLEX_PRODUCTS.filter((p: any) => {
      if (p.core !== undefined && p.core !== null) {
        if (p.core !== coreNum) return false;
      }
      if (p.size !== undefined && p.size !== null) {
        if (Math.abs(p.size - sizeNum) > 0.001) return false;
      }
      if (!isSingleCore && p.pe) {
        if (p.pe.toUpperCase() !== earthChar) return false;
      }
      return true;
    });

    if (candidates.length > 0) {
      const seriesMatch = candidates.find((p: any) => {
        const pName = p.name.toLowerCase();
        if (isSy) return pName.includes('sy');
        if (isCy) return pName.includes('cy');
        if (is100) return pName.includes('100');
        if (isUnitronic) return pName.includes('unitronic');
        return !pName.includes('sy') && !pName.includes('cy') && !pName.includes('100') && !pName.includes('unitronic');
      });
      if (seriesMatch) return seriesMatch;
      return candidates[0];
    }

    // 2. Search in allDbProducts
    if (allDbProducts.length > 0) {
      const dbCandidates = allDbProducts.filter((p: any) => {
        const pCore = p.core ? parseInt(String(p.core).replace(/[^0-9]/g, ''), 10) : null;
        const pSize = parseFloat(String(p.sqmm || p.coreSize || p.size || 0));
        if (pCore !== null && pCore !== coreNum) return false;
        if (pSize && Math.abs(pSize - sizeNum) > 0.001) return false;
        return true;
      });
      if (dbCandidates.length > 0) return dbCandidates[0];
    }

    return null;
  }, [isConfigurable, isSingleCore, product.name, product.partNo, coreNum, sizeNum, earthChar, allDbProducts]);

  // Requirement 1 & 2: Dynamic Part Number visible in product details and left catalog
  const dynamicPartNo = useMemo(() => {
    if (matchedVariant && matchedVariant.partNo) {
      return matchedVariant.partNo;
    }
    if (!isConfigurable) {
      return product.partNo;
    }
    return product.partNo;
  }, [matchedVariant, isConfigurable, product.partNo]);

  // Requirement 4: Product primary identifier clearly visible at top (e.g. 110 5G 4)
  const primaryIdentifier = useMemo(() => {
    if (!product.brand?.includes("LAPP")) {
      return product.partNo || product.name;
    }
    const prodName = product.name || '';
    let series = '110';
    if (/110\s*sy/i.test(prodName)) series = '110 SY';
    else if (/110\s*cy/i.test(prodName)) series = '110 CY';
    else if (/100/i.test(prodName)) series = '100 I';
    else if (/unitronic/i.test(prodName)) series = 'UNITRONIC';
    else if (/h07v-k/i.test(prodName)) series = 'H07V-K';
    else if (/h05v-k/i.test(prodName)) series = 'H05V-K';
    else if (/uniplus/i.test(prodName)) series = 'UNIPLUS';

    if (isSingleCore) {
      const sizeStr = selectedSize.replace(' Sqmm', '').replace(/(\d+),(\d+)/g, '$1.$2').trim();
      return `${series} 1X ${sizeStr} ${selectedColor}`;
    }

    const sizeStr = selectedSize.replace(' Sqmm', '').replace(/(\d+),(\d+)/g, '$1.$2').trim();
    // Produces exact format e.g. "110 5G 4"
    return `${series} ${coreNum}${earthChar} ${sizeStr}`;
  }, [product.name, product.brand, product.partNo, isSingleCore, selectedSize, selectedColor, coreNum, earthChar]);

  // Requirement 7: Core description rule for 3-core, 4-core (4G), 5-core (5G)
  const coreDescription = useMemo(() => {
    const isEarth = earthChar === 'G';
    if (isSingleCore) {
      return `Single core stranded Class 5 bare copper conductor with ${selectedColor} insulation.`;
    }
    if (coreNum === 2) {
      return "Two black cores with consecutive white numbering (2 black cores).";
    }
    if (coreNum === 3) {
      if (isEarth) {
        return "Two black cores with white numbering and one green/yellow protective conductor (3G specification: 2 black cores + 1 yellow/green core).";
      }
      return "Three black cores with consecutive white numbering (3-core specification: three black cores).";
    }
    if (coreNum === 4) {
      if (isEarth) {
        return "Three black cores with white consecutive numbering and one green/yellow protective earth core (4G specification: three black cores and one yellow/green core).";
      }
      return "Four black cores with consecutive white numbering without protective conductor (4X specification: four black cores).";
    }
    if (coreNum === 5) {
      if (isEarth) {
        return "Four black cores with consecutive white numbering and one green/yellow protective earth core (5G specification: four black cores and one yellow/green core).";
      }
      return "Five black cores with consecutive white numbering (5X specification: five black cores).";
    }
    if (isEarth) {
      return `${coreNum - 1} black cores with white numbering and 1 green/yellow protective earth conductor (${coreNum}G specification).`;
    }
    return `${coreNum} black cores with consecutive white numbering (${coreNum}X specification).`;
  }, [isSingleCore, selectedColor, coreNum, earthChar]);

  const coreDescriptionShort = useMemo(() => {
    const isEarth = earthChar === 'G';
    if (coreNum === 3 && !isEarth) return "3 Black Cores";
    if (coreNum === 3 && isEarth) return "2 Black Cores + 1 Yellow/Green Earth";
    if (coreNum === 4 && isEarth) return "3 Black Cores + 1 Yellow/Green Earth (4G)";
    if (coreNum === 4 && !isEarth) return "4 Black Cores (4X)";
    if (coreNum === 5 && isEarth) return "4 Black Cores + 1 Yellow/Green Earth (5G)";
    if (isEarth) return `${coreNum - 1} Black Cores + 1 Yellow/Green Earth`;
    return `${coreNum} Black Numbered Cores`;
  }, [coreNum, earthChar]);

  useEffect(() => {
    if (!isLappCable) return;
    if (product.brand?.includes("LAPP") && selectedCore) {
      const sumHash = coreNum + sizeNum * 100;
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
  }, [isLappCable, selectedCore, selectedSize, product.brand, coreNum, sizeNum]);

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
    if (!isConfigurable) return (product.name || '').replace(/(\d+),(\d+)/g, '$1.$2');
    if (!product.brand?.includes("LAPP")) return (product.name || '').replace(/(\d+),(\d+)/g, '$1.$2');

    let baseName = (product.name || '')
      .replace(/\s+\d+\s*[xX]\s*\d+\s*[xX]\s*[\d,.]+/gi, '')
      .replace(/\s+\d+\s*[xXgG]\s*[\d,.]+/gi, '')
      .trim();

    if (!baseName) baseName = product.name || '';
    baseName = baseName.replace(/(\d+),(\d+)/g, '$1.$2');

    if (isSingleCore) {
      const sizeStr = selectedSize.replace(' Sqmm', '').replace(',', '.').trim();
      return `${baseName} 1X${sizeStr} ${selectedColor}`.replace(/(\d+),(\d+)/g, '$1.$2');
    }

    const sizeStr = selectedSize.replace(' Sqmm', '').replace(',', '.').trim();
    return `${baseName} ${coreNum}${earthChar}${sizeStr}`.replace(/(\d+),(\d+)/g, '$1.$2');
  }, [product.name, product.brand, isConfigurable, isSingleCore, coreNum, selectedSize, earthChar, selectedColor]);

  // Dynamic price resolution from matched LAPP product catalog
  const calculatedPrice = useMemo(() => {
    if (matchedVariant && matchedVariant.price) {
      return matchedVariant.price;
    }
    if (!isConfigurable) return product.price;
    if (!product.brand?.includes("LAPP")) return product.price;

    const coreMultiplier = isSingleCore ? 1 : coreNum / 2;
    const sizeMultiplier = sizeNum / 0.5;
    let finalPrice = (product.price || 50) * Math.pow(coreMultiplier, 0.85) * Math.pow(sizeMultiplier, 0.9);

    if (earthChar === 'G') {
      finalPrice = finalPrice * 1.05;
    }

    return Math.round(finalPrice * 100) / 100;
  }, [matchedVariant, product.price, product.brand, isConfigurable, isSingleCore, coreNum, sizeNum, earthChar]);

  // Dynamic specs list reflecting selected core, size, and reviewer rule
  const dynamicSpecs = useMemo(() => {
    if (!isConfigurable) {
      return (product.specs || []).map((s: string) => formatSpecificationText(s));
    }

    const earthText = earthChar === 'G' ? 'With Yellow/Green Earth (G)' : 'Without Earth (X)';
    const odText = matchedVariant?.outerDia ? `${matchedVariant.outerDia} mm` : 'Standard Industrial Sheath';
    const cuText = matchedVariant?.copperIndex ? `${matchedVariant.copperIndex} kg/km` : 'Optimized copper weight';
    const wtText = matchedVariant?.weight ? `${matchedVariant.weight} kg/km` : 'Standard industrial weight';
    const voltText = product.voltage || '300/500 V';

    return [
      `Cores / Spec: ${coreNum} Cores · ${primaryIdentifier} (${earthText})`,
      `Core Identification: ${coreDescription}`,
      `Conductor Cross Section: ${sizeNum} mm² (Class 5 fine-wire bare copper)`,
      `Outer Diameter: ${odText}`,
      `Copper Index: ${cuText}`,
      `Weight: ${wtText}`,
      `Nominal Voltage: ${voltText} · Test Voltage: 4000 V`,
      `Temp Range: -40°C to +80°C static / -5°C to +70°C flexing`,
    ];
  }, [isConfigurable, product.specs, product.voltage, earthChar, matchedVariant, coreNum, primaryIdentifier, coreDescription, sizeNum]);

  const currentVariantId = useMemo(() => {
    if (!isConfigurable) return product.id || dynamicPartNo;
    if (isSingleCore) {
      return `${product.id}_1x_${selectedSize.replace(/\s+/g, '')}_${selectedColor}`;
    }
    const coreSlug = selectedCore.replace(/\s+/g, '');
    const sizeSlug = selectedSize.replace(/\s+/g, '');
    return `${product.id}_${coreSlug}_${sizeSlug}_${earthChar}_${dynamicPartNo}`;
  }, [product.id, dynamicPartNo, isConfigurable, isSingleCore, selectedSize, selectedColor, selectedCore, earthChar]);

  const isInCart = cart.some((item) =>
    item.id === currentVariantId ||
    (item.partNo === dynamicPartNo && (!isConfigurable || item.name === displayProductName))
  );

  const handleAddToCart = () => {
    addToCart({
      ...product,
      id: currentVariantId,
      partNo: dynamicPartNo,
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
        {/* Breadcrumb: Dynamic specification & part number visible on top left */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Link to="/" className="hover:text-orange-600 transition-colors font-medium">
            Home
          </Link>
          <span>/</span>
          <Link to="/#catalog" className="hover:text-orange-600 transition-colors font-medium">
            Catalog
          </Link>
          <span>/</span>
          <span className="text-orange-600 font-bold">{product.brand}</span>
          <span>/</span>
          <span className="text-slate-900 font-bold truncate max-w-xs font-mono">
            {primaryIdentifier} ({dynamicPartNo})
          </span>
        </div>

        {/* Contiguous PDP Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Left Column: Gallery & High-Res Inspection (6 Cols) */}
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
                    target.src = getBrandFallback(product.brand, product.name);
                  }}
                />
              </div>

              {/* Ready Stock badge */}
              <div className="absolute top-4 left-4 text-xs font-mono text-emerald-800 font-bold bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200 shadow-2xs pointer-events-none">
                {product.stock}
              </div>

              {/* Requirement 2: Dynamic Part Number clearly visible on the Left Column */}
              <div className="absolute top-4 right-4 text-xs font-mono text-slate-800 font-bold bg-white/95 backdrop-blur-xs px-3 py-1 rounded-lg border border-slate-200 shadow-sm pointer-events-none flex items-center gap-1.5">
                <span className="text-[10px] text-slate-900 font-extrabold uppercase">Part #</span>
                <span className="text-orange-600 font-black">{dynamicPartNo}</span>
              </div>
            </div>

            {/* Thumbnail Gallery */}
            <div className="flex items-center gap-3 mt-4">
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImg(img.src)}
                  className={`w-20 h-20 rounded-xl border-2 p-1 overflow-hidden transition-all ${selectedImg === img.src
                      ? "border-orange-500 shadow-md"
                      : "border-slate-200 hover:border-orange-300 hover:shadow-sm opacity-70 hover:opacity-100 bg-white"
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

            {/* Left Catalog Reference Strip */}
            <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-900 bg-white px-4 py-2.5 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-slate-900 font-bold font-sans">Catalog Reference:</span>
              <span className="text-slate-900 font-black">
                {primaryIdentifier} · Part #{dynamicPartNo}
              </span>
            </div>
          </div>

          {/* Right Column: Contiguous Purchase Module (6 Cols) */}
          <div className="lg:col-span-6 space-y-5">
            <div>
              {/* Requirement 4: Product primary identifier clearly visible at top (e.g. 110 5G 4) */}
              {/* Requirement 2: HSN: 85444990 removed as requested */}
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-orange-500 text-white font-mono font-black text-sm tracking-wide shadow-xs">
                  <span className="text-orange-100 text-[11px] font-sans font-bold uppercase">Specification:</span>
                  {primaryIdentifier}
                </span>
                <span className="text-xs uppercase font-mono text-slate-500 font-bold">
                  · Part No: <strong className="text-slate-900 font-black font-mono">{dynamicPartNo}</strong>
                </span>
                {(dbProduct?.colour || product.colour) && (
                  <>
                    <span>·</span>
                    <ColourSwatch colour={dbProduct?.colour || product.colour} size="xs" />
                  </>
                )}
              </div>

              {/* Requirement 3: Website color scheme Orange instead of Red */}
              <h1 className="text-2xl sm:text-3xl font-black text-orange-600 tracking-tight leading-snug mb-3">
                {displayProductName}
              </h1>

              {/* Requirement 3: Key Specs Pills dynamically update */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-orange-50 text-orange-950 border border-orange-200 text-xs font-mono font-bold">
                  {coreNum} Cores × {sizeNum} mm² ({earthChar})
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-50 text-amber-900 border border-amber-200 text-xs font-semibold">
                  {coreDescriptionShort}
                </span>
                {(dbProduct?.colour || product.colour) && (
                  <ColourSwatch colour={dbProduct?.colour || product.colour} size="sm" />
                )}
                <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold">
                  UOM: {dbProduct?.uom || product.uom || product.unit || 'Meter'}
                </span>
              </div>
            </div>

            {/* LAPP Variant Layout - Compact, cleanly aligned grid (Requirement 1 & 2) */}
            {product.brand?.includes("LAPP") && isConfigurable && (
              <div className="border border-orange-500/20 rounded-2xl p-4 sm:p-5 bg-white shadow-xs space-y-4">

                {/* Compact Grid for Variant Options */}
                <div className="space-y-3.5">
                  {/* Requirement 1: Core buttons made compact, uniform size, and neatly aligned */}
                  {!isSingleCore && (
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="font-bold text-slate-800 text-xs uppercase tracking-wider font-mono">
                          Core
                        </label>
                        <span className="text-[11px] font-mono font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                          {coreNum} Cores ({earthChar})
                        </span>
                      </div>
                      <div className="grid grid-cols-5 sm:grid-cols-9 lg:grid-cols-10 gap-1.5">
                        {availableCoreOptions.map(core => (
                          <button
                            key={core}
                            onClick={() => setSelectedCore(core)}
                            className={`h-8 w-full flex items-center justify-center text-xs font-mono font-bold rounded-lg border transition-all ${selectedCore === core
                                ? 'bg-orange-500 text-white border-orange-600 shadow-sm ring-2 ring-orange-400/40'
                                : 'bg-white text-slate-700 border-slate-200 hover:border-orange-400 hover:bg-orange-50/50'
                              }`}
                          >
                            {core.replace(' Core', '')}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Requirement 1: Size buttons made compact, uniform size, and neatly aligned with cores */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="font-bold text-slate-800 text-xs uppercase tracking-wider font-mono">
                        Size (Sqmm)
                      </label>
                      <span className="text-[11px] font-mono font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                        {sizeNum} mm²
                      </span>
                    </div>
                    <div className="grid grid-cols-5 sm:grid-cols-9 lg:grid-cols-10 gap-1.5">
                      {availableSizeOptions.map(size => {
                        const displayVal = size.replace(' Sqmm', '');
                        return (
                          <button
                            key={size}
                            onClick={() => setSelectedSize(size)}
                            className={`h-8 w-full flex items-center justify-center text-xs font-mono font-bold rounded-lg border transition-all ${selectedSize === size
                                ? 'bg-orange-500 text-white border-orange-600 shadow-sm ring-2 ring-orange-400/40'
                                : 'bg-white text-slate-700 border-slate-200 hover:border-orange-400 hover:bg-orange-50/50'
                              }`}
                          >
                            {displayVal}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {isSingleCore && (
                    <div>
                      <label className="font-bold text-slate-800 text-xs uppercase tracking-wider font-mono block mb-1.5">Color</label>
                      <div className="flex flex-wrap gap-1.5">
                        {['Black', 'Red', 'Blue', 'Yellow', 'Green', 'Grey', 'Brown', 'White'].map(color => (
                          <button
                            key={color}
                            onClick={() => setSelectedColor(color)}
                            className={`px-3 py-1 text-xs font-bold rounded-lg border transition-colors ${selectedColor === color
                                ? 'bg-orange-500 text-white border-orange-600 shadow-sm'
                                : 'bg-white text-slate-700 border-slate-200 hover:border-orange-400 hover:bg-orange-50'
                              }`}
                          >
                            {color}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Requirement 1: Real-time Meter / Price Calculator clearly visible on the screen */}
            <div className="rounded-3xl bg-white border border-slate-200 p-5 sm:p-6 space-y-4 shadow-lg">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 sm:gap-0">
                <div>
                  <span className="text-[11px] uppercase font-mono text-orange-600 font-bold block">
                    Contract Rate
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-black font-mono text-slate-900 tabular-nums">
                      ₹{calculatedPrice % 1 === 0 ? calculatedPrice.toLocaleString("en-IN") : calculatedPrice.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className="text-xs text-slate-900 font-mono font-bold">
                      /{product.unit}
                    </span>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-[11px] text-slate-900 font-black block mb-1">
                    Update Qty ({product.unit === 'meter' ? 'Mtrs' : 'Nos'})
                  </span>
                  <div className="flex items-center justify-start sm:justify-end">
                    <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden shadow-sm bg-white">
                      <button onClick={handleStepDown} className="px-3.5 py-1.5 bg-slate-50 hover:bg-orange-50 hover:text-orange-600 text-slate-800 font-black border-r border-slate-300 transition-colors active:bg-slate-200">-</button>
                      <span className="px-5 py-1.5 text-base sm:text-sm font-black font-mono text-slate-950 bg-white min-w-[3.5rem] text-center">{qty}</span>
                      <button onClick={handleStepUp} className="px-3.5 py-1.5 bg-slate-50 hover:bg-orange-50 hover:text-orange-600 text-slate-800 font-black border-l border-slate-300 transition-colors active:bg-slate-200">+</button>
                    </div>
                  </div>
                </div>
              </div>

              {product.unit === 'meter' && (
                <div className="text-[10px] sm:text-[11px] text-amber-900 font-bold flex items-start gap-1 mt-1">
                  <span className="text-amber-600 shrink-0">⚠️</span>
                  <span>Caution: order Multiple of  25 mtrs for all multicore</span>
                </div>
              )}

              {/* Dynamic Cost Projection */}
              <div className="pt-3 border-t border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between text-slate-900 font-bold">
                  <span>Total:</span>
                  <span className="font-mono text-slate-950 font-black tabular-nums">
                    ₹{lineTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between text-slate-900 font-bold">
                  <span>GST (18%):</span>
                  <span className="font-mono text-slate-950 font-black tabular-nums">
                    ₹{gstLine.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-black text-slate-950 pt-2 border-t border-slate-200">
                  <span>Estimated Total (Incl. GST):</span>
                  <span className="text-orange-600 font-mono tabular-nums text-lg font-black">
                    ₹{totalWithGst.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* CTAs */}
              <div className="grid grid-cols-1 gap-3 pt-1">
                <button
                  onClick={handleAddToCart}
                  className={`py-3 px-4 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95 ${isInCart
                      ? "bg-emerald-50 border border-emerald-400 text-emerald-950"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-950 border border-slate-300"
                    }`}
                >
                  {isInCart ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-700" />
                      <span>In RFQ Cart</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 text-slate-900" />
                      <span>Add to Quote Cart</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-900 font-bold pt-1">
                <span>Direct Warehouse Dispatch from Bangalore</span>
                <button
                  type="button"
                  onClick={() => setIsCuttingModalOpen(true)}
                  className="text-orange-600 font-extrabold hover:underline cursor-pointer"
                >
                  Need Custom Project Cutting?
                </button>
              </div>

              {/* Special Product Requirements & Lengths Enquiry Callout */}
              <div className="mt-2.5 pt-2 border-t border-slate-200 flex items-center justify-between gap-2.5 bg-orange-50/80 rounded-xl px-3 py-2 border border-orange-200">
                <p className="text-[11px] font-bold text-slate-950 leading-snug">
                  For any special product requirements or special cable lengths, please send an enquiry.
                </p>
                <button
                  type="button"
                  onClick={() => setIsSpecialEnquiryModalOpen(true)}
                  className="shrink-0 inline-flex items-center text-[11px] font-black text-white bg-orange-600 hover:bg-orange-700 px-3 py-1.5 rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  Click Here
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: Description vs Technical Data */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          <div className="lg:col-span-6 space-y-6">
            <div className="rounded-3xl bg-white border border-slate-200 p-8 shadow-sm h-full">
              <h3 className="text-lg font-black text-slate-900 tracking-tight mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-orange-500" />
                Product Description & Highlights
              </h3>

              {/* Requirement 7: Reviewer Rule Core Specification & Description */}
              {isConfigurable && (
                <div className="mb-6 p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-900 font-mono">
                    <span>Core Specification & Identification</span>
                  </div>
                  <p className="text-sm font-bold text-slate-900 leading-snug">
                    {coreDescription}
                  </p>
                  <p className="text-xs text-slate-600">
                    {coreNum === 3
                      ? "3-core specification: Three black cores with white consecutive numbering."
                      : coreNum === 4 && earthChar === 'G'
                        ? "4G specification: Three black cores with white consecutive numbering and one green/yellow protective earth core."
                        : coreNum === 4
                          ? "4X specification: Four black cores with white consecutive numbering without protective conductor."
                          : coreNum === 5 && earthChar === 'G'
                            ? "5G specification: Four black cores with white consecutive numbering and one green/yellow protective earth core."
                            : `${coreNum}-core industrial control cable manufactured to DIN EN 50525 / VDE 0293 standards.`}
                  </p>
                </div>
              )}

              <p className="text-sm text-slate-600 leading-relaxed mb-6 font-medium">
                {product.application}
              </p>

              {/* Requirement 3 & 6: Dynamic specs with 25A resolution */}
              <div className="space-y-4">
                {dynamicSpecs.map((spec: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-3 text-slate-700 font-medium text-sm">
                    <div className="w-5 h-5 shrink-0 rounded-full bg-orange-100 flex items-center justify-center mt-0.5 border border-orange-200">
                      <Check className="w-3 h-3 text-orange-600" />
                    </div>
                    <span className={`leading-relaxed ${/^(Cores?|Cross Section|Core Identification)/i.test(spec) ? "font-extrabold text-slate-900" : ""}`}>
                      {formatSpecificationText(spec)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="rounded-3xl bg-white border border-slate-200 p-8 space-y-6 shadow-sm h-full">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <FileText className="w-5 h-5 text-orange-500" />
                    <span>Technical Datasheet</span>
                  </h3>
                  {matchedGroup && (
                    <span className="text-[11px] font-bold text-orange-800 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-md">
                      {matchedGroup.name}
                    </span>
                  )}
                </div>
              </div>

              {/* Requirement 3: Technical data fields update dynamically */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50 space-y-1">
                  <span className="text-slate-900 font-black uppercase text-[11px] font-mono tracking-wider block">Conductor Design</span>
                  <span className="text-slate-900 font-bold text-sm">
                    {product.conductor || "Fine-wire bare copper, Class 5"}
                  </span>
                </div>

                <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50 space-y-1">
                  <span className="text-slate-900 font-black uppercase text-[11px] font-mono tracking-wider block">Nominal Voltage</span>
                  <span className="text-slate-900 font-bold text-sm">
                    {product.voltage || "300 / 500 V"}
                  </span>
                </div>

                <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50 space-y-1">
                  <span className="text-slate-900 font-black uppercase text-[11px] font-mono tracking-wider block">Operating Temp</span>
                  <span className="text-slate-900 font-bold text-sm">
                    {product.tempRange || "-40°C to +80°C"}
                  </span>
                </div>

                <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50 space-y-1">
                  <span className="text-slate-900 font-black uppercase text-[11px] font-mono tracking-wider block">Bending Radius</span>
                  <span className="text-slate-900 font-bold text-sm">
                    Flexing: 10x OD
                  </span>
                </div>

                <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50 space-y-1">
                  <span className="text-slate-900 font-black uppercase text-[11px] font-mono tracking-wider block">Flame Retardancy</span>
                  <span className="text-slate-900 font-bold text-sm">
                    IEC 60332-1-2
                  </span>
                </div>

                <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50 space-y-1">
                  <span className="text-slate-900 font-black uppercase text-[11px] font-mono tracking-wider block">Oil Resistance</span>
                  <span className="text-slate-900 font-bold text-sm">
                    DIN EN 50290-2-22
                  </span>
                </div>

                {/* Dynamic Cross Section */}
                <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50 space-y-1">
                  <span className="text-slate-900 font-black uppercase text-[11px] font-mono tracking-wider block">Cross Section (SQMM)</span>
                  <span className="text-slate-900 font-bold text-sm font-mono">
                    {isConfigurable ? `${sizeNum} mm²` : formatSpecificationText(dbProduct?.sqmm || product.sqmm || (product.size ? `${product.size} mm²` : '0.5 - 35 mm²'))}
                  </span>
                </div>

                {/* Dynamic Core Configuration */}
                <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50 space-y-1">
                  <span className="text-slate-900 font-black uppercase text-[11px] font-mono tracking-wider block">Core Configuration</span>
                  <span className="text-slate-900 font-bold text-sm font-mono">
                    {isConfigurable ? `${coreNum} Cores (${earthChar === 'G' ? 'With Earth G' : 'All Numbered X'})` : (dbProduct?.core ? `${dbProduct.core} Cores` : (product.core ? `${product.core} Cores` : 'Single & Multi-Core'))}
                  </span>
                </div>

                {/* Core Identification Spec Box */}
                {isConfigurable && (
                  <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50 space-y-1 sm:col-span-2">
                    <span className="text-slate-900 font-black uppercase text-[11px] font-mono tracking-wider block">Core Identification Standard</span>
                    <span className="text-slate-900 font-bold text-xs leading-relaxed">
                      {coreDescription}
                    </span>
                  </div>
                )}

                {(dbProduct?.colour || product.colour) && (
                  <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50 space-y-1">
                    <span className="text-slate-900 font-black uppercase text-[11px] font-mono tracking-wider block">Sheath / Core Colour</span>
                    <div className="pt-0.5">
                      <ColourSwatch colour={dbProduct?.colour || product.colour} size="sm" />
                    </div>
                  </div>
                )}

                <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50 space-y-1">
                  <span className="text-slate-900 font-black uppercase text-[11px] font-mono tracking-wider block">UOM</span>
                  <span className="text-slate-900 font-bold text-sm">
                    {dbProduct?.uom || product.uom || product.unit || 'Meter (m)'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>


        {/* RFQ Modal */}
        <RFQModal
          productName={`${displayProductName} (${dynamicPartNo})`}
          isOpen={rfqOpen}
          onClose={() => setRfqOpen(false)}
        />

        {/* Custom Cutting Modal */}
        <CustomCuttingModal
          isOpen={isCuttingModalOpen}
          onClose={() => setIsCuttingModalOpen(false)}
          productName={displayProductName}
          partNo={dynamicPartNo}
        />

        {/* Common Blank Special Requirement Enquiry Modal */}
        <SpecialRequirementModal
          isOpen={isSpecialEnquiryModalOpen}
          onClose={() => setIsSpecialEnquiryModalOpen(false)}
        />

        {/* Fullscreen Image Zoom Modal (+/-) */}
        <ImageZoomModal
          isOpen={isZoomModalOpen}
          onClose={() => setIsZoomModalOpen(false)}
          imageSrc={selectedImg}
          altText={displayProductName}
          title={displayProductName}
          brand={product.brand}
          partNo={dynamicPartNo}
        />
      </div>
    </div>
  );
};
