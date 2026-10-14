import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet
} from "react-router-dom";
import { ToastProvider } from "./context/ToastContext";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { TopBar } from "./components/layout/TopBar";
import { Header } from "./components/layout/Header";
import { Footer } from "./components/layout/Footer";
import { CartDrawer } from "./components/ui/CartDrawer";
import { AuthModal } from "./components/ui/AuthModal";
import { AccountModal } from "./components/ui/AccountModal";
import { BackToTopButton } from "./components/ui/BackToTopButton";
import { FloatingRFQButton } from "./components/ui/FloatingRFQButton";

import { ScrollToTop } from "./components/ScrollToTop";
import { Home } from "./pages/Home";
import { OlflexCables } from "./pages/OlflexCables";
import { ProductDetail } from "./pages/ProductDetail";
import { EatonProducts } from "./pages/EatonProducts";
import { QuotationPage } from "./pages/QuotationPage";
import { AboutLapp } from "./pages/AboutLapp";
import { AboutEaton } from "./pages/AboutEaton";
import { AboutMennekes } from "./pages/AboutMennekes";
import { AboutPartex } from "./pages/AboutPartex";
import { Industries } from "./pages/Industries";

// Admin Imports
import { AdminLayout } from "./components/admin/AdminLayout";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AdminProducts } from "./pages/admin/AdminProducts";
import { AdminRFQs } from "./pages/admin/AdminRFQs";
import { AdminUsers } from "./pages/admin/AdminUsers";
import { AdminLogin } from "./pages/admin/AdminLogin";

const MainLayout = () => {
  return (
    <div className="min-h-screen w-full flex flex-col bg-slate-100/80 text-slate-900 selection:bg-amber-500 selection:text-white relative overflow-x-hidden">
      {/* Subtle ambient lighting mesh to remove flat white look */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden opacity-40">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-amber-400/20 blur-3xl" />
        <div className="absolute top-1/3 -left-40 w-96 h-96 rounded-full bg-blue-500/15 blur-3xl" />
        <div className="absolute top-2/3 -right-40 w-96 h-96 rounded-full bg-emerald-500/15 blur-3xl" />
        <div className="absolute -bottom-40 left-1/4 w-96 h-96 rounded-full bg-indigo-500/15 blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen w-full">
        <TopBar />
        <Header />

        <div className="flex-1 w-full">
          <Outlet />
        </div>

        <Footer />
      </div>

      {/* Global Slide-overs & Modals */}
      <CartDrawer />
      <AuthModal />
      <AccountModal />
      <BackToTopButton />
      <FloatingRFQButton />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <Router basename={import.meta.env.BASE_URL}>
            <ScrollToTop />
            <Routes>
              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="rfqs" element={<AdminRFQs />} />
                <Route path="users" element={<AdminUsers />} />
                {/* Additional Admin Routes will go here */}
              </Route>

              {/* Public Website Routes */}
              <Route path="/" element={<MainLayout />}>
                <Route index element={<Home />} />
                <Route path="olflex-cables" element={<OlflexCables />} />
                <Route path="eaton-products" element={<EatonProducts />} />
                <Route path="product-detail" element={<ProductDetail />} />
                <Route path="product/:id" element={<ProductDetail />} />
                <Route path="quotation" element={<QuotationPage />} />
                <Route path="about-lapp" element={<AboutLapp />} />
                <Route path="about-eaton" element={<AboutEaton />} />
                <Route path="about-mennekes" element={<AboutMennekes />} />
                <Route path="about-partex" element={<AboutPartex />} />
                <Route path="industries" element={<Industries />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </Router>
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  );
};

export default App;