import React from 'react';
import { Settings2, ReceiptText, Sparkles } from 'lucide-react';
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
<<<<<<< HEAD
    <header className="sticky top-0 z-40 px-4 pt-[max(env(safe-area-inset-top,0px),12px)] pb-3 bg-[#090c15]/90 backdrop-blur-xl border-b border-white/[0.07]">
      <div className="max-w-[500px] mx-auto flex items-center justify-between gap-3">
        {/* Brand & Context */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-700 p-[1px] shadow-lg shadow-indigo-500/20 shrink-0 flex items-center justify-center">
            <div className="w-full h-full rounded-[15px] bg-[#0c101c] flex items-center justify-center text-lg">
              {isApto ? '🏠' : '🍕'}
=======
    <header
      style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}
      className="sticky top-0 z-40 pb-3 backdrop-blur-2xl bg-[#0d1322]/92 border-b border-white/[0.1] shadow-lg shadow-black/20"
    >
      <div className="max-w-[500px] mx-auto flex items-center justify-between gap-2">
        {/* Logo & App Name */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-[#8b5cf6] p-[1.5px]">
            <div className="w-full h-full bg-[#171e27] rounded-[9px] flex items-center justify-center text-lg">
              💸
>>>>>>> ae824147ff56f4e377b864695131bb809be1795c
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base font-extrabold tracking-tight text-white leading-none">
                UniSplit
              </h1>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-indigo-500/15 text-indigo-400 border border-indigo-500/25">
                {isApto ? 'Apto' : 'Parche'}
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 font-medium leading-none mt-1">
              {activeTab === 'salida' && 'División de salidas y amigos'}
              {activeTab === 'cuentas' && 'Liquidación y cobro por Nequi'}
              {activeTab === 'ruleta' && '¿Quién paga hoy? · Ruleta'}
              {activeTab === 'mensual' && 'Gastos fijos de roomies'}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Quick Ticket Generator */}
          <button
            onClick={() => {
              playClickSound();
              onOpenTicket();
            }}
            title="Generar Recibo / Ticket"
            className="w-9 h-9 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.08] flex items-center justify-center text-zinc-300 hover:text-white transition-all active:scale-95"
          >
            <ReceiptText size={16} />
          </button>

          {/* Settings */}
          <button
            onClick={() => {
              playClickSound();
              onOpenGroup();
            }}
<<<<<<< HEAD
            title="Ajustes y Respaldo"
            className="w-9 h-9 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.08] flex items-center justify-center text-zinc-300 hover:text-white transition-all active:scale-95"
=======
            title="Gestionar grupo"
            className="w-9 h-9 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/70 flex items-center justify-center text-slate-200 hover:text-white transition-all active:scale-95 shadow-sm"
>>>>>>> ae824147ff56f4e377b864695131bb809be1795c
          >
            <Settings2 size={16} />
          </button>

          {/* Total Badge */}
          <div className="py-1.5 px-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 font-mono text-xs font-bold flex items-center gap-1 shadow-sm">
            <span className="text-[10px] text-emerald-500/80 font-sans font-semibold">Total</span>
            <span>{fmt(totalActual)}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
