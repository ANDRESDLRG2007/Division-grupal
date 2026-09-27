import React, { useEffect, useState } from 'react';
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
import { Persona, GastoSalida, PresetCategoria } from '../types';
import {
  fmt,
  uid,
  getNombre,
  AVATARES,
  calcularDeudasSalida,
} from '../utils/calculations';
import { playCoinSound, playClickSound } from '../utils/audio';
import { launchConfetti } from '../utils/confetti';
import { generarMensajeCobroSalida, compartirPorWhatsApp } from '../utils/whatsapp';

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

  useEffect(() => {
    setSeleccionados((prev) => prev.filter((id) => contactos.some((contacto) => contacto.id === id)));
  }, [contactos]);

  // Handlers
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
      <section
        className="relative overflow-hidden rounded-3xl p-5 flex flex-col gap-4"
        style={{
          background: 'linear-gradient(160deg, var(--azul-card) 0%, var(--azul) 60%, var(--azul-mid) 100%)',
          border: '1px solid rgba(210,242,94,0.15)',
          boxShadow: '0 12px 40px -10px rgba(0,0,0,0.55)',
        }}
      >
        {/* Decorative glows */}
        <div className="absolute top-0 right-0 w-36 h-36 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(210,242,94,0.10) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(78,194,110,0.10) 0%, transparent 70%)' }} />

        {/* Top Header */}
        <div className="flex items-center justify-between">
          <div
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold"
            style={{ background: 'rgba(210,242,94,0.12)', border: '1px solid rgba(210,242,94,0.28)', color: '#D2F25E' }}
          >
            <Sparkles size={12} />
            <span>Salida de Hoy</span>
          </div>

          <button
            onClick={() => { playClickSound(); setMostrarCalculadora(true); }}
            className="text-xs font-semibold text-zinc-400 hover:text-white flex items-center gap-1.5 py-1 px-2.5 rounded-lg transition-colors"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <Calculator size={13} style={{ color: '#D2F25E' }} />
            <span>Calculadora Mesa</span>
          </button>
        </div>

        {/* Amount display */}
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
            Total del Parche
          </span>
          <h2 className="text-4xl font-extrabold font-mono text-white tracking-tight">
            {fmt(totalSalidas)}
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            {gastosSalida.length === 0
              ? 'Aún no hay consumos registrados en este parche'
              : `${gastosSalida.length} consumo${gastosSalida.length !== 1 ? 's' : ''} registrado${gastosSalida.length !== 1 ? 's' : ''}`}
          </p>
        </div>

        {/* Primary CTA */}
        <button
          onClick={abrirModalNuevoGasto}
          className="w-full py-3.5 px-5 rounded-2xl btn-primary text-sm flex items-center justify-center gap-2 transition-all"
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
            <span
              className="text-[10px] font-bold px-1.5 py-0.5 rounded-md"
              style={{ background: 'rgba(210,242,94,0.10)', color: '#D2F25E' }}
            >
              {contactos.length}
            </span>
          </div>

          <button
            onClick={() => { playClickSound(); setMostrarModalAmigos(true); }}
            className="text-xs font-bold flex items-center gap-1 transition-colors"
            style={{ color: '#4EC26E' }}
          >
            <Users size={13} />
            <span>Gestionar</span>
          </button>
        </div>

        {/* Horizontal avatar row */}
        <div className="flex items-center gap-3 overflow-x-auto pb-1 -mx-1 px-1">
          {contactos.map((c) => (
            <div
              key={c.id}
              onClick={() => { playClickSound(); setMostrarModalAmigos(true); }}
              className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group"
            >
              <div
                className="w-13 h-13 rounded-2xl flex items-center justify-center text-2xl shadow-sm transition-all group-hover:scale-105"
                style={{ background: 'var(--azul-card)', border: '1px solid rgba(255,255,255,0.09)' }}
              >
                {c.avatar || '😎'}
              </div>
              <span className="text-[11px] font-bold text-zinc-300 group-hover:text-white max-w-[56px] truncate text-center leading-none">
                {c.nombre}
              </span>
            </div>
          ))}

          {/* Add Friend */}
          <button
            onClick={() => { playClickSound(); setMostrarModalAmigos(true); }}
            className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group"
          >
            <div
              className="w-13 h-13 rounded-2xl border-2 border-dashed flex items-center justify-center transition-all group-hover:scale-105"
              style={{ borderColor: 'rgba(210,242,94,0.35)', color: '#D2F25E' }}
            >
              <Plus size={20} strokeWidth={2.5} />
            </div>
            <span className="text-[11px] font-bold text-center leading-none" style={{ color: '#D2F25E' }}>
              Añadir
            </span>
          </button>
        </div>
      </section>

      {/* ── 3. PAGOS PENDIENTES ── */}
      {deudasSalida.length > 0 && (
        <section
          className="card-glass p-4 flex flex-col gap-3"
          style={{ borderColor: 'rgba(242,168,29,0.20)' }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap size={15} style={{ color: '#F2A81D' }} />
              <h3 className="text-xs font-black uppercase tracking-wider text-white">
                Pagos Pendientes ({deudasSalida.length})
              </h3>
            </div>
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ color: '#F2A81D', background: 'rgba(242,168,29,0.12)', border: '1px solid rgba(242,168,29,0.28)' }}
            >
              Cobrar por Nequi
            </span>
          </div>

          <div className="flex flex-col gap-2">
            {deudasSalida.map((d, i) => (
              <div
                key={i}
                className="p-3 rounded-2xl flex items-center justify-between gap-2"
                style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div className="text-xs text-zinc-300">
                  <span className="font-bold" style={{ color: '#F2A81D' }}>{getNombre(d.de, contactos)}</span>
                  <span className="text-zinc-500 mx-1.5">le debe</span>
                  <span className="font-bold" style={{ color: '#4EC26E' }}>{getNombre(d.para, contactos)}</span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-mono font-bold" style={{ color: '#F2A81D' }}>
                    {fmt(d.monto)}
                  </span>
                  <button
                    onClick={() => cobrarDeudaWhatsApp(d)}
                    className="py-1 px-2.5 rounded-xl font-bold text-[11px] flex items-center gap-1 transition-all active:scale-95"
                    style={{ background: '#4EC26E', color: '#0a1f11' }}
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

      {/* ── 4. BANNER RULETA ────────── */}
      <div
        onClick={() => { playClickSound(); onAbrirRuleta(); }}
        className="p-4 rounded-2xl flex items-center justify-between cursor-pointer transition-all group"
        style={{
          background: 'linear-gradient(120deg, rgba(210,242,94,0.08) 0%, color-mix(in srgb, var(--azul-mid) 60%, transparent) 100%)',
          border: '1px solid rgba(210,242,94,0.20)',
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform"
            style={{ background: 'rgba(210,242,94,0.12)', border: '1px solid rgba(210,242,94,0.25)' }}
          >
            🎰
          </div>
          <div className="flex flex-col">
            <h4 className="text-xs font-black text-white">
              ¿A quién le toca pagar hoy?
            </h4>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Gira la ruleta o elige castigos universitarios 🎲
            </p>
          </div>
        </div>

        <button
          className="py-1.5 px-3 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
          style={{ background: '#D2F25E', color: '#100E40' }}
        >
          <Dices size={14} />
          Girar
        </button>
      </div>

      {/* ── 5. CONSUMOS DEL PARCHE ───────────── */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400">
            Consumos Registrados ({gastosSalida.length})
          </h3>
          {gastosSalida.length > 0 && (
            <span className="text-xs font-mono font-bold" style={{ color: '#4EC26E' }}>
              Total {fmt(totalSalidas)}
            </span>
          )}
        </div>

        {gastosSalida.length === 0 ? (
          <div className="card-glass p-8 text-center flex flex-col items-center gap-2">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
              style={{ background: 'rgba(210,242,94,0.08)', border: '1px solid rgba(210,242,94,0.18)' }}
            >
              🍕
            </div>
            <h4 className="text-sm font-bold text-white mt-1">Sin consumos en esta salida</h4>
            <p className="text-xs text-zinc-400 max-w-xs">
              Toca "Dividir una Cuenta" arriba para registrar la comida, las polas o el taxi.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {gastosSalida.map((g) => {
              const porPersona = g.monto / Math.max(g.personas.length, 1);
              const pagadorNombre = getNombre(g.pagadoPor || g.personas[0], contactos);

              return (
                <div
                  key={g.id}
                  className="card-glass p-4 flex flex-col gap-3 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-col gap-0.5">
                      <h4 className="text-sm font-extrabold text-white leading-tight">
                        {g.descripcion}
                      </h4>
                      <p className="text-xs text-zinc-400">
                        Pagó <strong style={{ color: '#D2F25E' }}>{pagadorNombre}</strong> ·{' '}
                        {g.personas.length} personas ({fmt(porPersona)} c/u)
                      </p>
                    </div>

                    <span
                      className="text-sm font-mono font-black px-2.5 py-1 rounded-xl shrink-0"
                      style={{ color: '#4EC26E', background: 'rgba(78,194,110,0.10)', border: '1px solid rgba(78,194,110,0.22)' }}
                    >
                      {fmt(g.monto)}
                    </span>
                  </div>

                  {/* Participant badges */}
                  <div className="flex flex-wrap gap-1.5">
                    {g.personas.map((pid) => (
                      <span
                        key={pid}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] text-zinc-300"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                      >
                        <span>{getNombre(pid, contactos)}</span>
                        <span className="text-zinc-500 font-mono">{fmt(porPersona)}</span>
                      </span>
                    ))}
                  </div>

                  {/* Bottom actions */}
                  <div
                    className="flex items-center justify-between pt-2 text-xs text-zinc-500"
                    style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
                  >
                    <span className="text-[11px] font-mono text-zinc-400">{g.fecha}</span>
                    <button
                      onClick={() => eliminarGasto(g.id)}
                      className="flex items-center gap-1 text-xs font-semibold py-1 px-2 rounded-lg transition-colors hover:text-red-400"
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
          <div className="w-full max-w-[460px] bg-[var(--azul-mid)] border border-white/[0.1] rounded-t-3xl sm:rounded-3xl p-5 flex flex-col gap-4 shadow-2xl max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-sm"
                  style={{ background: 'rgba(210,242,94,0.12)', border: '1px solid rgba(210,242,94,0.25)' }}
                >
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
                    className="py-1.5 px-3 rounded-xl text-xs font-semibold border shrink-0 flex items-center gap-1.5 transition-all"
                    style={
                      categoriaSel === preset.id
                        ? { background: '#D2F25E', color: '#100E40', borderColor: '#D2F25E' }
                        : { background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.09)', color: '#94a3b8' }
                    }
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
              <div className="flex items-center bg-[var(--azul)] border border-white/[0.1] focus-within:border-[#D2F25E] rounded-2xl px-4 py-2.5">
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
                      className="py-1.5 px-3 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
                      style={
                        isPayer
                          ? { background: '#4EC26E', color: '#0a1f11' }
                          : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', color: '#94a3b8' }
                      }
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
                  className="text-xs font-bold"
                  style={{ color: '#D2F25E' }}
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
                      className="py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
                      style={
                        isSelected
                          ? { background: 'rgba(210,242,94,0.12)', border: '1px solid rgba(210,242,94,0.30)', color: '#D2F25E', fontWeight: 700 }
                          : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', color: '#64748b' }
                      }
                    >
                      <span>{c.avatar || '😎'}</span>
                      <span>{c.nombre}</span>
                      {isSelected && <Check size={13} style={{ color: '#D2F25E' }} className="ml-0.5" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Preview */}
            {seleccionados.length > 0 && Number(monto) > 0 && (
              <div
                className="p-3.5 rounded-2xl flex items-center justify-between"
                style={{ background: 'rgba(210,242,94,0.08)', border: '1px solid rgba(210,242,94,0.22)' }}
              >
                <div>
                  <p className="text-xs font-extrabold text-white">
                    {fmt(Number(monto) / seleccionados.length)}{' '}
                    <span className="font-normal text-zinc-400">cada uno</span>
                  </p>
                  <p className="text-[11px] text-zinc-400">
                    Le transfieren a{' '}
                    <strong style={{ color: '#4EC26E' }}>{getNombre(pagadoPor, contactos)}</strong>
                  </p>
                </div>
                <span
                  className="text-xs font-mono font-bold px-2.5 py-1 rounded-xl"
                  style={{ color: '#D2F25E', background: 'rgba(210,242,94,0.10)', border: '1px solid rgba(210,242,94,0.22)' }}
                >
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
              className="w-full py-3.5 rounded-2xl text-sm font-extrabold mt-1 flex items-center justify-center gap-2 transition-all active:scale-97"
              style={exito
                ? { background: '#4EC26E', color: '#0a1f11', borderRadius: 16 }
                : { background: '#D2F25E', color: '#100E40', borderRadius: 16, boxShadow: '0 6px 18px rgba(210,242,94,0.28)' }
              }
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
          <div className="w-full max-w-[400px] bg-[var(--azul-mid)] border border-white/[0.1] rounded-3xl p-5 flex flex-col gap-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#D2F25E]/15 border border-[#D2F25E]/30 flex items-center justify-center text-sm">
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
              <div className="flex items-center bg-[var(--azul)] border border-white/[0.1] focus-within:border-[#D2F25E] rounded-2xl px-4 py-2.5">
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
                        ? 'bg-[#D2F25E] text-[#0B2028] shadow-md shadow-[#D2F25E]/20'
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
                  incluirPropina ? 'bg-[#4EC26E] text-[#0B2028]' : 'bg-white/[0.08] text-zinc-400'
                }`}
              >
                {incluirPropina ? 'SÍ (+10%)' : 'NO'}
              </button>
            </div>

            {/* Result */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-950/40 to-[var(--azul-mid)] border border-cyan-500/30 text-center flex flex-col gap-1">
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
              className="w-full py-3 rounded-2xl bg-[#D2F25E] hover:brightness-105 text-[#0B2028] font-extrabold text-xs transition-all active:scale-95"
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
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center overflow-hidden overscroll-none backdrop-blur-md animate-fade-in"
          style={{ background: 'var(--azul-overlay)' }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="friends-modal-title"
            className="flex h-[100dvh] max-h-[100dvh] w-full max-w-[420px] flex-col overflow-hidden border border-white/[0.1] bg-[var(--azul-mid)] shadow-2xl sm:h-auto sm:max-h-[90dvh] sm:rounded-3xl"
          >
            <div className="flex shrink-0 items-center justify-between border-b border-white/[0.08] px-5 pb-3 pt-[max(env(safe-area-inset-top),16px)] sm:pt-4">
              <div className="flex items-center gap-2">
                <Users size={16} style={{ color: '#4EC26E' }} />
                <h3 id="friends-modal-title" className="text-sm font-extrabold text-white">Amigos del Parche</h3>
              </div>
              <button
                onClick={() => setMostrarModalAmigos(false)}
                className="w-8 h-8 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] flex items-center justify-center text-zinc-300 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            {/* Add friend */}
            <div className="mx-5 mt-4 flex shrink-0 items-center gap-2 rounded-2xl border border-white/[0.08] bg-[var(--azul)] p-2">
              <select
                value={nuevoAvatar}
                onChange={(e) => setNuevoAvatar(e.target.value)}
                className="bg-transparent text-lg p-1 text-white outline-none cursor-pointer"
              >
                {AVATARES.map((a) => (
                  <option key={a} value={a} className="bg-[var(--azul-mid)] text-white">
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
            <div className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain px-5 py-3">
              {contactos.map((c) => {
                const isEditing = editandoId === c.id;
                return isEditing ? (
                  <div
                    key={c.id}
                    className="flex items-center gap-2 p-2 bg-[var(--azul)] border border-white/10 rounded-xl"
                  >
                    <select
                      value={avatarTemp}
                      onChange={(e) => setAvatarTemp(e.target.value)}
                      className="bg-transparent text-lg text-white"
                    >
                      {AVATARES.map((a) => (
                        <option key={a} value={a} className="bg-[var(--azul-mid)]">
                          {a}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={nombreTemp}
                      onChange={(e) => setNombreTemp(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && guardarEdicionContacto(c.id)}
                      className="flex-1 bg-transparent text-xs font-bold text-white border-b border-[#D2F25E] outline-none"
                    />
                    <button
                      onClick={() => guardarEdicionContacto(c.id)}
                      className="w-7 h-7 rounded-lg bg-[#D2F25E] text-[#0B2028] flex items-center justify-center text-xs"
                    >
                      <Check size={14} />
                    </button>
                    <button
                      onClick={() => setEditandoId(null)}
                      className="w-7 h-7 rounded-lg bg-[var(--azul-card)] text-zinc-300 flex items-center justify-center text-xs"
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
                        className="p-1.5 rounded-lg text-zinc-400 hover:bg-white/[0.05]" style={{ '--hover-color': '#4EC26E' } as React.CSSProperties}
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

            <div className="shrink-0 border-t border-white/[0.08] px-5 pt-3 pb-[max(env(safe-area-inset-bottom),12px)]">
            <button
              onClick={() => setMostrarModalAmigos(false)}
              className="w-full py-2.5 rounded-2xl bg-[var(--azul-card)] hover:bg-[var(--azul-hover)] text-white font-bold text-xs"
            >
              Listo
            </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
