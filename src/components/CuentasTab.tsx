import React, { useState } from 'react';
import {
  Scale,
  ArrowRight,
  Share2,
  CheckCircle2,
  Trash2,
  ReceiptText,
  Copy,
  AlertTriangle,
  Zap,
  Send,
} from 'lucide-react';
import { Accordion } from './Accordion';
import { Persona, GastoMensual, GastoSalida, Deuda } from '../types';
import {
  fmt,
  getNombre,
  calcularDeudas,
  calcularDeudasSalida,
  calcularResumenMensual,
  calcularResumenSalidas,
} from '../utils/calculations';
import { playClickSound, playWinSound } from '../utils/audio';
import { launchConfetti } from '../utils/confetti';
import {
  generarMensajeCobro,
  generarMensajeCobroSalida,
  generarResumenSalidas,
  generarResumenCompleto,
  compartirPorWhatsApp,
} from '../utils/whatsapp';

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
  const [subTab, setSubTab] = useState<'salida' | 'mensual'>('salida');
  const [confirmLimpiar, setConfirmLimpiar] = useState(false);
  const [copiadoIdx, setCopiadoIdx] = useState<number | null>(null);

  // Salidas calculations
  const totalSalidas = gastosSalida.reduce((s, g) => s + g.monto, 0);
  const deudasSalida = calcularDeudasSalida(gastosSalida, contactos);
  const resumenSalidas = calcularResumenSalidas(gastosSalida, contactos);

  // Mensual calculations
  const totalMensual = gastosMensuales.reduce((s, g) => s + g.monto, 0);
  const deudasMensuales = calcularDeudas(gastosMensuales, roomies);
  const resumenMensual = calcularResumenMensual(gastosMensuales, roomies);
  const promedioMensual = roomies.length > 0 ? totalMensual / roomies.length : 0;

  // Actions
  const enviarCobroSalida = (deuda: Deuda) => {
    playClickSound();
    const texto = generarMensajeCobroSalida(deuda, contactos);
    compartirPorWhatsApp(texto);
  };

  const copiarCobroSalida = (deuda: Deuda, idx: number) => {
    playClickSound();
    const texto = generarMensajeCobroSalida(deuda, contactos);
    navigator.clipboard.writeText(texto);
    setCopiadoIdx(idx);
    setTimeout(() => setCopiadoIdx(null), 2000);
  };

  const compartirResumenSalidasGrupo = () => {
    playClickSound();
    const texto = generarResumenSalidas(
      deudasSalida,
      gastosSalida.map((g) => ({ descripcion: g.descripcion, monto: g.monto })),
      totalSalidas,
      contactos
    );
    compartirPorWhatsApp(texto);
  };

  const enviarCobroMensual = (deuda: Deuda) => {
    playClickSound();
    const texto = generarMensajeCobro(deuda, roomies);
    compartirPorWhatsApp(texto);
  };

  const copiarCobroMensual = (deuda: Deuda, idx: number) => {
    playClickSound();
    const texto = generarMensajeCobro(deuda, roomies);
    navigator.clipboard.writeText(texto);
    setCopiadoIdx(idx);
    setTimeout(() => setCopiadoIdx(null), 2000);
  };

  const compartirResumenMensualGrupo = () => {
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
    if (subTab === 'salida') {
      onLimpiarSalidas();
    } else {
      onLimpiarMensual();
    }
    setConfirmLimpiar(false);
  };

  return (
<<<<<<< HEAD
    <div className="px-4 pt-3 pb-8 flex flex-col gap-5 animate-fade-in max-w-[480px] mx-auto">
      {/* ── SELECTOR: SALIDAS VS APARTAMENTO ───────────────── */}
      <div className="grid grid-cols-2 gap-1.5 p-1.5 bg-[#121826] border border-white/[0.08] rounded-2xl">
=======
    <div className="py-6 animate-fade-in space-y-6 page-content">
      {/* ── SUBTABS MENSUAL / SALIDAS ───────────────────────── */}
      <div className="grid grid-cols-2 gap-2 p-1.5 bg-[#1b2530] border border-[#3a4858] rounded-2xl shadow-md">
        <button
          onClick={() => {
            playClickSound();
            setSubTab('mensual');
          }}
          className={`py-2.5 px-3 text-sm font-semibold rounded-xl transition-all active:scale-95 ${
            subTab === 'mensual'
              ? 'bg-violet-600 text-white'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          🏠 Cuentas Apartamento
        </button>
>>>>>>> ae824147ff56f4e377b864695131bb809be1795c
        <button
          onClick={() => {
            playClickSound();
            setSubTab('salida');
          }}
<<<<<<< HEAD
          className={`py-2 px-3 text-xs font-extrabold rounded-xl transition-all active:scale-95 flex items-center justify-center gap-1.5 ${
            subTab === 'salida'
              ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-600/30'
              : 'text-zinc-400 hover:text-white'
=======
          className={`py-2.5 px-3 text-sm font-semibold rounded-xl transition-all active:scale-95 ${
            subTab === 'salida'
              ? 'bg-violet-600 text-white'
              : 'text-slate-400 hover:text-white'
>>>>>>> ae824147ff56f4e377b864695131bb809be1795c
          }`}
        >
          <span>🍕</span> Salidas del Parche
        </button>

        <button
          onClick={() => {
            playClickSound();
            setSubTab('mensual');
          }}
          className={`py-2 px-3 text-xs font-extrabold rounded-xl transition-all active:scale-95 flex items-center justify-center gap-1.5 ${
            subTab === 'mensual'
              ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-600/30'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <span>🏠</span> Apartamento
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════════
          VISTA 1: SALIDAS DEL PARCHE (PRINCIPAL)
      ══════════════════════════════════════════════════════════ */}
<<<<<<< HEAD
      {subTab === 'salida' && (
        <>
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="card-glass p-4 flex flex-col gap-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Total Salidas
              </span>
              <p className="text-2xl font-mono font-black text-emerald-400 tracking-tight">
                {fmt(totalSalidas)}
              </p>
              <p className="text-[11px] text-zinc-400">
                {gastosSalida.length} gasto{gastosSalida.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="card-glass p-4 flex flex-col gap-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Por Liquidar
              </span>
              <p className="text-2xl font-mono font-black text-indigo-400 tracking-tight">
                {deudasSalida.length}
              </p>
              <p className="text-[11px] text-zinc-400">
                Transferencia{deudasSalida.length !== 1 ? 's' : ''} pendiente{deudasSalida.length !== 1 ? 's' : ''}
=======
      {subTab === 'mensual' && (
        <div className="space-y-5">
          {/* Stats Cards */}
          <section className="space-y-3" aria-label="Resumen del apartamento">
            <h2 className="text-sm font-semibold tracking-wide text-slate-400">Resumen del apartamento</h2>
            <div className="grid grid-cols-2 gap-3 balance-stats">
            <div className="glass-card !bg-[#1b2530] p-4 balance-stat">
              <span className="text-sm font-semibold tracking-wide text-slate-400">
                Total del Mes
              </span>
              <p className="text-xl font-semibold text-emerald-400 font-mono mt-2">
                {fmt(totalMensual)}
              </p>
              <p className="text-xs text-slate-300 font-medium mt-1">
                {gastosMensuales.length} gasto{gastosMensuales.length !== 1 ? 's' : ''} registrado{gastosMensuales.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="glass-card !bg-[#1b2530] p-4 balance-stat">
              <span className="text-sm font-semibold tracking-wide text-slate-400">
                Promedio por Roomie
              </span>
              <p className="text-xl font-semibold text-violet-400 font-mono mt-2">
                {fmt(promedioMensual)}
              </p>
              <p className="text-xs text-slate-300 font-medium mt-1">
                Entre {roomies.length} integrantes
>>>>>>> ae824147ff56f4e377b864695131bb809be1795c
              </p>
            </div>
          </div>
          </section>

<<<<<<< HEAD
          {/* Action Row */}
          {gastosSalida.length > 0 && (
            <div className="flex items-center gap-2">
=======
          {/* Quick Action: Share Full Month Summary to WhatsApp */}
          {gastosMensuales.length > 0 && (
            <section className="space-y-2" aria-label="Acciones del balance">
              <h2 className="text-sm font-semibold tracking-wide text-slate-400">Acciones del balance</h2>
              <div className="flex items-center gap-3 p-4">
>>>>>>> ae824147ff56f4e377b864695131bb809be1795c
              <button
                onClick={compartirResumenSalidasGrupo}
                className="flex-1 py-3 px-3 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/25 text-emerald-300 font-extrabold text-xs flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <Share2 size={15} />
                Enviar Resumen al WhatsApp
              </button>

              <button
                onClick={() => {
                  playClickSound();
                  onOpenTicket();
                }}
                className="btn-secondary !rounded-2xl !py-3"
              >
                <ReceiptText size={15} />
                Ticket
              </button>
              </div>
            </section>
          )}

<<<<<<< HEAD
          {/* Transferencias Pendientes */}
          <section className="card-glass p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap size={16} className="text-indigo-400" />
                <h3 className="text-xs font-black uppercase tracking-wider text-white">
                  Transferencias Pendientes ({deudasSalida.length})
                </h3>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 font-bold border border-emerald-500/25">
                Cuentas Claras ⚡
              </span>
            </div>
=======
          {/* ── TRANSFERENCIAS PENDIENTES (DEUDAS SIMPLIFICADAS) ── */}
          <section className="glass-card-glow p-4 transferencias-panel">
            <Accordion
              title={<span className="text-base font-semibold tracking-wide text-slate-200">Transferencias pendientes</span>}
              leading={<Scale size={18} className="text-amber-400" />}
              trailing={
                <span className="text-xs font-medium text-slate-400">
                  {deudasMensuales.length}
                </span>
              }
            >
              <div className="border-t border-white/[0.08] pt-3.5 space-y-3.5">
                <p className="text-xs text-slate-400">Algoritmo óptimo para saldar el grupo.</p>
>>>>>>> ae824147ff56f4e377b864695131bb809be1795c

            {gastosSalida.length === 0 ? (
              <div className="py-8 text-center flex flex-col items-center gap-1.5">
                <span className="text-3xl block">🍕</span>
                <p className="text-xs font-bold text-white">No hay salidas registradas aún</p>
                <p className="text-[11px] text-zinc-400">
                  Registra un gasto en la pestaña Salidas para ver quién le debe a quién.
                </p>
              </div>
            ) : deudasSalida.length === 0 ? (
              <div className="py-8 text-center flex flex-col items-center gap-2">
                <CheckCircle2 size={32} className="text-emerald-400" />
                <p className="text-sm font-bold text-white">¡Nadie le debe a nadie! 🎉</p>
                <p className="text-xs text-zinc-400">Todo el parche está a paz y salvo.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {deudasSalida.map((d, idx) => {
                  const deudorNombre = getNombre(d.de, contactos);
                  const acreedorNombre = getNombre(d.para, contactos);

                  return (
                    <div
                      key={idx}
<<<<<<< HEAD
                      className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex flex-col gap-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-extrabold text-white">
                          <span className="px-2.5 py-1 rounded-xl bg-rose-500/10 text-rose-300 border border-rose-500/20">
=======
                      className="p-3.5 rounded-2xl bg-[#263442] border border-[#3a4858] shadow-md flex flex-col gap-3"
                    >
                      <div className="flex items-center justify-between">
                        {/* Direction row */}
                        <div className="flex items-center gap-2 text-sm font-semibold text-white">
                          <span className="px-2.5 py-1 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm">
>>>>>>> ae824147ff56f4e377b864695131bb809be1795c
                            {deudorNombre}
                          </span>
                          <ArrowRight size={13} className="text-zinc-500 stroke-[3]" />
                          <span className="px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                            {acreedorNombre}
                          </span>
                        </div>

<<<<<<< HEAD
                        <span className="text-sm font-mono font-black text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded-xl">
=======
                        {/* Amount */}
                        <span className="text-xl font-mono font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/30 px-2.5 py-1 rounded-xl">
>>>>>>> ae824147ff56f4e377b864695131bb809be1795c
                          {fmt(d.monto)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-white/[0.05]">
                        <button
                          onClick={() => enviarCobroSalida(d)}
                          className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95"
                        >
                          <Send size={13} />
                          Cobrar por WhatsApp
                        </button>

                        <button
                          onClick={() => copiarCobroSalida(d, idx)}
                          className="btn-secondary !py-2 !px-3 !text-xs !rounded-xl"
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

<<<<<<< HEAD
          {/* Consumo por Amigo */}
          <section className="card-glass p-5 flex flex-col gap-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400">
              Consumo Total por Amigo ({resumenSalidas.length})
            </h3>

            {resumenSalidas.length === 0 ? (
              <p className="text-xs text-zinc-500 text-center py-4">Sin datos de salidas</p>
            ) : (
              <div className="flex flex-col gap-2">
                {resumenSalidas
                  .sort((a, b) => b.total - a.total)
                  .map((c, idx) => (
                    <div
                      key={c.id}
                      className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 text-center text-xs font-mono font-bold text-indigo-400">
                          #{idx + 1}
                        </span>
                        <span className="text-lg">{c.avatar || '😎'}</span>
                        <div>
                          <p className="text-xs font-bold text-white">{c.nombre}</p>
                          <p className="text-[10px] text-zinc-400">
                            {c.participaciones} consumo{c.participaciones !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>

                      <span className="text-xs font-mono font-bold text-emerald-400">
                        {fmt(c.total)}
                      </span>
                    </div>
                  ))}
              </div>
            )}
=======
          {/* ── BALANCES POR PERSONA ───────────────────────── */}
          <section className="glass-card p-4 space-y-4 border border-slate-700/80 shadow-md">
            <h3 className="text-base font-semibold tracking-wide text-slate-300">
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
                    className="balance-person-row p-3 rounded-2xl bg-[#1b2530] border border-[#3a4858]"
                    title={
                      <span className="text-base font-medium text-white flex items-center gap-3">
                        <span className="text-lg">{p.avatar || '😎'}</span>
                        {p.nombre}
                      </span>
                    }
                    trailing={
                      <span
                        className={`text-sm font-mono font-semibold px-2.5 py-1 rounded-xl border ${
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
>>>>>>> ae824147ff56f4e377b864695131bb809be1795c
          </section>

          {/* Botón Saldar Salidas */}
          {gastosSalida.length > 0 && (
            <div>
              {!confirmLimpiar ? (
                <button
                  onClick={() => setConfirmLimpiar(true)}
                  className="w-full py-3.5 px-4 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 text-rose-300 font-extrabold text-xs flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <Trash2 size={15} />
                  Saldar Cuentas de la Salida (Dejar en $0)
                </button>
              ) : (
                <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-center flex flex-col gap-3 animate-fade-in">
                  <AlertTriangle className="mx-auto text-rose-400" size={24} />
                  <p className="text-xs font-bold text-white">
                    ¿Seguro que ya todos pagaron su parte de la salida?
                  </p>
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={handleSaldar}
                      className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs"
                    >
                      Sí, dejar en $0
                    </button>
                    <button
                      onClick={() => setConfirmLimpiar(false)}
                      className="flex-1 py-2.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.12] text-zinc-200 font-semibold text-xs"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          VISTA 2: APARTAMENTO (SECUNDARIO)
      ══════════════════════════════════════════════════════════ */}
<<<<<<< HEAD
      {subTab === 'mensual' && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div className="card-glass p-4 flex flex-col gap-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Total Mes Apto
              </span>
              <p className="text-2xl font-mono font-black text-emerald-400 tracking-tight">
                {fmt(totalMensual)}
=======
      {subTab === 'salida' && (
        <div className="space-y-5">
          {/* Stats Salidas */}
          <section className="space-y-3" aria-label="Resumen de salidas">
            <h2 className="text-sm font-semibold tracking-wide text-slate-400">Resumen de salidas</h2>
            <div className="grid grid-cols-2 gap-3">
            <div className="glass-card !bg-[#1b2530] p-4 space-y-1.5 border border-[#3a4858] shadow-md">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Total en Salidas
              </span>
              <p className="text-xl font-semibold font-mono text-emerald-400 tracking-tight">
                {fmt(totalSalidas)}
>>>>>>> ae824147ff56f4e377b864695131bb809be1795c
              </p>
              <p className="text-[11px] text-zinc-400">
                {gastosMensuales.length} gasto{gastosMensuales.length !== 1 ? 's' : ''}
              </p>
            </div>

<<<<<<< HEAD
            <div className="card-glass p-4 flex flex-col gap-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Promedio Roomie
              </span>
              <p className="text-2xl font-mono font-black text-indigo-400 tracking-tight">
                {fmt(promedioMensual)}
              </p>
              <p className="text-[11px] text-zinc-400">
                Entre {roomies.length} roomies
=======
            <div className="glass-card !bg-[#1b2530] p-4 space-y-1.5 border border-[#3a4858] shadow-md">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                El Más Rumbero 👑
              </span>
              <p className="text-xl font-semibold text-violet-300 tracking-tight truncate">
                {resumenSalidas.length > 0
                  ? resumenSalidas.sort((a, b) => b.total - a.total)[0]?.nombre
                  : 'N/A'}
>>>>>>> ae824147ff56f4e377b864695131bb809be1795c
              </p>
            </div>
            </div>
          </section>

<<<<<<< HEAD
          {gastosMensuales.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                onClick={compartirResumenMensualGrupo}
                className="flex-1 py-3 px-3 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/25 text-emerald-300 font-extrabold text-xs flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <Share2 size={15} />
                Enviar Balance al WhatsApp del Apto
              </button>
=======
          {/* Ranking de Consumo en Salidas */}
          <section className="space-y-3" aria-label="Ranking de salidas">
            <h2 className="text-sm font-semibold tracking-wide text-slate-400">Ranking de consumo</h2>
>>>>>>> ae824147ff56f4e377b864695131bb809be1795c

              <button
                onClick={() => {
                  playClickSound();
                  onOpenTicket();
                }}
                className="btn-secondary !rounded-2xl !py-3"
              >
                <ReceiptText size={15} />
                Ticket
              </button>
            </div>
          )}

          {/* Transferencias Roomies */}
          <section className="card-glass p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Scale size={16} className="text-indigo-400" />
                <h3 className="text-xs font-black uppercase tracking-wider text-white">
                  Transferencias Apto ({deudasMensuales.length})
                </h3>
              </div>
            </div>

            {gastosMensuales.length === 0 ? (
              <div className="py-8 text-center flex flex-col items-center gap-1">
                <span className="text-3xl block">🏠</span>
                <p className="text-xs font-bold text-white">No hay gastos del apartamento aún</p>
                <p className="text-[11px] text-zinc-400">
                  Registra el arriendo o servicios en la pestaña Roomies.
                </p>
              </div>
            ) : deudasMensuales.length === 0 ? (
              <div className="py-8 text-center flex flex-col items-center gap-2">
                <CheckCircle2 size={32} className="text-emerald-400" />
                <p className="text-sm font-bold text-white">¡Apto a Paz y Salvo! 🎉</p>
              </div>
            ) : (
<<<<<<< HEAD
              <div className="flex flex-col gap-2.5">
                {deudasMensuales.map((d, idx) => {
                  const deudorNombre = getNombre(d.de, roomies);
                  const acreedorNombre = getNombre(d.para, roomies);

                  return (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex flex-col gap-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-extrabold text-white">
                          <span className="px-2.5 py-1 rounded-xl bg-rose-500/10 text-rose-300 border border-rose-500/20">
                            {deudorNombre}
                          </span>
                          <ArrowRight size={13} className="text-zinc-500 stroke-[3]" />
                          <span className="px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                            {acreedorNombre}
                          </span>
=======
              <div className="space-y-2">
                {resumenSalidas
                  .sort((a, b) => b.total - a.total)
                  .map((c, idx) => (
                    <div
                      key={c.id}
                      className="p-3 rounded-2xl bg-[#1b2530] border border-[#3a4858] flex items-center justify-between shadow-sm"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 text-center text-xs font-black text-amber-400 bg-amber-400/10 border border-amber-400/30 rounded-lg py-0.5">
                          #{idx + 1}
                        </span>
                        <span className="text-lg bg-slate-800 p-1 rounded-xl">{c.avatar || '😎'}</span>
                          <div>
                            <p className="text-sm font-semibold text-white">{c.nombre}</p>
                          <p className="text-[11px] text-slate-400 font-semibold">
                            {c.participaciones} salida{c.participaciones !== 1 ? 's' : ''}
                          </p>
>>>>>>> ae824147ff56f4e377b864695131bb809be1795c
                        </div>

                        <span className="text-sm font-mono font-black text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded-xl">
                          {fmt(d.monto)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-white/[0.05]">
                        <button
                          onClick={() => enviarCobroMensual(d)}
                          className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95"
                        >
                          <Send size={13} />
                          Cobrar WhatsApp
                        </button>

                        <button
                          onClick={() => copiarCobroMensual(d, idx)}
                          className="btn-secondary !py-2 !px-3 !text-xs !rounded-xl"
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
          </section>

          {/* Balance individual por roomie */}
          <section className="card-glass p-5 flex flex-col gap-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400">
              Balance por Roomie
            </h3>

            <div className="flex flex-col gap-2">
              {resumenMensual.map((p) => {
                const isPositive = p.balance > 0.5;
                const isNegative = p.balance < -0.5;

                return (
                  <div
                    key={p.id}
                    className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{p.avatar || '😎'}</span>
                      <div>
                        <p className="text-xs font-bold text-white">{p.nombre}</p>
                        <p className="text-[10px] text-zinc-400">
                          Pagó {fmt(p.pago)} · Tocaba {fmt(p.debia)}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-xs font-mono font-extrabold px-2.5 py-1 rounded-xl border ${
                        isPositive
                          ? 'text-emerald-300 bg-emerald-500/10 border-emerald-500/25'
                          : isNegative
                          ? 'text-rose-300 bg-rose-500/10 border-rose-500/25'
                          : 'text-zinc-400 bg-white/[0.03] border-white/[0.07]'
                      }`}
                    >
                      {isPositive ? `+${fmt(p.balance)}` : isNegative ? fmt(p.balance) : '$0'}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Clean Apartment Expenses */}
          {gastosMensuales.length > 0 && (
            <div>
              {!confirmLimpiar ? (
                <button
                  onClick={() => setConfirmLimpiar(true)}
                  className="w-full py-3.5 px-4 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 text-rose-300 font-extrabold text-xs flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <Trash2 size={15} />
                  Saldar Mes del Apto (Paz y Salvo)
                </button>
              ) : (
                <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-center flex flex-col gap-3 animate-fade-in">
                  <AlertTriangle className="mx-auto text-rose-400" size={24} />
                  <p className="text-xs font-bold text-white">
                    ¿Seguro que ya todos pagaron el mes del apto?
                  </p>
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={handleSaldar}
                      className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs"
                    >
                      Sí, dejar en $0
                    </button>
                    <button
                      onClick={() => setConfirmLimpiar(false)}
                      className="flex-1 py-2.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.12] text-zinc-200 font-semibold text-xs"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
