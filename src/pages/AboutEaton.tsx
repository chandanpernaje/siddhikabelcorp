import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  FileSpreadsheet,
  ArrowRight,
} from "lucide-react";
import { RFQModal } from "../components/ui/RFQModal";

export const AboutEaton: React.FC = () => {
  const [rfqTopic, setRfqTopic] = useState<string | null>(null);

  const productRanges = [
    {
      id: "eaton-01",
      title: "PKZM0 Motor-Protective Circuit-Breakers",
      desc: "Rotary switch motor protection with overload and short-circuit protection up to 150 kA. Phase failure sensitive.",
      img: "/images/eaton-pkzm0.jpg",
      topic: "EATON PKZM0 MOTOR BREAKERS",
    },
    {
      id: "eaton-02",
      title: "DILM Power Contactors (7A to 1600A)",
      desc: "Robust 3-pole and 4-pole contactors with electronic coils, low holding power, and SmartWire-DT connectivity.",
      img: "/images/eaton-dilm.jpg",
      topic: "EATON DILM CONTACTORS",
    },
    {
      id: "eaton-03",
      title: "NZM Compact Molded Case Circuit Breakers",
      desc: "4 frame sizes from 20A to 1600A with electronic trip units, onboard energy metering, and USB diagnostic access.",
      img: "/images/eaton-nzm.jpg",
      topic: "EATON NZM MCCB",
    },
    {
      id: "eaton-04",
      title: "FAZ DIN-Rail Miniature Circuit Breakers",
      desc: "High performance 10kA and 15kA breaking capacity MCBs with dual-purpose terminals and captive screws.",
      img: "/images/eaton-faz.jpg",
      topic: "EATON FAZ MCB",
    },
    {
      id: "eaton-05",
      title: "RMQ-Titan 22mm Pilot Devices & Pushbuttons",
      desc: "IP67/IP69K operator controls with laser inscription, customizable LED illumination, and ergonomic actuation.",
      img: "/images/eaton-rmq.jpg",
      topic: "EATON RMQ-TITAN PUSHBUTTONS",
    },
    {
      id: "eaton-06",
      title: "PowerXL Variable Frequency Drives",
      desc: "Compact VFDs and soft starters for energy-efficient motor control and pump applications in harsh environments.",
      img: "/images/eaton-drives.jpg",
      topic: "EATON VARIABLE FREQUENCY DRIVES",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 text-slate-900">
      <div className="w-[95%] max-w-[1920px] mx-auto space-y-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Link to="/" className="hover:text-blue-600 transition-colors font-medium">
            Home
          </Link>
          <span>/</span>
          <span className="text-blue-700 font-bold">Authorized Brands</span>
          <span>/</span>
          <span className="text-slate-900 font-bold">EATON - Moeller Switchgear</span>
        </div>

        {/* Hero Card */}
        <div className="rounded-3xl bg-gradient-to-br from-blue-50 via-white to-blue-50/30 border-blue-200/60 shadow-blue-500/10 p-8 sm:p-12 relative overflow-hidden shadow-lg">
          <div className="max-w-3xl space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="/images/logo-eaton.png"
                alt="Eaton Logo"
                className="h-10 object-contain bg-slate-50 p-1.5 rounded-xl border border-slate-100"
              />
              <span className="text-xs uppercase font-mono text-blue-700 font-bold bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
                Germany / USA · Tier-1 Distribution Partner
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              EATON - Moeller Switchgear
            </h1>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Global power management company providing energy-efficient solutions to manage electrical power safely, reliably and sustainably. Siddhi Kabel is an authorized stocking distributor for Eaton Moeller motor protection, DILM contactors, and NZM circuit breakers.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-3">
              <button
                onClick={() => setRfqTopic("EATON COMPLETE SWITCHGEAR BOM")}
                className="px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors flex items-center gap-2 shadow-sm"
              >
                <span>Request Switchgear Quotation</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <Link
                to="/quotation"
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 font-bold text-xs rounded-xl transition-colors flex items-center gap-2"
              >
                <FileSpreadsheet className="w-4 h-4 text-blue-500" />
                <span>Go to Quotation Builder</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Product Ranges */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Eaton Moeller Core Series
            </h2>
            <span className="text-xs text-slate-500 font-mono font-medium">
              6 Core Automation Lines
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {productRanges.map((cat, idx) => (
              <div
                key={idx}
                className="group relative flex flex-col rounded-3xl h-full bg-white border border-slate-200 hover:border-blue-400 transition-all duration-300 hover:-translate-y-1.5 shadow-sm hover:shadow-xl overflow-hidden cursor-pointer"
                onClick={() => setRfqTopic(cat.topic)}
              >
                <div className="relative aspect-[4/3] bg-blue-50/50 flex items-center justify-center p-2 sm:p-4 overflow-hidden border-b border-slate-200/70">
                  <img
                    src={cat.img}
                    alt={cat.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain p-1 sm:p-2 group-hover:scale-108 transition-transform duration-500 ease-out drop-shadow-sm"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = "/images/promo-eaton.jpg";
                    }}
                  />
                </div>

                <div className="flex flex-col flex-1 p-3 sm:p-4 items-center text-center justify-center space-y-2">
                  <div>
                    <span className="px-2.5 py-1 rounded-lg border text-[10px] sm:text-[11px] tracking-wider uppercase font-bold bg-slate-100 text-slate-700 border-slate-200">
                      EATON
                    </span>
                  </div>
                  
                  <h4 className="text-[12px] sm:text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                    {cat.title}
                  </h4>
                </div>
              </div>
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
