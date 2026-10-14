import React from "react";
import { Zap, CheckCircle2, Shield, Truck, Award } from "lucide-react";

export const AnnouncementTicker: React.FC = () => {
  const items = [
    { icon: Shield, text: "Authorized Stockist: LAPP Kabel Stuttgart · 100% Genuine Test Certs" },
    { icon: Truck, text: "Central Bangalore Hub: 25,000+ Meters Ready Stock in South India" },
    { icon: Award, text: "EATON Moeller Intelligent Switchgear · Direct Factory Box Pricing" },
    { icon: Zap, text: "MENNEKES Germany IP44/IP67 Plugs & Sockets · Heavy Duty OEM Solutions" },
    { icon: CheckCircle2, text: "PARTEX Sweden Cable Identification · ProMark T-1000 Systems" },
    { icon: Shield, text: "Instant GST Proforma & Commercial Quotes with Delivery Commitments" },
  ];

  return (
    <div className="bg-slate-100 border-b border-slate-200 text-slate-800 font-medium py-2 overflow-hidden select-none">
      <div className="flex w-max items-center animate-marquee space-x-10 text-xs">
        {[...items, ...items].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="flex items-center gap-2 whitespace-nowrap">
              <Icon className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>{item.text}</span>
              <span className="text-slate-400 font-mono pl-6">★</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
