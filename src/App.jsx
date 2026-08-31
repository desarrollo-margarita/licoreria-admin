import React, { useState, useEffect } from 'react';
import Navbar from './components/landing/Navbar';
import HeroSection from './components/landing/HeroSection';
import IndustriesSection from './components/landing/IndustriesSection';
import FeatureGrid from './components/landing/FeatureGrid';
import LivePosSimulator from './components/landing/LivePosSimulator';
import InteractivePricing from './components/landing/InteractivePricing';
import Testimonials from './components/landing/Testimonials';
import FaqSection from './components/landing/FaqSection';
import Footer from './components/landing/Footer';
import AdminDashboard from './components/admin/AdminDashboard';
import { AuthProvider, useAuth } from './context/AuthContext';

function MainApp() {
  const { isAuthenticated } = useAuth();
  
  const [currentView, setCurrentView] = useState(() => {
    try {
      const isAuth = sessionStorage.getItem('vx_superadmin_auth') === 'true';
      const savedView = sessionStorage.getItem('vx_current_view');
      const hash = window.location.hash;

      // Si el usuario está autenticado y no ha salido explícitamente a la landing, mantener dashboard
      if (isAuth && savedView !== 'landing') {
        return 'admin';
      }
      if (savedView === 'admin' || hash === '#admin') {
        return 'admin';
      }
      return 'landing';
    } catch {
      return 'landing';
    }
  });

  const handleOpenAdmin = () => {
    setCurrentView('admin');
    try {
      sessionStorage.setItem('vx_current_view', 'admin');
    } catch (e) {
      console.warn(e);
    }
  };

  const handleBackToLanding = () => {
    setCurrentView('landing');
    try {
      sessionStorage.setItem('vx_current_view', 'landing');
      if (window.location.hash === '#admin') {
        window.history.replaceState(null, '', window.location.pathname);
      }
    } catch (e) {
      console.warn(e);
    }
  };

  // Sincronizar si cambia el estado de autenticación
  useEffect(() => {
    if (isAuthenticated && currentView === 'landing') {
      const savedView = sessionStorage.getItem('vx_current_view');
      if (savedView === 'admin') {
        setCurrentView('admin');
      }
    }
  }, [isAuthenticated, currentView]);

  return (
    <>
      {currentView === 'admin' ? (
        <AdminDashboard onBackToLanding={handleBackToLanding} />
      ) : (
        <div className="w-full min-h-screen text-slate-100 selection:bg-pink-500 selection:text-white font-sans flex flex-col items-center">
          <Navbar onOpenAdmin={handleOpenAdmin} />
          <main className="w-full flex-1 flex flex-col items-center gap-14 sm:gap-18 lg:gap-24">
            <HeroSection />
            <IndustriesSection />
            <FeatureGrid />
            <LivePosSimulator />
            <InteractivePricing />
            <Testimonials />
            <FaqSection />
          </main>
          <Footer onOpenAdmin={handleOpenAdmin} />
        </div>
      )}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
