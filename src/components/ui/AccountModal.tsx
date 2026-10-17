import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  X,
  FileSpreadsheet,
  LogOut,
  Save,
  ExternalLink,
  Printer,
  Download,
  Eye,
  CheckCircle2,
  Clock,
  MapPin,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { API_BASE_URL } from "../../config/api";
import { useCart } from "../../context/CartContext";

export const AccountModal: React.FC = () => {
  const { user, isAccountModalOpen, closeAccountModal, logout, updateProfile, savedQuotes } = useAuth();
  const { loadCart } = useCart();
  const [isEditing, setIsEditing] = useState(false);
  const [company, setCompany] = useState(user?.company || "");
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [gstin, setGstin] = useState(user?.gstin || "");
  const [address, setAddress] = useState(user?.address || "");
  const [city, setCity] = useState(user?.city || "");

  const navigate = useNavigate();
  const [myRfqs, setMyRfqs] = useState<any[]>([]);
  const [loadingRfqs, setLoadingRfqs] = useState(false);
  const [selectedRfq, setSelectedRfq] = useState<any | null>(null);

  useEffect(() => {
    if (isAccountModalOpen && user) {
      setLoadingRfqs(true);
      fetch(`${API_BASE_URL}/api/rfqs/my?email=${encodeURIComponent(user.email)}&phone=${encodeURIComponent(user.phone || '')}`)
        .then(res => res.json())
        .then(data => setMyRfqs(Array.isArray(data) ? data : []))
        .catch(err => console.error('Failed to fetch my rfqs', err))
        .finally(() => setLoadingRfqs(false));
    }
  }, [isAccountModalOpen, user]);

  if (!isAccountModalOpen || !user) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      company,
      name,
      phone,
      gstin,
      address,
      city,
    });
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
        onClick={closeAccountModal}
      />

      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col text-slate-900">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-sm">
              {user.name.charAt(0)}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Corporate Client Portal
              </h3>
              <span className="text-xs text-slate-500 font-medium">{user.email}</span>
            </div>
          </div>
          <button
            onClick={closeAccountModal}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs flex-1">
          {/* Company Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
                Corporate Credentials &amp; GSTIN
              </span>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-slate-600 hover:text-slate-900 font-semibold underline"
                >
                  Edit Information
                </button>
              ) : (
                <button
                  onClick={() => setIsEditing(false)}
                  className="text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleSave} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-700 block mb-1 font-bold">Company</label>
                    <input
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2 text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-slate-700 block mb-1 font-bold">Contact Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2 text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-700 block mb-1 font-bold">Phone</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2 text-slate-900 font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 shadow-sm"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </button>
              </form>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-400 block font-medium">Company Name</span>
                  <span className="text-slate-900 font-bold text-sm">
                    {user.company || "Not Specified"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Authorized Contact</span>
                  <span className="text-slate-900 font-bold text-sm">
                    {user.name}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Mobile / WhatsApp</span>
                  <span className="text-slate-900 font-mono font-bold">
                    {user.phone || "+91 98450 12345"}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* My RFQs Section */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden mt-6 shadow-sm">
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-amber-600" />
                <h4 className="font-bold text-slate-800 text-sm">My Quotations (RFQs)</h4>
              </div>
              <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">{myRfqs.length} Total</span>
            </div>
            
            {selectedRfq ? (
              /* Single RFQ Detailed Viewer with Phase 1 Status Pipeline & Print */
              <div className="p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
                  <button
                    onClick={() => setSelectedRfq(null)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    <ArrowLeft size={14} />
                    <span>Back to RFQs List</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => window.print()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
                    >
                      <Printer size={13} />
                      <span>Print RFQ</span>
                    </button>
                  </div>
                </div>

                {/* RFQ Header & Phase 1 Status Tracker */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">Quotation Reference</span>
                      <h3 className="text-base font-black text-slate-900">{selectedRfq.quoteNo}</h3>
                      <p className="text-[11px] text-slate-500">{selectedRfq.date || new Date(selectedRfq.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">Total Value</span>
                      <div className="text-base font-black text-[#c52328]">
                        ₹{(selectedRfq.grandTotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>

                  {/* Phase 1 Status Pipeline Tracker */}
                  <div className="pt-2 border-t border-slate-200/80">
                    <div className="text-[11px] font-bold text-slate-700 mb-2 flex items-center justify-between">
                      <span>RFQ Status Flow (Phase 1):</span>
                      <span className="text-amber-700 font-extrabold uppercase text-[10px] bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        Current: {selectedRfq.status || 'New'}
                      </span>
                    </div>

                    <div className="grid grid-cols-5 gap-1.5 text-center text-[10px] font-bold">
                      {[
                        { label: 'New', key: 'new' },
                        { label: 'Assigned', key: 'assigned' },
                        { label: 'Under Review', key: 'under review' },
                        { label: 'Process by Sales', key: 'process by sales' },
                        { label: 'Closed', key: 'closed' },
                      ].map((step, idx) => {
                        const cur = (selectedRfq.status || 'New').toLowerCase().trim();
                        const phaseKeys = ['new', 'assigned', 'under review', 'process by sales', 'closed'];
                        let curIdx = phaseKeys.indexOf(cur);
                        if (curIdx === -1) {
                          if (cur.includes('submit') || cur.includes('open') || cur.includes('gen')) curIdx = 0;
                          else if (cur.includes('review')) curIdx = 2;
                          else if (cur.includes('proc')) curIdx = 3;
                          else if (cur.includes('close') || cur.includes('comp')) curIdx = 4;
                          else curIdx = 0;
                        }

                        const isDone = idx < curIdx;
                        const isCurrent = idx === curIdx;

                        return (
                          <div 
                            key={step.key} 
                            className={`p-2 rounded-lg border transition-all ${
                              isCurrent
                                ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                                : isDone
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                : 'bg-white text-slate-400 border-slate-200'
                            }`}
                          >
                            <div className="text-[9px] font-mono block opacity-80">0{idx + 1}</div>
                            <div className="truncate">{step.label}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Delivery & Project Details */}
                {(selectedRfq.city || selectedRfq.address || selectedRfq.notes) && (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs space-y-1.5">
                    <div className="flex items-center gap-1.5 text-slate-700 font-bold">
                      <MapPin size={13} className="text-amber-600" />
                      <span>Delivery &amp; Specifications</span>
                    </div>
                    {selectedRfq.city && (
                      <p className="text-slate-600">
                        <span className="font-semibold text-slate-800">Destination:</span> {selectedRfq.city} {selectedRfq.state ? `, ${selectedRfq.state}` : ''}
                      </p>
                    )}
                    {selectedRfq.notes && (
                      <p className="text-slate-600 italic bg-white p-2 rounded-lg border border-slate-200 text-[11px] whitespace-pre-line">
                        "{selectedRfq.notes}"
                      </p>
                    )}
                  </div>
                )}

                {/* Items Schedule Table */}
                {Array.isArray(selectedRfq.items) && selectedRfq.items.length > 0 && (
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <div className="bg-slate-100 px-3 py-2 text-[11px] font-bold text-slate-700 border-b border-slate-200">
                      Line Items ({selectedRfq.items.length})
                    </div>
                    <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto">
                      {selectedRfq.items.map((item: any, idx: number) => (
                        <div key={idx} className="p-3 text-xs flex items-center justify-between gap-3 hover:bg-slate-50">
                          <div className="min-w-0 flex-1">
                            <div className="font-bold text-slate-900 truncate">{item.name || 'Industrial Material'}</div>
                            <div className="text-[10px] text-slate-500 font-mono">
                              Part: {item.partNo || 'N/A'} {item.brand ? `· ${item.brand}` : ''}
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="font-bold text-slate-800 font-mono">
                              {item.qty} {item.unit || 'unit'}
                            </div>
                            {item.unitPrice ? (
                              <div className="text-[10px] text-slate-500 font-mono">
                                @ ₹{item.unitPrice.toFixed(2)}
                              </div>
                            ) : null}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* RFQ List */
              <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
                {loadingRfqs ? (
                  <div className="p-6 flex justify-center"><div className="w-6 h-6 border-2 border-amber-200 border-t-amber-500 rounded-full animate-spin"></div></div>
                ) : myRfqs.length === 0 ? (
                  <div className="p-8 text-center text-slate-500">
                    <FileSpreadsheet className="w-8 h-8 mx-auto mb-3 text-slate-300" />
                    <p className="font-medium text-sm">No RFQs found.</p>
                    <p className="text-xs mt-1 text-slate-400">Your quotation requests will appear here.</p>
                  </div>
                ) : (
                  myRfqs.map((rfq: any) => (
                    <div key={rfq._id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-slate-800 text-sm truncate">{rfq.quoteNo}</p>
                        <p className="text-slate-500 text-xs mt-0.5">{rfq.date || new Date(rfq.createdAt).toLocaleDateString()}</p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider
                            ${rfq.status === 'New' || rfq.status === 'RFQ Submitted' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 
                              rfq.status === 'Assigned' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                              rfq.status === 'Under Review' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                              rfq.status === 'Process by Sales' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                              rfq.status === 'Closed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 
                              'bg-slate-100 text-slate-700'}`}>
                            {rfq.status || 'New'}
                          </span>
                          {rfq.grandTotal > 0 && <p className="font-bold text-slate-900 text-xs mt-0.5 font-mono">₹{rfq.grandTotal.toLocaleString('en-IN')}</p>}
                        </div>

                        <button
                          onClick={() => setSelectedRfq(rfq)}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-amber-500 hover:text-white text-slate-700 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer border border-slate-200 shadow-2xs"
                          title="View RFQ details & print"
                        >
                          <Eye size={13} />
                          <span className="hidden sm:inline">Details</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <button
            onClick={logout}
            className="flex items-center gap-1.5 text-slate-500 hover:text-rose-600 transition-colors text-xs font-semibold"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
          <button
            onClick={closeAccountModal}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition-colors"
          >
            Close Portal
          </button>
        </div>
      </div>
    </div>
  );
};
