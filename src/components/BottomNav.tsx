import React from 'react';
import { Home, Pizza, Dices, Scale } from 'lucide-react';
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
    { id: 'mensual' as TabType, label: 'Apartamento', icon: Home, emoji: '🏠' },
    { id: 'salida' as TabType, label: 'Salidas', icon: Pizza, emoji: '🍕' },
    { id: 'ruleta' as TabType, label: 'Ruleta', icon: Dices, emoji: '🎰', highlight: true },
    { id: 'cuentas' as TabType, label: 'Balances', icon: Scale, emoji: '⚖️', badge: deudasCount > 0 ? deudasCount : undefined },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 px-3 pb-[calc(10px+var(--safe-bottom))] pt-2 bg-[#0d111a]/95 backdrop-blur-2xl border-t border-white/[0.08]">
      <div className="max-w-[480px] mx-auto grid grid-cols-4 gap-1">
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
              className={`relative flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all duration-200 ${
                isActive
                  ? tab.highlight
                    ? 'bg-gradient-to-tr from-amber-500/20 to-rose-500/20 text-amber-300 font-bold'
                    : 'bg-violet-600/15 text-violet-300 font-bold border border-violet-500/30'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {/* Badge for pending debts */}
              {tab.badge !== undefined && (
                <span className="absolute top-1 right-2.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center shadow-lg shadow-rose-500/50 animate-pulse">
                  {tab.badge}
                </span>
              )}

              {/* Icon */}
              <div
                className={`transition-transform duration-200 ${
                  isActive ? 'scale-110 -translate-y-0.5' : 'scale-100'
                }`}
              >
                {tab.highlight ? (
                  <span className="text-xl leading-none">{tab.emoji}</span>
                ) : (
                  <Icon size={20} strokeWidth={isActive ? 2.4 : 1.8} />
                )}
              </div>

              {/* Label */}
              <span className="text-[11px] mt-1 font-medium tracking-tight">
                {tab.label}
              </span>

              {/* Active Dot Indicator */}
              {isActive && (
                <div
                  className={`w-1 h-1 rounded-full mt-0.5 ${
                    tab.highlight ? 'bg-amber-400 shadow-[0_0_8px_#fbbf24]' : 'bg-violet-400 shadow-[0_0_8px_#a78bfa]'
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
