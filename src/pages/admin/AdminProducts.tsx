import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams } from 'react-router-dom';
import { 
  Upload, Plus, Download, FileSpreadsheet, Search, ShoppingBag, X, 
  Image as ImageIcon, Trash2, Link as LinkIcon, RefreshCw, Layers, Tag, 
  Edit2, FileText, CheckCircle2, AlertCircle, ExternalLink, Eye,
  ArrowUpDown, ArrowUp, ArrowDown, Calendar, Check, Building, ChevronRight, Zap
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { API_BASE_URL } from '../../config/api';
import { 
  AVAILABLE_CORES, 
  getValidSqmmOptions, 
  validateCoreSqmm, 
  UOM_OPTIONS, 
  COLOUR_OPTIONS 
} from '../../config/cableSpecs';
import { ColourSwatch } from '../../components/ui/ColourSwatch';
import { formatUom, formatWeight, formatOD } from './AdminRFQs';

// Requirement 5.2: Strictly four authorized makes
export const ALLOWED_MAKES = ['LAPP', 'Eaton', 'Partex', 'Mennekes'] as const;

// 4 Canonical Sub-Series Options for each of the 6 LAPP Categories
export interface SubSeriesOption {
  id: string;
  title: string;
  desc: string;
  pattern: RegExp;
  baselineCount: number;
}

export interface CategorySeriesConfig {
  brandTitle: string;
  groupPrefix: string;
  allLabel: string;
  baselineTotal: number;
  series: SubSeriesOption[];
}

export const LAPP_CATEGORY_CONFIGS: Record<string, CategorySeriesConfig> = {
  'power and control cables': {
    brandTitle: 'ÖLFLEX® Flexible Control Cables',
    groupPrefix: 'ÖLFLEX',
    allLabel: 'All ÖLFLEX®',
    baselineTotal: 143,
    series: [
      { id: '110', title: 'ÖLFLEX® CLASSIC 110', desc: 'VDE-registered PVC control cable with numbered cores (300/500V)', pattern: /classic\s*110\b(?!.*(?:sy|cy))/i, baselineCount: 45 },
      { id: '110sy', title: 'ÖLFLEX® CLASSIC 110 SY', desc: 'Steel wire braid armored PVC control cable for mechanical protection (300/500V)', pattern: /classic\s*110\s*sy/i, baselineCount: 32 },
      { id: '110cy', title: 'ÖLFLEX® CLASSIC 110 CY', desc: 'Screened PVC control cable with copper braid for EMC compliance (300/500V)', pattern: /classic\s*110\s*cy/i, baselineCount: 38 },
      { id: '100', title: 'ÖLFLEX® CLASSIC 100I', desc: 'Color-coded PVC control cable for power & industrial connections (300/500V - 450/750V)', pattern: /(?:classic\s*)?100/i, baselineCount: 28 },
    ]
  },
  'data communication cables': {
    brandTitle: 'UNITRONIC® Data & Communication Cables',
    groupPrefix: 'UNITRONIC',
    allLabel: 'All UNITRONIC®',
    baselineTotal: 68,
    series: [
      { id: 'liycy-tp', title: 'UNITRONIC® LiYCY (TP)', desc: 'Screened twisted pair data transmission cable for noise-sensitive EMC environments', pattern: /liycy\s*\(tp\)/i, baselineCount: 20 },
      { id: 'liycy', title: 'UNITRONIC® LiYCY', desc: 'Screened multi-core data cable with tinned copper braid against electromagnetic interference', pattern: /liycy\b(?!.*\(tp\))/i, baselineCount: 24 },
      { id: 'liyy-tp', title: 'UNITRONIC® LiYY (TP)', desc: 'Space-saving twisted pair data cable with compact outer diameter and minimal crosstalk', pattern: /liyy\s*\(tp\)/i, baselineCount: 14 },
      { id: 'liyy', title: 'UNITRONIC® LiYY', desc: 'Space-saving unshielded multi-core data and signal transmission cable', pattern: /liyy\b(?!.*\(tp\))/i, baselineCount: 10 },
    ]
  },
  'control cabinet single cores': {
    brandTitle: 'UNIPLUS® Control Cabinet Single Cores',
    groupPrefix: 'UNIPLUS',
    allLabel: 'All UNIPLUS®',
    baselineTotal: 95,
    series: [
      { id: 'h07v-k', title: 'ÖLFLEX® UNIPLUS H07V-K', desc: 'Flexible PVC single core wiring cable for switch cabinets & control panels (450/750V)', pattern: /h07v-k|uniplus.*(?:1\.5|2\.5|4|6|10|16)/i, baselineCount: 36 },
      { id: 'h05v-k', title: 'ÖLFLEX® UNIPLUS H05V-K', desc: 'Flexible hook-up wire for internal apparatus wiring and electronics (300/500V)', pattern: /h05v-k|uniplus.*(?:0\.5|0\.75|1\b)/i, baselineCount: 24 },
      { id: 'multinorm', title: 'ÖLFLEX® MULTINORM', desc: 'UL/CSA/HAR multi-standard approved single core wire for export machinery', pattern: /multinorm/i, baselineCount: 18 },
      { id: 'tri-rated', title: 'UNIPLUS® TRI-RATED', desc: 'BS/UL/CSA certified panel wiring wire for high temperature resistance up to 105°C', pattern: /tri-rated|trirated/i, baselineCount: 17 },
    ]
  },
  'cable glands & counter nuts': {
    brandTitle: 'SKINTOP® Cable Glands & Counter Nuts',
    groupPrefix: 'SKINTOP',
    allLabel: 'All SKINTOP®',
    baselineTotal: 84,
    series: [
      { id: 'st-m', title: 'SKINTOP® ST-M', desc: 'Metric polyamide cable gland with integrated vibration protection and IP68 seal', pattern: /st-m|st\s*pg|st\s*m/i, baselineCount: 32 },
      { id: 'gmp-gl-m', title: 'SKINTOP® GMP-GL-M', desc: 'Metric glass-fiber reinforced polyamide counter nuts / locknuts', pattern: /gmp-gl-m|gmp|counter\s*nut|locknut/i, baselineCount: 22 },
      { id: 'ms-m', title: 'SKINTOP® MS-M', desc: 'Nickel-plated brass cable gland for harsh mechanical and chemical environments', pattern: /ms-m|brass/i, baselineCount: 18 },
      { id: 'click', title: 'SKINTOP® CLICK', desc: 'Innovative quick-mount click cable gland system with snap-in installation', pattern: /click/i, baselineCount: 12 },
    ]
  },
  'rill, conduit & klick': {
    brandTitle: 'SILVYN® Protective Conduits & Systems',
    groupPrefix: 'SILVYN',
    allLabel: 'All SILVYN®',
    baselineTotal: 52,
    series: [
      { id: 'rill', title: 'SILVYN® RILL', desc: 'Corrugated flexible polyamide conduit for dynamic cable bundling and physical protection', pattern: /rill/i, baselineCount: 20 },
      { id: 'klick', title: 'SILVYN® KLICK', desc: 'Quick-snap push-in conduit connector glands with high pull-out resistance (IP66/IP68)', pattern: /klick/i, baselineCount: 16 },
      { id: 'fpas', title: 'SILVYN® FPAS', desc: 'Heavy-duty polyamide PA6 flexible protective conduit for machinery & automation', pattern: /fpas/i, baselineCount: 10 },
      { id: 'lgs-2', title: 'SILVYN® LGS-2', desc: 'Liquid-tight galvanized steel armored conduit with oil-resistant PVC jacket', pattern: /lgs|metal/i, baselineCount: 6 },
    ]
  },
  'domestic / house wiring': {
    brandTitle: 'LAPP INFRA Building & House Wires',
    groupPrefix: 'INFRA',
    allLabel: 'All LAPP INFRA',
    baselineTotal: 78,
    series: [
      { id: 'frls', title: 'ÖLFLEX® INFRA FRLS', desc: 'Flame Retardant Low Smoke building wire for residential & commercial wiring (1100V)', pattern: /frls/i, baselineCount: 28 },
      { id: 'fr', title: 'ÖLFLEX® INFRA FR', desc: 'Flame Retardant PVC insulated house wire with high oxygen index for fire safety', pattern: /\bfr\b(?!.*(?:ls|zh))/i, baselineCount: 20 },
      { id: 'hrfr', title: 'ÖLFLEX® INFRA HRFR', desc: 'Heat Resistant Flame Retardant house wire for high-load and warm environments (85°C)', pattern: /hrfr/i, baselineCount: 16 },
      { id: 'zhfr', title: 'ÖLFLEX® INFRA ZHFR', desc: 'Zero Halogen Flame Retardant eco-friendly building wire with zero toxic emissions', pattern: /zhfr/i, baselineCount: 14 },
    ]
  }
};

export const getLappCategoryKey = (catName: string, prodName?: string): string => {
  const s = (catName || '').toLowerCase().trim();
  const p = (prodName || '').toLowerCase().trim();
  if (p.includes('infra') || s.includes('domestic') || s.includes('house') || s.includes('infra') || s.includes('building') || s.includes('solar')) return 'domestic / house wiring';
  if (s.includes('power') || s.includes('control cable') || p.includes('classic 110') || p.includes('classic 100')) return 'power and control cables';
  if (s.includes('data') || s.includes('communication') || p.includes('unitronic') || p.includes('etherline')) return 'data communication cables';
  if (s.includes('single core') || s.includes('cabinet') || s.includes('panel')) return 'control cabinet single cores';
  if (s.includes('gland') || s.includes('counter nut') || s.includes('nut') || p.includes('skintop')) return 'cable glands & counter nuts';
  if (s.includes('rill') || s.includes('conduit') || s.includes('klick') || p.includes('silvyn')) return 'rill, conduit & klick';
  return '';
};

export const OLFLEX_SERIES_OPTIONS = LAPP_CATEGORY_CONFIGS['power and control cables'].series;

interface CategoryItem {
  _id: string;
  name: string;
  description?: string;
  make?: string;
  subGroup?: string;
  imageUrl?: string | null;
  datasheetUrl?: string | null;
}

interface MakeItem {
  _id: string;
  name: string;
  description?: string;
  categoryCount?: number;
  productCount?: number;
}
type BrandItem = MakeItem;

export const DEFAULT_MAKES: MakeItem[] = [
  {
    _id: 'm_lapp',
    name: 'LAPP',
    description: 'Global pioneer in flexible control cables, industrial data systems & cable glands (ÖLFLEX®, UNITRONIC®, SKINTOP®)',
    productCount: 822,
    categoryCount: 6
  },
  {
    _id: 'm_eaton',
    name: 'Eaton',
    description: 'Intelligent power management, industrial switchgear, motor protection breakers & contactors (PKZM0, DILM, NZM)',
    productCount: 8,
    categoryCount: 6
  },
  {
    _id: 'm_partex',
    name: 'Partex',
    description: 'Swedish precision wire, cable and component marking systems, interlocking markers & portable thermal printers',
    productCount: 6,
    categoryCount: 6
  },
  {
    _id: 'm_mennekes',
    name: 'Mennekes',
    description: 'Industrial earthing solutions, chemical electrodes, heavy-duty industrial plugs, sockets & distribution accessories (AMAPLAST, AMAXX®)',
    productCount: 7,
    categoryCount: 6
  }
];

export const OFFICIAL_24_CATEGORIES_METADATA: { name: string; make: string; subGroup: string; description: string }[] = [
  // LAPP (6)
  { name: 'Power and Control Cables', make: 'LAPP', subGroup: 'ÖLFLEX® Power & Control', description: 'Flexible control cables, oil-resistant PVC/PUR cables, and heat-resistant power cables' },
  { name: 'Data Communication Cables', make: 'LAPP', subGroup: 'UNITRONIC® / ETHERLINE®', description: 'Shielded data transmission cables, industrial ethernet cables, and bus system cables' },
  { name: 'Control Cabinet Single Cores', make: 'LAPP', subGroup: 'Single Core Panel Wires', description: 'Hook-up wires, panel single cores, halogen-free and high-temperature single conductor wires' },
  { name: 'Cable Glands & Counter Nuts', make: 'LAPP', subGroup: 'SKINTOP® Cable Glands', description: 'Polyamide, brass, and stainless steel strain relief cable glands and locknuts' },
  { name: 'Rill, Conduit & Klick', make: 'LAPP', subGroup: 'SILVYN® Protective Conduits', description: 'Protective cable conduits, spiral hoses, and quick-click conduit connectors' },
  { name: 'Domestic / House Wiring', make: 'LAPP', subGroup: 'Building Wires / Single Cores', description: 'Flame-retardant FR-LSH building wires, copper conductor house wiring cables' },
  // Eaton (6)
  { name: 'Switchgear & Protection', make: 'Eaton', subGroup: 'Motor Starters, Contactors & Breakers', description: 'Industrial motor control, power distribution switchgear, and safety isolators' },
  { name: 'Motor Protection Breakers', make: 'Eaton', subGroup: 'PKZM0 Motor Breakers', description: 'Rotary motor protection with overload & short circuit release up to 150 kA' },
  { name: 'Molded Case Circuit Breakers', make: 'Eaton', subGroup: 'NZM Compact MCCBs', description: 'Electronic trip molded case circuit breakers up to 1600A for industrial distribution' },
  { name: 'Miniature Circuit Breakers & RCDs', make: 'Eaton', subGroup: 'FAZ DIN-Rail MCBs', description: '10kA and 15kA breaking capacity DIN rail miniature circuit breakers and residual current devices' },
  { name: 'Power Contactors & Relays', make: 'Eaton', subGroup: 'DILM Power Contactors', description: 'Heavy-duty 3-pole and 4-pole contactors with electronic coils and auxiliary relays' },
  { name: 'Power Quality & UPS', make: 'Eaton', subGroup: 'Capacitors & APFC Systems', description: 'Automatic power factor correction panels, harmonic filters, and industrial UPS systems' },
  // Mennekes (6)
  { name: 'Industrial Plugs & Sockets', make: 'Mennekes', subGroup: 'Heavy Duty CEE Plugs & Sockets', description: 'CEE-norm 16A to 125A industrial plugs, couplers, and switched interlocked receptacles' },
  { name: 'AMAXX® & Distribution Enclosures', make: 'Mennekes', subGroup: 'Modular Distribution Units', description: 'Combination receptacle distribution enclosures in high-impact AMAPLAST housing' },
  { name: 'Panel Mounted Receptacle Sockets', make: 'Mennekes', subGroup: 'Watertight Receptacles', description: 'Straight and angled panel mounted receptacles with nickel-plated contacts' },
  { name: 'Chemical Earthing Electrodes', make: 'Mennekes', subGroup: 'Maintenance-Free Chemical Electrodes', description: 'High corrosion-resistant chemical earthing electrodes with crystalline earth compound' },
  { name: 'Copper Clad Earth Rods & Accessories', make: 'Mennekes', subGroup: 'Earth Rods & Clamps', description: 'Molecularly bonded copper clad steel earth rods, driving heads, and bronze couplers' },
  { name: 'Earthing Solutions', make: 'Mennekes', subGroup: 'Chemical Electrodes & Earthing Accessories', description: 'Low-impedance industrial earthing solutions and lightning protection grounding pits' },
  // Partex (6)
  { name: 'Cable Marking Systems', make: 'Partex', subGroup: 'PA Markers & ProMark Printers', description: 'Pre-printed interlocking cable markers, chevron-cut wire tags, and carrier strips' },
  { name: 'Profile Marking Sleeves', make: 'Partex', subGroup: 'PO/POZ Profile Sleeves', description: 'Oval profile marking sleeves and halogen-free printable tubing for wire identification' },
  { name: 'Stainless Steel Cable Markers', make: 'Partex', subGroup: 'PKS Embossed Steel Markers', description: 'Acid-proof AISI 316 stainless steel cable markers for harsh marine and chemical environments' },
  { name: 'Component & Terminal Block Marking', make: 'Partex', subGroup: 'Snap-On Terminal Markers', description: 'Snap-on terminal block markers and component identification tags for switchboards' },
  { name: 'Industrial Thermal Printers & Ribbons', make: 'Partex', subGroup: 'ProMark T-1000 Printers', description: 'Portable high-speed thermal transfer profile and label printers with resin ribbons' },
  { name: 'Industrial Cable Ties & Fasteners', make: 'Partex', subGroup: 'Polyamide & Steel Cable Ties', description: 'UV-resistant nylon cable ties, stainless steel ball-lock ties, and fastening mounts' }
];

export const AdminProducts: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [makes, setMakes] = useState<MakeItem[]>(DEFAULT_MAKES);
  const brands = makes;
  const setBrands = setMakes;

  // Canonical Brand Display Order: 1. LAPP, 2. Eaton, 3. Partex, 4. Mennekes (Guaranteed 4 Approved Makes)
  const sortedMakes = React.useMemo(() => {
    const brandOrder = ['LAPP', 'Eaton', 'Partex', 'Mennekes'];
    const source = makes.length > 0 ? makes : DEFAULT_MAKES;
    const seen = new Set<string>();
    const deduped: MakeItem[] = [];
    for (const m of source) {
      const canonical = ALLOWED_MAKES.find(a => a.toLowerCase() === (m.name || '').toLowerCase().trim());
      if (canonical) {
        const k = canonical.toLowerCase();
        if (!seen.has(k)) {
          seen.add(k);
          deduped.push({ ...m, name: canonical });
        }
      }
    }
    for (const fallback of DEFAULT_MAKES) {
      if (!seen.has(fallback.name.toLowerCase())) {
        deduped.push(fallback);
        seen.add(fallback.name.toLowerCase());
      }
    }
    return deduped.sort((a, b) => {
      const idxA = brandOrder.indexOf(a.name as any);
      const idxB = brandOrder.indexOf(b.name as any);
      return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
    });
  }, [makes]);
  
  const [activeTab, setActiveTab] = useState<'Products' | 'Categories' | 'Makes'>('Products');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [isPriceOnlyUpload, setIsPriceOnlyUpload] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  
  // Product Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<any>(null);
  const [viewProduct, setViewProduct] = useState<any>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [activeBrand, setActiveBrand] = useState<string>('All');
  const [sortField, setSortField] = useState<'name' | 'partNo' | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [viewingImage, setViewingImage] = useState<string | null>(null);
  const [modalImage, setModalImage] = useState<string | null>(null);
  const [imageInputMode, setImageInputMode] = useState<'upload' | 'url'>('upload');
  const [imageUrlInput, setImageUrlInput] = useState<string>('');
  
  // Core Size & SQMM & UOM & Colour Form State
  const [modalCore, setModalCore] = useState<string>('');
  const [modalSqmm, setModalSqmm] = useState<string>('');
  const [modalUom, setModalUom] = useState<string>('Meter');
  const [modalColour, setModalColour] = useState<string>('');
  const [customColour, setCustomColour] = useState<string>('');
  const [coreSqmmError, setCoreSqmmError] = useState<string | null>(null);
  
  // Price Validity State (Requirement 5.9)
  const [modalValidFrom, setModalValidFrom] = useState<string>('');
  const [modalExpiryDate, setModalExpiryDate] = useState<string>('');

  // Datasheet State
  const [modalDatasheet, setModalDatasheet] = useState<string | null>(null);
  const [datasheetInputMode, setDatasheetInputMode] = useState<'upload' | 'url'>('upload');
  const [datasheetUrlInput, setDatasheetUrlInput] = useState<string>('');
  
  const [isSaving, setIsSaving] = useState(false);

  // Category / Make Modal State (Hierarchy: Make -> Make Category -> Product Category/Group -> Product)
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [currentCat, setCurrentCat] = useState<CategoryItem | null>(null);
  const [catFormData, setCatFormData] = useState({ 
    name: '', 
    description: '', 
    make: 'LAPP', 
    subGroup: '', 
    imageUrl: '', 
    datasheetUrl: '' 
  });

  const [isMakeModalOpen, setIsMakeModalOpen] = useState(false);
  const [currentMake, setCurrentMake] = useState<MakeItem | null>(null);
  const [makeFormData, setMakeFormData] = useState({ name: 'LAPP', description: '' });

  // Category Make filter for Category Management tab (Default to LAPP; strictly 6 per make, no All-24 mixing)
  const [categoryMakeFilter, setCategoryMakeFilter] = useState<string>('LAPP');
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<string>('Power and Control Cables');
  const [selectedSubSeries, setSelectedSubSeries] = useState<string>('all');
  const selectedOlflexSeries = selectedSubSeries;
  const setSelectedOlflexSeries = setSelectedSubSeries;
  const [activeSubCategory, setActiveSubCategory] = useState<string>('All');

  // Hierarchy form state for Add / Edit Product modal (Make -> Category -> Subgroup -> Product)
  const [modalMake, setModalMake] = useState<string>('LAPP');
  const [modalCategory, setModalCategory] = useState<string>('');
  const [modalSubGroup, setModalSubGroup] = useState<string>('');

  // Backwards compat aliases
  const isBrandModalOpen = isMakeModalOpen;
  const setIsBrandModalOpen = setIsMakeModalOpen;
  const currentBrand = currentMake;
  const setCurrentBrand = setCurrentMake;
  const brandFormData = makeFormData;
  const setBrandFormData = setMakeFormData;

  // Current admin details & role permissions (Case-Insensitive check)
  const currentAdminStr = localStorage.getItem('siddhi_admin_user');
  const currentAdmin = currentAdminStr ? JSON.parse(currentAdminStr) : null;
  const rawRole = (currentAdmin?.role || '').toLowerCase().trim();
  const isSuperAdmin = rawRole.includes('super');
  const isAdmin = rawRole.includes('admin') || isSuperAdmin || !currentAdminStr;
  const isSalesManager = rawRole.includes('manager');

  useEffect(() => {
    const q = searchParams.get('search');
    if (q !== null) setSearchQuery(q);
  }, [searchParams]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/products`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
        setSelectedIds([]);
      }
    } catch (error) {
      console.error('Failed to fetch products', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/categories`);
      if (res.ok) {
        const raw = await res.json();
        if (Array.isArray(raw)) {
          const obsoleteList = ['solar cables', 'control cables', 'power cables', 'data & communication', 'cable accessories'];
          const cleaned = raw.filter((c: any) => {
            const name = (c.name || '').toLowerCase().trim();
            return name && !obsoleteList.includes(name);
          });
          setCategories(cleaned);
          return;
        }
      }
    } catch (error) {
      console.warn('Failed to fetch categories, using fallbacks', error);
    }
  };

  const fetchMakes = async () => {
    try {
      // 1. Try /api/makes first, then fallback to /api/brands if /api/makes 404s on deployed backend
      let res = await fetch(`${API_BASE_URL}/api/makes`);
      if (!res.ok) {
        res = await fetch(`${API_BASE_URL}/api/brands`);
      }
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const brandOrder = ['LAPP', 'Eaton', 'Partex', 'Mennekes'];
          const seen = new Set<string>();
          const deduped: MakeItem[] = [];

          for (const item of data) {
            const matchName = ALLOWED_MAKES.find(m => m.toLowerCase() === (item.name || '').toLowerCase().trim());
            if (matchName) {
              const k = matchName.toLowerCase();
              if (!seen.has(k)) {
                seen.add(k);
                deduped.push({
                  ...item,
                  name: matchName,
                  description: item.description || DEFAULT_MAKES.find(d => d.name === matchName)?.description || ''
                });
              }
            }
          }

          // Ensure all 4 approved makes exist
          for (const fallback of DEFAULT_MAKES) {
            if (!seen.has(fallback.name.toLowerCase())) {
              deduped.push(fallback);
              seen.add(fallback.name.toLowerCase());
            }
          }

          const sorted = deduped.sort((a, b) => {
            const idxA = brandOrder.indexOf(a.name as any);
            const idxB = brandOrder.indexOf(b.name as any);
            return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
          });
          setMakes(sorted);
          return;
        }
      }
    } catch (error) {
      console.warn('Failed to fetch makes, keeping defaults', error);
    }
    setMakes(DEFAULT_MAKES);
  };
  const fetchBrands = fetchMakes;

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchBrands();
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadResult(null);

    const formData = new FormData();
    formData.append('file', file);
    if (isPriceOnlyUpload) formData.append('mode', 'price_only');

    try {
      const importUrl = isPriceOnlyUpload 
        ? `${API_BASE_URL}/api/products/import?mode=price_only`
        : `${API_BASE_URL}/api/products/import`;

      const res = await fetch(importUrl, {
        method: 'POST',
        body: formData,
      });
      
      const data = await res.json();
      setUploadResult(data);
      
      if (res.ok) {
        fetchProducts();
      }
    } catch (error) {
      console.error('Upload failed', error);
      setUploadResult({ error: 'Failed to connect to the server' });
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  // Requirement 6.1: Product Excel Template Download
  const handleDownloadProductTemplate = () => {
    const templateRows = [
      {
        'Part Number': '1119003',
        'Description': 'ÖLFLEX® CLASSIC 110 3G1.5',
        'Make': 'LAPP',
        'Category': 'Control Cables',
        'Core': '3',
        'Cross Section': '1.5',
        'UOM': 'Meter',
        'List Price': 148.50,
        'Outer Diameter': '6.7 mm',
        'Weight': '75 kg/km',
        'Valid From': '2026-10-01',
        'Expiry Date': '2027-03-31'
      },
      {
        'Part Number': 'EATON-PKZM0-10',
        'Description': 'Eaton PKZM0-10 Motor Protective Circuit Breaker',
        'Make': 'Eaton',
        'Category': 'Motor Protection',
        'Core': '',
        'Cross Section': '',
        'UOM': 'Piece',
        'List Price': 2850.00,
        'Outer Diameter': '',
        'Weight': '0.35 kg',
        'Valid From': '2026-10-01',
        'Expiry Date': '2027-03-31'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateRows);
    ws['!cols'] = [
      { wch: 18 },
      { wch: 38 },
      { wch: 12 },
      { wch: 22 },
      { wch: 8 },
      { wch: 14 },
      { wch: 10 },
      { wch: 14 },
      { wch: 16 },
      { wch: 14 },
      { wch: 14 },
      { wch: 14 },
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'ProductMaster');
    XLSX.writeFile(wb, 'Product_Catalog_Template.xlsx');
  };

  // Category file upload handlers (Requirement 5.5 & 5.6)
  const handleUploadCategoryDatasheet = async (catId: string, file: File) => {
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('datasheet', file);
      const res = await fetch(`${API_BASE_URL}/api/categories/${catId}/datasheet`, {
        method: 'POST',
        headers: { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
        body: formData
      });
      if (res.ok) {
        alert('Category technical datasheet uploaded successfully!');
        fetchCategories();
      } else {
        alert('Failed to upload category datasheet.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUploadCategoryImage = async (catId: string, file: File) => {
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('image', file);
      const res = await fetch(`${API_BASE_URL}/api/categories/${catId}/image`, {
        method: 'POST',
        headers: { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
        body: formData
      });
      if (res.ok) {
        alert('Category image uploaded successfully!');
        fetchCategories();
      } else {
        alert('Failed to upload category image.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const openAddModal = () => {
    setCurrentProduct(null);
    setModalImage(null);
    setImageUrlInput('');
    setImageInputMode('upload');
    setModalDatasheet(null);
    setDatasheetUrlInput('');
    setDatasheetInputMode('upload');
    setModalCore('');
    setModalSqmm('');
    setModalUom('Meter');
    setModalColour('');
    setCustomColour('');
    setModalValidFrom('');
    setModalExpiryDate('');
    setModalMake('LAPP');
    setModalCategory('Power and Control Cables');
    setModalSubGroup('ÖLFLEX® Power & Control');
    setCoreSqmmError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (product: any) => {
    setCurrentProduct(product);
    setModalImage(product.imageUrl || null);
    setImageUrlInput(product.imageUrl || '');
    setImageInputMode('upload');
    setModalDatasheet(product.datasheetUrl || null);
    setDatasheetUrlInput(product.datasheetUrl || '');
    setDatasheetInputMode('upload');

    const initCore = product.core ? String(product.core).trim() : '';
    const initSqmm = product.sqmm ? String(product.sqmm).trim() : (product.coreSize ? String(product.coreSize).trim() : (product.size ? String(product.size) : ''));
    setModalCore(initCore);
    setModalSqmm(initSqmm);
    setModalUom(product.uom || product.packSize || 'Meter');
    setModalValidFrom(product.validFrom || '');
    setModalExpiryDate(product.expiryDate || '');

    const mMake = product.brand?.name || product.brandName || 'LAPP';
    const mCat = product.category?.name || product.categoryName || '';
    setModalMake(mMake);
    setModalCategory(mCat);
    setModalSubGroup(product.subGroup || product.subCategory || categorySubGroupMap[mCat.toLowerCase().trim()] || '');

    const existingColour = product.colour ? String(product.colour).trim() : '';
    const isStandardColour = COLOUR_OPTIONS.some(c => c.code.toLowerCase() === existingColour.toLowerCase());
    if (existingColour && !isStandardColour) {
      setModalColour('Other');
      setCustomColour(existingColour);
    } else {
      setModalColour(existingColour);
      setCustomColour('');
    }

    setCoreSqmmError(null);
    setIsModalOpen(true);
  };

  const handleCoreChange = (newCore: string) => {
    setModalCore(newCore);
    setCoreSqmmError(null);
    if (!newCore) {
      return;
    }
    const validOptions = getValidSqmmOptions(newCore);
    if (validOptions.length === 1) {
      // Exactly one valid SQMM - auto-select it immediately
      setModalSqmm(validOptions[0]);
    } else if (validOptions.length > 1 && modalSqmm && !validOptions.includes(modalSqmm)) {
      setModalSqmm(validOptions[0]);
    }
  };

  const handleSqmmChange = (newSqmm: string) => {
    setModalSqmm(newSqmm);
    if (modalCore && newSqmm) {
      const val = validateCoreSqmm(modalCore, newSqmm);
      setCoreSqmmError(val.valid ? null : (val.error || 'Invalid core/SQMM combination'));
    } else {
      setCoreSqmmError(null);
    }
  };

  // Image Upload Handlers
  const handleModalImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image file size should be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setModalImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Datasheet (PDF) Upload Handlers
  const handleModalDatasheetFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      alert('Please upload a valid PDF datasheet file');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      alert('Datasheet PDF size should be less than 15MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setModalDatasheet(event.target?.result as string);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/products/${id}`, { 
        method: 'DELETE',
        headers: { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) }
      });
      if (res.ok) fetchProducts();
    } catch (error) {
      console.error('Delete failed', error);
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(sortedProducts.map(p => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} products?`)) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/products/bulk-delete`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ ids: selectedIds })
      });
      if (res.ok) {
        setSelectedIds([]);
        fetchProducts();
      }
    } catch (error) {
      console.error('Bulk delete failed', error);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate combination on frontend before saving
    if (modalCore && modalSqmm) {
      const val = validateCoreSqmm(modalCore, modalSqmm);
      if (!val.valid) {
        setCoreSqmmError(val.error || 'Invalid combination of Core Size and SQMM');
        alert(val.error || 'Invalid combination of Core Size and SQMM');
        return;
      }
    }

    setIsSaving(true);
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const data: any = Object.fromEntries(formData.entries());

    data.imageUrl = modalImage || '';
    data.datasheetUrl = modalDatasheet || datasheetUrlInput || '';
    data.core = modalCore || null;
    data.sqmm = modalSqmm || null;
    data.coreSize = modalSqmm || null;
    data.uom = modalUom || 'Meter';
    data.colour = (modalColour === 'Other' && customColour.trim() ? customColour.trim() : modalColour) || null;
    data.validFrom = currentProduct?.validFrom || null;
    data.expiryDate = currentProduct?.expiryDate || null;
    data.brandName = modalMake || data.brandName || 'LAPP';
    data.categoryName = modalCategory || data.categoryName;
    data.subGroup = modalSubGroup || data.subGroup || categorySubGroupMap[(data.categoryName || '').toLowerCase().trim()] || null;

    try {
      const token = localStorage.getItem('token');
      const url = currentProduct ? `${API_BASE_URL}/api/products/${currentProduct.id}` : `${API_BASE_URL}/api/products`;
      const method = currentProduct ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        setIsModalOpen(false);
        setCurrentProduct(null);
        setModalImage(null);
        setModalDatasheet(null);
        setCoreSqmmError(null);
        fetchProducts();
      } else {
        const errData = await res.json().catch(() => ({}));
        const errMsg = errData.error || 'Failed to save product';
        setCoreSqmmError(errMsg);
        alert(errMsg);
      }
    } catch (error) {
      console.error('Save failed', error);
      alert('Failed to connect to the server');
    } finally {
      setIsSaving(false);
    }
  };

  // Category Save / Delete
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const url = currentCat ? `${API_BASE_URL}/api/categories/${currentCat._id}` : `${API_BASE_URL}/api/categories`;
      const method = currentCat ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(catFormData)
      });
      if (res.ok) {
        setIsCatModalOpen(false);
        setCurrentCat(null);
        setCatFormData({ name: '', description: '', make: 'LAPP', subGroup: '', imageUrl: '', datasheetUrl: '' });
        fetchCategories();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/categories/${id}`, {
        method: 'DELETE',
        headers: { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) }
      });
      if (res.ok) fetchCategories();
    } catch (err) {
      console.error(err);
    }
  };

  // Make (Manufacturer) Save / Delete
  const handleSaveMake = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const url = currentMake ? `${API_BASE_URL}/api/makes/${currentMake._id}` : `${API_BASE_URL}/api/makes`;
      const method = currentMake ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(makeFormData)
      });
      if (res.ok) {
        setIsMakeModalOpen(false);
        setCurrentMake(null);
        setMakeFormData({ name: 'LAPP', description: '' });
        fetchMakes();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to save make');
      }
    } catch (err) {
      console.error(err);
    }
  };
  const handleSaveBrand = handleSaveMake;

  const handleDeleteMake = async (id: string, name?: string) => {
    if (!window.confirm(`Delete make "${name || 'selected'}"? This is only allowed if no products are mapped to it.`)) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/makes/${id}`, {
        method: 'DELETE',
        headers: { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) }
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to delete make');
      } else {
        fetchMakes();
      }
    } catch (err) {
      console.error(err);
    }
  };
  const handleDeleteBrand = (id: string) => handleDeleteMake(id);

  // Count products per category
  const categoryCountMap = React.useMemo(() => {
    const map: Record<string, number> = {};
    products.forEach((p) => {
      const catName = p.category?.name || p.categoryName || '';
      const name = String(p.name || '');
      const isInfra = /infra|frls|hrfr|zhfr|building wire|house wire/i.test(name) || /infra|domestic|house|building|solar/i.test(catName);

      if (isInfra) {
        map['domestic / house wiring'] = (map['domestic / house wiring'] || 0) + 1;
      } else if (catName) {
        const key = catName.trim().toLowerCase();
        map[key] = (map[key] || 0) + 1;
      }
    });
    return map;
  }, [products]);

  // Dynamic 4-series product counts for each of the 6 LAPP Categories
  const effectiveCategory = activeTab === 'Products' ? activeCategory : selectedCategoryTab;
  const currentCategoryKey = getLappCategoryKey(effectiveCategory);
  const currentCategoryConfig = ((activeTab === 'Products' ? (activeBrand === 'All' || activeBrand.toLowerCase() === 'lapp') : (categoryMakeFilter.toLowerCase() === 'lapp')))
    ? LAPP_CATEGORY_CONFIGS[currentCategoryKey] 
    : null;

  const currentSubSeriesCounts = React.useMemo(() => {
    if (!currentCategoryConfig) return { all: 0 };
    const counts: Record<string, number> = { all: currentCategoryConfig.baselineTotal };
    currentCategoryConfig.series.forEach(s => {
      counts[s.title] = s.baselineCount;
    });

    const matchingCatProducts = products.filter(p => {
      const brand = (p.brand?.name || p.brandName || '').toLowerCase();
      const cat = (p.category?.name || p.categoryName || '').toLowerCase();
      const name = String(p.name || '').toLowerCase();
      const isLapp = brand.includes('lapp') || !brand;
      const key = getLappCategoryKey(cat, name);
      return isLapp && key === currentCategoryKey;
    });

    if (matchingCatProducts.length > 0) {
      currentCategoryConfig.series.forEach(s => {
        const c = matchingCatProducts.filter(p => s.pattern.test(String(p.name || '')) || s.pattern.test(String(p.subGroup || p.subCategory || ''))).length;
        if (c > 0) counts[s.title] = c;
      });
      counts.all = matchingCatProducts.length;
    }

    return counts;
  }, [currentCategoryConfig, currentCategoryKey, products]);
  const olflexCounts = currentSubSeriesCounts;

  // Canonical manufacturer make order and category priority (LAPP cables first)
  const canonicalMakeOrder = ['LAPP', 'Eaton', 'Mennekes', 'Partex'];

  const sortedCategories = React.useMemo(() => {
    const obsoleteList = ['solar cables', 'control cables', 'power cables', 'data & communication', 'cable accessories'];
    const activeCats = categories.filter(c => {
      const n = (c.name || '').toLowerCase().trim();
      return n && !obsoleteList.includes(n);
    });

    const seenCat = new Set<string>();
    const dedupedCats: CategoryItem[] = [];
    activeCats.forEach(c => {
      const k = `${(c.make || 'LAPP').toLowerCase().trim()}:${(c.name || '').toLowerCase().trim()}`;
      if (!seenCat.has(k)) {
        seenCat.add(k);
        dedupedCats.push(c);
      }
    });

    // Ensure all 24 official categories are always present
    OFFICIAL_24_CATEGORIES_METADATA.forEach((meta, idx) => {
      const k = `${meta.make.toLowerCase()}:${meta.name.toLowerCase()}`;
      if (!seenCat.has(k)) {
        seenCat.add(k);
        dedupedCats.push({
          _id: `official_cat_${idx}`,
          name: meta.name,
          make: meta.make,
          subGroup: meta.subGroup,
          description: meta.description
        });
      }
    });

    const officialOrderMap = new Map<string, number>();
    OFFICIAL_24_CATEGORIES_METADATA.forEach((c, i) => {
      officialOrderMap.set(`${c.make.toLowerCase()}:${c.name.toLowerCase()}`, i);
    });

    return dedupedCats.sort((a, b) => {
      const makeA = a.make || 'LAPP';
      const makeB = b.make || 'LAPP';
      const kA = `${makeA.toLowerCase()}:${(a.name || '').toLowerCase()}`;
      const kB = `${makeB.toLowerCase()}:${(b.name || '').toLowerCase()}`;
      const idxA = officialOrderMap.has(kA) ? officialOrderMap.get(kA)! : 999;
      const idxB = officialOrderMap.has(kB) ? officialOrderMap.get(kB)! : 999;
      if (idxA !== idxB) return idxA - idxB;
      return (a.name || '').localeCompare(b.name || '');
    });
  }, [categories]);

  const displayedCategories = React.useMemo(() => {
    return sortedCategories.filter(c => 
      (c.make || 'LAPP').toLowerCase() === categoryMakeFilter.toLowerCase() &&
      c.name?.toLowerCase().trim() !== 'solar cables'
    );
  }, [sortedCategories, categoryMakeFilter]);

  const categorySubGroupMap = React.useMemo(() => {
    const map: Record<string, string> = {
      'power and control cables': 'ÖLFLEX® Power & Control',
      'data communication cables': 'UNITRONIC® / ETHERLINE®',
      'control cabinet single cores': 'Single Core Panel Wires',
      'cable glands & counter nuts': 'SKINTOP® Cable Glands',
      'rill, conduit & klick': 'SILVYN® Protective Conduits',
      'domestic / house wiring': 'Building Wires / Single Cores',
      'switchgear & protection': 'Motor Starters, Contactors & Breakers',
      'motor protection breakers': 'PKZM0 Motor Breakers',
      'molded case circuit breakers': 'NZM Compact MCCBs',
      'miniature circuit breakers & rcds': 'FAZ DIN-Rail MCBs',
      'power contactors & relays': 'DILM Power Contactors',
      'power quality & ups': 'Capacitors & APFC Systems',
      'industrial plugs & sockets': 'Heavy Duty CEE Plugs & Sockets',
      'amaxx® & distribution enclosures': 'Modular Distribution Units',
      'panel mounted receptacle sockets': 'Watertight Receptacles',
      'chemical earthing electrodes': 'Maintenance-Free Chemical Electrodes',
      'copper clad earth rods & accessories': 'Earth Rods & Clamps',
      'earthing solutions': 'Chemical Electrodes & Earthing Accessories',
      'cable marking systems': 'PA Markers & ProMark Printers',
      'profile marking sleeves': 'PO/POZ Profile Sleeves',
      'stainless steel cable markers': 'PKS Embossed Steel Markers',
      'component & terminal block marking': 'Snap-On Terminal Markers',
      'industrial thermal printers & ribbons': 'ProMark T-1000 Printers',
      'industrial cable ties & fasteners': 'Polyamide & Steel Cable Ties',
    };
    categories.forEach(c => {
      if (c.name && c.subGroup) {
        map[c.name.toLowerCase().trim()] = c.subGroup;
      }
    });
    return map;
  }, [categories]);

  // Dynamic extraction and mapping of Level 3 Sub-categories / Series
  const getProductSubCategory = React.useCallback((p: any, categoryFallback?: string): string => {
    if (p.subGroup && typeof p.subGroup === 'string' && p.subGroup.trim()) {
      return p.subGroup.trim();
    }
    if (p.subCategory && typeof p.subCategory === 'string' && p.subCategory.trim()) {
      return p.subCategory.trim();
    }
    
    const name = String(p.name || '').trim();
    const cat = String(p.category?.name || p.categoryName || categoryFallback || '').trim();
    const catLower = cat.toLowerCase();

    // 1. LAPP Power and Control Cables / Cables
    if (catLower.includes('power') || catLower.includes('control cable') || /olflex|ölflex/i.test(name)) {
      if (/110\s*sy/i.test(name)) return 'ÖLFLEX® CLASSIC 110 SY';
      if (/110\s*cy/i.test(name)) return 'ÖLFLEX® CLASSIC 110 CY';
      if (/110\s*black/i.test(name)) return 'ÖLFLEX® CLASSIC 110 Black';
      if (/classic\s*110/i.test(name)) return 'ÖLFLEX® CLASSIC 110';
      if (/100\s*cy/i.test(name)) return 'ÖLFLEX® CLASSIC 100 CY';
      if (/classic\s*100\s*i/i.test(name) || /100i/i.test(name)) return 'ÖLFLEX® CLASSIC 100I';
      if (/classic\s*100/i.test(name)) return 'ÖLFLEX® CLASSIC 100';
      if (/400\s*p/i.test(name) || /400\s*cp/i.test(name)) return 'ÖLFLEX® 400 P / CP';
      if (/fd/i.test(name)) return 'ÖLFLEX® FD Continuous Flex';
      if (/heat/i.test(name)) return 'ÖLFLEX® HEAT High Temp';
      if (/smart\s*108/i.test(name)) return 'ÖLFLEX® SMART 108';
      if (/servo/i.test(name)) return 'ÖLFLEX® SERVO';
      return 'ÖLFLEX® Power & Control';
    }

    // 2. Control Cabinet Single Cores / Panel Wires
    if (catLower.includes('single core') || catLower.includes('panel wire') || /h07v-k|h05v-k/i.test(name)) {
      if (/h07v-k/i.test(name)) return 'H07V-K Panel Single Core';
      if (/h05v-k/i.test(name)) return 'H05V-K Hook-up Wire';
      if (/multinorm/i.test(name)) return 'ÖLFLEX® MULTINORM Single Core';
      return 'Single Core Panel Wires';
    }

    // 3. Data Communication Cables
    if (catLower.includes('data') || catLower.includes('communication') || /unitronic|etherline/i.test(name)) {
      if (/etherline/i.test(name)) return 'ETHERLINE® Industrial Ethernet';
      if (/liycy/i.test(name)) return 'UNITRONIC® LiYCY Screened';
      if (/liyy/i.test(name)) return 'UNITRONIC® LiYY Data';
      if (/bus|profibus|can/i.test(name)) return 'UNITRONIC® BUS System';
      if (/fd/i.test(name)) return 'UNITRONIC® FD Continuous Flex';
      return 'UNITRONIC® / ETHERLINE®';
    }

    // 4. Solar Cables
    if (catLower.includes('solar') || /solar|h1z2z2/i.test(name)) {
      return 'ÖLFLEX® SOLAR';
    }

    // 5. Cable Glands & Counter Nuts
    if (catLower.includes('gland') || catLower.includes('counter nut') || /skintop/i.test(name)) {
      if (/click/i.test(name)) return 'SKINTOP® CLICK Quick Mount';
      if (/ms-m|brass/i.test(name)) return 'SKINTOP® Nickel-Plated Brass';
      if (/st-m|polyamide/i.test(name)) return 'SKINTOP® Polyamide Glands';
      if (/gmp|locknut|counter/i.test(name)) return 'SKINTOP® Locknuts';
      return 'SKINTOP® Cable Glands';
    }

    // 6. Rill, Conduit & Klick
    if (catLower.includes('rill') || catLower.includes('conduit') || /silvyn/i.test(name)) {
      if (/conduit/i.test(name) || /rill/i.test(name)) return 'SILVYN® Flexible Conduits';
      if (/klick/i.test(name) || /gland/i.test(name)) return 'SILVYN® Conduit Connectors';
      return 'SILVYN® Protective Conduits';
    }

    // 7. Eaton Switchgear & Protection
    if (/pkzm0/i.test(name)) return 'PKZM0 Motor Breakers';
    if (/pkzm4/i.test(name)) return 'PKZM4 Motor Breakers';
    if (/nzm/i.test(name)) return 'NZM Compact MCCBs';
    if (/faz|pl/i.test(name)) return 'FAZ DIN-Rail MCBs';
    if (/dilm/i.test(name)) return 'DILM Power Contactors';
    if (/dilem/i.test(name)) return 'DILEM Mini Contactors';
    if (catLower.includes('switchgear') || catLower.includes('motor')) return 'Motor Starters & Breakers';

    // 8. Mennekes Plugs, Sockets & Earthing
    if (/mennekes/i.test(name)) return 'MENNEKES Industrial Plugs';
    if (/amaplast|cee/i.test(name)) return 'Industrial CEE Plugs & Sockets';
    if (/amaxx/i.test(name)) return 'Modular Distribution Units';
    if (/electrode/i.test(name)) return 'Maintenance-Free Chemical Electrodes';
    if (/rod/i.test(name)) return 'Copper Clad Earth Rods';

    // 9. Partex Marking Systems
    if (/promark|t-1000/i.test(name)) return 'ProMark Thermal Printers';
    if (/po|poz/i.test(name)) return 'PO/POZ Profile Sleeves';
    if (/pks/i.test(name)) return 'PKS Stainless Steel Markers';
    if (/pa\b/i.test(name)) return 'PA Closed Cable Markers';
    if (/tie/i.test(name)) return 'Polyamide & Steel Cable Ties';

    if (categorySubGroupMap[catLower]) {
      return categorySubGroupMap[catLower];
    }

    return cat || 'General Products';
  }, [categorySubGroupMap]);

  // Dynamic available Sub-categories based on active Brand and Category
  const availableSubCategories = React.useMemo(() => {
    const subMap = new Map<string, number>();
    const activeCatLower = activeCategory.toLowerCase().trim();
    const activeBrandLower = activeBrand.toLowerCase().trim();

    products.forEach((p) => {
      const pCat = (p.category?.name || p.categoryName || '').toLowerCase().trim();
      const pBrand = (p.brand?.name || p.brandName || '').toLowerCase().trim();

      const matchesBrand = activeBrand === 'All' || pBrand === activeBrandLower;
      const matchesCategory = 
        activeCategory === 'All' || 
        pCat === activeCatLower ||
        (activeCatLower === 'control cables' && pCat.includes('control')) ||
        (activeCatLower === 'power cables' && pCat.includes('power')) ||
        (activeCatLower === 'cable accessories' && (pCat.includes('gland') || pCat.includes('rill')));

      if (matchesBrand && matchesCategory) {
        const sub = getProductSubCategory(p, p.category?.name || p.categoryName);
        if (sub) {
          subMap.set(sub, (subMap.get(sub) || 0) + 1);
        }
      }
    });

    return Array.from(subMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [products, activeCategory, activeBrand, getProductSubCategory]);

  const filteredFormCategories = React.useMemo(() => {
    const targetMake = modalMake || 'LAPP';
    const list = sortedCategories.filter(c => (c.make || 'LAPP').toLowerCase() === targetMake.toLowerCase());
    return list.length > 0 ? list : sortedCategories;
  }, [sortedCategories, modalMake]);

  // Combined list of categories from backend /api/categories AND products in state (Cables prioritized)
  const dropdownCategories = React.useMemo(() => {
    const catMap = new Map<string, string>();
    sortedCategories.forEach((c) => {
      if (c.name && c.name.trim()) {
        catMap.set(c.name.trim().toLowerCase(), c.name.trim());
      }
    });
    products.forEach((p) => {
      const name = p.category?.name || p.categoryName;
      if (name && typeof name === 'string' && name.trim()) {
        const key = name.trim().toLowerCase();
        if (key !== 'solar cables' && !catMap.has(key)) {
          catMap.set(key, name.trim());
        }
      }
    });
    const list = Array.from(catMap.values());
    const orderIndexMap = new Map<string, number>();
    sortedCategories.forEach((c, idx) => {
      orderIndexMap.set((c.name || '').toLowerCase().trim(), idx);
    });
    return list.sort((a, b) => {
      const idxA = orderIndexMap.has(a.toLowerCase().trim()) ? orderIndexMap.get(a.toLowerCase().trim())! : 999;
      const idxB = orderIndexMap.has(b.toLowerCase().trim()) ? orderIndexMap.get(b.toLowerCase().trim())! : 999;
      if (idxA !== idxB) return idxA - idxB;
      return a.localeCompare(b);
    });
  }, [sortedCategories, products]);

  // Count products per make (strictly normalized to 4 approved makes)
  const makeCountMap = React.useMemo(() => {
    const map: Record<string, number> = {};
    ALLOWED_MAKES.forEach(m => { map[m.toLowerCase()] = 0; });
    products.forEach((p) => {
      const brandName = p.brand?.name || p.brandName || '';
      if (brandName) {
        const key = brandName.trim().toLowerCase();
        map[key] = (map[key] || 0) + 1;
      }
    });
    return map;
  }, [products]);
  const brandCountMap = makeCountMap;

  // Canonical list of Makes strictly restricted to the 4 approved manufacturers
  const dropdownMakes = ALLOWED_MAKES;
  const dropdownBrands = dropdownMakes as readonly string[];

  // Filter Products by Search, Category, Brand, and Sub-category (4-level hierarchy)
  const filteredProducts = React.useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return products.filter((p) => {
      const pName = String(p.name || '').toLowerCase();
      const pPartNo = String(p.partNo || '').toLowerCase();
      const pDesc = String(p.description || '').toLowerCase();
      const pBrand = String(p.brand?.name || p.brandName || p.make || '').toLowerCase().trim();
      const pCat = String(p.category?.name || p.categoryName || '').toLowerCase().trim();
      const pSub = String(p.subGroup || p.subCategory || '').toLowerCase().trim();
      const pCore = String(p.core || '').toLowerCase().trim();
      const pSqmm = String(p.sqmm || p.coreSize || p.size || '').toLowerCase().trim();

      const matchesSearch = 
        !q ||
        pName.includes(q) ||
        pPartNo.includes(q) ||
        pDesc.includes(q) ||
        pBrand.includes(q) ||
        pCat.includes(q) ||
        pSub.includes(q) ||
        pCore.includes(q) ||
        pSqmm.includes(q);

      const activeCatLower = activeCategory.toLowerCase().trim();
      const pCatLower = pCat.toLowerCase().trim();
      const isInfraProduct = /infra|frls|hrfr|zhfr|building wire|house wire/i.test(pName) || /infra|domestic|house|building|solar/i.test(pCatLower);

      let matchesCategory = false;
      if (activeCategory === 'All') {
        matchesCategory = true;
      } else if (activeCatLower === 'domestic / house wiring' || activeCatLower.includes('domestic') || activeCatLower.includes('house') || activeCatLower.includes('infra')) {
        matchesCategory = isInfraProduct || pCatLower.includes('domestic') || pCatLower.includes('house') || pCatLower.includes('infra');
      } else if (activeCatLower === 'control cabinet single cores' || activeCatLower.includes('single core')) {
        matchesCategory = !isInfraProduct && (pCatLower.includes('single core') || pCatLower.includes('cabinet') || pCatLower.includes('panel'));
      } else if (activeCatLower === 'control cables' || activeCatLower === 'power and control cables') {
        matchesCategory = !isInfraProduct && (pCatLower === activeCatLower || pCatLower.includes('control') || pCatLower.includes('power'));
      } else if (activeCatLower === 'power cables') {
        matchesCategory = !isInfraProduct && pCatLower.includes('power');
      } else if (activeCatLower === 'cable accessories') {
        matchesCategory = pCatLower.includes('gland') || pCatLower.includes('rill') || pCatLower.includes('accessory');
      } else {
        matchesCategory = pCatLower === activeCatLower;
      }

      const activeBrandLower = activeBrand.toLowerCase().trim();
      const matchesBrand =
        activeBrand === 'All' ||
        pBrand === activeBrandLower;

      let matchesSubSeries = true;
      if (currentCategoryConfig && selectedSubSeries !== 'all') {
        if (selectedSubSeries === 'Newly Added Products') {
          const matchesAnyStandard = currentCategoryConfig.series.some(s => 
            s.pattern.test(String(p.name || '')) || s.pattern.test(String(p.subGroup || p.subCategory || ''))
          );
          matchesSubSeries = !matchesAnyStandard;
        } else {
          const seriesOpt = currentCategoryConfig.series.find(s => s.title === selectedSubSeries || s.id === selectedSubSeries);
          if (seriesOpt) {
            matchesSubSeries = seriesOpt.pattern.test(pName) || seriesOpt.pattern.test(pSub);
          }
        }
      }

      return matchesSearch && matchesCategory && matchesBrand && matchesSubSeries;
    });
  }, [products, searchQuery, activeCategory, activeBrand, currentCategoryConfig, selectedSubSeries]);

  // Sort Products (Product Name and Part Number ascending/descending)
  const sortedProducts = React.useMemo(() => {
    if (!sortField) return filteredProducts;
    return [...filteredProducts].sort((a, b) => {
      const valA = String(a[sortField] || '').toLowerCase().trim();
      const valB = String(b[sortField] || '').toLowerCase().trim();
      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredProducts, sortField, sortDirection]);

  const handleSort = (field: 'name' | 'partNo') => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      {/* Top Header & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">Product & Catalog Management</h2>
          <p className="text-xs sm:text-sm text-slate-500">
            {isSalesManager 
              ? 'Catalog View Mode (Sales Manager View-Only Access)' 
              : 'Add, edit, bulk import products, technical specifications, and manufacturer datasheets.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button 
            onClick={() => { fetchProducts(); fetchCategories(); fetchBrands(); }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors font-medium text-xs"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>

          {isAdmin && activeTab === 'Products' && (
            <>
              <div className="relative">
                <input
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={uploading}
                />
                <button
                  disabled={uploading}
                  className={`flex items-center px-3 py-1.5 bg-emerald-50 text-emerald-700 font-semibold rounded-lg hover:bg-emerald-100 transition-colors border border-emerald-200 text-xs ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {uploading ? <div className="w-3.5 h-3.5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mr-1" /> : <FileSpreadsheet size={14} className="mr-1" />}
                  {uploading ? 'Importing...' : 'Import'}
                </button>
              </div>

              <button 
                onClick={openAddModal}
                className="flex items-center px-3.5 py-1.5 bg-gradient-to-r from-red-600 via-red-700 to-rose-700 hover:opacity-95 text-white font-bold rounded-lg transition-all shadow-md shadow-red-600/20 text-xs cursor-pointer"
              >
                <Plus size={14} className="mr-1" />
                Add Product
              </button>
            </>
          )}

          {isAdmin && activeTab === 'Categories' && (
            <button 
              onClick={() => { setCurrentCat(null); setCatFormData({ name: '', description: '', make: 'LAPP', subGroup: '', imageUrl: '', datasheetUrl: '' }); setIsCatModalOpen(true); }}
              className="flex items-center px-3.5 py-1.5 bg-gradient-to-r from-red-600 via-red-700 to-rose-700 hover:opacity-95 text-white font-bold rounded-lg transition-all shadow-md shadow-red-600/20 text-xs cursor-pointer"
            >
              <Plus size={14} className="mr-1" />
              Add Product Category
            </button>
          )}

          {isAdmin && (activeTab === 'Makes' || (activeTab as any) === 'Brands') && (
            <button 
              onClick={() => { setCurrentMake(null); setMakeFormData({ name: 'LAPP', description: '' }); setIsMakeModalOpen(true); }}
              className="flex items-center px-3.5 py-1.5 bg-gradient-to-r from-red-600 via-red-700 to-rose-700 hover:opacity-95 text-white font-bold rounded-lg transition-all shadow-md shadow-red-600/20 text-xs cursor-pointer"
            >
              <Plus size={14} className="mr-1" />
              Add Brand
            </button>
          )}
        </div>
      </div>

      {/* Main Feature Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto text-sm font-bold no-scrollbar">
        <button
          onClick={() => setActiveTab('Products')}
          className={`px-5 py-2.5 border-b-2 transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
            activeTab === 'Products' ? 'border-red-600 text-red-600 bg-red-50/50' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShoppingBag size={16} />
          Products Catalog ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('Categories')}
          className={`px-5 py-2.5 border-b-2 transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
            activeTab === 'Categories' ? 'border-red-600 text-red-600 bg-red-50/50' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers size={16} />
          Category Management ({sortedCategories.length})
        </button>
        <button
          onClick={() => setActiveTab('Makes')}
          className={`px-5 py-2.5 border-b-2 transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
            activeTab === 'Makes' ? 'border-red-600 text-red-600 bg-red-50/50' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building size={16} />
          Brand Management ({sortedMakes.length})
        </button>
      </div>

      {/* TAB 1: PRODUCTS CATALOG */}
      {activeTab === 'Products' && (
        <div className="space-y-3">
          {/* Search, Category & Brand Filter Controls */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={15} />
              <input 
                type="text" 
                placeholder="Search products by name, part no, category, or brand..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-1.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  title="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              {/* Category Filter */}
              <select
                value={activeCategory}
                onChange={(e) => {
                  setActiveCategory(e.target.value);
                  setSelectedCategoryTab(e.target.value);
                  setSelectedSubSeries('all');
                  setActiveSubCategory('All');
                }}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none font-semibold text-slate-700 cursor-pointer hover:border-slate-300"
                title="Filter by Category"
              >
                <option value="All">All Categories ({products.length})</option>
                {dropdownCategories.map((catName) => {
                  const count = categoryCountMap[catName.toLowerCase().trim()] || 0;
                  return (
                    <option key={catName} value={catName}>
                      {catName} {count > 0 ? `(${count})` : ''}
                    </option>
                  );
                })}
              </select>

              {/* Make Filter (4 Approved Manufacturers) */}
              <select
                value={activeBrand}
                onChange={(e) => {
                  setActiveBrand(e.target.value);
                  setSelectedSubSeries('all');
                  setActiveSubCategory('All');
                }}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none font-semibold text-slate-700 cursor-pointer hover:border-slate-300"
                title="Filter by Make (Manufacturer)"
              >
                <option value="All">All Makes ({products.length})</option>
                {dropdownMakes.map((makeName) => {
                  const count = makeCountMap[makeName.toLowerCase().trim()] || 0;
                  return (
                    <option key={makeName} value={makeName}>
                      {makeName} {count > 0 ? `(${count})` : ''}
                    </option>
                  );
                })}
              </select>

              {isAdmin && selectedIds.length > 0 && (
                <button
                  onClick={handleBulkDelete}
                  className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 size={13} /> Delete ({selectedIds.length})
                </button>
              )}
            </div>
          </div>

          {/* Category Quick Selector Pills in Products Catalog Tab */}
          <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Category / Group:</span>
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setActiveCategory('All');
                  setSelectedSubSeries('all');
                  setActiveSubCategory('All');
                }}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                  activeCategory === 'All'
                    ? 'bg-red-600 text-white border-red-600 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                }`}
              >
                All Categories ({products.length})
              </button>
              {(activeBrand === 'All' 
                ? sortedCategories.filter(c => (c.make || 'LAPP').toLowerCase() === 'lapp') 
                : sortedCategories.filter(c => (c.make || 'LAPP').toLowerCase() === activeBrand.toLowerCase())
              ).map((c) => {
                const isCatActive = activeCategory.toLowerCase() === c.name.toLowerCase();
                const count = categoryCountMap[c.name.toLowerCase().trim()] || 0;
                return (
                  <button
                    key={c._id || c.name}
                    type="button"
                    onClick={() => {
                      setActiveCategory(c.name);
                      setSelectedCategoryTab(c.name);
                      setSelectedSubSeries('all');
                      setActiveSubCategory('All');
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                      isCatActive
                        ? 'bg-red-600 text-white border-red-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <span>{c.name}</span>
                    {count > 0 && <span className="ml-1 opacity-80 text-[11px]">({count})</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Subseries 4-Pill Bar in Products Catalog Tab (Allows easy switching/changing between 4 series) */}
          {currentCategoryConfig && (
            <div className="bg-white border border-slate-200 rounded-2xl p-2.5 shadow-xs space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 px-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-amber-700 uppercase tracking-wider font-mono flex items-center gap-1">
                    <Zap size={14} className="text-amber-500 fill-amber-500" />
                    {currentCategoryConfig.brandTitle}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    · Select series to filter:
                  </span>
                </div>
                {selectedSubSeries !== 'all' && (
                  <button
                    type="button"
                    onClick={() => setSelectedSubSeries('all')}
                    className="text-xs font-bold text-slate-500 hover:text-slate-800 hover:underline flex items-center gap-1 cursor-pointer self-start sm:self-auto"
                  >
                    <span>Clear Filter (Show All {currentCategoryConfig.groupPrefix})</span>
                  </button>
                )}
              </div>

              {/* Exact Pill Bar matching screenshot */}
              <div className="flex overflow-x-auto hide-scrollbar bg-slate-100/70 p-1.5 rounded-2xl border border-slate-200 gap-1.5 items-center">
                <button
                  type="button"
                  onClick={() => setSelectedSubSeries('all')}
                  className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                    selectedSubSeries === 'all'
                      ? 'bg-amber-500 text-white shadow-sm ring-2 ring-amber-300 ring-offset-1 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                  }`}
                >
                  {currentCategoryConfig.allLabel} ({currentSubSeriesCounts.all || currentCategoryConfig.baselineTotal})
                </button>

                {currentCategoryConfig.series.map((series) => {
                  const isActive = selectedSubSeries === series.id || selectedSubSeries === series.title;
                  return (
                    <button
                      key={series.id}
                      type="button"
                      onClick={() => setSelectedSubSeries(series.title)}
                      className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-amber-500 text-white shadow-sm ring-2 ring-amber-300 ring-offset-1 font-bold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                      }`}
                    >
                      {series.title}
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() => setSelectedSubSeries('Newly Added Products')}
                  className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                    selectedSubSeries === 'Newly Added Products'
                      ? 'bg-amber-500 text-white shadow-sm ring-2 ring-amber-300 ring-offset-1 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                  }`}
                >
                  Newly Added Products
                </button>
              </div>

              {/* Series Description & Active Status Banner */}
              {selectedSubSeries !== 'all' && (
                <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-amber-50/80 border border-amber-200/80 rounded-xl text-xs text-amber-950">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-amber-900">{selectedSubSeries}:</span>
                    <span className="text-amber-800">
                      {currentCategoryConfig.series.find(s => s.title === selectedSubSeries)?.desc ||
                       (selectedSubSeries === 'Newly Added Products' ? `Custom / newly added ${currentCategoryConfig.groupPrefix} products` : 'Standard LAPP Industrial Configuration')}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 bg-amber-200/70 text-amber-900 font-bold rounded text-[11px]">
                    Showing {filteredProducts.length} Products
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Products Table Container */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm min-w-[950px]">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs">
                  <tr>
                    {isAdmin && (
                      <th className="py-2.5 px-3 w-10 text-center">
                        <input 
                          type="checkbox" 
                          checked={sortedProducts.length > 0 && selectedIds.length === sortedProducts.length}
                          onChange={handleSelectAll}
                          className="rounded border-slate-300 text-red-600 focus:ring-red-500 cursor-pointer w-3.5 h-3.5"
                        />
                      </th>
                    )}
                    <th className="py-2.5 px-3 font-semibold text-center w-14">S.No</th>
                    <th 
                      onClick={() => handleSort('partNo')}
                      className="py-2.5 px-3 font-semibold cursor-pointer hover:bg-slate-100 select-none group transition-colors"
                      title="Click to sort by Part Number (Ascending / Descending)"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Part Number</span>
                        {sortField === 'partNo' ? (
                          sortDirection === 'asc' ? <ArrowUp size={13} className="text-red-600" /> : <ArrowDown size={13} className="text-red-600" />
                        ) : (
                          <ArrowUpDown size={12} className="text-slate-400 group-hover:text-slate-600 opacity-60" />
                        )}
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSort('name')}
                      className="py-2.5 px-3 font-semibold cursor-pointer hover:bg-slate-100 select-none group transition-colors"
                      title="Click to sort by Description / Product Name (Ascending / Descending)"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Description</span>
                        {sortField === 'name' ? (
                          sortDirection === 'asc' ? <ArrowUp size={13} className="text-red-600" /> : <ArrowDown size={13} className="text-red-600" />
                        ) : (
                          <ArrowUpDown size={12} className="text-slate-400 group-hover:text-slate-600 opacity-60" />
                        )}
                      </div>
                    </th>
                    <th className="py-2.5 px-3 font-semibold text-center">Core</th>
                    <th className="py-2.5 px-3 font-semibold text-center">Cross Section</th>
                    <th className="py-2.5 px-3 font-semibold text-center">UOM</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Price (₹)</th>
                    <th className="py-2.5 px-3 font-semibold text-center">Weight</th>
                    <th className="py-2.5 px-3 font-semibold text-center">(OD)</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {loading ? (
                    <tr>
                      <td colSpan={isAdmin ? 11 : 10} className="px-4 py-12 text-center text-slate-500">
                        <RefreshCw className="w-6 h-6 text-red-600 animate-spin mx-auto mb-2" />
                        Loading products...
                      </td>
                    </tr>
                  ) : sortedProducts.length === 0 ? (
                    <tr>
                      <td colSpan={isAdmin ? 11 : 10} className="px-4 py-12 text-center text-slate-500">
                        <ShoppingBag size={24} className="mx-auto text-slate-300 mb-2" />
                        No products match your search or filter criteria.
                      </td>
                    </tr>
                  ) : (
                    sortedProducts.map((p, index) => (
                      <tr key={p.id} className="hover:bg-red-50/20 transition-colors">
                        {isAdmin && (
                          <td className="py-2.5 px-3 text-center">
                            <input 
                              type="checkbox" 
                              checked={selectedIds.includes(p.id)}
                              onChange={() => handleSelectOne(p.id)}
                              className="rounded border-slate-300 text-red-600 focus:ring-red-500 cursor-pointer w-3.5 h-3.5"
                            />
                          </td>
                        )}
                        {/* 1. sl nbr */}
                        <td className="py-2.5 px-3 text-center text-slate-500 font-bold text-xs">
                          {index + 1}
                        </td>

                        {/* 2. Part Number */}
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-800">
                          {p.partNo ? (
                            <span 
                              onClick={() => setViewProduct(p)}
                              className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200 hover:border-red-400 cursor-pointer"
                              title="Click to view details"
                            >
                              {p.partNo}
                            </span>
                          ) : '-'}
                        </td>

                        {/* 3. Description */}
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2.5">
                            <div className="h-8 w-8 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                              {p.imageUrl ? (
                                <img 
                                  src={p.imageUrl} 
                                  alt={p.name} 
                                  className="h-full w-full object-contain cursor-pointer"
                                  onClick={() => setViewingImage(p.imageUrl)} 
                                />
                              ) : (
                                <ShoppingBag size={15} className="text-slate-400" />
                              )}
                            </div>
                            <div>
                              <p 
                                onClick={() => setViewProduct(p)}
                                className="font-semibold text-slate-800 hover:text-red-700 line-clamp-1 cursor-pointer transition-colors max-w-xs"
                                title={p.description || p.name}
                              >
                                {p.description || p.name}
                              </p>
                              {p.description && p.name && p.description !== p.name && (
                                <p className="text-[11px] text-slate-400 line-clamp-1 max-w-xs">{p.name}</p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* 4. Core */}
                        <td className="py-2.5 px-3 font-mono font-medium text-slate-800 text-center">
                          {p.core ? (
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200 text-xs">
                              {p.core} Cores
                            </span>
                          ) : (
                            <span className="text-slate-400 font-normal">-</span>
                          )}
                        </td>

                        {/* 5. Cross Section */}
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-800 text-center">
                          {(p.sqmm || p.coreSize || p.size) ? (
                            <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 text-xs">
                              {p.sqmm || p.coreSize || p.size} SQ.MM
                            </span>
                          ) : (
                            <span className="text-slate-400 font-normal">-</span>
                          )}
                        </td>

                        {/* 6. UOM */}
                        <td className="py-2.5 px-3 font-semibold text-slate-700 text-center">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 uppercase">
                            {formatUom(p.uom || p.packSize || 'm')}
                          </span>
                        </td>

                        {/* 7. Price (₹) */}
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-900 text-right">
                          {p.price ? `₹${Number(p.price).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : <span className="text-slate-400 font-normal">Quote</span>}
                        </td>

                        {/* 8. Weight */}
                        <td className="py-2.5 px-3 font-mono text-slate-700 text-center text-xs">
                          {formatWeight(p.weight, p.name)}
                        </td>

                        {/* 9. (OD) */}
                        <td className="py-2.5 px-3 font-mono text-slate-700 text-center text-xs">
                          {formatOD(p.outerDiameter, p.name)}
                        </td>

                        {/* Actions */}
                        <td className="py-2.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button 
                              onClick={() => setViewProduct(p)}
                              className="p-1.5 text-slate-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer" 
                              title="View Full Product Information"
                            >
                              <Eye size={15} />
                            </button>
                            {isAdmin && (
                              <>
                                <button 
                                  onClick={() => openEditModal(p)}
                                  className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer" 
                                  title="Edit Product"
                                >
                                  <Edit2 size={15} />
                                </button>
                                <button 
                                  onClick={() => handleDelete(p.id)}
                                  className="p-1.5 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer" 
                                  title="Delete Product"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CATEGORY MANAGEMENT */}
      {activeTab === 'Categories' && (
        <div className="space-y-3">
          {/* Make Filter Pills & Header */}
          <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Filter by Make:</span>
                <div className="flex flex-wrap items-center gap-1.5">
                  {ALLOWED_MAKES.map((m) => {
                    const count = sortedCategories.filter(c => (c.make || 'LAPP').toLowerCase() === m.toLowerCase()).length;
                    const isActive = categoryMakeFilter === m;
                    return (
                      <button
                        key={m}
                        onClick={() => {
                          setCategoryMakeFilter(m);
                          const firstCat = sortedCategories.find(c => (c.make || 'LAPP').toLowerCase() === m.toLowerCase());
                          if (firstCat) setSelectedCategoryTab(firstCat.name);
                        }}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                          isActive
                            ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                        }`}
                      >
                        {m} ({count})
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="text-xs text-slate-500 font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Showing {displayedCategories.length} categories · 6 Authorized Categories for {categoryMakeFilter}
              </div>
            </div>

            {/* Category Selector Pills */}
            <div className="pt-2.5 border-t border-slate-100 flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Category / Group:</span>
              <div className="flex flex-wrap items-center gap-1.5">
                {displayedCategories.map((c) => {
                  const isCatActive = selectedCategoryTab.toLowerCase() === c.name.toLowerCase();
                  return (
                    <button
                      key={c._id || c.name}
                      type="button"
                      onClick={() => {
                        setSelectedCategoryTab(c.name);
                        setSelectedSubSeries('all');
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                        isCatActive
                          ? 'bg-red-600 text-white border-red-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                      }`}
                    >
                      {c.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 4-SERIES PILL BAR FOR ALL LAPP CATEGORIES (Matching exact user screenshot) */}
          {categoryMakeFilter.toLowerCase() === 'lapp' && currentCategoryConfig && (
            <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-xs space-y-2.5 animate-in fade-in slide-in-from-top-1 duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 px-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold text-amber-700 uppercase tracking-wider font-mono flex items-center gap-1">
                    <Zap size={14} className="text-amber-500 fill-amber-500" />
                    {currentCategoryConfig.brandTitle}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    · 4 Authorized German Series (LAPP Stuttgart)
                  </span>
                </div>
                {selectedSubSeries !== 'all' && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveBrand('LAPP');
                      setActiveCategory(selectedCategoryTab);
                      setActiveSubCategory('All');
                      setSearchQuery('');
                      setActiveTab('Products');
                    }}
                    className="text-xs font-bold text-amber-700 hover:text-amber-900 hover:underline flex items-center gap-1 cursor-pointer self-start sm:self-auto"
                  >
                    <span>View {selectedSubSeries} in Products Catalog</span>
                    <ChevronRight size={13} />
                  </button>
                )}
              </div>

              {/* Exact Pill Bar from User Screenshot */}
              <div className="flex overflow-x-auto hide-scrollbar bg-slate-100/70 p-1.5 rounded-2xl border border-slate-200 gap-1.5 items-center">
                <button
                  type="button"
                  onClick={() => setSelectedSubSeries('all')}
                  className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                    selectedSubSeries === 'all'
                      ? 'bg-amber-500 text-white shadow-sm ring-2 ring-amber-300 ring-offset-1 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                  }`}
                >
                  {currentCategoryConfig.allLabel} ({currentSubSeriesCounts.all || currentCategoryConfig.baselineTotal})
                </button>

                {currentCategoryConfig.series.map((series) => {
                  const isActive = selectedSubSeries === series.id || selectedSubSeries === series.title;
                  return (
                    <button
                      key={series.id}
                      type="button"
                      onClick={() => setSelectedSubSeries(series.title)}
                      className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-amber-500 text-white shadow-sm ring-2 ring-amber-300 ring-offset-1 font-bold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                      }`}
                    >
                      {series.title}
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() => setSelectedSubSeries('Newly Added Products')}
                  className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                    selectedSubSeries === 'Newly Added Products'
                      ? 'bg-amber-500 text-white shadow-sm ring-2 ring-amber-300 ring-offset-1 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                  }`}
                >
                  Newly Added Products
                </button>
              </div>

              {/* Series Description & Direct Catalog Link */}
              {selectedSubSeries !== 'all' && (
                <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-amber-50/80 border border-amber-200/80 rounded-xl text-xs text-amber-950">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-amber-900">{selectedSubSeries}:</span>
                    <span className="text-amber-800">
                      {currentCategoryConfig.series.find(s => s.title === selectedSubSeries)?.desc ||
                       (selectedSubSeries === 'Newly Added Products' ? `Custom / newly added ${currentCategoryConfig.groupPrefix} products` : 'Standard LAPP Industrial Configuration')}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveBrand('LAPP');
                      setActiveCategory(selectedCategoryTab);
                      setActiveSubCategory('All');
                      setSearchQuery('');
                      setActiveTab('Products');
                    }}
                    className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
                  >
                    <span>Open in Products Catalog</span>
                    <ChevronRight size={12} />
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm min-w-[750px]">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs">
                  <tr>
                    <th className="py-3 px-6 font-semibold">Make</th>
                    <th className="py-3 px-6 font-semibold">Product Category / Group</th>
                    <th className="py-3 px-6 font-semibold">Subgroup</th>
                    <th className="py-3 px-6 font-semibold">Description</th>
                    <th className="py-3 px-6 font-semibold">Category Datasheet (PDF)</th>
                    {isAdmin && <th className="py-3 px-6 font-semibold text-right">Action</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {displayedCategories.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500">No categories found.</td>
                    </tr>
                  ) : (
                    displayedCategories.map((c) => {
                      const makeName = c.make || 'LAPP';
                      const makeBadgeTheme = 
                        makeName === 'LAPP' ? 'bg-red-50 text-red-700 border-red-200' :
                        makeName === 'Eaton' ? 'bg-sky-50 text-sky-700 border-sky-200' :
                        (makeName === 'Mennekes' || makeName === 'Minak') ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        'bg-purple-50 text-purple-700 border-purple-200';
                      const isSelectedRow = selectedCategoryTab.toLowerCase() === c.name.toLowerCase();
                      const rowCatKey = getLappCategoryKey(c.name);
                      const rowConfig = makeName.toLowerCase() === 'lapp' ? LAPP_CATEGORY_CONFIGS[rowCatKey] : null;

                      return (
                        <tr 
                          key={c._id} 
                          onClick={() => {
                            setSelectedCategoryTab(c.name);
                            setSelectedSubSeries('all');
                          }}
                          className={`transition-colors cursor-pointer ${
                            isSelectedRow
                              ? 'bg-amber-50/60 border-l-4 border-l-amber-500' 
                              : 'hover:bg-slate-50'
                          }`}
                        >
                          <td className="py-3 px-6">
                            <span className={`px-2.5 py-0.5 rounded font-extrabold text-xs border ${makeBadgeTheme}`}>
                              {makeName}
                            </span>
                          </td>
                          <td className="py-3 px-6">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedCategoryTab(c.name);
                                  setSelectedSubSeries('all');
                                }}
                                className="text-left font-bold text-slate-900 hover:text-amber-600 hover:underline flex items-center gap-1.5 cursor-pointer group"
                                title={`Select ${c.name} category`}
                              >
                                <span>{c.name}</span>
                                {rowConfig && (
                                  <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-300">
                                    4 {rowConfig.groupPrefix} Series
                                  </span>
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveBrand(makeName);
                                  setActiveCategory(c.name);
                                  setSelectedCategoryTab(c.name);
                                  setActiveSubCategory('All');
                                  setSearchQuery('');
                                  if (selectedCategoryTab.toLowerCase() !== c.name.toLowerCase()) {
                                    setSelectedSubSeries('all');
                                  }
                                  setActiveTab('Products');
                                }}
                                className="text-[11px] font-semibold text-slate-400 hover:text-red-600 flex items-center gap-0.5 transition-colors cursor-pointer ml-1"
                                title={`View products in catalog`}
                              >
                                <span>Catalog</span>
                                <ChevronRight size={11} />
                              </button>
                            </div>
                          </td>
                          <td className="py-3 px-6 text-slate-600 font-medium">
                            {c.subGroup ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveBrand(makeName);
                                  setActiveCategory(c.name);
                                  setActiveSubCategory(c.subGroup || 'All');
                                  setActiveTab('Products');
                                }}
                                className="text-left text-slate-700 hover:text-red-600 hover:underline cursor-pointer font-medium flex items-center gap-1 group"
                                title={`Filter products by sub-category: ${c.subGroup}`}
                              >
                                <span>{c.subGroup}</span>
                                <ChevronRight size={12} className="text-slate-300 group-hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all" />
                              </button>
                            ) : (
                              '-'
                            )}
                          </td>
                          <td className="py-3 px-6 text-slate-500">{c.description || 'Standard Category'}</td>
                          <td className="py-3 px-6">
                            {c.datasheetUrl ? (
                              <div className="flex items-center gap-2">
                                <a
                                  href={c.datasheetUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-md font-bold text-xs"
                                >
                                  <FileText size={12} /> View PDF
                                </a>
                                {isAdmin && (
                                  <label className="text-[11px] text-slate-500 hover:text-slate-800 cursor-pointer underline">
                                    Replace
                                    <input
                                      type="file"
                                      accept="application/pdf"
                                      className="hidden"
                                      onChange={(e) => {
                                        const f = e.target.files?.[0];
                                        if (f) handleUploadCategoryDatasheet(c._id, f);
                                      }}
                                    />
                                  </label>
                                )}
                              </div>
                            ) : isAdmin ? (
                              <label className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-md font-semibold text-xs cursor-pointer">
                                <Upload size={12} /> Upload PDF
                                <input
                                  type="file"
                                  accept="application/pdf"
                                  className="hidden"
                                  onChange={(e) => {
                                    const f = e.target.files?.[0];
                                    if (f) handleUploadCategoryDatasheet(c._id, f);
                                  }}
                                />
                              </label>
                            ) : (
                              <span className="text-slate-400 italic">No Datasheet</span>
                            )}
                          </td>
                          {isAdmin && (
                            <td className="py-3 px-6 text-right">
                              <button
                                onClick={() => {
                                  setCurrentCat(c);
                                  setCatFormData({
                                    name: c.name,
                                    description: c.description || '',
                                    make: c.make || 'LAPP',
                                    subGroup: c.subGroup || '',
                                    imageUrl: c.imageUrl || '',
                                    datasheetUrl: c.datasheetUrl || ''
                                  });
                                  setIsCatModalOpen(true);
                                }}
                                className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded mr-1 cursor-pointer"
                                title="Edit Category"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteCategory(c._id)}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded cursor-pointer"
                                title="Delete Category"
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          )}
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: BRAND MANAGEMENT (4 Approved Manufacturers) */}
      {(activeTab === 'Makes' || (activeTab as any) === 'Brands') && (
        <div className="space-y-3">
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm min-w-[700px]">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs">
                  <tr>
                    <th className="py-3 px-6 font-semibold">Brand / Manufacturer</th>
                    <th className="py-3 px-6 font-semibold">Description & Scope</th>
                    <th className="py-3 px-6 font-semibold text-center">Brand Categories</th>
                    <th className="py-3 px-6 font-semibold text-center">Mapped Products</th>
                    {isAdmin && <th className="py-3 px-6 font-semibold text-right">Action</th>}
                  </tr>
                </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {sortedMakes.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500">No authorized brands found.</td>
                  </tr>
                ) : (
                  sortedMakes.map((m) => {
                    const catCount = sortedCategories.filter(c => (c.make || '').toLowerCase() === m.name.toLowerCase()).length || 6;
                    const prodCount = makeCountMap[m.name.toLowerCase()] ?? m.productCount ?? 0;
                    
                    const makeBadgeTheme = 
                      m.name === 'LAPP' ? 'bg-red-50 text-red-700 border-red-200' :
                      m.name === 'Eaton' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      m.name === 'Partex' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      'bg-emerald-50 text-emerald-700 border-emerald-200';

                    return (
                      <tr key={m._id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-6">
                          <div className="flex items-center gap-2">
                            <span className={`px-2.5 py-1 rounded-md font-extrabold text-xs tracking-wide border shadow-2xs ${makeBadgeTheme}`}>
                              {m.name}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-6 text-slate-600 font-medium">
                          {m.description || 'Authorized Client Manufacturer'}
                        </td>
                        <td className="py-3 px-6 text-center">
                          <button
                            type="button"
                            onClick={() => {
                              setCategoryMakeFilter(m.name);
                              setActiveTab('Categories');
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-slate-100 hover:bg-red-50 hover:text-red-700 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
                            title={`View categories assigned to ${m.name}`}
                          >
                            <Layers size={13} className="text-red-600" />
                            {catCount} Categories
                          </button>
                        </td>
                        <td className="py-3 px-6 text-center">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveBrand(m.name);
                              setActiveCategory('All');
                              setActiveSubCategory('All');
                              setActiveTab('Products');
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition-colors cursor-pointer"
                            title={`View ${prodCount} products mapped to ${m.name}`}
                          >
                            <ShoppingBag size={13} className="text-red-600" />
                            {prodCount} Products
                          </button>
                        </td>
                        {isAdmin && (
                          <td className="py-3 px-6 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => { 
                                  setCurrentMake(m); 
                                  setMakeFormData({ name: m.name, description: m.description || '' }); 
                                  setIsMakeModalOpen(true); 
                                }}
                                className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded cursor-pointer"
                                title="Edit Make details"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteMake(m._id, m.name)}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded cursor-pointer"
                                title={`Delete ${m.name} (only if 0 products mapped)`}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )}

      {/* PRODUCT ADD / EDIT MODAL - PORTAL-MOUNTED, FULLY RESPONSIVE */}
      {isModalOpen && createPortal(
        <div 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-[99999] p-2 sm:p-4 md:p-6 overflow-hidden"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsModalOpen(false);
          }}
        >
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[94vh] sm:max-h-[90vh] flex flex-col border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150">
            
            {/* Header - Permanently Pinned at Top with Close (X) */}
            <div className="flex justify-between items-center px-4 sm:px-6 py-3.5 border-b border-slate-200 bg-slate-50 shrink-0 z-10">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">{currentProduct ? 'Edit Product' : 'Add New Product'}</h3>
                <p className="text-xs text-slate-500">Configure catalog details, image, and technical PDF datasheet.</p>
              </div>
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)} 
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-200/80 hover:bg-red-50 hover:text-red-600 text-slate-700 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                title="Close"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSaveProduct} className="flex flex-col flex-1 overflow-hidden">
              <div className="overflow-y-auto p-4 sm:p-6 space-y-4 flex-1 custom-scrollbar">
                
                {/* 1. Image Upload Section */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <ImageIcon size={14} className="text-red-600" /> Product Image
                    </label>
                    <div className="flex gap-1 text-xs">
                      <button
                        type="button"
                        onClick={() => setImageInputMode('upload')}
                        className={`px-2 py-0.5 rounded font-medium ${imageInputMode === 'upload' ? 'bg-white shadow text-slate-800' : 'text-slate-500'}`}
                      >
                        Upload
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageInputMode('url')}
                        className={`px-2 py-0.5 rounded font-medium ${imageInputMode === 'url' ? 'bg-white shadow text-slate-800' : 'text-slate-500'}`}
                      >
                        URL
                      </button>
                    </div>
                  </div>

                  {modalImage ? (
                    <div className="flex items-center gap-3 bg-white p-2.5 rounded-lg border border-slate-200">
                      <img src={modalImage} alt="Preview" className="w-14 h-14 object-contain rounded bg-slate-50" />
                      <div className="flex-1 text-xs">
                        <p className="font-semibold text-slate-800">Image Attached</p>
                        <button
                          type="button"
                          onClick={() => setModalImage(null)}
                          className="text-red-500 hover:text-red-700 font-semibold mt-1 cursor-pointer"
                        >
                          Remove Image
                        </button>
                      </div>
                    </div>
                  ) : imageInputMode === 'upload' ? (
                    <label className="flex flex-col items-center justify-center p-3.5 border-2 border-dashed border-slate-300 hover:border-red-500 rounded-lg bg-white cursor-pointer transition-colors text-center">
                      <Upload size={18} className="text-slate-400 mb-1" />
                      <span className="text-xs font-semibold text-slate-700">Upload Product Image (PNG, JPG, WEBP)</span>
                      <input type="file" accept="image/*" onChange={handleModalImageFileChange} className="hidden" />
                    </label>
                  ) : (
                    <input 
                      type="url" 
                      placeholder="https://example.com/cable.jpg" 
                      value={imageUrlInput}
                      onChange={(e) => { setImageUrlInput(e.target.value); setModalImage(e.target.value); }}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs"
                    />
                  )}
                </div>

                {/* 2. Technical Datasheet Section (Phase 1 Requirement) */}
                <div className="bg-red-50/50 p-3.5 rounded-xl border border-red-100">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <FileText size={14} className="text-red-500" /> Technical Datasheet (PDF)
                    </label>
                    <div className="flex gap-1 text-xs">
                      <button
                        type="button"
                        onClick={() => setDatasheetInputMode('upload')}
                        className={`px-2 py-0.5 rounded font-medium ${datasheetInputMode === 'upload' ? 'bg-white shadow text-slate-800' : 'text-slate-500'}`}
                      >
                        Upload PDF
                      </button>
                      <button
                        type="button"
                        onClick={() => setDatasheetInputMode('url')}
                        className={`px-2 py-0.5 rounded font-medium ${datasheetInputMode === 'url' ? 'bg-white shadow text-slate-800' : 'text-slate-500'}`}
                      >
                        PDF Link
                      </button>
                    </div>
                  </div>

                  {modalDatasheet ? (
                    <div className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-red-200">
                      <div className="flex items-center gap-2">
                        <FileText size={18} className="text-red-600" />
                        <div>
                          <p className="text-xs font-bold text-slate-800">Datasheet PDF Attached</p>
                          <p className="text-[10px] text-emerald-600 font-semibold">Ready for customer downloads</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => { setModalDatasheet(null); setDatasheetUrlInput(''); }}
                        className="text-xs font-bold text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  ) : datasheetInputMode === 'upload' ? (
                    <label className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-red-200 hover:border-red-400 rounded-lg bg-white cursor-pointer transition-colors text-center">
                      <Upload size={18} className="text-red-400 mb-1" />
                      <span className="text-xs font-semibold text-slate-700">Upload Technical Datasheet (.pdf)</span>
                      <span className="text-[10px] text-slate-400">Official manufacturer specification sheet</span>
                      <input type="file" accept="application/pdf" onChange={handleModalDatasheetFileChange} className="hidden" />
                    </label>
                  ) : (
                    <input 
                      type="url" 
                      placeholder="https://example.com/datasheet.pdf" 
                      value={datasheetUrlInput}
                      onChange={(e) => { setDatasheetUrlInput(e.target.value); setModalDatasheet(e.target.value); }}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs"
                    />
                  )}
                </div>

                {/* 3. Product Info Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* Hierarchy Step 1: Make (Manufacturer) */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      1. Make (Manufacturer) *
                    </label>
                    <select 
                      name="brandName" 
                      value={modalMake}
                      onChange={(e) => {
                        const newMake = e.target.value;
                        setModalMake(newMake);
                        const matchCats = sortedCategories.filter(c => (c.make || 'LAPP').toLowerCase() === newMake.toLowerCase());
                        if (matchCats.length > 0) {
                          setModalCategory(matchCats[0].name);
                          setModalSubGroup(matchCats[0].subGroup || '');
                        }
                      }}
                      required
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white" 
                    >
                      {ALLOWED_MAKES.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>

                  {/* Hierarchy Step 2: Product Category */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      2. Product Category / Group *
                    </label>
                    <select 
                      name="categoryName" 
                      value={modalCategory}
                      onChange={(e) => {
                        const newCat = e.target.value;
                        setModalCategory(newCat);
                        const found = sortedCategories.find(c => c.name.toLowerCase().trim() === newCat.toLowerCase().trim());
                        if (found && found.subGroup) {
                          setModalSubGroup(found.subGroup);
                        }
                      }}
                      required 
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white"
                    >
                      <option value="">Select Category...</option>
                      {filteredFormCategories.map((c) => (
                        <option key={c.name} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Hierarchy Step 3: Sub-category / Subgroup */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      3. Sub-category / Series
                    </label>
                    <input 
                      type="text"
                      name="subGroup"
                      value={modalSubGroup}
                      onChange={(e) => setModalSubGroup(e.target.value)}
                      placeholder="e.g. ÖLFLEX® Power & Control or Series"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-slate-50/50" 
                    />
                  </div>

                  {/* Hierarchy Step 4: Final Product Name */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">4. Product Name *</label>
                    <input 
                      type="text" 
                      name="name" 
                      defaultValue={currentProduct?.name || ''} 
                      required 
                      placeholder="e.g. ÖLFLEX® CLASSIC 110 3G1.5"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500" 
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Part Number</label>
                    <input 
                      type="text" 
                      name="partNo" 
                      defaultValue={currentProduct?.partNo || ''} 
                      placeholder="e.g. 1119003"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500" 
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">List Price (₹) *</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      name="price" 
                      defaultValue={currentProduct?.price || ''} 
                      placeholder="e.g. 150.00"
                      required
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500" 
                    />
                  </div>

                  {/* Core Size & Automatic SQMM Mapping */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Core Size (Number of Cores)
                    </label>
                    <select
                      value={modalCore}
                      onChange={(e) => handleCoreChange(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white font-medium"
                    >
                      <option value="">Select Core Size (or N/A)...</option>
                      {AVAILABLE_CORES.map((c) => (
                        <option key={c} value={c}>
                          {c === '0' ? '0 / Accessories (Glands, Conduits)' : `${c} Core${c !== '1' ? 's' : ''}`}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-semibold text-slate-700">
                        SQMM (Conductor Cross Section)
                      </label>
                      {modalCore && getValidSqmmOptions(modalCore).length === 1 && (
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                          Auto-Selected
                        </span>
                      )}
                    </div>
                    {(() => {
                      const coreOpts = modalCore ? getValidSqmmOptions(modalCore) : [];
                      const opts = coreOpts.length > 0 ? coreOpts : [
                        "0.14", "0.25", "0.34", "0.5", "0.75", "1", "1.5", "2", "2.5", "4", "6", 
                        "10", "16", "25", "35", "50", "70", "95", "120", "150", "185", "240"
                      ];
                      const isPredefined = opts.includes(modalSqmm) || !modalSqmm;

                      return (
                        <div className="space-y-1.5">
                          <select
                            value={isPredefined ? modalSqmm : 'Other'}
                            onChange={(e) => {
                              if (e.target.value === 'Other') {
                                if (isPredefined) setModalSqmm('');
                              } else {
                                handleSqmmChange(e.target.value);
                              }
                            }}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white font-mono font-medium"
                          >
                            <option value="">
                              {modalCore ? `Select valid SQMM for ${modalCore} Cores...` : 'Select SQMM Cross Section...'}
                            </option>
                            {opts.map((sq) => (
                              <option key={sq} value={sq}>
                                {sq} mm² (SQ.MM)
                              </option>
                            ))}
                            <option value="Other">Other / Type Custom SQMM...</option>
                          </select>

                          {(!isPredefined || modalSqmm === 'Other') && (
                            <input
                              type="text"
                              value={modalSqmm === 'Other' ? '' : modalSqmm}
                              onChange={(e) => handleSqmmChange(e.target.value)}
                              placeholder="Type custom SQMM (e.g. 1.5, 2.5, 120 SQ.MM)..."
                              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-mono outline-none focus:ring-2 focus:ring-red-500"
                            />
                          )}
                        </div>
                      );
                    })()}
                    {coreSqmmError && (
                      <p className="text-[11px] text-red-600 font-semibold mt-1 flex items-center gap-1">
                        <AlertCircle size={12} className="shrink-0" />
                        {coreSqmmError}
                      </p>
                    )}
                  </div>

                  {/* Colour Selection with Visual Swatch */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Cable Colour
                    </label>
                    <div className="flex items-center gap-2">
                      <select
                        value={modalColour}
                        onChange={(e) => setModalColour(e.target.value)}
                        className="flex-1 px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white font-medium"
                      >
                        <option value="">Select Colour (or Unspecified)...</option>
                        {COLOUR_OPTIONS.map((col) => (
                          <option key={col.code} value={col.code}>
                            {col.label}
                          </option>
                        ))}
                      </select>
                      {modalColour && (
                        <div className="shrink-0">
                          <ColourSwatch colour={modalColour === 'Other' && customColour ? customColour : modalColour} size="md" showLabel={false} />
                        </div>
                      )}
                    </div>
                    {modalColour === 'Other' && (
                      <input
                        type="text"
                        placeholder="Type custom colour name (e.g. Orange, White/Blue)..."
                        value={customColour}
                        onChange={(e) => setCustomColour(e.target.value)}
                        className="mt-2 w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-red-500"
                      />
                    )}
                  </div>

                  {/* UOM Dropdown */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      UOM *
                    </label>
                    <select
                      value={modalUom}
                      onChange={(e) => setModalUom(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white font-medium"
                    >
                      <optgroup label="Length Units">
                        <option value="Meter">Metre (m)</option>
                        <option value="mm">Millimetre (mm)</option>
                        <option value="cm">Centimetre (cm)</option>
                        <option value="ft">Foot (ft)</option>
                        <option value="in">Inch (in)</option>
                      </optgroup>
                      <optgroup label="Packaging / Bulk Units">
                        <option value="Coil">Coil (100m bundle)</option>
                        <option value="Drum">Drum (Bulk spool)</option>
                        <option value="Pack">Pack / Box</option>
                        <option value="Roll">Roll</option>
                      </optgroup>
                      <optgroup label="Piece / Unit">
                        <option value="Piece">Piece (pc)</option>
                        <option value="Set">Set</option>
                      </optgroup>
                      <optgroup label="Area">
                        <option value="sqmm">Square millimetre (sqmm)</option>
                      </optgroup>
                    </select>
                    {modalUom === 'sqmm' && (
                      <p className="text-[10px] text-amber-600 mt-1 font-medium">
                        Notice: 'sqmm' is normally for conductor cross-section. Cable orders are usually billed per 'Meter', 'Coil', or 'Piece'.
                      </p>
                    )}
                  </div>



                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">GST (%)</label>
                    <input 
                      type="number" 
                      step="1" 
                      name="gst" 
                      defaultValue={currentProduct?.gst || 18} 
                      placeholder="18"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500" 
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Outer Diameter (OD)</label>
                    <input 
                      type="text" 
                      name="outerDiameter" 
                      defaultValue={currentProduct?.outerDiameter || ''} 
                      placeholder="e.g. 6.3 mm"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500" 
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Weight / Specs</label>
                    <input 
                      type="text" 
                      name="weight" 
                      defaultValue={currentProduct?.weight || ''} 
                      placeholder="e.g. 75 kg/km"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500" 
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">Description / Application Notes</label>
                    <textarea 
                      name="description" 
                      rows={2}
                      defaultValue={currentProduct?.description || currentProduct?.application || ''} 
                      placeholder="Technical application, specifications, standards..."
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500" 
                    />
                  </div>
                </div>
              </div>

              {/* Footer - Permanently Pinned at Bottom */}
              <div className="flex items-center justify-end gap-2.5 px-4 sm:px-6 py-3 bg-slate-50 border-t border-slate-200 shrink-0 z-10">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="px-4 py-2 text-slate-600 hover:bg-slate-200/60 font-semibold rounded-xl text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="px-5 py-2 bg-gradient-to-r from-red-600 via-red-700 to-rose-700 hover:opacity-95 active:scale-98 text-white font-bold rounded-xl text-xs shadow-md shadow-red-600/20 transition-all cursor-pointer disabled:opacity-60"
                >
                  {isSaving ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* 4. Complete Product Information View Modal (Requirement 9) - Portal-Mounted */}
      {viewProduct && createPortal(
        <div 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-[99999] p-2 sm:p-4 md:p-6 overflow-hidden"
          onClick={(e) => {
            if (e.target === e.currentTarget) setViewProduct(null);
          }}
        >
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[94vh] sm:max-h-[90vh] flex flex-col border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header - Permanently Pinned at Top with Close (X) */}
            <div className="flex justify-between items-center px-4 sm:px-6 py-3.5 border-b border-slate-200 bg-slate-50 shrink-0 z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-red-100 text-red-700 flex items-center justify-center shrink-0">
                  <ShoppingBag size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Product Specification Details</h3>
                  <p className="text-xs text-slate-500">Complete catalog information, images, and datasheet</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setViewProduct(null)} 
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-200/80 hover:bg-red-50 hover:text-red-600 text-slate-700 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                title="Close"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-xs custom-scrollbar flex-1">
              <div className="flex flex-col sm:flex-row gap-5 items-start">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-slate-50 border border-slate-200 p-2 flex items-center justify-center shrink-0 mx-auto sm:mx-0">
                  {viewProduct.imageUrl ? (
                    <img src={viewProduct.imageUrl} alt={viewProduct.name} className="w-full h-full object-contain cursor-pointer" onClick={() => setViewingImage(viewProduct.imageUrl)} />
                  ) : (
                    <ShoppingBag size={36} className="text-slate-300" />
                  )}
                </div>
                <div className="flex-1 space-y-1.5 w-full text-center sm:text-left">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-800 border border-red-200">
                      {viewProduct.category?.name || viewProduct.categoryName || 'Catalog Item'}
                    </span>
                    {viewProduct.brand?.name && (
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                        {viewProduct.brand.name}
                      </span>
                    )}
                    {viewProduct.partNo && (
                      <span className="font-mono text-slate-500 text-xs">
                        Part #{viewProduct.partNo}
                      </span>
                    )}
                  </div>
                  <h4 className="text-base font-bold text-slate-900 leading-snug">{viewProduct.name}</h4>
                  <p className="text-slate-500 leading-relaxed text-xs">
                    {viewProduct.description || viewProduct.application || 'Standard catalog certified industrial specification.'}
                  </p>
                </div>
              </div>

              {/* 4-Level Hierarchy Flow: Make -> Product Category -> Sub-category -> Final Product */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between font-mono">
                  <div className="flex items-center gap-1.5">
                    <Layers size={13} className="text-red-600" />
                    Product Hierarchy Flow (Make → Category → Sub-category → Final Product)
                  </div>
                  <span className="text-[10px] text-slate-400 font-normal lowercase italic hidden sm:inline">
                    (click any level to filter catalog)
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
                  {/* Step 1: Make */}
                  <button
                    type="button"
                    onClick={() => {
                      const makeVal = viewProduct.brand?.name || viewProduct.brandName || 'LAPP';
                      setActiveBrand(makeVal);
                      setActiveCategory('All');
                      setActiveSubCategory('All');
                      setViewProduct(null);
                      setActiveTab('Products');
                    }}
                    className="px-2.5 py-1 bg-red-100 hover:bg-red-200 text-red-900 rounded-md font-bold text-[11px] border border-red-300 transition-all cursor-pointer hover:shadow-2xs flex items-center gap-1 group"
                    title={`Filter catalog by Make: ${viewProduct.brand?.name || viewProduct.brandName || 'LAPP'}`}
                  >
                    <span>Make: {viewProduct.brand?.name || viewProduct.brandName || 'LAPP'}</span>
                  </button>

                  <ChevronRight size={13} className="text-slate-400 shrink-0" />

                  {/* Step 2: Category */}
                  <button
                    type="button"
                    onClick={() => {
                      const makeVal = viewProduct.brand?.name || viewProduct.brandName || 'LAPP';
                      const catVal = viewProduct.categoryName || viewProduct.category?.name || 'Power and Control Cables';
                      setActiveBrand(makeVal);
                      setActiveCategory(catVal);
                      setActiveSubCategory('All');
                      setViewProduct(null);
                      setActiveTab('Products');
                    }}
                    className="px-2.5 py-1 bg-sky-100 hover:bg-sky-200 text-sky-900 rounded-md font-bold text-[11px] border border-sky-300 transition-all cursor-pointer hover:shadow-2xs flex items-center gap-1 group"
                    title={`Filter catalog by Category: ${viewProduct.categoryName || viewProduct.category?.name || 'Power and Control Cables'}`}
                  >
                    <span>Category: {viewProduct.categoryName || viewProduct.category?.name || 'Power and Control Cables'}</span>
                  </button>

                  <ChevronRight size={13} className="text-slate-400 shrink-0" />

                  {/* Step 3: Sub-category */}
                  {(() => {
                    const catVal = viewProduct.categoryName || viewProduct.category?.name || 'Power and Control Cables';
                    const subVal = getProductSubCategory(viewProduct, catVal);
                    return (
                      <span
                        className="px-2.5 py-1 bg-amber-100 text-amber-900 rounded-md font-bold text-[11px] border border-amber-300"
                        title={`Sub-category: ${subVal}`}
                      >
                        Sub-category: {subVal}
                      </span>
                    );
                  })()}

                  <ChevronRight size={13} className="text-slate-400 shrink-0" />

                  {/* Step 4: Final Product */}
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-900 rounded-md font-bold text-[11px] border border-emerald-300 truncate max-w-[200px]" title={viewProduct.name}>
                    Product: {viewProduct.name}
                  </span>
                </div>
              </div>

              {/* Specs Side-by-Side Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Left Column: Commercial & Core Specs */}
                <div className="space-y-2 border border-slate-200 rounded-xl p-3.5 bg-slate-50/50">
                  <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                    <span className="font-semibold text-slate-500">Part Number</span>
                    <span className="font-mono font-bold text-slate-900">{viewProduct.partNo || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                    <span className="font-semibold text-slate-500">List Price</span>
                    <span className="font-mono font-bold text-red-700">
                      {viewProduct.price ? `₹${Number(viewProduct.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : 'On Request'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                    <span className="font-semibold text-slate-500">UOM</span>
                    <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 font-semibold text-slate-800 uppercase">
                      {formatUom(viewProduct.uom || viewProduct.packSize || 'm')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                    <span className="font-semibold text-slate-500">Core</span>
                    <span className="font-mono font-medium text-slate-800">
                      {viewProduct.core ? `${viewProduct.core} Cores` : '-'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="font-semibold text-slate-500">Cross Section</span>
                    <span className="font-mono font-bold text-slate-900 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                      {(viewProduct.sqmm || viewProduct.coreSize || viewProduct.size) ? `${viewProduct.sqmm || viewProduct.coreSize || viewProduct.size} SQ.MM` : '-'}
                    </span>
                  </div>
                </div>

                {/* Right Column: Physical & Technical Specs */}
                <div className="space-y-2 border border-slate-200 rounded-xl p-3.5 bg-slate-50/50">
                  <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                    <span className="font-semibold text-slate-500">Outer Diameter (OD)</span>
                    <span className="font-mono font-semibold text-slate-800">
                      {viewProduct.outerDiameter ? formatOD(viewProduct.outerDiameter, viewProduct.name) : '-'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                    <span className="font-semibold text-slate-500">Weight</span>
                    <span className="font-mono font-semibold text-slate-800">
                      {viewProduct.weight ? formatWeight(viewProduct.weight, viewProduct.name) : '-'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                    <span className="font-semibold text-slate-500">Colour</span>
                    <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                      {viewProduct.colour ? (
                        <>
                          <ColourSwatch colour={viewProduct.colour} size="sm" />
                          <span>{viewProduct.colour}</span>
                        </>
                      ) : 'Standard'}
                    </span>
                  </div>
                  {viewProduct.copperIndex && (
                    <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                      <span className="font-semibold text-slate-500">Copper Index</span>
                      <span className="font-mono text-slate-800">{viewProduct.copperIndex} kg/km</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center py-1">
                    <span className="font-semibold text-slate-500">Datasheet</span>
                    {viewProduct.datasheetUrl ? (
                      <a href={viewProduct.datasheetUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-md font-bold text-xs cursor-pointer">
                        <FileText size={12} /> View PDF
                      </a>
                    ) : (
                      <span className="text-slate-400 italic">None</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions - Permanently Pinned at Bottom */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-slate-50 border-t border-slate-200 shrink-0 z-10">
              <button 
                type="button" 
                onClick={() => setViewProduct(null)} 
                className="px-4 py-2 text-slate-600 hover:bg-slate-200/60 font-semibold rounded-xl text-xs cursor-pointer"
              >
                Close
              </button>
              {isAdmin && (
                <button 
                  type="button" 
                  onClick={() => { const prod = viewProduct; setViewProduct(null); openEditModal(prod); }}
                  className="px-4 py-2 bg-gradient-to-r from-red-600 via-red-700 to-rose-700 hover:opacity-95 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-red-600/20 cursor-pointer"
                >
                  <Edit2 size={13} /> Edit Product Information
                </button>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* CATEGORY MODAL - Portal-Mounted */}
      {isCatModalOpen && createPortal(
        <div 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-[99999] p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsCatModalOpen(false);
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150 border border-slate-200">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-800">{currentCat ? 'Edit Category' : 'Add New Category'}</h3>
              <button onClick={() => setIsCatModalOpen(false)} className="w-8 h-8 rounded-lg bg-slate-200/80 hover:bg-slate-300 flex items-center justify-center text-slate-600 cursor-pointer">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveCategory} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Make (Manufacturer) *</label>
                <select
                  value={catFormData.make}
                  onChange={(e) => setCatFormData({ ...catFormData, make: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-red-500 bg-white"
                >
                  {ALLOWED_MAKES.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Product Category / Group Name *</label>
                <input 
                  type="text" 
                  required 
                  value={catFormData.name} 
                  onChange={(e) => setCatFormData({ ...catFormData, name: e.target.value })} 
                  placeholder="e.g. ÖLFLEX® Control Cables, Miniature Contactors"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Subgroup (Optional)</label>
                <input 
                  type="text" 
                  value={catFormData.subGroup} 
                  onChange={(e) => setCatFormData({ ...catFormData, subGroup: e.target.value })} 
                  placeholder="e.g. Screened, Flexible, PVC / PUR"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <input 
                  type="text" 
                  value={catFormData.description} 
                  onChange={(e) => setCatFormData({ ...catFormData, description: e.target.value })} 
                  placeholder="Category description / application overview"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setIsCatModalOpen(false)} className="px-4 py-2 text-slate-600 font-semibold rounded-lg cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-gradient-to-r from-red-600 via-red-700 to-rose-700 text-white font-bold rounded-lg shadow-sm hover:opacity-95 cursor-pointer">Save Category</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* MAKE MODAL - Portal-Mounted */}
      {isMakeModalOpen && createPortal(
        <div 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-[99999] p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsMakeModalOpen(false);
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150 border border-slate-200">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2">
                <Building size={18} className="text-red-600" />
                <h3 className="font-bold text-slate-800">
                  {currentMake ? 'Edit Brand / Manufacturer' : 'Add Brand / Manufacturer'}
                </h3>
              </div>
              <button 
                onClick={() => setIsMakeModalOpen(false)} 
                className="w-8 h-8 rounded-lg bg-slate-200/80 hover:bg-slate-300 flex items-center justify-center text-slate-600 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveMake} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Brand / Manufacturer *</label>
                <select 
                  required 
                  value={makeFormData.name} 
                  onChange={(e) => setMakeFormData({ ...makeFormData, name: e.target.value })} 
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white font-medium text-slate-800"
                >
                  {ALLOWED_MAKES.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  Only client-approved manufacturers: LAPP, Eaton, Partex, Mennekes.
                </p>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description & Scope</label>
                <textarea 
                  rows={3}
                  value={makeFormData.description} 
                  onChange={(e) => setMakeFormData({ ...makeFormData, description: e.target.value })} 
                  placeholder="e.g. Authorized Global Manufacturer of Industrial Automation & Cable Systems"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setIsMakeModalOpen(false)} 
                  className="px-4 py-2 text-slate-600 font-semibold rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-gradient-to-r from-red-600 via-red-700 to-rose-700 text-white font-bold rounded-lg shadow-sm hover:opacity-95 cursor-pointer"
                >
                  Save Brand
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* IMAGE VIEWER MODAL - Portal-Mounted */}
      {viewingImage && createPortal(
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[99999] p-4" onClick={() => setViewingImage(null)}>
          <div className="relative max-w-2xl max-h-[90vh] flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => setViewingImage(null)} 
              className="absolute -top-12 right-0 text-white hover:text-red-400 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
              title="Close Image"
            >
              <X size={24} />
            </button>
            <img src={viewingImage} alt="Product" className="max-w-full max-h-[80vh] object-contain rounded-2xl bg-white/5 border border-white/10 shadow-2xl" />
          </div>
        </div>,
        document.body
      )}

    </div>
  );
};
