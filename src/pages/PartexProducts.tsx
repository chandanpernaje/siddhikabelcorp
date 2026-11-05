import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Tag, ShieldCheck, Search } from 'lucide-react';
import { RFQModal } from '../components/ui/RFQModal';
import { PARTEX_PRODUCTS, PartexProduct } from '../data/partexData';

const PARTEX_TABS = [
  { key: "pa", series: "PA", label: "PA Chevron Markers", id: "partex-01" },
  { key: "promark", series: "ProMark", label: "ProMark Printers", id: "partex-02" },
  { key: "po", series: "PO", label: "PO Oval Sleeves", id: "partex-03" },
  { key: "pc", series: "PC", label: "PC Snap-On Markers", id: "partex-04" },
  { key: "pks", series: "PKS", label: "PKS Stainless Steel", id: "partex-05" },
  { key: "ties", series: "Cable Ties", label: "Cable Ties & Mounts", id: "partex-06" },
];

const PartexCard: React.FC<{
  product: PartexProduct;
  image: string;
  onQuote: (p: PartexProduct) => void;
}> = ({ product, image, onQuote }) => {
  return (
    <div className="group relative flex flex-col rounded-3xl h-full bg-gradient-to-b from-zinc-500/10 via-zinc-50/70 to-white border border-zinc-200/90 border-t-4 border-t-zinc-600 hover:border-zinc-400 transition-all duration-300 hover:-translate-y-1.5 shadow-sm hover:shadow-xl hover:shadow-zinc-500/20 overflow-hidden">
      {/* Product Image Slot with tinted brand background */}
      <Link
        to={`/product/${product.partNo}`}
        className="relative aspect-[4/3] bg-gradient-to-b from-zinc-100/50 via-zinc-50/40 to-white flex items-center justify-center p-2 sm:p-4 overflow-hidden border-b border-zinc-200/50 block"
      >
        <img
          src={image}
          alt={product.name}
          className="w-full h-full object-contain mix-blend-multiply p-1 sm:p-2 group-hover:scale-108 transition-transform duration-500 ease-out drop-shadow-sm"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null;
            target.src = "/images/promo-partex.jpg";
          }}
        />
      </Link>

      {/* Card Content & Metadata */}
      <div className="flex flex-col flex-1 p-3 sm:p-4 items-center text-center justify-center space-y-1.5">
        <div className="flex items-center gap-1.5 flex-wrap justify-center">
          <span className="px-2.5 py-0.5 rounded-lg border text-[10px] sm:text-[11px] tracking-wider uppercase font-bold bg-zinc-100/90 text-zinc-900 border-zinc-300">
            PARTEX
          </span>
          {product.partNo && (
            <span className="text-[10px] sm:text-[11px] font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
              Part #{product.partNo}
            </span>
          )}
        </div>

        {/* Product Title */}
        <Link to={`/product/${product.partNo}`} className="block w-full">
          <h4 className="text-[12px] sm:text-sm font-bold text-slate-900 group-hover:text-zinc-700 transition-colors line-clamp-2 leading-snug">
            {product.name}
          </h4>
        </Link>

        {/* Price & UOM */}
        {product.price > 0 && (
          <div className="text-[11px] sm:text-xs font-mono font-bold text-slate-900 pt-0.5">
            ₹{product.price.toLocaleString('en-IN')}{' '}
            <span className="text-[10px] text-slate-500 font-normal">/ pack</span>
          </div>
        )}
      </div>
    </div>
  );
};

