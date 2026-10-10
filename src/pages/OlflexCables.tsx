import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Zap, ShieldCheck, ChevronDown, ChevronUp } from "lucide-react";
import { RFQModal } from "../components/ui/RFQModal";
import type { OlflexProduct } from "../types";
import {
  OLFLEX_110_PRODUCTS,
  OLFLEX_110SY_PRODUCTS,
  OLFLEX_110CY_PRODUCTS,
  OLFLEX_100I_PRODUCTS,
} from "../data/olflexData";
import { NEW_LAPP_OTHER_PRODUCTS } from "../data/lappOtherData";
import { NEW_OLFLEX_PRODUCTS } from "../data/olflexNewData";


// Helper to group UNITRONIC / SKINTOP / SILVYN products
const groupProducts = (prefix: string, data: OlflexProduct[]) => {
  const filtered = data.filter(p => p.name.includes(prefix));
  const groups: Record<string, OlflexProduct[]> = {};
  
  filtered.forEach(p => {
    let seriesName = prefix;
    if (prefix === "UNITRONIC") {
      if (p.name.includes("LiYCY (TP)")) seriesName = "UNITRONIC® LiYCY (TP)";
      else if (p.name.includes("LiYCY")) seriesName = "UNITRONIC® LiYCY";
      else if (p.name.includes("LiYY (TP)")) seriesName = "UNITRONIC® LiYY (TP)";
      else if (p.name.includes("LiYY")) seriesName = "UNITRONIC® LiYY";
      else if (p.name.includes("LIYY")) seriesName = "UNITRONIC® LiYY";
      else seriesName = "UNITRONIC® Other";
    } else if (prefix === "SKINTOP") {
      if (p.name.includes("ST-M")) seriesName = "SKINTOP® ST-M";
      else if (p.name.includes("GMP-GL-M")) seriesName = "SKINTOP® GMP-GL-M";
      else seriesName = "SKINTOP® Other";
    } else if (prefix === "SILVYN") {
      if (p.name.includes("KLICK")) seriesName = "SILVYN® KLICK";
      else if (p.name.includes("RILL")) seriesName = "SILVYN® RILL";
      else seriesName = "SILVYN® Other";
    }
    
    if (!groups[seriesName]) groups[seriesName] = [];
    groups[seriesName].push(p);
  });
  
  return Object.entries(groups).map(([title, items], idx) => ({
    id: `${prefix.toLowerCase()}-${idx}`,
    title,
    data: items,
    image: prefix === "UNITRONIC" ? "/images/card-unitronic.jpg" 
           : prefix === "SKINTOP" ? "/images/card-skintop.jpg"
           : "/images/card-conduit.jpg"
  }));
};

const UNITRONIC_SECTIONS = groupProducts("UNITRONIC", NEW_LAPP_OTHER_PRODUCTS);
const SKINTOP_SECTIONS = groupProducts("SKINTOP", NEW_LAPP_OTHER_PRODUCTS);
const SILVYN_SECTIONS = groupProducts("SILVYN", NEW_LAPP_OTHER_PRODUCTS);
const UNIPLUS_SECTIONS = groupProducts("UNIPLUS", NEW_OLFLEX_PRODUCTS);
const INFRA_SECTIONS = groupProducts("INFRA", NEW_OLFLEX_PRODUCTS);



const OLFLEX_SECTIONS = [
  { id: '110', title: 'ÖLFLEX® CLASSIC 110', data: OLFLEX_110_PRODUCTS, image: '/images/cable-olflex-cores.png' },
  { id: '110sy', title: 'ÖLFLEX® CLASSIC 110 SY', data: OLFLEX_110SY_PRODUCTS, image: '/images/products/lapp-02.jpg' },
  { id: '110cy', title: 'ÖLFLEX® CLASSIC 110 CY', data: OLFLEX_110CY_PRODUCTS, image: '/images/products/lapp-03.jpg' },
  { id: '100', title: 'ÖLFLEX® CLASSIC 100I', data: OLFLEX_100I_PRODUCTS, image: '/images/products/lapp-01.jpg' }
];

