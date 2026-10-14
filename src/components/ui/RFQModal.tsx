import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  X,
  Upload,
  Paperclip,
  CheckCircle2,
  FileSpreadsheet,
  Building,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { useCart } from "../../context/CartContext";
import type { QuotationDocument, QuotationItem } from "../../types";
import { validateRFQForm } from "../../utils/validation";

interface RFQModalProps {
  productName: string | null;
  productPrice?: number | null;
  isOpen: boolean;
  onClose: () => void;
}

export const RFQModal: React.FC<RFQModalProps> = ({
  productName,
  productPrice,
  isOpen,
  onClose,
}) => {
  const { user, saveQuote } = useAuth();
  const { showToast } = useToast();
  const { cart, clearCart, subtotal: cartSubtotal, gstAmount: cartGstAmount, grandTotal: cartGrandTotal, discountRate } = useCart();
  const navigate = useNavigate();

  const [company, setCompany] = useState(user?.company || "Apex Automation & Switchgear");
  const [name, setName] = useState(user?.name || "Procurement Manager");
  const [email, setEmail] = useState(user?.email || "procurement@apex-automation.in");
  const [phone, setPhone] = useState(user?.phone || "+91 98450 12345");
  const [gstin, setGstin] = useState(user?.gstin || "29AABCU9603R1ZM");
  const [city, setCity] = useState(user?.city || "Bangalore");
  const [quantity, setQuantity] = useState("As per BOM/Cart");
  const [unit, setUnit] = useState("lots");
  const [notes, setNotes] = useState("");
  const [files, setFiles] = useState<{ name: string; size: number }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [generatedQuoteNo, setGeneratedQuoteNo] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const isCartRequest = cart.length > 0 || productName === "Bulk Project Bill of Materials";

  React.useEffect(() => {
    if (isOpen) {
      if (isCartRequest && cart.length > 0) {
        const cartList = cart.map(item => `- ${item.name} [Part: ${item.partNo}] (Qty: ${item.qty} ${item.unit})`).join("\n");
        setNotes(`Requesting official quotation for the following items selected in my cart:\n\n${cartList}\n\nPlease provide formal commercial quotation with lead times.`);
      } else {
        setNotes(
          productName && !isCartRequest
            ? `Please provide formal commercial GST quotation for ${productName} with Bangalore warehouse dispatch timeline and factory test reports.`
            : "Please provide official GST quotation for project schedule requirements."
        );
      }
    }
  }, [isOpen, isCartRequest, cart, productName]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map((f) => ({
        name: f.name,
        size: f.size,
      }));
      setFiles((prev) => [...prev, ...newFiles]);
      showToast(`Attached ${newFiles.length} file(s) to RFQ`, "info");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    const validation = validateRFQForm({
      company,
      name,
      email,
      phone,
      city,
      quantity,
      gstin,
    });

    if (!validation.isValid) {
      setFieldErrors(validation.errors);
      showToast(Object.values(validation.errors)[0] || "Please fix validation errors", "error");
      return;
    }

    setIsSubmitting(true);

    const quoteId = `SE-RFQ-${Date.now().toString().slice(-6)}`;
    setGeneratedQuoteNo(quoteId);

    let finalItems: QuotationItem[] = [];
    let finalSubtotal = 0;
    let finalGst = 0;
    let finalTotal = 0;

    if (isCartRequest && cart.length > 0) {
      finalItems = cart.map((i) => {
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
      finalSubtotal = cartSubtotal;
      finalGst = cartGstAmount;
      finalTotal = cartGrandTotal;
    } else {
      const parsedQty = parseFloat(quantity);
      const qtyNum = isNaN(parsedQty) ? 1 : parsedQty;
      const estPrice = productPrice || 75.0;
      finalSubtotal = qtyNum * estPrice;
      finalGst = finalSubtotal * 0.18;
      finalTotal = finalSubtotal + finalGst;

      finalItems = [{
        id: `item-${Date.now()}`,
        partNo: "RFQ-CUSTOM",
        name: productName || "General RFQ Inquiry",
        brand: "LAPP / EATON / MENNEKES",
        hsnCode: "85444990",
        unit: unit,
        qty: qtyNum,
        unitPrice: estPrice,
        totalBeforeTax: finalSubtotal,
        gstRate: 18,
        gstAmount: finalGst,
        totalWithTax: finalTotal,
      }];
    }

    const doc: QuotationDocument = {
      id: quoteId,
      quoteNo: quoteId,
      date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      validUntil: new Date(Date.now() + 30 * 86400000).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      customerName: name,
      companyName: company,
      gstin: gstin,
      email: email,
      phone: phone,
      address: "Industrial Complex, Phase II",
      city: city,
      state: "Karnataka",
      pincode: "560058",
      items: finalItems,
      subtotal: finalSubtotal,
      cgst: finalGst / 2,
      sgst: finalGst / 2,
      igst: 0,
      isInterstate: false,
      freight: 0,
      grandTotal: finalTotal,
      deliveryTerms: "Ex-Stock Bangalore Central Warehouse (24-48 hrs)",
      paymentTerms: "30 Days Credit against Approved Corporate PO",
      status: "Generated",
      notes: notes,
    };

    saveQuote(doc);
    if (isCartRequest) {
      clearCart();
    }

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      showToast("Quotation request submitted successfully.", "success");
    }, 600);
  };

  const handleViewQuotation = () => {
    onClose();
    navigate("/quotation");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200 text-slate-900">
        {/* Subtle accent glow */}
        <div aria-hidden="true" className="absolute top-0 right-0 w-96 h-96 rounded-full bg-slate-100 blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0 relative z-10">
          <div className="flex items-center gap-2.5">
            <FileSpreadsheet className="w-5 h-5 text-slate-500" />
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Request Formal Quotation (RFQ)
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {isCartRequest ? `Submitting quote request for ${cart.length} items from cart` : (productName ? `Inquiry for: ${productName}` : "Submit Project Bill of Materials for B2B Pricing")}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center space-y-4 relative z-10">
            <div className="w-14 h-14 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">
              Quotation Request Received!
            </h4>
            <div className="inline-block bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-xl font-mono text-sm text-emerald-800 font-bold shadow-sm">
              Reference Quote #: {generatedQuoteNo}
            </div>
            <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed font-medium">
              We have received your quotation request. Our engineering sales desk will review your requirements and dispatch an official quotation to <span className="text-slate-900 font-bold">{email}</span>.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={handleViewQuotation}
                className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition-all"
              >
                Open Quotation Document &amp; Print PDF
              </button>
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-5 py-2.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl transition-colors shadow-sm"
              >
                Close Window
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs overflow-y-auto relative z-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Company / Corporate Name *
                </label>
                <div className="relative">
                  <Building className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. Apex Automation Pvt Ltd"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white font-medium transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Contact Person *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Purchasing / Project Engineer"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white font-medium transition-colors"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Official Business Email *
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="procurement@company.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white font-medium transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Mobile / WhatsApp Number *
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white font-mono font-bold transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Delivery Site City *
                </label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Bangalore, Chennai, Hyderabad..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white font-medium transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Quantity and Requirement */}
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="block text-slate-700 font-bold mb-1">
                  Estimated Quantity *
                </label>
                <input
                  type="text"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="e.g. 500"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white font-mono font-bold transition-colors"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Unit
                </label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-400 font-semibold transition-colors [&>option]:bg-white"
                >
                  <option value="meters">Meters</option>
                  <option value="pieces">Pieces / Units</option>
                  <option value="boxes">Boxes / Packs</option>
                  <option value="lots">Complete BOM Lot</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Specification Notes / Cable Sizes / Part Numbers
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Mention specific cable cores, cross section, coil lengths, or switchgear ratings..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white leading-relaxed font-medium transition-colors"
              />
            </div>

            {/* Attachment Dropzone */}
            <div>
              <label className="block text-slate-700 font-bold mb-1 flex items-center justify-between">
                <span>Attach BOM / Schedule (Excel, PDF, Drawing)</span>
                <span className="text-[11px] text-slate-500 font-normal">Up to 25MB</span>
              </label>
              <label className="border border-dashed border-slate-300 hover:border-slate-400 bg-slate-50 hover:bg-slate-100 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors text-center">
                <Upload className="w-5 h-5 text-slate-400 mb-1" />
                <span className="text-slate-700 font-bold">Click to browse or drop Bill of Materials</span>
                <span className="text-[11px] text-slate-500 font-medium">Supported: .xlsx, .csv, .pdf, .dwg, .jpg</span>
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              {files.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {files.map((f, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-medium"
                    >
                      <Paperclip className="w-3 h-3 text-slate-500" />
                      <span className="max-w-[150px] truncate">{f.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all disabled:opacity-50"
              >
                {isSubmitting ? "Submitting Request..." : "Submit Quotation Request"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
