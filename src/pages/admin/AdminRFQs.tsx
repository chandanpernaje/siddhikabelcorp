import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams } from 'react-router-dom';
import { FileText, Eye, RefreshCw, AlertCircle, CheckCircle, UserPlus, Trash2, X, Download, Printer, Search, ArrowLeft } from 'lucide-react';
import { API_BASE_URL } from '../../config/api';

interface User {
  _id: string;
  name: string;
  role: string;
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
  items?: any[];
  subtotal?: number;
}

export const AdminRFQs: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const filterParam = searchParams.get('filter') || searchParams.get('status') || 'All';
  const [statusFilter, setStatusFilter] = useState<string>(filterParam === 'pending' ? 'Pending Actions' : 'All');
  const [searchQuery, setSearchQuery] = useState<string>(searchParams.get('search') || '');

  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRfq, setSelectedRfq] = useState<RFQ | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Retrieve current admin details
  const currentAdminStr = localStorage.getItem('siddhi_admin_user');
  const currentAdmin = currentAdminStr ? JSON.parse(currentAdminStr) : null;
  const rawRole = (currentAdmin?.role || '').toLowerCase();
  const isSalesExec = (rawRole.includes('executive') || rawRole.includes('salesman')) && !rawRole.includes('admin') && !rawRole.includes('manager');
  const isAdmin = rawRole.includes('admin') || !currentAdminStr;
  const isSalesManager = rawRole.includes('manager');
  const canAssign = !isSalesExec;
  const canViewAll = !isSalesExec;

  const defaultSalesStaff: User[] = [
    { _id: 'sales-1', name: 'Ramesh Sales', role: 'Sales Executive' },
    { _id: 'mgr-1', name: 'Suresh Manager', role: 'Sales Manager' },
    { _id: 'admin-1', name: 'Super Admin', role: 'Admin' }
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {};

      // Admin and Sales Manager can view all/team RFQs. Sales Exec views assigned.
      const url = canViewAll 
        ? `${API_BASE_URL}/api/rfqs`
        : `${API_BASE_URL}/api/rfqs?assignedTo=${currentAdmin?._id}`;

      const [rfqRes, userRes] = await Promise.all([
        fetch(url, { headers }),
        fetch(`${API_BASE_URL}/api/admin/users`, { headers })
      ]);
      
      if (rfqRes.ok) {
        setRfqs(await rfqRes.json());
        setSelectedIds([]);
      }
      if (userRes.ok) {
        const allUsers: User[] = await userRes.json();
        // Any staff member that is NOT a customer
        const staff = allUsers.filter(u => {
          const r = (u.role || '').toLowerCase();
          return r !== 'customer' && r !== 'website customer';
        });
        setUsers(staff.length > 0 ? staff : (allUsers.length > 0 ? allUsers : defaultSalesStaff));
      } else {
        setUsers(defaultSalesStaff);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setUsers(defaultSalesStaff);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle URL query parameters for direct RFQ viewing (from Dashboard, Notifications, or Search)
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
      if (e.key === 'Escape' && selectedRfq) {
        handleCloseModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedRfq]);

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
    
    // Optimistically update UI so it shows IMMEDIATELY
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
      const res = await fetch(`${API_BASE_URL}/api/rfqs/${rfqId}/assign`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ assignedTo: targetUserId, assignedToName: assignedName })
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = async (rfqId: string, newStatus: string) => {
    setRfqs(prev => prev.map(r => r._id === rfqId ? { ...r, status: newStatus } : r));
    if (selectedRfq && selectedRfq._id === rfqId) {
      setSelectedRfq(prev => prev ? { ...prev, status: newStatus } : null);
    }
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/rfqs/${rfqId}/status`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this RFQ?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/rfqs/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(rfqs.map(r => r._id));
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
      const res = await fetch(`${API_BASE_URL}/api/rfqs/bulk-delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds })
      });
      if (res.ok) {
        setSelectedIds([]);
        fetchData();
      }
    } catch (error) {
      console.error('Bulk delete failed', error);
    }
  };

  const handleExportCSV = () => {
    if (rfqs.length === 0) return;
    const headers = ['Quote No', 'Date', 'Customer Name', 'Company', 'Email', 'Phone', 'Total', 'Status', 'Assigned To'];
    const rows = rfqs.map(r => [
      r.quoteNo,
      r.date || new Date(r.createdAt).toLocaleDateString(),
      r.customerName,
      r.companyName,
      r.email,
      r.phone,
      r.grandTotal || 0,
      r.status,
      r.assignedToName || 'Unassigned'
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(e => e.map(item => `"${item}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `RFQs_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredRfqs = rfqs.filter(r => {
    // 1. Text Search Filter (Quote No, Customer, Company, Email, Phone, Salesperson)
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
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">RFQ Management</h2>
          <p className="text-xs sm:text-sm text-slate-500">
            {isAdmin ? 'View and assign customer quotation requests.' : 'View RFQs assigned to you.'}
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
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition-colors font-semibold text-xs border border-emerald-200 cursor-pointer"
          >
            <Download size={14} />
            Export Excel
          </button>
          <button 
            onClick={fetchData}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors font-semibold text-xs cursor-pointer"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Search Input Bar (Requirement 6) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-2.5 sm:p-3 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search RFQs by quote #, customer, company, email, phone, salesperson..."
            className="w-full pl-10 pr-9 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
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

      {/* Status Pipeline Filter Tabs - Mobile Responsive */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-semibold no-scrollbar">
        {[
          { key: 'All', label: `All (${rfqs.length})` },
          { key: 'Pending Actions', label: `Pending Actions (${rfqs.filter(r => r.status !== 'Closed' && r.status !== 'Completed').length})` },
          { key: 'New', label: `New (${rfqs.filter(r => r.status === 'New' || r.status === 'Open' || r.status === 'RFQ Submitted' || r.status === 'Generated').length})` },
          { key: 'Assigned', label: `Assigned (${rfqs.filter(r => r.status === 'Assigned').length})` },
          { key: 'Under Review', label: `Under Review (${rfqs.filter(r => r.status === 'Under Review').length})` },
          { key: 'Process by Sales', label: `Process by Sales (${rfqs.filter(r => r.status === 'Process by Sales' || r.status === 'Processing').length})` },
          { key: 'Closed', label: `Closed (${rfqs.filter(r => r.status === 'Closed' || r.status === 'Completed').length})` },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setStatusFilter(key)}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors shadow-xs cursor-pointer ${
              statusFilter === key
                ? 'bg-blue-600 text-white font-bold'
                : 'bg-white border border-slate-200 text-slate-700 hover:border-blue-500 hover:text-blue-600'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[750px]">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs">
              <tr>
                {isAdmin && (
                  <th className="py-3 px-4 w-12 font-semibold">
                    <input 
                      type="checkbox" 
                      checked={filteredRfqs.length > 0 && selectedIds.length === filteredRfqs.length}
                      onChange={handleSelectAll}
                      className="rounded border-slate-300 text-amber-500 focus:ring-amber-500 cursor-pointer w-4 h-4"
                    />
                  </th>
                )}
                <th className="py-3 px-4 font-semibold">RFQ Number</th>
                <th className="py-3 px-4 font-semibold">Company / Client</th>
                <th className="py-3 px-4 font-semibold">Total (₹)</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold">Assigned / Processed By</th>
                <th className="py-3 px-4 font-semibold text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {loading ? (
                <tr>
                  <td colSpan={isAdmin ? 7 : 6} className="py-8 text-center text-slate-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-500" />
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
                  <tr key={rfq._id} className="hover:bg-slate-50/80 transition-colors group">
                    {isAdmin && (
                      <td className="py-3 px-4">
                        <input 
                          type="checkbox" 
                          checked={selectedIds.includes(rfq._id)}
                          onChange={() => handleSelectOne(rfq._id)}
                          className="rounded border-slate-300 text-amber-500 focus:ring-amber-500 cursor-pointer w-4 h-4"
                        />
                      </td>
                    )}
                    <td 
                      className="py-3 px-4 font-mono font-bold text-blue-700 hover:text-blue-900 cursor-pointer"
                      onClick={() => setSelectedRfq(rfq)}
                    >
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-blue-50 border border-blue-200">
                        {rfq.quoteNo}
                      </span>
                    </td>
                    <td 
                      className="py-3 px-4 cursor-pointer"
                      onClick={() => setSelectedRfq(rfq)}
                    >
                      <div className="font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">
                        {rfq.companyName || rfq.customerName}
                      </div>
                      <div className="text-xs text-slate-500">{rfq.customerName}</div>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">
                      ₹{rfq.grandTotal?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>

                    {/* Status Column - Important Fix for Closed Status (Requirement 10) */}
                    <td className="py-3 px-4">
                      {rfq.status === 'Closed' || rfq.status === 'Completed' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-300 shadow-2xs">
                          <CheckCircle size={14} className="text-emerald-600" />
                          Closed
                        </span>
                      ) : (
                        <select 
                          value={rfq.status}
                          onChange={(e) => handleStatusChange(rfq._id, e.target.value)}
                          className={`text-xs font-bold rounded-lg px-2.5 py-1.5 border outline-none cursor-pointer transition-all ${
                            rfq.status === 'New' || rfq.status === 'Open'
                              ? 'bg-amber-50 text-amber-800 border-amber-300'
                              : rfq.status === 'Assigned'
                              ? 'bg-blue-50 text-blue-700 border-blue-300'
                              : rfq.status === 'Under Review'
                              ? 'bg-indigo-50 text-indigo-700 border-indigo-300'
                              : 'bg-purple-50 text-purple-700 border-purple-300'
                          }`}
                        >
                          <option value="New">New</option>
                          <option value="Assigned">Assigned</option>
                          <option value="Under Review">Under Review</option>
                          <option value="Process by Sales">Process by Sales</option>
                          <option value="Closed">Closed</option>
                        </select>
                      )}
                    </td>

                    {/* Assigned Salesperson / Processed By Column */}
                    <td className="py-3 px-4">
                      {rfq.status === 'Closed' || rfq.status === 'Completed' ? (
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Processed By</span>
                          <span className="inline-flex items-center text-xs font-bold text-slate-700">
                            {rfq.assignedToName || 'Sales Team'}
                          </span>
                        </div>
                      ) : canAssign ? (
                        <select 
                          className="text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-medium text-slate-800 shadow-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer max-w-[190px]"
                          value={rfq.assignedTo || (users.find(u => u.name === rfq.assignedToName)?._id) || ''}
                          onChange={(e) => handleAssign(rfq._id, e.target.value)}
                        >
                          <option value="">-- Unassigned --</option>
                          {users.map(u => (
                            <option key={u._id} value={u._id}>
                              {u.name} ({u.role})
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ${
                          rfq.assignedToName 
                            ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                            : 'bg-slate-100 text-slate-500'
                        }`}>
                          {rfq.assignedToName || 'Unassigned'}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <button 
                        onClick={() => setSelectedRfq(rfq)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors mr-2 cursor-pointer" 
                        title="View Full RFQ Details"
                      >
                        <Eye size={18} />
                      </button>
                      {isAdmin && (
                        <button 
                          onClick={() => handleDelete(rfq._id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer" 
                          title="Delete RFQ"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RFQ Detail Modal: Portal-Mounted, Permanently Pinned Top Header, Fully Responsive */}
      {selectedRfq && createPortal(
        <div 
          id="rfq-print-overlay"
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-[99999] p-2 sm:p-4 md:p-6 overflow-hidden print:p-0 print:bg-white print:static print:inset-auto print:overflow-visible"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleCloseModal();
          }}
        >
          <div id="rfq-print-card" className="bg-white shadow-2xl w-full max-w-4xl max-h-[96vh] sm:max-h-[92vh] flex flex-col relative my-0 animate-in zoom-in-95 duration-150 print:w-full print:h-auto print:max-h-none print:shadow-none print:m-0 print:p-0 rounded-2xl overflow-hidden border border-slate-200">
            
            {/* Top Toolbar (Hidden on Print) - Permanently Pinned with Close & Print */}
            <div id="rfq-print-toolbar" className="bg-slate-900 text-white border-b border-slate-800 px-3 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between gap-2.5 print:hidden shrink-0 z-30 shadow-md">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 min-w-0">
                {/* Back Button */}
                <button
                  onClick={handleCloseModal}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-xl text-xs font-bold border border-slate-700 shadow-xs transition-colors cursor-pointer shrink-0"
                  title="Return to RFQ List"
                >
                  <ArrowLeft size={15} />
                  <span className="hidden sm:inline">Back to RFQs</span>
                  <span className="sm:hidden">Back</span>
                </button>

                {/* Status Selector or Closed Badge */}
                {selectedRfq.status === 'Closed' || selectedRfq.status === 'Completed' ? (
                  <div className="flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-400/30 px-2.5 py-1 rounded-xl">
                    <CheckCircle size={13} className="text-emerald-400 shrink-0" />
                    <span className="text-xs font-bold text-emerald-300">Closed</span>
                    {isAdmin && (
                      <button
                        onClick={() => handleStatusChange(selectedRfq._id, 'Under Review')}
                        className="text-[11px] text-blue-400 hover:underline font-semibold ml-1 cursor-pointer"
                      >
                        Reopen
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 bg-slate-800 px-2.5 py-1 rounded-xl border border-slate-700">
                    <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider hidden sm:inline">Status:</span>
                    <select
                      value={selectedRfq.status}
                      onChange={(e) => handleStatusChange(selectedRfq._id, e.target.value)}
                      className="text-xs font-bold bg-transparent text-white outline-none cursor-pointer"
                    >
                      <option value="New" className="bg-slate-900 text-white">New</option>
                      <option value="Assigned" className="bg-slate-900 text-white">Assigned</option>
                      <option value="Under Review" className="bg-slate-900 text-white">Under Review</option>
                      <option value="Process by Sales" className="bg-slate-900 text-white">Process by Sales</option>
                      <option value="Closed" className="bg-slate-900 text-white">Closed</option>
                    </select>
                  </div>
                )}

                {/* Assigned Salesperson / Processed By */}
                {selectedRfq.status === 'Closed' || selectedRfq.status === 'Completed' ? (
                  <div className="bg-slate-800/80 border border-slate-700 px-2.5 py-1 rounded-xl text-xs font-semibold text-slate-300 hidden md:block">
                    Processed by: <span className="font-bold text-white">{selectedRfq.assignedToName || 'Sales Team'}</span>
                  </div>
                ) : (
                  <div className="hidden md:flex items-center gap-1.5 bg-slate-800 px-2.5 py-1 rounded-xl border border-slate-700">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Assigned:</span>
                    {canAssign ? (
                      <select
                        value={selectedRfq.assignedTo || (users.find(u => u.name === selectedRfq.assignedToName)?._id) || ''}
                        onChange={(e) => handleAssign(selectedRfq._id, e.target.value)}
                        className="text-xs font-bold bg-transparent text-blue-400 outline-none cursor-pointer"
                      >
                        <option value="" className="bg-slate-900 text-white">-- Unassigned --</option>
                        {users.map(u => (
                          <option key={u._id} value={u._id} className="bg-slate-900 text-white">
                            {u.name} ({u.role})
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-xs font-bold text-blue-400">{selectedRfq.assignedToName || 'Unassigned'}</span>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons: Prominent Print and Close (X) Buttons */}
              <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
                <button 
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all font-bold text-xs shadow-md shadow-blue-900/40 cursor-pointer"
                  title="Print Quotation"
                >
                  <Printer size={15} />
                  <span>Print</span>
                </button>
                <button 
                  onClick={handleCloseModal} 
                  className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl bg-slate-800 hover:bg-red-500/20 hover:text-red-400 text-slate-200 border border-slate-700 transition-colors cursor-pointer shrink-0"
                  title="Close (Esc)"
                  aria-label="Close Modal"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

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
                    <thead className="bg-slate-900 text-white">
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
                        selectedRfq.items.map((item: any, idx: number) => (
                          <tr key={idx} className="group hover:bg-slate-50">
                            <td className="py-3 px-4 text-center text-slate-400 font-medium">{idx + 1}</td>
                            <td className="py-3 px-4">
                              <p className="font-bold text-slate-900 font-mono">{item.partNo}</p>
                              <p className="text-slate-500 text-xs mt-0.5">{item.name}</p>
                            </td>
                            <td className="py-3 px-4 font-medium">{item.brand}</td>
                            <td className="py-3 px-4 text-right font-bold">{item.qty} {item.unit || 'nos'}</td>
                            <td className="py-3 px-4 text-right font-mono">₹{item.unitPrice?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                            <td className="py-3 px-4 text-right font-bold text-slate-900 font-mono">₹{item.totalBeforeTax?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                          </tr>
                        ))
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
                    <li>Delivery: Ex-Stock Bangalore</li>
                    <li>Payment: 30 Days Credit against approved PO</li>
                    <li>Subject to Bangalore Jurisdiction</li>
                  </ul>
                </div>
                <div className="w-full sm:w-72 bg-slate-50 p-5 rounded-xl border border-slate-200">
                  <div className="space-y-2 text-sm text-slate-600 mb-3 pb-3 border-b border-slate-200">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="font-mono font-medium text-slate-800">₹{selectedRfq.subtotal?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax (GST 18%)</span>
                      <span className="font-mono font-medium text-slate-800">₹{((selectedRfq.grandTotal || 0) - (selectedRfq.subtotal || 0))?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-lg font-black text-slate-900">
                    <span>Grand Total</span>
                    <span className="font-mono text-xl text-blue-700">₹{selectedRfq.grandTotal?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}</span>
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
