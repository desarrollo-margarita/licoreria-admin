import React from 'react';
import { ShoppingCart, Pill, Shirt, Building2, CheckCircle2, Store } from 'lucide-react';

const industries = [
  {
    icon: ShoppingCart,
    title: 'Minimarkets & Bodegones',
    badge: 'ALTA ROTACIÓN',
    accentColor: 'from-orange-500/20 to-pink-500/20',
    borderColor: 'hover:border-orange-500/50',
    iconColor: 'text-orange-400',
    badgeColor: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
    dotColor: 'bg-orange-400',
    desc: 'Lectura ultra-rápida de código de barras, integración con balanzas electrónicas, conversión de bultos a unidades y cálculo automático de vuelto a tasa BCV.',
    benefits: ['Conversión de bultos a unidades', 'Cobro multimoneda en 2 seg', 'Control de víveres por peso/kg']
  },
  {
    icon: Pill,
    title: 'Farmacias & Ferreterías',
    badge: 'CATÁLOGOS EXTENSOS',
    accentColor: 'from-cyan-500/20 to-blue-500/20',
    borderColor: 'hover:border-cyan-500/50',
    iconColor: 'text-cyan-400',
    badgeColor: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
    dotColor: 'bg-cyan-400',
    desc: 'Búsqueda instantánea de medicamentos por principio activo, control de lotes y fechas de vencimiento, inventario de tornillería, herramientas y repuestos.',
    benefits: ['Búsqueda rápida por código o nombre', 'Control de lotes y vencimientos', 'Múltiples unidades de medida']
  },
  {
    icon: Shirt,
    title: 'Zapaterías, Ropa & Boutiques',
    badge: 'VARIEDAD & TALLAS',
    accentColor: 'from-purple-500/20 to-pink-500/20',
    borderColor: 'hover:border-purple-500/50',
    iconColor: 'text-purple-400',
    badgeColor: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
    dotColor: 'bg-purple-400',
    desc: 'Organización de artículos por tallas, colores y modelos. Registro de clientes, promociones, notas de crédito, apartado de mercancía y múltiples formas de pago.',
    benefits: ['Matriz de tallas y colores', 'Control de apartados y créditos', 'Impresión de tickets de cambio']
  },
  {
    icon: Building2,
    title: 'Supermercados & Mayoristas',
    badge: 'MULTI-CAJA & RED',
    accentColor: 'from-emerald-500/20 to-teal-500/20',
    borderColor: 'hover:border-emerald-500/50',
    iconColor: 'text-emerald-400',
    badgeColor: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    dotColor: 'bg-emerald-400',
    desc: 'Conexión de múltiples cajas en red local sin depender de internet. Control de cajeros por turnos, arqueo ciego, listas de precios al mayor/detal y notas de entrega.',
    benefits: ['2 a 10 cajas en red local', 'Listas de precios mayor y detal', 'Cierre de caja X y Z ciego']
  }
];

export default function IndustriesSection() {
  return (
    <section id="rubros" className="w-full py-12 sm:py-14 px-6 sm:px-10 lg:px-16 xl:px-24 relative flex flex-col items-center justify-center">
      <div className="w-full max-w-[1500px] mx-auto relative z-10 flex flex-col items-center">
        
        {/* Centered Section Header */}
        <div className="flex flex-col items-center justify-center text-center max-w-3xl mx-auto mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-cyan-500/15 text-cyan-300 text-xs font-bold border border-cyan-500/30 mx-auto shadow-lg shadow-cyan-500/10">
            <Store className="w-4 h-4 text-cyan-400" /> Adaptado a la Realidad de tu Comercio
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-black text-white tracking-tight leading-tight text-center mt-3">
            Un Software Diseñado a la Medida de <span className="bg-gradient-to-r from-sky-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">tu Rubro</span>
          </h2>
          <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto text-center leading-relaxed">
            Configuración rápida, catálogo precargado y adaptado a las necesidades específicas de tu negocio en Venezuela.
          </p>
        </div>

        {/* 4 Industry Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-11 w-full">
          {industries.map((ind, idx) => {
            const Icon = ind.icon;
            return (
              <div
                key={idx}
                className={`relative bg-gradient-to-b from-[#1a0f36]/85 to-[#0d061e]/90 border border-white/10 ${ind.borderColor} rounded-[28px] backdrop-blur-xl p-10 sm:p-11 lg:p-12 flex flex-col justify-between h-full group transition-all duration-300 hover:-translate-y-1 shadow-2xl overflow-hidden`}
              >
                {/* Top Lighting Flare */}
                <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-white/[0.05] to-transparent pointer-events-none" />
                <div className={`absolute top-0 right-0 w-40 h-40 bg-gradient-to-br ${ind.accentColor} blur-2xl opacity-40 group-hover:opacity-80 transition-opacity rounded-full pointer-events-none`} />

                <div className="relative z-10">
                  {/* Top Bar: Icon + Badge */}
                  <div className="flex items-center justify-between mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-slate-900/90 border border-white/15 flex items-center justify-center shadow-lg relative group-hover:scale-105 transition-transform duration-300">
                      <Icon className={`w-7 h-7 ${ind.iconColor}`} />
                    </div>
                    <span className={`inline-flex items-center gap-1.5 text-[10px] font-black px-3.5 py-1.5 rounded-full border tracking-wider ${ind.badgeColor}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${ind.dotColor} animate-pulse`} />
                      {ind.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-black text-white mb-4 group-hover:text-cyan-300 transition-colors tracking-tight">
                    {ind.title}
                  </h3>

                  <p className="text-slate-300/90 text-xs sm:text-sm leading-relaxed mb-10 font-normal">
                    {ind.desc}
                  </p>
                </div>

                {/* Benefits list */}
                <div className="pt-7 border-t border-white/[0.08] space-y-3.5 pb-2 relative z-10">
                  {ind.benefits.map((b, i) => (
                    <div key={i} className="flex items-center gap-3.5 text-xs text-slate-200 bg-slate-950/50 p-3.5 rounded-xl border border-white/[0.05]">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span className="font-medium">{b}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
