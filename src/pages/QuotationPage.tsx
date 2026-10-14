import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Printer,
  Download,
  Plus,
  Trash2,
  FileSpreadsheet,
  Building,
  RefreshCw,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import type { QuotationItem, QuotationDocument } from "../types";

export const QuotationPage: React.FC = () => {
  const {
    cart,
    updateQty,
    stepUpQty,
    stepDownQty,
    removeFromCart,
    clearCart,
    subtotal,
    discountRate,
    discountAmount,
    gstAmount,
    grandTotal,
    addCustomItem,
  } = useCart();
  const { user, saveQuote } = useAuth();
  const { showToast } = useToast();

  // Quotation Document Metadata
  const [quoteNo, setQuoteNo] = useState(() => `RFQ-${Date.now().toString().slice(-6)}`);
  const [quoteDate, setQuoteDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [buyerCompany, setBuyerCompany] = useState(user?.company || "Apex Automation & Switchgear Pvt Ltd");
  const [buyerName, setBuyerName] = useState(user?.name || "Purchasing Manager");
  const [buyerEmail, setBuyerEmail] = useState(user?.email || "procurement@apex-automation.in");
  const [buyerPhone, setBuyerPhone] = useState(user?.phone || "+91 98450 12345");
  const [buyerGstin, setBuyerGstin] = useState(user?.gstin || "29AABCU9603R1ZM");
  const [buyerAddress, setBuyerAddress] = useState(user?.address || "Plot 42, Peenya Industrial Area, 2nd Stage");
  const [buyerCity, setBuyerCity] = useState(user?.city || "Bangalore");
  const [buyerState, setBuyerState] = useState(user?.state || "Karnataka");
  const [isInterstate, setIsInterstate] = useState(false);
  const [poReference, setPoReference] = useState("");
  const [deliveryTerms, setDeliveryTerms] = useState("Ex-Stock Bangalore Warehouse (Dispatched in 24-48 Hours)");
  const [paymentTerms, setPaymentTerms] = useState("30 Days Credit against Approved Corporate PO");

  // New Custom Line Item State
  const [showAddLine, setShowAddLine] = useState(false);
  const [customPartNo, setCustomPartNo] = useState("");
  const [customName, setCustomName] = useState("");
  const [customBrand, setCustomBrand] = useState("LAPP KABEL");
  const [customPrice, setCustomPrice] = useState("120");
  const [customUnit, setCustomUnit] = useState("meter");
  const [customQty, setCustomQty] = useState("100");

  const handleAddCustomLine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    addCustomItem(
      {
        id: `custom-${Date.now()}`,
        name: customName,
        partNo: customPartNo || "SPEC-REQ",
        brand: customBrand,
        price: parseFloat(customPrice) || 50,
        unit: customUnit,
        hsnCode: "85444990",
      },
      parseFloat(customQty) || 1
    );

    setCustomName("");
    setCustomPartNo("");
    setShowAddLine(false);
    showToast("Added custom specification to quotation schedule", "success");
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCsv = () => {
    let csv = "Item No,Part Number,Description,Brand,Quantity,Unit,Rate (INR),Amount (INR)\n";
    cart.forEach((item, index) => {
      csv += `"${index + 1}","${item.partNo}","${item.name}","${item.brand}","${item.qty}","${item.unit}","${item.price}","${(item.price * item.qty).toFixed(2)}"\n`;
    });
    csv += `\n,,,,,Subtotal,,"${subtotal.toFixed(2)}"\n`;
    csv += `,,,,,GST 18%,,"${gstAmount.toFixed(2)}"\n`;
    csv += `,,,,,Grand Total,,"${grandTotal.toFixed(2)}"\n`;

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Quotation_${quoteNo}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Downloaded quotation schedule in CSV format", "success");
  };

  const handleSaveToPortal = () => {
    const items: QuotationItem[] = cart.map((i) => {
      const discountedPrice = i.price * (1 - discountRate);
      return {
        id: i.id,
        partNo: i.partNo,
        name: i.name,
        brand: i.brand,
        hsnCode: i.hsnCode || "85444990",
        unit: i.unit,
        qty: i.qty,
        unitPrice: discountedPrice,
        totalBeforeTax: discountedPrice * i.qty,
        gstRate: 18,
        gstAmount: discountedPrice * i.qty * 0.18,
        totalWithTax: discountedPrice * i.qty * 1.18,
      };
    });

    const doc: QuotationDocument = {
      id: quoteNo,
      quoteNo,
      date: quoteDate,
      validUntil: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      customerName: buyerName,
      companyName: buyerCompany,
      gstin: buyerGstin,
      email: buyerEmail,
      phone: buyerPhone,
      address: buyerAddress,
      city: buyerCity,
      state: buyerState,
      pincode: "560058",
      items,
      subtotal,
      cgst: isInterstate ? 0 : gstAmount / 2,
      sgst: isInterstate ? 0 : gstAmount / 2,
      igst: isInterstate ? gstAmount : 0,
      isInterstate,
      freight: 0,
      grandTotal,
      deliveryTerms,
      paymentTerms,
      status: "RFQ Submitted",
    };

    saveQuote(doc);
    clearCart();
    showToast(`RFQ ${quoteNo} submitted successfully! Our team will review and send you a formal quotation.`, "success");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-zinc-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Ambient background lighting glow */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden opacity-30">
        <div className="absolute -top-32 right-1/4 w-[500px] h-[500px] rounded-full bg-amber-500/20 blur-3xl" />
        <div className="absolute top-1/3 -left-32 w-[600px] h-[600px] rounded-full bg-blue-600/15 blur-3xl" />
        <div className="absolute -bottom-32 right-10 w-[500px] h-[500px] rounded-full bg-emerald-500/15 blur-3xl" />
      </div>

      <div className="relative z-10 w-[95%] max-w-[1920px] mx-auto space-y-8">
        {/* Breadcrumb & Navigation */}
        <div className="no-print flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Link to="/" className="hover:text-amber-400 transition-colors font-medium">
              Home
            </Link>
            <span>/</span>
            <span className="text-white font-bold">Request for Quotation (RFQ)</span>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setQuoteNo(`SE-EST-${Date.now().toString().slice(-6)}`)}
              className="px-3.5 py-2 bg-slate-900/90 hover:bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-slate-200 hover:text-white transition-all flex items-center gap-1.5 shadow-md"
              title="Generate new RFQ reference"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
              <span>New RFQ #</span>
            </button>

            <button
              onClick={handleDownloadCsv}
              disabled={cart.length === 0}
              className="px-3.5 py-2 bg-slate-900/90 hover:bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-slate-200 hover:text-white transition-all flex items-center gap-1.5 disabled:opacity-40 shadow-md"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>Export CSV</span>
            </button>



            <button
              onClick={handlePrint}
              disabled={cart.length === 0}
              className="px-4 py-2 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg disabled:opacity-40"
            >
              <Printer className="w-4 h-4" />
              <span>Print RFQ</span>
            </button>

            <button
              onClick={handleSaveToPortal}
              disabled={cart.length === 0}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-amber-500/25 disabled:opacity-40"
            >
              <Building className="w-4 h-4" />
              <span>Submit to Admin</span>
            </button>
          </div>
        </div>

        {/* Configuration Controls (Interactive Accordion for Client Details) */}
        <div className="no-print bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur-md text-white">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Building className="w-4 h-4 text-amber-400" />
                <span>Client &amp; Tax Configuration</span>
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                Customize buyer details, organization info, and freight destination.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-xs text-slate-300 font-bold flex items-center gap-2 cursor-pointer bg-slate-800/90 px-3 py-1.5 rounded-xl border border-slate-700">
                <input
                  type="checkbox"
                  checked={isInterstate}
                  onChange={(e) => setIsInterstate(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-0"
                />
                <span>Interstate Supply (18% IGST)</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="text-slate-300 block mb-1 font-bold">Buyer Organization</label>
              <input
                type="text"
                value={buyerCompany}
                onChange={(e) => setBuyerCompany(e.target.value)}
                className="w-full bg-slate-800/90 border border-slate-700 rounded-xl p-2 text-white font-medium focus:border-amber-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-slate-300 block mb-1 font-bold">Contact Officer</label>
              <input
                type="text"
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
                className="w-full bg-slate-800/90 border border-slate-700 rounded-xl p-2 text-white focus:border-amber-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-slate-300 block mb-1 font-bold">Project Site / City</label>
              <input
                type="text"
                value={buyerCity}
                onChange={(e) => setBuyerCity(e.target.value)}
                className="w-full bg-slate-800/90 border border-slate-700 rounded-xl p-2 text-white focus:border-amber-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-slate-300 block mb-1 font-bold">Project / Ref Name</label>
              <input
                type="text"
                value={poReference}
                onChange={(e) => setPoReference(e.target.value)}
                placeholder="e.g. Phase 1 Expansion"
                className="w-full bg-slate-800/90 border border-slate-700 rounded-xl p-2 text-white focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Quick Add Custom Part No to Quote */}
          <div className="mt-4 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={() => setShowAddLine((prev) => !prev)}
              className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-amber-400" />
              <span>{showAddLine ? "Hide Custom Line Form" : "+ Add Custom Item / Cable Length / Special Part"}</span>
            </button>

            <span className="text-xs text-slate-400 font-mono font-medium">
              Quote Ref: <strong className="text-white">{quoteNo}</strong>
            </span>
          </div>

          {showAddLine && (
            <form
              onSubmit={handleAddCustomLine}
              className="mt-4 p-4 rounded-2xl bg-slate-800/90 border border-slate-700 text-xs grid grid-cols-1 sm:grid-cols-6 gap-3 items-end"
            >
              <div className="sm:col-span-2">
                <label className="text-slate-300 block mb-1 font-bold">Description / Spec</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ÖLFLEX 110 CY 4G2.5 Drum"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-slate-300 block mb-1 font-bold">Part Number</label>
                <input
                  type="text"
                  placeholder="1135304"
                  value={customPartNo}
                  onChange={(e) => setCustomPartNo(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-white font-mono placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-slate-300 block mb-1 font-bold">Rate (₹/Unit)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={customPrice}
                  onChange={(e) => setCustomPrice(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-white font-mono focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-slate-300 block mb-1 font-bold">Quantity &amp; Unit</label>
                <div className="flex gap-1">
                  <input
                    type="number"
                    required
                    value={customQty}
                    onChange={(e) => setCustomQty(e.target.value)}
                    className="w-16 bg-slate-900 border border-slate-700 rounded-xl p-2 text-white font-mono focus:border-amber-500 focus:outline-none"
                  />
                  <select
                    value={customUnit}
                    onChange={(e) => setCustomUnit(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-white text-[11px] focus:border-amber-500 focus:outline-none"
                  >
                    <option value="meter">m</option>
                    <option value="piece">pc</option>
                    <option value="box">box</option>
                  </select>
                </div>
              </div>
              <div>
                <button
                  type="submit"
                  className="w-full py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-xl transition-all shadow-md shadow-amber-500/20"
                >
                  Insert Line
                </button>
              </div>
            </form>
          )}
        </div>

        {/* ======================================================== */}
        {/* OFFICIAL COMMERCIAL QUOTATION DOCUMENT (PRINT READY)      */}
        {/* ======================================================== */}
        <div className="quotation-paper bg-white text-zinc-900 rounded-3xl shadow-xl p-8 sm:p-12 border border-slate-200">
          {/* Letterhead Header with Official Siddhi Kabel Logo Lockup */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b-2 border-zinc-900 pb-8">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <img
                  src="/images/siddhi-kabel-lockup.png"
                  alt="Siddhi Kabel"
                  className="h-12 w-auto object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = "/images/siddhi-kabel-logo.png";
                  }}
                />
              </div>
            </div>
            {/* Quotation Identity Box */}
            <div className="sm:text-right bg-slate-50 border border-slate-200 rounded-2xl p-4 min-w-[240px]">
              <div className="text-xs uppercase font-bold text-slate-500 tracking-wider">
                Request for Quotation (RFQ)
              </div>
              <div className="text-xl font-black font-mono text-slate-900 mt-1">
                {quoteNo}
              </div>
              <div className="mt-3 text-xs text-slate-600 space-y-1">
                <div className="flex justify-between sm:justify-end gap-3">
                  <span className="text-slate-500">Date:</span>
                  <span className="font-bold text-slate-900">{quoteDate}</span>
                </div>
                {poReference && (
                  <div className="flex justify-between sm:justify-end gap-3">
                    <span className="text-slate-500">Project / Ref:</span>
                    <span className="font-mono text-slate-900 font-bold">{poReference}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Buyer & Consignee Information */}
            <div>
              <h4 className="font-bold text-slate-500 uppercase tracking-wider mb-2">
                Requested By:
              </h4>
              <div className="text-sm font-black text-slate-900 mb-1">{buyerCompany}</div>
              <div className="text-slate-700 leading-relaxed font-medium">
                Attn: {buyerName}<br />
                {buyerAddress}<br />
                {buyerCity}, {buyerState} - India<br />
                Phone: {buyerPhone} · Email: {buyerEmail}
              </div>
            </div>

          {/* Itemized Bill of Materials: Responsive Cards for Mobile, Full Table for Desktop & Print */}
          <div className="py-6">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-xs mb-3">
              Requested Items &amp; Specifications
            </h4>

            {cart.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-slate-300 rounded-2xl text-slate-500 text-xs">
                No active items in the quotation schedule. Please add products from the catalog or click "Add Custom Item" above.
              </div>
            ) : (
              <>
                {/* Mobile View: High-Density Responsive Product Cards (< md) */}
                <div className="block md:hidden space-y-3.5 no-print">
                  {cart.map((item, idx) => {
                    const lineTotal = item.price * item.qty;
                    const isMeter = item.unit === "meter";
                    return (
                      <div
                        key={item.id}
                        className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2.5 shadow-2xs"
                      >
                        <div className="flex items-start justify-between gap-2 min-w-0">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono mb-1">
                              <span className="bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded font-bold border border-amber-300">
                                #{idx + 1} {item.brand}
                              </span>
                              <span className="text-slate-600 font-bold truncate max-w-[140px]">
                                {item.partNo}
                              </span>
                              {item.hsnCode && (
                                <span className="text-slate-400">HSN: {item.hsnCode}</span>
                              )}
                            </div>
                            <h5 className="font-bold text-slate-900 text-xs leading-snug break-words hyphens-auto">
                              {item.name}
                            </h5>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 transition-colors shrink-0"
                            title="Delete item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Quantity Row */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-200/80">
                          <div className="flex items-center gap-1 bg-white border border-slate-300 rounded-lg p-0.5 shadow-2xs">
                            <button
                              onClick={() => stepDownQty(item.id)}
                              className="px-2 py-1 text-slate-700 hover:text-slate-900 rounded hover:bg-slate-100 font-bold text-xs flex items-center gap-0.5"
                              title={isMeter ? "Decrease by 25m" : "Decrease"}
                            >
                              - {isMeter && <span className="text-[10px] font-mono">25</span>}
                            </button>
                            <span className="px-2 font-mono font-bold text-slate-950 tabular-nums">
                              {item.qty} {item.unit}
                            </span>
                            <button
                              onClick={() => stepUpQty(item.id)}
                              className="px-2 py-1 text-slate-700 hover:text-slate-900 rounded hover:bg-slate-100 font-bold text-xs flex items-center gap-0.5"
                              title={isMeter ? "Increase by 25m (e.g. 100m -> 125m)" : "Increase"}
                            >
                              + {isMeter && <span className="text-[10px] font-mono">25</span>}
                            </button>
                          </div>
                          <div className="text-right flex-1 min-w-0 pt-1">
                            <div className="text-[10px] text-slate-500 font-mono">@ ₹{item.price.toFixed(2)}/{item.unit}</div>
                            <div className="font-mono font-black text-slate-900 tabular-nums text-sm">
                              ₹{lineTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Desktop & Official Print Table (>= md) */}
                <div className="hidden md:block print:block overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b-2 border-zinc-900 bg-slate-100 text-slate-900 font-bold uppercase tracking-wider">
                        <th className="py-2.5 px-3 w-10 text-center">#</th>
                        <th className="py-2.5 px-3">Part Number</th>
                        <th className="py-2.5 px-3">Description &amp; Specifications</th>
                        <th className="py-2.5 px-3">Brand</th>
                        <th className="py-2.5 px-3 text-center">HSN</th>
                        <th className="py-2.5 px-3 text-right">Quantity</th>
                        <th className="py-2.5 px-3 text-right">Rate (₹)</th>
                        <th className="py-2.5 px-3 text-right">Amount (₹)</th>
                        <th className="no-print py-2.5 px-2 text-center w-8"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200">
                      {cart.map((item, idx) => {
                        const lineTotal = item.price * item.qty;
                        const isMeter = item.unit === "meter";
                        return (
                          <tr key={item.id} className="hover:bg-slate-50/80">
                            <td className="py-3 px-3 text-center font-mono text-slate-500 font-medium">
                              {idx + 1}
                            </td>
                            <td className="py-3 px-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                              {item.partNo}
                            </td>
                            <td className="py-3 px-3 text-slate-800 font-bold break-words">
                              {item.name}
                            </td>
                            <td className="py-3 px-3 text-slate-600 font-bold whitespace-nowrap">
                              {item.brand}
                            </td>
                            <td className="py-3 px-3 text-center font-mono text-slate-600 whitespace-nowrap">
                              {item.hsnCode || "85444990"}
                            </td>
                            <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                              <span className="no-print mr-2 inline-flex items-center gap-1">
                                <button
                                  onClick={() => stepDownQty(item.id)}
                                  className="w-5 h-5 bg-slate-200 hover:bg-slate-300 rounded text-center leading-none flex items-center justify-center font-bold text-xs"
                                  title={isMeter ? "Decrease by 25m" : "Decrease"}
                                >
                                  -
                                </button>
                                <button
                                  onClick={() => stepUpQty(item.id)}
                                  className="w-5 h-5 bg-slate-200 hover:bg-slate-300 rounded text-center leading-none flex items-center justify-center font-bold text-xs"
                                  title={isMeter ? "Increase by 25m (e.g. 100m -> 125m)" : "Increase"}
                                >
                                  +
                                </button>
                              </span>
                              {item.qty} {item.unit}
                            </td>
                            <td className="py-3 px-3 text-right font-mono text-slate-700 whitespace-nowrap">
                              ₹{item.price.toFixed(2)}
                            </td>
                            <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                              ₹{lineTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                            </td>
                            <td className="no-print py-3 px-2 text-center">
                              <button
                                onClick={() => removeFromCart(item.id)}
                                className="text-slate-400 hover:text-rose-600 transition-colors"
                                title="Delete line"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Financial Summary */}
                <div className="mt-6 flex flex-col md:flex-row justify-between items-start gap-8">
                  {/* Terms & Bank Details */}
                  <div className="w-full md:w-1/2 space-y-6">
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2 border-b-2 border-slate-200 pb-1">
                        Dispatch & Commercial Terms:
                      </h4>
                      <ul className="text-[11px] text-slate-700 space-y-1 font-medium leading-relaxed">
                        <li><span className="font-bold text-slate-900">Delivery Point:</span> {buyerCity} Site / Bangalore Dispatch</li>
                        <li><span className="font-bold text-slate-900">Lead Time:</span> Ex-Stock Bangalore Warehouse (Dispatched in 24-48 Hours)</li>
                        <li><span className="font-bold text-slate-900">Payment:</span> 30 Days Credit against Approved Corporate PO</li>
                        <li><span className="font-bold text-slate-900">Freight:</span> To Pay / Extra at Actuals to Site</li>
                        <li><span className="font-bold text-slate-900">Validity:</span> 30 Days from Issue</li>
                      </ul>
                    </div>
                  </div>

                  {/* Calculations */}
                  <div className="w-full md:w-[320px] shrink-0 border border-slate-300 rounded-2xl p-4 bg-slate-50">
                    <div className="space-y-2 text-xs">
                      {discountAmount > 0 && (
                        <div className="flex justify-between items-center text-slate-600">
                          <span>Gross Material Value</span>
                          <span className="font-mono tabular-nums">₹{(subtotal + discountAmount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                        </div>
                      )}
                      {discountAmount > 0 && (
                        <div className="flex justify-between items-center text-amber-700 font-bold">
                          <span>OEM Discount ({(discountRate * 100).toFixed(0)}%)</span>
                          <span className="font-mono tabular-nums">- ₹{discountAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center font-bold text-slate-900">
                        <span>Taxable Value</span>
                        <span className="font-mono tabular-nums">₹{subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                      </div>
                      
                      {isInterstate ? (
                        <div className="flex justify-between items-center text-slate-600 pt-2 border-t border-slate-200">
                          <span>IGST (18%)</span>
                          <span className="font-mono tabular-nums">₹{gstAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                        </div>
                      ) : (
                        <>
                          <div className="flex justify-between items-center text-slate-600 pt-2 border-t border-slate-200">
                            <span>CGST (9%)</span>
                            <span className="font-mono tabular-nums">₹{(gstAmount / 2).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                          </div>
                          <div className="flex justify-between items-center text-slate-600">
                            <span>SGST (9%)</span>
                            <span className="font-mono tabular-nums">₹{(gstAmount / 2).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                          </div>
                        </>
                      )}
                      
                      <div className="flex justify-between items-end pt-3 mt-3 border-t-2 border-zinc-900 text-sm font-black text-slate-900">
                        <span className="uppercase tracking-wider">Grand Total</span>
                        <span className="font-mono tabular-nums text-lg">₹{grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-12 flex justify-between items-end">
                  <div className="text-[10px] text-slate-500 max-w-sm">
                    This is a system generated commercial quotation and does not require a physical signature. 
                    <br />E. & O.E. Subject to Bangalore Jurisdiction.
                  </div>
                  <div className="text-center space-y-1">
                    <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-8">
                      Authorized Signatory
                    </div>
                    <div className="font-black text-slate-900 border-t border-slate-300 pt-1">
                      SIDDHI KABEL CORPORATION
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>



        </div>
      </div>
    </div>
  );
};
