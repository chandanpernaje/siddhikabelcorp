import React, { useEffect, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams } from 'react-router-dom';
import {
  FileText, Eye, RefreshCw, AlertCircle, CheckCircle, UserPlus, Trash2, X,
  Download, Printer, Search, ArrowLeft, Clock, Tag, Percent, Edit3, Save,
  FileSpreadsheet, Check, ArrowUpDown, ArrowUp, ArrowDown, User as UserIcon
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { API_BASE_URL } from '../../config/api';

interface User {
  _id: string;
  name: string;
  role: string;
}

interface RFQItem {
  partNo?: string;
  name?: string;
  description?: string;
  brand?: string;
  hsnCode?: string;
  unit?: string;
  uom?: string;
  core?: string | number;
  coreSize?: string;
  sqmm?: string;
  weight?: string;
  outerDiameter?: string;
  validity?: string;
  qty: number;
  unitPrice: number;
  totalBeforeTax?: number;
  gstRate?: number;
  gstAmount?: number;
  totalWithTax?: number;
}

interface RFQ {
  _id: string;
  quoteNo: string;
  date: string;
  customerName: string;
  companyName: string;
  email: string;
  phone: string;
  address?: string;
  billingAddress?: string;
  deliveryAddress?: string;
  deliveryLocation?: string;
  specialInstructions?: string;
  city?: string;
  state?: string;
  pincode?: string;
  grandTotal: number;
  status: string;
  lostReason?: string | null;
  lostReasonDetails?: string | null;
  assignedAt?: string | null;
  expiredAt?: string | null;
  validityDays?: number;
  validUntil?: string | null;
  expiryComments?: string | null;
  assignedTo?: string | null;
  assignedToName: string | null;
  createdAt: string;
  items?: RFQItem[];
  subtotal?: number;
  discountRate?: number;
  discountAmount?: number;
  notes?: string;
  deliveryTerms?: string;
  paymentTerms?: string;
}

// UOM Abbreviation formatter - Show UOM in abbreviated form only, retain SQ.MM
export function formatUom(uom?: string | null): string {
  if (!uom) return 'm';
  const norm = uom.toLowerCase().trim();
  if (norm === 'meter' || norm === 'metre' || norm === 'm' || norm === 'mtr' || norm === 'meters') return 'm';
  if (norm.includes('millimeter') || norm.includes('millimetre') || norm === 'mm') return 'mm';
  if (norm.includes('centimeter') || norm.includes('centimetre') || norm === 'cm') return 'cm';
  if (norm === 'piece' || norm === 'pc' || norm === 'pcs' || norm === 'pieces') return 'pc';
  if (norm === 'coil' || norm === 'coils') return 'coil';
  if (norm === 'drum' || norm === 'drums' || norm === 'spool' || norm.includes('bulk')) return 'drum';
  if (norm === 'pack' || norm === 'packs' || norm === 'box' || norm === 'boxes' || norm.includes('packaging')) return 'pack';
  if (norm === 'roll' || norm === 'rolls') return 'roll';
  if (norm === 'sqmm' || norm === 'sq.mm' || norm === 'sq mm' || norm === 'mm²') return 'SQ.MM';
  if (norm === 'km') return 'km';
  if (norm === 'ft' || norm === 'foot' || norm === 'feet') return 'ft';
  if (norm === 'in' || norm === 'inch' || norm === 'inches') return 'in';
  if (norm === 'set' || norm === 'sets') return 'set';
  if (norm === 'lot' || norm === 'lots') return 'lot';
  return uom;
}

// Core / Cross Section Formatter - Retains SQ.MM unit
export function formatCoreSqmm(core?: string | number | null, sqmm?: string | number | null, name?: string): string {
  let c = core ? String(core).trim() : '';
  let s = sqmm ? String(sqmm).trim() : '';

  if ((!c || !s) && name) {
    const matchG = name.match(/(\d+)\s*[Ggx]\s*([0-9.]+)/i);
    if (matchG) {
      if (!c) c = matchG[1];
      if (!s) s = matchG[2];
    } else {
      const matchCore = name.match(/(\d+)\s*(?:core|cores)/i);
      const matchSqmm = name.match(/([0-9.]+)\s*(?:sq\.?mm|mm²)/i);
      if (matchCore && !c) c = matchCore[1];
      if (matchSqmm && !s) s = matchSqmm[1];
    }
  }

  if (c && s) return `${c} Core x ${s} SQ.MM`;
  if (c) return `${c} Core`;
  if (s) return `${s} SQ.MM`;
  return '-';
}

// Outer Diameter (OD) Formatter
export function formatOD(od?: string | number | null, name?: string): string {
  if (od) {
    const s = String(od).trim();
    return s.toLowerCase().includes('mm') ? s : `${s} mm`;
  }
  if (name) {
    const match = name.match(/OD[:\s]*([0-9.]+\s*mm)/i);
    if (match) return match[1];
  }
  return '-';
}

// Weight Formatter
export function formatWeight(w?: string | number | null, name?: string): string {
  if (w) {
    const s = String(w).trim();
    return s.toLowerCase().includes('kg') ? s : `${s} kg/km`;
  }
  if (name) {
    const match = name.match(/([0-9.]+\s*kg(?:\/km)?)/i);
    if (match) return match[1];
  }
  return '-';
}

// Automatic 7-Day Validity & Countdown Calculator (No manual date entry required)
export function getQuotationValidityInfo(rfq: { createdAt?: string; date?: string; validUntil?: string | null; status?: string; validityDays?: number; assignedAt?: string | null }) {
  const baseDateStr = rfq.assignedAt || rfq.createdAt || rfq.date || new Date().toISOString();
  const baseTime = new Date(baseDateStr).getTime();
  const totalDays = rfq.validityDays || 7;
  const expiryTime = rfq.validUntil ? new Date(rfq.validUntil).getTime() : baseTime + (totalDays * 24 * 60 * 60 * 1000);
  const now = Date.now();
  const diffMs = expiryTime - now;

  const isActionTaken = rfq.status === 'Under Review' || rfq.status === 'PO Received' || rfq.status === 'Approved' || rfq.status === 'Completed' || rfq.status === 'Closed' || rfq.status === 'Lost';
  const isExpired = !isActionTaken && (rfq.status === 'Expired' || diffMs <= 0);

  const remainingDays = Math.ceil(diffMs / (24 * 60 * 60 * 1000));
  const remainingHours = Math.max(0, Math.ceil(diffMs / (60 * 60 * 1000)));

  let countdownLabel = '';
  if (isActionTaken) {
    if (rfq.status === 'Under Review') countdownLabel = 'Under Review';
    else if (rfq.status === 'PO Received' || rfq.status === 'Approved' || rfq.status === 'Completed') countdownLabel = 'PO Received';
    else if (rfq.status === 'Closed') countdownLabel = 'Closed';
    else if (rfq.status === 'Lost') countdownLabel = 'Lost';
    else countdownLabel = rfq.status || 'Action Taken';
  } else if (isExpired) {
    countdownLabel = 'Expired (0d left)';
  } else if (remainingDays > 1) {
    countdownLabel = `7 Days (${remainingDays}d left)`;
  } else if (remainingHours > 0) {
    countdownLabel = `Expires today (${remainingHours}h left)`;
  } else {
    countdownLabel = 'Expires today';
  }

  return {
    isExpired,
    isActionTaken,
    validityTotalDays: totalDays,
    remainingDays: Math.max(0, remainingDays),
    remainingHours,
    expiryDate: new Date(expiryTime).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
    countdownLabel
  };
}

export const AdminRFQs: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const filterParam = searchParams.get('filter') || searchParams.get('status') || 'All';
  const [statusFilter, setStatusFilter] = useState<string>(filterParam === 'pending' ? 'Pending' : 'All');
  const [searchQuery, setSearchQuery] = useState<string>(searchParams.get('search') || '');

  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedRfq, setSelectedRfq] = useState<RFQ | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [dateSortOrder, setDateSortOrder] = useState<'desc' | 'asc'>('desc');

  // Lost Reason Modal State (Requirement 2.6)
  const [lostModalRfq, setLostModalRfq] = useState<RFQ | null>(null);
  const [selectedLostReason, setSelectedLostReason] = useState<string>('Price too high / Competitor cheaper');
  const [otherLostReasonDetails, setOtherLostReasonDetails] = useState<string>('');
  const [isSubmittingLost, setIsSubmittingLost] = useState(false);

  // Pricing & Special Discount Editor State
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [editItems, setEditItems] = useState<RFQItem[]>([]);
  const [editDiscountType, setEditDiscountType] = useState<'percent' | 'amount'>('percent');
  const [editDiscountValue, setEditDiscountValue] = useState<number>(0);
  const [editNotes, setEditNotes] = useState<string>('');
  const [isSavingPrice, setIsSavingPrice] = useState(false);
  const [priceSuccessMsg, setPriceSuccessMsg] = useState('');

  // Expiry Comments State
  const [isEditingExpiryComments, setIsEditingExpiryComments] = useState(false);
  const [expiryCommentInput, setExpiryCommentInput] = useState('');
  const [isSavingExpiryComment, setIsSavingExpiryComment] = useState(false);

  // Retrieve current admin/sales details
  const currentAdminStr = localStorage.getItem('siddhi_admin_user');
  const currentAdmin = currentAdminStr ? JSON.parse(currentAdminStr) : null;
  const rawRole = (currentAdmin?.role || '').toLowerCase();
  const isSalesExec = (rawRole.includes('executive') || rawRole.includes('salesman')) && !rawRole.includes('admin') && !rawRole.includes('manager');
  const isAdmin = rawRole.includes('admin') || !currentAdminStr;
  const isSalesManager = rawRole.includes('manager');
  const canAssign = isAdmin || isSalesManager;
  const canViewAll = !isSalesExec;

  const defaultSalesStaff: User[] = [
    { _id: 'sales-ramesh-id', name: 'Ramesh', role: 'Sales Executive' },
    { _id: 'sales-prithvi-id', name: 'Prithvi', role: 'Sales Executive' },
    { _id: 'sales-sumanth-id', name: 'Sumanth', role: 'Sales Executive' }
  ];

  // Helper to match assigned staff id accurately
  const getAssignedUserId = (assignedTo?: string | null, assignedToName?: string | null) => {
    if (!assignedTo && !assignedToName) return '';
    const normName = (assignedToName || '').toLowerCase().trim();
    const match = users.find(u => {
      if (assignedTo && u._id === assignedTo) return true;
      const un = (u.name || '').toLowerCase().trim();
      if (un === normName) return true;
      if (normName.includes('ramesh') && un.includes('ramesh')) return true;
      if ((normName.includes('prithvi') || normName.includes('pruthw')) && (un.includes('prithvi') || un.includes('pruthw'))) return true;
      if (normName.includes('sumanth') && un.includes('sumanth')) return true;
      return false;
    });
    return match?._id || assignedTo || '';
  };

  // High performance fetch with background silent sync option
  const fetchData = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setIsRefreshing(true);

    try {
      const token = localStorage.getItem('token');
      const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {};

      const url = canViewAll
        ? `${API_BASE_URL}/api/rfqs`
        : `${API_BASE_URL}/api/rfqs?assignedTo=${currentAdmin?._id}`;

      const [rfqRes, staffRes] = await Promise.all([
        fetch(url, { headers }),
        fetch(`${API_BASE_URL}/api/admin/assign-staff`, { headers })
      ]);

      if (rfqRes.ok) {
        const fetchedRfqs: RFQ[] = await rfqRes.json();
        setRfqs(fetchedRfqs);

        // Keep selected RFQ in sync if modal is open
        if (selectedRfq) {
          const fresh = fetchedRfqs.find(r => r._id === selectedRfq._id);
          if (fresh) setSelectedRfq(fresh);
        }
      }
      if (staffRes.ok) {
        const staffData: User[] = await staffRes.json();
        // Strictly allow only Ramesh, Prithvi, Sumanth
        const allowed = ['ramesh', 'prithvi', 'pruthwik', 'sumanth'];
        const filtered = staffData.filter(u => {
          const n = (u.name || '').toLowerCase().trim();
          return allowed.some(a => n.includes(a));
        });
        setUsers(filtered.length > 0 ? filtered : defaultSalesStaff);
      } else {
        setUsers(defaultSalesStaff);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      if (!isSilent) setUsers(defaultSalesStaff);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle URL query parameters for direct RFQ viewing
  useEffect(() => {
    const targetId = searchParams.get('id') || searchParams.get('quoteNo');
    if (targetId && rfqs.length > 0) {
      const match = rfqs.find(r => r._id === targetId || r.quoteNo === targetId);
      if (match) setSelectedRfq(match);
    }
    const q = searchParams.get('search');
    if (q !== null) setSearchQuery(q);
  }, [searchParams, rfqs]);

  const handleCloseModal = () => {
    setSelectedRfq(null);
    setIsEditingPrice(false);
    setPriceSuccessMsg('');
    if (searchParams.has('id') || searchParams.has('quoteNo')) {
      const next = new URLSearchParams(searchParams);
      next.delete('id');
      next.delete('quoteNo');
      setSearchParams(next, { replace: true });
    }
  };

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedRfq && !isEditingPrice) {
        handleCloseModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedRfq, isEditingPrice]);

  // When selected RFQ changes, sync edit fields
  useEffect(() => {
    if (selectedRfq) {
      const initialItems = (selectedRfq.items && selectedRfq.items.length > 0)
        ? selectedRfq.items.map(it => ({ ...it }))
        : [{
          partNo: 'STD-KABEL-01',
          name: 'Standard Industrial Cable',
          brand: 'Polycab',
          qty: 1,
          unit: 'm',
          unitPrice: selectedRfq.subtotal || selectedRfq.grandTotal || 1000,
          totalBeforeTax: selectedRfq.subtotal || selectedRfq.grandTotal || 1000
        }];
      setEditItems(initialItems);
      setEditDiscountType('percent');
      setEditDiscountValue(selectedRfq.discountRate || 0);
      setEditNotes(selectedRfq.notes || '');
      setExpiryCommentInput(selectedRfq.expiryComments || '');
      setIsEditingExpiryComments(false);
      setIsEditingPrice(false);
      setPriceSuccessMsg('');
    }
  }, [selectedRfq?._id]);

  // Save Expiry Comments Handler
  const handleSaveExpiryComment = async () => {
    if (!selectedRfq) return;
    setIsSavingExpiryComment(true);
    try {
      const token = localStorage.getItem('token');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      };
      const res = await fetch(`${API_BASE_URL}/api/rfqs/${selectedRfq._id}/status`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          expiryComments: expiryCommentInput
        })
      });
      if (res.ok) {
        setSelectedRfq(prev => prev ? { ...prev, expiryComments: expiryCommentInput } : null);
        setRfqs(prev => prev.map(r => r._id === selectedRfq._id ? { ...r, expiryComments: expiryCommentInput } : r));
        setIsEditingExpiryComments(false);
      }
    } catch (e) {
      console.error('Failed to save expiry comments', e);
    } finally {
      setIsSavingExpiryComment(false);
    }
  };

  // Live pricing calculator
  const pricingCalc = useMemo(() => {
    const sub = editItems.reduce((acc, it) => acc + ((Number(it.qty) || 1) * (Number(it.unitPrice) || 0)), 0);
    let discAmt = 0;
    let discRate = 0;
    if (editDiscountType === 'percent') {
      discRate = Math.min(100, Math.max(0, Number(editDiscountValue) || 0));
      discAmt = (sub * discRate) / 100;
    } else {
      discAmt = Math.min(sub, Math.max(0, Number(editDiscountValue) || 0));
      discRate = sub > 0 ? (discAmt / sub) * 100 : 0;
    }
    const taxable = Math.max(0, sub - discAmt);
    const gst = taxable * 0.18;
    const total = taxable + gst;

    return {
      subtotal: Math.round(sub * 100) / 100,
      discountRate: Math.round(discRate * 10) / 10,
      discountAmount: Math.round(discAmt * 100) / 100,
      taxableAmount: Math.round(taxable * 100) / 100,
      gstAmount: Math.round(gst * 100) / 100,
      grandTotal: Math.round(total * 100) / 100
    };
  }, [editItems, editDiscountType, editDiscountValue]);

  // Requirement 1: Admin assigns RFQ to Sales Person. Auto status update to 'Assigned'.
  const handleAssign = async (rfqId: string, userId: string) => {
    let assignedName: string | null = null;
    let targetUserId: string | null = userId;

    if (!userId || userId === 'unassigned' || userId === '') {
      targetUserId = null;
      assignedName = null;
    } else {
      const selectedUser = users.find(u => u._id === userId || u.name === userId);
      if (selectedUser) {
        assignedName = selectedUser.name;
        targetUserId = selectedUser._id;
      }
    }

    // Instant Optimistic Update
    setRfqs(prev => prev.map(r => r._id === rfqId ? {
      ...r,
      assignedTo: targetUserId,
      assignedToName: assignedName,
      status: targetUserId ? 'Assigned' : 'New'
    } : r));

    if (selectedRfq && selectedRfq._id === rfqId) {
      setSelectedRfq(prev => prev ? {
        ...prev,
        assignedTo: targetUserId,
        assignedToName: assignedName,
        status: targetUserId ? 'Assigned' : 'New'
      } : null);
    }

    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE_URL}/api/rfqs/${rfqId}/assign`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ assignedTo: targetUserId, assignedToName: assignedName })
      });
      // Silent background refresh
      fetchData(true);
    } catch (err) {
      console.error('Assign failed', err);
    }
  };

  // Update status with optional revision notes
  const handleStatusChange = async (rfqId: string, newStatus: string, returnNotes?: string) => {
    // Instant Optimistic Update
    setRfqs(prev => prev.map(r => r._id === rfqId ? {
      ...r,
      status: newStatus,
      notes: returnNotes !== undefined ? returnNotes : r.notes
    } : r));

    if (selectedRfq && selectedRfq._id === rfqId) {
      setSelectedRfq(prev => prev ? {
        ...prev,
        status: newStatus,
        notes: returnNotes !== undefined ? returnNotes : prev.notes
      } : null);
    }

    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE_URL}/api/rfqs/${rfqId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ status: newStatus, notes: returnNotes })
      });
      fetchData(true);
    } catch (err) {
      console.error('Status change error', err);
    }
  };

  // Requirement 2.6: Initiate status change with Lost Reason popup trigger
  const handleInitiateStatusChange = (rfqId: string, newStatus: string, rfqObj?: RFQ) => {
    if (newStatus === 'Lost') {
      const target = rfqObj || rfqs.find(r => r._id === rfqId) || (selectedRfq?._id === rfqId ? selectedRfq : null);
      if (target) {
        setLostModalRfq(target);
        setSelectedLostReason('Price too high / Competitor cheaper');
        setOtherLostReasonDetails('');
        return;
      }
    }
    handleStatusChange(rfqId, newStatus);
  };

  // Requirement 2.6: Save Lost Reason
  const handleConfirmLostReason = async () => {
    if (!lostModalRfq) return;
    setIsSubmittingLost(true);
    const reason = selectedLostReason === 'Others' ? (otherLostReasonDetails.trim() || 'Others') : selectedLostReason;

    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE_URL}/api/rfqs/${lostModalRfq._id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          status: 'Lost',
          lostReason: reason,
          lostReasonDetails: otherLostReasonDetails.trim()
        })
      });

      setRfqs(prev => prev.map(r => r._id === lostModalRfq._id ? {
        ...r,
        status: 'Lost',
        lostReason: reason,
        lostReasonDetails: otherLostReasonDetails.trim()
      } : r));

      if (selectedRfq?._id === lostModalRfq._id) {
        setSelectedRfq(prev => prev ? {
          ...prev,
          status: 'Lost',
          lostReason: reason,
          lostReasonDetails: otherLostReasonDetails.trim()
        } : null);
      }

      setLostModalRfq(null);
      fetchData(true);
    } catch (e) {
      console.error('Failed to mark as lost', e);
    } finally {
      setIsSubmittingLost(false);
    }
  };

  // Requirement 6: Save Quotation Price and Special Discount
  const handleSaveQuotationPrice = async () => {
    if (!selectedRfq) return;
    setIsSavingPrice(true);
    setPriceSuccessMsg('');

    try {
      const preparedItems = editItems.map(it => {
        const q = Number(it.qty) || 1;
        const p = Number(it.unitPrice) || 0;
        return {
          ...it,
          qty: q,
          unitPrice: p,
          totalBeforeTax: q * p
        };
      });

      const payload = {
        items: preparedItems,
        discountRate: pricingCalc.discountRate,
        discountAmount: pricingCalc.discountAmount,
        subtotal: pricingCalc.subtotal,
        grandTotal: pricingCalc.grandTotal,
        notes: editNotes
      };

      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/rfqs/${selectedRfq._id}/price`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const updated = await res.json();
        setSelectedRfq(updated);
        setRfqs(prev => prev.map(r => r._id === updated._id ? { ...r, ...updated } : r));
        setPriceSuccessMsg('Special discount & pricing revised successfully!');
        setTimeout(() => {
          setIsEditingPrice(false);
          setPriceSuccessMsg('');
        }, 1200);
      } else {
        alert('Failed to save revised pricing.');
      }
    } catch (err) {
      console.error('Save price error', err);
      alert('Error updating pricing.');
    } finally {
      setIsSavingPrice(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this RFQ?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/rfqs/${id}`, {
        method: 'DELETE',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (res.ok) {
        setRfqs(prev => prev.filter(r => r._id !== id));
        if (selectedRfq?._id === id) setSelectedRfq(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(sortedRfqs.map(r => r._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} RFQs?`)) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/rfqs/bulk-delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ ids: selectedIds })
      });
      if (res.ok) {
        setRfqs(prev => prev.filter(r => !selectedIds.includes(r._id)));
        setSelectedIds([]);
      }
    } catch (error) {
      console.error('Bulk delete failed', error);
    }
  };

  // Requirement 5 & 7: Individual Quotation Excel Download
  const handleExportSingleRfqExcel = (rfq: RFQ) => {
    try {
      const quoteNo = rfq.quoteNo || 'RFQ';
      const dateStr = rfq.date || (rfq.createdAt ? new Date(rfq.createdAt).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN'));
      const customerName = rfq.customerName || 'Customer';
      const companyName = rfq.companyName || customerName;
      const email = rfq.email || '';
      const phone = rfq.phone || '';
      const assignedTo = rfq.assignedToName || 'Sales Team';
      const status = rfq.status || 'Under Review';

      const subtotal = rfq.subtotal ?? (rfq.items ? rfq.items.reduce((s, it) => s + ((it.qty || 1) * (it.unitPrice || 0)), 0) : 0);
      const discountRate = rfq.discountRate || 0;
      const discountAmount = rfq.discountAmount || (discountRate > 0 ? (subtotal * discountRate) / 100 : 0);
      const taxableAmount = Math.max(0, subtotal - discountAmount);
      const gstAmount = taxableAmount * 0.18;
      const grandTotal = rfq.grandTotal || (taxableAmount + gstAmount);

      const valInfo = getQuotationValidityInfo(rfq);

      const rows: (string | number)[][] = [
        ['SIDDHI KABEL CORP PVT LTD'],
        ['Plot 42, Peenya Industrial Area, 2nd Stage, Bangalore, Karnataka 560058'],
        ['GSTIN: 29AABCU9603R1ZM | Phone: +91 80 2839 0000 | Email: sales@siddhikabel.com | Web: www.siddhikabel.com'],
        [],
        ['ESTIMATE'],
        [],
        ['Estimate Ref No:', quoteNo, '', 'Date:', dateStr],
        ['Status:', status, '', 'Assigned Executive:', assignedTo],
        ['Validity Period:', '7 Days', '', 'Expiry Status:', valInfo.countdownLabel],
      ];

      if (rfq.expiryComments) {
        rows.push(['Expiry Comments:', rfq.expiryComments]);
      }

      rows.push(
        [],
        ['BILLED TO (CUSTOMER MASTER):'],
        ['Company Name:', companyName],
        ['Contact Person:', customerName],
        ['Billing Address:', rfq.billingAddress || rfq.address || 'Registered Office'],
        ['Delivery Address:', rfq.deliveryAddress || rfq.billingAddress || 'Standard Factory Gate'],
        ['Email:', email, '', 'Phone:', phone],
      );

      const cleanSpecialInstructions = rfq.specialInstructions && !rfq.specialInstructions.includes('Requesting official quotation for the following items') ? rfq.specialInstructions : '';
      if (rfq.deliveryLocation || cleanSpecialInstructions) {
        rows.push(['Delivery Bay / Instructions:', `${rfq.deliveryLocation ? `Bay: ${rfq.deliveryLocation} | ` : ''}${cleanSpecialInstructions}`]);
      }

      rows.push([]);
      rows.push(['ESTIMATED ITEMS']);
      rows.push(['#', 'Part Number', 'Description', 'Core/Cross Section', 'UOM', 'Price (₹)', 'Weight', 'Outer Diameter (OD)', 'Validity', 'Brand', 'Qty', 'Amount (₹)']);

      if (rfq.items && rfq.items.length > 0) {
        rfq.items.forEach((item: any, idx: number) => {
          const qty = Number(item.qty) || 1;
          const rate = Number(item.unitPrice) || 0;
          const lineTotal = item.totalBeforeTax ? Number(item.totalBeforeTax) : (qty * rate);
          const itemVal = getQuotationValidityInfo(rfq);
          rows.push([
            idx + 1,
            item.partNo || '',
            item.description || item.name || '',
            formatCoreSqmm(item.core, item.sqmm || item.coreSize, item.name),
            formatUom(item.uom || item.unit),
            rate,
            formatWeight(item.weight, item.name),
            formatOD(item.outerDiameter, item.name),
            itemVal.countdownLabel,
            item.brand || 'LAPP',
            qty,
            lineTotal
          ]);
        });
      } else {
        rows.push([1, 'STANDARD-ITEM', 'Industrial Cables & Wires', '-', 'm', subtotal, '-', '-', valInfo.countdownLabel, 'LAPP', 1, subtotal]);
      }

      rows.push([]);
      rows.push(['', '', '', '', '', '', '', '', '', 'Subtotal (₹):', subtotal]);
      if (discountAmount > 0) {
        rows.push(['', '', '', '', '', `Discount (${discountRate}%):`, -discountAmount]);
        rows.push(['', '', '', '', '', 'Taxable Amount (₹):', taxableAmount]);
      }
      rows.push(['', '', '', '', '', 'GST (18%):', gstAmount]);
      rows.push(['', '', '', '', '', 'Estimate Total (₹):', grandTotal]);

      if (rfq.notes) {
        rows.push([]);
        rows.push(['Notes / Remarks:', rfq.notes]);
      }

      const ws = XLSX.utils.aoa_to_sheet(rows);
      ws['!cols'] = [
        { wch: 6 },
        { wch: 22 },
        { wch: 40 },
        { wch: 15 },
        { wch: 10 },
        { wch: 8 },
        { wch: 16 },
        { wch: 18 },
      ];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Estimate');
      const cleanQuoteNo = quoteNo.replace(/[^a-zA-Z0-9_-]/g, '_');
      XLSX.writeFile(wb, `Estimate_${cleanQuoteNo}.xlsx`);
    } catch (e) {
      console.error('Failed to export estimate Excel', e);
      alert('Failed to generate Excel estimate.');
    }
  };

  // Requirement 7: Total Excel Export (All Filtered RFQs Master List)
  const handleExportAllExcel = () => {
    if (rfqs.length === 0) return;
    try {
      const rows: (string | number)[][] = [
        ['Quote No', 'Date', 'Customer Name', 'Company Name', 'Email', 'Phone', 'Subtotal (₹)', 'Special Discount (%)', 'Discount (₹)', 'Grand Total (₹)', 'Status', 'Assigned To']
      ];

      sortedRfqs.forEach((r: any) => {
        const sub = r.subtotal ?? (r.grandTotal || 0);
        const discRate = r.discountRate || 0;
        const discAmt = r.discountAmount || 0;
        rows.push([
          r.quoteNo || '',
          r.date || (r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-IN') : ''),
          r.customerName || '',
          r.companyName || '',
          r.email || '',
          r.phone || '',
          sub,
          discRate,
          discAmt,
          r.grandTotal || 0,
          r.status || '',
          r.assignedToName || 'Unassigned'
        ]);
      });

      const ws = XLSX.utils.aoa_to_sheet(rows);
      ws['!cols'] = [
        { wch: 16 },
        { wch: 14 },
        { wch: 22 },
        { wch: 26 },
        { wch: 26 },
        { wch: 16 },
        { wch: 14 },
        { wch: 18 },
        { wch: 14 },
        { wch: 16 },
        { wch: 16 },
        { wch: 20 },
      ];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'All RFQs');
      const today = new Date().toISOString().split('T')[0];
      XLSX.writeFile(wb, `Siddhi_Quotations_Master_${today}.xlsx`);
    } catch (e) {
      console.error('Failed to export total Excel', e);
    }
  };

  // Status Badge rendering for preserved statuses: Pending, Under Review, PO Received, Closed, Lost, Expired
  const renderStatusBadge = (status: string, rfqItem?: RFQ) => {
    const norm = (status || 'Pending').trim();
    if (norm === 'Closed') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-200 text-slate-800 border border-slate-300 shadow-2xs">
          <CheckCircle size={13} className="text-slate-600" />
          Closed
        </span>
      );
    }
    if (norm === 'PO Received' || norm === 'Approved' || norm === 'Completed') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-300 shadow-2xs">
          <CheckCircle size={13} className="text-emerald-600" />
          PO Received
        </span>
      );
    }
    if (norm === 'Under Review') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-sky-50 text-sky-700 border border-sky-300 shadow-2xs">
          <Eye size={13} className="text-sky-600" />
          Under Review
        </span>
      );
    }
    if (norm === 'Lost') {
      return (
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300 shadow-2xs cursor-help"
          title={rfqItem?.lostReason ? `Reason: ${rfqItem.lostReason}` : 'Marked as Lost'}
        >
          <X size={13} className="text-slate-500" />
          Lost {rfqItem?.lostReason ? `(${rfqItem.lostReason.slice(0, 14)}...)` : ''}
        </span>
      );
    }
    if (norm === 'Expired') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-red-100 text-red-800 border border-red-300 shadow-2xs">
          <AlertCircle size={13} className="text-red-600 animate-pulse" />
          Expired (7d)
        </span>
      );
    }
    // Pending (Default)
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-700 border border-amber-300 shadow-2xs">
        <Clock size={13} className="text-amber-600" />
        Pending
      </span>
    );
  };

  // Filtered & Date-Sorted RFQs
  const sortedRfqs = useMemo(() => {
    const filtered = rfqs.filter(r => {
      // 1. Text Search Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches =
          (r.quoteNo && r.quoteNo.toLowerCase().includes(q)) ||
          (r.customerName && r.customerName.toLowerCase().includes(q)) ||
          (r.companyName && r.companyName.toLowerCase().includes(q)) ||
          (r.email && r.email.toLowerCase().includes(q)) ||
          (r.phone && r.phone.includes(q)) ||
          (r.assignedToName && r.assignedToName.toLowerCase().includes(q)) ||
          (r.lostReason && r.lostReason.toLowerCase().includes(q)) ||
          (r.expiryComments && r.expiryComments.toLowerCase().includes(q));
        if (!matches) return false;
      }

      // 2. Status Pipeline Filter: Unassigned, Pending, Under Review, PO Received, Closed, Lost, Expired
      if (statusFilter === 'All') return true;
      if (statusFilter === 'Unassigned') {
        return !r.assignedTo && !r.assignedToName;
      }
      if (statusFilter === 'Pending') {
        return r.status === 'Pending' || r.status === 'New' || r.status === 'Open' || r.status === 'Assigned' || r.status === 'RFQ Submitted' || r.status === 'Generated' || r.status === 'Process by Sales' || r.status === 'Processing';
      }
      if (statusFilter === 'Under Review') return r.status === 'Under Review';
      if (statusFilter === 'PO Received') return r.status === 'PO Received' || r.status === 'Approved' || r.status === 'Completed';
      if (statusFilter === 'Closed') return r.status === 'Closed';
      if (statusFilter === 'Lost') return r.status === 'Lost';
      if (statusFilter === 'Expired') return r.status === 'Expired';
      return true;
    });

    // 3. Date & Validity Sorting (Ascending / Descending by RFQ Generation Date)
    return filtered.sort((a, b) => {
      const parseDate = (d?: string | null) => {
        if (!d) return 0;
        const t = new Date(d).getTime();
        if (!isNaN(t)) return t;
        const parts = String(d).split(/[-/]/);
        if (parts.length === 3) {
          const parsed = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`).getTime();
          if (!isNaN(parsed)) return parsed;
        }
        return 0;
      };
      const timeA = parseDate(a.createdAt || a.date);
      const timeB = parseDate(b.createdAt || b.date);
      return dateSortOrder === 'desc' ? timeB - timeA : timeA - timeB;
    });
  }, [rfqs, searchQuery, statusFilter, dateSortOrder]);

  const expiredCount = useMemo(() => rfqs.filter(r => r.status === 'Expired').length, [rfqs]);

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            RFQ & Estimate Management
            {isRefreshing && <RefreshCw size={14} className="animate-spin text-red-500" />}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            {isAdmin
              ? 'Assign RFQs to sales executives, monitor 7-day expiry, and track commercial estimates.'
              : 'Review your assigned RFQs, move active quotes to Under Review, apply customer discounts, and update closure status.'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {isAdmin && selectedIds.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="flex-shrink-0 flex items-center px-3.5 py-1.5 bg-red-50 text-red-600 font-semibold rounded-lg hover:bg-red-100 transition-colors border border-red-200 text-xs cursor-pointer"
            >
              <Trash2 size={14} className="mr-1.5" />
              Delete Selected ({selectedIds.length})
            </button>
          )}
          <button
            onClick={handleExportAllExcel}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors font-semibold text-xs shadow-sm cursor-pointer"
            title="Download full RFQ spreadsheet summary"
          >
            <FileSpreadsheet size={14} />
            Export All
          </button>
          <button
            onClick={() => fetchData(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors font-semibold text-xs cursor-pointer"
            title="Sync data in background"
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Requirement 2.5: Automatic 7-Day Expiry Notification Banner in RFQ Area */}
      {expiredCount > 0 && (
        <div className="bg-red-50 border border-red-300 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-red-950 shadow-2xs">
          <div className="flex items-start sm:items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5 sm:mt-0" />
            <div>
              <span className="font-extrabold text-red-900">
                {expiredCount} RFQ(s) have Expired automatically (7 days reached since assignment).
              </span>
              <span className="block text-[11px] text-red-700 mt-0.5">
                Requirement 2.5: Sales executives must take action before expiry by transitioning active quotes to Under Review or marking Lost/PO Received.
              </span>
            </div>
          </div>
          <button
            onClick={() => setStatusFilter('Expired')}
            className="self-start sm:self-auto px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs shrink-0 cursor-pointer shadow-xs transition-colors"
          >
            Filter Expired RFQs ({expiredCount})
          </button>
        </div>
      )}

      {/* Search Input Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-2.5 sm:p-3 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search RFQs by quote #, customer, company, email, phone, salesperson, lost reason..."
            className="w-full pl-10 pr-9 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
              title="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>
        {searchQuery && (
          <span className="text-xs text-slate-500 font-medium px-2">
            Showing {sortedRfqs.length} matching result{sortedRfqs.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Status Filter Tabs: All, Unassigned, Pending, Under Review, PO Received, Closed, Lost, Expired */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-semibold no-scrollbar">
        {[
          { key: 'All', label: `All (${rfqs.length})`, active: 'bg-slate-800 text-white font-bold', inactive: 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200' },
          { key: 'Unassigned', label: `Unassigned (${rfqs.filter(r => !r.assignedTo && !r.assignedToName).length})`, active: 'bg-purple-700 text-white font-bold shadow-xs', inactive: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100' },
          { key: 'Pending', label: `Pending (${rfqs.filter(r => r.status === 'Pending' || r.status === 'New' || r.status === 'Open' || r.status === 'Assigned' || r.status === 'RFQ Submitted' || r.status === 'Generated' || r.status === 'Process by Sales' || r.status === 'Processing').length})`, active: 'bg-amber-600 text-white font-bold shadow-xs', inactive: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' },
          { key: 'Under Review', label: `Under Review (${rfqs.filter(r => r.status === 'Under Review').length})`, active: 'bg-sky-600 text-white font-bold shadow-xs', inactive: 'bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100' },
          { key: 'PO Received', label: `PO Received (${rfqs.filter(r => r.status === 'PO Received' || r.status === 'Approved' || r.status === 'Completed').length})`, active: 'bg-emerald-600 text-white font-bold shadow-xs', inactive: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' },
          { key: 'Closed', label: `Closed (${rfqs.filter(r => r.status === 'Closed').length})`, active: 'bg-slate-700 text-white font-bold shadow-xs', inactive: 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200' },
          { key: 'Lost', label: `Lost (${rfqs.filter(r => r.status === 'Lost').length})`, active: 'bg-slate-600 text-white font-bold shadow-xs', inactive: 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200' },
          { key: 'Expired', label: `Expired (${rfqs.filter(r => r.status === 'Expired').length})`, active: 'bg-red-600 text-white font-bold shadow-xs', inactive: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100' },
        ].map(({ key, label, active, inactive }) => (
          <button
            key={key}
            onClick={() => setStatusFilter(key)}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all border shadow-2xs cursor-pointer ${statusFilter === key ? active : inactive
              }`}
          >
            {label}
          </button>
        ))}
      </div>
      {/* RFQ Data Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm table-fixed min-w-[780px]">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs">
              <tr>
                {isAdmin && (
                  <th className="py-2.5 px-1 w-8 text-center font-semibold shrink-0">
                    <input
                      type="checkbox"
                      checked={sortedRfqs.length > 0 && selectedIds.length === sortedRfqs.length}
                      onChange={handleSelectAll}
                      className="rounded border-slate-300 text-red-600 focus:ring-red-500 cursor-pointer w-3.5 h-3.5"
                    />
                  </th>
                )}
                <th className="py-2.5 px-1 w-9 text-center font-bold text-slate-600 shrink-0">S.No.</th>
                <th className="py-2.5 px-1.5 font-semibold w-28 shrink-0">RFQ Number</th>
                <th className="py-2.5 px-2 font-semibold w-36 sm:w-40">Client Name</th>
                <th className="py-2.5 px-1.5 font-semibold w-26 shrink-0">
                  <button
                    type="button"
                    onClick={() => setDateSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                    className="inline-flex items-center gap-1 hover:text-slate-900 font-bold transition-colors cursor-pointer group"
                    title={`Sort by Date (${dateSortOrder === 'desc' ? 'Newest First' : 'Oldest First'})`}
                  >
                    <span>Date &amp; Validity</span>
                    {dateSortOrder === 'desc' ? (
                      <ArrowDown size={12} className="text-red-600 shrink-0" />
                    ) : (
                      <ArrowUp size={12} className="text-red-600 shrink-0" />
                    )}
                  </button>
                </th>
                <th className="py-2.5 px-2 font-semibold text-right w-24 shrink-0">Amount (₹)</th>
                <th className="py-2.5 px-1.5 font-semibold w-26 shrink-0">Status</th>
                <th className="py-2.5 px-1.5 font-semibold w-28 shrink-0">Assigned To</th>
                <th className="py-2.5 px-1 font-semibold text-center w-16 shrink-0">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {loading ? (
                <tr>
                  <td colSpan={isAdmin ? 9 : 8} className="py-12 text-center text-slate-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-red-600" />
                    Loading RFQs...
                  </td>
                </tr>
              ) : sortedRfqs.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 9 : 8} className="py-12 text-center">
                    <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-base font-semibold text-slate-900">No RFQs Found</h3>
                    <p className="text-xs text-slate-400 mt-1">No quotation requests match your search or filter criteria.</p>
                  </td>
                </tr>
              ) : (
                sortedRfqs.map((rfq, index) => {
                  const val = getQuotationValidityInfo(rfq);
                  return (
                    <tr key={rfq._id} className="hover:bg-red-50/20 transition-colors group">
                      {isAdmin && (
                        <td className="py-2 px-1 text-center align-middle">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(rfq._id)}
                            onChange={() => handleSelectOne(rfq._id)}
                            className="rounded border-slate-300 text-red-600 focus:ring-red-500 cursor-pointer w-3.5 h-3.5"
                          />
                        </td>
                      )}
                      <td className="py-2 px-1 text-center font-bold text-slate-500 text-xs align-middle">
                        {index + 1}
                      </td>
                      <td
                        className="py-2 px-1.5 font-mono font-bold text-sky-700 hover:text-sky-900 cursor-pointer align-middle whitespace-nowrap"
                        onClick={() => setSelectedRfq(rfq)}
                      >
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200 font-bold hover:bg-sky-100 transition-colors shadow-2xs font-mono text-[11px]">
                          <FileText size={11} className="text-sky-600 shrink-0" />
                          <span className="truncate">{rfq.quoteNo}</span>
                        </span>
                      </td>
                      <td
                        className="py-2 px-2 cursor-pointer align-middle overflow-hidden"
                        onClick={() => setSelectedRfq(rfq)}
                      >
                        <div className="font-semibold text-slate-900 group-hover:text-red-700 transition-colors leading-snug truncate text-xs" title={rfq.companyName || rfq.customerName || 'Direct Client'}>
                          {rfq.companyName || rfq.customerName || 'Direct Client'}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate" title={rfq.customerName || rfq.email || ''}>
                          {rfq.companyName && rfq.customerName && rfq.companyName !== rfq.customerName
                            ? rfq.customerName
                            : (rfq.email || rfq.phone || '')}
                        </div>
                      </td>
                      <td className="py-2 px-1.5 text-xs font-semibold text-slate-700 whitespace-nowrap align-middle">
                        <div>
                          <div className="font-bold text-slate-800 text-[11px]">
                            {new Date(rfq.createdAt || rfq.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </div>
                          <div className="mt-0.5 flex items-center gap-1">
                            <span className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-bold ${val.isActionTaken
                                ? (rfq.status === 'Under Review' ? 'bg-sky-50 text-sky-800 border border-sky-200' : 'bg-slate-100 text-slate-800 border border-slate-200')
                                : val.isExpired
                                  ? 'bg-red-100 text-red-800 border border-red-200'
                                  : val.remainingDays <= 2
                                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              }`}>
                              <Clock size={9} className="shrink-0" />
                              {val.countdownLabel}
                            </span>
                          </div>
                          {/* Show comments when quotation expires */}
                          {val.isExpired && (
                            <div
                              className="mt-0.5 text-[9px] text-red-900 bg-red-50/90 border border-red-200 px-1 py-0.2 rounded truncate max-w-[110px] cursor-help"
                              title={rfq.expiryComments || 'Quotation expired after 7 days validity period.'}
                            >
                              💬 {rfq.expiryComments || 'Expired'}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-2 px-2 font-mono font-bold text-slate-900 text-right align-middle whitespace-nowrap">
                        <div className="text-xs">
                          ₹{Number(rfq.grandTotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        {Boolean(rfq.discountAmount && rfq.discountAmount > 0) && (
                          <div className="text-[10px] text-emerald-600 font-semibold flex items-center justify-end gap-0.5">
                            <Tag size={9} className="shrink-0" /> -{rfq.discountRate || ''}% off
                          </div>
                        )}
                      </td>

                      <td className="py-2 px-1.5 align-middle">
                        <div className="w-full">
                          <select
                            value={rfq.status}
                            onChange={(e) => handleInitiateStatusChange(rfq._id, e.target.value, rfq)}
                            className={`w-full text-[11px] font-bold rounded-lg px-1.5 py-1 border outline-none cursor-pointer shadow-2xs transition-all ${rfq.status === 'PO Received' || rfq.status === 'Completed' || rfq.status === 'Approved'
                                ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                                : rfq.status === 'Closed'
                                  ? 'border-slate-400 bg-slate-200 text-slate-900 font-extrabold'
                                  : rfq.status === 'Under Review'
                                    ? 'border-sky-300 bg-sky-50 text-sky-800'
                                    : rfq.status === 'Lost'
                                      ? 'border-slate-300 bg-slate-100 text-slate-800'
                                      : rfq.status === 'Expired'
                                        ? 'border-red-300 bg-red-100 text-red-900 font-extrabold'
                                        : 'border-amber-300 bg-amber-50 text-amber-800'
                              } focus:ring-2 focus:ring-red-500`}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Under Review">Under Review</option>
                            <option value="PO Received">PO Received</option>
                            <option value="Closed">Closed</option>
                            <option value="Lost">Lost</option>
                            {rfq.status === 'Expired' && <option value="Expired">Expired</option>}
                          </select>
                          {rfq.status === 'Lost' && rfq.lostReason && (
                            <div className="text-[9px] text-slate-500 truncate mt-0.5" title={rfq.lostReason}>
                              {rfq.lostReason}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Assigned Salesperson Column (Admin assigns, Sales views) */}
                      <td className="py-2 px-1.5 align-middle">
                        {canAssign ? (
                          <select
                            className="w-full text-[11px] bg-white border border-slate-300 rounded-lg px-1.5 py-1 font-medium text-slate-800 shadow-xs focus:ring-2 focus:ring-red-500 focus:border-red-500 cursor-pointer"
                            value={getAssignedUserId(rfq.assignedTo, rfq.assignedToName)}
                            onChange={(e) => handleAssign(rfq._id, e.target.value)}
                          >
                            <option value="">-- Assign --</option>
                            {users.map(u => (
                              <option key={u._id} value={u._id}>
                                {u.name} ({u.role?.replace('Sales ', '')})
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[11px] font-semibold ${rfq.assignedToName
                              ? 'bg-slate-100 text-slate-800 border border-slate-200 shadow-2xs'
                              : 'bg-slate-50 text-slate-400 border border-slate-200'
                            }`}>
                            <UserIcon size={11} className="text-slate-500 shrink-0" />
                            <span className="truncate max-w-[80px]">{rfq.assignedToName || 'Unassigned'}</span>
                          </span>
                        )}
                      </td>

                      {/* Actions: View Details, Return to Sales, Excel, Delete */}
                      <td className="py-2 px-1 text-center whitespace-nowrap align-middle">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setSelectedRfq(rfq)}
                            className="p-1 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                            title="View Full Quotation Details"
                          >
                            <Eye size={13} />
                          </button>
                          <button
                            onClick={() => handleExportSingleRfqExcel(rfq)}
                            className="p-1 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded transition-colors cursor-pointer"
                            title="Download Individual Quotation Excel (.xlsx)"
                          >
                            <FileSpreadsheet size={13} />
                          </button>
                          {isAdmin && (
                            <button
                              onClick={() => handleDelete(rfq._id)}
                              className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                              title="Delete RFQ"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RFQ Detail & Quotation Modal: Portal-Mounted, Permanently Pinned Top Header */}
      {selectedRfq && (() => {
        const modalValInfo = getQuotationValidityInfo(selectedRfq);
        const quoteSubtotal = selectedRfq.items && selectedRfq.items.length > 0
          ? selectedRfq.items.reduce((sum: number, it: any) => {
              const q = Number(it.qty) || 1;
              const r = Number(it.unitPrice) || 0;
              return sum + (it.totalBeforeTax ? Number(it.totalBeforeTax) : (q * r));
            }, 0)
          : (Number(selectedRfq.subtotal) || 0);
        const qDiscAmt = Number(selectedRfq.discountAmount) || 0;
        const qDiscRate = Number(selectedRfq.discountRate) || 0;
        const qTaxable = Math.max(0, quoteSubtotal - qDiscAmt);
        const qGst = Number((selectedRfq as any).gstAmount) || (Number((selectedRfq as any).cgst || 0) + Number((selectedRfq as any).sgst || 0)) || (qTaxable * 0.18);
        const qGrandTotal = Number(selectedRfq.grandTotal) || (qTaxable + qGst);

        return createPortal(
          <div
            id="rfq-print-overlay"
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-[99999] p-0 sm:p-4 md:p-6 overflow-hidden print:p-0 print:bg-white print:static print:inset-auto print:overflow-visible"
            onClick={(e) => {
              if (e.target === e.currentTarget && !isEditingPrice) handleCloseModal();
            }}
          >
            <div id="rfq-print-card" className="bg-white shadow-2xl w-full max-w-5xl h-full sm:h-auto sm:max-h-[92vh] flex flex-col relative my-0 animate-in zoom-in-95 duration-150 print:w-full print:h-auto print:max-h-none print:shadow-none print:m-0 print:p-0 rounded-none sm:rounded-2xl overflow-hidden border-0 sm:border border-slate-200">

              {/* Top Toolbar: Fully responsive for Mobile & Desktop (Hidden on Print) */}
              <div id="rfq-print-toolbar" className="bg-slate-50 text-slate-800 border-b border-slate-200 px-3 sm:px-5 py-2 sm:py-2.5 print:hidden shrink-0 z-30 shadow-2xs">
                {/* Mobile Top Header Row (< sm): Back Button + Quote Number + Total + Close X */}
                <div className="flex sm:hidden items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-200">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <button
                      onClick={handleCloseModal}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 shadow-2xs transition-colors cursor-pointer shrink-0"
                      title="Back to RFQ List"
                    >
                      <ArrowLeft size={14} />
                      <span>Back</span>
                    </button>
                    <span className="text-xs font-bold font-mono text-slate-900 bg-white px-2 py-1 rounded-lg border border-slate-200 truncate">
                      {selectedRfq.quoteNo}
                    </span>
                    <span className="text-xs font-black font-mono text-red-700 bg-red-50 border border-red-200 px-2 py-1 rounded-lg shrink-0">
                      ₹{qGrandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <button
                    onClick={handleCloseModal}
                    className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-red-600 hover:text-white text-slate-600 border border-slate-200 transition-colors cursor-pointer shrink-0 shadow-2xs"
                    title="Close Modal (Esc)"
                    aria-label="Close Modal"
                  >
                    <X size={18} strokeWidth={2.5} />
                  </button>
                </div>

                {/* Main Controls Row (Desktop: single line; Mobile: clean compact wrapped controls) */}
                <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 flex-wrap sm:flex-nowrap">
                    {/* Back Button (Desktop only) */}
                    <button
                      onClick={handleCloseModal}
                      className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 shadow-2xs transition-colors cursor-pointer shrink-0"
                      title="Return to RFQ List"
                    >
                      <ArrowLeft size={14} />
                      <span>Back</span>
                    </button>

                    {/* Status: Admin & Sales can manage status with preserved statuses: Pending, Under Review, PO Received, Closed, Lost, Expired */}
                    <div className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-xl border shadow-2xs shrink-0 ${selectedRfq.status === 'PO Received' || selectedRfq.status === 'Completed' || selectedRfq.status === 'Approved'
                        ? 'bg-emerald-50 border-emerald-300'
                        : selectedRfq.status === 'Closed'
                          ? 'bg-slate-200 border-slate-400'
                          : selectedRfq.status === 'Under Review'
                            ? 'bg-sky-50 border-sky-300'
                            : selectedRfq.status === 'Lost'
                              ? 'bg-slate-100 border-slate-300'
                              : selectedRfq.status === 'Expired'
                                ? 'bg-red-50 border-red-300'
                                : 'bg-white border-slate-200'
                      }`}>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider hidden md:inline">Status:</span>
                      <select
                        value={selectedRfq.status}
                        onChange={(e) => handleInitiateStatusChange(selectedRfq._id, e.target.value, selectedRfq)}
                        className={`text-xs font-bold bg-transparent outline-none cursor-pointer ${selectedRfq.status === 'PO Received' || selectedRfq.status === 'Completed' || selectedRfq.status === 'Approved'
                            ? 'text-emerald-800 font-extrabold'
                            : selectedRfq.status === 'Closed'
                              ? 'text-slate-900 font-extrabold'
                              : selectedRfq.status === 'Under Review'
                                ? 'text-sky-800 font-extrabold'
                                : selectedRfq.status === 'Lost'
                                  ? 'text-slate-700 font-bold'
                                  : selectedRfq.status === 'Expired'
                                    ? 'text-red-700 font-extrabold'
                                    : 'text-amber-700'
                          }`}
                      >
                        <option value="Pending" className="bg-white text-slate-900">Pending</option>
                        <option value="Under Review" className="bg-white text-slate-900">Under Review</option>
                        <option value="PO Received" className="bg-white text-slate-900">PO Received</option>
                        <option value="Closed" className="bg-white text-slate-900">Closed</option>
                        <option value="Lost" className="bg-white text-slate-900">Lost</option>
                        {selectedRfq.status === 'Expired' && <option value="Expired" className="bg-white text-slate-900">Expired</option>}
                      </select>
                    </div>

                    {/* Assignment: Admin assigns salesperson. Sales views assigned name */}
                    {canAssign ? (
                      <div className="flex items-center gap-1 sm:gap-1.5 bg-white px-2 sm:px-2.5 py-1 rounded-xl border border-slate-200 shadow-2xs shrink-0">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider hidden md:inline">Assign:</span>
                        <select
                          value={getAssignedUserId(selectedRfq.assignedTo, selectedRfq.assignedToName)}
                          onChange={(e) => handleAssign(selectedRfq._id, e.target.value)}
                          className="text-xs font-bold bg-transparent text-red-600 outline-none cursor-pointer max-w-[100px] sm:max-w-[160px] truncate"
                        >
                          <option value="" className="bg-white text-slate-900">-- Assign --</option>
                          {users.map(u => (
                            <option key={u._id} value={u._id} className="bg-white text-slate-900">
                              {u.name} ({u.role?.replace('Sales ', '')})
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <div className="bg-white border border-slate-200 px-2 sm:px-2.5 py-1 rounded-xl text-xs font-semibold text-slate-600 shadow-2xs shrink-0 flex items-center gap-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider hidden md:inline">Staff:</span>
                        <span className="font-bold text-slate-900 truncate max-w-[90px] sm:max-w-[110px]">{selectedRfq.assignedToName || 'Sales Team'}</span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons: Edit Price & Discount, Download Excel, Print, Close */}
                  <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 ml-auto">
                    {/* Special Discount & Price Edit Toggle */}
                    <button
                      onClick={() => setIsEditingPrice(!isEditingPrice)}
                      className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-xl transition-all font-bold text-xs border cursor-pointer shrink-0 ${isEditingPrice
                          ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                          : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200 shadow-2xs'
                        }`}
                      title="Edit quotation item rates and special customer discount"
                    >
                      <Tag size={13} />
                      <span>{isEditingPrice ? 'Close' : 'Price / Discount'}</span>
                    </button>

                    {/* Individual Excel Download */}
                    <button
                      onClick={() => handleExportSingleRfqExcel(selectedRfq)}
                      className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all font-bold text-xs shadow-sm cursor-pointer shrink-0"
                      title="Download this quotation as Microsoft Excel (.xlsx)"
                    >
                      <FileSpreadsheet size={14} />
                      <span className="hidden xs:inline">Export</span>
                    </button>

                    {/* Print Button */}
                    <button
                      onClick={() => window.print()}
                      className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 bg-gradient-to-r from-red-600 via-red-600 to-rose-600 hover:opacity-95 text-white rounded-xl transition-all font-bold text-xs shadow-sm cursor-pointer shrink-0"
                      title="Print Quotation"
                    >
                      <Printer size={14} />
                      <span className="hidden xs:inline">Print</span>
                    </button>

                    {/* Desktop Close Button */}
                    <div className="hidden sm:block h-5 w-px bg-slate-200 mx-0.5 sm:mx-1 shrink-0" />
                    <button
                      onClick={handleCloseModal}
                      className="hidden sm:flex w-8 h-8 items-center justify-center rounded-xl bg-slate-100 hover:bg-red-600 hover:text-white text-slate-600 border border-slate-200 transition-colors cursor-pointer shrink-0 shadow-2xs hover:border-red-600"
                      title="Close Quotation View (Esc)"
                      aria-label="Close Modal"
                    >
                      <X size={18} strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Price & Special Discount Editor Drawer */}
              {isEditingPrice && (
                <div className="bg-gradient-to-r from-amber-50/90 via-orange-50/70 to-amber-50/90 border-b border-amber-200 p-4 sm:p-5 shrink-0 animate-in slide-in-from-top-3 duration-200 print:hidden overflow-y-auto max-h-[48vh] custom-scrollbar">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-amber-200/80 mb-3">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <Tag size={16} className="text-amber-600" />
                        Quotation Price & Special Discount Management
                      </h3>
                      <p className="text-xs text-slate-600">
                        Revise unit rates and apply customer project discounts before finalizing quotation.
                      </p>
                    </div>
                    {priceSuccessMsg && (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold animate-in fade-in">
                        <Check size={14} />
                        {priceSuccessMsg}
                      </div>
                    )}
                  </div>

                  {/* Editable Items Table with Technical Specs */}
                  <div className="bg-white rounded-xl border border-amber-200 overflow-hidden mb-4 shadow-2xs">
                    {/* Mobile Card Editor View (< md) */}
                    <div className="block md:hidden divide-y divide-slate-100 p-2.5 space-y-3">
                      {editItems.map((item, idx) => {
                        const coreSqmm = formatCoreSqmm(item.core || item.coreSize, item.sqmm, item.name);
                        const uomAbbr = formatUom(item.uom || item.unit);
                        const lineTotal = (Number(item.qty) || 1) * (Number(item.unitPrice) || 0);
                        return (
                          <div key={idx} className="bg-slate-50/70 p-3 rounded-xl border border-slate-200 text-xs space-y-2">
                            <div className="flex items-start justify-between gap-1.5">
                              <div>
                                <span className="font-bold text-slate-900 font-mono text-xs">{item.partNo || `Item #${idx + 1}`}</span>
                                <span className="text-slate-600 block text-[11px] line-clamp-1">{item.description || item.name}</span>
                              </div>
                              {coreSqmm !== '-' && (
                                <span className="px-1.5 py-0.5 rounded bg-white text-slate-700 font-mono text-[10px] border border-slate-200 shrink-0 font-semibold">
                                  {coreSqmm}
                                </span>
                              )}
                            </div>
                            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/80">
                              <div>
                                <label className="text-[10px] font-bold text-slate-500 block mb-1">Qty ({uomAbbr})</label>
                                <input
                                  type="number"
                                  min="1"
                                  value={item.qty}
                                  onChange={(e) => {
                                    const val = Math.max(1, Number(e.target.value) || 1);
                                    setEditItems(prev => prev.map((it, i) => i === idx ? { ...it, qty: val } : it));
                                  }}
                                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white font-mono font-medium focus:ring-1 focus:ring-amber-500 outline-none text-xs"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] font-bold text-slate-500 block mb-1">Unit Rate (₹)</label>
                                <input
                                  type="number"
                                  min="0"
                                  step="any"
                                  value={item.unitPrice}
                                  onChange={(e) => {
                                    const val = Math.max(0, Number(e.target.value) || 0);
                                    setEditItems(prev => prev.map((it, i) => i === idx ? { ...it, unitPrice: val } : it));
                                  }}
                                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white font-mono font-bold text-red-700 focus:ring-1 focus:ring-red-500 outline-none text-xs"
                                />
                              </div>
                            </div>
                            <div className="flex justify-between items-center text-xs pt-1.5 border-t border-slate-200/60">
                              <span className="text-slate-500 font-semibold text-[11px]">Item Total:</span>
                              <span className="font-mono font-bold text-slate-900 text-sm">₹{lineTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Desktop Table Editor (>= md) */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full text-xs text-left min-w-[750px]">
                        <thead className="bg-slate-100/80 text-slate-700 border-b border-slate-200">
                          <tr>
                            <th className="py-2 px-3 font-semibold">Part Number &amp; Description</th>
                            <th className="py-2 px-3 font-semibold">Core / Cross Section</th>
                            <th className="py-2 px-3 font-semibold text-center w-16">UOM</th>
                            <th className="py-2 px-3 font-semibold text-center w-20">Weight</th>
                            <th className="py-2 px-3 font-semibold text-center w-20">OD</th>
                            <th className="py-2 px-3 font-semibold w-24">Qty</th>
                            <th className="py-2 px-3 font-semibold w-32">Unit Rate (₹)</th>
                            <th className="py-2 px-3 font-semibold text-right w-32">Line Total (₹)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {editItems.map((item, idx) => (
                            <tr key={idx} className="hover:bg-amber-50/40">
                              <td className="py-2 px-3">
                                <span className="font-bold text-slate-800 font-mono">{item.partNo || `Item #${idx + 1}`}</span>
                                <span className="text-slate-500 block text-[11px] truncate max-w-xs">{item.description || item.name}</span>
                              </td>
                              <td className="py-2 px-3 font-mono text-[11px] text-slate-700">
                                {formatCoreSqmm(item.core || item.coreSize, item.sqmm, item.name)}
                              </td>
                              <td className="py-2 px-3 text-center">
                                <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-xs uppercase border border-slate-200">
                                  {formatUom(item.uom || item.unit)}
                                </span>
                              </td>
                              <td className="py-2 px-3 text-center text-slate-600 font-mono text-[11px]">
                                {formatWeight(item.weight, item.name)}
                              </td>
                              <td className="py-2 px-3 text-center text-slate-600 font-mono text-[11px]">
                                {formatOD(item.outerDiameter, item.name)}
                              </td>
                              <td className="py-2 px-3">
                                <input
                                  type="number"
                                  min="1"
                                  value={item.qty}
                                  onChange={(e) => {
                                    const val = Math.max(1, Number(e.target.value) || 1);
                                    setEditItems(prev => prev.map((it, i) => i === idx ? { ...it, qty: val } : it));
                                  }}
                                  className="w-20 px-2 py-1 border border-slate-200 rounded-md bg-white font-mono font-medium focus:ring-1 focus:ring-amber-500 outline-none"
                                />
                              </td>
                              <td className="py-2 px-3">
                                <input
                                  type="number"
                                  min="0"
                                  step="any"
                                  value={item.unitPrice}
                                  onChange={(e) => {
                                    const val = Math.max(0, Number(e.target.value) || 0);
                                    setEditItems(prev => prev.map((it, i) => i === idx ? { ...it, unitPrice: val } : it));
                                  }}
                                  className="w-28 px-2 py-1 border border-slate-200 rounded-md bg-white font-mono font-semibold text-red-700 focus:ring-1 focus:ring-red-500 outline-none"
                                />
                              </td>
                              <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                                ₹{((item.qty || 1) * (item.unitPrice || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Special Discount Controls & Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Discount Input */}
                    <div className="bg-white p-3.5 rounded-xl border border-amber-200 space-y-3 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <Tag size={13} className="text-amber-600" />
                          Special Customer Discount
                        </label>
                        <div className="flex items-center rounded-lg border border-slate-200 overflow-hidden text-xs">
                          <button
                            type="button"
                            onClick={() => setEditDiscountType('percent')}
                            className={`px-2 py-0.5 font-bold cursor-pointer ${editDiscountType === 'percent' ? 'bg-amber-500 text-white' : 'bg-slate-50 text-slate-600'
                              }`}
                          >
                            % Percent
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditDiscountType('amount')}
                            className={`px-2 py-0.5 font-bold cursor-pointer ${editDiscountType === 'amount' ? 'bg-amber-500 text-white' : 'bg-slate-50 text-slate-600'
                              }`}
                          >
                            ₹ Flat Amount
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          max={editDiscountType === 'percent' ? 100 : pricingCalc.subtotal}
                          step="any"
                          value={editDiscountValue}
                          onChange={(e) => setEditDiscountValue(Number(e.target.value) || 0)}
                          placeholder={editDiscountType === 'percent' ? 'Discount % (e.g. 5)' : 'Discount ₹ (e.g. 5000)'}
                          className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg text-sm font-bold font-mono focus:ring-2 focus:ring-amber-500 outline-none"
                        />
                        <span className="text-xs font-semibold text-slate-500">
                          {editDiscountType === 'percent' ? '%' : '₹'}
                        </span>
                      </div>

                      <div>
                        <input
                          type="text"
                          value={editNotes}
                          onChange={(e) => setEditNotes(e.target.value)}
                          placeholder="Discount notes (e.g. Approved 5% special bulk discount for client)"
                          className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs placeholder:text-slate-400 focus:ring-1 focus:ring-amber-500 outline-none"
                        />
                      </div>
                    </div>

                    {/* Real-time Calculation Card */}
                    <div className="bg-white p-3.5 rounded-xl border border-amber-200 space-y-1.5 text-xs shadow-2xs">
                      <div className="flex justify-between text-slate-600">
                        <span>Subtotal (Items):</span>
                        <span className="font-mono font-medium">₹{pricingCalc.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                      </div>
                      {pricingCalc.discountAmount > 0 && (
                        <div className="flex justify-between text-emerald-600 font-semibold">
                          <span>Special Discount ({pricingCalc.discountRate}%):</span>
                          <span className="font-mono">-₹{pricingCalc.discountAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-slate-600">
                        <span>Taxable Amount:</span>
                        <span className="font-mono font-medium">₹{pricingCalc.taxableAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>GST (18%):</span>
                        <span className="font-mono font-medium">₹{pricingCalc.gstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
                        <span>Revised Grand Total:</span>
                        <span className="font-mono text-base text-red-700">₹{pricingCalc.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                      </div>

                      <div className="pt-2 flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setIsEditingPrice(false)}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 font-semibold text-xs cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveQuotationPrice}
                          disabled={isSavingPrice}
                          className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
                        >
                          {isSavingPrice ? <RefreshCw size={13} className="animate-spin" /> : <Save size={13} />}
                          Save Revised Quotation
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Official Invoice / Bill Document Area - Scrollable Inside Card */}
              <div id="rfq-print-content" className="p-3 sm:p-5 md:p-6 print:p-0 print:overflow-visible bg-white flex-1 overflow-y-auto custom-scrollbar">

                {/* Header: Logo and Company Info */}
                <div className="flex flex-col sm:flex-row justify-between items-start border-b-2 border-slate-900 pb-3 sm:pb-4 mb-3 sm:mb-4 gap-3 sm:gap-0">
                  <div>
                    <img
                      src="/images/siddhi-kabel-lockup.png"
                      alt="Siddhi Kabel"
                      className="h-10 sm:h-12 w-auto object-contain mb-2"
                      onError={(e) => { e.currentTarget.src = '/images/siddhi-kabel-logo.png'; }}
                    />
                    <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">SIDDHI KABEL CORP PVT LTD</h1>
                    <p className="text-xs text-slate-500 mt-0.5">Plot 42, Peenya Industrial Area, 2nd Stage, Bangalore 560058</p>
                    <p className="text-xs font-medium text-slate-600">GSTIN: 29AABCU9603R1ZM</p>
                  </div>
                  <div className="w-full sm:w-auto sm:text-right mt-2 sm:mt-0 bg-slate-50 p-2.5 sm:p-3 rounded-xl border border-slate-200 sm:min-w-[260px] shadow-2xs">
                    <h2 className="text-lg sm:text-xl font-black text-slate-800 mb-0.5">ESTIMATE</h2>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-left">
                      <span className="text-slate-500 font-medium">Estimate / RFQ #:</span>
                      <span className="font-bold text-slate-900 font-mono text-right">{selectedRfq.quoteNo}</span>
                      <span className="text-slate-500 font-medium">Date:</span>
                      <span className="font-bold text-slate-900 text-right">{selectedRfq.date || new Date(selectedRfq.createdAt).toLocaleDateString()}</span>
                      <span className="text-slate-500 font-medium">Validity:</span>
                      <div className="text-right">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${modalValInfo.isActionTaken
                            ? (selectedRfq.status === 'Under Review' ? 'bg-sky-100 text-sky-800 border border-sky-300' : 'bg-slate-100 text-slate-800 border border-slate-300')
                            : modalValInfo.isExpired
                              ? 'bg-rose-100 text-rose-800 border border-rose-300'
                              : modalValInfo.remainingDays <= 2
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          }`}>
                          <Clock size={11} />
                          {modalValInfo.countdownLabel}
                        </span>
                      </div>
                      <span className="text-slate-500 font-medium">Status:</span>
                      <span className="font-bold text-right text-xs">{selectedRfq.status}</span>
                      <span className="text-slate-700 font-bold border-t border-slate-200 pt-1 mt-0.5">Grand Total:</span>
                      <span className="font-mono font-bold text-red-700 text-right text-xs sm:text-sm border-t border-slate-200 pt-1 mt-0.5">
                        ₹{qGrandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Requirement 3.1: Separate Billing Address & Delivery / Site Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4 p-3 sm:p-3.5 bg-slate-50/70 rounded-xl border border-slate-200">
                  <div>
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Billed To (Customer Master)</h3>
                    <div className="text-slate-800 text-xs sm:text-sm space-y-1">
                      <p className="font-bold text-sm sm:text-base text-slate-900">{selectedRfq.companyName}</p>
                      <p className="font-medium text-slate-700">Attn: {selectedRfq.customerName}</p>
                      <p className="text-slate-600">{selectedRfq.billingAddress || selectedRfq.address || 'Registered Corporate Address'}</p>
                      <p className="text-slate-600">{selectedRfq.city || 'Bangalore'}, {selectedRfq.state || 'Karnataka'} {selectedRfq.pincode ? `- ${selectedRfq.pincode}` : ''}</p>
                      <p className="text-slate-600 font-mono">GSTIN: {selectedRfq.email && (selectedRfq as any).gstin ? (selectedRfq as any).gstin : '29AABCU9603R1ZM'}</p>
                      <p className="text-slate-600 break-all sm:break-normal">Email: {selectedRfq.email} · Phone: {selectedRfq.phone}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Delivery &amp; Project Site Details</h3>
                    <div className="text-slate-800 text-xs sm:text-sm space-y-1">
                      <p className="font-semibold text-slate-900">
                        Destination Address: <span className="font-normal">{selectedRfq.deliveryAddress || selectedRfq.billingAddress || selectedRfq.city || 'Standard Factory Gate'}</span>
                      </p>
                      {selectedRfq.deliveryLocation && (
                        <p className="text-slate-700">
                          <strong>Delivery Bay / Location:</strong> {selectedRfq.deliveryLocation}
                        </p>
                      )}
                      {selectedRfq.lostReason && selectedRfq.status === 'Lost' && (
                        <p className="text-rose-800 bg-rose-50 border border-rose-200 p-2 rounded-lg text-xs mt-2">
                          <strong>Lost Reason:</strong> {selectedRfq.lostReason} {selectedRfq.lostReasonDetails ? `(${selectedRfq.lostReasonDetails})` : ''}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quotation Expiry Alert & Follow-up Comments Banner */}
                {(modalValInfo.isExpired || selectedRfq.status === 'Expired' || selectedRfq.expiryComments) && (
                  <div className={`mb-6 p-4 rounded-xl border ${modalValInfo.isExpired || selectedRfq.status === 'Expired'
                      ? 'bg-rose-50/90 border-rose-200 text-rose-950'
                      : 'bg-amber-50/90 border-amber-200 text-amber-950'
                    }`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2 pb-2 border-b border-rose-200/60">
                      <div className="flex items-center gap-2">
                        <AlertCircle className={modalValInfo.isExpired ? 'text-rose-600' : 'text-amber-600'} size={18} />
                        <h4 className="font-bold text-sm">
                          {modalValInfo.isExpired ? 'Quotation Validity Expired (7 Days Auto-Validity Elapsed)' : 'Quotation Validity Countdown'}
                        </h4>
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${modalValInfo.isExpired ? 'bg-rose-200 text-rose-900' : 'bg-amber-200 text-amber-900'
                          }`}>
                          {modalValInfo.countdownLabel}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsEditingExpiryComments(!isEditingExpiryComments)}
                        className="text-xs font-semibold text-rose-700 hover:text-rose-900 underline flex items-center gap-1 self-start sm:self-auto cursor-pointer"
                      >
                        <Edit3 size={12} />
                        {isEditingExpiryComments ? 'Close Edit' : 'Add / Update Expiry Comment'}
                      </button>
                    </div>

                    {/* Display Current Comment */}
                    <div className="text-xs space-y-1">
                      <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px] block">Expiry Follow-Up / Sales Discussion Comments:</span>
                      <p className="bg-white/90 p-2.5 rounded-lg border border-rose-100 font-medium text-slate-800 whitespace-pre-wrap">
                        {selectedRfq.expiryComments || `Quotation validity of 7 days expired on ${modalValInfo.expiryDate}. Follow-up discussion required for price revision or timeline extension.`}
                      </p>
                    </div>

                    {/* Editable Comment Box */}
                    {isEditingExpiryComments && (
                      <div className="mt-3 pt-3 border-t border-rose-200/60 animate-in fade-in">
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Add / Update Expiry Discussion Comment:
                        </label>
                        <textarea
                          rows={2}
                          value={expiryCommentInput}
                          onChange={(e) => setExpiryCommentInput(e.target.value)}
                          placeholder="Enter discussion notes regarding quote expiration, client follow-up, or price revision..."
                          className="w-full p-2.5 bg-white border border-rose-300 rounded-lg text-xs font-normal text-slate-900 focus:ring-2 focus:ring-rose-500 outline-none"
                        />
                        <div className="mt-2 flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setIsEditingExpiryComments(false)}
                            className="px-3 py-1 rounded-md text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleSaveExpiryComment}
                            disabled={isSavingExpiryComment}
                            className="px-3.5 py-1 rounded-md text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-sm flex items-center gap-1 disabled:opacity-50 cursor-pointer"
                          >
                            {isSavingExpiryComment ? <RefreshCw size={12} className="animate-spin" /> : <Save size={12} />}
                            Save Expiry Comment
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Quotation Management Products: Responsive Mobile Cards (< md) & Desktop/Print Table (>= md) */}
                
                {/* Mobile View: High-Density Responsive Product Cards (< md) */}
                <div className="block md:hidden print:hidden space-y-3 mb-6">
                  {selectedRfq.items && selectedRfq.items.length > 0 ? (
                    selectedRfq.items.map((item: any, idx: number) => {
                      const qty = Number(item.qty) || 1;
                      const rate = Number(item.unitPrice) || 0;
                      const lineTotal = item.totalBeforeTax ? Number(item.totalBeforeTax) : (qty * rate);
                      const coreSqmm = formatCoreSqmm(item.core || item.coreSize, item.sqmm, item.name);
                      const uomAbbr = formatUom(item.uom || item.unit);
                      const weightStr = formatWeight(item.weight, item.name);
                      const odStr = formatOD(item.outerDiameter, item.name);
                      return (
                        <div key={idx} className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200 text-xs space-y-2">
                          {/* Row 1: Item # + Part No + Brand + Validity */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-slate-400">#{idx + 1}</span>
                              <span className="font-bold font-mono text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 text-xs">
                                {item.partNo || `PART-${idx + 1}`}
                              </span>
                              <span className="text-[10px] font-bold px-1.5 py-0.5 bg-red-50 text-red-700 border border-red-200 rounded">
                                {item.brand || 'LAPP'}
                              </span>
                            </div>
                            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${modalValInfo.isExpired
                                ? 'bg-rose-100 text-rose-800'
                                : modalValInfo.remainingDays <= 2
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}>
                              {item.validity || '7 Days'}
                            </span>
                          </div>

                          {/* Row 2: Description */}
                          <p className="font-semibold text-slate-800 text-xs leading-snug">
                            {item.description || item.name}
                          </p>

                          {/* Row 3: Technical Specs Chips */}
                          <div className="flex flex-wrap gap-1.5 text-[11px] text-slate-600">
                            {coreSqmm !== '-' && (
                              <span className="px-2 py-0.5 rounded bg-white text-slate-800 border border-slate-200 font-mono font-medium">
                                Core: {coreSqmm}
                              </span>
                            )}
                            {weightStr !== '-' && (
                              <span className="px-2 py-0.5 rounded bg-white text-slate-600 border border-slate-200 font-mono">
                                Wt: {weightStr}
                              </span>
                            )}
                            {odStr !== '-' && (
                              <span className="px-2 py-0.5 rounded bg-white text-slate-600 border border-slate-200 font-mono">
                                OD: {odStr}
                              </span>
                            )}
                          </div>

                          {/* Row 4: Quantity & Rate & Line Total */}
                          <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                            <div className="text-slate-600 font-medium text-xs">
                              <span className="text-slate-900 font-bold">{qty}</span> {uomAbbr}
                              <span className="text-slate-400 mx-1">@</span>
                              <span className="font-mono">₹{rate.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="font-mono font-bold text-sm text-slate-900">
                              ₹{lineTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-6 text-center text-slate-500 italic bg-slate-50 rounded-xl border border-slate-200">
                      No items listed in this quotation.
                    </div>
                  )}

                  {/* Mobile Financial Summary Card (Compact, Responsive) */}
                  {selectedRfq.items && selectedRfq.items.length > 0 && (
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1.5 shadow-2xs mt-2.5">
                      <div className="flex justify-between text-slate-600">
                        <span>Subtotal ({selectedRfq.items.length} items):</span>
                        <span className="font-mono font-bold text-slate-900">₹{quoteSubtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                      </div>
                      {qDiscAmt > 0 && (
                        <div className="flex justify-between text-emerald-700 font-semibold">
                          <span>Special Discount ({qDiscRate}%):</span>
                          <span className="font-mono">-₹{qDiscAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-slate-600">
                        <span>GST (18%):</span>
                        <span className="font-mono font-medium text-slate-800">₹{qGst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm font-black text-slate-900 pt-1.5 border-t border-slate-300">
                        <span>Grand Total:</span>
                        <span className="font-mono text-base text-red-700">₹{qGrandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Desktop & Official Print Table: 12-Column Specification Grid (>= md) */}
                <div className="hidden md:block print:block mb-3.5 overflow-hidden rounded-xl border border-slate-200">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs sm:text-sm min-w-[980px]">
                      <thead className="bg-slate-100 text-slate-800 border-b border-slate-200 text-xs">
                        <tr>
                          <th className="py-2.5 px-3 font-semibold w-10 text-center">#</th>
                          <th className="py-2.5 px-3 font-semibold">Part Number</th>
                          <th className="py-2.5 px-3 font-semibold">Description</th>
                          <th className="py-2.5 px-3 font-semibold">Core / Cross Section</th>
                          <th className="py-2.5 px-3 font-semibold text-center">UOM</th>
                          <th className="py-2.5 px-3 font-semibold text-right">Price (₹)</th>
                          <th className="py-2.5 px-3 font-semibold text-center">Weight</th>
                          <th className="py-2.5 px-3 font-semibold text-center">Outer Diameter (OD)</th>
                          <th className="py-2.5 px-3 font-semibold text-center">Validity</th>
                          <th className="py-2.5 px-3 font-semibold text-center">Brand</th>
                          <th className="py-2.5 px-3 font-semibold text-right">Qty</th>
                          <th className="py-2.5 px-3 font-semibold text-right">Amount (₹)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 text-slate-700 text-xs">
                        {selectedRfq.items && selectedRfq.items.length > 0 ? (
                          selectedRfq.items.map((item: any, idx: number) => {
                            const qty = Number(item.qty) || 1;
                            const rate = Number(item.unitPrice) || 0;
                            const lineTotal = item.totalBeforeTax ? Number(item.totalBeforeTax) : (qty * rate);
                            const coreSqmm = formatCoreSqmm(item.core || item.coreSize, item.sqmm, item.name);
                            const uomAbbr = formatUom(item.uom || item.unit);
                            const weightStr = formatWeight(item.weight, item.name);
                            const odStr = formatOD(item.outerDiameter, item.name);
                            return (
                              <tr key={idx} className="group hover:bg-slate-50 transition-colors">
                                <td className="py-2.5 px-3 text-center text-slate-400 font-medium">{idx + 1}</td>
                                <td className="py-2.5 px-3 font-bold text-slate-900 font-mono">
                                  {item.partNo || `PART-${idx + 1}`}
                                </td>
                                <td className="py-2.5 px-3">
                                  <p className="font-medium text-slate-800 line-clamp-2 max-w-xs">{item.description || item.name}</p>
                                </td>
                                <td className="py-2.5 px-3 font-mono font-medium text-slate-700">
                                  {coreSqmm !== '-' ? (
                                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200 text-[11px] font-semibold">
                                      {coreSqmm}
                                    </span>
                                  ) : (
                                    <span className="text-slate-400">-</span>
                                  )}
                                </td>
                                <td className="py-2.5 px-3 text-center">
                                  <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-xs uppercase border border-slate-200">
                                    {uomAbbr}
                                  </span>
                                </td>
                                <td className="py-2.5 px-3 text-right font-mono text-slate-800">
                                  ₹{rate.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                </td>
                                <td className="py-2.5 px-3 text-center font-mono text-[11px] text-slate-600">
                                  {weightStr}
                                </td>
                                <td className="py-2.5 px-3 text-center font-mono text-[11px] text-slate-600">
                                  {odStr}
                                </td>
                                <td className="py-2.5 px-3 text-center">
                                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${modalValInfo.isExpired
                                      ? 'bg-rose-100 text-rose-800'
                                      : modalValInfo.remainingDays <= 2
                                        ? 'bg-amber-100 text-amber-800'
                                        : 'bg-emerald-100 text-emerald-800'
                                    }`}>
                                    {item.validity || '7 Days'}
                                  </span>
                                </td>
                                <td className="py-2.5 px-3 text-center">
                                  <span className="text-[10px] font-bold px-1.5 py-0.5 bg-red-50 text-red-700 border border-red-200 rounded">
                                    {item.brand || 'LAPP'}
                                  </span>
                                </td>
                                <td className="py-2.5 px-3 text-right font-bold text-slate-800">
                                  {qty} {uomAbbr}
                                </td>
                                <td className="py-2.5 px-3 text-right font-bold text-slate-900 font-mono">
                                  ₹{lineTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan={12} className="py-8 text-center text-slate-500 italic">No items listed in this quotation.</td>
                          </tr>
                        )}
                      </tbody>
                      {/* Integrated Clean Table Footer for Financial Summary */}
                      {selectedRfq.items && selectedRfq.items.length > 0 && (
                        <tfoot className="bg-slate-50 border-t-2 border-slate-300 font-semibold text-xs text-slate-800">
                          <tr>
                            <td colSpan={10} className="py-2.5 px-4 text-right text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                              Subtotal (Items):
                            </td>
                            <td colSpan={2} className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                              ₹{quoteSubtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                          {qDiscAmt > 0 && (
                            <tr className="text-emerald-700 bg-emerald-50/50">
                              <td colSpan={10} className="py-2 px-4 text-right font-bold text-[11px] uppercase tracking-wider">
                                Special Discount ({qDiscRate}%):
                              </td>
                              <td colSpan={2} className="py-2 px-3 text-right font-mono font-bold">
                                -₹{qDiscAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                              </td>
                            </tr>
                          )}
                          <tr>
                            <td colSpan={10} className="py-2 px-4 text-right text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                              GST (18%):
                            </td>
                            <td colSpan={2} className="py-2 px-3 text-right font-mono font-medium text-slate-800">
                              ₹{qGst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                          <tr className="bg-slate-100 text-sm border-t-2 border-slate-900">
                            <td colSpan={10} className="py-3 px-4 text-right font-black text-slate-900 uppercase tracking-wide">
                              Grand Total:
                            </td>
                            <td colSpan={2} className="py-3 px-3 text-right font-mono font-black text-base text-red-700">
                              ₹{qGrandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                        </tfoot>
                      )}
                    </table>
                  </div>
                </div>

                {/* Print-Only Official Terms & Signatory Block (Hidden on Screen, Visible only on Paper Print) */}
                <div className="hidden print:block mt-6 pt-4 border-t-2 border-slate-200">
                  <div className="flex justify-between items-end text-xs text-slate-500">
                    <div>
                      <p className="font-bold text-slate-800">SIDDHI KABEL CORP PVT LTD</p>
                      <p className="text-[11px] text-slate-500">Authorized Channel Partner &amp; Master Stockist</p>
                    </div>
                    <div className="text-right">
                      <div className="h-10 border-b border-dashed border-slate-300 w-44 mb-1"></div>
                      <p className="font-bold text-slate-700">Authorized Signatory</p>
                      <p className="text-[10px] text-slate-400">Computer generated official estimate</p>
                    </div>
                  </div>
                </div>


              </div>
            </div>
          </div>,
          document.body
        );
      })()}

      {/* Requirement 2.6: Lost Reason Popup Modal with Selectable Reasons & Others text input */}
      {lostModalRfq && createPortal(
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-[99999] p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-rose-600" />
                <h3 className="font-bold text-slate-900 text-sm">Mark RFQ as Lost</h3>
              </div>
              <button
                onClick={() => setLostModalRfq(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-900">
                <span className="font-bold block">Quote #: {lostModalRfq.quoteNo}</span>
                <span className="text-[11px] text-rose-700">Customer: {lostModalRfq.companyName || lostModalRfq.customerName}</span>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-2">
                  Select Reason for Losing this RFQ *
                </label>
                <div className="space-y-2">
                  {[
                    "Price too high / Competitor cheaper",
                    "Project cancelled / deferred",
                    "Delivery timeline not acceptable",
                    "Specification mismatch / Material unavailable",
                    "Client not responding / Ghosted",
                    "Others"
                  ].map((r) => (
                    <label key={r} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 cursor-pointer transition-colors">
                      <input
                        type="radio"
                        name="lostReason"
                        value={r}
                        checked={selectedLostReason === r}
                        onChange={(e) => setSelectedLostReason(e.target.value)}
                        className="text-red-600 focus:ring-red-500 w-3.5 h-3.5 cursor-pointer"
                      />
                      <span className="font-medium text-slate-800">{r}</span>
                    </label>
                  ))}
                </div>
              </div>

              {selectedLostReason === "Others" && (
                <div className="animate-in fade-in duration-200">
                  <label className="block text-slate-700 font-bold mb-1">
                    Specify Reason Details *
                  </label>
                  <textarea
                    rows={3}
                    value={otherLostReasonDetails}
                    onChange={(e) => setOtherLostReasonDetails(e.target.value)}
                    placeholder="Enter specific competitor, pricing feedback or client comment..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-red-500 font-medium"
                    required
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setLostModalRfq(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmLostReason}
                  disabled={isSubmittingLost || (selectedLostReason === "Others" && !otherLostReasonDetails.trim())}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-sm transition-all cursor-pointer"
                >
                  {isSubmittingLost ? "Saving..." : "Confirm & Mark Lost"}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}


    </div>
  );
};
