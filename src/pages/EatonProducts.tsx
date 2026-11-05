import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Zap, ShieldCheck, Search } from 'lucide-react';
import { RFQModal } from '../components/ui/RFQModal';
import { EATON_PRODUCTS, EatonProduct } from '../data/eatonData';

const SERIES_TABS = [
  { key: "pkzm0", series: "PKZM0", label: "PKZM0 Motor Breakers", id: "eaton-01" },
  { key: "dilm", series: "DILM", label: "DILM Contactors", id: "eaton-02" },
  { key: "nzm", series: "NZM", label: "NZM MCCB", id: "eaton-03" },
  { key: "rmq", series: "RMQ", label: "RMQ-Titan Controls", id: "eaton-04" },
  { key: "faz", series: "FAZ", label: "FAZ Miniature MCB", id: "eaton-05" },
  { key: "powerxl", series: "PowerXL", label: "PowerXL Drives", id: "eaton-06" },
];

const EatonCard: React.FC<{
  product: EatonProduct;
  image: string;
  onQuote: (p: EatonProduct) => void;
}> = ({ product, image, onQuote }) => {
  return (
    <div className="group relative flex flex-col rounded-3xl h-full bg-gradient-to-b from-blue-500/10 via-sky-50/70 to-white border border-blue-200/90 border-t-4 border-t-blue-500 hover:border-blue-400 transition-all duration-300 hover:-translate-y-1.5 shadow-sm hover:shadow-xl hover:shadow-blue-500/20 overflow-hidden">
      {/* Product Image Slot with tinted brand background */}
      <Link
        to={`/product/${product.partNo}`}
        className="relative aspect-[4/3] bg-gradient-to-b from-blue-100/50 via-sky-50/40 to-white flex items-center justify-center p-2 sm:p-4 overflow-hidden border-b border-blue-200/50 block"
      >
        <img
          src={image}
          alt={product.name}
          className="w-full h-full object-contain mix-blend-multiply p-1 sm:p-2 group-hover:scale-108 transition-transform duration-500 ease-out drop-shadow-sm"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null;
            target.src = "/images/promo-eaton.jpg";
          }}
        />
      </Link>

      {/* Card Content & Metadata */}
      <div className="flex flex-col flex-1 p-3 sm:p-4 items-center text-center justify-center space-y-1.5">
        <div className="flex items-center gap-1.5 flex-wrap justify-center">
          <span className="px-2.5 py-0.5 rounded-lg border text-[10px] sm:text-[11px] tracking-wider uppercase font-bold bg-blue-100/90 text-blue-900 border-blue-300">
            EATON
          </span>
          {product.partNo && (
            <span className="text-[10px] sm:text-[11px] font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
              Part #{product.partNo}
            </span>
          )}
        </div>

        {/* Product Title */}
        <Link to={`/product/${product.partNo}`} className="block w-full">
          <h4 className="text-[12px] sm:text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors line-clamp-2 leading-snug">
            {product.name}
          </h4>
        </Link>

        {/* Price & UOM */}
        {product.price > 0 && (
          <div className="text-[11px] sm:text-xs font-mono font-bold text-slate-900 pt-0.5">
            ₹{product.price.toLocaleString('en-IN')}{' '}
            <span className="text-[10px] text-slate-500 font-normal">/ piece</span>
          </div>
        )}
      </div>
    </div>
  );
};

