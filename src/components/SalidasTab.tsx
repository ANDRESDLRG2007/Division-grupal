<<<<<<< HEAD
import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Dices,
  Users,
  AlertCircle,
  Calculator,
  Send,
  Zap,
  Sparkles,
} from 'lucide-react';
=======
import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Check, Dices, Users, AlertCircle, Sparkles } from 'lucide-react';
>>>>>>> ae824147ff56f4e377b864695131bb809be1795c
import { Persona, GastoSalida, PresetCategoria } from '../types';
import {
  fmt,
  uid,
  getNombre,
  AVATARES,
  calcularDeudasSalida,
} from '../utils/calculations';
import { playCoinSound, playClickSound } from '../utils/audio';
<<<<<<< HEAD
import { launchConfetti } from '../utils/confetti';
import { generarMensajeCobroSalida, compartirPorWhatsApp } from '../utils/whatsapp';
=======
import { Accordion } from './Accordion';
>>>>>>> ae824147ff56f4e377b864695131bb809be1795c

interface SalidasTabProps {
  contactos: Persona[];
  gastosSalida: GastoSalida[];
  onSaveContactos: (contactos: Persona[]) => void;
  onSaveGastos: (gastos: GastoSalida[]) => void;
  onAbrirRuleta: () => void;
  onAddContacto: (nombre: string, avatar: string) => Persona | null;
}

const PRESETS_SALIDA: PresetCategoria[] = [
  { id: 'polas', nombre: 'Polas / Birras', icono: '🍻', sugerenciaMonto: 60000 },
  { id: 'comida', nombre: 'Pizza / Hamburguesa', icono: '🍕', sugerenciaMonto: 55000 },
  { id: 'uber', nombre: 'Uber / Taxi', icono: '🚕', sugerenciaMonto: 25000 },
  { id: 'cover', nombre: 'Cover / Entrada', icono: '🎟️', sugerenciaMonto: 40000 },
  { id: 'cafe', nombre: 'Café / Once', icono: '☕', sugerenciaMonto: 20000 },
  { id: 'snacks', nombre: 'Snacks / Mecato', icono: '🍿', sugerenciaMonto: 15000 },
];

export const SalidasTab: React.FC<SalidasTabProps> = ({
  contactos,
  gastosSalida,
  onSaveContactos,
  onSaveGastos,
  onAbrirRuleta,
  onAddContacto,
}) => {
  // Modals state
  const [mostrarModalGasto, setMostrarModalGasto] = useState(false);
  const [mostrarCalculadora, setMostrarCalculadora] = useState(false);
  const [mostrarModalAmigos, setMostrarModalAmigos] = useState(false);

  // Form State for new expense
  const [desc, setDesc] = useState('');
  const [monto, setMonto] = useState('');
  const [pagadoPor, setPagadoPor] = useState<string>(contactos[0]?.id || 'c1');
  const [seleccionados, setSeleccionados] = useState<string[]>(contactos.map((c) => c.id));
  const [categoriaSel, setCategoriaSel] = useState<string>('');
<<<<<<< HEAD
  const [errorMsg, setErrorMsg] = useState('');
  const [exito, setExito] = useState(false);

  // Quick Calculator State
  const [calcTotal, setCalcTotal] = useState('');
  const [calcPersonas, setCalcPersonas] = useState(4);
  const [incluirPropina, setIncluirPropina] = useState(false);

  // Contact management state
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevoAvatar, setNuevoAvatar] = useState('😎');
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [nombreTemp, setNombreTemp] = useState('');
  const [avatarTemp, setAvatarTemp] = useState('😎');

  // Calculations
  const totalSalidas = gastosSalida.reduce((s, g) => s + g.monto, 0);
  const deudasSalida = calcularDeudasSalida(gastosSalida, contactos);

  // Handlers
=======

  const [nuevoContacto, setNuevoContacto] = useState('');
  const [nuevoAvatar, setNuevoAvatar] = useState('🐼');
  const [mostrarNuevo, setMostrarNuevo] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');
  const [exito, setExito] = useState(false);

  useEffect(() => {
    setSeleccionados(prev => prev.filter(id => contactos.some(contacto => contacto.id === id)));
  }, [contactos]);

