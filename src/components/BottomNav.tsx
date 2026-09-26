import React from 'react';
import { Sparkles, Dices, Scale, Home, Flame } from 'lucide-react';
import { TabType } from '../types';
import { playClickSound } from '../utils/audio';

interface BottomNavProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
  deudasCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  deudasCount,
}) => {
  const tabs = [
    {
      id: 'salida' as TabType,
      label: 'Salidas',
      icon: Flame,
      emoji: '🍕',
      description: 'El Parche',
    },
    {
      id: 'cuentas' as TabType,
      label: 'Balances',
      icon: Scale,
      emoji: '💸',
      badge: deudasCount > 0 ? deudasCount : undefined,
      description: 'Nequi / Cobros',
    },
    {
      id: 'ruleta' as TabType,
      label: 'Ruleta',
      icon: Dices,
      emoji: '🎰',
      description: 'Quién paga',
    },
    {
      id: 'mensual' as TabType,
      label: 'Roomies',
      icon: Home,
      emoji: '🏠',
      description: 'Apto',
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 px-3 pb-[max(calc(8px+var(--safe-bottom)),12px)] pt-2 bg-[#090c15]/95 backdrop-blur-2xl border-t border-white/[0.08]">
      <div className="max-w-[480px] mx-auto grid grid-cols-4 gap-1.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => {
                playClickSound();
                onChangeTab(tab.id);
              }}
              className={`relative flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all duration-200 active:scale-95 ${
                isActive
                  ? 'bg-gradient-to-b from-indigo-500/15 to-transparent text-indigo-400 font-bold border border-indigo-500/25'
                  : 'text-zinc-500 hover:text-zinc-300 border border-transparent'
              }`}
            >
              {/* Badge for pending debts */}
              {tab.badge !== undefined && (
                <span className="absolute top-1.5 right-3 px-1.5 min-w-[18px] h-[18px] rounded-full bg-rose-500 text-white text-[10px] font-extrabold flex items-center justify-center shadow-lg shadow-rose-500/40 animate-pulse">
                  {tab.badge}
                </span>
              )}

              {/* Icon Container */}
              <div
                className={`transition-all duration-200 ${
                  isActive ? 'scale-110 -translate-y-0.5' : 'scale-100 opacity-80'
                }`}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 1.9} />
              </div>

              {/* Label */}
              <span className={`text-[11px] mt-1 tracking-tight leading-tight ${isActive ? 'font-bold text-white' : 'font-medium'}`}>
                {tab.label}
              </span>

              {/* Active Indicator Glow Dot */}
              {isActive && (
                <div className="w-1.5 h-1.5 rounded-full mt-0.5 bg-indigo-400 shadow-[0_0_8px_#818cf8]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
