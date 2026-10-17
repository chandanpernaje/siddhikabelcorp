import React, { useState, useEffect } from 'react';
import { Users, ShoppingBag, FileText, AlertCircle, CheckCircle, Clock, TrendingUp, ArrowUpRight, ArrowDownRight, Activity, BarChart3, Building } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config/api';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState({
    totalCustomers: 0,
    totalProducts: 0,
    totalRFQs: 0,
    pendingRFQs: 0,
    recentRFQs: [] as any[]
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/api/admin/dashboard`, {
          headers: {
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          }
        });
        
        if (res.ok) {
          const stats = await res.json();
          setData(stats);
        }
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const stats = [
    { 
      title: 'Total Customers', 
      value: data.totalCustomers, 
      icon: Building, 
      color: 'text-sky-600', 
      bg: 'bg-sky-50', 
      cardBg: 'from-white via-white to-sky-50/50',
      border: 'border-sky-200/90', 
      trend: '+12%', 
      trendColor: 'text-sky-700 bg-sky-50 border-sky-200',
      up: true, 
      link: '/admin/users' 
    },
    { 
      title: 'Total Products', 
      value: data.totalProducts, 
      icon: ShoppingBag, 
      color: 'text-slate-700', 
      bg: 'bg-slate-100', 
      cardBg: 'from-white via-white to-slate-100/60',
      border: 'border-slate-200', 
      trend: '+4%', 
      trendColor: 'text-slate-700 bg-slate-100 border-slate-200',
      up: true, 
      link: '/admin/products' 
    },
    { 
      title: 'Total RFQs (Quotes)', 
      value: data.totalRFQs, 
      icon: FileText, 
      color: 'text-red-600', 
      bg: 'bg-red-50', 
      cardBg: 'from-white via-white to-red-50/50',
      border: 'border-red-200/90', 
      trend: '+24%', 
      trendColor: 'text-red-700 bg-red-50 border-red-200',
      up: true, 
      link: '/admin/rfqs' 
    },
    { 
      title: 'Pending Actions', 
      value: data.pendingRFQs, 
      icon: AlertCircle, 
      color: 'text-orange-600', 
      bg: 'bg-orange-50', 
      cardBg: 'from-white via-white to-orange-50/50',
      border: 'border-orange-200/90', 
      trend: '+6', 
      trendColor: 'text-orange-700 bg-orange-50 border-orange-200',
      up: true, 
      link: '/admin/rfqs?filter=pending' 
    },
  ];

  const currentAdminStr = localStorage.getItem('siddhi_admin_user');
  const currentAdmin = currentAdminStr ? JSON.parse(currentAdminStr) : null;
  const userName = currentAdmin?.name || 'Executive';
  const userRole = currentAdmin?.role || 'Admin';
  const isSales = userRole.toLowerCase().includes('sales');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="w-10 h-10 border-4 border-red-100 border-t-red-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Corporate Light Hero Banner with Signature Red Accent */}
      <div className="bg-gradient-to-br from-white via-red-50/30 to-orange-50/20 rounded-2xl p-7 sm:p-9 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between relative overflow-hidden group gap-6 border border-slate-200/90">
        {/* Subtle pastel ambient background auras */}
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-red-100/50 rounded-full blur-3xl pointer-events-none group-hover:opacity-75 transition-opacity duration-700"></div>
        <div className="absolute -left-10 -bottom-10 w-64 h-64 bg-sky-100/40 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-1/2 right-1/3 w-48 h-48 bg-amber-100/35 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-700 text-xs font-bold mb-3 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            {userRole} Workspace
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight">
            Welcome, <span className="bg-gradient-to-r from-red-600 via-red-700 to-orange-600 bg-clip-text text-transparent">{userName}</span>!
          </h2>
          <p className="text-slate-600 font-medium mt-2 text-xs sm:text-sm max-w-xl leading-relaxed">
            {isSales 
              ? 'Review your assigned RFQs, update customer pipeline stages, grant special project discounts, and generate official proforma quotations.' 
              : 'Monitor enterprise operations, assign RFQs to your sales team, track quotations, and manage catalog performance in real-time.'}
          </p>
        </div>
        
        <div className="w-full md:w-auto relative z-10 flex shrink-0">
           <div className="w-full sm:w-auto bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm flex items-center gap-4 hover:border-slate-300 transition-all">
             <div className="w-12 h-12 bg-red-50 text-red-600 rounded-xl flex items-center justify-center shrink-0 border border-red-100 shadow-2xs">
               <Activity size={24} />
             </div>
             <div>
               <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">System Status</p>
               <p className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                 <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.4)]"></span>
                 Operational
               </p>
             </div>
           </div>
        </div>
      </div>

      {/* KPI Cards in 4 Harmonious Light Colors: Light Sky Blue, Light Grey, Light Red, Light Orange */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Link key={i} to={stat.link} className={`group relative bg-gradient-to-br ${stat.cardBg} rounded-2xl p-6 shadow-sm border ${stat.border} overflow-hidden hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 block`}>
              {/* Expanding Background Blob */}
              <div className={`absolute -right-10 -top-10 w-32 h-32 rounded-full ${stat.bg} opacity-40 group-hover:opacity-100 group-hover:scale-[3] transition-all duration-700 ease-out z-0`} />
              
              <div className="relative z-10 flex justify-between items-start mb-6">
                <div className={`w-12 h-12 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center border ${stat.border} group-hover:scale-105 group-hover:shadow-xs transition-all duration-300`}>
                  <Icon size={24} strokeWidth={2.2} />
                </div>
                <div className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-md border shadow-2xs ${stat.trendColor}`}>
                  {stat.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  {stat.trend}
                </div>
              </div>
              
              <div className="relative z-10 pb-2">
                <h3 className="text-3xl font-extrabold text-slate-800 tracking-tight group-hover:text-slate-900 transition-colors">{stat.value.toLocaleString()}</h3>
                <p className="text-sm font-semibold text-slate-500 mt-1 group-hover:text-slate-700 transition-colors">{stat.title}</p>
              </div>
              
              {/* Slide Up Reveal Footer */}
              <div className="absolute inset-x-0 bottom-0 p-3.5 bg-white/90 backdrop-blur-md border-t border-slate-100 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out z-20 flex items-center justify-between">
                <span className={`text-xs font-bold ${stat.color}`}>View records →</span>
                <ArrowUpRight size={15} className={`${stat.color}`} />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Recent RFQs Table - Corporate Styling with Light Colors */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative">
        <div className="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/70">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Recent Quotations</h2>
            <p className="text-sm text-slate-500 mt-0.5">Latest RFQs generated by corporate clients</p>
          </div>
          <Link to="/admin/rfqs" className="px-4 py-2 bg-white border border-slate-200 hover:border-red-500 hover:text-red-700 text-slate-600 text-sm font-semibold rounded-lg shadow-2xs transition-all flex items-center justify-center gap-2 group/link cursor-pointer">
            View All Records
            <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform opacity-70" />
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="bg-slate-50/90 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Quote Reference</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Client Details</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Current Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Assigned Salesperson</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Date Generated</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.recentRFQs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                     <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                     <p className="text-slate-500 font-medium">No quotation records found.</p>
                  </td>
                </tr>
              ) : (
                data.recentRFQs.map((rfq: any) => (
                  <tr 
                    key={rfq._id} 
                    onClick={() => navigate(`/admin/rfqs?id=${rfq._id}`)}
                    className="hover:bg-red-50/20 transition-colors group/row cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <Link 
                        to={`/admin/rfqs?id=${rfq._id}`}
                        onClick={e => e.stopPropagation()}
                        className="text-xs font-bold text-sky-700 hover:text-sky-900 bg-sky-50/80 shadow-2xs border border-sky-200 px-2.5 py-1 rounded-md group-hover/row:border-sky-400 transition-colors whitespace-nowrap font-mono inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <FileText size={13} className="text-sky-600" />
                        {rfq.quoteNo}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-slate-800 group-hover/row:text-red-700 transition-colors">{rfq.customerName}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{rfq.companyName}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border whitespace-nowrap shadow-2xs ${
                        (rfq.status === 'New' || rfq.status === 'Open' || rfq.status === 'Pending') ? 'bg-red-50 text-red-700 border-red-200' :
                        (rfq.status === 'Assigned') ? 'bg-sky-50 text-sky-700 border-sky-200' :
                        (rfq.status === 'Under Review') ? 'bg-orange-50 text-orange-700 border-orange-200' :
                        (rfq.status === 'Process by Sales' || rfq.status === 'Processing') ? 'bg-purple-50 text-purple-700 border-purple-200' :
                        'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}>
                        {(rfq.status === 'New' || rfq.status === 'Open' || rfq.status === 'Pending') && <Clock size={12} className="mr-1.5" strokeWidth={2.5} />}
                        {(rfq.status === 'Assigned' || rfq.status === 'Under Review') && <Users size={12} className="mr-1.5" strokeWidth={2.5} />}
                        {(rfq.status === 'Closed' || rfq.status === 'Quoted') && <CheckCircle size={12} className="mr-1.5" strokeWidth={2.5} />}
                        {rfq.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap ${
                        rfq.assignedToName 
                          ? 'bg-gradient-to-r from-red-50 to-orange-50 text-red-800 border border-orange-200 font-semibold shadow-2xs' 
                          : 'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}>
                        {rfq.assignedToName || 'Unassigned'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">{rfq.date || (rfq.createdAt ? new Date(rfq.createdAt).toLocaleDateString() : '-')}</td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        to={`/admin/rfqs?id=${rfq._id}`} 
                        onClick={e => e.stopPropagation()}
                        className="inline-flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        title="View Full RFQ Detail"
                      >
                        <TrendingUp size={18} strokeWidth={2} />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