const CompactCableCard = ({ product, image, onQuote }: { product: any, image: string, onQuote: (p: any) => void }) => {
  return (
    <div 
      className="group relative flex flex-col rounded-3xl h-full bg-gradient-to-b from-orange-500/10 via-orange-50/70 to-white border border-orange-200/90 border-t-4 border-t-orange-500 hover:border-orange-400 transition-all duration-300 hover:-translate-y-1.5 shadow-sm hover:shadow-xl hover:shadow-orange-500/20 overflow-hidden" 
    >
      <Link to={`/product/${product.partNo}`} className="relative aspect-[4/3] bg-gradient-to-b from-orange-100/50 via-orange-50/40 to-white flex items-center justify-center p-2 sm:p-4 overflow-hidden border-b border-orange-200/50 block">
        <img src={product.imageUrl || image} alt={product.name} className="w-full h-full object-contain mix-blend-multiply p-1 sm:p-2 group-hover:scale-108 transition-transform duration-500 ease-out drop-shadow-sm" />
      </Link>
      <div className="flex flex-col flex-1 p-3 sm:p-4 items-center text-center justify-center space-y-2">
        <div>
          <span className="px-2.5 py-1 rounded-lg border text-[10px] sm:text-[11px] tracking-wider uppercase font-bold bg-orange-100/90 text-orange-900 border-orange-300">
            {typeof product.brand === 'object' ? (product.brand?.name || 'LAPP') : (product.brand || 'LAPP')}
          </span>
        </div>
                <Link to={`/product/${product.partNo}`} className="block w-full">
          <h4 className="text-[12px] sm:text-sm font-bold text-slate-900 group-hover:text-orange-700 transition-colors line-clamp-2 leading-snug">
            {product.name}
          </h4>
        </Link>
        {product.size ? (
          <div className="text-[11px] sm:text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-md mt-1 border border-slate-200">
            {product.core ? `${product.core}X${product.size}` : product.size}
          </div>
        ) : null}
      </div>
    </div>
  )
}

