import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Users, FileText, Settings, Menu, X, LogOut, Bell, Search, ChevronRight } from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

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

  const currentAdminStr = localStorage.getItem('siddhi_admin_user');
  const currentAdmin = currentAdminStr ? JSON.parse(currentAdminStr) : null;
  const isAdmin = currentAdmin?.role === 'Admin' || currentAdmin?.role === 'Super Admin';

  if (!currentAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  const handleLogout = () => {
    localStorage.removeItem('siddhi_admin_user');
    navigate('/admin/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Products', path: '/admin/products', icon: ShoppingBag },
    { name: 'RFQs (Quotations)', path: '/admin/rfqs', icon: FileText },
    ...(isAdmin ? [{ name: 'Users', path: '/admin/users', icon: Users }] : []),
  ];

  const sidebarWidth = sidebarOpen ? 'w-72' : 'w-20';
  const sidebarTranslate = isMobile ? (sidebarOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0';
  const mainMargin = isMobile ? 'ml-0' : (sidebarOpen ? 'ml-72' : 'ml-20');

  return (
    <div className="min-h-screen w-full bg-slate-50 flex font-sans overflow-hidden selection:bg-blue-600 selection:text-white">
      
      {/* Mobile Backdrop */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Corporate Sidebar - Deep Slate */}
      <aside className={`bg-slate-900 border-r border-slate-800 transition-all duration-300 ease-in-out ${sidebarWidth} ${sidebarTranslate} flex flex-col fixed inset-y-0 left-0 h-full z-50 shadow-2xl`}>
        {/* Subtle mesh background for sidebar */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-blue-600/10 to-transparent pointer-events-none"></div>

        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-800/80 relative z-10 shrink-0">
          {(sidebarOpen || isMobile) ? (
            <div className="flex items-center gap-3">
              <img 
                src="/images/siddhi-kabel-lockup.png" 
                alt="Siddhi Kabel" 
                className="h-8 object-contain bg-white rounded p-1" 
                onError={(e) => { e.currentTarget.src = '/images/siddhi-kabel-logo.png'; }}
              />
            </div>
          ) : (
            <img 
              src="/images/siddhi-kabel-logo.png" 
              alt="S" 
              className="w-10 h-10 object-contain bg-white rounded p-1 mx-auto" 
              onError={(e) => { e.currentTarget.src = '/images/siddhi-kabel-lockup.png'; }}
            />
          )}
          
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)} 
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            {isMobile ? <X size={20} /> : (sidebarOpen ? <X size={20} /> : <Menu size={20} className="mx-auto" />)}
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto py-8 px-4 space-y-2 relative z-10 custom-scrollbar">
          <div className={`mb-6 px-3 text-xs font-semibold tracking-wider text-slate-500 uppercase ${( !sidebarOpen && !isMobile ) && 'hidden'}`}>
            Main Menu
          </div>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (location.pathname.startsWith(item.path) && item.path !== '/admin');
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`relative flex items-center px-4 py-3 rounded-xl transition-all duration-200 group overflow-hidden ${isActive ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20' : 'text-slate-400 hover:text-white hover:bg-slate-800/80'}`}
              >
                <Icon size={20} className={`relative z-10 transition-transform duration-200 ${isActive ? 'text-white' : 'group-hover:scale-110'}`} />
                {(sidebarOpen || isMobile) && (
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
          <div className={`flex items-center gap-3 mb-4 px-2 ${( !sidebarOpen && !isMobile ) && 'hidden'}`}>
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 font-bold border border-slate-700">
              {currentAdmin.name.charAt(0)}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-white line-clamp-1">{currentAdmin.name}</span>
              <span className="text-xs text-slate-400">{currentAdmin.role}</span>
            </div>
          </div>
          <button onClick={handleLogout} className={`flex items-center w-full px-4 py-2.5 rounded-xl transition-all duration-200 group hover:bg-red-500/10 hover:text-red-400 text-slate-400 ${isMobile || sidebarOpen ? 'justify-start' : 'justify-center'}`}>
            <LogOut size={20} className="group-hover:scale-110 transition-transform duration-200" />
            {(sidebarOpen || isMobile) && <span className="ml-4 font-medium text-sm tracking-wide">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={`flex-1 flex flex-col h-screen transition-all duration-300 ease-in-out relative w-full ${mainMargin}`}>
        
        {/* Warm & Bright Background */}
        <div className="fixed inset-0 bg-amber-50/30 z-0 overflow-hidden pointer-events-none">
           <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-orange-200/40 rounded-full blur-[120px] mix-blend-multiply pointer-events-none animate-pulse duration-[8000ms]" />
           <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-yellow-200/40 rounded-full blur-[100px] mix-blend-multiply pointer-events-none" />
           <div className="absolute top-1/3 left-1/3 w-[400px] h-[400px] bg-amber-300/20 rounded-full blur-[120px] mix-blend-multiply pointer-events-none" />
        </div>

        {/* Corporate Top Header (Warm variation) */}
        <header className="h-20 bg-white/70 backdrop-blur-xl border-b border-orange-100 flex items-center justify-between px-6 lg:px-10 z-20 sticky top-0 shadow-[0_4px_30px_rgba(249,115,22,0.03)] shrink-0 transition-all">
          <div className="flex items-center gap-4">
            {isMobile && (
              <button 
                onClick={() => setSidebarOpen(true)}
                className="p-2 -ml-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <Menu size={24} />
              </button>
            )}
            <div>
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
                {navItems.find(i => i.path === location.pathname)?.name || 'Admin Portal'}
              </h1>
              <p className="text-xs font-medium text-slate-500 hidden sm:block mt-0.5">Manage your enterprise resources and analytics</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 sm:space-x-6">
            <div className="hidden md:flex items-center bg-slate-100/80 rounded-lg px-4 py-2 border border-slate-200 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all w-72">
              <Search className="w-4 h-4 text-slate-400" />
              <input type="text" placeholder="Search..." className="bg-transparent border-none outline-none text-sm ml-3 w-full font-medium placeholder-slate-400 text-slate-700" />
            </div>

            <button className="relative p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all hidden sm:block">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-blue-600 rounded-full ring-2 ring-white"></span>
            </button>

            <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>

            <div className="flex items-center space-x-3 cursor-pointer group relative">
              <div className="w-10 h-10 rounded-lg bg-slate-800 text-white flex items-center justify-center font-bold text-lg shadow-sm group-hover:bg-blue-700 transition-colors">
                {currentAdmin.name.charAt(0)}
              </div>
              
              {/* Profile Dropdown */}
              <div className="absolute top-12 right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 transform origin-top-right">
                <div className="p-4 border-b border-slate-100">
                  <p className="text-sm font-bold text-slate-800">{currentAdmin.name}</p>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">{currentAdmin.email}</p>
                </div>
                <div className="p-2">
                  <button className="w-full text-left px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-lg transition-colors flex items-center gap-2">
                    <Settings size={16} /> Account Settings
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left flex items-center px-3 py-2 mt-1 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <LogOut size={16} className="mr-2" />
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6 lg:p-10 flex-1 overflow-x-hidden overflow-y-auto z-10 custom-scrollbar">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
