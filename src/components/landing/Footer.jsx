import React from 'react';
import { ShieldCheck, ArrowUp, MessageCircle } from 'lucide-react';

export default function Footer({ onOpenAdmin }) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="w-full bg-slate-950 border-t border-white/[0.08] pt-12 pb-10 px-6 sm:px-10 lg:px-16 xl:px-24 relative flex flex-col items-center">
      {/* Brand line */}
      <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-purple-600 via-cyan-400 via-pink-500 to-orange-400 opacity-60 pointer-events-none" />

      <div className="w-full max-w-[1500px] mx-auto space-y-12">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-5">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 flex items-center justify-center flex-shrink-0">
                <img src="/ventrox-logo.png" alt="VentroX Logo" className="w-full h-full object-contain drop-shadow-[0_6px_20px_rgba(0,210,255,0.25)]" />
              </div>
              <div>
                <span className="text-2xl font-black tracking-tight text-white flex items-center">
                  Ventro<span className="bg-gradient-to-r from-orange-400 via-pink-500 to-cyan-400 bg-clip-text text-transparent font-black">X</span>
                </span>
                <p className="text-xs text-cyan-400 font-bold">POS SAAS · Venezuela 🇻🇪</p>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 max-w-lg leading-relaxed">
              El sistema de punto de venta y gestión administrativa líder en Venezuela. Diseñado para minimarkets, bodegones, farmacias, ferreterías, tiendas, zapaterías, restaurantes y todo tipo de comercio que busca velocidad, control y cero caídas.
            </p>
            <div className="pt-2">
              <a
                href="https://wa.me/584248486105?text=Hola%20VentroX%2C%20necesito%20soporte%20o%20informaci%C3%B3n"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full font-bold text-xs bg-white/[0.07] hover:bg-white/[0.14] text-slate-200 hover:text-white border border-white/15 backdrop-blur-md transition-all cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span>Atención por WhatsApp: +58 424-8486105</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4 text-xs sm:text-sm">
            <div className="text-xs font-black uppercase tracking-widest text-white">Navegación</div>
            <ul className="space-y-3 text-slate-400">
              <li><a href="#caracteristicas" className="hover:text-cyan-400 transition-colors">Funcionalidades</a></li>
              <li><a href="#rubros" className="hover:text-cyan-400 transition-colors">Soluciones por Rubro</a></li>
              <li><a href="#simulador" className="hover:text-cyan-400 transition-colors">Simulador POS en Vivo</a></li>
              <li><a href="#planes" className="hover:text-cyan-400 transition-colors">Planes y Precios</a></li>
              <li><a href="#testimonios" className="hover:text-cyan-400 transition-colors">Testimonios en Venezuela</a></li>
              <li><a href="#faq" className="hover:text-cyan-400 transition-colors">Preguntas Frecuentes</a></li>
            </ul>
          </div>

          {/* Administration & Security */}
          <div className="space-y-4 text-xs sm:text-sm">
            <div className="text-xs font-black uppercase tracking-widest text-white">Administración</div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Portal exclusivo para administradores y distribuidores de licencias VentroX.
            </p>
            <button
              onClick={onOpenAdmin}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full font-black text-xs bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 shadow-lg shadow-cyan-500/25 transition-all cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Portal SuperAdmin</span>
            </button>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} VentroX POS SaaS. Todos los derechos reservados. Hecho para Venezuela 🇻🇪
          </div>

          <button
            onClick={scrollToTop}
            className="w-11 h-11 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors border border-white/10 cursor-pointer shadow-md"
            title="Volver al inicio"
          >
            <ArrowUp className="w-5 h-5" />
          </button>
        </div>

      </div>
    </footer>
  );
}
