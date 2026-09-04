import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Check, X, Building2, Zap, Wifi, ShoppingCart, Sparkles, AlertCircle } from 'lucide-react';
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
  { id: 'servicios', nombre: 'Luz / Gas / Agua', icono: '⚡', sugerenciaMonto: 120000 },
  { id: 'mercado', nombre: 'Mercado Común', icono: '🛒', sugerenciaMonto: 150000 },
  { id: 'aseo', nombre: 'Aseo y Bolsas', icono: '🧼', sugerenciaMonto: 35000 },
  { id: 'domicilio', nombre: 'Comida Roomies', icono: '🍕', sugerenciaMonto: 45000 },
];

export const MensualTab: React.FC<MensualTabProps> = ({
  roomies,
  gastosMensuales,
  onSaveRoomies,
  onSaveGastos,
}) => {
  // Form State
  const [desc, setDesc] = useState('');
  const [monto, setMonto] = useState('');
  const [pagadoPor, setPagadoPor] = useState(roomies[0]?.id || 'r1');
  const [participantes, setParticipantes] = useState<string[]>(roomies.map(r => r.id));
  const [categoriaSel, setCategoriaSel] = useState<string>('');
  
  // Roomie Edit State
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [nombreTemp, setNombreTemp] = useState('');
  const [avatarTemp, setAvatarTemp] = useState('🐼');
  const [mostrarNuevoRoomie, setMostrarNuevoRoomie] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevoAvatar, setNuevoAvatar] = useState('🦊');

  const [errorMsg, setErrorMsg] = useState('');
  const [exito, setExito] = useState(false);

  // Toggle participant
  const toggleParticipante = (id: string) => {
    playClickSound();
    setParticipantes(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const seleccionarTodos = () => {
    playClickSound();
    if (participantes.length === roomies.length) {
      setParticipantes([pagadoPor]);
    } else {
      setParticipantes(roomies.map(r => r.id));
    }
  };

  // Quick preset click
  const aplicarPreset = (preset: PresetCategoria) => {
    playClickSound();
    setDesc(preset.nombre);
    setCategoriaSel(preset.id);
    if (!monto && preset.sugerenciaMonto) {
      setMonto(preset.sugerenciaMonto.toString());
    }
  };

  // Add quick amount
  const sumarMonto = (sum: number) => {
    playClickSound();
    const curr = Number(monto) || 0;
    setMonto((curr + sum).toString());
  };

  // Submit expense
  const agregarGasto = () => {
    setErrorMsg('');
    if (!desc.trim()) {
      setErrorMsg('Por favor escribe qué se pagó.');
      return;
    }
    const numMonto = parseFloat(monto);
    if (isNaN(numMonto) || numMonto <= 0) {
      setErrorMsg('Ingresa un monto válido mayor a 0.');
      return;
    }
    if (participantes.length < 2) {
      setErrorMsg('Selecciona al menos 2 personas para dividir.');
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
    setDesc('');
    setMonto('');
    setCategoriaSel('');
    setExito(true);
    setTimeout(() => setExito(false), 2200);
  };

  const eliminarGasto = (id: string) => {
    playClickSound();
    onSaveGastos(gastosMensuales.filter(g => g.id !== id));
  };

  // Roomies management
  const agregarNuevoRoomie = () => {
    if (!nuevoNombre.trim()) return;
    const nuevo: Persona = {
      id: uid(),
      nombre: nuevoNombre.trim(),
      avatar: nuevoAvatar,
    };
    const updated = [...roomies, nuevo];
    onSaveRoomies(updated);
    setParticipantes(updated.map(r => r.id));
    setNuevoNombre('');
    setMostrarNuevoRoomie(false);
    playClickSound();
  };

  const guardarEdicionRoomie = (id: string) => {
    if (!nombreTemp.trim()) return;
    const updated = roomies.map(r =>
      r.id === id ? { ...r, nombre: nombreTemp.trim(), avatar: avatarTemp } : r
    );
    onSaveRoomies(updated);
    setEditandoId(null);
    playClickSound();
  };

  const eliminarRoomie = (id: string) => {
    if (roomies.length <= 2) return;
    playClickSound();
    const updated = roomies.filter(r => r.id !== id);
    onSaveRoomies(updated);
    setParticipantes(prev => prev.filter(p => p !== id));
    if (pagadoPor === id && updated[0]) {
      setPagadoPor(updated[0].id);
    }
  };

  const totalMensual = gastosMensuales.reduce((s, g) => s + g.monto, 0);

  return (
    <div className="px-4 py-3 animate-fade-in space-y-4">
      {/* ── SECCIÓN ROOMIES ───────────────────────── */}
      <section className="glass-card p-3.5">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-1.5">
            <span className="text-base">🏠</span>
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
              Integrantes del Apartamento ({roomies.length})
            </h3>
          </div>
          <button
            onClick={() => {
              playClickSound();
              setMostrarNuevoRoomie(!mostrarNuevoRoomie);
            }}
            className="text-[11px] font-bold text-violet-400 hover:text-violet-300 flex items-center gap-1"
          >
            <Plus size={13} /> Agregar
          </button>
        </div>

        {/* Roomies Chips */}
        <div className="flex flex-wrap gap-1.5">
          {roomies.map(r => {
            const isEditing = editandoId === r.id;
            return isEditing ? (
              <div
                key={r.id}
                className="flex items-center gap-1 p-1 bg-[#181c2b] border border-violet-500/60 rounded-xl"
              >
                <select
                  value={avatarTemp}
                  onChange={e => setAvatarTemp(e.target.value)}
                  className="bg-transparent text-sm cursor-pointer p-0.5"
                >
                  {AVATARES.map(a => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={nombreTemp}
                  onChange={e => setNombreTemp(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && guardarEdicionRoomie(r.id)}
                  className="w-20 bg-transparent text-xs text-white px-1 border-b border-violet-400"
                  autoFocus
                />
                <button
                  onClick={() => guardarEdicionRoomie(r.id)}
                  className="w-6 h-6 rounded-lg bg-violet-600 text-white flex items-center justify-center text-xs"
                >
                  <Check size={12} />
                </button>
                <button
                  onClick={() => setEditandoId(null)}
                  className="w-6 h-6 rounded-lg bg-zinc-800 text-zinc-400 flex items-center justify-center text-xs"
                >
                  <X size={12} />
                </button>
              </div>
            ) : (
              <div
                key={r.id}
                className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full bg-white/[0.05] border border-white/[0.09] text-xs text-zinc-200"
              >
                <span>{r.avatar || '😎'}</span>
                <span className="font-semibold">{r.nombre}</span>
                <button
                  onClick={() => {
                    playClickSound();
                    setEditandoId(r.id);
                    setNombreTemp(r.nombre);
                    setAvatarTemp(r.avatar || '😎');
                  }}
                  className="text-zinc-500 hover:text-violet-400 p-0.5 ml-0.5"
                >
                  <Edit2 size={11} />
                </button>
                {roomies.length > 2 && (
                  <button
                    onClick={() => eliminarRoomie(r.id)}
                    className="text-zinc-500 hover:text-rose-400 p-0.5"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Add Roomie Form Input */}
        {mostrarNuevoRoomie && (
          <div className="mt-3 pt-3 border-t border-white/[0.06] flex items-center gap-1.5 animate-fade-in">
            <select
              value={nuevoAvatar}
              onChange={e => setNuevoAvatar(e.target.value)}
              className="bg-[#181c2b] text-base p-1.5 rounded-xl border border-white/[0.1]"
            >
              {AVATARES.map(a => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Nombre del roomie..."
              value={nuevoNombre}
              onChange={e => setNuevoNombre(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && agregarNuevoRoomie()}
              className="flex-1 bg-white/[0.05] border border-white/[0.1] rounded-xl px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:border-violet-500"
            />
            <button
              onClick={agregarNuevoRoomie}
              className="py-1.5 px-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs"
            >
              Guardar
            </button>
          </div>
        )}
      </section>

      {/* ── FORMULARIO DE GASTO ───────────────────────── */}
      <section className="glass-card-glow p-4 space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-violet-400 shadow-[0_0_8px_#a78bfa]"></span>
            <h2 className="text-sm font-extrabold text-white">Registrar Gasto de Apartamento</h2>
          </div>
          <span className="text-[10px] text-zinc-400 font-medium">Equitativo / Custom</span>
        </div>

        {/* Quick Presets */}
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1.5">
            ⚡ Atajos rápidos:
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {PRESETS_APTO.map(preset => (
              <button
                key={preset.id}
                onClick={() => aplicarPreset(preset)}
                className={`py-1.5 px-2 rounded-xl text-left border flex items-center gap-1.5 transition-all active:scale-95 ${
                  categoriaSel === preset.id
                    ? 'bg-violet-600/25 border-violet-500 text-violet-200 font-bold'
                    : 'bg-white/[0.03] border-white/[0.06] text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <span className="text-sm">{preset.icono}</span>
                <span className="text-[11px] truncate">{preset.nombre}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Description & Amount */}
        <div className="space-y-2.5">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
              ¿Qué se pagó?
            </label>
            <input
              type="text"
              placeholder="Ej: Arriendo, Mercado Éxito, Factura EPM..."
              value={desc}
              onChange={e => setDesc(e.target.value)}
              className="w-full bg-black/30 border border-white/[0.1] focus:border-violet-500 rounded-xl px-3.5 py-2 text-sm text-white placeholder-zinc-500 transition-colors"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Monto total ($)
              </label>
              {/* Quick addition buttons */}
              <div className="flex gap-1">
                {[50000, 100000, 500000].map(val => (
                  <button
                    key={val}
                    onClick={() => sumarMonto(val)}
                    className="text-[10px] py-0.5 px-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-zinc-400 hover:text-violet-300 font-mono"
                  >
                    +{val >= 1000 ? `${val / 1000}k` : val}
                  </button>
                ))}
              </div>
            </div>
            <input
              type="number"
              inputMode="numeric"
              placeholder="0"
              value={monto}
              onChange={e => setMonto(e.target.value)}
              className="w-full bg-black/30 border border-white/[0.1] focus:border-violet-500 rounded-xl px-3.5 py-2.5 text-base font-mono font-bold text-emerald-400 placeholder-zinc-600 transition-colors"
            />
          </div>
        </div>

        {/* Who Paid & Participants */}
        <div className="space-y-3 pt-1">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1.5">
              ¿Quién puso la plata? 💳
            </label>
            <div className="flex flex-wrap gap-1.5">
              {roomies.map(r => (
                <button
                  key={r.id}
                  onClick={() => {
                    playClickSound();
                    setPagadoPor(r.id);
                  }}
                  className={`py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    pagadoPor === r.id
                      ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold shadow-md shadow-violet-600/30 scale-102 border border-violet-400/40'
                      : 'bg-white/[0.04] text-zinc-400 border border-white/[0.06] hover:text-zinc-200'
                  }`}
                >
                  <span>{r.avatar || '😎'}</span>
                  <span>{r.nombre}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                ¿Quiénes dividen? ({participantes.length}/{roomies.length})
              </label>
              <button
                onClick={seleccionarTodos}
                className="text-[10px] font-bold text-cyan-400 hover:text-cyan-300"
              >
                {participantes.length === roomies.length ? 'Deseleccionar' : 'Todos'}
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {roomies.map(r => {
                const isSelected = participantes.includes(r.id);
                return (
                  <button
                    key={r.id}
                    onClick={() => toggleParticipante(r.id)}
                    className={`py-1.5 px-3 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      isSelected
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-sm'
                        : 'bg-white/[0.03] text-zinc-500 border border-white/[0.05]'
                    }`}
                  >
                    <span>{r.avatar || '😎'}</span>
                    <span>{r.nombre}</span>
                    {isSelected && <Check size={11} className="text-emerald-400 ml-0.5" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Real-time Division Preview */}
        {participantes.length >= 2 && Number(monto) > 0 && (
          <div className="p-3 rounded-xl bg-violet-950/40 border border-violet-500/30 flex items-center justify-between animate-pop-in">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-amber-400" />
              <div>
                <p className="text-[11px] text-zinc-300 font-medium">
                  {fmt(Number(monto) / participantes.length)} por cabeza
                </p>
                <p className="text-[10px] text-violet-300">
                  Le deben a <strong className="text-white">{getNombre(pagadoPor, roomies)}</strong>
                </p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400">
              {participantes.length} personas
            </span>
          </div>
        )}

        {/* Error Message */}
        {errorMsg && (
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
            <AlertCircle size={14} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={agregarGasto}
          className={`w-full btn-neon ${exito ? '!bg-emerald-600 text-white' : ''}`}
        >
          {exito ? (
            <>
              <Check size={18} />
              ¡Gasto Registrado con Éxito!
            </>
          ) : (
            <>
              <Plus size={18} />
              Guardar Gasto del Mes
            </>
          )}
        </button>
      </section>

      {/* ── HISTORIAL DE GASTOS ───────────────────────── */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Historial de Gastos ({gastosMensuales.length})
          </h3>
          <span className="text-xs font-mono font-bold text-violet-400">
            Total: {fmt(totalMensual)}
          </span>
        </div>

        {gastosMensuales.length === 0 ? (
          <div className="glass-card p-8 text-center text-zinc-500">
            <div className="text-3xl mb-2 opacity-50">🧾</div>
            <p className="text-xs font-medium">Aún no hay gastos registrados este mes.</p>
            <p className="text-[11px] text-zinc-600 mt-1">Usa el formulario arriba para empezar.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {gastosMensuales.map(g => {
              const parte = g.monto / g.participantes.length;
              const deudores = g.participantes.filter(p => p !== g.pagadoPor);

              return (
                <div key={g.id} className="glass-card p-3.5 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-white tracking-tight">{g.descripcion}</h4>
                      <p className="text-[11px] text-zinc-400">
                        Pagó <strong className="text-violet-300">{getNombre(g.pagadoPor, roomies)}</strong> · {g.participantes.length} personas ({fmt(parte)} c/u)
                      </p>
                    </div>
                    <span className="text-sm font-mono font-bold text-emerald-400">
                      {fmt(g.monto)}
                    </span>
                  </div>

                  {/* Debts breakdown within this expense */}
                  {deudores.length > 0 && (
                    <div className="p-2 rounded-lg bg-black/20 border border-white/[0.04] text-[11px] space-y-1">
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                        Deben pagarle a {getNombre(g.pagadoPor, roomies)}:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {deudores.map(pid => (
                          <span
                            key={pid}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/[0.05] text-zinc-300 font-medium text-[11px]"
                          >
                            <span>{getNombre(pid, roomies)}</span>
                            <span className="text-rose-400 font-mono font-bold">-{fmt(parte)}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Card Footer */}
                  <div className="flex items-center justify-between pt-1 text-[11px] text-zinc-500">
                    <span className="px-2 py-0.5 rounded bg-white/[0.04] text-[10px] font-mono">
                      {g.fecha}
                    </span>
                    <button
                      onClick={() => eliminarGasto(g.id)}
                      className="text-zinc-500 hover:text-rose-400 flex items-center gap-1 text-[11px] transition-colors"
                    >
                      <Trash2 size={12} />
                      Eliminar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