export const PartexProducts: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const groupParam = (searchParams.get("group") || "pa").toLowerCase();
  
  const groupMap: Record<string, { series: string; title: string; image: string; desc: string }> = {
    "pa": {
      series: "PA",
      title: "PA Closed Chevron Wire Markers",
      image: "/images/partex-pa.jpg",
      desc: "Interlocking chevron cut ensures markers stay firmly locked and aligned in line. Self-extinguishing PVC to UL94-V0.",
    },
    "partex-01": {
      series: "PA",
      title: "PA Closed Chevron Wire Markers",
      image: "/images/partex-pa.jpg",
      desc: "Interlocking chevron cut ensures markers stay firmly locked and aligned in line. Self-extinguishing PVC to UL94-V0.",
    },

    "promark": {
      series: "ProMark",
      title: "ProMark T-1000 Thermal Transfer Printer",
      image: "/images/partex-promark.jpg",
      desc: "Compact high-speed marking printer for profiles, heat shrink tubing, and continuous label tapes. 40mm/sec.",
    },
    "partex-02": {
      series: "ProMark",
      title: "ProMark T-1000 Thermal Transfer Printer",
      image: "/images/partex-promark.jpg",
      desc: "Compact high-speed marking printer for profiles, heat shrink tubing, and continuous label tapes. 40mm/sec.",
    },

    "po": {
      series: "PO",
      title: "PO & POZ Oval Marker Sleeves",
      image: "/images/partex-po.jpg",
      desc: "Flexible oval profile designed to conform smoothly over individual wire cores. Halogen-free ZEROHEX version available.",
    },
    "partex-03": {
      series: "PO",
      title: "PO & POZ Oval Marker Sleeves",
      image: "/images/partex-po.jpg",
      desc: "Flexible oval profile designed to conform smoothly over individual wire cores. Halogen-free ZEROHEX version available.",
    },

    "pc": {
      series: "PC",
      title: "PC Open-End Snap-On Wire Markers",
      image: "/images/partex-pc.jpg",
      desc: "Fast clip-on installation onto terminated wires and cables without disconnecting the terminal connections.",
    },
    "partex-04": {
      series: "PC",
      title: "PC Open-End Snap-On Wire Markers",
      image: "/images/partex-pc.jpg",
      desc: "Fast clip-on installation onto terminated wires and cables without disconnecting the terminal connections.",
    },

    "pks": {
      series: "PKS",
      title: "PKS Stainless Steel Embossed Markers",
      image: "/images/partex-pks.jpg",
      desc: "Acid-proof AISI 316 stainless steel cable identification tags for aggressive offshore, chemical, and nuclear environments.",
    },
    "partex-05": {
      series: "PKS",
      title: "PKS Stainless Steel Embossed Markers",
      image: "/images/partex-pks.jpg",
      desc: "Acid-proof AISI 316 stainless steel cable identification tags for aggressive offshore, chemical, and nuclear environments.",
    },

    "ties": {
      series: "Cable Ties",
      title: "Heavy Duty Cable Ties & Mounts",
      image: "/images/partex-ties.jpg",
      desc: "Polyamide 6.6 and stainless steel cable ties with rounded edges to prevent wire jacket cut-through.",
    },
    "cable-ties": {
      series: "Cable Ties",
      title: "Heavy Duty Cable Ties & Mounts",
      image: "/images/partex-ties.jpg",
      desc: "Polyamide 6.6 and stainless steel cable ties with rounded edges to prevent wire jacket cut-through.",
    },
    "partex-06": {
      series: "Cable Ties",
      title: "Heavy Duty Cable Ties & Mounts",
      image: "/images/partex-ties.jpg",
      desc: "Polyamide 6.6 and stainless steel cable ties with rounded edges to prevent wire jacket cut-through.",
    },
  };

  const groupInfo = groupMap[groupParam] || groupMap["pa"];
  
  const [rfqModalOpen, setRfqModalOpen] = useState(false);
  const [rfqProductName, setRfqProductName] = useState<string | null>(null);
  const [rfqProductPrice, setRfqProductPrice] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const displayData = PARTEX_PRODUCTS.filter(p => p.series === groupInfo.series && (
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.partNo.toLowerCase().includes(searchQuery.toLowerCase())
  ));

  const handleTabClick = (key: string) => {
    setSearchParams({ group: key });
    setSearchQuery('');
  };

  const handleOpenQuote = (product: PartexProduct) => {
    setRfqProductName(`${product.name} (Part #${product.partNo})`);
    setRfqProductPrice(product.price);
    setRfqModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 text-slate-900">
      <div className="w-[95%] max-w-[1920px] mx-auto space-y-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Link to="/" className="hover:text-zinc-600 transition-colors font-medium">Home</Link>
          <span>/</span>
          <Link to="/about-partex" className="hover:text-zinc-600 transition-colors font-medium">PARTEX Sweden</Link>
          <span>/</span>
          <span className="text-slate-900 font-bold">{groupInfo.title}</span>
        </div>

        {/* Hero Header with Integrated Search on Desktop */}
        <div className="relative rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 lg:p-10 overflow-hidden shadow-lg">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center relative z-10">
            {/* Left Column: Brand & Series Info */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-zinc-700 font-mono font-bold">
                <Tag className="w-4 h-4 text-zinc-600" />
                <span>Official Partex Marking Partner · Direct Stockist</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">{groupInfo.title}</h1>
              <p className="text-sm text-slate-600 leading-relaxed">
                {groupInfo.desc}
              </p>
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-mono text-slate-600 pt-1 font-medium">
                <span className="flex items-center gap-1.5 text-slate-900 font-bold">
                  <ShieldCheck className="w-4 h-4 text-zinc-500" />
                  Swedish Precision Engineered
                </span>
                <span>·</span>
                <span>UL94-V0 Flammability</span>
                <span>·</span>
                <span>Direct Stock Ready</span>
                <span>·</span>
                <button
                  onClick={() => {
                    setRfqProductName(`PARTEX ${groupInfo.series} Complete Series RFQ`);
                    setRfqProductPrice(null);
                    setRfqModalOpen(true);
                  }}
                  className="text-zinc-700 hover:text-zinc-900 font-bold underline cursor-pointer"
                >
                  Request Series RFQ
                </button>
              </div>
            </div>

            {/* Right Column: Search Box (Fills the blank space on desktop) */}
            <div className="lg:col-span-5 w-full">
              <div className="bg-gradient-to-b from-slate-50 to-slate-100/70 border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
                    <span className="w-2 h-2 rounded-full bg-zinc-700 animate-pulse" />
                    <span>Search {groupInfo.series} Catalog</span>
                  </div>
                  <span className="text-[11px] font-bold text-slate-600 bg-white px-2.5 py-0.5 rounded-full border border-slate-200 font-mono shadow-2xs">
                    {displayData.length} variants
                  </span>
                </div>

                <div className="relative w-full">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder={`Search in ${groupInfo.series} by part number or name...`}
                    className="w-full bg-white border border-slate-200 text-slate-900 text-xs sm:text-sm rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 transition-all placeholder:text-slate-400 shadow-2xs"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {PARTEX_TABS.map(tab => {
            const isActive = groupInfo.series === tab.series;
            const count = PARTEX_PRODUCTS.filter(p => p.series === tab.series).length;
            return (
              <button
                key={tab.key}
                onClick={() => handleTabClick(tab.key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-zinc-800 text-white shadow-md shadow-zinc-500/30'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                  isActive ? 'bg-zinc-900 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>


        {/* Products Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xl font-bold text-slate-900">{groupInfo.series} Variants</h3>
            <span className="text-xs font-bold text-slate-500 bg-slate-200 px-3 py-1 rounded-full">
              {displayData.length} Variants
            </span>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {displayData.map(product => (
              <PartexCard
                key={product.partNo}
                product={product}
                image={groupInfo.image}
                onQuote={handleOpenQuote}
              />
            ))}
          </div>

          {displayData.length === 0 && (
            <div className="text-center py-12 bg-white rounded-3xl border border-slate-200">
              <p className="text-slate-500 font-medium">No {groupInfo.series} products found matching your search.</p>
            </div>
          )}
        </div>
      </div>

      <RFQModal
        isOpen={rfqModalOpen}
        onClose={() => { setRfqModalOpen(false); setRfqProductName(null); setRfqProductPrice(null); }}
        productName={rfqProductName}
        productPrice={rfqProductPrice}
      />
    </div>
  );
};
