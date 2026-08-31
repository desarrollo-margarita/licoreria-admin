import React, { useState } from 'react';
import { 
  ShieldCheck, ArrowRight, Menu, X, ChevronDown, 
  ShoppingCart, Store, Building2, UtensilsCrossed, Sparkles, Package, Pill, Wrench, Shirt
} from 'lucide-react';

export default function Navbar({ onOpenAdmin }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [rubrosOpen, setRubrosOpen] = useState(false);

  const rubrosList = [
    { name: 'Minimarkets, Bodegones & Víveres', desc: 'Lectura de barras, balanzas, bultos y vuelto BCV', icon: ShoppingCart, href: '#rubros' },
    { name: 'Farmacias & Cosméticos', desc: 'Búsqueda por principio activo, laboratorio y lotes', icon: Pill, href: '#rubros' },
    { name: 'Ferreterías & Repuestos', desc: 'Catálogos amplios, múltiples unidades y conversión', icon: Wrench, href: '#rubros' },
    { name: 'Zapaterías, Ropa & Boutiques', desc: 'Control por tallas, colores, créditos y promociones', icon: Shirt, href: '#rubros' },
    { name: 'Restaurantes, Cafés & Bares', desc: 'Comandas, mesas, barra, combos y arqueo ciego', icon: UtensilsCrossed, href: '#rubros' },
    { name: 'Supermercados & Mayoristas', desc: 'Múltiples cajas en red local, mayor y detal', icon: Building2, href: '#rubros' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-[#0f0624]/85 border-b border-white/[0.08] backdrop-blur-2xl relative">
      {/* Brand Bottom Line */}
      <div className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-purple-600 via-cyan-400 via-pink-500 to-orange-400 opacity-70 pointer-events-none" />

      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-10 xl:px-12 h-20 flex items-center justify-between gap-4">
        
        {/* Brand Logo with Official Image */}
        <a href="#" className="flex items-center gap-3.5 group flex-shrink-0">
          <div className="w-13 h-13 sm:w-14 sm:h-14 flex items-center justify-center flex-shrink-0">
            <img
              src="/ventrox-logo.png"
              alt="VentroX Logo"
              className="w-full h-full object-contain drop-shadow-[0_6px_20px_rgba(0,210,255,0.25)] group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black tracking-tight text-white flex items-center">
                Ventro<span className="bg-gradient-to-r from-orange-400 via-pink-500 to-cyan-400 bg-clip-text text-transparent font-black">X</span>
              </span>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 font-extrabold border border-cyan-500/30 tracking-wider">
                POS SAAS
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium hidden sm:block">
              El Sistema de Ventas #1 en Venezuela 🇻🇪
            </p>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden xl:flex items-center gap-5 2xl:gap-7 text-xs 2xl:text-sm font-semibold text-slate-200">
          <a
            href="#caracteristicas"
            className="hover:text-cyan-400 transition-colors py-1 relative group whitespace-nowrap"
          >
            <span>Funcionalidades</span>
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-400 group-hover:w-full transition-all duration-300 rounded-full" />
          </a>

          {/* Software Para Dropdown */}
          <div 
            className="relative"
            onMouseEnter={() => setRubrosOpen(true)}
            onMouseLeave={() => setRubrosOpen(false)}
          >
            <button 
              className="flex items-center gap-1.5 hover:text-cyan-400 transition-colors py-1 cursor-pointer whitespace-nowrap"
            >
              <span>Software para...</span>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${rubrosOpen ? 'rotate-180 text-cyan-400' : ''}`} />
            </button>

            {rubrosOpen && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3 w-80 z-50">
                <div className="p-3 rounded-2xl bg-slate-900/95 border border-white/15 shadow-2xl backdrop-blur-2xl space-y-1">
                  <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-cyan-400">
                    Soluciones por Rubro
                  </div>
                  {rubrosList.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <a
                        key={idx}
                        href={item.href}
                        onClick={() => setRubrosOpen(false)}
                        className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/[0.08] text-slate-300 hover:text-white transition-all group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-300 group-hover:bg-cyan-500/20 group-hover:text-cyan-300 flex items-center justify-center flex-shrink-0 transition-colors">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-white leading-tight">{item.name}</div>
                          <div className="text-[10px] text-slate-400 truncate">{item.desc}</div>
                        </div>
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <a
            href="#simulador"
            className="hover:text-cyan-400 transition-colors py-1 relative group whitespace-nowrap"
          >
            <span>Simulador POS</span>
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-400 group-hover:w-full transition-all duration-300 rounded-full" />
          </a>

          <a
            href="#planes"
            className="hover:text-cyan-400 transition-colors py-1 relative group whitespace-nowrap"
          >
            <span>Planes y Precios</span>
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-400 group-hover:w-full transition-all duration-300 rounded-full" />
          </a>

          <a
            href="#testimonios"
            className="hover:text-cyan-400 transition-colors py-1 relative group whitespace-nowrap"
          >
            <span>Testimonios</span>
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-400 group-hover:w-full transition-all duration-300 rounded-full" />
          </a>

          <a
            href="#faq"
            className="hover:text-cyan-400 transition-colors py-1 relative group whitespace-nowrap"
          >
            <span>FAQ</span>
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-400 group-hover:w-full transition-all duration-300 rounded-full" />
          </a>
        </nav>

        {/* Desktop Actions with generous margin and divider */}
        <div className="hidden lg:flex items-center gap-3 xl:gap-4 flex-shrink-0 ml-4 xl:ml-8 pl-4 xl:pl-6 border-l border-white/10">
          <button
            onClick={onOpenAdmin}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full font-bold text-xs bg-white/[0.07] hover:bg-white/[0.14] text-slate-200 hover:text-white border border-white/15 hover:border-cyan-500/40 backdrop-blur-md transition-all cursor-pointer whitespace-nowrap"
          >
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>Acceso SuperAdmin</span>
          </button>

          <a
            href="https://wa.me/584248486105?text=Hola%20VentroX%20POS%2C%20quiero%20solicitar%20una%20demostraci%C3%B3n%20gratuita%20para%20mi%20negocio"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-5 2xl:px-6 py-2.5 rounded-full font-black text-xs bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 text-white shadow-lg shadow-pink-500/25 hover:opacity-95 transition-all whitespace-nowrap"
          >
            <Sparkles className="w-4 h-4" />
            <span>Solicitar Demo WhatsApp</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="lg:hidden flex items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-11 h-11 rounded-2xl bg-slate-900/80 border border-white/10 text-slate-200 flex items-center justify-center cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden p-5 bg-slate-950 border-b border-white/10 space-y-4">
          <div className="flex flex-col space-y-2 text-sm font-semibold">
            <a
              href="#caracteristicas"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 rounded-xl hover:bg-slate-900 text-slate-200"
            >
              Funcionalidades
            </a>
            <a
              href="#rubros"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 rounded-xl hover:bg-slate-900 text-slate-200"
            >
              Soluciones por Rubro
            </a>
            <a
              href="#simulador"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 rounded-xl hover:bg-slate-900 text-slate-200"
            >
              Simulador POS en Vivo
            </a>
            <a
              href="#planes"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 rounded-xl hover:bg-slate-900 text-slate-200"
            >
              Planes y Precios
            </a>
            <a
              href="#testimonios"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 rounded-xl hover:bg-slate-900 text-slate-200"
            >
              Testimonios en Venezuela
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 rounded-xl hover:bg-slate-900 text-slate-200"
            >
              Preguntas Frecuentes
            </a>
          </div>

          <div className="pt-3 border-t border-white/10 flex flex-col gap-3">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAdmin();
              }}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full font-bold text-xs bg-white/[0.07] hover:bg-white/[0.14] text-slate-200 border border-white/15 w-full"
            >
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Portal SuperAdmin</span>
            </button>
            <a
              href="https://wa.me/584248486105?text=Hola%20VentroX%2C%20quiero%20probar%20el%20sistema"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full font-black text-xs bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 text-white w-full"
            >
              <span>Solicitar Demo en WhatsApp</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