export const EatonProducts: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const groupParam = (searchParams.get("group") || "pkzm0").toLowerCase();
  
  const groupMap: Record<string, { series: string; title: string; image: string; desc: string }> = {
    "pkzm0": {
      series: "PKZM0",
      title: "PKZM0 Motor-Protective Circuit-Breakers",
      image: "/images/eaton-pkzm0.jpg",
      desc: "Rotary switch motor protection with overload and short-circuit protection up to 150 kA. Integrated phase-failure differential sensitivity.",
    },
    "eaton-01": {
      series: "PKZM0",
      title: "PKZM0 Motor-Protective Circuit-Breakers",
      image: "/images/eaton-pkzm0.jpg",
      desc: "Rotary switch motor protection with overload and short-circuit protection up to 150 kA. Integrated phase-failure differential sensitivity.",
    },

    "dilm": {
      series: "DILM",
      title: "DILM Power Contactors (7A to 1600A)",
      image: "/images/eaton-dilm.jpg",
      desc: "Robust 3-pole and 4-pole contactors with electronic coils, low holding power, and SmartWire-DT connectivity for automated control cabinets.",
    },
    "eaton-02": {
      series: "DILM",
      title: "DILM Power Contactors (7A to 1600A)",
      image: "/images/eaton-dilm.jpg",
      desc: "Robust 3-pole and 4-pole contactors with electronic coils, low holding power, and SmartWire-DT connectivity for automated control cabinets.",
    },

    "nzm": {
      series: "NZM",
      title: "NZM Compact Molded Case Circuit Breakers",
      image: "/images/eaton-nzm.jpg",
      desc: "4 frame sizes from 20A to 1600A with electronic trip units, onboard energy metering, and USB diagnostic interface for main distribution incomers.",
    },
    "eaton-03": {
      series: "NZM",
      title: "NZM Compact Molded Case Circuit Breakers",
      image: "/images/eaton-nzm.jpg",
      desc: "4 frame sizes from 20A to 1600A with electronic trip units, onboard energy metering, and USB diagnostic interface for main distribution incomers.",
    },

    "rmq": {
      series: "RMQ",
      title: "RMQ-Titan 22mm Pilot Devices & Pushbuttons",
      image: "/images/eaton-rmq.jpg",
      desc: "IP67/IP69K operator controls with titanium bezels, laser inscriptions, customizable LED illumination, and ergonomic actuation.",
    },
    "eaton-04": {
      series: "RMQ",
      title: "RMQ-Titan 22mm Pilot Devices & Pushbuttons",
      image: "/images/eaton-rmq.jpg",
      desc: "IP67/IP69K operator controls with titanium bezels, laser inscriptions, customizable LED illumination, and ergonomic actuation.",
    },

    "faz": {
      series: "FAZ",
      title: "FAZ DIN-Rail Miniature Circuit Breakers",
      image: "/images/eaton-faz.jpg",
      desc: "High performance 15kA breaking capacity MCBs with dual-purpose terminals, captive screws, and standard DIN-rail mounting.",
    },
    "eaton-05": {
      series: "FAZ",
      title: "FAZ DIN-Rail Miniature Circuit Breakers",
      image: "/images/eaton-faz.jpg",
      desc: "High performance 15kA breaking capacity MCBs with dual-purpose terminals, captive screws, and standard DIN-rail mounting.",
    },

    "powerxl": {
      series: "PowerXL",
      title: "PowerXL Variable Frequency Drives",
      image: "/images/eaton-drives.jpg",
      desc: "Compact VFDs and variable speed starters for energy-efficient motor control, pumps, conveyors, and HVAC in demanding environments.",
    },
    "eaton-06": {
      series: "PowerXL",
      title: "PowerXL Variable Frequency Drives",
      image: "/images/eaton-drives.jpg",
      desc: "Compact VFDs and variable speed starters for energy-efficient motor control, pumps, conveyors, and HVAC in demanding environments.",
    },
  };

  const groupInfo = groupMap[groupParam] || groupMap["pkzm0"];
  
  const [rfqModalOpen, setRfqModalOpen] = useState(false);
  const [rfqProductName, setRfqProductName] = useState<string | null>(null);
  const [rfqProductPrice, setRfqProductPrice] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const displayData = EATON_PRODUCTS.filter(p => p.series === groupInfo.series && (
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.partNo.toLowerCase().includes(searchQuery.toLowerCase())
  ));

  const handleTabClick = (key: string) => {
    setSearchParams({ group: key });
    setSearchQuery('');
  };

  const handleOpenQuote = (product: EatonProduct) => {
    setRfqProductName(`${product.name} (Part #${product.partNo})`);
    setRfqProductPrice(product.price);
    setRfqModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 text-slate-900">
      <div className="w-[95%] max-w-[1920px] mx-auto space-y-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Link to="/" className="hover:text-blue-600 transition-colors font-medium">Home</Link>
          <span>/</span>
          <Link to="/about-eaton" className="hover:text-blue-600 transition-colors font-medium">EATON Switchgear</Link>
          <span>/</span>
          <span className="text-slate-900 font-bold">{groupInfo.title}</span>
        </div>

        {/* Hero Header with Integrated Search on Desktop */}
        <div className="relative rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 lg:p-10 overflow-hidden shadow-lg">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center relative z-10">
            {/* Left Column: Brand & Series Info */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-blue-700 font-mono font-bold">
                <Zap className="w-4 h-4 text-blue-600" />
                <span>Official Eaton Switchgear Partner · Direct Stockist</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">{groupInfo.title}</h1>
              <p className="text-sm text-slate-600 leading-relaxed">
                {groupInfo.desc}
              </p>
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-mono text-slate-600 pt-1 font-medium">
                <span className="flex items-center gap-1.5 text-slate-900 font-bold">
                  <ShieldCheck className="w-4 h-4 text-blue-500" />
                  Original Factory Parts
                </span>
                <span>·</span>
                <span>IEC/EN 60947</span>
                <span>·</span>
                <span>Direct Warranty</span>
                <span>·</span>
                <button
                  onClick={() => {
                    setRfqProductName(`EATON ${groupInfo.series} Complete Series RFQ`);
                    setRfqProductPrice(null);
                    setRfqModalOpen(true);
                  }}
                  className="text-blue-600 hover:text-blue-800 font-bold underline cursor-pointer"
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
                    <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
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
                    className="w-full bg-white border border-slate-200 text-slate-900 text-xs sm:text-sm rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400 shadow-2xs"
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
          {SERIES_TABS.map(tab => {
            const isActive = groupInfo.series === tab.series;
            const count = EATON_PRODUCTS.filter(p => p.series === tab.series).length;
            return (
              <button
                key={tab.key}
                onClick={() => handleTabClick(tab.key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                  isActive ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-600'
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
              <EatonCard
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