export const OlflexCables: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const groupParam = searchParams.get("group") || "olflex";
  
  const [dbProducts, setDbProducts] = useState<any[]>([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/products')
      .then(res => res.json())
      .then(data => {
        setDbProducts(data);
      })
      .catch(err => console.error("Failed to fetch products:", err));
  }, []);

  // Fallback to static data by default
  let SECTIONS: any[] = [];
  if (groupParam === "unitronic") SECTIONS = [...UNITRONIC_SECTIONS];
  else if (groupParam === "skintop") SECTIONS = [...SKINTOP_SECTIONS];
  else if (groupParam === "silvyn") SECTIONS = [...SILVYN_SECTIONS];
  else if (groupParam === "uniplus") SECTIONS = [...UNIPLUS_SECTIONS];
  else if (groupParam === "infra") SECTIONS = [...INFRA_SECTIONS];
  else SECTIONS = [...OLFLEX_SECTIONS];

  if (dbProducts.length > 0) {
    const newItems = dbProducts.filter((p: any) => {
      const cat = p.category?.name || p.categoryName || '';
      if (groupParam === "olflex" && cat === "Power and Control Cables") return true;
      if (groupParam === "unitronic" && cat === "Data Communication Cables") return true;
      if (groupParam === "skintop" && cat === "Cable Glands & Counter Nuts") return true;
      if (groupParam === "silvyn" && cat === "Rill, Conduit & Klick") return true;
      if (groupParam === "uniplus" && cat === "Control Cabinet Single Cores") return true;
      return false;
    });

    if (newItems.length > 0) {
      SECTIONS.push({
        id: 'new-db-items',
        title: 'Newly Added Products',
        image: '/images/cable-olflex-cores.png',
        data: newItems.map((p: any) => ({
          ...p,
          brand: p.brand?.name || p.brandName || 'LAPP',
          size: p.coreSize
        }))
      });
    }
  }
  const groupTitle = groupParam === "unitronic" ? "UNITRONIC® Data Cables" 
                   : groupParam === "skintop" ? "SKINTOP® Cable Glands"
                   : groupParam === "silvyn" ? "SILVYN® Conduits"
                   : groupParam === "uniplus" ? "UNIPLUS® Single Cores"
                   : groupParam === "infra" ? "LAPP INFRA Building Wires"
                   : "ÖLFLEX® Industrial Flexible Control Cables";

  const [rfqModalOpen, setRfqModalOpen] = useState(false);
  const [rfqProductName, setRfqProductName] = useState<string | null>(null);
  const [rfqProductPrice, setRfqProductPrice] = useState<number | null>(null);
  
  // Track which sections are expanded to show all products
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [activeFilter, setActiveFilter] = useState('all');
  
  // New Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [coreFilter, setCoreFilter] = useState('');
  const [sqmmFilter, setSqmmFilter] = useState('');

  const toggleSection = (id: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleQuote = (p: OlflexProduct) => {
    setRfqProductName(`${p.name} (${p.partNo})`);
    setRfqProductPrice(p.price);
    setRfqModalOpen(true);
  };

  // Extract unique cores and sizes from all products
  const allProducts = SECTIONS.flatMap(s => s.data);
  const uniqueCores = Array.from(new Set(allProducts.map(p => p.core))).filter(Boolean).sort((a, b) => Number(a) - Number(b));
  const uniqueSizes = Array.from(new Set(allProducts.map(p => p.size))).filter(Boolean).sort((a, b) => Number(a) - Number(b));

  const filteredSections = SECTIONS.map(section => {
    if (activeFilter !== 'all' && section.id !== activeFilter) return null;
    
    const filteredData = section.data.filter((p: OlflexProduct) => {
      const q = searchQuery.toLowerCase();
      const matchSearch = p.name.toLowerCase().includes(q) || (p.partNo && p.partNo.toLowerCase().includes(q));
      const matchCore = coreFilter ? p.core?.toString() === coreFilter : true;
      const matchSize = sqmmFilter ? p.size?.toString() === sqmmFilter : true;
      return matchSearch && matchCore && matchSize;
    });

    return { ...section, data: filteredData };
  }).filter(Boolean) as typeof SECTIONS;

  const totalFilteredCount = filteredSections.reduce((acc, curr) => acc + curr.data.length, 0);

  const resetFilters = () => {
    setSearchQuery('');
    setCoreFilter('');
    setSqmmFilter('');
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 text-slate-900">
      <div className="w-[95%] max-w-[1920px] mx-auto space-y-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Link to="/" className="hover:text-amber-600 transition-colors font-medium">
            Home
          </Link>
          <span>/</span>
          <Link to="/about-lapp" className="hover:text-amber-600 transition-colors font-medium">
            LAPP Kabel
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-bold">{groupParam === "olflex" ? "ÖLFLEX® Cable Center" : groupTitle}</span>
        </div>

        {/* Hero Header */}
        <div className="relative rounded-3xl bg-white border border-slate-200 p-8 sm:p-10 overflow-hidden shadow-lg">
          <div className="max-w-3xl relative z-10 space-y-4">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-amber-700 font-mono font-bold">
              <Zap className="w-4 h-4 text-amber-600" />
              <span>Official German Cable Configurator · Direct Stockist</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">{groupTitle}</h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              Engineered by LAPP Stuttgart. High flexibility, chemical and oil resistance according to DIN EN 50290-2-22, and VDE registration. Over 100+ standard configurations available with same-day dispatch from our Bangalore central warehouse.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-600 pt-2 font-medium">
              <span className="flex items-center gap-1.5 text-slate-900 font-bold">
                <ShieldCheck className="w-4 h-4 text-amber-500" />
                VDE Reg. No. 7030
              </span>
              <span>·</span>
              <span>Test Voltage: 4000 V</span>
              <span>·</span>
              <span>Temp: -40°C to +80°C</span>
              <span>·</span>
              <span>Class 5 Bare Copper</span>
            </div>
          </div>
        </div>

        
        {/* Filter Buttons */}
        <div className="flex flex-col gap-4">
          
          <div className="flex overflow-x-auto hide-scrollbar bg-slate-100/50 p-1.5 rounded-2xl border border-slate-200 gap-1 items-center">
            <button 
              onClick={() => setActiveFilter('all')}
              className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeFilter === 'all' ? 'bg-amber-500 text-white shadow-sm ring-2 ring-amber-300 ring-offset-1' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'}`}
            >
              All {groupParam === 'olflex' ? 'ÖLFLEX®' : groupParam.toUpperCase() + '®'} ({allProducts.length})
            </button>
            {SECTIONS.map(sec => (
              <button 
                key={sec.id}
                onClick={() => setActiveFilter(sec.id)}
                className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${activeFilter === sec.id ? 'bg-amber-500 text-white shadow-sm ring-2 ring-amber-300 ring-offset-1' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'}`}
              >
                {sec.title}
              </button>
            ))}
          </div>

        </div>

        {/* Search & Filters Container */}
        <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-6 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Search */}
            <div className="relative w-full lg:flex-1">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-slate-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>
              </div>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search part #, 3G1.5, 4x2.5..."
                className="w-full pl-11 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-slate-900 placeholder:text-slate-400"
              />
            </div>

            {/* Core Count */}
            <div className="relative w-full lg:w-48">
              <select
                value={coreFilter}
                onChange={(e) => setCoreFilter(e.target.value)}
                className="w-full pl-4 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-slate-900 appearance-none"
              >
                <option value="">All Core Counts</option>
                {uniqueCores.map(core => (
                  <option key={core} value={core.toString()}>{core} Cores</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>

            {/* Sqmm */}
            <div className="relative w-full lg:w-56">
              <select
                value={sqmmFilter}
                onChange={(e) => setSqmmFilter(e.target.value)}
                className="w-full pl-4 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-slate-900 appearance-none"
              >
                <option value="">All Cross Sections</option>
                {uniqueSizes.map(size => (
                  <option key={size} value={size.toString()}>{size} sq mm</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>

            {/* Counter and Reset */}
            <div className="flex items-center justify-end gap-3 text-sm text-slate-500 w-full lg:w-auto shrink-0">
              <span>Showing <strong className="text-slate-900 font-bold">{totalFilteredCount}</strong></span>
              <button 
                onClick={resetFilters}
                className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-600"
                title="Reset Filters"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Sections */}
        <div className="space-y-12">
          {filteredSections.map(section => {
            const isExpanded = expandedSections[section.id];
            const displayData = isExpanded ? section.data : section.data.slice(0, 6);
            
            if (!section.data || section.data.length === 0) return null;

            return (
              <div key={section.id} className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-3">
                    <span className="w-2 h-8 bg-orange-500 rounded-full"></span>
                    {section.title}
                  </h2>
                  <div className="text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                    {section.data.length} Variants Available
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                  {displayData.map((p: OlflexProduct, idx: number) => (
                    <CompactCableCard 
                      key={`${p.partNo}-${idx}`} 
                      product={p} 
                      image={section.image} 
                      onQuote={handleQuote} 
                    />
                  ))}
                </div>

                {section.data.length > 6 && (
                  <div className="mt-6 flex justify-center">
                    <button 
                      onClick={() => toggleSection(section.id)}
                      className="flex items-center gap-2 px-6 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:text-orange-600 transition-colors shadow-xs"
                    >
                      {isExpanded ? (
                        <>Show Less <ChevronUp className="w-4 h-4" /></>
                      ) : (
                        <>View More Products <ChevronDown className="w-4 h-4" /></>
                      )}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Modal for RFQ */}
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
      </div>
    </div>
  );
};
