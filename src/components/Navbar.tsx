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
    <header className="sticky top-0 z-40 px-4 pt-3 pb-2 backdrop-blur-xl bg-[#090b11]/85 border-b border-white/[0.06]">
      <div className="max-w-[500px] mx-auto flex items-center justify-between">
        {/* Logo & App Name */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-400 p-[1.5px] shadow-lg shadow-violet-500/20">
            <div className="w-full h-full bg-[#0d111a] rounded-[14px] flex items-center justify-center text-lg">
              💸
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base font-extrabold tracking-tight text-white flex items-center gap-1">
                Uni<span className="text-gradient-purple">Split</span>
              </h1>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-violet-500/15 text-violet-400 border border-violet-500/30">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 flex items-center gap-1 font-medium">
              <Sparkles size={11} className="text-amber-400 inline" />
              {activeTab === 'salida' ? 'Gastos del parche' : activeTab === 'ruleta' ? 'Ruleta de la suerte' : activeTab === 'cuentas' ? 'Balance y deudas' : 'Cuentas del apartamento'}
            </p>
          </div>
        </div>

        {/* Action Controls & Total */}
        <div className="flex items-center gap-2">
          {/* Quick Ticket Generator Button */}
          <button
            onClick={() => {
              playClickSound();
              onOpenTicket();
            }}
            title="Generar Recibo"
            className="w-8 h-8 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] flex items-center justify-center text-zinc-300 hover:text-white transition-all active:scale-95"
          >
            <ReceiptText size={16} />
          </button>

          {/* Backup / Config Button */}
          <button
            onClick={() => {
              playClickSound();
              onOpenBackup();
            }}
            title="Ajustes y Backup"
            className="w-8 h-8 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] flex items-center justify-center text-zinc-300 hover:text-white transition-all active:scale-95"
          >
            <Settings2 size={16} />
          </button>

          {/* Total Badge */}
          <div className="py-1 px-3 rounded-full bg-gradient-to-r from-violet-600/30 to-emerald-500/30 border border-violet-500/40 text-white font-mono text-xs font-bold shadow-inner">
            {fmt(totalActual)}
          </div>
        </div>
      </div>
    </header>
  );
};
