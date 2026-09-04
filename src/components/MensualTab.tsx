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
      <section className="glass-card p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-violet-500/20 flex items-center justify-center text-sm border border-violet-500/30">
              🏠
            </div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-200">
              Integrantes del Apartamento ({roomies.length})
            </h3>
          </div>
          <button
            onClick={() => {
              playClickSound();
              setMostrarNuevoRoomie(!mostrarNuevoRoomie);
            }}
            className="text-xs font-bold text-violet-400 hover:text-violet-300 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/30 px-2.5 py-1 rounded-xl flex items-center gap-1 transition-all active:scale-95"
          >
            <Plus size={13} /> Agregar
          </button>
        </div>

        {/* Roomies Chips */}
        <div className="flex flex-wrap gap-2">
          {roomies.map(r => {
            const isEditing = editandoId === r.id;
            return isEditing ? (
              <div
                key={r.id}
                className="flex items-center gap-1.5 p-1.5 bg-[#172138] border-2 border-violet-400 rounded-2xl shadow-md"
              >
                <select
                  value={avatarTemp}
                  onChange={e => setAvatarTemp(e.target.value)}
                  className="bg-[#101626] text-base cursor-pointer p-1 rounded-lg border border-slate-700"
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
                  className="w-24 bg-[#101626] text-xs font-bold text-white px-2 py-1 rounded-lg border border-slate-700 focus:border-violet-400"
                  autoFocus
                />
                <button
                  onClick={() => guardarEdicionRoomie(r.id)}
                  className="w-7 h-7 rounded-xl bg-violet-600 hover:bg-violet-500 text-white flex items-center justify-center text-xs shadow-sm"
                >
                  <Check size={14} />
                </button>
                <button
                  onClick={() => setEditandoId(null)}
                  className="w-7 h-7 rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center text-xs"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div
                key={r.id}
                className="inline-flex items-center gap-2 py-1.5 px-3 rounded-2xl bg-[#161f33] border border-slate-700/80 hover:border-slate-600 text-xs text-slate-100 shadow-sm transition-all"
              >
                <span className="text-sm bg-slate-800/80 p-0.5 rounded-lg">{r.avatar || '😎'}</span>
                <span className="font-bold tracking-tight">{r.nombre}</span>
                <div className="flex items-center gap-1 ml-1 pl-1 border-l border-slate-700">
                  <button
                    onClick={() => {
                      playClickSound();
                      setEditandoId(r.id);
                      setNombreTemp(r.nombre);
                      setAvatarTemp(r.avatar || '😎');
                    }}
                    className="text-slate-400 hover:text-violet-400 p-1 rounded-md hover:bg-slate-700/50 transition-colors"
                  >
                    <Edit2 size={12} />
                  </button>
                  {roomies.length > 2 && (
                    <button
                      onClick={() => eliminarRoomie(r.id)}
                      className="text-slate-400 hover:text-rose-400 p-1 rounded-md hover:bg-rose-500/10 transition-colors"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Add Roomie Form Input */}
        {mostrarNuevoRoomie && (
          <div className="mt-3 pt-3 border-t border-slate-800 flex items-center gap-2 animate-fade-in">
            <select
              value={nuevoAvatar}
              onChange={e => setNuevoAvatar(e.target.value)}
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
              placeholder="Nombre del roomie..."
              value={nuevoNombre}
              onChange={e => setNuevoNombre(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && agregarNuevoRoomie()}
              className="flex-1 bg-[#111726] border border-slate-700 focus:border-violet-500 rounded-xl px-3.5 py-2 text-xs font-bold text-white placeholder-slate-500 transition-all"
            />
            <button
              onClick={agregarNuevoRoomie}
              className="py-2 px-3.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-extrabold text-xs shadow-md shadow-violet-600/30"
            >
              Guardar
            </button>
          </div>
        )}
      </section>

      {/* ── FORMULARIO DE GASTO ───────────────────────── */}
      <section className="glass-card-glow p-4 space-y-4">
        <div className="flex items-center justify-between pb-1 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-violet-400 shadow-[0_0_10px_#a78bfa]"></span>
            <h2 className="text-sm font-black text-white tracking-tight">Registrar Gasto de Apartamento</h2>
          </div>
          <span className="text-[11px] font-bold text-violet-300 bg-violet-500/15 border border-violet-500/30 px-2 py-0.5 rounded-full">
            Equitativo
          </span>
        </div>

        {/* Quick Presets */}
        <div>
          <label className="text-[10px] font-black uppercase tracking-wider text-slate-300 block mb-2 flex items-center gap-1">
            <span>⚡</span> Atajos rápidos del mes:
          </label>
          <div className="grid grid-cols-3 gap-2">
            {PRESETS_APTO.map(preset => (
              <button
                key={preset.id}
                onClick={() => aplicarPreset(preset)}
                className={`p-2.5 rounded-2xl text-left border flex items-center gap-2 transition-all active:scale-95 shadow-sm ${
                  categoriaSel === preset.id
                    ? 'bg-violet-600/35 border-violet-400 text-white font-black shadow-md shadow-violet-500/25 scale-[1.02]'
                    : 'bg-[#141b2d] hover:bg-[#1b253d] border-slate-700/80 text-slate-300'
                }`}
              >
                <span className="text-base shrink-0 p-1 bg-slate-800/80 rounded-lg">{preset.icono}</span>
                <span className="text-xs font-bold truncate">{preset.nombre}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Description & Amount */}
        <div className="space-y-3">
          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-300 block mb-1.5">
              ¿Qué se pagó?
            </label>
            <input
              type="text"
              placeholder="Ej: Factura de gas, Mercado Éxito, Arriendo..."
              value={desc}
              onChange={e => setDesc(e.target.value)}
              className="w-full bg-[#101626] border-2 border-slate-700/90 focus:border-violet-500 rounded-2xl px-4 py-3 text-sm font-semibold text-white placeholder-slate-500 transition-all shadow-inner"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-300">
                Monto total ($)
              </label>
              {/* Quick addition buttons */}
              <div className="flex gap-1.5">
                {[50000, 100000, 500000].map(val => (
                  <button
                    key={val}
                    onClick={() => sumarMonto(val)}
                    className="text-xs py-1 px-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-emerald-300 font-mono font-bold transition-all active:scale-95 shadow-sm"
                  >
                    +{val >= 1000 ? `${val / 1000}k` : val}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center bg-[#101626] border-2 border-slate-700/90 focus-within:border-emerald-400 rounded-2xl px-4 py-2.5 transition-all shadow-inner">
              <span className="text-emerald-400 font-mono font-black text-xl mr-2">$</span>
              <input
                type="number"
                inputMode="numeric"
                placeholder="0"
                value={monto}
                onChange={e => setMonto(e.target.value)}
                className="w-full bg-transparent text-xl font-mono font-black text-emerald-400 placeholder-slate-600 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Who Paid & Participants */}
        <div className="space-y-3.5 pt-1">
          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-300 block mb-2">
              ¿Quién puso la plata? 💳
            </label>
            <div className="flex flex-wrap gap-2">
              {roomies.map(r => (
                <button
                  key={r.id}
                  onClick={() => {
                    playClickSound();
                    setPagadoPor(r.id);
                  }}
                  className={`py-2 px-3.5 rounded-2xl text-xs font-extrabold flex items-center gap-2 transition-all active:scale-95 shadow-sm ${
                    pagadoPor === r.id
                      ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-black shadow-md shadow-violet-600/35 border-2 border-violet-300 scale-[1.03]'
                      : 'bg-[#141b2d] hover:bg-[#1b253d] text-slate-300 border border-slate-700/80'
                  }`}
                >
                  <span className="text-sm">{r.avatar || '😎'}</span>
                  <span>{r.nombre}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-300">
                ¿Quiénes dividen? ({participantes.length}/{roomies.length})
              </label>
              <button
                onClick={seleccionarTodos}
                className="text-xs font-bold text-cyan-400 hover:text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 rounded-xl"
              >
                {participantes.length === roomies.length ? 'Deseleccionar' : 'Todos'}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {roomies.map(r => {
                const isSelected = participantes.includes(r.id);
                return (
                  <button
                    key={r.id}
                    onClick={() => toggleParticipante(r.id)}
                    className={`py-1.5 px-3 rounded-2xl text-xs font-extrabold flex items-center gap-1.5 transition-all active:scale-95 ${
                      isSelected
                        ? 'bg-emerald-500/25 text-emerald-200 border-2 border-emerald-400 shadow-sm'
                        : 'bg-[#141b2d] text-slate-400 border border-slate-700/80 hover:text-slate-200'
                    }`}
                  >
                    <span>{r.avatar || '😎'}</span>
                    <span>{r.nombre}</span>
                    {isSelected && <Check size={13} className="text-emerald-400 ml-0.5 stroke-[3]" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Real-time Division Preview */}
        {participantes.length >= 2 && Number(monto) > 0 && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-violet-950/80 to-slate-900 border-2 border-violet-500/40 flex items-center justify-between animate-pop-in shadow-md">
            <div className="flex items-center gap-2.5">
              <Sparkles size={18} className="text-amber-400 shrink-0" />
              <div>
                <p className="text-xs text-white font-extrabold">
                  {fmt(Number(monto) / participantes.length)} <span className="font-medium text-slate-300">por cabeza</span>
                </p>
                <p className="text-[11px] text-violet-300 font-semibold">
                  Le deben a <strong className="text-white underline decoration-violet-400">{getNombre(pagadoPor, roomies)}</strong>
                </p>
              </div>
            </div>
            <span className="text-xs font-mono font-black text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-2.5 py-1 rounded-xl">
              {participantes.length} roomies
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
          className={`w-full btn-neon py-3.5 text-sm font-black shadow-lg shadow-violet-600/35 active:scale-[0.98] ${
            exito ? '!bg-emerald-600 text-white' : ''
          }`}
        >
          {exito ? (
            <>
              <Check size={20} className="stroke-[3]" />
              ¡Gasto Registrado con Éxito!
            </>
          ) : (
            <>
              <Plus size={20} className="stroke-[3]" />
              Guardar Gasto del Mes
            </>
          )}
        </button>
      </section>

      {/* ── HISTORIAL DE GASTOS ───────────────────────── */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <span>📋</span> Historial de Gastos ({gastosMensuales.length})
          </h3>
          <span className="text-xs font-mono font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
            Total: {fmt(totalMensual)}
          </span>
        </div>

        {gastosMensuales.length === 0 ? (
          <div className="glass-card p-8 text-center text-slate-400 border border-slate-700/60">
            <div className="text-4xl mb-3">🧾</div>
            <p className="text-sm font-bold text-white">Aún no hay gastos registrados este mes</p>
            <p className="text-xs text-slate-400 mt-1">Usa el formulario arriba para empezar a repartir cuentas.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {gastosMensuales.map(g => {
              const parte = g.monto / g.participantes.length;
              const deudores = g.participantes.filter(p => p !== g.pagadoPor);

              return (
                <div key={g.id} className="glass-card p-4 space-y-3 border border-slate-700/80 shadow-md hover:border-slate-600 transition-all">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-black text-white tracking-tight">{g.descripcion}</h4>
                      <p className="text-xs text-slate-300 font-medium mt-0.5">
                        Pagó <strong className="text-violet-300 font-bold">{getNombre(g.pagadoPor, roomies)}</strong> · {g.participantes.length} personas ({fmt(parte)} c/u)
                      </p>
                    </div>
                    <span className="text-base font-mono font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-xl shrink-0">
                      {fmt(g.monto)}
                    </span>
                  </div>

                  {/* Debts breakdown within this expense */}
                  {deudores.length > 0 && (
                    <div className="p-2.5 rounded-xl bg-[#111728] border border-slate-700/70 text-xs space-y-1.5">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                        Deben pagarle a {getNombre(g.pagadoPor, roomies)}:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {deudores.map(pid => (
                          <span
                            key={pid}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/15 border border-rose-500/30 text-slate-100 font-bold text-xs"
                          >
                            <span>{getNombre(pid, roomies)}</span>
                            <span className="text-rose-400 font-mono font-black">-{fmt(parte)}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Card Footer */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-xs text-slate-400">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-[11px] font-mono font-bold text-slate-300 border border-slate-700">
                      {g.fecha}
                    </span>
                    <button
                      onClick={() => eliminarGasto(g.id)}
                      className="text-slate-400 hover:text-rose-400 flex items-center gap-1.5 text-xs font-bold transition-colors py-1 px-2 rounded-lg hover:bg-rose-500/10"
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
    </div>
  );
};
