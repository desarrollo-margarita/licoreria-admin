import React, { useState } from 'react';
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
import { AuthProvider } from './context/AuthContext';

export default function App() {
  const [currentView, setCurrentView] = useState('landing'); // 'landing' or 'admin'

  return (
    <AuthProvider>
      {currentView === 'admin' ? (
        <AdminDashboard onBackToLanding={() => setCurrentView('landing')} />
      ) : (
        <div className="w-full min-h-screen text-slate-100 selection:bg-pink-500 selection:text-white font-sans flex flex-col items-center">
          <Navbar onOpenAdmin={() => setCurrentView('admin')} />
          <main className="w-full flex-1 flex flex-col items-center gap-14 sm:gap-18 lg:gap-24">
            <HeroSection />
            <IndustriesSection />
            <FeatureGrid />
            <LivePosSimulator />
            <InteractivePricing />
            <Testimonials />
            <FaqSection />
          </main>
          <Footer onOpenAdmin={() => setCurrentView('admin')} />
        </div>
      )}
    </AuthProvider>
  );
}
