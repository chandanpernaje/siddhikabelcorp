import React, { useState } from "react";
import { FileText } from "lucide-react";
import { RFQModal } from "./RFQModal";

export const FloatingRFQButton: React.FC = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Request for Quotation"
        className="fixed bottom-6 left-4 sm:left-6 z-50 flex items-center gap-2 px-4 py-3 rounded-full bg-red-600 text-white text-xs sm:text-sm font-bold shadow-lg hover:bg-red-700 hover:shadow-xl transition-all focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 cursor-pointer"
      >
        <FileText size={18} />
        <span>Request Quote</span>
      </button>
      <RFQModal
        isOpen={open}
        onClose={() => setOpen(false)}
        productName="General RFQ Inquiry"
      />
    </>
  );
};
