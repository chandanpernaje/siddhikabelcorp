import React, { useState, useEffect } from 'react';
import { Users, ShoppingBag, FileText, AlertCircle, CheckCircle, Clock, TrendingUp, ArrowUpRight, ArrowDownRight, Activity, BarChart3, Building } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminDashboard: React.FC = () => {
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
        const res = await fetch('http://localhost:5000/api/admin/dashboard');
        
        if (res.ok) {
          const stats = await res.json();
          setData(stats);
        } else {
          // Fallback if API fails
          setData({
            totalCustomers: 0,
            totalProducts: 0,
            totalRFQs: 0,
            pendingRFQs: 0,
            recentRFQs: []
          });
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
    { title: 'Total Customers', value: data.totalCustomers, icon: Building, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', trend: '+12%', up: true, link: '/admin/users' },
    { title: 'Total Products', value: data.totalProducts, icon: ShoppingBag, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100', trend: '+4%', up: true, link: '/admin/products' },
    { title: 'Total RFQs', value: data.totalRFQs, icon: FileText, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', trend: '+24%', up: true, link: '/admin/rfqs' },
    { title: 'Pending Actions', value: data.pendingRFQs, icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', trend: '-2%', up: false, link: '/admin/rfqs?status=pending' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Colorful Welcome Banner */}
      <div className="bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500 rounded-2xl p-8 sm:p-10 shadow-[0_8px_30px_rgba(249,115,22,0.2)] flex flex-col md:flex-row items-start md:items-center justify-between relative overflow-hidden group gap-6 border border-orange-400/30">
        {/* Subtle mesh background */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>
        <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-white/20 to-transparent pointer-events-none"></div>
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-yellow-300 rounded-full blur-[80px] opacity-40 pointer-events-none group-hover:opacity-60 transition-opacity duration-700"></div>

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 border border-white/30 text-white text-xs font-bold mb-4 backdrop-blur-md shadow-sm">
            <BarChart3 size={14} /> Executive Overview
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight leading-tight drop-shadow-sm">Dashboard & Analytics</h2>
          <p className="text-orange-50 font-medium mt-2 text-sm sm:text-base max-w-xl drop-shadow-sm">Monitor your enterprise operations, customer quotations, and product catalog performance in real-time.</p>
        </div>
        
        <div className="w-full md:w-auto relative z-10 flex shrink-0">
           <div className="w-full sm:w-auto bg-white/20 border border-white/40 rounded-xl p-4 shadow-lg backdrop-blur-md flex items-center gap-4">
             <div className="w-12 h-12 bg-white/30 rounded-lg flex items-center justify-center text-white shrink-0 border border-white/50 shadow-sm">
               <Activity size={24} />
             </div>
             <div>
               <p className="text-[11px] font-bold text-orange-100 uppercase tracking-wider">System Status</p>
               <p className="text-base font-bold text-white flex items-center gap-2">
                 <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
                 Operational
               </p>
             </div>
           </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Link key={i} to={stat.link} className="group relative bg-white rounded-2xl p-6 shadow-sm border border-slate-200 overflow-hidden hover:shadow-xl hover:-translate-y-2 hover:border-slate-300 transition-all duration-500 block">
              {/* Expanding Background Blob */}
              <div className={`absolute -right-10 -top-10 w-32 h-32 rounded-full ${stat.bg} opacity-0 group-hover:opacity-100 group-hover:scale-[4] transition-all duration-700 ease-out z-0`} />
              
              <div className="relative z-10 flex justify-between items-start mb-6">
                <div className={`w-12 h-12 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center border ${stat.border} group-hover:bg-white group-hover:shadow-sm transition-all duration-300`}>
                  <Icon size={24} strokeWidth={2} />
                </div>
                <div className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-md bg-white border border-slate-100 shadow-sm ${stat.up ? 'text-emerald-600' : 'text-red-600'}`}>
                  {stat.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  {stat.trend}
                </div>
              </div>
              
              <div className="relative z-10 pb-2">
                <h3 className="text-3xl font-bold text-slate-800 tracking-tight group-hover:text-slate-900 transition-colors">{stat.value.toLocaleString()}</h3>
                <p className="text-sm font-medium text-slate-500 mt-1 group-hover:text-slate-700 transition-colors">{stat.title}</p>
              </div>
              
              {/* Slide Up Reveal Footer */}
              <div className="absolute inset-x-0 bottom-0 p-4 bg-white/60 backdrop-blur-md border-t border-slate-100/50 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out z-20 flex items-center justify-between">
                <span className={`text-sm font-bold ${stat.color}`}>View full list</span>
                <ArrowUpRight size={16} className={`${stat.color}`} />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Recent RFQs Table - Corporate Styling */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative">
        <div className="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Recent Quotations</h2>
            <p className="text-sm text-slate-500 mt-1">Latest RFQs generated by corporate clients</p>
          </div>
          <Link to="/admin/rfqs" className="px-4 py-2 bg-white border border-slate-200 hover:border-blue-500 hover:text-blue-700 text-slate-600 text-sm font-semibold rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 group/link">
            View All Records
            <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform opacity-70" />
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Quote Reference</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Client Details</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Current Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Date Generated</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.recentRFQs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                     <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                     <p className="text-slate-500 font-medium">No quotation records found.</p>
                  </td>
                </tr>
              ) : (
                data.recentRFQs.map((rfq: any) => (
                  <tr key={rfq._id} className="hover:bg-slate-50/80 transition-colors group/row">
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-slate-700 bg-white shadow-sm border border-slate-200 px-2.5 py-1 rounded-md group-hover/row:border-blue-300 transition-colors whitespace-nowrap font-mono">{rfq.quoteNo}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-slate-800">{rfq.customerName}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{rfq.companyName}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border whitespace-nowrap ${
                        (rfq.status === 'Pending' || rfq.status === 'New' || rfq.status === 'RFQ Submitted') ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        (rfq.status === 'Assigned' || rfq.status === 'Under Review') ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}>
                        {(rfq.status === 'Pending' || rfq.status === 'New' || rfq.status === 'RFQ Submitted') && <Clock size={12} className="mr-1.5" strokeWidth={2.5} />}
                        {(rfq.status === 'Assigned' || rfq.status === 'Under Review') && <Users size={12} className="mr-1.5" strokeWidth={2.5} />}
                        {(rfq.status === 'Quoted' || rfq.status === 'Closed') && <CheckCircle size={12} className="mr-1.5" strokeWidth={2.5} />}
                        {rfq.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">{rfq.date}</td>
                    <td className="px-6 py-4 text-right">
                      <Link to="/admin/rfqs" className="inline-flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
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
