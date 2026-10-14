import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Outlet, Link, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, ShoppingBag, Users, FileText, Settings, Menu, X, LogOut, 
  Search, ChevronRight, Bell, Check, Clock, UserCheck, ShieldCheck, KeyRound, AlertCircle
} from 'lucide-react';
import { API_BASE_URL } from '../../config/api';

interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  type: 'rfq' | 'customer' | 'system';
  referenceId?: string;
  read: boolean;
  createdAt: string;
}

export const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Admin user state
  const [currentAdmin, setCurrentAdmin] = useState<any>(() => {
    const str = localStorage.getItem('siddhi_admin_user');
    return str ? JSON.parse(str) : null;
  });

  // Notifications State
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifsOpen, setNotifsOpen] = useState(false);
  const notifsRef = useRef<HTMLDivElement>(null);

  // Profile / Account Settings Modal State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsForm, setSettingsForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsMsg, setSettingsMsg] = useState('');
  const [settingsError, setSettingsError] = useState('');

  // Header Global Search State
  const [globalSearch, setGlobalSearch] = useState('');

  useEffect(() => {
    const handleResize = () => {
      const isMob = window.innerWidth < 1024;
      setIsMobile(isMob);
      if (!isMob) setSidebarOpen(true);
      else setSidebarOpen(false);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  // Fetch Notifications
  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/notifications`);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      // Quiet fail if backend is momentarily unreachable
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 25000); // Polling every 25s
    return () => clearInterval(interval);
  }, []);

  // Close notifications dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifsRef.current && !notifsRef.current.contains(e.target as Node)) {
        setNotifsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!currentAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  const rawRole = (currentAdmin?.role || '').toLowerCase().trim();
  const isCustomer = !rawRole || rawRole === 'customer' || rawRole === 'client' || rawRole === 'corporate customer' || rawRole === 'website customer';
  if (isCustomer) {
    localStorage.removeItem('siddhi_admin_user');
    localStorage.removeItem('token');
    return <Navigate to="/admin/login" replace />;
  }

  const isSuperAdmin = rawRole.includes('super');
  const isAdmin = rawRole.includes('admin') || isSuperAdmin;
  const isSalesManager = rawRole.includes('manager');
  const isSalesExecutive = (rawRole.includes('executive') || rawRole.includes('salesman') || rawRole.includes('salesperson')) && !isAdmin && !isSalesManager;

  // Phase 1 Route Guard: Sales Executive has No Access to Products and User Management
  if (isSalesExecutive && (location.pathname.startsWith('/admin/products') || location.pathname.startsWith('/admin/users'))) {
    return <Navigate to="/admin/rfqs" replace />;
  }

  const handleLogout = () => {
    localStorage.removeItem('siddhi_admin_user');
    localStorage.removeItem('token');
    navigate('/admin/login');
  };

  const handleOpenSettings = () => {
    setSettingsForm({
      name: currentAdmin.name || '',
      email: currentAdmin.email || '',
      password: '',
      confirmPassword: ''
    });
    setSettingsMsg('');
    setSettingsError('');
    setIsSettingsOpen(true);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsMsg('');
    setSettingsError('');

    if (settingsForm.password && settingsForm.password !== settingsForm.confirmPassword) {
      setSettingsError('Passwords do not match');
      return;
    }

    setSettingsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/admin/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          id: currentAdmin._id || currentAdmin.id,
          name: settingsForm.name,
          email: settingsForm.email,
          ...(settingsForm.password ? { password: settingsForm.password } : {})
        })
      });

      if (res.ok) {
        const data = await res.json();
        const updated = { ...currentAdmin, ...data.user };
        setCurrentAdmin(updated);
        localStorage.setItem('siddhi_admin_user', JSON.stringify(updated));
        if (data.token) localStorage.setItem('token', data.token);
        setSettingsMsg('Profile updated successfully!');
        setTimeout(() => setIsSettingsOpen(false), 1200);
      } else {
        const err = await res.json().catch(() => ({}));
        setSettingsError(err.error || 'Failed to update profile');
      }
    } catch (err) {
      setSettingsError('Connection failed. Please try again.');
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleNotificationClick = async (notif: NotificationItem) => {
    try {
      await fetch(`${API_BASE_URL}/api/notifications/${notif._id}/read`, { method: 'PATCH' });
      setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (e) {}

    setNotifsOpen(false);

    if (notif.type === 'rfq') {
      navigate(`/admin/rfqs?id=${notif.referenceId || ''}`);
    } else if (notif.type === 'customer') {
      navigate(`/admin/users?id=${notif.referenceId || ''}`);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/notifications/read-all`, { method: 'PATCH' });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (e) {}
  };

  const handleGlobalSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!globalSearch.trim()) return;

    const query = encodeURIComponent(globalSearch.trim());
    if (location.pathname.startsWith('/admin/products')) {
      navigate(`/admin/products?search=${query}`);
    } else if (location.pathname.startsWith('/admin/rfqs')) {
      navigate(`/admin/rfqs?search=${query}`);
    } else if (location.pathname.startsWith('/admin/users')) {
      navigate(`/admin/users?search=${query}`);
    } else {
      // Default from Dashboard: search RFQs
      navigate(`/admin/rfqs?search=${query}`);
    }
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    ...(!isSalesExecutive ? [{ name: 'Products', path: '/admin/products', icon: ShoppingBag }] : []),
    { name: 'RFQs (Quotations)', path: '/admin/rfqs', icon: FileText },
    ...(isAdmin || isSalesManager ? [{ name: 'Customers & Users', path: '/admin/users', icon: Users }] : []),
  ];

  const sidebarWidth = isMobile ? 'w-72 max-w-[85vw]' : (sidebarOpen ? 'w-72' : 'w-20');
  const sidebarTranslate = isMobile ? (sidebarOpen ? 'translate-x-0' : '-translate-x-full pointer-events-none invisible') : 'translate-x-0';
  const mainMargin = isMobile ? 'ml-0' : (sidebarOpen ? 'ml-72' : 'ml-20');

  return (
    <div className="min-h-screen w-full bg-slate-50 flex font-sans overflow-hidden selection:bg-blue-600 selection:text-white">
      
      {/* Mobile Backdrop */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 transition-opacity cursor-pointer"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Corporate Sidebar - Deep Slate */}
      <aside className={`bg-slate-900 border-r border-slate-800 transition-all duration-300 ease-in-out ${sidebarWidth} ${sidebarTranslate} flex flex-col fixed inset-y-0 left-0 h-full z-50 shadow-2xl overflow-hidden`}>
        {/* Subtle mesh background for sidebar */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-blue-600/10 to-transparent pointer-events-none"></div>

        {/* Top-Left Logo: Enlarged & High Visibility */}
        <div className="h-24 flex items-center justify-between px-4 border-b border-slate-800/80 relative z-10 shrink-0">
          {sidebarOpen ? (
            <Link to="/admin" className="flex items-center cursor-pointer group flex-1 mr-2 min-w-0">
              <div className="bg-white rounded-xl p-2 shadow-md border border-slate-700/50 w-full flex items-center justify-center transition-all group-hover:scale-[1.02]">
                <img 
                  src="/images/siddhi-kabel-lockup.png" 
                  alt="Siddhi Kabel Corporation Private Limited" 
                  className="h-12 sm:h-13 w-auto max-w-full object-contain" 
                  onError={(e) => { e.currentTarget.src = '/images/siddhi-corp-full.png'; }}
                />
              </div>
            </Link>
          ) : (
            <Link to="/admin" className="cursor-pointer mx-auto group">
              <div className="bg-white rounded-xl p-1.5 shadow-md border border-slate-700/50 flex items-center justify-center transition-all group-hover:scale-105">
                <img 
                  src="/images/siddhi-kabel-logo.png" 
                  alt="S" 
                  className="w-11 h-11 object-contain" 
                  onError={(e) => { e.currentTarget.src = '/images/siddhi-kabel-lockup.png'; }}
                />
              </div>
            </Link>
          )}
          
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)} 
            className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
            title={sidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
          >
            {isMobile ? <X size={20} /> : (sidebarOpen ? <X size={20} /> : <Menu size={20} className="mx-auto" />)}
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto py-8 px-4 space-y-2 relative z-10 custom-scrollbar">
          <div className={`mb-6 px-3 text-xs font-semibold tracking-wider text-slate-500 uppercase ${!sidebarOpen && 'hidden'}`}>
            Main Menu
          </div>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (location.pathname.startsWith(item.path) && item.path !== '/admin');
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`relative flex items-center px-4 py-3 rounded-xl transition-all duration-200 group overflow-hidden cursor-pointer ${isActive ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20' : 'text-slate-400 hover:text-white hover:bg-slate-800/80'}`}
              >
                <Icon size={20} className={`relative z-10 transition-transform duration-200 ${isActive ? 'text-white' : 'group-hover:scale-110'}`} />
                {sidebarOpen && (
                  <>
                    <span className="ml-4 font-medium text-sm relative z-10 tracking-wide">{item.name}</span>
                    {isActive && <ChevronRight size={16} className="ml-auto opacity-70" />}
                  </>
                )}
              </Link>
            );
          })}
        </div>
        
        <div className="p-4 border-t border-slate-800/80 relative z-10 shrink-0">
          <div className={`flex items-center gap-3 mb-4 px-2 ${!sidebarOpen && 'hidden'}`}>
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-200 font-bold border border-slate-700 shadow-sm shrink-0">
              {currentAdmin.name?.charAt(0) || 'A'}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-semibold text-white truncate">{currentAdmin.name}</span>
              <span className="text-xs text-amber-400 font-medium truncate">{currentAdmin.role}</span>
            </div>
          </div>
          <button 
            onClick={handleLogout} 
            className={`flex items-center w-full px-4 py-2.5 rounded-xl transition-all duration-200 group hover:bg-red-500/15 hover:text-red-400 text-slate-400 cursor-pointer overflow-hidden ${isMobile || sidebarOpen ? 'justify-start' : 'justify-center'}`}
            title="Sign out of Admin Portal"
          >
            <LogOut size={20} className="group-hover:scale-110 transition-transform duration-200" />
            {sidebarOpen && <span className="ml-4 font-medium text-sm tracking-wide">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={`flex-1 min-w-0 flex flex-col h-screen transition-all duration-300 ease-in-out relative ${mainMargin}`}>
        
        {/* Warm & Bright Background */}
        <div className="fixed inset-0 bg-amber-50/30 z-0 overflow-hidden pointer-events-none">
           <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-orange-200/40 rounded-full blur-[120px] mix-blend-multiply pointer-events-none animate-pulse duration-[8000ms]" />
           <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-yellow-200/40 rounded-full blur-[100px] mix-blend-multiply pointer-events-none" />
           <div className="absolute top-1/3 left-1/3 w-[400px] h-[400px] bg-amber-300/20 rounded-full blur-[120px] mix-blend-multiply pointer-events-none" />
        </div>

        {/* Corporate Top Header */}
        <header className="h-14 sm:h-16 bg-white/80 backdrop-blur-xl border-b border-orange-100 flex items-center justify-between px-4 sm:px-6 z-20 sticky top-0 shadow-[0_4px_30px_rgba(249,115,22,0.03)] shrink-0 transition-all">
          <div className="flex items-center gap-3">
            {isMobile && (
              <button 
                onClick={() => setSidebarOpen(true)}
                className="p-1.5 -ml-1 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <Menu size={22} />
              </button>
            )}
            <div>
              <h1 className="text-base sm:text-xl font-bold text-slate-800 tracking-tight">
                {navItems.find(i => i.path === location.pathname)?.name || 'Admin Portal'}
              </h1>
              <p className="text-[11px] font-medium text-slate-500 hidden sm:block">Manage your enterprise resources and analytics</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Functional Search Bar */}
            <form onSubmit={handleGlobalSearch} className="hidden md:flex items-center bg-slate-100/90 rounded-xl px-3 py-1.5 border border-slate-200 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all w-60">
              <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <input 
                type="text" 
                value={globalSearch}
                onChange={e => setGlobalSearch(e.target.value)}
                placeholder="Search portal..." 
                className="bg-transparent border-none outline-none text-xs ml-2 w-full font-medium placeholder-slate-400 text-slate-700" 
              />
              {globalSearch && (
                <button type="button" onClick={() => setGlobalSearch('')} className="text-slate-400 hover:text-slate-600 text-xs cursor-pointer">
                  <X size={12} />
                </button>
              )}
            </form>

            <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

            {/* Notification Bell & Dropdown */}
            <div className="relative" ref={notifsRef}>
              <button
                onClick={() => { setNotifsOpen(!notifsOpen); fetchNotifications(); }}
                className="p-2 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-blue-50/80 transition-all relative cursor-pointer"
                title="Notifications"
                aria-label="Notifications"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse shadow-sm">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown Panel */}
              {notifsOpen && (
                <div className="absolute top-12 right-0 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                    <div className="flex items-center gap-2">
                      <Bell size={16} className="text-blue-600" />
                      <span className="text-sm font-bold text-slate-800">Notifications</span>
                      {unreadCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-xs text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 custom-scrollbar">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-slate-400">
                        <Bell size={28} className="mx-auto mb-2 opacity-40" />
                        <p className="text-xs font-medium">No new notifications</p>
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div
                          key={n._id}
                          onClick={() => handleNotificationClick(n)}
                          className={`p-3.5 hover:bg-slate-50 transition-colors cursor-pointer flex items-start gap-3 ${!n.read ? 'bg-blue-50/40' : ''}`}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                            n.type === 'rfq' 
                              ? 'bg-amber-100 text-amber-700' 
                              : n.type === 'customer' 
                              ? 'bg-purple-100 text-purple-700' 
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {n.type === 'rfq' ? <FileText size={16} /> : <UserCheck size={16} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <p className={`text-xs font-bold line-clamp-1 ${!n.read ? 'text-slate-900' : 'text-slate-700'}`}>
                                {n.title}
                              </p>
                              {!n.read && <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />}
                            </div>
                            <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{n.message}</p>
                            <span className="text-[10px] text-slate-400 mt-1 inline-block font-mono">
                              {new Date(n.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  
                  <div className="p-2 border-t border-slate-100 bg-slate-50 text-center">
                    <Link
                      to="/admin/rfqs"
                      onClick={() => setNotifsOpen(false)}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
                    >
                      View All RFQ Records →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Avatar & Dropdown */}
            <div className="flex items-center space-x-2.5 cursor-pointer group relative">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-sm group-hover:bg-blue-600 transition-colors">
                {currentAdmin.name?.charAt(0) || 'A'}
              </div>
              
              {/* Profile Dropdown Menu */}
              <div className="absolute top-11 right-0 mt-1 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 transform origin-top-right">
                <div className="p-3.5 border-b border-slate-100 bg-slate-50/50 rounded-t-2xl">
                  <p className="text-xs font-bold text-slate-800 line-clamp-1">{currentAdmin.name}</p>
                  <p className="text-[11px] font-medium text-slate-500 mt-0.5 line-clamp-1">{currentAdmin.email}</p>
                  <span className="inline-block px-2 py-0.5 mt-1.5 text-[10px] font-bold rounded-md bg-amber-100 text-amber-800">
                    {currentAdmin.role}
                  </span>
                </div>
                <div className="p-1.5">
                  <button 
                    onClick={handleOpenSettings}
                    className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-colors flex items-center gap-2.5 cursor-pointer"
                  >
                    <Settings size={15} /> Account Settings
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left flex items-center px-3 py-2 mt-0.5 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                  >
                    <LogOut size={15} className="mr-2.5" />
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-3 sm:p-4 lg:p-6 flex-1 overflow-x-hidden overflow-y-auto z-10 custom-scrollbar">
          <Outlet />
        </div>
      </main>

      {/* Account Settings Modal - Portal-Mounted */}
      {isSettingsOpen && createPortal(
        <div 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-[99999] p-4 overflow-hidden"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsSettingsOpen(false);
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[92vh] flex flex-col border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Settings size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">Account Settings</h3>
                  <p className="text-xs text-slate-500">Update Super Admin name, email, and password</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setIsSettingsOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-200/80 hover:bg-slate-300 text-slate-600 flex items-center justify-center cursor-pointer transition-colors"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveSettings} className="p-6 space-y-4 text-xs overflow-y-auto flex-1 custom-scrollbar">
              {settingsMsg && (
                <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl font-bold flex items-center gap-2 border border-emerald-200">
                  <Check size={16} /> {settingsMsg}
                </div>
              )}
              {settingsError && (
                <div className="p-3 bg-red-50 text-red-700 rounded-xl font-bold flex items-center gap-2 border border-red-200">
                  <AlertCircle size={16} /> {settingsError}
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Full Name</label>
                <input 
                  type="text" 
                  value={settingsForm.name}
                  onChange={e => setSettingsForm({ ...settingsForm, name: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Email Address</label>
                <input 
                  type="email" 
                  value={settingsForm.email}
                  onChange={e => setSettingsForm({ ...settingsForm, email: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                />
              </div>

              <div className="pt-2 border-t border-slate-100">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Change Password (leave blank to keep current)</p>
                <div className="space-y-3">
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">New Password</label>
                    <input 
                      type="password" 
                      value={settingsForm.password}
                      onChange={e => setSettingsForm({ ...settingsForm, password: e.target.value })}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">Confirm New Password</label>
                    <input 
                      type="password" 
                      value={settingsForm.confirmPassword}
                      onChange={e => setSettingsForm({ ...settingsForm, confirmPassword: e.target.value })}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-semibold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={settingsLoading}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-600/20 cursor-pointer disabled:opacity-50"
                >
                  {settingsLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
};
export default AdminLayout;
