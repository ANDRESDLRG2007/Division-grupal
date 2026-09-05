import React from 'react';
import { Sparkles, Settings2, ReceiptText } from 'lucide-react';
import { fmt } from '../utils/calculations';
import { playClickSound } from '../utils/audio';

interface NavbarProps {
  totalMensual: number;
  totalSalidas: number;
  activeTab: string;
  onOpenBackup: () => void;
  onOpenTicket: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  totalMensual,
  totalSalidas,
  activeTab,
  onOpenBackup,
  onOpenTicket,
}) => {
  const totalActual = activeTab === 'salida' ? totalSalidas : totalMensual;

  return (
    <header className="sticky top-0 z-40 px-4 pt-[max(env(safe-area-inset-top,0px),12px)] pb-3 backdrop-blur-2xl bg-[#0d1322]/92 border-b border-white/[0.1] shadow-lg shadow-black/20">
      <div className="max-w-[500px] mx-auto flex items-center justify-between gap-2">
        {/* Logo & App Name */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-[#8b5cf6] p-[1.5px]">
            <div className="w-full h-full bg-[#171e27] rounded-[9px] flex items-center justify-center text-lg">
              💸
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base font-extrabold tracking-tight text-white flex items-center gap-0.5">
                Uni<span className="text-gradient-purple font-black">Split</span>
              </h1>
              <span className="text-[10px] font-black tracking-wider px-1.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/40 shadow-sm">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
              <Sparkles size={11} className="text-amber-400 inline shrink-0" />
              <span className="truncate">
                {activeTab === 'salida' ? 'Gastos del parche' : activeTab === 'ruleta' ? 'Ruleta de la suerte' : activeTab === 'cuentas' ? 'Balance y deudas' : 'Cuentas del apartamento'}
              </span>
            </p>
          </div>
        </div>

        {/* Action Controls & Total */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Quick Ticket Generator Button */}
          <button
            onClick={() => {
              playClickSound();
              onOpenTicket();
            }}
            title="Generar Recibo"
            className="w-9 h-9 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/70 flex items-center justify-center text-slate-200 hover:text-white transition-all active:scale-95 shadow-sm"
          >
            <ReceiptText size={17} />
          </button>

          {/* Backup / Config Button */}
          <button
            onClick={() => {
              playClickSound();
              onOpenBackup();
            }}
            title="Ajustes y Backup"
            className="w-9 h-9 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/70 flex items-center justify-center text-slate-200 hover:text-white transition-all active:scale-95 shadow-sm"
          >
            <Settings2 size={17} />
          </button>

          {/* Total Badge */}
          <div className="py-1 px-2.5 rounded-xl bg-gradient-to-r from-violet-600/30 to-emerald-500/20 border border-violet-500/40 text-emerald-300 font-mono text-xs font-black shadow-inner flex items-center gap-1">
            <span className="text-[10px] text-slate-400 font-sans font-bold">Total</span>
            <span>{fmt(totalActual)}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
