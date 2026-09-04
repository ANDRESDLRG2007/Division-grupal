import React, { useRef } from 'react';
import { X, Share2, Copy, Check, Download, Sparkles } from 'lucide-react';
import { Persona, GastoMensual, Deuda } from '../types';
import { fmt, getNombre } from '../utils/calculations';
import { playClickSound } from '../utils/audio';
import { generarResumenCompleto, compartirPorWhatsApp } from '../utils/whatsapp';

interface TicketModalProps {
  roomies: Persona[];
  gastos: GastoMensual[];
  deudas: Deuda[];
  total: number;
  onCerrar: () => void;
}

export const TicketModal: React.FC<TicketModalProps> = ({
  roomies,
  gastos,
  deudas,
  total,
  onCerrar,
}) => {
  const [copiado, setCopiado] = React.useState(false);
  const ticketRef = useRef<HTMLDivElement>(null);

  const copiarTexto = () => {
    playClickSound();
    const texto = generarResumenCompleto(deudas, gastos, total, roomies);
    navigator.clipboard.writeText(texto);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const enviarWhatsApp = () => {
    playClickSound();
    const texto = generarResumenCompleto(deudas, gastos, total, roomies);
    compartirPorWhatsApp(texto);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="w-full max-w-[400px] flex flex-col items-center">
        {/* Close Button */}
        <button
          onClick={() => {
            playClickSound();
            onCerrar();
          }}
          className="self-end mb-2 w-9 h-9 rounded-full bg-white/[0.1] hover:bg-white/[0.2] flex items-center justify-center text-white transition-all active:scale-90"
        >
          <X size={18} />
        </button>

        {/* The Receipt (Thermal Ticket Style) */}
        <div
          ref={ticketRef}
          className="w-full bg-[#f8f9fa] text-[#111827] rounded-3xl p-6 font-mono shadow-2xl relative border-t-8 border-violet-600"
          style={{
            backgroundImage: 'radial-gradient(#e5e7eb 1px, transparent 0)',
            backgroundSize: '16px 16px',
          }}
        >
          {/* Header */}
          <div className="text-center pb-4 border-b-2 border-dashed border-zinc-300">
            <div className="text-2xl mb-1">💸🎓</div>
            <h2 className="text-base font-black tracking-wider uppercase font-sans">
              UNISPLIT TICKET
            </h2>
            <p className="text-[10px] text-zinc-500 font-sans">
              Comprobante de Gastos de Apartamento
            </p>
            <p className="text-[10px] text-zinc-400 mt-1">
              FECHA: {new Date().toLocaleDateString('es-CO')} · {new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>

          {/* List of items */}
          <div className="py-3 border-b-2 border-dashed border-zinc-300 space-y-1.5 text-xs">
            <div className="flex justify-between text-[10px] font-bold text-zinc-400 uppercase">
              <span>CONCEPTO / PAGÓ</span>
              <span>VALOR</span>
            </div>
            {gastos.length === 0 ? (
              <p className="text-center text-zinc-400 text-xs py-2">Sin gastos registrados</p>
            ) : (
              gastos.map((g) => (
                <div key={g.id} className="flex justify-between items-start text-[11px] leading-tight">
                  <div className="max-w-[70%]">
                    <p className="font-bold text-zinc-800">{g.descripcion}</p>
                    <p className="text-[9px] text-zinc-500">
                      Pagó {getNombre(g.pagadoPor, roomies)} ({g.participantes.length} pers.)
                    </p>
                  </div>
                  <span className="font-bold">{fmt(g.monto)}</span>
                </div>
              ))
            )}
          </div>

          {/* Total */}
          <div className="py-3 border-b-2 border-dashed border-zinc-300 flex justify-between items-center text-sm font-black">
            <span className="uppercase">TOTAL MES:</span>
            <span className="text-base text-violet-700">{fmt(total)}</span>
          </div>

          {/* Debts to settle */}
          <div className="py-3 border-b-2 border-dashed border-zinc-300 space-y-1.5 text-xs">
            <p className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider">
              TRANSFERENCIAS PENDIENTES:
            </p>
            {deudas.length === 0 ? (
              <p className="text-[11px] text-emerald-700 font-bold py-1 text-center">
                ✨ ¡TODOS ESTÁN A PAZ Y SALVO! ✨
              </p>
            ) : (
              deudas.map((d, i) => (
                <div key={i} className="flex justify-between items-center text-[11px] py-0.5">
                  <span>
                    <strong>{getNombre(d.de, roomies)}</strong> ➡️ {getNombre(d.para, roomies)}
                  </span>
                  <span className="font-bold text-rose-600">{fmt(d.monto)}</span>
                </div>
              ))
            )}
          </div>

          {/* Footer Barcode Simulation */}
          <div className="pt-4 text-center">
            <div className="flex justify-center gap-1 h-8 items-center opacity-70">
              {[3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5, 8, 9, 7, 9, 3, 2, 3, 8, 4, 6].map((w, i) => (
                <div
                  key={i}
                  className="bg-black h-full"
                  style={{ width: `${w * 1.5}px` }}
                />
              ))}
            </div>
            <p className="text-[9px] text-zinc-400 mt-2 font-sans">
              UniSplit PRO · Cuentas claras entre universitarios
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex gap-2 mt-4">
          <button
            onClick={enviarWhatsApp}
            className="flex-1 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/30 transition-all active:scale-95"
          >
            <Share2 size={14} />
            Mandar por WhatsApp
          </button>

          <button
            onClick={copiarTexto}
            className="py-3 px-4 rounded-2xl bg-white/[0.1] hover:bg-white/[0.2] border border-white/[0.1] text-white font-semibold text-xs flex items-center gap-1.5 transition-all active:scale-95"
          >
            {copiado ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            {copiado ? 'Copiado' : 'Copiar'}
          </button>
        </div>
      </div>
    </div>
  );
};
