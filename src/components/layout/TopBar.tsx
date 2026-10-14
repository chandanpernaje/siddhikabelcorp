import React from "react";
import { Phone, Mail, Facebook, Twitter, Linkedin } from "lucide-react";

export const TopBar: React.FC = () => {
  return (
    <div className="bg-zinc-600 border-b border-zinc-700 text-xs text-zinc-200 py-2 sm:py-2.5">
      <div className="w-[95%] max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Left Side: Social Icons */}
        <div className="flex items-center gap-4">
          <a href="https://www.facebook.com/siddhikabel/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" aria-label="Facebook">
            <Facebook className="w-3.5 h-3.5" />
          </a>
          <a href="https://x.com/siddhikabel" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" aria-label="Twitter">
            <Twitter className="w-3.5 h-3.5" />
          </a>
          <a href="#" className="hover:text-white transition-colors" aria-label="LinkedIn">
            <Linkedin className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Contact Info */}
        <div className="flex items-center gap-4 sm:gap-6">
          <a
            href="tel:08026720440"
            className="flex items-center gap-1.5 hover:text-white transition-colors tracking-wide"
          >
            <Phone className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span className="font-semibold">080 - 2672 0440</span>
          </a>

          <a
            href="https://mail.google.com/mail/?view=cm&fs=1&to=info@siddhikabel.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 hover:text-white transition-colors tracking-wide"
          >
            <Mail className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span className="font-semibold">info@siddhikabel.com</span>
          </a>
        </div>
      </div>
    </div>
  );
};