>>>>>>> ae824147ff56f4e377b864695131bb809be1795c
  const toggleSeleccionado = (id: string) => {
    playClickSound();
    setSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const seleccionarTodos = () => {
    playClickSound();
    if (seleccionados.length === contactos.length) {
      setSeleccionados([pagadoPor]);
    } else {
      setSeleccionados(contactos.map((c) => c.id));
    }
  };

  const aplicarPreset = (preset: PresetCategoria) => {
    playClickSound();
    setDesc(preset.nombre);
    setCategoriaSel(preset.id);
    if (!monto && preset.sugerenciaMonto) {
      setMonto(preset.sugerenciaMonto.toString());
    }
  };

  const sumarMonto = (sum: number) => {
    playClickSound();
    const curr = Number(monto) || 0;
    setMonto((curr + sum).toString());
  };

  const abrirModalNuevoGasto = () => {
    playClickSound();
    setDesc('');
    setMonto('');
    setCategoriaSel('');
    setErrorMsg('');
    setSeleccionados(contactos.map((c) => c.id));
    if (contactos.length > 0 && !contactos.some((c) => c.id === pagadoPor)) {
      setPagadoPor(contactos[0].id);
    }
    setMostrarModalGasto(true);
  };

  const agregarGasto = () => {
    setErrorMsg('');
    if (!desc.trim()) {
      setErrorMsg('Escribe qué compraron (ej: Polas, Pizza, Taxi)');
      return;
    }
    const numMonto = parseFloat(monto);
    if (isNaN(numMonto) || numMonto <= 0) {
      setErrorMsg('Ingresa un monto válido mayor a 0');
      return;
    }
    if (seleccionados.length === 0) {
      setErrorMsg('Selecciona al menos una persona que divida');
      return;
    }

    const nuevoGasto: GastoSalida = {
      id: uid(),
      descripcion: desc.trim(),
      monto: numMonto,
      categoria: categoriaSel || 'salida',
      pagadoPor: pagadoPor || contactos[0]?.id || 'c1',
      personas: seleccionados,
      fecha: new Date().toLocaleDateString('es-CO', { day: '2-digit', month: 'short' }),
      timestamp: Date.now(),
    };

    onSaveGastos([nuevoGasto, ...gastosSalida]);
    playCoinSound();
    launchConfetti();
    setExito(true);
    setTimeout(() => {
      setExito(false);
      setMostrarModalGasto(false);
    }, 700);
  };

  const eliminarGasto = (id: string) => {
    playClickSound();
    onSaveGastos(gastosSalida.filter((g) => g.id !== id));
  };

  // Friends management
  const agregarContacto = () => {
<<<<<<< HEAD
    if (!nuevoNombre.trim()) return;
    const nuevo: Persona = {
      id: uid(),
      nombre: nuevoNombre.trim(),
      avatar: nuevoAvatar,
    };
    const updated = [...contactos, nuevo];
    onSaveContactos(updated);
    setSeleccionados((prev) => [...prev, nuevo.id]);
    setNuevoNombre('');
    playClickSound();
  };

  const guardarEdicionContacto = (id: string) => {
    if (!nombreTemp.trim()) return;
    const updated = contactos.map((c) =>
      c.id === id ? { ...c, nombre: nombreTemp.trim(), avatar: avatarTemp } : c
    );
    onSaveContactos(updated);
    setEditandoId(null);
    playClickSound();
  };

  const eliminarContacto = (id: string) => {
    if (contactos.length <= 2) return;
    playClickSound();
    const updated = contactos.filter((c) => c.id !== id);
    onSaveContactos(updated);
    setSeleccionados((prev) => prev.filter((p) => p !== id));
    if (pagadoPor === id && updated[0]) {
      setPagadoPor(updated[0].id);
    }
  };

  const cobrarDeudaWhatsApp = (deuda: { de: string; para: string; monto: number }) => {
    playClickSound();
    const texto = generarMensajeCobroSalida(deuda, contactos);
    compartirPorWhatsApp(texto);
  };

  // Calculator logic
  const montoCalcNum = parseFloat(calcTotal) || 0;
  const montoConPropina = incluirPropina ? montoCalcNum * 1.1 : montoCalcNum;
  const cadaUnoCalc = calcPersonas > 0 ? montoConPropina / calcPersonas : 0;

  return (
    <div className="px-4 pt-3 pb-8 flex flex-col gap-5 animate-fade-in max-w-[480px] mx-auto">
      {/* ── 1. HERO FINTECH CARD: SALIDA ACTUAL ──────────────── */}
      <section className="relative overflow-hidden rounded-3xl p-5 bg-gradient-to-b from-[#182136] via-[#121929] to-[#0e1322] border border-indigo-500/20 shadow-xl flex flex-col gap-4">
        {/* Subtle glow decorative shapes */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Top Header of the card */}
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-500/15 border border-indigo-500/30 text-indigo-300">
            <Sparkles size={12} className="text-indigo-400" />
            <span>Salida de Hoy</span>
          </div>

          <button
            onClick={() => {
              playClickSound();
              setMostrarCalculadora(true);
            }}
            className="text-xs font-semibold text-zinc-400 hover:text-cyan-300 flex items-center gap-1.5 py-1 px-2.5 rounded-lg bg-white/[0.04] border border-white/[0.06] transition-colors"
          >
            <Calculator size={13} className="text-cyan-400" />
            <span>Calculadora Mesa</span>
          </button>
        </div>

        {/* Amount in Big Display */}
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
            Total del Parche
          </span>
          <div className="flex items-baseline gap-2">
            <h2 className="text-4xl font-extrabold font-mono text-white tracking-tight">
              {fmt(totalSalidas)}
            </h2>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            {gastosSalida.length === 0
              ? 'Aún no hay consumos registrados en este parche'
              : `${gastosSalida.length} consumo${gastosSalida.length !== 1 ? 's' : ''} registrado${gastosSalida.length !== 1 ? 's' : ''}`}
          </p>
        </div>

        {/* Single Primary Action Button */}
        <button
          onClick={abrirModalNuevoGasto}
          className="w-full py-3.5 px-5 rounded-2xl btn-primary text-sm font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/35 transition-all"
        >
          <Plus size={18} strokeWidth={3} />
          <span>Dividir una Cuenta</span>
        </button>
      </section>

      {/* ── 2. EL PARCHE (STORY BUBBLES DE AMIGOS) ──────────── */}
      <section className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-black uppercase tracking-wider text-zinc-300">
              El Parche
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-white/[0.08] text-zinc-300">
              {contactos.length}
            </span>
          </div>

          <button
            onClick={() => {
              playClickSound();
              setMostrarModalAmigos(true);
            }}
            className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
          >
            <Users size={13} />
            <span>Gestionar</span>
          </button>
        </div>

        {/* Stories-like horizontal row */}
        <div className="flex items-center gap-3 overflow-x-auto pb-1 -mx-1 px-1">
          {contactos.map((c) => (
            <div
              key={c.id}
              onClick={() => {
                playClickSound();
                setMostrarModalAmigos(true);
              }}
              className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group"
            >
              <div className="w-13 h-13 rounded-2xl bg-[#141b2d] border border-white/[0.1] group-hover:border-indigo-500/60 flex items-center justify-center text-2xl shadow-sm transition-all group-hover:scale-105">
                {c.avatar || '😎'}
              </div>
              <span className="text-[11px] font-bold text-zinc-300 group-hover:text-white max-w-[56px] truncate text-center leading-none">
                {c.nombre}
              </span>
            </div>
          ))}

          {/* Add Friend Bubble */}
          <button
            onClick={() => {
              playClickSound();
              setMostrarModalAmigos(true);
            }}
            className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group"
          >
            <div className="w-13 h-13 rounded-2xl border-2 border-dashed border-indigo-500/40 hover:border-indigo-400 group-hover:bg-indigo-500/10 flex items-center justify-center text-indigo-400 transition-all group-hover:scale-105">
              <Plus size={20} strokeWidth={2.5} />
            </div>
            <span className="text-[11px] font-bold text-indigo-400 text-center leading-none">
              Añadir
            </span>
          </button>
        </div>
      </section>

      {/* ── 3. TRANSFERENCIAS PENDIENTES (SOLO SI HAY DEUDAS) ── */}
      {deudasSalida.length > 0 && (
        <section className="card-glass p-4 border-rose-500/25 bg-gradient-to-br from-rose-950/20 via-[#121826] to-[#121826] flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap size={15} className="text-rose-400" />
              <h3 className="text-xs font-black uppercase tracking-wider text-white">
                Pagos Pendientes ({deudasSalida.length})
              </h3>
            </div>
            <span className="text-[10px] font-bold text-rose-300 bg-rose-500/15 border border-rose-500/30 px-2 py-0.5 rounded-full">
              Cobrar por Nequi
            </span>
          </div>

          <div className="flex flex-col gap-2">
            {deudasSalida.map((d, i) => (
              <div
                key={i}
                className="p-3 rounded-2xl bg-black/40 border border-white/[0.06] flex items-center justify-between gap-2"
              >
                <div className="text-xs text-zinc-300">
                  <span className="font-bold text-white">{getNombre(d.de, contactos)}</span>
                  <span className="text-zinc-500 mx-1.5">le debe</span>
                  <span className="font-bold text-emerald-400">{getNombre(d.para, contactos)}</span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-mono font-bold text-rose-400">
                    {fmt(d.monto)}
                  </span>
                  <button
                    onClick={() => cobrarDeudaWhatsApp(d)}
                    className="py-1 px-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1 transition-all active:scale-95"
                  >
                    <Send size={11} />
                    Cobrar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── 4. BANNER RULETA (FIESTERO Y DIVERTIDO) ────────── */}
=======
    const nuevo = onAddContacto(nuevoContacto, nuevoAvatar);
    if (!nuevo) return;
    setSeleccionados(prev => [...prev, nuevo.id]);
    setNuevoContacto('');
    setMostrarNuevo(false);
    playClickSound();
  };

  const totalSalidas = gastosSalida.reduce((s, g) => s + g.monto, 0);

  return (
    <div className="py-6 animate-fade-in space-y-6 layout-stack salida-layout page-content">
      {/* ── BANNER RULETA ───────────────────────── */}
>>>>>>> ae824147ff56f4e377b864695131bb809be1795c
      <div
        onClick={() => {
          playClickSound();
          onAbrirRuleta();
        }}
<<<<<<< HEAD
        className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-[#121826] border border-violet-500/25 flex items-center justify-between cursor-pointer hover:border-violet-500/45 transition-all group shadow-md"
=======
        className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-purple-600/20 to-violet-600/25 border-2 border-amber-500/40 shadow-xl shadow-amber-500/10 flex items-center justify-between gap-3 cursor-pointer hover:border-amber-400 transition-all active:scale-[0.98] roulette-banner"
>>>>>>> ae824147ff56f4e377b864695131bb809be1795c
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform">
            🎰
          </div>
          <div className="flex flex-col">
            <h4 className="text-xs font-black text-white flex items-center gap-1.5">
              ¿A quién le toca pagar hoy?
            </h4>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Gira la ruleta o elige castigos universitarios 🎲
            </p>
          </div>
        </div>

        <button className="py-1.5 px-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-violet-600/25">
          <Dices size={14} />
          Girar
        </button>
      </div>

<<<<<<< HEAD
      {/* ── 5. CONSUMOS DEL PARCHE (FEED LIMPIO) ───────────── */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400">
            Consumos Registrados ({gastosSalida.length})
=======
      {/* ── FORMULARIO SALIDA ───────────────────────── */}
      <section className="glass-card-glow p-5 space-y-6 expense-form">
        <div className="flex items-center justify-between pb-1 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_10px_#38bdf8]"></span>
            <h2 className="text-base font-semibold text-white tracking-tight">Registrar Gasto de Salida</h2>
          </div>
          <span className="text-[11px] font-bold text-cyan-300 bg-cyan-500/15 border border-cyan-500/30 px-2 py-0.5 rounded-full">
            En Grupo
          </span>
        </div>

        {/* Quick Presets */}
        <div className="quick-presets">
          <label className="text-[10px] font-black uppercase tracking-wider text-slate-300 block mb-2 flex items-center gap-1">
            <span>⚡</span> Atajos rápidos del parche:
          </label>
          <div className="grid grid-cols-3 gap-2">
            {PRESETS_SALIDA.map(preset => (
              <button
                key={preset.id}
                onClick={() => aplicarPreset(preset)}
                className={`p-2.5 rounded-2xl text-left border flex items-center gap-2 transition-all active:scale-95 shadow-sm ${
                  categoriaSel === preset.id
                    ? 'bg-cyan-600/30 border-cyan-400 text-white font-black shadow-md shadow-cyan-500/25 scale-[1.02]'
                    : 'bg-[#1b2530] hover:bg-[#263442] border-[#3a4858] text-slate-300'
                }`}
              >
                <span className="text-base shrink-0 p-1 bg-slate-800/80 rounded-lg">{preset.icono}</span>
                <span className="text-xs font-bold truncate">{preset.nombre}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Description & Amount */}
        <div className="space-y-3 expense-fields">
          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-300 block mb-1.5">
              ¿Qué compraron?
            </label>
            <input
              type="text"
              placeholder="Ej: Pizza en la 45, Polas en la tienda, Taxi..."
              value={desc}
              onChange={e => setDesc(e.target.value)}
              className="w-full bg-[#263442] border border-[#3a4858] focus:border-violet-400 rounded-2xl px-4 py-3 text-base font-medium text-white placeholder-slate-400 transition-all"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-300">
                Monto total ($)
              </label>
              <div className="flex gap-1.5">
                {[20000, 50000, 100000].map(val => (
                  <button
                    key={val}
                    onClick={() => sumarMonto(val)}
                    className="text-xs py-1 px-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-cyan-300 font-mono font-bold transition-all active:scale-95 shadow-sm"
                  >
                    +{val >= 1000 ? `${val / 1000}k` : val}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center bg-[#263442] border border-[#3a4858] focus-within:border-violet-400 rounded-2xl px-4 py-3 transition-all">
              <span className="text-cyan-400 font-mono font-black text-xl mr-2">$</span>
              <input
                type="number"
                inputMode="numeric"
                placeholder="0"
                value={monto}
                onChange={e => setMonto(e.target.value)}
                className="w-full bg-transparent text-2xl font-mono font-semibold text-emerald-400 placeholder-slate-400 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Participants Selection */}
        <Accordion
          className="people-fields"
          title={<span className="text-base font-semibold tracking-wide text-slate-300">Detalles</span>}
          trailing={
            <span className="text-xs font-medium text-slate-400">
              {seleccionados.length}/{contactos.length} participantes
            </span>
          }
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold tracking-wide text-slate-400">
                ¿Quiénes van en esta cuenta?
              </label>
              <button
                onClick={seleccionarTodos}
                className="text-xs font-bold text-cyan-400 hover:text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 rounded-xl"
              >
                {seleccionados.length === contactos.length ? 'Deseleccionar' : 'Todos'}
              </button>
            </div>

            <div className="grid gap-2">
              {contactos.map(c => {
                const isSelected = seleccionados.includes(c.id);
                return (
                  <label
                    key={c.id}
                    className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-500/15 text-cyan-100 border-cyan-400/70'
                        : 'bg-[#1b2530] text-slate-400 border-[#3a4858] hover:text-slate-200'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSeleccionado(c.id)}
                      className="h-4 w-4 accent-cyan-400"
                    />
                    <span className="text-base">{c.avatar || '😎'}</span>
                    <span>{c.nombre}</span>
                  </label>
                );
              })}
            </div>

            <div className="pt-2">
              {!mostrarNuevo ? (
                <button
                  type="button"
                  onClick={() => {
                    playClickSound();
                    setMostrarNuevo(true);
                  }}
                  className="text-sm font-semibold text-cyan-300 hover:text-cyan-200 flex items-center gap-1.5"
                >
                  <Plus size={15} />
                  Agregar persona
                </button>
              ) : (
                <div className="flex items-center gap-2 border-t border-slate-700/80 pt-3 animate-fade-in">
                  <select
                    value={nuevoAvatar}
                    onChange={e => setNuevoAvatar(e.target.value)}
                    aria-label="Avatar de la nueva persona"
                    className="bg-[#111726] text-lg p-2 rounded-xl border border-slate-700 text-white"
                  >
                    {AVATARES.map(a => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Nombre"
                    value={nuevoContacto}
                    onChange={e => setNuevoContacto(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && agregarContacto()}
                    className="flex-1 bg-[#111726] border border-slate-700 focus:border-cyan-500 rounded-xl px-3 py-2 text-sm font-medium text-white placeholder-slate-500"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={agregarContacto}
                    className="py-2 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs"
                  >
                    Agregar
                  </button>
                </div>
              )}
            </div>
          </div>
        </Accordion>

        {/* Real-time Division Preview */}
        {seleccionados.length >= 2 && Number(monto) > 0 && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-cyan-950/80 to-slate-900 border-2 border-cyan-500/40 flex items-center justify-between animate-pop-in shadow-md">
            <div className="flex items-center gap-2.5">
              <Sparkles size={18} className="text-cyan-400 shrink-0" />
              <div>
                <p className="text-xs text-white font-extrabold">
                  {fmt(Number(monto) / seleccionados.length)} <span className="font-medium text-slate-300">cada uno</span>
                </p>
                <p className="text-[11px] text-cyan-300 font-semibold">
                  Dividido en partes iguales entre {seleccionados.length} amigos
                </p>
              </div>
            </div>
            <span className="text-xs font-mono font-black text-cyan-400 bg-cyan-950/60 border border-cyan-500/40 px-2.5 py-1 rounded-xl">
              Total {fmt(Number(monto))}
            </span>
          </div>
        )}

        {/* Error Message */}
        {errorMsg && (
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs font-bold">
            <AlertCircle size={16} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={agregarGasto}
          className={`w-full btn-neon !bg-gradient-to-r !from-cyan-600 !to-teal-600 py-3.5 text-sm font-black shadow-lg shadow-cyan-600/35 active:scale-[0.98] ${
            exito ? '!bg-emerald-600 text-white' : ''
          }`}
        >
          {exito ? (
            <>
              <Check size={20} className="stroke-[3]" />
              ¡Salida Registrada!
            </>
          ) : (
            <>
              <Plus size={20} className="stroke-[3]" />
              Guardar Gasto de Salida
            </>
          )}
        </button>
      </section>

      {/* ── HISTORIAL DE SALIDAS ───────────────────────── */}
      <section className="space-y-5 history-section">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-base font-semibold tracking-wide text-slate-300 flex items-center gap-1.5">
            <span>🍕</span> Salidas Registradas ({gastosSalida.length})
>>>>>>> ae824147ff56f4e377b864695131bb809be1795c
          </h3>
          {gastosSalida.length > 0 && (
            <span className="text-xs font-mono font-bold text-emerald-400">
              Total {fmt(totalSalidas)}
            </span>
          )}
        </div>

        {gastosSalida.length === 0 ? (
          <div className="card-glass p-8 text-center flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-2xl">
              🍕
            </div>
            <h4 className="text-sm font-bold text-white mt-1">Sin consumos en esta salida</h4>
            <p className="text-xs text-zinc-400 max-w-xs">
              Toca "Dividir una Cuenta" arriba para registrar la comida, las polas o el taxi.
            </p>
          </div>
        ) : (
<<<<<<< HEAD
          <div className="flex flex-col gap-2.5">
            {gastosSalida.map((g) => {
              const porPersona = g.monto / Math.max(g.personas.length, 1);
              const pagadorNombre = getNombre(g.pagadoPor || g.personas[0], contactos);

              return (
                <div
                  key={g.id}
                  className="card-glass p-4 flex flex-col gap-3 hover:border-zinc-700/80 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-col gap-0.5">
                      <h4 className="text-sm font-extrabold text-white leading-tight">
                        {g.descripcion}
                      </h4>
                      <p className="text-xs text-zinc-400">
                        Pagó <strong className="text-indigo-300">{pagadorNombre}</strong> ·{' '}
                        {g.personas.length} personas ({fmt(porPersona)} c/u)
                      </p>
                    </div>

                    <span className="text-sm font-mono font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-1 rounded-xl shrink-0">
=======
          <div className="space-y-2">
            {gastosSalida.map(g => {
              const porPersona = g.monto / g.personas.length;

              return (
                <div key={g.id} className="glass-card !bg-[#1b2530] p-4 rounded-2xl space-y-4 border border-[#3a4858] shadow-md hover:border-slate-500 transition-all">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-base font-semibold text-white tracking-tight">{g.descripcion}</h4>
                      <p className="text-sm text-slate-300 font-medium mt-0.5">
                        {g.personas.length} amigos · <strong className="text-cyan-300 font-bold">{fmt(porPersona)}</strong> cada uno
                      </p>
                    </div>
                    <span className="text-xl font-mono font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-xl shrink-0">
>>>>>>> ae824147ff56f4e377b864695131bb809be1795c
                      {fmt(g.monto)}
                    </span>
                  </div>

<<<<<<< HEAD
                  {/* Badges of participants */}
                  <div className="flex flex-wrap gap-1.5">
                    {g.personas.map((pid) => (
                      <span
                        key={pid}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[11px] text-zinc-300"
                      >
                        <span>{getNombre(pid, contactos)}</span>
                        <span className="text-zinc-500 font-mono">
=======
                  {/* Individual shares */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {g.personas.map(pid => (
                      <span
                        key={pid}
                        className="min-w-0 inline-flex items-center gap-1 rounded-lg bg-[#263442] border border-[#3a4858] px-2.5 py-1 text-sm font-medium text-slate-200"
                      >
                        <span className="truncate">{getNombre(pid, contactos)}</span>
                        <span className="shrink-0 text-cyan-400 font-mono font-black">
>>>>>>> ae824147ff56f4e377b864695131bb809be1795c
                          {fmt(porPersona)}
                        </span>
                      </span>
                    ))}
                  </div>

                  {/* Card bottom actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-white/[0.05] text-xs text-zinc-500">
                    <span className="text-[11px] font-mono text-zinc-400">{g.fecha}</span>
                    <button
                      onClick={() => eliminarGasto(g.id)}
                      className="text-zinc-500 hover:text-rose-400 flex items-center gap-1 text-xs font-semibold py-1 px-2 rounded-lg hover:bg-rose-500/10 transition-colors"
                    >
                      <Trash2 size={13} />
                      Eliminar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ══════════════════════════════════════════════════════════
          MODAL: DIVIDIR GASTO DE SALIDA (PASO A PASO LIMPIO)
      ══════════════════════════════════════════════════════════ */}
      {mostrarModalGasto && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto animate-fade-in">
          <div className="w-full max-w-[460px] bg-[#121829] border border-white/[0.1] rounded-t-3xl sm:rounded-3xl p-5 flex flex-col gap-4 shadow-2xl max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-sm">
                  ⚡
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-white">Dividir Gasto de Salida</h3>
                  <p className="text-[11px] text-zinc-400">Cero enredos para calcular quién debe</p>
                </div>
              </div>
              <button
                onClick={() => setMostrarModalGasto(false)}
                className="w-8 h-8 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] flex items-center justify-center text-zinc-300 hover:text-white transition-all"
              >
                <X size={16} />
              </button>
            </div>

            {/* Presets */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                Atajos rápidos:
              </label>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {PRESETS_SALIDA.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => aplicarPreset(preset)}
                    className={`py-1.5 px-3 rounded-xl text-xs font-semibold border shrink-0 flex items-center gap-1.5 transition-all ${
                      categoriaSel === preset.id
                        ? 'bg-indigo-600 text-white border-indigo-400'
                        : 'bg-white/[0.04] border-white/[0.08] text-zinc-300 hover:border-white/[0.15]'
                    }`}
                  >
                    <span>{preset.icono}</span>
                    <span>{preset.nombre}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Monto Total */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold text-zinc-200">
                  Monto total a pagar
                </label>
                <div className="flex gap-1">
                  {[20000, 50000, 100000].map((val) => (
                    <button
                      key={val}
                      onClick={() => sumarMonto(val)}
                      className="text-[11px] py-0.5 px-2 rounded-lg bg-white/[0.05] border border-white/[0.08] text-zinc-400 hover:text-emerald-400 font-mono font-semibold"
                    >
                      +{val >= 1000 ? `${val / 1000}k` : val}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center bg-[#151c30] border border-white/[0.1] focus-within:border-indigo-500 rounded-2xl px-4 py-2.5">
                <span className="text-emerald-400 font-mono font-bold text-xl mr-2">$</span>
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="0"
                  value={monto}
                  onChange={(e) => setMonto(e.target.value)}
                  className="w-full bg-transparent text-xl font-mono font-extrabold text-white placeholder-zinc-600 outline-none"
                  autoFocus
                />
              </div>
            </div>

            {/* Concepto */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-extrabold text-zinc-200">
                ¿Qué compraron?
              </label>
              <input
                type="text"
                placeholder="Ej. Polas BBC, Hamburguesas, Taxi a la casa..."
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                className="input-clean font-medium !py-2.5 !text-sm"
              />
            </div>

            {/* Quién pagó */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-extrabold text-zinc-200">
                ¿Quién puso la plata? 💳
              </label>
              <div className="flex flex-wrap gap-1.5">
                {contactos.map((c) => {
                  const isPayer = pagadoPor === c.id;
                  return (
                    <button
                      key={c.id}
                      onClick={() => {
                        playClickSound();
                        setPagadoPor(c.id);
                      }}
                      className={`py-1.5 px-3 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                        isPayer
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                          : 'bg-white/[0.04] border border-white/[0.08] text-zinc-300'
                      }`}
                    >
                      <span>{c.avatar || '😎'}</span>
                      <span>{c.nombre}</span>
                      {isPayer && <Check size={13} strokeWidth={3} />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quiénes dividen */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold text-zinc-200">
                  ¿Quiénes dividen? ({seleccionados.length}/{contactos.length})
                </label>
                <button
                  onClick={seleccionarTodos}
                  className="text-xs font-bold text-indigo-400 hover:text-indigo-300"
                >
                  {seleccionados.length === contactos.length ? 'Solo yo' : 'Todos'}
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {contactos.map((c) => {
                  const isSelected = seleccionados.includes(c.id);
                  return (
                    <button
                      key={c.id}
                      onClick={() => toggleSeleccionado(c.id)}
                      className={`py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                        isSelected
                          ? 'bg-indigo-600/25 border border-indigo-500/50 text-indigo-200 font-bold'
                          : 'bg-white/[0.03] border border-white/[0.07] text-zinc-400'
                      }`}
                    >
                      <span>{c.avatar || '😎'}</span>
                      <span>{c.nombre}</span>
                      {isSelected && <Check size={13} className="text-indigo-400 ml-0.5" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Preview */}
            {seleccionados.length > 0 && Number(monto) > 0 && (
              <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-between">
                <div>
                  <p className="text-xs font-extrabold text-white">
                    {fmt(Number(monto) / seleccionados.length)}{' '}
                    <span className="font-normal text-zinc-400">cada uno</span>
                  </p>
                  <p className="text-[11px] text-zinc-400">
                    Le transfieren a{' '}
                    <strong className="text-emerald-400">{getNombre(pagadoPor, contactos)}</strong>
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-indigo-300 bg-indigo-500/15 border border-indigo-500/25 px-2.5 py-1 rounded-xl">
                  {seleccionados.length} amigos
                </span>
              </div>
            )}

            {/* Error Message */}
            {errorMsg && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold">
                <AlertCircle size={15} />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              onClick={agregarGasto}
              className={`w-full py-3.5 rounded-2xl btn-primary text-sm font-extrabold mt-1 ${
                exito ? '!bg-emerald-600' : ''
              }`}
            >
              {exito ? (
                <>
                  <Check size={18} strokeWidth={3} />
                  ¡Gasto Guardado y Dividido!
                </>
              ) : (
                <>
                  <Plus size={18} strokeWidth={3} />
                  Guardar y Calcular Cuentas
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          MODAL: CALCULADORA RÁPIDA DE MESA
      ══════════════════════════════════════════════════════════ */}
      {mostrarCalculadora && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="w-full max-w-[400px] bg-[#121829] border border-white/[0.1] rounded-3xl p-5 flex flex-col gap-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-sm">
                  🧮
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-white">Calculadora Rápida de Mesa</h3>
                  <p className="text-[11px] text-zinc-400">¿Cuánto pone cada uno ahora mismo?</p>
                </div>
              </div>
              <button
                onClick={() => setMostrarCalculadora(false)}
                className="w-8 h-8 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] flex items-center justify-center text-zinc-300 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            {/* Total check */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-extrabold text-zinc-200">
                Total de la cuenta / factura
              </label>
              <div className="flex items-center bg-[#151c30] border border-white/[0.1] focus-within:border-cyan-500 rounded-2xl px-4 py-2.5">
                <span className="text-cyan-400 font-mono font-bold text-xl mr-2">$</span>
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="0"
                  value={calcTotal}
                  onChange={(e) => setCalcTotal(e.target.value)}
                  className="w-full bg-transparent text-xl font-mono font-extrabold text-white placeholder-zinc-600 outline-none"
                  autoFocus
                />
              </div>
            </div>

            {/* People count */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-extrabold text-zinc-200">
                ¿Entre cuántas personas?
              </label>
              <div className="flex items-center gap-1.5">
                {[2, 3, 4, 5, 6, 8].map((n) => (
                  <button
                    key={n}
                    onClick={() => {
                      playClickSound();
                      setCalcPersonas(n);
                    }}
                    className={`flex-1 py-2 rounded-xl text-xs font-extrabold transition-all ${
                      calcPersonas === n
                        ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                        : 'bg-white/[0.04] border border-white/[0.08] text-zinc-400'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* Tip toggle */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
              <div>
                <p className="text-xs font-bold text-white">¿Incluir 10% de propina?</p>
                <p className="text-[11px] text-zinc-400">Propina voluntaria para el servicio</p>
              </div>
              <button
                onClick={() => {
                  playClickSound();
                  setIncluirPropina(!incluirPropina);
                }}
                className={`py-1 px-3 rounded-xl text-xs font-extrabold transition-all ${
                  incluirPropina ? 'bg-emerald-600 text-white' : 'bg-white/[0.08] text-zinc-400'
                }`}
              >
                {incluirPropina ? 'SÍ (+10%)' : 'NO'}
              </button>
            </div>

            {/* Result */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-950/40 to-[#121829] border border-cyan-500/30 text-center flex flex-col gap-1">
              <span className="text-[11px] uppercase tracking-wider font-extrabold text-cyan-300">
                Cada uno debe poner:
              </span>
              <p className="text-3xl font-black font-mono text-cyan-400 tracking-tight">
                {fmt(cadaUnoCalc)}
              </p>
              <p className="text-[11px] text-zinc-400">
                Total con {calcPersonas} personas: {fmt(montoConPropina)}
              </p>
            </div>

            <button
              onClick={() => {
                if (montoConPropina > 0) {
                  setDesc('Cuenta de la mesa');
                  setMonto(Math.round(montoConPropina).toString());
                  setMostrarCalculadora(false);
                  setMostrarModalGasto(true);
                } else {
                  setMostrarCalculadora(false);
                }
              }}
              className="w-full py-3 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold text-xs transition-all active:scale-95"
            >
              Guardar como Gasto del Parche
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          MODAL: GESTIÓN DE AMIGOS
      ══════════════════════════════════════════════════════════ */}
      {mostrarModalAmigos && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="w-full max-w-[420px] bg-[#121829] border border-white/[0.1] rounded-3xl p-5 flex flex-col gap-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <Users size={16} className="text-indigo-400" />
                <h3 className="text-sm font-extrabold text-white">Amigos del Parche</h3>
              </div>
              <button
                onClick={() => setMostrarModalAmigos(false)}
                className="w-8 h-8 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] flex items-center justify-center text-zinc-300 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            {/* Add friend */}
            <div className="flex items-center gap-2 p-2 bg-[#151c30] rounded-2xl border border-white/[0.08]">
              <select
                value={nuevoAvatar}
                onChange={(e) => setNuevoAvatar(e.target.value)}
                className="bg-transparent text-lg p-1 text-white outline-none cursor-pointer"
              >
                {AVATARES.map((a) => (
                  <option key={a} value={a} className="bg-zinc-900 text-white">
                    {a}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Nombre del amigo/a..."
                value={nuevoNombre}
                onChange={(e) => setNuevoNombre(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && agregarContacto()}
                className="flex-1 bg-transparent text-xs font-semibold text-white outline-none placeholder-zinc-500"
              />
              <button
                onClick={agregarContacto}
                className="py-1.5 px-3 rounded-xl btn-primary text-xs font-bold"
              >
                Añadir
              </button>
            </div>

            {/* Friends list */}
            <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1">
              {contactos.map((c) => {
                const isEditing = editandoId === c.id;
                return isEditing ? (
                  <div
                    key={c.id}
                    className="flex items-center gap-2 p-2 bg-[#151c30] border border-indigo-500 rounded-xl"
                  >
                    <select
                      value={avatarTemp}
                      onChange={(e) => setAvatarTemp(e.target.value)}
                      className="bg-transparent text-lg text-white"
                    >
                      {AVATARES.map((a) => (
                        <option key={a} value={a} className="bg-zinc-900">
                          {a}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={nombreTemp}
                      onChange={(e) => setNombreTemp(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && guardarEdicionContacto(c.id)}
                      className="flex-1 bg-transparent text-xs font-bold text-white border-b border-indigo-400 outline-none"
                      autoFocus
                    />
                    <button
                      onClick={() => guardarEdicionContacto(c.id)}
                      className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs"
                    >
                      <Check size={14} />
                    </button>
                    <button
                      onClick={() => setEditandoId(null)}
                      className="w-7 h-7 rounded-lg bg-zinc-800 text-zinc-400 flex items-center justify-center text-xs"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div
                    key={c.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06]"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">{c.avatar || '😎'}</span>
                      <span className="text-xs font-bold text-white">{c.nombre}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          playClickSound();
                          setEditandoId(c.id);
                          setNombreTemp(c.nombre);
                          setAvatarTemp(c.avatar || '😎');
                        }}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-indigo-300 hover:bg-white/[0.05]"
                      >
                        <Edit2 size={13} />
                      </button>
                      {contactos.length > 2 && (
                        <button
                          onClick={() => eliminarContacto(c.id)}
                          className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setMostrarModalAmigos(false)}
              className="w-full py-2.5 rounded-2xl bg-white/[0.06] hover:bg-white/[0.1] text-white font-bold text-xs"
            >
              Listo
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
