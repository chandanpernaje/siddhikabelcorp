import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { IndustriesSection } from "../components/ui/IndustriesSection";

export const Industries: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Page Banner */}
      <div className="relative bg-slate-900 pt-24 pb-16 lg:pt-32 lg:pb-24 overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent" />
        
        <div className="relative z-10 w-[95%] max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white tracking-tight mb-4">
            Industries & Solutions
          </h1>
          <div className="flex items-center justify-center gap-2 text-sm text-slate-300 font-medium">
            <Link to="/" className="hover:text-amber-400 transition-colors flex items-center gap-1">
              <Home className="w-4 h-4" /> Home
            </Link>
            <ChevronRight className="w-4 h-4 text-slate-600" />
            <span className="text-amber-500">Industries</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-white">
        <IndustriesSection />
      </div>
    </div>
  );
};
