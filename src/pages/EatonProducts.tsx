import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Zap, ShieldCheck } from 'lucide-react';
import { RFQModal } from '../components/ui/RFQModal';
import { EATON_PRODUCTS, EatonProduct } from '../data/eatonData';

const EatonCard: React.FC<{ product: EatonProduct; image: string }> = ({ product, image }) => {
  return (
    <div className="group flex flex-col bg-white rounded-3xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300">
      <Link to={`/product/${product.partNo}`} className="h-40 sm:h-48 bg-slate-100 flex items-center justify-center p-4 sm:p-6 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-t from-slate-200/50 to-transparent" />
        <img src={image} alt={product.name} className="w-full h-full object-contain mix-blend-multiply p-1 sm:p-2 group-hover:scale-105 transition-transform duration-500 ease-out drop-shadow-sm" />
      </Link>
      <div className="flex flex-col flex-1 p-3 sm:p-4 items-center text-center justify-center space-y-2">
        <div>
          <span className="px-2.5 py-1 rounded-lg border text-[10px] sm:text-[11px] tracking-wider uppercase font-bold bg-blue-100/90 text-blue-900 border-blue-300">
            EATON
          </span>
        </div>
        <Link to={`/product/${product.partNo}`} className="block w-full">
          <h4 className="text-[12px] sm:text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors line-clamp-2 leading-snug">
            {product.name}
          </h4>
        </Link>
      </div>
    </div>
  );
};

export const EatonProducts: React.FC = () => {
  const [searchParams] = useSearchParams();
  const groupParam = searchParams.get("group") || "pkzm0";
  
  const groupMap: Record<string, { series: string, title: string, image: string }> = {
    "eaton-01": { series: "PKZM0", title: "PKZM0 Motor-Protective Circuit-Breakers", image: "/images/eaton-pkzm0.jpg" },
    "eaton-02": { series: "DILM", title: "DILM Power Contactors", image: "/images/eaton-dilm.jpg" },
    "eaton-03": { series: "NZM", title: "NZM Compact Molded Case Circuit Breakers", image: "/images/eaton-nzm.jpg" },
    "eaton-04": { series: "FAZ", title: "FAZ DIN-Rail Miniature Circuit Breakers", image: "/images/eaton-faz.jpg" },
  };

  const groupInfo = groupMap[groupParam] || groupMap["eaton-01"];
  
  const [rfqModalOpen, setRfqModalOpen] = useState(false);
  const [rfqProductName, setRfqProductName] = useState<string | null>(null);
  const [rfqProductPrice, setRfqProductPrice] = useState<number | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');

  const displayData = EATON_PRODUCTS.filter(p => p.series === groupInfo.series && (
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.partNo.toLowerCase().includes(searchQuery.toLowerCase())
  ));

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 text-slate-900">
      <div className="w-[95%] max-w-[1920px] mx-auto space-y-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Link to="/" className="hover:text-blue-600 transition-colors font-medium">Home</Link>
          <span>/</span>
          <Link to="/about-eaton" className="hover:text-blue-600 transition-colors font-medium">EATON</Link>
          <span>/</span>
          <span className="text-slate-900 font-bold">{groupInfo.title}</span>
        </div>

        {/* Hero Header */}
        <div className="relative rounded-3xl bg-white border border-slate-200 p-8 sm:p-10 overflow-hidden shadow-lg">
          <div className="max-w-3xl relative z-10 space-y-4">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-blue-700 font-mono font-bold">
              <Zap className="w-4 h-4 text-blue-600" />
              <span>Official Eaton Switchgear Partner · Direct Stockist</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">{groupInfo.title}</h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              Industrial switchgear, motor protection, and automation components. High reliability, global certifications, and intelligent connectivity for modern control panels.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-600 pt-2 font-medium">
              <span className="flex items-center gap-1.5 text-slate-900 font-bold">
                <ShieldCheck className="w-4 h-4 text-blue-500" />
                Original Factory Parts
              </span>
              <span>·</span>
              <span>IEC/EN 60947</span>
              <span>·</span>
              <span>Direct Warranty</span>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 items-center">
          <input
            type="text"
            placeholder="Search by part number or name..."
            className="flex-1 bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Products Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xl font-bold text-slate-900">{groupInfo.series} Products</h3>
            <span className="text-xs font-bold text-slate-500 bg-slate-200 px-3 py-1 rounded-full">{displayData.length} Variants</span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {displayData.map(product => (
              <EatonCard key={product.partNo} product={product} image={groupInfo.image} />
            ))}
          </div>

          {displayData.length === 0 && (
            <div className="text-center py-12 bg-white rounded-3xl border border-slate-200">
              <p className="text-slate-500 font-medium">No {groupInfo.series} products found matching your criteria.</p>
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
