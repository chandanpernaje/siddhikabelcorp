import React, { useEffect, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams } from 'react-router-dom';
import { 
  FileText, Eye, RefreshCw, AlertCircle, CheckCircle, UserPlus, Trash2, X, 
  Download, Printer, Search, ArrowLeft, Clock, Tag, Percent, Edit3, Save, 
  FileSpreadsheet, Check
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
  brand?: string;
  hsnCode?: string;
  unit?: string;
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
  grandTotal: number;
  status: string;
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

export const AdminRFQs: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const filterParam = searchParams.get('filter') || searchParams.get('status') || 'All';
  const [statusFilter, setStatusFilter] = useState<string>(filterParam === 'pending' ? 'Pending Actions' : 'All');
  const [searchQuery, setSearchQuery] = useState<string>(searchParams.get('search') || '');

  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedRfq, setSelectedRfq] = useState<RFQ | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Pricing & Special Discount Editor State
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [editItems, setEditItems] = useState<RFQItem[]>([]);
  const [editDiscountType, setEditDiscountType] = useState<'percent' | 'amount'>('percent');
  const [editDiscountValue, setEditDiscountValue] = useState<number>(0);
  const [editNotes, setEditNotes] = useState<string>('');
  const [isSavingPrice, setIsSavingPrice] = useState(false);
  const [priceSuccessMsg, setPriceSuccessMsg] = useState('');

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
      setIsEditingPrice(false);
      setPriceSuccessMsg('');
    }
  }, [selectedRfq?._id]);

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

  // Requirement 2: Sales updates status (Under Review -> Process by Sales -> Closed)
  const handleStatusChange = async (rfqId: string, newStatus: string) => {
    // Instant Optimistic Update
    setRfqs(prev => prev.map(r => r._id === rfqId ? { ...r, status: newStatus } : r));
    if (selectedRfq && selectedRfq._id === rfqId) {
      setSelectedRfq(prev => prev ? { ...prev, status: newStatus } : null);
    }

    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE_URL}/api/rfqs/${rfqId}/status`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ status: newStatus })
      });
      fetchData(true);
    } catch (err) {
      console.error('Status change error', err);
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
      setSelectedIds(filteredRfqs.map(r => r._id));
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

      const rows: (string | number)[][] = [
        ['SIDDHI KABEL CORP PVT LTD'],
        ['Plot 42, Peenya Industrial Area, 2nd Stage, Bangalore, Karnataka 560058'],
        ['GSTIN: 29AABCU9603R1ZM | Phone: +91 80 2839 0000 | Email: sales@siddhikabel.com | Web: www.siddhikabel.com'],
        [],
        ['OFFICIAL QUOTATION / ESTIMATE'],
        [],
        ['Quotation No:', quoteNo, '', 'Date:', dateStr],
        ['Status:', status, '', 'Processed By:', assignedTo],
        [],
        ['CUSTOMER DETAILS / BILLED TO:'],
        ['Company Name:', companyName],
        ['Contact Person:', customerName],
        ['Email:', email],
        ['Phone:', phone],
        [],
        ['QUOTED ITEMS'],
        ['#', 'Part Number', 'Item Description', 'Brand', 'HSN Code', 'Qty', 'Unit', 'Unit Rate (₹)', 'Taxable Amount (₹)']
      ];

      if (rfq.items && rfq.items.length > 0) {
        rfq.items.forEach((item: any, idx: number) => {
          const qty = Number(item.qty) || 1;
          const rate = Number(item.unitPrice) || 0;
          const lineTotal = item.totalBeforeTax ? Number(item.totalBeforeTax) : (qty * rate);
          rows.push([
            idx + 1,
            item.partNo || '',
            item.name || '',
            item.brand || '',
            item.hsnCode || '8544',
            qty,
            item.unit || 'nos',
            rate,
            lineTotal
          ]);
        });
      } else {
        rows.push([1, 'STANDARD-ITEM', 'Industrial Cables & Wires', 'Polycab', '8544', 1, 'lot', subtotal, subtotal]);
      }

      rows.push([]);
      rows.push(['', '', '', '', '', '', 'Subtotal (₹):', subtotal]);
      if (discountAmount > 0) {
        rows.push(['', '', '', '', '', '', `Special Project Discount (${discountRate}%):`, -discountAmount]);
        rows.push(['', '', '', '', '', '', 'Taxable Amount (₹):', taxableAmount]);
      }
      rows.push(['', '', '', '', '', '', 'GST (18%):', gstAmount]);
      rows.push(['', '', '', '', '', '', 'Grand Total (₹):', grandTotal]);
      rows.push([]);
      if (rfq.notes) {
        rows.push(['Special Notes:', rfq.notes]);
        rows.push([]);
      }
      rows.push(['TERMS & CONDITIONS:']);
      rows.push(['1. Validity: 30 Days from date of quotation.']);
      rows.push(['2. Delivery: Ex-Stock Bangalore / 7-10 days for manufacturing items.']);
      rows.push(['3. Payment: 30 Days Credit against approved Purchase Order.']);
      rows.push(['4. Subject to Bangalore Jurisdiction.']);

      const ws = XLSX.utils.aoa_to_sheet(rows);
      ws['!cols'] = [
        { wch: 6 },
        { wch: 22 },
        { wch: 38 },
        { wch: 15 },
        { wch: 12 },
        { wch: 8 },
        { wch: 8 },
        { wch: 16 },
        { wch: 20 },
      ];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Quotation');
      const cleanQuoteNo = quoteNo.replace(/[^a-zA-Z0-9_-]/g, '_');
      XLSX.writeFile(wb, `Quotation_${cleanQuoteNo}.xlsx`);
    } catch (e) {
      console.error('Failed to export single quotation Excel', e);
      alert('Failed to generate Excel quotation.');
    }
  };

  // Requirement 7: Total Excel Export (All Filtered RFQs Master List)
  const handleExportAllExcel = () => {
    if (rfqs.length === 0) return;
    try {
      const rows: (string | number)[][] = [
        ['Quote No', 'Date', 'Customer Name', 'Company Name', 'Email', 'Phone', 'Subtotal (₹)', 'Special Discount (%)', 'Discount (₹)', 'Grand Total (₹)', 'Status', 'Assigned To']
      ];

      filteredRfqs.forEach(r => {
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

  // Requirement 3: Admin View shows current status as clean Badge only (no dropdown)
  const renderStatusBadge = (status: string) => {
    const norm = (status || 'New').trim();
    if (norm === 'Closed' || norm === 'Completed') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-300 shadow-2xs">
          <CheckCircle size={13} className="text-emerald-600" />
          Closed
        </span>
      );
    }
    if (norm === 'Process by Sales' || norm === 'Processing') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-50 text-purple-700 border border-purple-300 shadow-2xs">
          <Clock size={13} className="text-purple-600" />
          Process by Sales
        </span>
      );
    }
    if (norm === 'Under Review') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-orange-50 text-orange-700 border border-orange-300 shadow-2xs">
          <AlertCircle size={13} className="text-orange-600" />
          Under Review
        </span>
      );
    }
    if (norm === 'Assigned') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-sky-50 text-sky-700 border border-sky-300 shadow-2xs">
          <UserPlus size={13} className="text-sky-600" />
          Assigned
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-red-50 text-red-700 border border-red-300 shadow-2xs">
        <Clock size={13} className="text-red-600" />
        {status || 'New'}
      </span>
    );
  };

  const filteredRfqs = rfqs.filter(r => {
    // 1. Text Search Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matches = 
        (r.quoteNo && r.quoteNo.toLowerCase().includes(q)) ||
        (r.customerName && r.customerName.toLowerCase().includes(q)) ||
        (r.companyName && r.companyName.toLowerCase().includes(q)) ||
        (r.email && r.email.toLowerCase().includes(q)) ||
        (r.phone && r.phone.includes(q)) ||
        (r.assignedToName && r.assignedToName.toLowerCase().includes(q));
      if (!matches) return false;
    }

    // 2. Status Pipeline Filter
    if (statusFilter === 'All') return true;
    if (statusFilter === 'Pending Actions') {
      return r.status !== 'Closed' && r.status !== 'Completed';
    }
    if (statusFilter === 'New') {
      return r.status === 'New' || r.status === 'Open' || r.status === 'RFQ Submitted' || r.status === 'Generated';
    }
    if (statusFilter === 'Assigned') return r.status === 'Assigned';
    if (statusFilter === 'Under Review') return r.status === 'Under Review';
    if (statusFilter === 'Process by Sales') return r.status === 'Process by Sales' || r.status === 'Processing';
    if (statusFilter === 'Closed') return r.status === 'Closed' || r.status === 'Completed';
    return true;
  });

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            RFQ & Quotation Management
            {isRefreshing && <RefreshCw size={14} className="animate-spin text-red-500" />}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            {isAdmin 
              ? 'Assign quotation requests to sales staff and monitor review pipeline progress.' 
              : 'Review your assigned RFQs, apply customer discounts, and transition through to closure.'}
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
            Export All (Excel)
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

      {/* Search Input Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-2.5 sm:p-3 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search RFQs by quote #, customer, company, email, phone, salesperson..."
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
            Showing {filteredRfqs.length} matching result{filteredRfqs.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Status Pipeline Filter Tabs - Colorful Light Aesthetic */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-semibold no-scrollbar">
        {[
          { key: 'All', label: `All (${rfqs.length})`, active: 'bg-slate-800 text-white font-bold', inactive: 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200' },
          { key: 'Pending Actions', label: `Pending Actions (${rfqs.filter(r => r.status !== 'Closed' && r.status !== 'Completed').length})`, active: 'bg-orange-600 text-white font-bold shadow-xs', inactive: 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100' },
          { key: 'New', label: `New (${rfqs.filter(r => r.status === 'New' || r.status === 'Open' || r.status === 'RFQ Submitted' || r.status === 'Generated').length})`, active: 'bg-red-600 text-white font-bold shadow-xs', inactive: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100' },
          { key: 'Assigned', label: `Assigned (${rfqs.filter(r => r.status === 'Assigned').length})`, active: 'bg-sky-600 text-white font-bold shadow-xs', inactive: 'bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100' },
          { key: 'Under Review', label: `Under Review (${rfqs.filter(r => r.status === 'Under Review').length})`, active: 'bg-amber-600 text-white font-bold shadow-xs', inactive: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' },
          { key: 'Process by Sales', label: `Process by Sales (${rfqs.filter(r => r.status === 'Process by Sales' || r.status === 'Processing').length})`, active: 'bg-purple-600 text-white font-bold shadow-xs', inactive: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100' },
          { key: 'Closed', label: `Closed (${rfqs.filter(r => r.status === 'Closed' || r.status === 'Completed').length})`, active: 'bg-emerald-600 text-white font-bold shadow-xs', inactive: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' },
        ].map(({ key, label, active, inactive }) => (
          <button
            key={key}
            onClick={() => setStatusFilter(key)}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all border shadow-2xs cursor-pointer ${
              statusFilter === key ? active : inactive
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* RFQ Data Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[850px]">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs">
              <tr>
                {isAdmin && (
                  <th className="py-3 px-4 w-12 font-semibold">
                    <input 
                      type="checkbox" 
                      checked={filteredRfqs.length > 0 && selectedIds.length === filteredRfqs.length}
                      onChange={handleSelectAll}
                      className="rounded border-slate-300 text-red-600 focus:ring-red-500 cursor-pointer w-4 h-4"
                    />
                  </th>
                )}
                <th className="py-3 px-4 font-semibold">RFQ Number</th>
                <th className="py-3 px-4 font-semibold">Company / Client</th>
                <th className="py-3 px-4 font-semibold">Amount (₹)</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold">Assigned / Processed By</th>
                <th className="py-3 px-4 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {loading ? (
                <tr>
                  <td colSpan={isAdmin ? 7 : 6} className="py-8 text-center text-slate-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-red-600" />
                    Loading RFQs...
                  </td>
                </tr>
              ) : filteredRfqs.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 7 : 6} className="py-12 text-center">
                    <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-base font-semibold text-slate-900">No RFQs Found</h3>
                    <p className="text-xs text-slate-400 mt-1">No quotation requests match your search or filter criteria.</p>
                  </td>
                </tr>
              ) : (
                filteredRfqs.map((rfq) => (
                  <tr key={rfq._id} className="hover:bg-red-50/20 transition-colors group">
                    {isAdmin && (
                      <td className="py-3 px-4">
                        <input 
                          type="checkbox" 
                          checked={selectedIds.includes(rfq._id)}
                          onChange={() => handleSelectOne(rfq._id)}
                          className="rounded border-slate-300 text-red-600 focus:ring-red-500 cursor-pointer w-4 h-4"
                        />
                      </td>
                    )}
                    <td 
                      className="py-3 px-4 font-mono font-bold text-sky-700 hover:text-sky-900 cursor-pointer"
                      onClick={() => setSelectedRfq(rfq)}
                    >
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-sky-50 text-sky-700 border border-sky-200 font-bold hover:bg-sky-100 transition-colors shadow-2xs">
                        <FileText size={12} className="text-sky-600" />
                        {rfq.quoteNo}
                      </span>
                    </td>
                    <td 
                      className="py-3 px-4 cursor-pointer"
                      onClick={() => setSelectedRfq(rfq)}
                    >
                      <div className="font-semibold text-slate-900 group-hover:text-red-700 transition-colors">
                        {rfq.companyName || rfq.customerName}
                      </div>
                      <div className="text-xs text-slate-500">{rfq.customerName}</div>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">
                      <div>₹{rfq.grandTotal?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                      {Boolean(rfq.discountAmount && rfq.discountAmount > 0) && (
                        <div className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
                          <Tag size={10} /> -{rfq.discountRate || ''}% off
                        </div>
                      )}
                    </td>

                    {/* Requirement 1, 2, 3:
                        - If Admin: Status is displayed as a badge ONLY (no dropdown)
                        - If Sales: Status dropdown with Under Review -> Process by Sales -> Closed
                    */}
                    <td className="py-3 px-4">
                      {isAdmin ? (
                        renderStatusBadge(rfq.status)
                      ) : (
                        <select 
                          value={rfq.status}
                          onChange={(e) => handleStatusChange(rfq._id, e.target.value)}
                          className={`text-xs font-bold rounded-lg px-2.5 py-1.5 border outline-none cursor-pointer shadow-2xs transition-all ${
                            rfq.status === 'Closed' || rfq.status === 'Completed'
                              ? 'border-emerald-300 bg-emerald-50 text-emerald-800' 
                              : rfq.status === 'Process by Sales' || rfq.status === 'Processing'
                              ? 'border-purple-300 bg-purple-50 text-purple-800'
                              : rfq.status === 'Under Review'
                              ? 'border-orange-300 bg-orange-50 text-orange-800'
                              : rfq.status === 'Assigned'
                              ? 'border-sky-300 bg-sky-50 text-sky-800'
                              : 'border-slate-300 bg-white text-slate-800'
                          } focus:ring-2 focus:ring-red-500`}
                        >
                          {rfq.status === 'New' && <option value="New">New</option>}
                          <option value="Assigned">Assigned</option>
                          <option value="Under Review">Under Review</option>
                          <option value="Process by Sales">Process by Sales</option>
                          <option value="Closed">Closed</option>
                        </select>
                      )}
                    </td>

                    {/* Assigned Salesperson Column (Admin assigns, Sales views) */}
                    <td className="py-3 px-4">
                      {canAssign ? (
                        <select 
                          className="text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-medium text-slate-800 shadow-xs focus:ring-2 focus:ring-red-500 focus:border-red-500 cursor-pointer max-w-[200px]"
                          value={getAssignedUserId(rfq.assignedTo, rfq.assignedToName)}
                          onChange={(e) => handleAssign(rfq._id, e.target.value)}
                        >
                          <option value="">-- Assign Salesperson --</option>
                          {users.map(u => (
                            <option key={u._id} value={u._id}>
                              {u.name} ({u.role})
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ${
                          rfq.assignedToName 
                            ? 'bg-gradient-to-r from-red-50 to-orange-50 text-red-800 border border-orange-200 shadow-2xs font-semibold' 
                            : 'bg-slate-100 text-slate-500 border border-slate-200'
                        }`}>
                          {rfq.assignedToName || 'Unassigned'}
                        </span>
                      )}
                    </td>

                    {/* Actions: Full Details View + Individual Quotation Excel Download */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <button 
                          onClick={() => setSelectedRfq(rfq)}
                          className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer" 
                          title="View Full Quotation Details"
                        >
                          <Eye size={17} />
                        </button>
                        <button 
                          onClick={() => handleExportSingleRfqExcel(rfq)}
                          className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer" 
                          title="Download Individual Quotation Excel (.xlsx)"
                        >
                          <FileSpreadsheet size={17} />
                        </button>
                        {isAdmin && (
                          <button 
                            onClick={() => handleDelete(rfq._id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer" 
                            title="Delete RFQ"
                          >
                            <Trash2 size={17} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RFQ Detail & Quotation Modal: Portal-Mounted, Permanently Pinned Top Header */}
      {selectedRfq && createPortal(
        <div 
          id="rfq-print-overlay"
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-[99999] p-2 sm:p-4 md:p-6 overflow-hidden print:p-0 print:bg-white print:static print:inset-auto print:overflow-visible"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isEditingPrice) handleCloseModal();
          }}
        >
          <div id="rfq-print-card" className="bg-white shadow-2xl w-full max-w-4xl max-h-[96vh] sm:max-h-[92vh] flex flex-col relative my-0 animate-in zoom-in-95 duration-150 print:w-full print:h-auto print:max-h-none print:shadow-none print:m-0 print:p-0 rounded-2xl overflow-hidden border border-slate-200">
            
            {/* Top Toolbar (Hidden on Print) */}
            <div id="rfq-print-toolbar" className="bg-slate-50 text-slate-800 border-b border-slate-200 px-3 sm:px-6 py-2.5 sm:py-3.5 flex flex-wrap items-center justify-between gap-2.5 print:hidden shrink-0 z-30 shadow-2xs">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 min-w-0">
                {/* Back Button */}
                <button
                  onClick={handleCloseModal}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 shadow-2xs transition-colors cursor-pointer shrink-0"
                  title="Return to RFQ List"
                >
                  <ArrowLeft size={15} />
                  <span className="hidden sm:inline">Back to RFQs</span>
                  <span className="sm:hidden">Back</span>
                </button>

                {/* Status: Admin views status badge ONLY. Sales updates status */}
                {isAdmin ? (
                  <div className="flex items-center gap-1.5 bg-white px-3 py-1 rounded-xl border border-slate-200 shadow-2xs">
                    <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider hidden sm:inline">Current Status:</span>
                    {renderStatusBadge(selectedRfq.status)}
                  </div>
                ) : (
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border shadow-2xs ${
                    selectedRfq.status === 'Closed' || selectedRfq.status === 'Completed'
                      ? 'bg-emerald-50 border-emerald-300' 
                      : 'bg-white border-slate-200'
                  }`}>
                    <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider hidden sm:inline">Update Status:</span>
                    <select
                      value={selectedRfq.status}
                      onChange={(e) => handleStatusChange(selectedRfq._id, e.target.value)}
                      className={`text-xs font-bold bg-transparent outline-none cursor-pointer ${
                        selectedRfq.status === 'Closed' || selectedRfq.status === 'Completed' ? 'text-emerald-800 font-extrabold' : 'text-amber-700'
                      }`}
                    >
                      {selectedRfq.status === 'New' && <option value="New" className="bg-white text-slate-900">New</option>}
                      <option value="Assigned" className="bg-white text-slate-900">Assigned</option>
                      <option value="Under Review" className="bg-white text-slate-900">Under Review</option>
                      <option value="Process by Sales" className="bg-white text-slate-900">Process by Sales</option>
                      <option value="Closed" className="bg-white text-slate-900">Closed</option>
                    </select>
                  </div>
                )}

                {/* Assignment: Admin assigns salesperson. Sales views assigned name */}
                {canAssign ? (
                  <div className="hidden md:flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-xl border border-slate-200 shadow-2xs">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Assign:</span>
                    <select
                      value={getAssignedUserId(selectedRfq.assignedTo, selectedRfq.assignedToName)}
                      onChange={(e) => handleAssign(selectedRfq._id, e.target.value)}
                      className="text-xs font-bold bg-transparent text-red-600 outline-none cursor-pointer max-w-[170px]"
                    >
                      <option value="" className="bg-white text-slate-900">-- Select Staff --</option>
                      {users.map(u => (
                        <option key={u._id} value={u._id} className="bg-white text-slate-900">
                          {u.name} ({u.role})
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="bg-white border border-slate-200 px-2.5 py-1 rounded-xl text-xs font-semibold text-slate-600 shadow-2xs hidden md:block">
                    Processed by: <span className="font-bold text-slate-900">{selectedRfq.assignedToName || 'Sales Team'}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons: Edit Price & Discount, Download Excel, Print, Close */}
              <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
                {/* Special Discount & Price Edit Toggle */}
                <button
                  onClick={() => setIsEditingPrice(!isEditingPrice)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all font-bold text-xs border cursor-pointer ${
                    isEditingPrice 
                      ? 'bg-amber-500 text-white border-amber-600 shadow-sm' 
                      : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200 shadow-2xs'
                  }`}
                  title="Edit quotation item rates and special customer discount"
                >
                  <Tag size={14} />
                  <span className="hidden sm:inline">{isEditingPrice ? 'Close Editor' : 'Edit Price / Discount'}</span>
                  <span className="sm:hidden">{isEditingPrice ? 'Done' : 'Price'}</span>
                </button>

                {/* Individual Excel Download */}
                <button 
                  onClick={() => handleExportSingleRfqExcel(selectedRfq)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all font-bold text-xs shadow-sm cursor-pointer"
                  title="Download this quotation as Microsoft Excel (.xlsx)"
                >
                  <FileSpreadsheet size={15} />
                  <span className="hidden sm:inline">Download Excel</span>
                  <span className="sm:hidden">Excel</span>
                </button>

                {/* Print Button */}
                <button 
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-red-600 via-red-600 to-rose-600 hover:opacity-95 text-white rounded-xl transition-all font-bold text-xs shadow-sm cursor-pointer"
                  title="Print Quotation"
                >
                  <Printer size={15} />
                  <span className="hidden sm:inline">Print</span>
                </button>

                {/* Close Button */}
                <button 
                  onClick={handleCloseModal} 
                  className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-xl bg-white hover:bg-red-50 hover:text-red-600 text-slate-500 border border-slate-200 transition-colors cursor-pointer shrink-0 shadow-2xs"
                  title="Close (Esc)"
                  aria-label="Close Modal"
                >
                  <X size={18} />
                </button>
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

                {/* Editable Items Table */}
                <div className="bg-white rounded-xl border border-amber-200 overflow-hidden mb-4 shadow-2xs">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100/80 text-slate-700 border-b border-slate-200">
                      <tr>
                        <th className="py-2 px-3 font-semibold">Part / Item</th>
                        <th className="py-2 px-3 font-semibold w-24">Qty</th>
                        <th className="py-2 px-3 font-semibold w-32">Unit Rate (₹)</th>
                        <th className="py-2 px-3 font-semibold text-right w-32">Line Total (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {editItems.map((item, idx) => (
                        <tr key={idx} className="hover:bg-amber-50/40">
                          <td className="py-2 px-3">
                            <span className="font-bold text-slate-800 font-mono">{item.partNo || `Item #${idx+1}`}</span>
                            <span className="text-slate-500 block text-[11px] truncate max-w-xs">{item.name}</span>
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
                          className={`px-2 py-0.5 font-bold cursor-pointer ${
                            editDiscountType === 'percent' ? 'bg-amber-500 text-white' : 'bg-slate-50 text-slate-600'
                          }`}
                        >
                          % Percent
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditDiscountType('amount')}
                          className={`px-2 py-0.5 font-bold cursor-pointer ${
                            editDiscountType === 'amount' ? 'bg-amber-500 text-white' : 'bg-slate-50 text-slate-600'
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
            <div id="rfq-print-content" className="p-4 sm:p-8 md:p-12 print:p-0 print:overflow-visible bg-white flex-1 overflow-y-auto custom-scrollbar">
              
              {/* Header: Logo and Company Info */}
              <div className="flex flex-col sm:flex-row justify-between items-start border-b-2 border-slate-900 pb-8 mb-8">
                <div>
                  <img 
                    src="/images/siddhi-kabel-lockup.png" 
                    alt="Siddhi Kabel" 
                    className="h-16 w-auto object-contain mb-4"
                    onError={(e) => { e.currentTarget.src = '/images/siddhi-kabel-logo.png'; }}
                  />
                  <h1 className="text-xl font-black text-slate-900 tracking-tight">SIDDHI KABEL CORP PVT LTD</h1>
                  <p className="text-sm text-slate-500 mt-1">Plot 42, Peenya Industrial Area, 2nd Stage</p>
                  <p className="text-sm text-slate-500">Bangalore, Karnataka 560058</p>
                  <p className="text-sm font-medium text-slate-600 mt-1">GSTIN: 29AABCU9603R1ZM</p>
                </div>
                <div className="sm:text-right mt-6 sm:mt-0 bg-slate-50 p-4 rounded-xl border border-slate-200 min-w-[240px]">
                  <h2 className="text-2xl font-black text-slate-800 mb-1">QUOTATION</h2>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm mt-3 text-left">
                    <span className="text-slate-500 font-medium">Quote No:</span>
                    <span className="font-bold text-slate-900 font-mono text-right">{selectedRfq.quoteNo}</span>
                    <span className="text-slate-500 font-medium">Date:</span>
                    <span className="font-bold text-slate-900 text-right">{selectedRfq.date || new Date(selectedRfq.createdAt).toLocaleDateString()}</span>
                    <span className="text-slate-500 font-medium">Status:</span>
                    <span className="font-bold text-right text-xs">{selectedRfq.status}</span>
                  </div>
                </div>
              </div>

              {/* Bill To Section */}
              <div className="mb-8">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 border-b border-slate-100 pb-1 inline-block">Billed To</h3>
                <div className="text-slate-800">
                  <p className="text-lg font-bold">{selectedRfq.companyName}</p>
                  <p className="text-sm font-medium mt-1">Attn: {selectedRfq.customerName}</p>
                  <p className="text-sm text-slate-600 mt-1">Email: {selectedRfq.email}</p>
                  <p className="text-sm text-slate-600">Phone: {selectedRfq.phone}</p>
                </div>
              </div>

              {/* Items Table */}
              <div className="mb-8 overflow-hidden rounded-xl border border-slate-200">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm min-w-[500px]">
                    <thead className="bg-slate-100 text-slate-800 border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4 font-semibold w-12 text-center">#</th>
                        <th className="py-3 px-4 font-semibold">Part Number & Description</th>
                        <th className="py-3 px-4 font-semibold">Brand</th>
                        <th className="py-3 px-4 font-semibold text-right">Qty</th>
                        <th className="py-3 px-4 font-semibold text-right">Unit Rate</th>
                        <th className="py-3 px-4 font-semibold text-right">Amount (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-slate-700">
                      {selectedRfq.items && selectedRfq.items.length > 0 ? (
                        selectedRfq.items.map((item: any, idx: number) => {
                          const qty = Number(item.qty) || 1;
                          const rate = Number(item.unitPrice) || 0;
                          const lineTotal = item.totalBeforeTax ? Number(item.totalBeforeTax) : (qty * rate);
                          return (
                            <tr key={idx} className="group hover:bg-slate-50">
                              <td className="py-3 px-4 text-center text-slate-400 font-medium">{idx + 1}</td>
                              <td className="py-3 px-4">
                                <p className="font-bold text-slate-900 font-mono">{item.partNo}</p>
                                <p className="text-slate-500 text-xs mt-0.5">{item.name}</p>
                              </td>
                              <td className="py-3 px-4 font-medium">{item.brand || 'Polycab'}</td>
                              <td className="py-3 px-4 text-right font-bold">{qty} {item.unit || 'nos'}</td>
                              <td className="py-3 px-4 text-right font-mono">₹{rate.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                              <td className="py-3 px-4 text-right font-bold text-slate-900 font-mono">₹{lineTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-slate-500 italic">No items listed in this quotation.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totals Section */}
              <div className="flex flex-col sm:flex-row justify-between items-end border-t-2 border-slate-900 pt-6">
                <div className="w-full sm:w-1/2 mb-6 sm:mb-0">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Terms & Conditions</h4>
                  <ul className="text-xs text-slate-500 space-y-1 list-disc list-inside">
                    <li>Validity: 30 Days from date of quotation</li>
                    <li>Delivery: Ex-Stock Bangalore / 7-10 days for manufacturing items</li>
                    <li>Payment: 30 Days Credit against approved PO</li>
                    <li>Subject to Bangalore Jurisdiction</li>
                  </ul>
                  {selectedRfq.notes && (
                    <div className="mt-3 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 font-medium">
                      <strong>Special Note:</strong> {selectedRfq.notes}
                    </div>
                  )}
                </div>
                <div className="w-full sm:w-80 bg-slate-50 p-5 rounded-xl border border-slate-200">
                  <div className="space-y-2 text-sm text-slate-600 mb-3 pb-3 border-b border-slate-200">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="font-mono font-medium text-slate-800">
                        ₹{(selectedRfq.subtotal ?? (selectedRfq.grandTotal ? selectedRfq.grandTotal / 1.18 : 0))?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    {/* Special Discount Display */}
                    {Boolean(selectedRfq.discountAmount && selectedRfq.discountAmount > 0) && (
                      <div className="flex justify-between text-emerald-600 font-semibold">
                        <span>Special Discount ({selectedRfq.discountRate || 0}%)</span>
                        <span className="font-mono">-₹{selectedRfq.discountAmount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <span>Taxable Value</span>
                      <span className="font-mono font-medium text-slate-800">
                        ₹{Math.max(0, (selectedRfq.subtotal || 0) - (selectedRfq.discountAmount || 0))?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span>Tax (GST 18%)</span>
                      <span className="font-mono font-medium text-slate-800">
                        ₹{(((Math.max(0, (selectedRfq.subtotal || 0) - (selectedRfq.discountAmount || 0))) * 0.18) || ((selectedRfq.grandTotal || 0) - (selectedRfq.subtotal || 0)))?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-lg font-black text-slate-900">
                    <span>Grand Total</span>
                    <span className="font-mono text-xl text-red-700">₹{selectedRfq.grandTotal?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}</span>
                  </div>
                </div>
              </div>

              {/* Footer / Signature Area */}
              <div className="mt-16 pt-8 border-t border-slate-200 flex justify-between items-end text-sm">
                <div className="text-slate-500">
                  <p>Computer generated document.</p>
                  <p>No signature required.</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-slate-800 mb-12">For Siddhi Kabel Corp Pvt Ltd</p>
                  <p className="text-slate-500 border-t border-slate-300 pt-1 inline-block px-4">Authorized Signatory</p>
                </div>
              </div>

            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
};
