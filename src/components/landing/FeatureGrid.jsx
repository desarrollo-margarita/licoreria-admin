import React from 'react';
import { 
  ShoppingCart, Layers, ArrowLeftRight, FileSpreadsheet, Lock, Server, 
  Printer, Cloud, Zap, Check
} from 'lucide-react';

const features = [
  {
    num: '01',
    icon: ShoppingCart,
    iconColor: 'text-cyan-400',
    iconBg: 'bg-cyan-500/15 border border-cyan-500/30',
    badgeColor: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
    tag: 'VELOCIDAD',
    title: 'Cobro Multimoneda',
    description: 'Calcula vueltos combinados en USD, Pago Móvil en Bs. y Zelle con la tasa BCV del día sincronizada en vivo.',
    bullets: ['Vuelto exacto $ y Bs.', 'Lector código de barras', 'Cobro en 2 segundos']
  },
  {
    num: '02',
    icon: Layers,
    iconColor: 'text-orange-400',
    iconBg: 'bg-orange-500/15 border border-orange-500/30',
    badgeColor: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
    tag: 'INVENTARIO',
    title: 'Bultos y Unidades',
    description: 'Vende cajas completas o botellas sueltas y el sistema descuenta automáticamente las unidades del stock físico.',
    bullets: ['Desglose automático', 'Alertas de stock bajo', 'Control de mermas']
  },
  {
    num: '03',
    icon: ArrowLeftRight,
    iconColor: 'text-emerald-400',
    iconBg: 'bg-emerald-500/15 border border-emerald-500/30',
    badgeColor: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    tag: 'TASA OFICIAL',
    title: 'Tasa BCV en 1 Clic',
    description: 'Sincroniza la tasa oficial del Banco Central de Venezuela o ajústala manualmente para mantener los precios al día.',
    bullets: ['Actualización automática', 'Tasa personalizada', 'Precios en tiempo real']
  },
  {
    num: '04',
    icon: FileSpreadsheet,
    iconColor: 'text-pink-400',
    iconBg: 'bg-pink-500/15 border border-pink-500/30',
    badgeColor: 'bg-pink-500/15 text-pink-300 border-pink-500/30',
    tag: 'REPORTES',
    title: 'Libro de Ventas Excel',
    description: 'Exporta reportes de ventas diarios y mensuales en formato listo para tu contador, con control de utilidades netas.',
    bullets: ['Exportación Excel / PDF', 'Cierres de caja X y Z', 'Control de comisiones']
  },
  {
    num: '05',
    icon: Lock,
    iconColor: 'text-purple-400',
    iconBg: 'bg-purple-500/15 border border-purple-500/30',
    badgeColor: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
    tag: 'SEGURIDAD',
    title: 'Permisos PIN Maestro',
    description: 'Restringe anulaciones de facturas, descuentos y aperturas de gaveta exclusivamente para el dueño o administrador.',
    bullets: ['Arqueo de caja ciego', 'PIN de administrador', 'Auditoría de cajeros']
  },
  {
    num: '06',
    icon: Server,
    iconColor: 'text-amber-400',
    iconBg: 'bg-amber-500/15 border border-amber-500/30',
    badgeColor: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    tag: 'OFFLINE',
    title: '100% Sin Internet',
    description: 'Tus datos se guardan directamente en tu PC de forma local y segura para seguir cobrando sin luz ni conexión de internet.',
    bullets: ['Cero caídas de sistema', 'Base de datos local', 'Operación continua']
  },
  {
    num: '07',
    icon: Printer,
    iconColor: 'text-sky-400',
    iconBg: 'bg-sky-500/15 border border-sky-500/30',
    badgeColor: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
    tag: 'IMPRESIÓN',
    title: 'Tickets ESC/POS',
    description: 'Compatible con cualquier impresora térmica USB o Bluetooth de 58mm y 80mm en Windows de forma instantánea.',
    bullets: ['Tickets 58mm y 80mm', 'Apertura de gaveta', 'Personalización de logo']
  },
  {
    num: '08',
    icon: Cloud,
    iconColor: 'text-indigo-400',
    iconBg: 'bg-indigo-500/15 border border-indigo-500/30',
    badgeColor: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
    tag: 'RESPALDO',
    title: 'Sincronización Nube',
    description: 'Respaldo automático de tus ventas, clientes e inventario en Supabase Cloud con restauración en 1 clic.',
    bullets: ['Respaldo en la nube', 'Recuperación ante fallos', 'Acceso para el dueño']
  }
];

export default function FeatureGrid() {
  return (
    <section id="caracteristicas" className="w-full py-6 sm:py-7 px-6 sm:px-10 lg:px-16 xl:px-24 relative flex flex-col items-center justify-center">
      <div className="w-full max-w-[1500px] mx-auto flex flex-col items-center">
        
        {/* Centered Section Header */}
        <div className="flex flex-col items-center justify-center text-center max-w-3xl mx-auto mb-6 space-y-3">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-purple-500/15 text-purple-300 text-xs font-bold border border-purple-500/30 mx-auto shadow-lg shadow-purple-500/10">
            <Zap className="w-4 h-4 text-purple-400" /> Funcionalidades Diseñadas para tu Éxito
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-black text-white tracking-tight leading-tight text-center mt-2">
            Todo lo que tu Negocio Necesita para <span className="bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400 bg-clip-text text-transparent">Facturar y Crecer</span>
          </h2>
          <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto text-center leading-relaxed">
            Elimina errores en caja, evita pérdidas de inventario y atiende filas de clientes el doble de rápido.
          </p>
        </div>

        {/* Compact 4-Column Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
          {features.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="relative bg-gradient-to-b from-[#1a0f36]/85 to-[#0d061e]/90 border border-white/10 hover:border-cyan-500/40 rounded-2xl backdrop-blur-xl p-7 sm:p-8 flex flex-col justify-between h-full group transition-all duration-300 hover:-translate-y-1 shadow-xl overflow-hidden"
              >
                {/* Number Watermark */}
                <div className="absolute top-6 right-7 text-4xl font-mono font-black text-white/[0.04] group-hover:text-cyan-400/[0.08] transition-colors select-none pointer-events-none">
                  {item.num}
                </div>

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-5">
                    <div className={`w-11 h-11 rounded-xl ${item.iconBg} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md`}>
                      <Icon className={`w-5 h-5 ${item.iconColor}`} />
                    </div>
                    <span className={`text-[9px] font-black px-2.5 py-1 rounded-full border tracking-wider ${item.badgeColor}`}>
                      {item.tag}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-black text-white mb-2.5 group-hover:text-cyan-300 transition-colors tracking-tight">
                    {item.title}
                  </h3>
                  
                  <p className="text-slate-300/90 text-xs sm:text-sm leading-relaxed mb-6 font-normal">
                    {item.description}
                  </p>
                </div>

                <div className="pt-5 border-t border-white/[0.08] space-y-2.5 relative z-10">
                  {item.bullets.map((b, i) => (
                    <div key={i} className="flex items-center gap-2.5 text-xs text-slate-200 bg-slate-950/40 p-2.5 rounded-lg border border-white/[0.04]">
                      <div className="w-3.5 h-3.5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                        <Check className="w-2 h-2" />
                      </div>
                      <span className="font-medium truncate">{b}</span>
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
