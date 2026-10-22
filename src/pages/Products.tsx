import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  Search, Filter, RotateCcw, ArrowUpDown, ChevronLeft, ChevronRight, 
  ShoppingBag, ShieldCheck, Zap, SlidersHorizontal, X, Check, FileText
} from 'lucide-react';
import { API_BASE_URL } from '../config/api';
import { AVAILABLE_CORES, COLOUR_OPTIONS, UOM_OPTIONS } from '../config/cableSpecs';
import { ColourSwatch } from '../components/ui/ColourSwatch';
import { RFQModal } from '../components/ui/RFQModal';
import { useCart } from '../context/CartContext';

type SortOption = 'name-asc' | 'name-desc' | 'category' | 'core-asc' | 'core-desc' | 'sqmm-asc' | 'sqmm-desc' | 'price-asc' | 'price-desc';

export const Products: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get('category') || 'All');
  const [selectedBrand, setSelectedBrand] = useState<string>(searchParams.get('brand') || 'All');
  const [selectedCore, setSelectedCore] = useState<string>(searchParams.get('core') || 'All');
  const [selectedSqmm, setSelectedSqmm] = useState<string>(searchParams.get('sqmm') || 'All');
  const [selectedColour, setSelectedColour] = useState<string>(searchParams.get('colour') || 'All');
  const [selectedUom, setSelectedUom] = useState<string>(searchParams.get('uom') || 'All');

  // Sorting State
  const [sortBy, setSortBy] = useState<SortOption>('name-asc');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 24;

  // Mobile Filter Drawer State
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // RFQ Modal State
  const [rfqModalOpen, setRfqModalOpen] = useState(false);
  const [rfqProduct, setRfqProduct] = useState<{ name: string; price: number } | null>(null);

  const { addToCart } = useCart();

  // Fetch Products and Categories from Backend
  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`${API_BASE_URL}/api/products`).then(r => r.json()).catch(() => []),
      fetch(`${API_BASE_URL}/api/categories`).then(r => r.json()).catch(() => [])
    ]).then(([prodsData, catsData]) => {
      setProducts(prodsData || []);
      setCategories(catsData || []);
      setLoading(false);
    });
  }, []);

  // Update URL Query params when main filters change
  useEffect(() => {
    const params: Record<string, string> = {};
    if (searchQuery.trim()) params.q = searchQuery.trim();
    if (selectedCategory !== 'All') params.category = selectedCategory;
    if (selectedBrand !== 'All') params.brand = selectedBrand;
    if (selectedCore !== 'All') params.core = selectedCore;
    if (selectedSqmm !== 'All') params.sqmm = selectedSqmm;
    if (selectedColour !== 'All') params.colour = selectedColour;
    if (selectedUom !== 'All') params.uom = selectedUom;
    setSearchParams(params, { replace: true });
    // Reset to page 1 whenever filters change
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedBrand, selectedCore, selectedSqmm, selectedColour, selectedUom, sortBy]);

  // Normalization Helpers to eliminate duplicate filter options
  const normalizeMake = (brandStr: string | null | undefined): string => {
    if (!brandStr) return '';
    const s = brandStr.toLowerCase();
    if (s.includes('lapp') || s.includes('olflex') || s.includes('unitronic') || s.includes('skintop') || s.includes('silvyn') || s.includes('epic') || s.includes('hitronic')) return 'LAPP';
    if (s.includes('eaton') || s.includes('moeller')) return 'Eaton';
    if (s.includes('partex')) return 'Partex';
    if (s.includes('mennekes') || s.includes('minak')) return 'Mennekes';
    return brandStr.trim();
  };

  const normalizeSqmm = (val: any): string => {
    if (val === null || val === undefined) return '';
    const str = String(val).replace(/,/g, '.').replace(/mm²|sqmm|sq\.?\s*mm/gi, '').trim();
    const num = parseFloat(str);
    if (isNaN(num)) return str;
    return num.toString();
  };

  const normalizeCore = (val: any): string => {
    if (val === null || val === undefined) return '';
    const str = String(val).replace(/cores?/gi, '').trim();
    const num = parseInt(str, 10);
    if (isNaN(num)) return str;
    return num.toString();
  };

  // Extract dynamically available options from the catalog (strictly deduplicated)
  const availableBrands = useMemo(() => {
    const brandsSet = new Set<string>();
    const ALLOWED_MAKES = ['LAPP', 'Eaton', 'Partex', 'Mennekes'];
    
    // Add official 4 makes first if present in catalogue or by default
    products.forEach(p => {
      const raw = p.brand?.name || p.brandName || (typeof p.brand === 'string' ? p.brand : null);
      const normalized = normalizeMake(raw);
      if (normalized) brandsSet.add(normalized);
    });

    // Ensure all 4 authorized makes are present if catalog uses them
    ALLOWED_MAKES.forEach(m => {
      if (products.some(p => normalizeMake(p.brand?.name || p.brandName || p.brand) === m)) {
        brandsSet.add(m);
      }
    });

    return Array.from(brandsSet).sort();
  }, [products]);

  const availableCores = useMemo(() => {
    const coresSet = new Set<string>();
    products.forEach(p => {
      if (p.core !== undefined && p.core !== null) {
        const raw = String(p.core).trim();
        if (raw && raw !== '-' && raw !== 'N/A' && raw !== 'null') {
          const norm = normalizeCore(raw);
          if (norm && norm !== 'NaN') coresSet.add(norm);
        }
      }
    });
    return Array.from(coresSet).sort((a, b) => {
      const numA = parseInt(a, 10);
      const numB = parseInt(b, 10);
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      return a.localeCompare(b);
    });
  }, [products]);

  // Strictly deduplicated categories with Cables ordered first (Requirement 1 & 12)
  const availableCategories = useMemo(() => {
    const catMap = new Map<string, string>();
    categories.forEach((c: any) => {
      const name = c.name?.trim();
      if (name && !catMap.has(name.toLowerCase())) {
        catMap.set(name.toLowerCase(), name);
      }
    });
    products.forEach((p: any) => {
      const name = (p.categoryName || p.category?.name)?.trim();
      if (name && !catMap.has(name.toLowerCase())) {
        catMap.set(name.toLowerCase(), name);
      }
    });
    const list = Array.from(catMap.values());
    const getCatOrder = (catStr: string) => {
      const s = catStr.toLowerCase();
      if (s.includes('power') && s.includes('control')) return 1;
      if (s.includes('data') || s.includes('communication') || s.includes('unitronic') || s.includes('etherline')) return 2;
      if (s.includes('cabinet') || s.includes('single core') || s.includes('panel wire')) return 3;
      if (s.includes('gland') || s.includes('locknut') || s.includes('skintop')) return 4;
      if (s.includes('rill') || s.includes('conduit') || s.includes('klick') || s.includes('silvyn')) return 5;
      if (s.includes('domestic') || s.includes('house') || s.includes('building') || s.includes('solar')) return 6;
      return 99;
    };
    return list.sort((a, b) => {
      const orderA = getCatOrder(a);
      const orderB = getCatOrder(b);
      if (orderA !== orderB) return orderA - orderB;
      return a.localeCompare(b);
    });
  }, [categories, products]);

  const availableSqmms = useMemo(() => {
    const sqmmSet = new Set<string>();
    products.forEach(p => {
      const raw = p.sqmm || p.coreSize || (p.size ? String(p.size) : null);
      if (raw !== null && raw !== undefined && String(raw).trim() !== '') {
        const norm = normalizeSqmm(raw);
        if (norm && !isNaN(parseFloat(norm))) sqmmSet.add(norm);
      }
    });
    return Array.from(sqmmSet).sort((a, b) => (parseFloat(a) || 0) - (parseFloat(b) || 0));
  }, [products]);

  const availableColours = useMemo(() => {
    const colSet = new Set<string>();
    products.forEach(p => {
      if (p.colour) colSet.add(String(p.colour).trim());
    });
    return Array.from(colSet).sort();
  }, [products]);

  const availableUoms = useMemo(() => {
    const uomSet = new Set<string>();
    products.forEach(p => {
      if (p.uom) uomSet.add(String(p.uom).trim());
    });
    return Array.from(uomSet).sort();
  }, [products]);

  // Combined Filtering
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // 1. Text Search across all fields
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const nameMatch = p.name?.toLowerCase().includes(q);
        const partMatch = p.partNo?.toLowerCase().includes(q);
        const descMatch = p.description?.toLowerCase().includes(q);
        const catMatch = (p.categoryName || p.category?.name)?.toLowerCase().includes(q);
        const rawBrand = p.brand?.name || p.brandName || (typeof p.brand === 'string' ? p.brand : '');
        const brandMatch = rawBrand.toLowerCase().includes(q) || normalizeMake(rawBrand).toLowerCase().includes(q);
        const coreMatch = p.core ? String(p.core).toLowerCase().includes(q) : false;
        const sqmmMatch = (p.sqmm || p.coreSize || p.size) ? String(p.sqmm || p.coreSize || p.size).toLowerCase().includes(q) : false;
        if (!nameMatch && !partMatch && !descMatch && !catMatch && !brandMatch && !coreMatch && !sqmmMatch) return false;
      }

      // 2. Category Filter
      if (selectedCategory !== 'All') {
        const catName = p.categoryName || p.category?.name || '';
        if (catName.toLowerCase().trim() !== selectedCategory.toLowerCase().trim()) return false;
      }

      // 3. Make / Brand Filter (Normalized to 4 authorized makes)
      if (selectedBrand !== 'All') {
        const rawBrand = p.brand?.name || p.brandName || (typeof p.brand === 'string' ? p.brand : '');
        const pBrand = normalizeMake(rawBrand);
        if (pBrand.toLowerCase() !== selectedBrand.toLowerCase()) return false;
      }

      // 4. Core Size Filter (Normalized)
      if (selectedCore !== 'All') {
        const pCore = normalizeCore(p.core);
        if (pCore !== selectedCore) return false;
      }

      // 5. SQMM Filter (Normalized to eliminate duplicates)
      if (selectedSqmm !== 'All') {
        const pSqmm = normalizeSqmm(p.sqmm || p.coreSize || (p.size ? String(p.size) : ''));
        if (pSqmm !== selectedSqmm) return false;
      }

      // 6. Colour Filter
      if (selectedColour !== 'All') {
        if (String(p.colour || '').toLowerCase().trim() !== selectedColour.toLowerCase().trim()) return false;
      }

      // 7. UOM Filter
      if (selectedUom !== 'All') {
        const pUom = p.uom || 'Meter';
        if (pUom.toLowerCase().trim() !== selectedUom.toLowerCase().trim()) return false;
      }

      return true;
    });
  }, [products, searchQuery, selectedCategory, selectedBrand, selectedCore, selectedSqmm, selectedColour, selectedUom]);

  // Sorting Logic (Numeric specifications sorted numerically!)
  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts];
    list.sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return (a.name || '').localeCompare(b.name || '');
        case 'name-desc':
          return (b.name || '').localeCompare(a.name || '');
        case 'category': {
          const catA = a.categoryName || a.category?.name || '';
          const catB = b.categoryName || b.category?.name || '';
          return catA.localeCompare(catB);
        }
        case 'core-asc': {
          const cA = parseFloat(a.core) || 0;
          const cB = parseFloat(b.core) || 0;
          return cA - cB;
        }
        case 'core-desc': {
          const cA = parseFloat(a.core) || 0;
          const cB = parseFloat(b.core) || 0;
          return cB - cA;
        }
        case 'sqmm-asc': {
          const sA = parseFloat(a.sqmm || a.coreSize || a.size) || 0;
          const sB = parseFloat(b.sqmm || b.coreSize || b.size) || 0;
          return sA - sB;
        }
        case 'sqmm-desc': {
          const sA = parseFloat(a.sqmm || a.coreSize || a.size) || 0;
          const sB = parseFloat(b.sqmm || b.coreSize || b.size) || 0;
          return sB - sA;
        }
        case 'price-asc': {
          const pA = a.price || 0;
          const pB = b.price || 0;
          return pA - pB;
        }
        case 'price-desc': {
          const pA = a.price || 0;
          const pB = b.price || 0;
          return pB - pA;
        }
        default:
          return 0;
      }
    });
    return list;
  }, [filteredProducts, sortBy]);

  // Pagination Slice
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedProducts.slice(start, start + itemsPerPage);
  }, [sortedProducts, currentPage]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (searchQuery.trim()) count++;
    if (selectedCategory !== 'All') count++;
    if (selectedBrand !== 'All') count++;
    if (selectedCore !== 'All') count++;
    if (selectedSqmm !== 'All') count++;
    if (selectedColour !== 'All') count++;
    if (selectedUom !== 'All') count++;
    return count;
  }, [searchQuery, selectedCategory, selectedBrand, selectedCore, selectedSqmm, selectedColour, selectedUom]);

  const resetAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedBrand('All');
    setSelectedCore('All');
    setSelectedSqmm('All');
    setSelectedColour('All');
    setSelectedUom('All');
    setSortBy('name-asc');
    setCurrentPage(1);
  };

  const handleOpenQuote = (product: any) => {
    setRfqProduct({
      name: `${product.name} ${product.partNo ? `(${product.partNo})` : ''}`,
      price: product.price || 0
    });
    setRfqModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 text-slate-900">
      <div className="w-[95%] max-w-[1920px] mx-auto space-y-6">

        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Link to="/" className="hover:text-red-600 transition-colors font-medium">Home</Link>
          <span>/</span>
          <span className="text-slate-900 font-bold">Industrial Cable & Component Catalogue</span>
        </div>

        {/* Hero Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-red-950 text-white p-6 sm:p-10 shadow-xl border border-slate-700/50 relative overflow-hidden">
          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="flex items-center gap-2 text-xs uppercase font-mono tracking-wider text-red-400 font-bold">
              <Zap size={15} />
              <span>Direct Authorized Stockist · ISO 9001:2015 Certified Depot</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              Industrial Products & Cable Catalogue
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
              Filter by cable core size, conductor cross section (SQMM), sheath colour, unit of measurement, and industrial category with same-day dispatch from Bangalore central hub.
            </p>
          </div>
          <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none hidden sm:block">
            <ShoppingBag size={280} />
          </div>
        </div>

        {/* Filter Bar & Sort Controls */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search by product name, part number, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all font-medium"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 text-xs p-1"
                title="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0 justify-between md:justify-end">
            
            {/* Mobile Filter Button */}
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold border border-slate-200 transition-colors"
            >
              <SlidersHorizontal size={14} />
              <span>Filters {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}</span>
            </button>

            {/* Sorting Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 hidden sm:inline flex items-center gap-1">
                <ArrowUpDown size={13} /> Sort By:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-red-500 cursor-pointer hover:border-slate-300"
              >
                <option value="name-asc">Product Name: A to Z</option>
                <option value="name-desc">Product Name: Z to A</option>
                <option value="category">Category</option>
                <option value="core-asc">Core Size: Low to High</option>
                <option value="core-desc">Core Size: High to Low</option>
                <option value="sqmm-asc">SQMM: Small to Large</option>
                <option value="sqmm-desc">SQMM: Large to Small</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>

            {/* Reset Filters Button */}
            {activeFilterCount > 0 && (
              <button
                onClick={resetAllFilters}
                className="flex items-center gap-1 px-3 py-2 text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-xl border border-red-200 transition-colors"
                title="Reset all filters"
              >
                <RotateCcw size={13} />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Active Filter Chips */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="text-slate-400 font-semibold">Active Filters:</span>
            {selectedCategory !== 'All' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-700 border border-red-200 rounded-lg font-bold">
                Category: {selectedCategory}
                <button onClick={() => setSelectedCategory('All')} className="hover:text-red-900 ml-1"><X size={12} /></button>
              </span>
            )}
            {selectedBrand !== 'All' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-800 border border-slate-200 rounded-lg font-bold">
                Make: {selectedBrand}
                <button onClick={() => setSelectedBrand('All')} className="hover:text-slate-900 ml-1"><X size={12} /></button>
              </span>
            )}
            {selectedCore !== 'All' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-800 border border-slate-200 rounded-lg font-mono font-bold">
                Core: {selectedCore} Cores
                <button onClick={() => setSelectedCore('All')} className="hover:text-slate-900 ml-1"><X size={12} /></button>
              </span>
            )}
            {selectedSqmm !== 'All' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg font-mono font-bold">
                SQMM: {selectedSqmm} mm²
                <button onClick={() => setSelectedSqmm('All')} className="hover:text-amber-900 ml-1"><X size={12} /></button>
              </span>
            )}
            {selectedColour !== 'All' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-800 border border-slate-200 rounded-lg font-bold">
                <ColourSwatch colour={selectedColour} size="xs" showLabel={false} />
                Colour: {selectedColour}
                <button onClick={() => setSelectedColour('All')} className="hover:text-slate-900 ml-1"><X size={12} /></button>
              </span>
            )}
            {selectedUom !== 'All' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-800 border border-slate-200 rounded-lg font-bold">
                UOM: {selectedUom}
                <button onClick={() => setSelectedUom('All')} className="hover:text-slate-900 ml-1"><X size={12} /></button>
              </span>
            )}
          </div>
        )}

        {/* Main Layout Grid: Left Sidebar Filters + Right Products Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          
          {/* Desktop Filter Sidebar (1 Col) */}
          <aside className="hidden lg:block bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-6 sticky top-24">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                <Filter size={16} className="text-red-600" />
                Filter Specifications
              </h3>
              {activeFilterCount > 0 && (
                <button onClick={resetAllFilters} className="text-[11px] font-bold text-red-600 hover:underline">
                  Clear All
                </button>
              )}
            </div>

            {/* 1. Category Filter */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider font-mono">
                Product Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="All">All Categories ({products.length})</option>
                {availableCategories.map((catName) => (
                  <option key={catName} value={catName}>{catName}</option>
                ))}
              </select>
            </div>

            {/* 2. Core Size Specification Filter */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider font-mono">
                Core Size (Number of Cores)
              </label>
              <select
                value={selectedCore}
                onChange={(e) => setSelectedCore(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-red-500 font-mono"
              >
                <option value="All">All Core Sizes</option>
                {availableCores.map((c) => (
                  <option key={c} value={c}>
                    {c === '0' ? '0 / Glands & Accessories' : `${c} Core${c !== '1' ? 's' : ''}`}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. SQMM Cross Section Filter */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider font-mono">
                SQMM (Cross Sectional Area)
              </label>
              <select
                value={selectedSqmm}
                onChange={(e) => setSelectedSqmm(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-red-500 font-mono"
              >
                <option value="All">All SQMM Sizes</option>
                {availableSqmms.map((sq) => (
                  <option key={sq} value={sq}>
                    {sq} mm² (sqmm)
                  </option>
                ))}
              </select>
            </div>

            {/* 4. Sheath / Core Colour Filter */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider font-mono">
                Cable Colour
              </label>
              <select
                value={selectedColour}
                onChange={(e) => setSelectedColour(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="All">All Colours</option>
                {availableColours.map((col) => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))}
              </select>
              {selectedColour !== 'All' && (
                <div className="pt-1">
                  <ColourSwatch colour={selectedColour} size="sm" />
                </div>
              )}
            </div>

            {/* 5. Unit of Measurement Filter */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider font-mono">
                Unit of Measurement (UOM)
              </label>
              <select
                value={selectedUom}
                onChange={(e) => setSelectedUom(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="All">All UOMs</option>
                {availableUoms.map((uom) => (
                  <option key={uom} value={uom}>{uom}</option>
                ))}
              </select>
            </div>

            {/* 6. Make (Manufacturer) Filter */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider font-mono">
                Make (Manufacturer)
              </label>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="All">All Makes</option>
                {availableBrands.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
          </aside>

          {/* Right Section: Results Header + Product Cards Grid (3 Cols) */}
          <main className="lg:col-span-3 space-y-4">
            
            {/* Results Count Bar */}
            <div className="flex items-center justify-between text-xs text-slate-600 font-semibold px-1">
              <span>
                Showing <strong className="text-slate-900">{paginatedProducts.length}</strong> of{' '}
                <strong className="text-slate-900">{sortedProducts.length}</strong> products
                {products.length > 0 && ` (${products.length} total in catalogue)`}
              </span>
              <span>Page {currentPage} of {totalPages}</span>
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center space-y-3">
                <div className="w-8 h-8 border-3 border-red-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-sm font-bold text-slate-700">Loading Product Catalogue...</p>
                <p className="text-xs text-slate-400">Fetching technical specifications, cores, and live inventory</p>
              </div>
            ) : sortedProducts.length === 0 ? (
              /* Empty State */
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 shadow-sm">
                <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto">
                  <ShoppingBag size={28} />
                </div>
                <h3 className="text-lg font-bold text-slate-800">No matching products found</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  No products in our catalogue match all of your current filter criteria. Try adjusting or resetting your category and specification filters.
                </p>
                <button
                  onClick={resetAllFilters}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-red-600 to-rose-700 text-white font-bold text-xs rounded-xl shadow-md shadow-red-600/20 hover:opacity-95 transition-all cursor-pointer"
                >
                  <RotateCcw size={14} />
                  Reset All Filters
                </button>
              </div>
            ) : (
              /* Product Grid */
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-4">
                {paginatedProducts.map((p) => {
                  const brandName = p.brand?.name || p.brandName || (typeof p.brand === 'string' ? p.brand : 'LAPP KABEL');
                  const coreVal = p.core ? String(p.core).trim() : null;
                  const sqmmVal = p.sqmm || p.coreSize || (p.size ? String(p.size) : null);
                  const uomVal = p.uom || 'Meter';

                  return (
                    <div 
                      key={p.id}
                      className="group bg-white rounded-2xl border border-slate-200/90 hover:border-red-400 hover:shadow-xl hover:shadow-red-500/10 transition-all duration-300 flex flex-col overflow-hidden relative"
                    >
                      {/* Product Image Slot */}
                      <Link 
                        to={`/product/${p.partNo || p.id}`}
                        className="aspect-[4/3] bg-slate-50 p-4 flex items-center justify-center border-b border-slate-100 relative overflow-hidden"
                      >
                        {p.imageUrl ? (
                          <img 
                            src={p.imageUrl} 
                            alt={p.name} 
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              const t = e.target as HTMLImageElement;
                              t.onerror = null;
                              t.src = '/images/card-olflex.jpg';
                            }}
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-slate-400">
                            <ShieldCheck size={32} className="opacity-40 mb-1" />
                            <span className="text-[10px] font-mono uppercase font-bold">Industrial Spec</span>
                          </div>
                        )}
                        {/* Part Number Badge */}
                        {p.partNo && (
                          <span className="absolute top-2.5 left-2.5 bg-slate-900/85 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-xs">
                            #{p.partNo}
                          </span>
                        )}
                      </Link>

                      {/* Product Details */}
                      <div className="p-4 flex-1 flex flex-col justify-between space-y-2.5">
                        
                        <div className="space-y-1.5">
                          {/* Brand Pill */}
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200 font-mono">
                              {brandName}
                            </span>
                            {p.categoryName && (
                              <span className="text-[10px] text-slate-400 truncate max-w-[120px]">
                                {p.categoryName}
                              </span>
                            )}
                          </div>

                          {/* Product Title */}
                          <Link 
                            to={`/product/${p.partNo || p.id}`}
                            className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-red-700 line-clamp-2 leading-snug transition-colors"
                            title={p.name}
                          >
                            {p.name}
                          </Link>

                          {/* Technical Specifications: Core Size × SQMM */}
                          {(coreVal || sqmmVal) && (
                            <div className="flex flex-wrap items-center gap-1.5 pt-1">
                              <span className="text-[11px] font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                {coreVal ? `${coreVal} Cores` : ''}
                                {coreVal && sqmmVal ? ' × ' : ''}
                                {sqmmVal ? `${sqmmVal} mm²` : ''}
                              </span>
                            </div>
                          )}

                          {/* Colour Swatch Badge */}
                          {p.colour && (
                            <div className="pt-0.5">
                              <ColourSwatch colour={p.colour} size="xs" />
                            </div>
                          )}
                        </div>

                        {/* Price & Action Buttons */}
                        <div className="pt-2 border-t border-slate-100 space-y-2">
                          <div className="flex items-baseline justify-between">
                            <div className="text-xs font-mono font-black text-slate-900">
                              {p.price ? (
                                <>
                                  ₹{Number(p.price).toLocaleString('en-IN')}
                                  <span className="text-[10px] text-slate-500 font-normal"> / {uomVal}</span>
                                </>
                              ) : (
                                <span className="text-slate-400 font-medium">Quote On Request</span>
                              )}
                            </div>
                            {(p.datasheetUrl || p.categoryDatasheetUrl) && (
                              <a
                                href={p.datasheetUrl || p.categoryDatasheetUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[10px] font-bold text-red-600 hover:text-red-800 flex items-center gap-0.5"
                                title="Download Technical Datasheet"
                              >
                                <FileText size={11} /> PDF
                              </a>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <Link
                              to={`/product/${p.partNo || p.id}`}
                              className="py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-[11px] font-bold text-center transition-colors"
                            >
                              View Specs
                            </Link>
                            <button
                              type="button"
                              onClick={() => handleOpenQuote(p)}
                              className="py-1.5 px-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[11px] font-bold text-center transition-colors shadow-xs"
                            >
                              Get Quote
                            </button>
                          </div>
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-200 pt-4 px-1 text-xs">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={14} /> Previous
                </button>

                <div className="flex items-center gap-1 font-mono font-bold text-slate-700">
                  <span>Page {currentPage} of {totalPages}</span>
                </div>

                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next <ChevronRight size={14} />
                </button>
              </div>
            )}

          </main>
        </div>

      </div>

      {/* Mobile Filter Slide-Over Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-[99999] bg-slate-950/70 backdrop-blur-xs flex justify-end">
          <div className="bg-white w-full max-w-sm h-full flex flex-col shadow-2xl p-6 space-y-5 overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-800 flex items-center gap-2">
                <Filter size={18} className="text-red-600" />
                Filter Specifications
              </h3>
              <button onClick={() => setMobileFilterOpen(false)} className="p-1 rounded-lg hover:bg-slate-100">
                <X size={18} />
              </button>
            </div>

            {/* Category */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
              >
                <option value="All">All Categories</option>
                {availableCategories.map((catName) => (
                  <option key={catName} value={catName}>{catName}</option>
                ))}
              </select>
            </div>

            {/* Core Size */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">Core Size</label>
              <select
                value={selectedCore}
                onChange={(e) => setSelectedCore(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
              >
                <option value="All">All Cores</option>
                {availableCores.map((c) => (
                  <option key={c} value={c}>{c === '0' ? 'Accessories (0)' : `${c} Cores`}</option>
                ))}
              </select>
            </div>

            {/* SQMM */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">SQMM Cross Section</label>
              <select
                value={selectedSqmm}
                onChange={(e) => setSelectedSqmm(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
              >
                <option value="All">All SQMM Sizes</option>
                {availableSqmms.map((sq) => (
                  <option key={sq} value={sq}>{sq} mm²</option>
                ))}
              </select>
            </div>

            {/* Colour */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">Colour</label>
              <select
                value={selectedColour}
                onChange={(e) => setSelectedColour(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
              >
                <option value="All">All Colours</option>
                {availableColours.map((col) => (
                  <option key={col} value={col}>{col}</option>
                ))}
              </select>
            </div>

            {/* UOM */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">UOM (Unit of Measurement)</label>
              <select
                value={selectedUom}
                onChange={(e) => setSelectedUom(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
              >
                <option value="All">All UOMs</option>
                {availableUoms.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>

            {/* Make (Manufacturer) */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">Make (Manufacturer)</label>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
              >
                <option value="All">All Makes</option>
                {availableBrands.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            <div className="pt-4 flex items-center gap-2 border-t border-slate-100">
              <button
                onClick={resetAllFilters}
                className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs"
              >
                Reset
              </button>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="flex-1 py-2.5 bg-red-600 text-white font-bold rounded-xl text-xs"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RFQ Modal */}
      {rfqProduct && (
        <RFQModal
          isOpen={rfqModalOpen}
          onClose={() => setRfqModalOpen(false)}
          productName={rfqProduct.name}
          productPrice={rfqProduct.price}
        />
      )}

    </div>
  );
};
