import React from 'react';
import { Dices, Scale, Home, Flame } from 'lucide-react';
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
    },
    {
      id: 'cuentas' as TabType,
      label: 'Balances',
      icon: Scale,
      badge: deudasCount > 0 ? deudasCount : undefined,
    },
    {
      id: 'ruleta' as TabType,
      label: 'Ruleta',
      icon: Dices,
    },
    {
      id: 'mensual' as TabType,
      label: 'Roomies',
      icon: Home,
    },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 px-3 pb-[max(calc(8px+var(--safe-bottom)),12px)] pt-2 border-t border-white/[0.08]"
      style={{ background: 'var(--azul-overlay)', backdropFilter: 'blur(24px)' }}
    >
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
              className="relative flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all duration-200 active:scale-95"
              style={
                isActive
                  ? {
                      background: 'rgba(210,242,94,0.10)',
                      border: '1px solid rgba(210,242,94,0.22)',
                      color: '#D2F25E',
                    }
                  : {
                      background: 'transparent',
                      border: '1px solid transparent',
                      color: '#64748b',
                    }
              }
            >
              {/* Badge for pending debts */}
              {tab.badge !== undefined && (
                <span
                  className="absolute top-1.5 right-3 px-1.5 min-w-[18px] h-[18px] rounded-full text-white text-[10px] font-extrabold flex items-center justify-center animate-pulse"
                  style={{
                    background: '#F2A81D',
                    boxShadow: '0 0 8px rgba(242,168,29,0.5)',
                    color: '#0B2028',
                  }}
                >
                  {tab.badge}
                </span>
              )}

              {/* Icon */}
              <div
                className={`transition-all duration-200 ${
                  isActive ? 'scale-110 -translate-y-0.5' : 'scale-100 opacity-70'
                }`}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 1.9} />
              </div>

              {/* Label */}
              <span
                className={`text-[11px] mt-1 tracking-tight leading-tight ${
                  isActive ? 'font-bold' : 'font-medium'
                }`}
                style={isActive ? { color: '#D2F25E' } : {}}
              >
                {tab.label}
              </span>

              {/* Active dot */}
              {isActive && (
                <div
                  className="w-1.5 h-1.5 rounded-full mt-0.5"
                  style={{
                    background: '#D2F25E',
                    boxShadow: '0 0 6px rgba(210,242,94,0.8)',
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
