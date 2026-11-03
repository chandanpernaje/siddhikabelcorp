import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  FileSpreadsheet,
  ArrowRight,
} from "lucide-react";
import { RFQModal } from "../components/ui/RFQModal";

export const AboutPartex: React.FC = () => {
  const [rfqTopic, setRfqTopic] = useState<string | null>(null);

  const productRanges = [
    {
      id: "partex-01",
      group: "pa",
      link: "/partex-products?group=pa",
      title: "PA Closed Chevron Wire Markers",
      desc: "Interlocking chevron cut ensures markers stay firmly locked and aligned in line. Self-extinguishing PVC to UL94-V0.",
      img: "/images/partex-pa.jpg",
      topic: "PARTEX PA CHEVRON WIRE MARKERS",
    },
    {
      id: "partex-02",
      group: "promark",
      link: "/partex-products?group=promark",
      title: "ProMark T-1000 Thermal Transfer Printer",
      desc: "Compact high-speed marking printer for profiles, heat shrink tubing, and continuous label tapes. 40mm/sec.",
      img: "/images/partex-promark.jpg",
      topic: "PARTEX PROMARK T-1000 PRINTER KIT",
    },
    {
      id: "partex-03",
      group: "po",
      link: "/partex-products?group=po",
      title: "PO & POZ Oval Marker Sleeves",
      desc: "Flexible oval profile designed to conform smoothly over individual wire cores. Halogen-free ZEROHEX version available.",
      img: "/images/partex-po.jpg",
      topic: "PARTEX PO SLEEVES",
    },
    {
      id: "partex-04",
      group: "pc",
      link: "/partex-products?group=pc",
      title: "PC Open-End Snap-On Wire Markers",
      desc: "Fast clip-on installation onto terminated wires and cables without disconnecting the terminal connections.",
      img: "/images/partex-pc.jpg",
      topic: "PARTEX PC SNAP-ON MARKERS",
    },
    {
      id: "partex-05",
      group: "pks",
      link: "/partex-products?group=pks",
      title: "PKS Stainless Steel Embossed Markers",
      desc: "Acid-proof AISI 316 stainless steel cable identification tags for aggressive offshore, chemical, and nuclear environments.",
      img: "/images/partex-pks.jpg",
      topic: "PARTEX PKS STAINLESS STEEL MARKERS",
    },
    {
      id: "partex-06",
      group: "ties",
      link: "/partex-products?group=ties",
      title: "Heavy Duty Cable Ties & Mounts",
      desc: "Polyamide 6.6 and stainless steel cable ties with rounded edges to prevent wire jacket cut-through.",
      img: "/images/partex-ties.jpg",
      topic: "PARTEX CABLE TIES",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 text-slate-900">
      <div className="w-[95%] max-w-[1920px] mx-auto space-y-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Link to="/" className="hover:text-emerald-600 transition-colors font-medium">
            Home
          </Link>
          <span>/</span>
          <span className="text-emerald-700 font-bold">Authorized Brands</span>
          <span>/</span>
          <span className="text-slate-900 font-bold">PARTEX Sweden</span>
        </div>

        {/* Hero Card */}
        <div className="rounded-3xl bg-gradient-to-br from-emerald-50 via-white to-emerald-50/30 border-emerald-200/60 shadow-emerald-500/10 p-8 sm:p-12 relative overflow-hidden shadow-lg">
          <div className="max-w-3xl space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="/images/logo-partex.png"
                alt="Partex Logo"
                className="h-10 object-contain bg-slate-50 p-1.5 rounded-xl border border-slate-100"
              />
              <span className="text-xs uppercase font-mono text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                Gullspång, Sweden · Official Marking Partner
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              PARTEX Marking Systems
            </h1>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Industrial cable, wire and component marking systems engineered in Sweden since 1948. Complete marking solutions trusted by control panel builders, switchgear OEMs, telecom installations, and electrical contractors worldwide.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-3">
              <Link
                to="/partex-products?group=pa"
                className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-900 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-zinc-500/25 flex items-center gap-2"
              >
                <span>Browse Partex Catalog</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                onClick={() => setRfqTopic("PARTEX FREE SAMPLE KIT")}
                className="px-5 py-2.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 font-bold text-xs uppercase tracking-wider rounded-xl transition-colors flex items-center gap-2 shadow-sm"
              >
                <span>Request Free Sample Marking Kit</span>
              </button>
              <Link
                to="/quotation"
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 font-bold text-xs rounded-xl transition-colors flex items-center gap-2"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                <span>Go to Quotation Builder</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Product Ranges */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Partex Marking Solutions Catalog
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium pt-1">
                Click any series below to explore all catalog models, specifications, and request tailored quotes.
              </p>
            </div>
            <span className="text-xs text-slate-500 font-mono font-medium hidden sm:block">
              Swedish Precision Identification
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {productRanges.map((cat, idx) => (
              <Link
                key={idx}
                to={cat.link}
                className="group relative flex flex-col rounded-3xl h-full bg-white border border-slate-200 hover:border-zinc-400 transition-all duration-300 hover:-translate-y-1.5 shadow-sm hover:shadow-xl overflow-hidden cursor-pointer"
              >
                <div className="relative aspect-[4/3] bg-zinc-50/50 flex items-center justify-center p-2 sm:p-4 overflow-hidden border-b border-slate-200/70">
                  <img
                    src={cat.img}
                    alt={cat.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain p-1 sm:p-2 group-hover:scale-108 transition-transform duration-500 ease-out drop-shadow-sm"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = "/images/promo-partex.jpg";
                    }}
                  />
                </div>

                <div className="flex flex-col flex-1 p-3 sm:p-4 items-center text-center justify-between space-y-2">
                  <div className="space-y-1.5">
                    <div>
                      <span className="px-2.5 py-1 rounded-lg border text-[10px] sm:text-[11px] tracking-wider uppercase font-bold bg-slate-100 text-slate-700 border-slate-200">
                        PARTEX
                      </span>
                    </div>
                    
                    <h4 className="text-[12px] sm:text-sm font-bold text-slate-900 group-hover:text-zinc-700 transition-colors line-clamp-2 leading-snug">
                      {cat.title}
                    </h4>
                  </div>

                  <span className="text-[11px] font-bold text-zinc-700 flex items-center gap-1 group-hover:translate-x-1 transition-transform pt-1">
                    View Catalog <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <RFQModal
          productName={rfqTopic}
          isOpen={!!rfqTopic}
          onClose={() => setRfqTopic(null)}
        />
      </div>
    </div>
  );
};
