import React from 'react';
import { 
  ArrowRight, Play, Sparkles, Star
} from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="w-full relative pt-6 md:pt-8 pb-6 md:pb-8 px-6 sm:px-10 lg:px-16 xl:px-24 overflow-hidden flex flex-col items-center justify-center text-center">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] md:w-[1300px] h-[500px] bg-purple-600/20 blur-[170px] rounded-full pointer-events-none" />
      <div className="absolute top-36 left-5 w-[350px] md:w-[600px] h-[350px] bg-orange-500/12 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute top-36 right-5 w-[350px] md:w-[600px] h-[350px] bg-pink-500/15 blur-[140px] rounded-full pointer-events-none" />

      <div className="w-full max-w-[1500px] mx-auto relative z-10 flex flex-col items-center justify-center text-center">
        
        {/* Centered Top Tag Pill with clean margin */}
        <div className="mt-2 mb-6 flex justify-center w-full">
          <div className="inline-flex items-center gap-2.5 px-6 py-2.5 rounded-full bg-slate-900/90 border border-purple-500/30 text-xs font-semibold shadow-2xl shadow-purple-500/10 backdrop-blur-md mx-auto">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-pink-500"></span>
            </span>
            <span className="text-slate-300">Software Administrativo y POS</span>
            <span className="bg-gradient-to-r from-orange-300 via-pink-400 to-rose-400 bg-clip-text text-transparent font-extrabold uppercase tracking-wide">#1 en Venezuela</span>
            <span className="text-slate-400 text-xs">🇻🇪</span>
          </div>
        </div>

        {/* Hero Headline with balanced spacing */}
        <div className="max-w-4xl mx-auto flex flex-col items-center justify-center text-center space-y-5">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.12] text-center">
            Gestiona tus Ventas, Inventario y Finanzas en{' '}
            <span className="bg-gradient-to-r from-orange-400 via-pink-500 to-amber-400 bg-clip-text text-transparent">USD</span> y{' '}
            <span className="bg-gradient-to-r from-sky-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">Bolívares</span>
          </h1>

          <p className="text-slate-300 text-base sm:text-lg md:text-xl font-normal leading-relaxed max-w-2xl mx-auto pt-2 text-center">
            El sistema de punto de venta más rápido, intuitivo y seguro para todo tipo de comercio en Venezuela (minimarkets, bodegones, farmacias, ferreterías, zapaterías, restaurantes y más). 
            <strong> Tasa BCV automática</strong>, vuelto multimoneda exacto, control de inventario por bultos e impresión térmica <strong>sin depender de internet</strong>.
          </p>

          {/* Action Buttons — Pill Glow Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-5 pt-6 w-full">
            <a
              href="https://wa.me/584248486105?text=Hola%20VentroX%2C%20quiero%20solicitar%20una%20demostraci%C3%B3n%20gratuita%20para%20mi%20negocio"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-3 px-9 py-4 rounded-full font-black text-sm sm:text-base bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 text-white shadow-xl shadow-pink-500/30 hover:scale-105 hover:opacity-95 transition-all w-full sm:w-auto"
            >
              <Sparkles className="w-5 h-5" />
              <span>SOLICITAR DEMO GRATIS (WHATSAPP)</span>
              <ArrowRight className="w-4 h-4" />
            </a>

            <a
              href="#simulador"
              className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full font-bold text-sm sm:text-base bg-white/[0.07] hover:bg-white/[0.14] text-slate-200 hover:text-white border border-white/15 hover:border-white/30 backdrop-blur-md hover:scale-105 transition-all w-full sm:w-auto"
            >
              <Play className="w-4 h-4 text-cyan-400 fill-cyan-400" />
              <span>Probar Simulador POS en Vivo</span>
            </a>
          </div>

          {/* Social Proof Star Rating */}
          <div className="flex items-center justify-center gap-2 pt-6 text-xs sm:text-sm text-slate-400 font-medium text-center">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400" />
              ))}
            </div>
            <span><strong>4.9 / 5.0</strong> en más de <strong>+250 comercios y negocios</strong> en Venezuela</span>
          </div>
        </div>

      </div>
    </section>
  );
}
