import React, { useState } from 'react';
import { 
  ShoppingCart, Plus, Minus, Trash2, CheckCircle2, 
  Calculator, Receipt, Printer, Copy, Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

const mockProducts = [
  { id: 1, name: 'Harina PAN 1Kg', priceUsd: 1.20, category: 'Alimentos', badge: 'Paquete' },
  { id: 2, name: 'Refresco Coca-Cola 2L', priceUsd: 2.50, category: 'Bebidas', badge: '2 Litros' },
  { id: 3, name: 'Queso Blanco Llanero (500g)', priceUsd: 3.80, category: 'Charcutería', badge: '500g' },
  { id: 4, name: 'Aceite Mazeite 1L', priceUsd: 3.20, category: 'Víveres', badge: 'Botella' },
  { id: 5, name: 'Bombillo LED 12W Luz Blanca', priceUsd: 1.50, category: 'Ferretería', badge: 'Unidad' },
  { id: 6, name: 'Bulto Harina PAN (20u)', priceUsd: 22.00, category: 'Bultos', badge: 'Bulto 20u' },
];

export default function LivePosSimulator() {
  const [bcvRate, setBcvRate] = useState(62.50);
  const [selectedCategory, setSelectedCategory] = useState('TODOS');
  const [cart, setCart] = useState([
    { ...mockProducts[0], qty: 2 },
    { ...mockProducts[1], qty: 1 }
  ]);
  const [paidUsd, setPaidUsd] = useState(10.00);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [ticketNumber, setTicketNumber] = useState(10482);
  const [copied, setCopied] = useState(false);

  const categories = ['TODOS', 'Alimentos', 'Bebidas', 'Charcutería', 'Víveres', 'Ferretería', 'Bultos'];

  const filteredProducts = selectedCategory === 'TODOS'
    ? mockProducts
    : mockProducts.filter(p => p.category === selectedCategory);

  const totalUsd = cart.reduce((sum, item) => sum + (item.priceUsd * item.qty), 0);
  const totalVes = totalUsd * bcvRate;
  const changeUsd = Math.max(0, paidUsd - totalUsd);
  const changeVes = changeUsd * bcvRate;

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const updateQty = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.qty + delta;
        return newQty > 0 ? { ...item, qty: newQty } : item;
      }
      return item;
    }));
  };

  const removeItem = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
    setTicketNumber(prev => prev + 1);
    setIsReceiptOpen(true);
  };

  const copyTicket = () => {
    const text = `
========================================
     SUPERMARKET & COMERCIAL EXPRESS
               VENTROX POS
========================================
Ticket: #${ticketNumber}
Fecha: ${new Date().toLocaleString('es-VE')}
Tasa Oficial BCV: Bs. ${bcvRate.toFixed(2)}
----------------------------------------
${cart.map(i => `${i.qty}x ${i.name.slice(0, 20)}... $${(i.priceUsd * i.qty).toFixed(2)}`).join('\n')}
----------------------------------------
TOTAL USD:        $${totalUsd.toFixed(2)}
TOTAL BOLÍVARES:  Bs. ${totalVes.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
----------------------------------------
PAGÓ CON (USD):   $${paidUsd.toFixed(2)}
VUELTO EN BS:     Bs. ${changeVes.toLocaleString('es-VE', { minimumFractionDigits: 2 })} ($${changeUsd.toFixed(2)})
========================================
        ¡Gracias por su compra!
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <section id="simulador" className="w-full py-12 sm:py-14 px-6 sm:px-10 lg:px-16 xl:px-24 relative flex flex-col items-center justify-center">
      <div className="w-full max-w-[1500px] mx-auto flex flex-col items-center">
        
        {/* Centered Section Header with balanced breathing room after subtitle */}
        <div className="flex flex-col items-center justify-center text-center max-w-3xl mx-auto mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-cyan-500/15 text-cyan-300 text-xs font-bold border border-cyan-500/30 mx-auto shadow-lg shadow-cyan-500/10">
            <Calculator className="w-4 h-4 text-cyan-400" /> Demostración Interactiva en Vivo
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-black text-white tracking-tight leading-tight text-center mt-3">
            Prueba la Rapidez del <span className="bg-gradient-to-r from-sky-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">Cobro en VentroX</span>
          </h2>
          <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto text-center leading-relaxed">
            Selecciona productos, ajusta la tasa BCV e ingresa el billete en USD recibido para ver el cálculo instantáneo del vuelto multimoneda.
          </p>
        </div>

        {/* Simulator POS Machine Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-slate-900/90 border border-white/10 rounded-3xl p-5 sm:p-8 lg:p-12 shadow-2xl backdrop-blur-xl relative w-full">
          
          {/* Left Column: Product Selector & Categories */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {/* Top Bar: Title & BCV Rate */}
            <div className="flex flex-wrap items-center justify-between pb-4 border-b border-white/[0.08] gap-3">
              <span className="text-xs font-extrabold text-slate-200 tracking-wide uppercase">
                Catálogo de Productos Comerciales (Haz clic para agregar)
              </span>
              <div className="flex items-center gap-2.5 text-xs text-slate-300 bg-slate-950 px-4 py-2 rounded-xl border border-white/10 shadow-inner">
                <span className="font-semibold text-slate-400">Tasa BCV:</span>
                <input
                  type="number"
                  step="0.1"
                  value={bcvRate}
                  onChange={e => setBcvRate(parseFloat(e.target.value) || 1)}
                  className="w-16 bg-slate-900 text-cyan-400 font-bold px-2 py-0.5 rounded-lg border border-slate-700 outline-none text-center"
                />
                <span className="font-mono text-[11px] text-slate-500">Bs/USD</span>
              </div>
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {categories.map((cat, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                      : 'bg-slate-950/60 text-slate-400 border border-slate-800 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredProducts.map(p => (
                <div
                  key={p.id}
                  onClick={() => addToCart(p)}
                  className="flex items-center justify-between p-4 rounded-2xl bg-slate-950/70 border border-white/[0.07] hover:border-cyan-500/50 hover:bg-slate-950 cursor-pointer transition-all duration-200 group shadow-sm"
                >
                  <div className="min-w-0 pr-2">
                    <div className="text-xs font-bold text-slate-200 group-hover:text-cyan-400 transition-colors truncate">
                      {p.name}
                    </div>
                    <span className="text-[10px] text-slate-500 font-medium px-2 py-0.5 rounded bg-slate-900 border border-slate-800 inline-block mt-1">
                      {p.badge}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 flex-shrink-0">
                    <div className="text-right">
                      <div className="text-xs font-black text-emerald-400 font-mono">${p.priceUsd.toFixed(2)}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        Bs. {(p.priceUsd * bcvRate).toFixed(2)}
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center group-hover:bg-cyan-500 group-hover:text-slate-950 transition-all font-bold">
                      <Plus className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Checkout Cart & Instant Payment Calc */}
          <div className="lg:col-span-5 bg-slate-950 border border-white/[0.09] rounded-2xl p-7 lg:p-8 flex flex-col justify-between shadow-2xl">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-4">
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-cyan-400" /> Carrito de Venta
                </span>
                <span className="text-xs font-bold text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded-lg border border-cyan-500/20">
                  {cart.reduce((a, b) => a + b.qty, 0)} items
                </span>
              </div>

              {/* Cart Items */}
              {cart.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs">
                  El carrito está vacío. Selecciona productos del catálogo.
                </div>
              ) : (
                <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                  {cart.map(item => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900 border border-white/[0.06] text-xs"
                    >
                      <div className="flex-1 truncate font-medium text-slate-300 pr-2">
                        {item.name}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right font-mono pr-1">
                          <div className="font-bold text-white">${(item.priceUsd * item.qty).toFixed(2)}</div>
                          <div className="text-[10px] text-slate-500">Bs. {(item.priceUsd * item.qty * bcvRate).toFixed(2)}</div>
                        </div>
                        <div className="flex items-center gap-1 bg-slate-950 rounded-lg p-0.5 border border-slate-800">
                          <button
                            onClick={(e) => { e.stopPropagation(); updateQty(item.id, -1); }}
                            className="w-5 h-5 rounded hover:bg-slate-800 text-slate-400 flex items-center justify-center cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-5 text-center font-bold text-white text-[11px]">{item.qty}</span>
                          <button
                            onClick={(e) => { e.stopPropagation(); updateQty(item.id, 1); }}
                            className="w-5 h-5 rounded hover:bg-slate-800 text-slate-400 flex items-center justify-center cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); removeItem(item.id); }}
                          className="p-1 hover:text-red-400 text-slate-500 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Calculations & Quick Pay Input */}
            <div className="mt-6 pt-5 border-t border-white/[0.08] space-y-4">
              <div className="space-y-1.5 text-right font-mono">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Total a Pagar (USD):</span>
                  <span className="text-white font-bold text-sm">${totalUsd.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-cyan-400 font-bold">
                  <span>Total a Pagar (Bolívares):</span>
                  <span className="text-base">Bs. {totalVes.toLocaleString('es-VE', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              {/* Fast Cash Bill Selection */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[11px] text-slate-400">
                  <span>Cliente entrega billete USD:</span>
                  <span className="font-mono text-white font-bold">${paidUsd.toFixed(2)}</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[10, 20, 50, 100].map(val => (
                    <button
                      key={val}
                      onClick={() => setPaidUsd(val)}
                      className={`py-2 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer ${
                        paidUsd === val
                          ? 'bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-500/20'
                          : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                      }`}
                    >
                      ${val}
                    </button>
                  ))}
                </div>
              </div>

              {/* Calculated Change */}
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Vuelto en Bolívares (BCV):</span>
                  <span className="font-black text-emerald-400 font-mono text-sm">
                    Bs. {changeVes.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[11px] text-slate-500">
                  <span>Equivalente en Dólares:</span>
                  <span className="font-mono">${changeUsd.toFixed(2)} USD</span>
                </div>
              </div>

              {/* Checkout Button */}
              <Button
                variant="primary"
                onClick={handleCheckout}
                disabled={cart.length === 0}
                className="w-full justify-center py-4 text-xs font-black shadow-xl shadow-emerald-500/25 tracking-wider"
              >
                <Printer className="w-4 h-4" />
                <span>IMPRIMIR TICKET Y COBRAR EN 2 SEG</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Thermal Receipt Modal */}
      <Modal isOpen={isReceiptOpen} onClose={() => setIsReceiptOpen(false)} title="Simulación de Ticket Térmico ESC/POS">
        <div className="space-y-4">
          <div className="p-5 bg-white text-slate-950 rounded-xl font-mono text-xs shadow-inner space-y-2 border border-slate-300">
            <div className="text-center pb-2 border-b border-dashed border-slate-400">
              <div className="font-black text-sm">SUPERMARKET & COMERCIAL EXPRESS</div>
              <div className="text-[10px] text-slate-600">RIF: J-50123456-7 • TICKET #{ticketNumber}</div>
              <div className="text-[10px] text-slate-600">{new Date().toLocaleString('es-VE')}</div>
              <div className="text-[10px] font-bold mt-1 text-slate-800">TASA OFICIAL BCV: Bs. {bcvRate.toFixed(2)}</div>
            </div>

            <div className="py-2 space-y-1 border-b border-dashed border-slate-400">
              {cart.map(item => (
                <div key={item.id} className="flex justify-between text-[11px]">
                  <span>{item.qty}x {item.name.slice(0, 18)}</span>
                  <span className="font-bold">${(item.priceUsd * item.qty).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="pt-2 space-y-1 font-bold">
              <div className="flex justify-between text-xs">
                <span>TOTAL USD:</span>
                <span>${totalUsd.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>TOTAL BOLÍVARES:</span>
                <span>Bs. {totalVes.toLocaleString('es-VE', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-dashed border-slate-400 space-y-0.5 text-[11px]">
              <div className="flex justify-between">
                <span>PAGO CON (USD):</span>
                <span>${paidUsd.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-black text-emerald-700">
                <span>VUELTO EN BOLÍVARES:</span>
                <span>Bs. {changeVes.toLocaleString('es-VE', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>(VUELTO USD EQUIV):</span>
                <span>${changeUsd.toFixed(2)}</span>
              </div>
            </div>

            <div className="text-center pt-3 text-[10px] text-slate-500 font-sans font-bold">
              ¡GRACIAS POR SU COMPRA! • VENTROX POS
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={copyTicket}
              className="flex-1 justify-center text-xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copiado al portapapeles' : 'Copiar Ticket'}</span>
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setIsReceiptOpen(false);
                clearCart();
              }}
              className="flex-1 justify-center text-xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Nueva Venta</span>
            </Button>
          </div>
        </div>
      </Modal>
    </section>
  );
}
