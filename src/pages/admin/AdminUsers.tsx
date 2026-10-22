import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Users, RefreshCw, UserCheck, Mail, Shield, Plus, X, Building, Phone, MapPin, FileText, CheckCircle2, AlertCircle, Trash2, Edit2, Eye } from 'lucide-react';
import { API_BASE_URL } from '../../config/api';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  status?: string;
  company?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  gstin?: string;
  createdAt?: string;
}

export const AdminUsers: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'Customers' | 'Internal'>(() => {
    return tabParam === 'internal' ? 'Internal' : 'Customers';
  });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<User | null>(null);
  
  // Customer Create / Edit Modal State
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<User | null>(null);
  const [customerFormData, setCustomerFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    city: '',
    state: '',
    pincode: '',
    address: '',
    gstin: '',
    status: 'Active',
    password: ''
  });
  const [customerFormError, setCustomerFormError] = useState<string | null>(null);

  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'Sales Executive', status: 'Active' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (tabParam === 'internal') {
      setActiveTab('Internal');
    } else if (tabParam === 'customers') {
      setActiveTab('Customers');
    }
  }, [tabParam]);

  // Current logged in user info
  const currentAdminStr = localStorage.getItem('siddhi_admin_user');
  const currentAdmin = currentAdminStr ? JSON.parse(currentAdminStr) : null;
  const rawRole = (currentAdmin?.role || '').toLowerCase();
  const isAdmin = rawRole.includes('admin') || !currentAdminStr;
  const isSalesManager = rawRole.includes('manager');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/admin/users`, {
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
        window.dispatchEvent(new Event('users_updated'));
      }
    } catch (error) {
      console.error('Failed to fetch users', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (userId: string, currentStatus: string | undefined) => {
    if (!isAdmin) return;
    const newStatus = currentStatus === 'Inactive' ? 'Active' : 'Inactive';
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchUsers();
        if (selectedCustomer && selectedCustomer._id === userId) {
          setSelectedCustomer({ ...selectedCustomer, status: newStatus });
        }
      }
    } catch (error) {
      console.error('Failed to update status', error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this staff member?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      if (res.ok) {
        setUsers(prev => prev.filter(u => u._id !== userId));
      }
    } catch (e) {
      console.error('Failed to delete user', e);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/admin/users`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setIsAddModalOpen(false);
        setFormData({ name: '', email: '', password: '', role: 'Sales Executive', status: 'Active' });
        fetchUsers();
      }
    } catch (error) {
      console.error('Failed to add user', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openCreateCustomerModal = () => {
    setEditingCustomer(null);
    setCustomerFormData({
      name: '',
      company: '',
      email: '',
      phone: '',
      city: '',
      state: '',
      pincode: '',
      address: '',
      gstin: '',
      status: 'Active',
      password: ''
    });
    setCustomerFormError(null);
    setIsCustomerModalOpen(true);
  };

  const openEditCustomerModal = (customer: User) => {
    setEditingCustomer(customer);
    setCustomerFormData({
      name: customer.name || '',
      company: customer.company || '',
      email: customer.email || '',
      phone: customer.phone || '',
      city: customer.city || '',
      state: customer.state || '',
      pincode: customer.pincode || '',
      address: customer.address || '',
      gstin: customer.gstin || '',
      status: customer.status || 'Active',
      password: ''
    });
    setCustomerFormError(null);
    setIsCustomerModalOpen(true);
  };

  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setCustomerFormError(null);
    try {
      const token = localStorage.getItem('token');
      const url = editingCustomer
        ? `${API_BASE_URL}/api/admin/users/${editingCustomer._id}`
        : `${API_BASE_URL}/api/admin/users`;
      const method = editingCustomer ? 'PUT' : 'POST';
      const payload: any = {
        name: customerFormData.name.trim(),
        company: customerFormData.company.trim(),
        email: customerFormData.email.trim().toLowerCase(),
        phone: customerFormData.phone.trim(),
        city: customerFormData.city.trim(),
        state: customerFormData.state.trim(),
        pincode: customerFormData.pincode.trim(),
        address: customerFormData.address.trim(),
        gstin: customerFormData.gstin.trim(),
        status: customerFormData.status
      };

      if (editingCustomer) {
        if (customerFormData.password && customerFormData.password.trim()) {
          payload.password = customerFormData.password.trim();
        }
      } else {
        payload.role = 'Customer';
        payload.password = customerFormData.password && customerFormData.password.trim()
          ? customerFormData.password.trim()
          : 'Customer@123';
      }

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || err.details || 'Failed to save customer');
      }

      const savedUser = await res.json();
      if (selectedCustomer && editingCustomer && selectedCustomer._id === editingCustomer._id) {
        setSelectedCustomer({ ...selectedCustomer, ...savedUser });
      }

      setIsCustomerModalOpen(false);
      setEditingCustomer(null);
      fetchUsers();
    } catch (error: any) {
      setCustomerFormError(error.message || 'Error saving customer profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isCustomerRole = (role?: string) => {
    const r = (role || '').toLowerCase().trim();
    return r === 'customer' || r === 'website customer' || r === 'corporate customer' || r === 'client';
  };

  const customers = users
    .filter(u => isCustomerRole(u.role))
    .sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeB - timeA; // newest first
    });
  const internalUsers = users.filter(u => {
    if (isCustomerRole(u.role)) return false;
    const em = (u.email || '').toLowerCase().trim();
    // Filter out the 3 unwanted dummy placeholder accounts
    if (em === 'admin@siddhikabel.com' || em === 'sales@siddhikabel.com' || em === 'manager@siddhikabel.com') {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            {activeTab === 'Customers' ? 'Customer Management' : 'Team & Staff Management'}
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
              activeTab === 'Customers' 
                ? 'bg-sky-50 text-sky-700 border-sky-200' 
                : 'bg-red-50 text-red-700 border-red-200'
            }`}>
              {activeTab === 'Customers' ? `${customers.length} Registered Customers` : `${internalUsers.length} Staff Members`}
            </span>
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {activeTab === 'Customers' 
              ? 'View registered corporate customers, registration dates, GSTIN, and company profiles.' 
              : 'Manage internal administrators, sales managers, and executives.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchUsers}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors font-medium text-sm cursor-pointer"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          {isAdmin && activeTab === 'Customers' && (
            <button 
              onClick={openCreateCustomerModal}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 via-red-700 to-rose-700 hover:opacity-95 text-white rounded-lg transition-all font-bold text-sm shadow-md shadow-red-600/20 cursor-pointer"
            >
              <Plus size={16} />
              Create Customer
            </button>
          )}
          {isAdmin && activeTab === 'Internal' && (
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 via-red-700 to-rose-700 hover:opacity-95 text-white rounded-lg transition-all font-bold text-sm shadow-md shadow-red-600/20 cursor-pointer"
            >
              <Plus size={16} />
              Add Internal User
            </button>
          )}
        </div>
      </div>

      {/* Content Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {activeTab === 'Customers' ? (
            /* Corporate Customers Table */
            <table className="w-full text-left text-sm min-w-[850px]">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                <tr>
                  <th className="py-3 px-6 font-semibold">Customer / Company</th>
                  <th className="py-3 px-6 font-semibold">Registered Date</th>
                  <th className="py-3 px-6 font-semibold">Contact Details</th>
                  <th className="py-3 px-6 font-semibold">GSTIN</th>
                  <th className="py-3 px-6 font-semibold">Location</th>
                  <th className="py-3 px-6 font-semibold">Status</th>
                  <th className="py-3 px-6 font-semibold text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-red-600" />
                      Loading customers...
                    </td>
                  </tr>
                ) : customers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center">
                      <Building className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <h3 className="text-lg font-medium text-slate-900">No Customers Registered Yet</h3>
                      <p className="text-slate-500 text-sm mt-1">Customer profiles will appear here once they register on the storefront.</p>
                    </td>
                  </tr>
                ) : (
                  customers.map((user) => (
                    <tr key={user._id} className="hover:bg-red-50/20 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-900 flex items-center gap-2">
                          <Building size={16} className="text-red-600" />
                          {user.company || user.name}
                        </div>
                        {user.company && (
                          <div className="text-xs text-slate-500 mt-0.5 font-medium">Attn: {user.name}</div>
                        )}
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-600 font-medium">
                        {user.createdAt ? (
                          <div>
                            <div className="font-bold text-slate-800">
                              {new Date(user.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {new Date(user.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Registered</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-slate-600">
                        <div className="flex items-center gap-1.5 text-xs">
                          <Mail size={13} className="text-slate-400" />
                          <span>{user.email || 'N/A'}</span>
                        </div>
                        {user.phone && (
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                            <Phone size={13} className="text-slate-400" />
                            <span>{user.phone}</span>
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        {user.gstin && user.gstin.trim() && user.gstin.toUpperCase() !== 'UNREGISTERED' ? (
                          <span className="font-mono text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-800 rounded border border-slate-200">
                            {user.gstin}
                          </span>
                        ) : (
                          <span className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded font-medium">
                            Unregistered (Non-GST)
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-600">
                        {user.city ? `${user.city}${user.state ? `, ${user.state}` : ''}` : 'N/A'}
                      </td>
                      <td className="py-4 px-6">
                        <button
                          onClick={() => handleToggleStatus(user._id, user.status)}
                          disabled={!isAdmin}
                          title={isAdmin ? "Click to toggle Active / Inactive" : ""}
                          className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-md transition-colors ${
                            user.status === 'Inactive' 
                              ? 'text-slate-600 bg-slate-100 border border-slate-200'
                              : 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                          } ${isAdmin ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}
                        >
                          <UserCheck size={13} className="mr-1" />
                          {user.status || 'Active'}
                        </button>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setSelectedCustomer(user)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 font-semibold text-xs rounded-lg transition-colors border border-red-200 shadow-2xs cursor-pointer"
                            title="View Customer Profile"
                          >
                            <Eye size={13} />
                            View Profile
                          </button>
                          {isAdmin && (
                            <button
                              onClick={() => openEditCustomerModal(user)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-700 hover:bg-slate-100 font-semibold text-xs rounded-lg transition-colors border border-slate-200 shadow-2xs cursor-pointer"
                              title="Edit Customer Details"
                            >
                              <Edit2 size={13} />
                              Edit Profile
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : (
            /* Internal Team Table */
            <table className="w-full text-left text-sm min-w-[650px]">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                <tr>
                  <th className="py-3 px-6 font-semibold">Staff Member</th>
                  <th className="py-3 px-6 font-semibold">Email Contact</th>
                  <th className="py-3 px-6 font-semibold">Role Designation</th>
                  <th className="py-3 px-6 font-semibold">Status</th>
                  <th className="py-3 px-6 font-semibold text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-red-600" />
                      Loading users...
                    </td>
                  </tr>
                ) : internalUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center">
                      <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <h3 className="text-lg font-medium text-slate-900">No Internal Staff Found</h3>
                    </td>
                  </tr>
                ) : (
                  internalUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-red-50/20 transition-colors">
                      <td className="py-4 px-6 font-medium text-slate-900 flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full font-bold flex items-center justify-center border text-xs shadow-2xs ${
                          user.role === 'Admin' || user.role === 'Super Admin'
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : user.role === 'Sales Manager'
                            ? 'bg-orange-50 text-orange-700 border-orange-200'
                            : 'bg-sky-50 text-sky-700 border-sky-200'
                        }`}>
                          {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{user.name}</p>
                          <p className="text-[11px] text-slate-400 font-normal">Internal Member</p>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-600">
                        <div className="flex items-center gap-1.5 text-xs">
                          <Mail size={13} className="text-slate-400" />
                          {user.email || 'N/A'}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border shadow-2xs ${
                          user.role === 'Admin' || user.role === 'Super Admin'
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : user.role === 'Sales Manager'
                            ? 'bg-orange-50 text-orange-700 border-orange-200'
                            : 'bg-sky-50 text-sky-700 border-sky-200'
                        }`}>
                          <Shield size={12} className="mr-1.5" />
                          {user.role}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center text-xs font-semibold px-2 py-1 rounded-md ${
                          user.status === 'Inactive' 
                            ? 'text-slate-600 bg-slate-100'
                            : 'text-emerald-600 bg-emerald-50'
                        }`}>
                          <UserCheck size={14} className="mr-1" /> {user.status || 'Active'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        {isAdmin && (
                          <button
                            onClick={() => handleDeleteUser(user._id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete staff member"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Customer Profile Details Modal - Fully Responsive */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 my-auto">
            <div className="bg-slate-50 border-b border-slate-200 p-6 flex justify-between items-start">
              <div>
                <span className="text-xs font-bold text-red-600 uppercase tracking-widest">Customer Profile</span>
                <h3 className="text-xl font-bold text-slate-900 mt-1">{selectedCustomer.company || selectedCustomer.name}</h3>
                <p className="text-slate-500 text-xs mt-0.5">Contact: {selectedCustomer.name}</p>
              </div>
              <button 
                onClick={() => setSelectedCustomer(null)}
                className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email Address</p>
                  <p className="font-medium text-slate-800 mt-1 break-all">{selectedCustomer.email || 'N/A'}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Phone / Mobile</p>
                  <p className="font-medium text-slate-800 mt-1">{selectedCustomer.phone || 'N/A'}</p>
                </div>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Registration Date</p>
                  <p className="font-semibold text-slate-800 mt-1">
                    {selectedCustomer.createdAt 
                      ? new Date(selectedCustomer.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
                      : 'Corporate Client'}
                  </p>
                </div>
                <span className="text-xs font-bold text-sky-700 bg-sky-50 border border-sky-200 px-2.5 py-1 rounded-lg">
                  Registered User
                </span>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">GSTIN Number</p>
                <p className="font-mono font-bold text-slate-800 mt-1 text-base">
                  {selectedCustomer.gstin && selectedCustomer.gstin.trim() && selectedCustomer.gstin.toUpperCase() !== 'UNREGISTERED'
                    ? selectedCustomer.gstin
                    : 'Unregistered (Consumer / Non-GST Corporate)'}
                </p>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Delivery & Billing Address</p>
                <p className="font-medium text-slate-800 mt-1">
                  {selectedCustomer.address || 'Address not registered'}
                </p>
                {(selectedCustomer.city || selectedCustomer.state) && (
                  <p className="text-slate-500 text-xs mt-1">
                    {[selectedCustomer.city, selectedCustomer.state].filter(Boolean).join(', ')}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between pt-2">
                <div>
                  <span className="text-xs font-semibold text-slate-400">Account Status: </span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${selectedCustomer.status === 'Inactive' ? 'bg-slate-100 text-slate-700' : 'bg-emerald-100 text-emerald-800'}`}>
                    {selectedCustomer.status || 'Active'}
                  </span>
                </div>
                {isAdmin && (
                  <button
                    onClick={() => handleToggleStatus(selectedCustomer._id, selectedCustomer.status)}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors"
                  >
                    Set as {selectedCustomer.status === 'Inactive' ? 'Active' : 'Inactive'}
                  </button>
                )}
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              {isAdmin ? (
                <button
                  onClick={() => {
                    const cust = selectedCustomer;
                    setSelectedCustomer(null);
                    openEditCustomerModal(cust);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <Edit2 size={14} />
                  Edit Profile
                </button>
              ) : <div />}
              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-5 py-2 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 shadow-2xs transition-colors cursor-pointer"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Customer Modal */}
      {isCustomerModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 my-8">
            <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50/80">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
                  <Building size={18} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">
                    {editingCustomer ? 'Edit Customer Profile' : 'Create New Customer'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {editingCustomer 
                      ? `Updating corporate profile for ${editingCustomer.company || editingCustomer.name}` 
                      : 'Add a new corporate or individual client account with contact and GST details.'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsCustomerModalOpen(false)} 
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {customerFormError && (
              <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs font-semibold text-red-700">
                <AlertCircle size={16} className="shrink-0 text-red-500" />
                <span>{customerFormError}</span>
              </div>
            )}

            <form onSubmit={handleSaveCustomer} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Contact Person Name <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    required 
                    value={customerFormData.name}
                    onChange={(e) => setCustomerFormData({ ...customerFormData, name: e.target.value })}
                    placeholder="e.g. Rajesh Kumar"
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-sm transition-all" 
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Company Name
                  </label>
                  <input 
                    type="text" 
                    value={customerFormData.company}
                    onChange={(e) => setCustomerFormData({ ...customerFormData, company: e.target.value })}
                    placeholder="e.g. Apex Automation & Switchgear"
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-sm transition-all" 
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="email" 
                    required 
                    value={customerFormData.email}
                    onChange={(e) => setCustomerFormData({ ...customerFormData, email: e.target.value })}
                    placeholder="procurement@company.com"
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-sm transition-all" 
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="tel" 
                    required 
                    value={customerFormData.phone}
                    onChange={(e) => setCustomerFormData({ ...customerFormData, phone: e.target.value })}
                    placeholder="+91 98450 12345"
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-sm transition-all" 
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    GSTIN Number
                  </label>
                  <input 
                    type="text" 
                    value={customerFormData.gstin}
                    onChange={(e) => setCustomerFormData({ ...customerFormData, gstin: e.target.value.toUpperCase() })}
                    placeholder="29AABCU9603R1ZM (Leave blank if Non-GST / Unregistered)"
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none font-mono text-sm transition-all" 
                  />
                  <p className="text-[11px] text-slate-400 mt-1">If non-GST / unregistered consumer, leave empty or type "Unregistered".</p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Address (Street / Building / Area)
                  </label>
                  <textarea 
                    rows={2}
                    value={customerFormData.address}
                    onChange={(e) => setCustomerFormData({ ...customerFormData, address: e.target.value })}
                    placeholder="e.g. Plot No 42, Peenya Industrial Area, Phase II"
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-sm transition-all resize-none" 
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    City
                  </label>
                  <input 
                    type="text" 
                    value={customerFormData.city}
                    onChange={(e) => setCustomerFormData({ ...customerFormData, city: e.target.value })}
                    placeholder="e.g. Bangalore"
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-sm transition-all" 
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    State
                  </label>
                  <input 
                    type="text" 
                    value={customerFormData.state}
                    onChange={(e) => setCustomerFormData({ ...customerFormData, state: e.target.value })}
                    placeholder="e.g. Karnataka"
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-sm transition-all" 
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Pincode
                  </label>
                  <input 
                    type="text" 
                    value={customerFormData.pincode}
                    onChange={(e) => setCustomerFormData({ ...customerFormData, pincode: e.target.value })}
                    placeholder="e.g. 560058"
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-sm transition-all" 
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Account Status
                  </label>
                  <select 
                    value={customerFormData.status}
                    onChange={(e) => setCustomerFormData({ ...customerFormData, status: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-sm bg-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    {editingCustomer ? 'Reset Password (optional)' : 'Account Password'}
                  </label>
                  <input 
                    type="password" 
                    value={customerFormData.password}
                    onChange={(e) => setCustomerFormData({ ...customerFormData, password: e.target.value })}
                    placeholder={editingCustomer ? 'Leave blank to retain existing password' : 'Default: Customer@123 if left blank'}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-sm transition-all" 
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
                <button 
                  type="button" 
                  onClick={() => setIsCustomerModalOpen(false)}
                  className="px-4 py-2 text-slate-600 font-semibold hover:bg-slate-100 rounded-xl transition-colors text-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-gradient-to-r from-red-600 via-red-700 to-rose-700 text-white font-bold rounded-xl hover:opacity-95 shadow-md shadow-red-600/25 transition-all disabled:opacity-70 text-sm cursor-pointer"
                >
                  {isSubmitting ? 'Saving...' : (editingCustomer ? 'Update Customer' : 'Create Customer')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-800">Add Staff Member</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleAddUser} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input 
                  type="text" 
                  required 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                <input 
                  type="email" 
                  required 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <input 
                  type="password" 
                  required 
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Role Designation</label>
                  <select 
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-sm"
                  >
                    <option value="Super Admin">Super Admin</option>
                    <option value="Admin">Admin</option>
                    <option value="Sales Manager">Sales Manager</option>
                    <option value="Sales Executive">Sales Executive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                  <select 
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-sm"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
                <button 
                  type="button" 
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-lg transition-colors text-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-gradient-to-r from-red-600 via-red-700 to-rose-700 text-white font-bold rounded-lg hover:opacity-95 shadow-md shadow-red-600/25 transition-all disabled:opacity-70 text-sm cursor-pointer"
                >
                  {isSubmitting ? 'Saving...' : 'Save User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
