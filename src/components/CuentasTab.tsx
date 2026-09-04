import React, { useState } from 'react';
import {
  Scale,
  TrendingUp,
  ArrowRight,
  Share2,
  CheckCircle2,
  Trash2,
  Sparkles,
  ReceiptText,
  Copy,
  AlertTriangle,
} from 'lucide-react';
import { Persona, GastoMensual, GastoSalida, Deuda } from '../types';
import {
  fmt,
  getNombre,
  calcularDeudas,
  calcularResumenMensual,
  calcularResumenSalidas,
} from '../utils/calculations';
import { playClickSound, playWinSound } from '../utils/audio';
import { launchConfetti } from '../utils/confetti';
import { generarMensajeCobro, generarResumenCompleto, compartirPorWhatsApp } from '../utils/whatsapp';

interface CuentasTabProps {
  roomies: Persona[];
  gastosMensuales: GastoMensual[];
  contactos: Persona[];
  gastosSalida: GastoSalida[];
  onLimpiarMensual: () => void;
  onLimpiarSalidas: () => void;
  onOpenTicket: () => void;
}

export const CuentasTab: React.FC<CuentasTabProps> = ({
  roomies,
  gastosMensuales,
  contactos,
  gastosSalida,
  onLimpiarMensual,
  onLimpiarSalidas,
  onOpenTicket,
}) => {
  const [subTab, setSubTab] = useState<'mensual' | 'salida'>('mensual');
  const [confirmLimpiar, setConfirmLimpiar] = useState(false);
  const [copiadoIdx, setCopiadoIdx] = useState<number | null>(null);

  // Mensual calculations
  const totalMensual = gastosMensuales.reduce((s, g) => s + g.monto, 0);
  const deudasMensuales = calcularDeudas(gastosMensuales, roomies);
  const resumenMensual = calcularResumenMensual(gastosMensuales, roomies);
  const promedioMensual = roomies.length > 0 ? totalMensual / roomies.length : 0;

  // Salidas calculations
  const totalSalidas = gastosSalida.reduce((s, g) => s + g.monto, 0);
  const resumenSalidas = calcularResumenSalidas(gastosSalida, contactos);

  const copiarCobro = (deuda: Deuda, idx: number) => {
    playClickSound();
    const texto = generarMensajeCobro(deuda, roomies);
    navigator.clipboard.writeText(texto);
    setCopiadoIdx(idx);
    setTimeout(() => setCopiadoIdx(null), 2000);
  };

  const enviarWhatsAppCobro = (deuda: Deuda) => {
    playClickSound();
    const texto = generarMensajeCobro(deuda, roomies);
    compartirPorWhatsApp(texto);
  };

  const compartirResumenGrupo = () => {
    playClickSound();
    const texto = generarResumenCompleto(
      deudasMensuales,
      gastosMensuales,
      totalMensual,
      roomies
    );
    compartirPorWhatsApp(texto);
  };

  const handleSaldar = () => {
    playWinSound();
    launchConfetti();
    if (subTab === 'mensual') {
      onLimpiarMensual();
    } else {
      onLimpiarSalidas();
    }
    setConfirmLimpiar(false);
  };

  return (
    <div className="px-4 py-3 animate-fade-in space-y-4">
      {/* ── SUBTABS MENSUAL / SALIDAS ───────────────────────── */}
      <div className="grid grid-cols-2 gap-1.5 p-1 bg-white/[0.04] border border-white/[0.08] rounded-2xl">
        <button
          onClick={() => {
            playClickSound();
            setSubTab('mensual');
          }}
          className={`py-2 px-2 text-xs font-bold rounded-xl transition-all ${
            subTab === 'mensual'
              ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          🏠 Cuentas Apartamento
        </button>
        <button
          onClick={() => {
            playClickSound();
            setSubTab('salida');
          }}
          className={`py-2 px-2 text-xs font-bold rounded-xl transition-all ${
            subTab === 'salida'
              ? 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-md'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          🍕 Cuentas Salidas
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════════
          VISTA MENSUAL (APARTAMENTO)
      ══════════════════════════════════════════════════════════ */}
      {subTab === 'mensual' && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="glass-card p-3.5 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Total del Mes
              </span>
              <p className="text-xl font-mono font-extrabold text-emerald-400 tracking-tight">
                {fmt(totalMensual)}
              </p>
              <p className="text-[11px] text-zinc-400">
                {gastosMensuales.length} gasto{gastosMensuales.length !== 1 ? 's' : ''} registrado{gastosMensuales.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="glass-card p-3.5 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Promedio por Roomie
              </span>
              <p className="text-xl font-mono font-extrabold text-violet-400 tracking-tight">
                {fmt(promedioMensual)}
              </p>
              <p className="text-[11px] text-zinc-400">
                Entre {roomies.length} integrantes
              </p>
            </div>
          </div>

          {/* Quick Action: Share Full Month Summary to WhatsApp */}
          {gastosMensuales.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                onClick={compartirResumenGrupo}
                className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95"
              >
                <Share2 size={14} />
                Enviar Balance al Grupo de WhatsApp
              </button>

              <button
                onClick={() => {
                  playClickSound();
                  onOpenTicket();
                }}
                className="py-2.5 px-3 rounded-xl bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/40 text-violet-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95"
              >
                <ReceiptText size={14} />
                Ticket
              </button>
            </div>
          )}

          {/* ── TRANSFERENCIAS PENDIENTES (DEUDAS SIMPLIFICADAS) ── */}
          <section className="glass-card-glow p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Scale size={16} className="text-amber-400" />
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-white">
                  Transferencias Pendientes ({deudasMensuales.length})
                </h3>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 font-bold">
                Algoritmo Óptimo ⚡
              </span>
            </div>

            {gastosMensuales.length === 0 ? (
              <div className="py-6 text-center text-zinc-500">
                <span className="text-2xl mb-1 block">🏠</span>
                <p className="text-xs">No hay gastos en el apartamento aún.</p>
              </div>
            ) : deudasMensuales.length === 0 ? (
              <div className="py-6 text-center text-emerald-400 space-y-1">
                <CheckCircle2 size={32} className="mx-auto text-emerald-400 animate-bounce" />
                <p className="text-sm font-bold">¡Están a Paz y Salvo! 🎉</p>
                <p className="text-xs text-zinc-400">Nadie le debe a nadie en el apartamento.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {deudasMensuales.map((d, idx) => {
                  const deudorNombre = getNombre(d.de, roomies);
                  const acreedorNombre = getNombre(d.para, roomies);

                  return (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-black/30 border border-white/[0.08] flex flex-col gap-2.5"
                    >
                      <div className="flex items-center justify-between">
                        {/* Direction row */}
                        <div className="flex items-center gap-2 text-xs font-bold text-white">
                          <span className="px-2 py-1 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            {deudorNombre}
                          </span>
                          <ArrowRight size={14} className="text-zinc-500" />
                          <span className="px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            {acreedorNombre}
                          </span>
                        </div>

                        {/* Amount */}
                        <span className="text-base font-mono font-extrabold text-rose-400">
                          {fmt(d.monto)}
                        </span>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5 pt-1 border-t border-white/[0.05]">
                        <button
                          onClick={() => enviarWhatsAppCobro(d)}
                          className="flex-1 py-1.5 px-2.5 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/40 text-emerald-300 font-bold text-[11px] flex items-center justify-center gap-1 transition-all"
                        >
                          <Share2 size={12} />
                          Cobrar por WhatsApp
                        </button>

                        <button
                          onClick={() => copiarCobro(d, idx)}
                          className="py-1.5 px-2.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 text-[11px] flex items-center gap-1 transition-all"
                        >
                          <Copy size={12} />
                          {copiadoIdx === idx ? '¡Copiado!' : 'Copiar'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* ── BALANCES POR PERSONA ───────────────────────── */}
          <section className="glass-card p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Balance Detallado por Roomie
            </h3>

            <div className="space-y-2.5">
              {resumenMensual.map(p => {
                const maxVal = Math.max(
                  ...resumenMensual.map(x => Math.max(x.pago, x.debia)),
                  1
                );

                const isPositive = p.balance > 0.5;
                const isNegative = p.balance < -0.5;

                return (
                  <div key={p.id} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{p.avatar || '😎'}</span>
                        <span className="text-xs font-bold text-white">{p.nombre}</span>
                      </div>
                      <span
                        className={`text-xs font-mono font-extrabold ${
                          isPositive
                            ? 'text-emerald-400'
                            : isNegative
                            ? 'text-rose-400'
                            : 'text-zinc-400'
                        }`}
                      >
                        {isPositive ? `+${fmt(p.balance)}` : isNegative ? fmt(p.balance) : '$0'}
                      </span>
                    </div>

                    {/* Bars */}
                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      <div>
                        <div className="flex justify-between text-zinc-400 mb-0.5">
                          <span>Pagó:</span>
                          <span className="font-mono text-emerald-300 font-bold">{fmt(p.pago)}</span>
                        </div>
                        <div className="h-1.5 bg-black/40 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                            style={{ width: `${(p.pago / maxVal) * 100}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-zinc-400 mb-0.5">
                          <span>Le tocaba:</span>
                          <span className="font-mono text-violet-300 font-bold">{fmt(p.debia)}</span>
                        </div>
                        <div className="h-1.5 bg-black/40 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-violet-500 rounded-full transition-all duration-500"
                            style={{ width: `${(p.debia / maxVal) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ── BOTÓN SALDAR CUENTAS DEL MES ───────────────── */}
          {gastosMensuales.length > 0 && (
            <div className="pt-2">
              {!confirmLimpiar ? (
                <button
                  onClick={() => setConfirmLimpiar(true)}
                  className="w-full py-3 px-4 rounded-xl bg-rose-600/15 hover:bg-rose-600/25 border border-rose-500/30 text-rose-400 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-98"
                >
                  <Trash2 size={15} />
                  Saldar Cuentas del Mes (Paz y Salvo)
                </button>
              ) : (
                <div className="p-4 rounded-2xl bg-rose-950/50 border border-rose-500/40 text-center space-y-2.5 animate-pop-in">
                  <AlertTriangle className="mx-auto text-rose-400" size={24} />
                  <p className="text-xs font-bold text-white">
                    ¿Seguro que ya todos se pagaron las cuentas?
                  </p>
                  <p className="text-[11px] text-zinc-400">
                    Esto limpiará el registro de gastos mensuales para comenzar el nuevo mes.
                  </p>
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={handleSaldar}
                      className="flex-1 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs shadow-md"
                    >
                      Sí, dejar en $0
                    </button>
                    <button
                      onClick={() => setConfirmLimpiar(false)}
                      className="flex-1 py-2 rounded-xl bg-white/[0.08] text-zinc-300 font-semibold text-xs"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ══════════════════════════════════════════════════════════
          VISTA SALIDAS
      ══════════════════════════════════════════════════════════ */}
      {subTab === 'salida' && (
        <>
          {/* Stats Salidas */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="glass-card p-3.5 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Total en Salidas
              </span>
              <p className="text-xl font-mono font-extrabold text-cyan-400 tracking-tight">
                {fmt(totalSalidas)}
              </p>
              <p className="text-[11px] text-zinc-400">
                {gastosSalida.length} salida{gastosSalida.length !== 1 ? 's' : ''} registrada{gastosSalida.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="glass-card p-3.5 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                El Más Rumbero 👑
              </span>
              <p className="text-lg font-extrabold text-amber-400 tracking-tight truncate">
                {resumenSalidas.length > 0
                  ? resumenSalidas.sort((a, b) => b.total - a.total)[0]?.nombre
                  : 'N/A'}
              </p>
              <p className="text-[11px] text-zinc-400">Mayor gasto acumulado</p>
            </div>
          </div>

          {/* Ranking de Consumo en Salidas */}
          <section className="glass-card p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Gasto Acumulado por Amigo ({resumenSalidas.length})
            </h3>

            {resumenSalidas.length === 0 ? (
              <div className="py-6 text-center text-zinc-500">
                <span className="text-2xl mb-1 block">🍕</span>
                <p className="text-xs">No hay gastos de salidas registrados.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {resumenSalidas
                  .sort((a, b) => b.total - a.total)
                  .map((c, idx) => (
                    <div
                      key={c.id}
                      className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 text-center text-xs font-bold text-zinc-500">
                          #{idx + 1}
                        </span>
                        <span className="text-base">{c.avatar || '😎'}</span>
                        <div>
                          <p className="text-xs font-bold text-white">{c.nombre}</p>
                          <p className="text-[10px] text-zinc-500">
                            {c.participaciones} salida{c.participaciones !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold text-cyan-400">
                        {fmt(c.total)}
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </section>

          {/* Clean Outings Button */}
          {gastosSalida.length > 0 && (
            <div className="pt-2">
              {!confirmLimpiar ? (
                <button
                  onClick={() => setConfirmLimpiar(true)}
                  className="w-full py-3 px-4 rounded-xl bg-rose-600/15 hover:bg-rose-600/25 border border-rose-500/30 text-rose-400 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-98"
                >
                  <Trash2 size={15} />
                  Limpiar Registro de Salidas
                </button>
              ) : (
                <div className="p-4 rounded-2xl bg-rose-950/50 border border-rose-500/40 text-center space-y-2.5 animate-pop-in">
                  <AlertTriangle className="mx-auto text-rose-400" size={24} />
                  <p className="text-xs font-bold text-white">
                    ¿Seguro que deseas borrar el registro de salidas?
                  </p>
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={handleSaldar}
                      className="flex-1 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs shadow-md"
                    >
                      Sí, limpiar
                    </button>
                    <button
                      onClick={() => setConfirmLimpiar(false)}
                      className="flex-1 py-2 rounded-xl bg-white/[0.08] text-zinc-300 font-semibold text-xs"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};
