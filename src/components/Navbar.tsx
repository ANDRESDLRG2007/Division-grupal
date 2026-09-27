import React from 'react';
import { Settings2, ReceiptText } from 'lucide-react';
import { fmt } from '../utils/calculations';
import { playClickSound } from '../utils/audio';

interface NavbarProps {
  totalMensual: number;
  totalSalidas: number;
  activeTab: string;
  onOpenBackup: () => void;
  onOpenTicket: () => void;
  onOpenGroup: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  totalMensual,
  totalSalidas,
  activeTab,
  onOpenBackup,
  onOpenTicket,
  onOpenGroup,
}) => {
  const totalActual = activeTab === 'mensual' ? totalMensual : totalSalidas;
  const isApto = activeTab === 'mensual';

  return (
    <header
      className="sticky top-0 z-40 px-4 pt-[max(env(safe-area-inset-top,0px),12px)] pb-3 border-b border-white/[0.07]"
      style={{ background: 'rgba(16,14,64,0.93)', backdropFilter: 'blur(18px)' }}
    >
      <div className="max-w-[480px] mx-auto flex items-center justify-between gap-3">

        {/* Brand */}
        <div className="flex items-center gap-2.5">
          {/* Logo pill */}
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl shrink-0 shadow-lg"
            style={{ background: 'linear-gradient(135deg, #D2F25E 0%, #4EC26E 100%)' }}
          >
            {isApto ? '🏠' : '🍕'}
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h1
                className="text-base tracking-tight text-white leading-none"
                style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 800 }}
              >
                UniSplit
              </h1>
              <span
                className="text-[10px] font-bold px-1.5 py-0.5 rounded-md border"
                style={{
                  background: 'rgba(210,242,94,0.12)',
                  color: '#D2F25E',
                  borderColor: 'rgba(210,242,94,0.28)',
                }}
              >
                {isApto ? 'Apto' : 'Parche'}
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 font-medium leading-none mt-1">
              {activeTab === 'salida'  && 'División de salidas y amigos'}
              {activeTab === 'cuentas' && 'Liquidación y cobro por Nequi'}
              {activeTab === 'ruleta'  && '¿Quién paga hoy? · Ruleta'}
              {activeTab === 'mensual' && 'Gastos fijos de roomies'}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => { playClickSound(); onOpenTicket(); }}
            title="Generar Recibo / Ticket"
            className="w-9 h-9 rounded-xl flex items-center justify-center text-zinc-300 hover:text-white transition-all active:scale-95"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)' }}
          >
            <ReceiptText size={16} />
          </button>

          <button
            onClick={() => { playClickSound(); onOpenGroup(); }}
            title="Gestionar grupo y ajustes"
            className="w-9 h-9 rounded-xl flex items-center justify-center text-zinc-300 hover:text-white transition-all active:scale-95"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)' }}
          >
            <Settings2 size={16} />
          </button>

          {/* Total Badge — Verde for emphasis */}
          <div
            className="py-1.5 px-3 rounded-xl font-mono text-xs font-bold flex items-center gap-1"
            style={{
              background: 'rgba(78,194,110,0.12)',
              border: '1px solid rgba(78,194,110,0.28)',
              color: '#4EC26E',
            }}
          >
            <span className="text-[10px] font-sans font-semibold" style={{ color: 'rgba(78,194,110,0.75)' }}>
              Total
            </span>
            <span>{fmt(totalActual)}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
