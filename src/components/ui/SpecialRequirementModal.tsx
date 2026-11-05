import React, { useState, useEffect } from 'react';
import { 
  X, FileText, Building, User, Mail, Phone, 
  CheckCircle2, ShieldCheck, Send, Layers, HelpCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { API_BASE_URL } from '../../config/api';

interface SpecialRequirementModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Optional for backward compatibility, but intentionally NOT linked to any product
  productName?: string;
  partNo?: string;
}

export const SpecialRequirementModal: React.FC<SpecialRequirementModalProps> = ({
  isOpen,
  onClose
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [itemType, setItemType] = useState('');
  const [quantityOrLength, setQuantityOrLength] = useState('');
  const [specifications, setSpecifications] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Auto-fill customer contact details from logged-in session if available
  useEffect(() => {
    if (user) {
      if (user.name) setName(user.name);
      if (user.company) setCompanyName(user.company);
      if (user.phone) setPhone(user.phone);
      if (user.email) setEmail(user.email);
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim() || !companyName.trim() || !phone.trim() || !email.trim() || !specifications.trim()) {
      setErrorMsg('Please fill in all required fields marked with *');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Build comprehensive requirement payload without tying to any specific database product
      const requirementParts: string[] = [];
      if (itemType.trim()) {
        requirementParts.push(`Product / Item Type: ${itemType.trim()}`);
      }
      if (quantityOrLength.trim()) {
        requirementParts.push(`Required Length / Quantity: ${quantityOrLength.trim()}`);
      }
      requirementParts.push(`Specifications & Requirements:\n${specifications.trim()}`);

      const fullRequirement = requirementParts.join('\n\n');

      const response = await fetch(`${API_BASE_URL}/api/custom-cutting`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          companyName: companyName.trim(),
          phone: phone.trim(),
          email: email.trim(),
          requirement: fullRequirement,
          // Intentionally blank / not linked to any particular product or part number
          productName: null,
          partNo: null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSuccess(true);
        setRequestId(data.request?._id || `ENQ-${Date.now().toString().slice(-6)}`);
        showToast('Enquiry submitted successfully!', 'success');
      } else {
        setErrorMsg(data.error || 'Failed to submit enquiry. Please try again.');
        showToast(data.error || 'Submission failed', 'error');
      }
    } catch (err: any) {
      console.error('General enquiry submission error:', err);
      setErrorMsg('Network error. Unable to contact enquiry desk.');
      showToast('Network error while submitting enquiry', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setIsSuccess(false);
    setRequestId(null);
    setErrorMsg('');
    setItemType('');
    setQuantityOrLength('');
    setSpecifications('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" 
        onClick={handleResetAndClose} 
      />

      <div className="relative w-full max-w-xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200 text-slate-900">
        
        {/* Header - Simple, clean, neutral enquiry header */}
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-slate-50 via-slate-100/50 to-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-md shadow-slate-900/20 shrink-0">
              <FileText className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                Custom Product Requirements Enquiry
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Describe non-standard requirements, special cable lengths, sizes or specifications
              </p>
            </div>
          </div>
          <button
            onClick={handleResetAndClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200/80 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success View */}
        {isSuccess ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-sm animate-in zoom-in duration-300">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            
            <div className="space-y-1">
              <h4 className="text-xl font-bold text-slate-900">
                Enquiry Submitted Successfully!
              </h4>
              <p className="text-xs text-slate-500 font-medium">
                Our technical sales team has received your custom requirements.
              </p>
            </div>

            {requestId && (
              <div className="inline-block bg-slate-100 border border-slate-200 px-4 py-2 rounded-xl font-mono text-xs text-slate-800 font-bold">
                Enquiry Reference ID: <span className="text-red-700">{requestId}</span>
              </div>
            )}

            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-xs text-emerald-900 text-left space-y-2">
              <div className="flex items-center gap-2 font-bold text-emerald-950">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>What happens next?</span>
              </div>
              <p className="leading-relaxed text-emerald-800">
                1. Our engineering desk will review your specifications and verify feasibility for <strong>{companyName}</strong>.
              </p>
              <p className="leading-relaxed text-emerald-800">
                2. A customized quotation and technical response will be sent to <strong>{email}</strong> or contacted on <strong>{phone}</strong> within 24 hours.
              </p>
            </div>

            <div className="pt-3">
              <button
                onClick={handleResetAndClose}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                Close &amp; Continue Browsing
              </button>
            </div>
          </div>
        ) : (
          /* Blank Form View - NOT linked to any specific product or part number */
          <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
                {errorMsg}
              </div>
            )}

            {/* Note banner */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2.5 text-xs text-slate-600">
              <HelpCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed text-[11px]">
                Use this form for non-standard cable cuts, custom lengths, special sheath/jackets, certifications, or products not found in our standard catalog.
              </p>
            </div>

            {/* Customer Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Contact Person Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Contact Person <span className="text-red-500">*</span></span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Your Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all"
                />
              </div>

              {/* Company Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                  <span>Company / Organization <span className="text-red-500">*</span></span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Electricals Pvt Ltd"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all"
                />
              </div>

              {/* Work Email */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>Work Email Address <span className="text-red-500">*</span></span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. purchase@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all"
                />
              </div>

              {/* Phone / Mobile */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>Contact Number / Mobile <span className="text-red-500">*</span></span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all"
                />
              </div>
            </div>

            {/* Product / Cable Type & Required Quantity / Length */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-slate-400" />
                  <span>Product / Cable Category or Type</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Control Cable, Solar Cable, Breaker, etc."
                  value={itemType}
                  onChange={(e) => setItemType(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-slate-400" />
                  <span>Required Length / Size / Quantity</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. 750 Meters, 4 Core 2.5 sqmm, 25 Nos"
                  value={quantityOrLength}
                  onChange={(e) => setQuantityOrLength(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all"
                />
              </div>
            </div>

            {/* Special Specifications / Requirements */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span>Special Requirements &amp; Technical Specifications <span className="text-red-500">*</span></span>
              </label>
              <textarea
                required
                rows={4}
                placeholder="Describe your non-standard requirements, special cable lengths, custom sizes, insulation, temperature rating, certifications, or specific project delivery requirements..."
                value={specifications}
                onChange={(e) => setSpecifications(e.target.value)}
                className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all resize-none leading-relaxed"
              />
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-gradient-to-r from-red-600 via-red-700 to-rose-700 hover:opacity-95 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md shadow-red-600/20 disabled:opacity-50 transition-all flex items-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Submitting Enquiry...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Enquiry</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
