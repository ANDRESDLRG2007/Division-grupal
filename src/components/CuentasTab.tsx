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
import { Accordion } from './Accordion';
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
    <div className="px-5 py-6 animate-fade-in space-y-6 page-content">
      {/* ── SUBTABS MENSUAL / SALIDAS ───────────────────────── */}
      <div className="grid grid-cols-2 gap-2 p-1.5 bg-[#12192b] border-2 border-slate-700/80 rounded-2xl shadow-md">
        <button
          onClick={() => {
            playClickSound();
            setSubTab('mensual');
          }}
          className={`py-2.5 px-3 text-xs font-black rounded-xl transition-all active:scale-95 ${
            subTab === 'mensual'
              ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-600/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          🏠 Cuentas Apartamento
        </button>
        <button
          onClick={() => {
            playClickSound();
            setSubTab('salida');
          }}
          className={`py-2.5 px-3 text-xs font-black rounded-xl transition-all active:scale-95 ${
            subTab === 'salida'
              ? 'bg-gradient-to-r from-cyan-600 to-teal-600 text-slate-950 font-black shadow-md shadow-cyan-600/30'
              : 'text-slate-400 hover:text-white'
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
          <div className="grid grid-cols-2 gap-3 balance-stats">
            <div className="glass-card p-4 balance-stat">
              <span className="text-sm font-semibold tracking-wide text-slate-400">
                Total del Mes
              </span>
              <p className="text-base font-medium text-emerald-400 font-mono mt-2">
                {fmt(totalMensual)}
              </p>
              <p className="text-xs text-slate-300 font-medium mt-1">
                {gastosMensuales.length} gasto{gastosMensuales.length !== 1 ? 's' : ''} registrado{gastosMensuales.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="glass-card p-4 balance-stat">
              <span className="text-sm font-semibold tracking-wide text-slate-400">
                Promedio por Roomie
              </span>
              <p className="text-base font-medium text-violet-400 font-mono mt-2">
                {fmt(promedioMensual)}
              </p>
              <p className="text-xs text-slate-300 font-medium mt-1">
                Entre {roomies.length} integrantes
              </p>
            </div>
          </div>

          {/* Quick Action: Share Full Month Summary to WhatsApp */}
          {gastosMensuales.length > 0 && (
            <div className="flex items-center gap-3 p-4">
              <button
                onClick={compartirResumenGrupo}
                className="flex-1 py-3 px-3 rounded-2xl bg-emerald-600/25 hover:bg-emerald-600/35 border-2 border-emerald-500/50 text-emerald-300 font-black text-xs flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md"
              >
                <Share2 size={16} />
                Enviar Balance al WhatsApp del Apto
              </button>

              <button
                onClick={() => {
                  playClickSound();
                  onOpenTicket();
                }}
                className="py-3 px-3.5 rounded-2xl bg-violet-600/25 hover:bg-violet-600/35 border-2 border-violet-500/50 text-violet-300 font-black text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-md"
              >
                <ReceiptText size={16} />
                Ticket
              </button>
            </div>
          )}

          {/* ── TRANSFERENCIAS PENDIENTES (DEUDAS SIMPLIFICADAS) ── */}
          <section className="glass-card-glow p-4 transferencias-panel">
            <Accordion
              title={<span className="text-sm font-semibold tracking-wide text-slate-200">Transferencias pendientes</span>}
              leading={<Scale size={18} className="text-amber-400" />}
              trailing={
                <span className="text-xs font-medium text-slate-400">
                  {deudasMensuales.length}
                </span>
              }
            >
              <div className="border-t border-white/[0.08] pt-3.5 space-y-3.5">
                <p className="text-xs text-slate-400">Algoritmo óptimo para saldar el grupo.</p>

            {gastosMensuales.length === 0 ? (
              <div className="py-8 text-center text-slate-400">
                <span className="text-3xl mb-2 block">🏠</span>
                <p className="text-xs font-bold text-white">No hay gastos en el apartamento aún</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Registra arriendo o servicios en la pestaña Apartamento.</p>
              </div>
            ) : deudasMensuales.length === 0 ? (
              <div className="py-8 text-center text-emerald-400 space-y-2">
                <CheckCircle2 size={36} className="mx-auto text-emerald-400" />
                <p className="text-sm font-black text-white">¡Están a Paz y Salvo! 🎉</p>
                <p className="text-xs text-slate-300">Nadie le debe a nadie en el apartamento.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {deudasMensuales.map((d, idx) => {
                  const deudorNombre = getNombre(d.de, roomies);
                  const acreedorNombre = getNombre(d.para, roomies);

                  return (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-[#101626] border-2 border-slate-700/80 shadow-md flex flex-col gap-3"
                    >
                      <div className="flex items-center justify-between">
                        {/* Direction row */}
                        <div className="flex items-center gap-2 text-xs font-extrabold text-white">
                          <span className="px-2.5 py-1 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm">
                            {deudorNombre}
                          </span>
                          <ArrowRight size={15} className="text-slate-400 stroke-[3]" />
                          <span className="px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm">
                            {acreedorNombre}
                          </span>
                        </div>

                        {/* Amount */}
                        <span className="text-base font-mono font-black text-rose-400 bg-rose-500/10 border border-rose-500/30 px-2.5 py-1 rounded-xl">
                          {fmt(d.monto)}
                        </span>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                        <button
                          onClick={() => enviarWhatsAppCobro(d)}
                          className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-md shadow-emerald-600/30"
                        >
                          <Share2 size={13} />
                          Cobrar por WhatsApp
                        </button>

                        <button
                          onClick={() => copiarCobro(d, idx)}
                          className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1 transition-all active:scale-95 shadow-sm"
                        >
                          <Copy size={13} />
                          {copiadoIdx === idx ? '¡Copiado!' : 'Copiar'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
              </div>
            </Accordion>
          </section>

          {/* ── BALANCES POR PERSONA ───────────────────────── */}
          <section className="glass-card p-4 space-y-4 border border-slate-700/80 shadow-md">
            <h3 className="text-sm font-semibold tracking-wide text-slate-400">
              Balance Detallado por Roomie
            </h3>

            <div className="space-y-2">
              {resumenMensual.map(p => {
                const maxVal = Math.max(
                  ...resumenMensual.map(x => Math.max(x.pago, x.debia)),
                  1
                );

                const isPositive = p.balance > 0.5;
                const isNegative = p.balance < -0.5;

                return (
                  <Accordion
                    key={p.id}
                    className="balance-person-row p-3 rounded-2xl bg-[#111728] border border-slate-700/80"
                    title={
                      <span className="text-base font-medium text-white flex items-center gap-2">
                        <span className="text-lg">{p.avatar || '😎'}</span>
                        {p.nombre}
                      </span>
                    }
                    trailing={
                      <span
                        className={`text-xs font-mono font-semibold px-2.5 py-1 rounded-xl border ${
                          isPositive
                            ? 'text-emerald-300 bg-emerald-500/15 border-emerald-500/30'
                            : isNegative
                            ? 'text-rose-300 bg-rose-500/15 border-rose-500/30'
                            : 'text-slate-400 bg-slate-800 border-slate-700'
                        }`}
                      >
                        {isPositive ? `+${fmt(p.balance)}` : isNegative ? fmt(p.balance) : '$0'}
                      </span>
                    }
                  >
                    {/* Bars */}
                    <div className="grid grid-cols-2 gap-2.5 text-xs border-t border-slate-700/80 pt-3">
                      <div>
                        <div className="flex justify-between text-slate-400 mb-1 text-[11px] font-bold">
                          <span>Pagó:</span>
                          <span className="font-mono text-emerald-400 font-black">{fmt(p.pago)}</span>
                        </div>
                        <div className="h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                          <div
                            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                            style={{ width: `${(p.pago / maxVal) * 100}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-slate-400 mb-1 text-[11px] font-bold">
                          <span>Le tocaba:</span>
                          <span className="font-mono text-violet-400 font-black">{fmt(p.debia)}</span>
                        </div>
                        <div className="h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                          <div
                            className="h-full bg-violet-500 rounded-full transition-all duration-500"
                            style={{ width: `${(p.debia / maxVal) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </Accordion>
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
                  className="w-full py-3.5 px-4 rounded-2xl bg-rose-600/15 hover:bg-rose-600/25 border-2 border-rose-500/40 text-rose-300 font-black text-xs flex items-center justify-center gap-2 transition-all active:scale-98 shadow-sm"
                >
                  <Trash2 size={16} />
                  Saldar Cuentas del Mes (Paz y Salvo)
                </button>
              ) : (
                <div className="p-4 rounded-2xl bg-rose-950/70 border-2 border-rose-500/60 text-center space-y-3 animate-pop-in shadow-xl">
                  <AlertTriangle className="mx-auto text-rose-400" size={28} />
                  <p className="text-sm font-black text-white">
                    ¿Seguro que ya todos se pagaron las cuentas?
                  </p>
                  <p className="text-xs text-slate-300 font-medium">
                    Esto limpiará el registro de gastos mensuales para comenzar el nuevo mes en $0.
                  </p>
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={handleSaldar}
                      className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs shadow-md shadow-rose-600/40"
                    >
                      Sí, dejar en $0
                    </button>
                    <button
                      onClick={() => setConfirmLimpiar(false)}
                      className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700"
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
          <div className="grid grid-cols-2 gap-3">
            <div className="glass-card p-4 space-y-1.5 border border-slate-700/80 shadow-md">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Total en Salidas
              </span>
              <p className="text-xl font-mono font-black text-cyan-400 tracking-tight">
                {fmt(totalSalidas)}
              </p>
              <p className="text-xs text-slate-300 font-medium">
                {gastosSalida.length} salida{gastosSalida.length !== 1 ? 's' : ''} registrada{gastosSalida.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="glass-card p-4 space-y-1.5 border border-slate-700/80 shadow-md">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                El Más Rumbero 👑
              </span>
              <p className="text-lg font-black text-amber-400 tracking-tight truncate">
                {resumenSalidas.length > 0
                  ? resumenSalidas.sort((a, b) => b.total - a.total)[0]?.nombre
                  : 'N/A'}
              </p>
              <p className="text-xs text-slate-300 font-medium">Mayor gasto acumulado</p>
            </div>
          </div>

          {/* Ranking de Consumo en Salidas */}
          <section className="glass-card p-4 space-y-4 border border-slate-700/80 shadow-md">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-300">
              Gasto Acumulado por Amigo ({resumenSalidas.length})
            </h3>

            {resumenSalidas.length === 0 ? (
              <div className="py-8 text-center text-slate-400">
                <span className="text-3xl mb-2 block">🍕</span>
                <p className="text-xs font-bold text-white">No hay gastos de salidas registrados</p>
              </div>
            ) : (
              <div className="space-y-2">
                {resumenSalidas
                  .sort((a, b) => b.total - a.total)
                  .map((c, idx) => (
                    <div
                      key={c.id}
                      className="p-3 rounded-2xl bg-[#111728] border border-slate-700/80 flex items-center justify-between shadow-sm"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 text-center text-xs font-black text-amber-400 bg-amber-400/10 border border-amber-400/30 rounded-lg py-0.5">
                          #{idx + 1}
                        </span>
                        <span className="text-lg bg-slate-800 p-1 rounded-xl">{c.avatar || '😎'}</span>
                        <div>
                          <p className="text-xs font-black text-white">{c.nombre}</p>
                          <p className="text-[11px] text-slate-400 font-semibold">
                            {c.participaciones} salida{c.participaciones !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      <span className="text-sm font-mono font-black text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-1 rounded-xl">
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
                  className="w-full py-3.5 px-4 rounded-2xl bg-rose-600/15 hover:bg-rose-600/25 border-2 border-rose-500/40 text-rose-300 font-black text-xs flex items-center justify-center gap-2 transition-all active:scale-98 shadow-sm"
                >
                  <Trash2 size={16} />
                  Limpiar Registro de Salidas
                </button>
              ) : (
                <div className="p-4 rounded-2xl bg-rose-950/70 border-2 border-rose-500/60 text-center space-y-3 animate-pop-in shadow-xl">
                  <AlertTriangle className="mx-auto text-rose-400" size={28} />
                  <p className="text-sm font-black text-white">
                    ¿Seguro que deseas borrar el registro de salidas?
                  </p>
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={handleSaldar}
                      className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs shadow-md shadow-rose-600/40"
                    >
                      Sí, limpiar
                    </button>
                    <button
                      onClick={() => setConfirmLimpiar(false)}
                      className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700"
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
