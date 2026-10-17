import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, ArrowLeft } from 'lucide-react';
import { API_BASE_URL } from '../../config/api';

export const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (res.ok) {
        const data = await res.json();
        const user = data.user || data;
        const role = (user.role || '').toLowerCase().trim();
        const isCustomer = !role || role === 'customer' || role === 'client' || role === 'corporate customer' || role === 'website customer';
        if (isCustomer) {
          setError('Access denied: Customer accounts cannot log in to the Admin Portal. Only authorized Internal Staff & Sales Team members are allowed.');
          return;
        }
        if (data.token) localStorage.setItem('token', data.token);
        localStorage.setItem('siddhi_admin_user', JSON.stringify(user));
        // Redirect to Dashboard as requested (landing page)
        navigate('/admin');
      } else {
        const errData = await res.json().catch(() => ({}));
        setError(errData.error || 'Invalid credentials');
      }
    } catch (err) {
      setError('Connection failed. Is backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden px-4">
      {/* Colorful light ambient blobs: Sky Blue, Orange, Light Red */}
      <div className="absolute -top-20 -right-20 w-80 h-80 bg-sky-200/35 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-orange-200/35 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-red-100/25 rounded-full blur-3xl pointer-events-none" />
      <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-xl w-full max-w-md border border-slate-200/90 relative z-10">
        <div className="flex justify-center mb-6">
          <img 
            src="/images/siddhi-kabel-lockup.png" 
            alt="Siddhi Kabel Corporation Private Limited" 
            className="h-14 sm:h-16 object-contain"
            onError={(e) => { e.currentTarget.src = '/images/siddhi-kabel-logo.png'; }}
          />
        </div>
        <h2 className="text-2xl font-black text-center text-slate-800 mb-1 tracking-tight">Admin Portal</h2>
        <p className="text-center text-slate-500 text-sm mb-6 font-medium">Internal Staff & Sales Team Portal</p>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs sm:text-sm rounded-xl text-center font-semibold border border-red-200">
            {error}
          </div>
        )}
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Email / Username</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input 
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:outline-none text-sm transition-all"
                placeholder="admin@example.com"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:outline-none text-sm transition-all"
                placeholder="••••••••"
                required
              />
            </div>
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-red-600 via-red-700 to-rose-700 hover:opacity-95 active:scale-98 text-white font-bold rounded-xl transition-all shadow-md shadow-red-600/25 mt-3 cursor-pointer flex items-center justify-center gap-2 text-sm disabled:opacity-60"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Secure Login</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-100 text-center">
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-red-600 transition-colors cursor-pointer">
            <ArrowLeft size={14} /> Back to Public Website
          </Link>
        </div>
      </div>
    </div>
  );
};
export default AdminLogin;
