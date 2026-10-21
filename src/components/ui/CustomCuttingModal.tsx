import React, { useState, useEffect } from 'react';
import { 
  X, Scissors, Building, User, Mail, Phone, FileText, 
  CheckCircle2, ArrowRight, ShieldCheck, Clock, Zap
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { API_BASE_URL } from '../../config/api';

interface CustomCuttingModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName?: string;
  partNo?: string;
}

export const CustomCuttingModal: React.FC<CustomCuttingModalProps> = ({
  isOpen,
  onClose,
  productName,
  partNo
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [requirement, setRequirement] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Auto-fill from logged-in user if available
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

    if (!name.trim() || !companyName.trim() || !phone.trim() || !email.trim() || !requirement.trim()) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);

    try {
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
          requirement: requirement.trim(),
          productName: productName || null,
          partNo: partNo || null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSuccess(true);
        setRequestId(data.request?._id || `CUT-${Date.now().toString().slice(-6)}`);
        showToast('Custom cutting request submitted successfully!', 'success');
      } else {
        setErrorMsg(data.error || 'Failed to submit cutting request. Please try again.');
        showToast(data.error || 'Submission failed', 'error');
      }
    } catch (err: any) {
      console.error('Custom cutting error:', err);
      setErrorMsg('Network error. Unable to contact warehouse dispatch server.');
      showToast('Network error while submitting request', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setIsSuccess(false);
    setRequestId(null);
    setErrorMsg('');
    setRequirement('');
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
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-red-50 via-rose-50/50 to-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-md shadow-red-600/20 shrink-0">
              <Scissors className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                Need Custom Product Cutting?
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Exact project lengths, drum decoiling, &amp; zero scrap charges
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
                Cutting Request Received!
              </h4>
              <p className="text-xs text-slate-500 font-medium">
                Our Bangalore warehouse cutting station has logged your exact specifications.
              </p>
            </div>

            {requestId && (
              <div className="inline-block bg-slate-100 border border-slate-200 px-4 py-2 rounded-xl font-mono text-xs text-slate-800 font-bold">
                Reference ID: <span className="text-red-700">{requestId}</span>
              </div>
            )}

            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-xs text-emerald-900 text-left space-y-2">
              <div className="flex items-center gap-2 font-bold text-emerald-950">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>What happens next?</span>
              </div>
              <p className="leading-relaxed text-emerald-800">
                1. Our engineering desk will verify drum stock &amp; cutting tolerances for <strong>{companyName}</strong>.
              </p>
              <p className="leading-relaxed text-emerald-800">
                2. An official quotation with exact meterage dispatch timeline will be emailed to <strong>{email}</strong> or shared via WhatsApp on <strong>{phone}</strong>.
              </p>
            </div>

            <div className="pt-3">
              <button
                onClick={handleResetAndClose}
                className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
              >
                Done / Back to Catalog
              </button>
            </div>
          </div>
        ) : (
          /* Form View */
          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs overflow-y-auto">
            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl font-semibold text-xs flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Product context badge if available */}
            {productName && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <span className="text-[10px] uppercase font-bold text-red-600 block">Selected Product Reference</span>
                  <div className="font-bold text-slate-900 truncate text-xs">{productName}</div>
                </div>
                {partNo && (
                  <span className="font-mono text-[11px] font-bold bg-white px-2 py-1 rounded-md border border-slate-200 text-slate-700 shrink-0">
                    Part #{partNo}
                  </span>
                )}
              </div>
            )}

            {/* Row 1: Name and Company */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Full Name / Contact Person <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-500 focus:bg-white font-medium transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Building className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Apex Automation Pvt Ltd"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-500 focus:bg-white font-medium transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Row 2: Phone and Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-500 focus:bg-white font-mono font-bold transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="procurement@company.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-500 focus:bg-white font-medium transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Row 3: Specific Requirement */}
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Specific Requirement <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={4}
                value={requirement}
                onChange={(e) => setRequirement(e.target.value)}
                placeholder="Mention required cut lengths (e.g. 3 x 75m, 1 x 120m), drum handling preferences, core cross-section, project site delivery location, and required dates..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-500 focus:bg-white leading-relaxed font-medium transition-colors"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Provide custom cut lengths, core numbers, or drum specifications to receive an instant commercial quote.
              </span>
            </div>

            {/* Quick Benefits Pills */}
            <div className="grid grid-cols-3 gap-2 pt-1 text-[11px]">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-2 text-center text-slate-600 font-medium">
                <Zap className="w-3.5 h-3.5 text-amber-500 mx-auto mb-0.5" />
                <span>Zero Scrap Charges</span>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-2 text-center text-slate-600 font-medium">
                <Scissors className="w-3.5 h-3.5 text-red-500 mx-auto mb-0.5" />
                <span>Motorized Decoil</span>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-2 text-center text-slate-600 font-medium">
                <Clock className="w-3.5 h-3.5 text-blue-500 mx-auto mb-0.5" />
                <span>24-48h Dispatch</span>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-gradient-to-r from-red-600 via-red-700 to-rose-700 hover:opacity-95 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md shadow-red-600/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                {isSubmitting ? (
                  <span>Submitting Cutting Request...</span>
                ) : (
                  <>
                    <span>Submit Custom Cutting Request</span>
                    <ArrowRight className="w-4 h-4" />
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
