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
    <div className="px-4 pt-3 pb-8 flex flex-col gap-5 animate-fade-in max-w-[480px] mx-auto">
      {/* ── SELECTOR: SALIDAS VS APARTAMENTO ───────────────── */}
      <div
        className="grid grid-cols-2 gap-1.5 p-1.5 rounded-2xl"
        style={{ background: 'color-mix(in srgb, var(--azul) 70%, transparent)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <button
          onClick={() => {
            playClickSound();
            setSubTab('salida');
          }}
          className="py-2 px-3 text-xs font-extrabold rounded-xl transition-all active:scale-95 flex items-center justify-center gap-1.5"
          style={
            subTab === 'salida'
              ? { background: '#D2F25E', color: '#100E40', boxShadow: '0 4px 12px rgba(210,242,94,0.28)' }
              : { color: '#64748b' }
          }
        >
          <span>🍕</span> Salidas del Parche
        </button>

        <button
          onClick={() => {
            playClickSound();
            setSubTab('mensual');
          }}
          className="py-2 px-3 text-xs font-extrabold rounded-xl transition-all active:scale-95 flex items-center justify-center gap-1.5"
          style={
            subTab === 'mensual'
              ? { background: '#D2F25E', color: '#100E40', boxShadow: '0 4px 12px rgba(210,242,94,0.28)' }
              : { color: '#64748b' }
          }
        >
          <span>🏠</span> Apartamento
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════════
          VISTA 1: SALIDAS DEL PARCHE (PRINCIPAL)
      ══════════════════════════════════════════════════════════ */}
      {subTab === 'salida' && (
        <>
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="card-glass p-4 flex flex-col gap-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Total Salidas
              </span>
              <p className="text-2xl font-mono font-black tracking-tight" style={{ color: '#4EC26E' }}>
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
              <p className="text-2xl font-mono font-black tracking-tight" style={{ color: deudasSalida.length > 0 ? '#F2A81D' : '#4EC26E' }}>
                {deudasSalida.length}
              </p>
              <p className="text-[11px] text-zinc-400">
                Transferencia{deudasSalida.length !== 1 ? 's' : ''} pendiente{deudasSalida.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {/* Action Row */}
          {gastosSalida.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                onClick={compartirResumenSalidasGrupo}
                className="flex-1 py-3 px-3 rounded-2xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all active:scale-95"
                style={{ background: 'rgba(78,194,110,0.12)', border: '1px solid rgba(78,194,110,0.28)', color: '#4EC26E' }}
              >
                <Share2 size={15} />
                Enviar Resumen al WhatsApp
              </button>

              <button
                onClick={() => { playClickSound(); onOpenTicket(); }}
                className="btn-ghost !rounded-2xl !py-3"
              >
                <ReceiptText size={15} />
                Ticket
              </button>
            </div>
          )}

          {/* Transferencias Pendientes */}
          <section className="card-glass p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap size={16} style={{ color: '#D2F25E' }} />
                <h3 className="text-xs font-black uppercase tracking-wider text-white">
                  Transferencias Pendientes ({deudasSalida.length})
                </h3>
              </div>
              <span
                className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                style={{ background: 'rgba(78,194,110,0.12)', color: '#4EC26E', border: '1px solid rgba(78,194,110,0.28)' }}
              >
                Cuentas Claras ⚡
              </span>
            </div>

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
                <CheckCircle2 size={32} style={{ color: '#4EC26E' }} />
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
                      className="p-3.5 rounded-2xl flex flex-col gap-3"
                      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-extrabold text-white">
                          <span
                            className="px-2.5 py-1 rounded-xl"
                            style={{ background: 'rgba(242,168,29,0.12)', color: '#F2A81D', border: '1px solid rgba(242,168,29,0.25)' }}
                          >
                            {deudorNombre}
                          </span>
                          <ArrowRight size={13} className="text-zinc-500 stroke-[3]" />
                          <span
                            className="px-2.5 py-1 rounded-xl"
                            style={{ background: 'rgba(78,194,110,0.12)', color: '#4EC26E', border: '1px solid rgba(78,194,110,0.25)' }}
                          >
                            {acreedorNombre}
                          </span>
                        </div>

                        <span
                          className="text-sm font-mono font-black px-2.5 py-1 rounded-xl"
                          style={{ color: '#F2A81D', background: 'rgba(242,168,29,0.10)', border: '1px solid rgba(242,168,29,0.22)' }}
                        >
                          {fmt(d.monto)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                        <button
                          onClick={() => enviarCobroSalida(d)}
                          className="flex-1 py-2 px-3 rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95"
                          style={{ background: '#4EC26E', color: '#0a1f11' }}
                        >
                          <Send size={13} />
                          Cobrar por WhatsApp
                        </button>

                        <button
                          onClick={() => copiarCobroSalida(d, idx)}
                          className="btn-ghost !py-2 !px-3 !text-xs !rounded-xl"
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
                      className="p-3 rounded-xl flex items-center justify-between"
                      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 text-center text-xs font-mono font-bold" style={{ color: '#D2F25E' }}>
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

                      <span className="text-xs font-mono font-bold" style={{ color: '#4EC26E' }}>
                        {fmt(c.total)}
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </section>

          {/* Saldar Salidas */}
          {gastosSalida.length > 0 && (
            <div>
              {!confirmLimpiar ? (
                <button
                  onClick={() => setConfirmLimpiar(true)}
                  className="w-full py-3.5 px-4 rounded-2xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all active:scale-95"
                  style={{ background: 'rgba(242,168,29,0.08)', border: '1px solid rgba(242,168,29,0.22)', color: '#F2A81D' }}
                >
                  <Trash2 size={15} />
                  Reiniciar Gastos de esta Salida (Paz y Salvo)
                </button>
              ) : (
                <div
                  className="p-4 rounded-2xl text-center flex flex-col gap-3 animate-fade-in"
                  style={{ background: 'rgba(242,168,29,0.06)', border: '1px solid rgba(242,168,29,0.25)' }}
                >
                  <AlertTriangle className="mx-auto" size={24} style={{ color: '#F2A81D' }} />
                  <p className="text-xs font-bold text-white">
                    ¿Estás seguro de reiniciar esta salida?
                  </p>
                  <p className="text-[11px] text-zinc-400">
                    Se borrarán los consumos de la salida actual para empezar un parche nuevo desde cero.
                  </p>
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={handleSaldar}
                      className="flex-1 py-2.5 rounded-xl font-extrabold text-xs"
                      style={{ background: '#F2A81D', color: '#100E40' }}
                    >
                      Sí, reiniciar
                    </button>
                    <button
                      onClick={() => setConfirmLimpiar(false)}
                      className="flex-1 py-2.5 rounded-xl font-semibold text-xs"
                      style={{ background: 'rgba(255,255,255,0.07)', color: '#cbd5e1' }}
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
          VISTA 2: APARTAMENTO (SECUNDARIO)
      ══════════════════════════════════════════════════════════ */}
      {subTab === 'mensual' && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div className="card-glass p-4 flex flex-col gap-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Total Mes Apto
              </span>
              <p className="text-2xl font-mono font-black tracking-tight" style={{ color: '#4EC26E' }}>
                {fmt(totalMensual)}
              </p>
              <p className="text-[11px] text-zinc-400">
                {gastosMensuales.length} gasto{gastosMensuales.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="card-glass p-4 flex flex-col gap-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Promedio Roomie
              </span>
              <p className="text-2xl font-mono font-black tracking-tight" style={{ color: '#D2F25E' }}>
                {fmt(promedioMensual)}
              </p>
              <p className="text-[11px] text-zinc-400">
                Entre {roomies.length} roomies
              </p>
            </div>
          </div>

          {gastosMensuales.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                onClick={compartirResumenMensualGrupo}
                className="flex-1 py-3 px-3 rounded-2xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all active:scale-95"
                style={{ background: 'rgba(78,194,110,0.12)', border: '1px solid rgba(78,194,110,0.28)', color: '#4EC26E' }}
              >
                <Share2 size={15} />
                Enviar Balance al WhatsApp del Apto
              </button>

              <button
                onClick={() => { playClickSound(); onOpenTicket(); }}
                className="btn-ghost !rounded-2xl !py-3"
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
                <Scale size={16} style={{ color: '#D2F25E' }} />
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
                <CheckCircle2 size={32} style={{ color: '#4EC26E' }} />
                <p className="text-sm font-bold text-white">¡Apto a Paz y Salvo! 🎉</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {deudasMensuales.map((d, idx) => {
                  const deudorNombre = getNombre(d.de, roomies);
                  const acreedorNombre = getNombre(d.para, roomies);

                  return (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl flex flex-col gap-3"
                      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-extrabold text-white">
                          <span
                            className="px-2.5 py-1 rounded-xl"
                            style={{ background: 'rgba(242,168,29,0.12)', color: '#F2A81D', border: '1px solid rgba(242,168,29,0.25)' }}
                          >
                            {deudorNombre}
                          </span>
                          <ArrowRight size={13} className="text-zinc-500 stroke-[3]" />
                          <span
                            className="px-2.5 py-1 rounded-xl"
                            style={{ background: 'rgba(78,194,110,0.12)', color: '#4EC26E', border: '1px solid rgba(78,194,110,0.25)' }}
                          >
                            {acreedorNombre}
                          </span>
                        </div>

                        <span
                          className="text-sm font-mono font-black px-2.5 py-1 rounded-xl"
                          style={{ color: '#F2A81D', background: 'rgba(242,168,29,0.10)', border: '1px solid rgba(242,168,29,0.22)' }}
                        >
                          {fmt(d.monto)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                        <button
                          onClick={() => enviarCobroMensual(d)}
                          className="flex-1 py-2 px-3 rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95"
                          style={{ background: '#4EC26E', color: '#0a1f11' }}
                        >
                          <Send size={13} />
                          Cobrar WhatsApp
                        </button>

                        <button
                          onClick={() => copiarCobroMensual(d, idx)}
                          className="btn-ghost !py-2 !px-3 !text-xs !rounded-xl"
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
                    className="p-3 rounded-xl flex items-center justify-between"
                    style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
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
                      className="text-xs font-mono font-extrabold px-2.5 py-1 rounded-xl"
                      style={
                        isPositive
                          ? { color: '#4EC26E', background: 'rgba(78,194,110,0.10)', border: '1px solid rgba(78,194,110,0.22)' }
                          : isNegative
                          ? { color: '#F2A81D', background: 'rgba(242,168,29,0.10)', border: '1px solid rgba(242,168,29,0.22)' }
                          : { color: '#64748b', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }
                      }
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
                  className="w-full py-3.5 px-4 rounded-2xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all active:scale-95"
                  style={{ background: 'rgba(242,168,29,0.08)', border: '1px solid rgba(242,168,29,0.22)', color: '#F2A81D' }}
                >
                  <Trash2 size={15} />
                  Saldar Mes del Apto (Paz y Salvo)
                </button>
              ) : (
                <div
                  className="p-4 rounded-2xl text-center flex flex-col gap-3 animate-fade-in"
                  style={{ background: 'rgba(242,168,29,0.06)', border: '1px solid rgba(242,168,29,0.25)' }}
                >
                  <AlertTriangle className="mx-auto" size={24} style={{ color: '#F2A81D' }} />
                  <p className="text-xs font-bold text-white">
                    ¿Seguro que ya todos pagaron el mes del apto?
                  </p>
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={handleSaldar}
                      className="flex-1 py-2.5 rounded-xl font-extrabold text-xs"
                      style={{ background: '#F2A81D', color: '#100E40' }}
                    >
                      Sí, dejar en $0
                    </button>
                    <button
                      onClick={() => setConfirmLimpiar(false)}
                      className="flex-1 py-2.5 rounded-xl font-semibold text-xs"
                      style={{ background: 'rgba(255,255,255,0.07)', color: '#cbd5e1' }}
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
