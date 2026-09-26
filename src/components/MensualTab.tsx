import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Check, X, AlertCircle, Users } from 'lucide-react';
import { Persona, GastoMensual, PresetCategoria } from '../types';
import { fmt, uid, getNombre, AVATARES } from '../utils/calculations';
import { playCoinSound, playClickSound } from '../utils/audio';

interface MensualTabProps {
  roomies: Persona[];
  gastosMensuales: GastoMensual[];
  onSaveRoomies: (roomies: Persona[]) => void;
  onSaveGastos: (gastos: GastoMensual[]) => void;
}

const PRESETS_APTO: PresetCategoria[] = [
  { id: 'arriendo', nombre: 'Arriendo', icono: '🏠', sugerenciaMonto: 900000 },
  { id: 'wifi', nombre: 'WiFi Fibra', icono: '📶', sugerenciaMonto: 85000 },
  { id: 'servicios', nombre: 'Servicios', icono: '⚡', sugerenciaMonto: 120000 },
  { id: 'mercado', nombre: 'Mercado Común', icono: '🛒', sugerenciaMonto: 150000 },
  { id: 'aseo', nombre: 'Aseo / Bolsas', icono: '🧼', sugerenciaMonto: 30000 },
];

export const MensualTab: React.FC<MensualTabProps> = ({
  roomies,
  gastosMensuales,
  onSaveRoomies,
  onSaveGastos,
}) => {
  const [mostrarModalGasto, setMostrarModalGasto] = useState(false);
  const [mostrarModalRoomies, setMostrarModalRoomies] = useState(false);

  const [desc, setDesc] = useState('');
  const [monto, setMonto] = useState('');
  const [pagadoPor, setPagadoPor] = useState(roomies[0]?.id || 'r1');
  const [participantes, setParticipantes] = useState<string[]>(roomies.map((r) => r.id));
  const [categoriaSel, setCategoriaSel] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState('');
  const [exito, setExito] = useState(false);

  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [nombreTemp, setNombreTemp] = useState('');
  const [avatarTemp, setAvatarTemp] = useState('🐼');
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevoAvatar, setNuevoAvatar] = useState('🦊');

  const toggleParticipante = (id: string) => {
    playClickSound();
    setParticipantes((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const seleccionarTodos = () => {
    playClickSound();
    if (participantes.length === roomies.length) {
      setParticipantes([pagadoPor]);
    } else {
      setParticipantes(roomies.map((r) => r.id));
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

  const abrirModalGasto = () => {
    playClickSound();
    setDesc('');
    setMonto('');
    setCategoriaSel('');
    setErrorMsg('');
    setParticipantes(roomies.map((r) => r.id));
    if (roomies[0] && !roomies.some((r) => r.id === pagadoPor)) {
      setPagadoPor(roomies[0].id);
    }
    setMostrarModalGasto(true);
  };

  const agregarGasto = () => {
    setErrorMsg('');
    if (!desc.trim()) {
      setErrorMsg('Por favor escribe qué se pagó (ej: Arriendo, WiFi)');
      return;
    }
    const numMonto = parseFloat(monto);
    if (isNaN(numMonto) || numMonto <= 0) {
      setErrorMsg('Ingresa un monto válido mayor a 0');
      return;
    }
    if (participantes.length === 0) {
      setErrorMsg('Selecciona al menos un roomie que divida');
      return;
    }

    const nuevoGasto: GastoMensual = {
      id: uid(),
      descripcion: desc.trim(),
      monto: numMonto,
      categoria: categoriaSel || 'general',
      pagadoPor,
      participantes,
      fecha: new Date().toLocaleDateString('es-CO', { day: '2-digit', month: 'short' }),
      timestamp: Date.now(),
    };

    onSaveGastos([nuevoGasto, ...gastosMensuales]);
    playCoinSound();
    setExito(true);
    setTimeout(() => {
      setExito(false);
      setMostrarModalGasto(false);
    }, 700);
  };

  const eliminarGasto = (id: string) => {
    playClickSound();
    onSaveGastos(gastosMensuales.filter((g) => g.id !== id));
  };

  const agregarNuevoRoomie = () => {
    if (!nuevoNombre.trim()) return;
    const nuevo: Persona = {
      id: uid(),
      nombre: nuevoNombre.trim(),
      avatar: nuevoAvatar,
    };
    const updated = [...roomies, nuevo];
    onSaveRoomies(updated);
    setParticipantes(updated.map((r) => r.id));
    setNuevoNombre('');
    playClickSound();
  };

  const guardarEdicionRoomie = (id: string) => {
    if (!nombreTemp.trim()) return;
    const updated = roomies.map((r) =>
      r.id === id ? { ...r, nombre: nombreTemp.trim(), avatar: avatarTemp } : r
    );
    onSaveRoomies(updated);
    setEditandoId(null);
    playClickSound();
  };

  const eliminarRoomie = (id: string) => {
    if (roomies.length <= 2) return;
    playClickSound();
    const updated = roomies.filter((r) => r.id !== id);
    onSaveRoomies(updated);
    setParticipantes((prev) => prev.filter((p) => p !== id));
    if (pagadoPor === id && updated[0]) {
      setPagadoPor(updated[0].id);
    }
  };

  const totalMensual = gastosMensuales.reduce((s, g) => s + g.monto, 0);

  return (
    <div className="px-4 pt-3 pb-8 flex flex-col gap-5 animate-fade-in max-w-[480px] mx-auto">
      {/* ── APARTAMENTO HEADER ────────────────────────────── */}
      <section className="card-glass p-5 flex flex-col gap-3.5 bg-gradient-to-br from-[#121829] to-[#0c101c]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🏠</span>
            <div>
              <h2 className="text-sm font-extrabold text-white">Gastos de Apartamento</h2>
              <p className="text-[11px] text-zinc-400">Arriendo, servicios y mercado de roomies</p>
            </div>
          </div>
          <button
            onClick={() => {
              playClickSound();
              setMostrarModalRoomies(true);
            }}
            className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
          >
            <Users size={14} /> {roomies.length} Roomies
          </button>
        </div>

        {/* Metric & Button */}
        <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
          <div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
              Total del Mes
            </span>
            <p className="text-2xl font-mono font-black text-emerald-400">
              {fmt(totalMensual)}
            </p>
          </div>

          <button
            onClick={abrirModalGasto}
            className="py-2.5 px-4 rounded-xl btn-primary text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-indigo-600/30"
          >
            <Plus size={15} strokeWidth={2.5} />
            Registrar Gasto
          </button>
        </div>
      </section>

      {/* ── ROOMIES STRIP ─────────────────────────────────── */}
      <section className="card-glass p-4 flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Roomies ({roomies.length})
          </h3>
          <button
            onClick={() => setMostrarModalRoomies(true)}
            className="text-xs font-bold text-indigo-400 hover:text-indigo-300"
          >
            Editar o Agregar
          </button>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {roomies.map((r) => (
            <div
              key={r.id}
              className="shrink-0 flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-white/[0.04] border border-white/[0.07] text-xs font-semibold text-zinc-200"
            >
              <span>{r.avatar || '😎'}</span>
              <span>{r.nombre}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── HISTORIAL DE GASTOS DEL APARTAMENTO ───────────── */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Historial de Gastos ({gastosMensuales.length})
          </h3>
          <span className="text-xs font-mono font-bold text-emerald-400">
            {fmt(totalMensual)}
          </span>
        </div>

        {gastosMensuales.length === 0 ? (
          <div className="card-glass p-8 text-center flex flex-col items-center gap-1">
            <span className="text-3xl block">🧾</span>
            <p className="text-xs font-bold text-white">No hay gastos del apartamento este mes</p>
            <p className="text-[11px] text-zinc-400">Registra el arriendo, servicios o mercado arriba.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {gastosMensuales.map((g) => {
              const parte = g.monto / Math.max(g.participantes.length, 1);
              const pagadorNombre = getNombre(g.pagadoPor, roomies);

              return (
                <div key={g.id} className="card-glass p-4 flex flex-col gap-2.5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-extrabold text-white">{g.descripcion}</h4>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        Pagó <strong className="text-indigo-300">{pagadorNombre}</strong> ·{' '}
                        {g.participantes.length} personas ({fmt(parte)} c/u)
                      </p>
                    </div>
                    <span className="text-sm font-mono font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-1 rounded-xl shrink-0">
                      {fmt(g.monto)}
                    </span>
                  </div>

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
          MODAL: REGISTRAR GASTO APTO
      ══════════════════════════════════════════════════════════ */}
      {mostrarModalGasto && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto animate-fade-in">
          <div className="w-full max-w-[460px] bg-[#121829] border border-white/[0.1] rounded-t-3xl sm:rounded-3xl p-5 flex flex-col gap-4 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <span className="text-lg">🏠</span>
                <div>
                  <h3 className="text-sm font-extrabold text-white">Gasto de Apartamento</h3>
                  <p className="text-[11px] text-zinc-400">División equitativa entre roomies</p>
                </div>
              </div>
              <button
                onClick={() => setMostrarModalGasto(false)}
                className="w-8 h-8 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] flex items-center justify-center text-zinc-300 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            {/* Presets */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                Atajos:
              </label>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {PRESETS_APTO.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => aplicarPreset(preset)}
                    className={`py-1.5 px-3 rounded-xl text-xs font-semibold border shrink-0 flex items-center gap-1.5 transition-all ${
                      categoriaSel === preset.id
                        ? 'bg-indigo-600 text-white border-indigo-400'
                        : 'bg-white/[0.04] border-white/[0.08] text-zinc-300'
                    }`}
                  >
                    <span>{preset.icono}</span>
                    <span>{preset.nombre}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Monto */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold text-zinc-200">Monto total</label>
                <div className="flex gap-1">
                  {[50000, 100000, 500000].map((val) => (
                    <button
                      key={val}
                      onClick={() => sumarMonto(val)}
                      className="text-[11px] py-0.5 px-2 rounded-lg bg-white/[0.05] border border-white/[0.08] text-zinc-400 font-mono"
                    >
                      +{val >= 1000 ? `${val / 1000}k` : val}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center bg-[#151c30] border border-white/[0.1] focus-within:border-emerald-500 rounded-2xl px-4 py-2.5">
                <span className="text-emerald-400 font-mono font-bold text-xl mr-2">$</span>
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="0"
                  value={monto}
                  onChange={(e) => setMonto(e.target.value)}
                  className="w-full bg-transparent text-xl font-mono font-extrabold text-emerald-400 placeholder-zinc-600 outline-none"
                  autoFocus
                />
              </div>
            </div>

            {/* Descripción */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-extrabold text-zinc-200">
                ¿Qué se pagó?
              </label>
              <input
                type="text"
                placeholder="Ej. Factura de Gas, Arriendo Mayo, WiFi..."
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                className="input-clean font-medium !py-2.5 !text-sm"
              />
            </div>

            {/* Quién pagó */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-extrabold text-zinc-200">
                ¿Quién pagó la cuenta? 💳
              </label>
              <div className="flex flex-wrap gap-1.5">
                {roomies.map((r) => {
                  const isPayer = pagadoPor === r.id;
                  return (
                    <button
                      key={r.id}
                      onClick={() => {
                        playClickSound();
                        setPagadoPor(r.id);
                      }}
                      className={`py-1.5 px-3 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                        isPayer
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                          : 'bg-white/[0.04] border border-white/[0.08] text-zinc-300'
                      }`}
                    >
                      <span>{r.avatar || '😎'}</span>
                      <span>{r.nombre}</span>
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
                  ¿Quiénes dividen? ({participantes.length}/{roomies.length})
                </label>
                <button
                  onClick={seleccionarTodos}
                  className="text-xs font-bold text-indigo-400"
                >
                  {participantes.length === roomies.length ? 'Deseleccionar' : 'Todos'}
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {roomies.map((r) => {
                  const isSelected = participantes.includes(r.id);
                  return (
                    <button
                      key={r.id}
                      onClick={() => toggleParticipante(r.id)}
                      className={`py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                        isSelected
                          ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-bold'
                          : 'bg-white/[0.03] border border-white/[0.07] text-zinc-400'
                      }`}
                    >
                      <span>{r.avatar || '😎'}</span>
                      <span>{r.nombre}</span>
                      {isSelected && <Check size={13} className="text-emerald-400 ml-0.5" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {errorMsg && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold">
                <AlertCircle size={15} />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              onClick={agregarGasto}
              className={`w-full py-3.5 rounded-2xl btn-primary text-sm font-extrabold ${
                exito ? '!bg-emerald-600' : ''
              }`}
            >
              {exito ? '¡Gasto Guardado!' : 'Guardar Gasto del Mes'}
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          MODAL: GESTIÓN DE ROOMIES
      ══════════════════════════════════════════════════════════ */}
      {mostrarModalRoomies && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="w-full max-w-[420px] bg-[#121829] border border-white/[0.1] rounded-3xl p-5 flex flex-col gap-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <span className="text-lg">🏠</span>
                <h3 className="text-sm font-extrabold text-white">Integrantes del Apartamento</h3>
              </div>
              <button
                onClick={() => setMostrarModalRoomies(false)}
                className="w-8 h-8 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] flex items-center justify-center text-zinc-300 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            {/* Add roomie */}
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
                placeholder="Nombre del roomie..."
                value={nuevoNombre}
                onChange={(e) => setNuevoNombre(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && agregarNuevoRoomie()}
                className="flex-1 bg-transparent text-xs font-semibold text-white outline-none placeholder-zinc-500"
              />
              <button
                onClick={agregarNuevoRoomie}
                className="py-1.5 px-3 rounded-xl btn-primary text-xs font-bold"
              >
                Añadir
              </button>
            </div>

            {/* Roomies list */}
            <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1">
              {roomies.map((r) => {
                const isEditing = editandoId === r.id;
                return isEditing ? (
                  <div
                    key={r.id}
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
                      onKeyDown={(e) => e.key === 'Enter' && guardarEdicionRoomie(r.id)}
                      className="flex-1 bg-transparent text-xs font-bold text-white border-b border-indigo-400 outline-none"
                      autoFocus
                    />
                    <button
                      onClick={() => guardarEdicionRoomie(r.id)}
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
                    key={r.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06]"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">{r.avatar || '😎'}</span>
                      <span className="text-xs font-bold text-white">{r.nombre}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          playClickSound();
                          setEditandoId(r.id);
                          setNombreTemp(r.nombre);
                          setAvatarTemp(r.avatar || '😎');
                        }}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-indigo-300 hover:bg-white/[0.05]"
                      >
                        <Edit2 size={13} />
                      </button>
                      {roomies.length > 2 && (
                        <button
                          onClick={() => eliminarRoomie(r.id)}
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
              onClick={() => setMostrarModalRoomies(false)}
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
