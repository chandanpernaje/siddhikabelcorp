import React, { useState } from "react";
import { RFQModal } from "../ui/RFQModal";
import { Link } from "react-router-dom";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  ShieldCheck,
  FileText,
  Facebook,
  Twitter,
  Linkedin
} from "lucide-react";

export const Footer: React.FC = () => {
  const [rfqModalOpen, setRfqModalOpen] = useState(false);

  return (
    <footer id="contact" className="bg-sky-50 border-t border-sky-100 text-slate-600 text-xs">

      {/* Main Footer Links */}
      <div className="w-[95%] max-w-[1920px] mx-auto py-14 px-4 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
        {/* Col 1: Identity */}
        <div className="lg:col-span-2 space-y-4">
          <Link to="/" className="inline-block">
            <img
              src="/images/siddhi-kabel-lockup.png"
              alt="Siddhi Kabel"
              className="h-10 w-auto object-contain"
            />
          </Link>

          <p className="text-slate-600 leading-relaxed max-w-sm">
            Siddhi Kabel Corporation Private Limited is one of the leading and reliable suppliers of world class Industrial Electrical, Automation & Safety Products with over 15 years of industry experience.
          </p>
          
          <div className="flex items-center gap-3 pt-2">
            <a href="https://www.facebook.com/siddhikabel/" target="_blank" rel="noopener noreferrer" className="p-2 bg-white text-slate-500 hover:text-white hover:bg-[#1877F2] rounded-full transition-all border border-slate-200 hover:border-[#1877F2] shadow-sm" aria-label="Facebook">
              <Facebook className="w-4 h-4" />
            </a>
            <a href="https://x.com/siddhikabel" target="_blank" rel="noopener noreferrer" className="p-2 bg-white text-slate-500 hover:text-white hover:bg-slate-900 rounded-full transition-all border border-slate-200 hover:border-slate-900 shadow-sm" aria-label="Twitter">
              <Twitter className="w-4 h-4" />
            </a>
            <a href="#" className="p-2 bg-white text-slate-500 hover:text-white hover:bg-[#0A66C2] rounded-full transition-all border border-slate-200 hover:border-[#0A66C2] shadow-sm" aria-label="LinkedIn">
              <Linkedin className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Col 2: Brand Portfolios */}
        <div className="space-y-3">
          <h4 className="text-slate-900 font-semibold text-sm tracking-wide">
            Authorized Brands
          </h4>
          <ul className="space-y-2">
            <li>
              <Link to="/about-lapp" onClick={() => window.scrollTo(0, 0)} className="hover:text-blue-400 transition-colors">
                LAPP Kabel Stuttgart
              </Link>
            </li>
            <li>
              <Link to="/about-eaton" onClick={() => window.scrollTo(0, 0)} className="hover:text-blue-400 transition-colors">
                EATON Moeller Switchgear
              </Link>
            </li>
            <li>
              <Link to="/about-mennekes" onClick={() => window.scrollTo(0, 0)} className="hover:text-blue-400 transition-colors">
                MENNEKES Industrial Plugs
              </Link>
            </li>
            <li>
              <Link to="/about-partex" onClick={() => window.scrollTo(0, 0)} className="hover:text-blue-400 transition-colors">
                PARTEX Marking Systems
              </Link>
            </li>
            <li>
              <Link to="/olflex-cables" onClick={() => window.scrollTo(0, 0)} className="hover:text-blue-400 transition-colors">
                ÖLFLEX® Cable Center
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 3: Product Categories */}
        <div className="space-y-3">
          <h4 className="text-slate-900 font-semibold text-sm tracking-wide">
            Product Catalogs
          </h4>
          <ul className="space-y-2">
            <li>
              <a href="/#catalog" className="hover:text-blue-400 transition-colors">
                ÖLFLEX® Flexible Control Cables
              </a>
            </li>
            <li>
              <a href="/#catalog" className="hover:text-blue-400 transition-colors">
                Industrial Ethernet &amp; PROFINET
              </a>
            </li>
            <li>
              <a href="/#catalog" className="hover:text-blue-400 transition-colors">
                CEE 16A/32A Watertight Plugs
              </a>
            </li>
            <li>
              <a href="/#catalog" className="hover:text-blue-400 transition-colors">
                Motor Starters &amp; Contactors
              </a>
            </li>
            <li>
              <a href="/#catalog" className="hover:text-blue-400 transition-colors">
                SKINTOP® Cable Gland Systems
              </a>
            </li>
            
          </ul>
        </div>

        {/* Col 4: Corporate Contact */}
        <div className="space-y-4">
          <h4 className="text-slate-900 font-bold text-sm tracking-wide">
            Head Office
          </h4>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-rose-400 shrink-0 mt-1" />
              <div className="flex flex-col">
                <span className="font-semibold text-slate-700">Siddhi Kabel Corporation Private Limited</span>
                <span>No.3, 1st Main Road, 1st Block,</span>
                <span>Banashankari 3rd Stage,</span>
                <span>Bangalore 560 085.</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <a href="tel:08026720440" className="font-semibold text-slate-700 hover:text-rose-400 transition-colors">080 - 2672 0440</a>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1.5">
                <div className="flex flex-col">
                  <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">Information</span>
                  <a href="https://mail.google.com/mail/?view=cm&fs=1&to=info@siddhikabel.com" target="_blank" rel="noopener noreferrer" className="hover:text-rose-400 transition-colors">info@siddhikabel.com</a>
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">Sales</span>
                  <a href="tel:+919620000947" className="hover:text-rose-400 transition-colors">096200 00947</a>
                  <a href="tel:+919886058511" className="hover:text-rose-400 transition-colors">098860 58511</a>
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">Enquiry</span>
                  <a href="https://mail.google.com/mail/?view=cm&fs=1&to=enquiry@siddhikabel.com" target="_blank" rel="noopener noreferrer" className="hover:text-rose-400 transition-colors">enquiry@siddhikabel.com</a>
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3 text-slate-600">
              <Clock className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex flex-col">
                <span>Mon - Fri: 9:30 AM - 6:30 PM</span>
                <span>Sat: 9:30 AM - 5:00 PM</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Legal bar */}
      <div className="border-t border-sky-100 bg-sky-100/50 py-6 px-4 lg:px-8">
        <div className="w-[95%] max-w-[1920px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
          <div>
            &copy; {new Date().getFullYear()} Siddhi Kabel Corporation. All Rights Reserved. ÖLFLEX®, UNITRONIC®, SKINTOP® are registered trademarks of LAPP Group.
          </div>
          <div className="flex items-center gap-6">
            <Link to="/#about" className="hover:text-slate-700 transition-colors">
              Privacy Policy
            </Link>
            <Link to="/#about" className="hover:text-slate-700 transition-colors">
              Terms of Supply
            </Link>
            <Link to="/quotation" className="hover:text-slate-700 transition-colors">
              B2B Quotations
            </Link>
          </div>
        </div>
      </div>

      <RFQModal
        isOpen={rfqModalOpen}
        onClose={() => setRfqModalOpen(false)}
        productName="General RFQ Inquiry"
      />
    </footer>
  );
};