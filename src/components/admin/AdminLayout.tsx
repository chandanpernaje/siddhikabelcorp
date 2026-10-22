import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Outlet, Link, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, ShoppingBag, Users, FileText, Settings, Menu, X, LogOut, 
  Search, ChevronRight, ChevronDown, Bell, Check, Clock, UserCheck, ShieldCheck, KeyRound, AlertCircle, Building, Shield
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

  // User counts and dropdown state for sidebar sub-menu (closed by default, click only)
  const [userCounts, setUserCounts] = useState({ customers: 9, internal: 4 });
  const [customersMenuOpen, setCustomersMenuOpen] = useState(false);
  const usersMenuRef = useRef<HTMLDivElement>(null);

  // Close Customers & Users dropdown on click outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (usersMenuRef.current && !usersMenuRef.current.contains(e.target as Node)) {
        setCustomersMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const fetchUserCounts = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/admin/users`, {
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      if (res.ok) {
        const usersList = await res.json();
        if (Array.isArray(usersList)) {
          const isCustomerRole = (role?: string) => {
            const r = (role || '').toLowerCase().trim();
            return r === 'customer' || r === 'website customer' || r === 'corporate customer' || r === 'client';
          };
          const custCount = usersList.filter((u: any) => isCustomerRole(u.role)).length;
          const intCount = usersList.filter((u: any) => {
            if (isCustomerRole(u.role)) return false;
            const em = (u.email || '').toLowerCase().trim();
            if (em === 'admin@siddhikabel.com' || em === 'sales@siddhikabel.com' || em === 'manager@siddhikabel.com') {
              return false;
            }
            return true;
          }).length;
          setUserCounts({ customers: custCount, internal: intCount });
        }
      }
    } catch (err) {
      // quiet fail
    }
  };

  useEffect(() => {
    fetchUserCounts();
    const handleUsersUpdated = () => fetchUserCounts();
    window.addEventListener('users_updated', handleUsersUpdated);
    return () => window.removeEventListener('users_updated', handleUsersUpdated);
  }, []);

  // Notifications State
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifsOpen, setNotifsOpen] = useState(false);
  const notifsRef = useRef<HTMLDivElement>(null);

  // Profile Dropdown State (Click to open on Mobile & Desktop)
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

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
    setProfileOpen(false);
    setNotifsOpen(false);
  }, [location.pathname, isMobile]);

  // Fetch Notifications (Show pending actions only)
  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/notifications?pendingOnly=true`);
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

  // Close notifications & profile dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifsRef.current && !notifsRef.current.contains(e.target as Node)) {
        setNotifsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
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
      // Clear/remove notification after it is opened (showing pending actions only)
      setNotifications(prev => prev.filter(n => n._id !== notif._id));
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
      setNotifications([]);
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
    { 
      name: 'Dashboard', 
      path: '/admin', 
      icon: LayoutDashboard,
      activeGradient: 'bg-gradient-to-r from-red-600 via-red-600 to-rose-600 text-white shadow-md shadow-red-500/25 font-bold',
      inactiveHover: 'text-slate-600 hover:text-red-700 hover:bg-red-50/80 font-semibold',
      iconInactive: 'text-red-500 group-hover:scale-110',
      badge: 'Red'
    },
    ...(!isSalesExecutive ? [{ 
      name: 'Products', 
      path: '/admin/products', 
      icon: ShoppingBag,
      activeGradient: 'bg-gradient-to-r from-sky-500 via-sky-600 to-blue-600 text-white shadow-md shadow-sky-500/25 font-bold',
      inactiveHover: 'text-slate-600 hover:text-sky-700 hover:bg-sky-50/80 font-semibold',
      iconInactive: 'text-sky-500 group-hover:scale-110',
      badge: 'Sky Blue'
    }] : []),
    { 
      name: 'RFQs (Quotations)', 
      path: '/admin/rfqs', 
      icon: FileText,
      activeGradient: 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white shadow-md shadow-orange-500/25 font-bold',
      inactiveHover: 'text-slate-600 hover:text-orange-700 hover:bg-orange-50/80 font-semibold',
      iconInactive: 'text-orange-500 group-hover:scale-110',
      badge: 'Orange'
    },
    ...(isAdmin || isSalesManager ? [{ 
      name: 'Customers & Users', 
      path: '/admin/users', 
      icon: Users,
      activeGradient: 'bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 text-white shadow-md shadow-slate-500/25 font-bold',
      inactiveHover: 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-semibold',
      iconInactive: 'text-slate-500 group-hover:scale-110',
      badge: 'Slate Grey'
    }] : []),
  ];

  const sidebarWidth = isMobile ? 'w-72 max-w-[85vw]' : (sidebarOpen ? 'w-72' : 'w-20');
  const sidebarTranslate = isMobile ? (sidebarOpen ? 'translate-x-0' : '-translate-x-full pointer-events-none invisible') : 'translate-x-0';
  const mainMargin = isMobile ? 'ml-0' : (sidebarOpen ? 'ml-72' : 'ml-20');

  return (
    <div className="min-h-screen w-full bg-slate-50/90 flex font-sans overflow-hidden selection:bg-red-600 selection:text-white">
      
      {/* Mobile Backdrop */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 transition-opacity cursor-pointer"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Corporate Sidebar - Colorful Light Aesthetic */}
      <aside className={`bg-white border-r border-slate-200/80 transition-all duration-300 ease-in-out ${sidebarWidth} ${sidebarTranslate} flex flex-col fixed inset-y-0 left-0 h-full z-50 shadow-sm overflow-hidden`}>
        {/* Harmonious Light Tint Auras in Sidebar: Sky Blue, Red, Orange */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-sky-100/40 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute top-44 left-0 w-36 h-36 bg-red-100/35 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute bottom-8 right-0 w-36 h-36 bg-amber-100/40 rounded-full blur-2xl pointer-events-none"></div>

        {/* Top-Left Logo: Enlarged & High Visibility */}
        <div className="h-24 flex items-center justify-between px-4 border-b border-slate-100 relative z-10 shrink-0 bg-white">
          {sidebarOpen ? (
            <Link to="/admin" className="flex items-center cursor-pointer group flex-1 mr-2 min-w-0">
              <div className="bg-slate-50/80 hover:bg-slate-50 rounded-xl p-2.5 border border-slate-200/80 w-full flex items-center justify-center transition-all group-hover:border-red-200 group-hover:shadow-2xs">
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
              <div className="bg-slate-50/80 hover:bg-slate-50 rounded-xl p-2 border border-slate-200/80 flex items-center justify-center transition-all group-hover:scale-105 group-hover:border-red-200">
                <img 
                  src="/images/siddhi-kabel-logo.png" 
                  alt="S" 
                  className="w-10 h-10 object-contain" 
                  onError={(e) => { e.currentTarget.src = '/images/siddhi-kabel-lockup.png'; }}
                />
              </div>
            </Link>
          )}
          
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)} 
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer shrink-0"
            title={sidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
          >
            {isMobile ? <X size={20} /> : (sidebarOpen ? <X size={20} /> : <Menu size={20} className="mx-auto" />)}
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 px-3.5 space-y-1.5 relative z-10 custom-scrollbar">
          <div className={`mb-3 px-3 text-[11px] font-bold tracking-wider text-slate-400 uppercase flex items-center justify-between ${!sidebarOpen && 'hidden'}`}>
            <span>Main Menu</span>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            </div>
          </div>
          {navItems.map((item) => {
            const isUsers = item.path === '/admin/users';
            const isActive = location.pathname === item.path || (location.pathname.startsWith(item.path) && item.path !== '/admin');
            const Icon = item.icon;
            const queryParams = new URLSearchParams(location.search);
            const currentTab = queryParams.get('tab') || 'customers';
            const isUsersRoute = location.pathname.startsWith('/admin/users');

            if (isUsers) {
              const isSubmenuVisible = customersMenuOpen;
              return (
                <div 
                  key={item.name}
                  ref={usersMenuRef}
                  className="relative group/userMenu"
                >
                  {/* Customers & Users Button - Navigates directly to /admin/users and toggles dropdown */}
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isUsersRoute) {
                        navigate('/admin/users');
                        setCustomersMenuOpen(true);
                      } else {
                        setCustomersMenuOpen(prev => !prev);
                      }
                    }}
                    className={`relative flex items-center px-3.5 py-3 rounded-xl transition-all duration-200 cursor-pointer select-none group ${
                      isActive 
                        ? item.activeGradient
                        : item.inactiveHover
                    }`}
                  >
                    <Icon size={20} className={`relative z-10 transition-transform duration-200 ${isActive ? 'text-white' : item.iconInactive}`} />
                    {sidebarOpen && (
                      <>
                        <span className="ml-3.5 font-semibold text-sm relative z-10 tracking-wide flex-1 text-left truncate">{item.name}</span>
                        <ChevronDown 
                          size={16} 
                          className={`ml-auto relative z-10 transition-transform duration-200 ${
                            isSubmenuVisible ? 'rotate-180' : 'rotate-0'
                          } ${isActive ? 'text-white/90' : 'text-slate-400 group-hover:text-slate-600'}`} 
                        />
                      </>
                    )}
                  </div>

                  {/* Submenu Dropdown in Sidebar (When sidebarOpen is true & open) */}
                  {sidebarOpen && isSubmenuVisible && (
                    <div className="mt-1.5 ml-3 pl-3 border-l-2 border-slate-200/90 space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
                      {/* Sub-item 1: Registered Customers (Website Customers) */}
                      <Link
                        to="/admin/users?tab=customers"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isMobile) setSidebarOpen(false);
                        }}
                        className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm transition-all duration-150 group/sub border ${
                          isUsersRoute && currentTab !== 'internal'
                            ? 'bg-sky-50 text-sky-800 font-bold border-sky-300/80 shadow-2xs'
                            : 'border-transparent text-slate-700 hover:text-sky-700 hover:bg-sky-50/60 font-semibold'
                        }`}
                        title="Registered Customers"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 mr-1.5">
                          <Building size={17} className={`shrink-0 ${
                            isUsersRoute && currentTab !== 'internal' ? 'text-sky-600' : 'text-slate-500 group-hover/sub:text-sky-600'
                          }`} />
                          <span className="truncate">Registered Customers</span>
                        </div>
                        <span className={`text-xs font-extrabold px-2 py-0.5 rounded-full shrink-0 border ${
                          isUsersRoute && currentTab !== 'internal'
                            ? 'bg-sky-200/80 text-sky-900 border-sky-300'
                            : 'bg-slate-100 text-slate-600 border-slate-200 group-hover/sub:bg-sky-100 group-hover/sub:text-sky-700'
                        }`}>
                          {userCounts.customers}
                        </span>
                      </Link>

                      {/* Sub-item 2: Internal Staff & Sales Team */}
                      <Link
                        to="/admin/users?tab=internal"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isMobile) setSidebarOpen(false);
                        }}
                        className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm transition-all duration-150 group/sub border ${
                          isUsersRoute && currentTab === 'internal'
                            ? 'bg-red-50 text-red-800 font-bold border-red-300/80 shadow-2xs'
                            : 'border-transparent text-slate-700 hover:text-red-700 hover:bg-red-50/60 font-semibold'
                        }`}
                        title="Internal Staff & Sales"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 mr-1.5">
                          <Shield size={17} className={`shrink-0 ${
                            isUsersRoute && currentTab === 'internal' ? 'text-red-600' : 'text-slate-500 group-hover/sub:text-red-600'
                          }`} />
                          <span className="truncate">Internal Staff & Sales</span>
                        </div>
                        <span className={`text-xs font-extrabold px-2 py-0.5 rounded-full shrink-0 border ${
                          isUsersRoute && currentTab === 'internal'
                            ? 'bg-red-200/80 text-red-900 border-red-300'
                            : 'bg-slate-100 text-slate-600 border-slate-200 group-hover/sub:bg-red-100 group-hover/sub:text-red-700'
                        }`}>
                          {userCounts.internal}
                        </span>
                      </Link>
                    </div>
                  )}

                  {/* Flyout Submenu for Collapsed Sidebar (Only on click when collapsed) */}
                  {!sidebarOpen && isSubmenuVisible && (
                    <div className="fixed left-20 ml-2 py-2 px-2 bg-white border border-slate-200 rounded-xl shadow-xl w-64 z-[100] animate-in fade-in duration-150">
                      <div className="px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1.5">
                        Customers & Users
                      </div>
                      <Link
                        to="/admin/users?tab=customers"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCustomersMenuOpen(false);
                        }}
                        className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                          isUsersRoute && currentTab !== 'internal'
                            ? 'bg-sky-50 text-sky-800 font-bold border border-sky-200'
                            : 'text-slate-700 hover:bg-sky-50 hover:text-sky-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Building size={17} className="text-sky-600" />
                          <span>Registered Customers</span>
                        </div>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">
                          {userCounts.customers}
                        </span>
                      </Link>
                      <Link
                        to="/admin/users?tab=internal"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCustomersMenuOpen(false);
                        }}
                        className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-all mt-1 ${
                          isUsersRoute && currentTab === 'internal'
                            ? 'bg-red-50 text-red-800 font-bold border border-red-200'
                            : 'text-slate-700 hover:bg-red-50 hover:text-red-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Shield size={17} className="text-red-600" />
                          <span>Internal Staff & Sales</span>
                        </div>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-800">
                          {userCounts.internal}
                        </span>
                      </Link>
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={item.name}
                to={item.path}
                className={`relative flex items-center px-3.5 py-3 rounded-xl transition-all duration-200 group overflow-hidden cursor-pointer ${
                  isActive 
                    ? item.activeGradient
                    : item.inactiveHover
                }`}
              >
                <Icon size={20} className={`relative z-10 transition-transform duration-200 ${isActive ? 'text-white' : item.iconInactive}`} />
                {sidebarOpen && (
                  <>
                    <span className="ml-3.5 font-semibold text-sm relative z-10 tracking-wide">{item.name}</span>
                    {isActive && <ChevronRight size={16} className="ml-auto text-white/90" />}
                  </>
                )}
              </Link>
            );
          })}
        </div>
        
        <div className="p-3.5 border-t border-slate-200/80 bg-slate-50/70 relative z-10 shrink-0">
          <div className={`flex items-center gap-3 mb-3 px-2 ${!sidebarOpen && 'hidden'}`}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-100 via-orange-100 to-sky-100 border border-orange-200 text-red-700 flex items-center justify-center font-bold text-sm shadow-2xs shrink-0">
              {currentAdmin.name?.charAt(0) || 'A'}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-bold text-slate-800 truncate">{currentAdmin.name}</span>
              <span className="text-[11px] font-semibold text-orange-700 bg-orange-50 border border-orange-200 px-1.5 py-0.2 rounded w-fit mt-0.5 truncate">
                {currentAdmin.role}
              </span>
            </div>
          </div>
          <button 
            onClick={handleLogout} 
            className={`flex items-center w-full px-3.5 py-2.5 rounded-xl transition-all duration-200 group hover:bg-red-50 hover:text-red-700 text-slate-600 cursor-pointer overflow-hidden ${isMobile || sidebarOpen ? 'justify-start' : 'justify-center'}`}
            title="Sign out of Admin Portal"
          >
            <LogOut size={18} className="group-hover:scale-110 transition-transform duration-200 text-slate-500 group-hover:text-red-600" />
            {sidebarOpen && <span className="ml-3 font-semibold text-xs tracking-wide">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={`flex-1 min-w-0 flex flex-col h-screen transition-all duration-300 ease-in-out relative ${mainMargin}`}>
        
        {/* Colorful Light Ambient Brand Background: Sky Blue, Orange, Light Red, Light Grey */}
        <div className="fixed inset-0 bg-slate-50/90 z-0 overflow-hidden pointer-events-none">
           <div className="absolute top-0 right-10 w-[600px] h-[600px] bg-sky-200/25 rounded-full blur-[140px] mix-blend-multiply pointer-events-none" />
           <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-amber-200/20 rounded-full blur-[130px] mix-blend-multiply pointer-events-none" />
           <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-red-200/20 rounded-full blur-[150px] mix-blend-multiply pointer-events-none" />
           <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-slate-200/40 rounded-full blur-[120px] mix-blend-multiply pointer-events-none" />
        </div>

        {/* Corporate Top Header with Signature Multi-Color Brand Accent */}
        <header className="h-14 sm:h-16 bg-white/90 backdrop-blur-xl border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 z-20 sticky top-0 shadow-sm shrink-0 transition-all relative">
          {/* Multi-color Signature Brand Accent Line: Light Sky Blue -> Light Orange -> Light Red -> Light Grey */}
          <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-sky-400 via-amber-400 via-red-500 to-slate-400 pointer-events-none" />

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
              <p className="text-[11px] font-medium text-slate-500 hidden sm:block">
                Welcome, <span className="font-semibold text-slate-700">{currentAdmin?.name || 'User'}</span> <span className="text-slate-400">({currentAdmin?.role || 'Staff'})</span>
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Functional Search Bar */}
            <form onSubmit={handleGlobalSearch} className="hidden md:flex items-center bg-slate-100/90 rounded-xl px-3 py-1.5 border border-slate-200 focus-within:ring-2 focus-within:ring-red-500/20 focus-within:border-red-500 transition-all w-60">
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
                      <Bell size={16} className="text-red-600" />
                      <span className="text-sm font-bold text-slate-800">Notifications</span>
                      {unreadCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-xs text-red-600 hover:text-red-800 font-semibold cursor-pointer"
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
                          className={`p-3.5 hover:bg-slate-50 transition-colors cursor-pointer flex items-start gap-3 ${!n.read ? 'bg-red-50/40' : ''}`}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                            n.type === 'rfq' 
                              ? 'bg-red-100 text-red-700' 
                              : n.type === 'customer' 
                              ? 'bg-slate-100 text-slate-700' 
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {n.type === 'rfq' ? <FileText size={16} /> : <UserCheck size={16} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <p className={`text-xs font-bold line-clamp-1 ${!n.read ? 'text-slate-900' : 'text-slate-700'}`}>
                                {n.title}
                              </p>
                              {!n.read && <span className="w-2 h-2 rounded-full bg-red-600 shrink-0" />}
                            </div>
                            <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{n.message}</p>
                            <span className="text-[10px] text-slate-400 mt-1 inline-flex items-center gap-1 font-mono">
                              <Clock size={11} className="text-slate-400" />
                              {new Date(n.createdAt).toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' })} • {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                      className="text-xs font-bold text-red-600 hover:text-red-800 cursor-pointer"
                    >
                      View All RFQ Records →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Avatar & Dropdown */}
            <div className="relative" ref={profileRef}>
              <button 
                type="button"
                onClick={() => setProfileOpen(prev => !prev)}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-red-50 text-red-700 border border-red-200 flex items-center justify-center font-bold text-sm shadow-2xs hover:bg-red-600 hover:text-white hover:border-red-600 active:scale-95 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-400/40 select-none"
                title="Super Admin Profile Menu"
                aria-label="Super Admin Profile Menu"
              >
                {currentAdmin.name?.charAt(0) || 'A'}
              </button>
              
              {/* Profile Dropdown Menu - Mobile and Desktop Optimized */}
              {profileOpen && (
                <div className="absolute top-11 sm:top-12 right-0 mt-1 w-64 max-w-[calc(100vw-1.5rem)] bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 animate-in fade-in zoom-in-95 duration-150 overflow-hidden">
                  <div className="p-3.5 border-b border-slate-100 bg-slate-50/70">
                    <p className="text-xs font-bold text-slate-800 line-clamp-1">{currentAdmin.name}</p>
                    <p className="text-[11px] font-medium text-slate-500 mt-0.5 line-clamp-1">{currentAdmin.email}</p>
                    <span className="inline-block px-2 py-0.5 mt-1.5 text-[10px] font-bold rounded-md bg-red-50 text-red-800 border border-red-200">
                      {currentAdmin.role}
                    </span>
                  </div>
                  <div className="p-1.5 space-y-1">
                    <button 
                      type="button"
                      onClick={() => {
                        setProfileOpen(false);
                        handleOpenSettings();
                      }}
                      className="w-full text-left px-3 py-2.5 text-xs font-semibold text-slate-700 hover:bg-red-50 hover:text-red-700 active:bg-red-100 rounded-xl transition-colors flex items-center gap-2.5 cursor-pointer"
                    >
                      <Settings size={16} className="text-slate-500 shrink-0" />
                      <span>Account Settings</span>
                    </button>
                    <button 
                      type="button"
                      onClick={() => {
                        setProfileOpen(false);
                        handleLogout();
                      }}
                      className="w-full text-left flex items-center px-3 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 active:bg-red-100 rounded-xl transition-colors cursor-pointer"
                    >
                      <LogOut size={16} className="mr-2.5 text-red-600 shrink-0" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-3 sm:p-4 lg:p-6 flex-1 overflow-x-hidden overflow-y-auto z-10 custom-scrollbar">
          <Outlet />
        </div>
      </main>

      {/* Account Settings Modal - Portal-Mounted (Mobile & Desktop Responsive) */}
      {isSettingsOpen && createPortal(
        <div 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-[99999] p-3 sm:p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsSettingsOpen(false);
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md my-auto max-h-[90vh] flex flex-col border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 bg-slate-50 shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-red-100 text-red-700 flex items-center justify-center shrink-0">
                  <Settings size={18} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-slate-800 truncate">Account Settings</h3>
                  <p className="text-xs text-slate-500 truncate">Update Super Admin credentials</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setIsSettingsOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-200/80 hover:bg-slate-300 text-slate-600 flex items-center justify-center cursor-pointer transition-colors shrink-0 ml-2"
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
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-red-500 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Email Address</label>
                <input 
                  type="email" 
                  value={settingsForm.email}
                  onChange={e => setSettingsForm({ ...settingsForm, email: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-red-500 focus:outline-none transition-all"
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
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-red-500 focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">Confirm New Password</label>
                    <input 
                      type="password" 
                      value={settingsForm.confirmPassword}
                      onChange={e => setSettingsForm({ ...settingsForm, confirmPassword: e.target.value })}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-red-500 focus:outline-none transition-all"
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
                  className="px-5 py-2 bg-gradient-to-r from-red-600 via-red-700 to-rose-700 hover:opacity-95 text-white font-bold rounded-xl shadow-md shadow-red-600/25 cursor-pointer disabled:opacity-50 transition-all"
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
