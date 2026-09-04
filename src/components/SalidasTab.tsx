import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Check, X, Dices, Users, AlertCircle, Sparkles } from 'lucide-react';
import { Persona, GastoSalida, PresetCategoria } from '../types';
import { fmt, uid, getNombre, AVATARES } from '../utils/calculations';
import { playCoinSound, playClickSound } from '../utils/audio';

interface SalidasTabProps {
  contactos: Persona[];
  gastosSalida: GastoSalida[];
  onSaveContactos: (contactos: Persona[]) => void;
  onSaveGastos: (gastos: GastoSalida[]) => void;
  onAbrirRuleta: () => void;
}

const PRESETS_SALIDA: PresetCategoria[] = [
  { id: 'polas', nombre: 'Polas / Cervezas', icono: '🍻', sugerenciaMonto: 60000 },
  { id: 'comida', nombre: 'Pizza / Burger', icono: '🍕', sugerenciaMonto: 55000 },
  { id: 'uber', nombre: 'Uber / Taxi', icono: '🚕', sugerenciaMonto: 24000 },
  { id: 'cine', nombre: 'Cine / Cover', icono: '🎟️', sugerenciaMonto: 40000 },
  { id: 'cafe', nombre: 'Café de Estudio', icono: '☕', sugerenciaMonto: 22000 },
  { id: 'snacks', nombre: 'Mecato / Snacks', icono: '🍿', sugerenciaMonto: 18000 },
];

export const SalidasTab: React.FC<SalidasTabProps> = ({
  contactos,
  gastosSalida,
  onSaveContactos,
  onSaveGastos,
  onAbrirRuleta,
}) => {
  // Form State
  const [desc, setDesc] = useState('');
  const [monto, setMonto] = useState('');
  const [seleccionados, setSeleccionados] = useState<string[]>(contactos.map(c => c.id));
  const [categoriaSel, setCategoriaSel] = useState<string>('');

  // Contacts Management State
  const [nuevoContacto, setNuevoContacto] = useState('');
  const [nuevoAvatar, setNuevoAvatar] = useState('🐼');
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [nombreTemp, setNombreTemp] = useState('');
  const [avatarTemp, setAvatarTemp] = useState('😎');
  const [mostrarNuevo, setMostrarNuevo] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');
  const [exito, setExito] = useState(false);

  const toggleSeleccionado = (id: string) => {
    playClickSound();
    setSeleccionados(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const seleccionarTodos = () => {
    playClickSound();
    if (seleccionados.length === contactos.length) {
      setSeleccionados(contactos[0] ? [contactos[0].id] : []);
    } else {
      setSeleccionados(contactos.map(c => c.id));
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

  const agregarGasto = () => {
    setErrorMsg('');
    if (!desc.trim()) {
      setErrorMsg('Escribe qué compraron en la salida.');
      return;
    }
    const numMonto = parseFloat(monto);
    if (isNaN(numMonto) || numMonto <= 0) {
      setErrorMsg('Ingresa un monto válido mayor a 0.');
      return;
    }
    if (seleccionados.length < 2) {
      setErrorMsg('Selecciona al menos 2 personas en esta salida.');
      return;
    }

    const nuevoGasto: GastoSalida = {
      id: uid(),
      descripcion: desc.trim(),
      monto: numMonto,
      categoria: categoriaSel || 'salida',
      personas: seleccionados,
      fecha: new Date().toLocaleDateString('es-CO', { day: '2-digit', month: 'short' }),
      timestamp: Date.now(),
    };

    onSaveGastos([nuevoGasto, ...gastosSalida]);
    playCoinSound();
    setDesc('');
    setMonto('');
    setCategoriaSel('');
    setExito(true);
    setTimeout(() => setExito(false), 2200);
  };

  const eliminarGasto = (id: string) => {
    playClickSound();
    onSaveGastos(gastosSalida.filter(g => g.id !== id));
  };

  const agregarContacto = () => {
    if (!nuevoContacto.trim()) return;
    const nuevo: Persona = {
      id: uid(),
      nombre: nuevoContacto.trim(),
      avatar: nuevoAvatar,
    };
    const updated = [...contactos, nuevo];
    onSaveContactos(updated);
    setSeleccionados(prev => [...prev, nuevo.id]);
    setNuevoContacto('');
    setMostrarNuevo(false);
    playClickSound();
  };

  const guardarEdicionContacto = (id: string) => {
    if (!nombreTemp.trim()) return;
    const updated = contactos.map(c =>
      c.id === id ? { ...c, nombre: nombreTemp.trim(), avatar: avatarTemp } : c
    );
    onSaveContactos(updated);
    setEditandoId(null);
    playClickSound();
  };

  const eliminarContacto = (id: string) => {
    if (contactos.length <= 1) return;
    playClickSound();
    const updated = contactos.filter(c => c.id !== id);
    onSaveContactos(updated);
    setSeleccionados(prev => prev.filter(p => p !== id));
  };

  const totalSalidas = gastosSalida.reduce((s, g) => s + g.monto, 0);

  return (
    <div className="px-4 py-3 animate-fade-in space-y-4">
      {/* ── SECCIÓN AMIGOS / CONTACTOS ───────────────────────── */}
      <section className="glass-card p-3.5">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-1.5">
            <span className="text-base">🍕</span>
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
              Amigos del Parche ({contactos.length})
            </h3>
          </div>
          <button
            onClick={() => {
              playClickSound();
              setMostrarNuevo(!mostrarNuevo);
            }}
            className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            <Plus size={13} /> Añadir amigo
          </button>
        </div>

        {/* Contacts chips */}
        <div className="flex flex-wrap gap-1.5">
          {contactos.map(c => {
            const isEditing = editandoId === c.id;
            return isEditing ? (
              <div
                key={c.id}
                className="flex items-center gap-1 p-1 bg-[#181c2b] border border-cyan-500/60 rounded-xl"
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
                  onKeyDown={e => e.key === 'Enter' && guardarEdicionContacto(c.id)}
                  className="w-20 bg-transparent text-xs text-white px-1 border-b border-cyan-400"
                  autoFocus
                />
                <button
                  onClick={() => guardarEdicionContacto(c.id)}
                  className="w-6 h-6 rounded-lg bg-cyan-600 text-white flex items-center justify-center text-xs"
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
                key={c.id}
                className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full bg-white/[0.05] border border-white/[0.09] text-xs text-zinc-200"
              >
                <span>{c.avatar || '😎'}</span>
                <span className="font-semibold">{c.nombre}</span>
                <button
                  onClick={() => {
                    playClickSound();
                    setEditandoId(c.id);
                    setNombreTemp(c.nombre);
                    setAvatarTemp(c.avatar || '😎');
                  }}
                  className="text-zinc-500 hover:text-cyan-400 p-0.5 ml-0.5"
                >
                  <Edit2 size={11} />
                </button>
                {contactos.length > 1 && (
                  <button
                    onClick={() => eliminarContacto(c.id)}
                    className="text-zinc-500 hover:text-rose-400 p-0.5"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Add Contact Form Input */}
        {mostrarNuevo && (
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
              placeholder="Nombre del amigo/a..."
              value={nuevoContacto}
              onChange={e => setNuevoContacto(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && agregarContacto()}
              className="flex-1 bg-white/[0.05] border border-white/[0.1] rounded-xl px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:border-cyan-500"
            />
            <button
              onClick={agregarContacto}
              className="py-1.5 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-black font-bold text-xs"
            >
              Guardar
            </button>
          </div>
        )}
      </section>

      {/* ── BANNER RULETA ───────────────────────── */}
      <div
        onClick={() => {
          playClickSound();
          onAbrirRuleta();
        }}
        className="p-3.5 rounded-2xl bg-gradient-to-r from-violet-900/40 via-purple-900/30 to-amber-900/30 border border-violet-500/40 shadow-lg shadow-violet-900/20 flex items-center justify-between gap-3 cursor-pointer hover:border-violet-400/70 transition-all active:scale-[0.98]"
      >
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-400 to-rose-500 flex items-center justify-center text-xl shadow-md">
            🎰
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-white flex items-center gap-1.5">
              ¿Quién paga esta salida?
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300">
                RULETA
              </span>
            </h4>
            <p className="text-[11px] text-zinc-400">
              Gira la ruleta y que la suerte decida quién invita
            </p>
          </div>
        </div>

        <button className="py-2 px-3 rounded-xl bg-gradient-to-r from-amber-400 to-rose-500 text-white font-bold text-xs flex items-center gap-1 shadow-md">
          <Dices size={14} />
          Girar
        </button>
      </div>

      {/* ── FORMULARIO SALIDA ───────────────────────── */}
      <section className="glass-card-glow p-4 space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#38bdf8]"></span>
            <h2 className="text-sm font-extrabold text-white">Registrar Gasto de Salida</h2>
          </div>
          <span className="text-[10px] text-zinc-400 font-medium">División en grupo</span>
        </div>

        {/* Quick Presets */}
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1.5">
            ⚡ Atajos rápidos:
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {PRESETS_SALIDA.map(preset => (
              <button
                key={preset.id}
                onClick={() => aplicarPreset(preset)}
                className={`py-1.5 px-2 rounded-xl text-left border flex items-center gap-1.5 transition-all active:scale-95 ${
                  categoriaSel === preset.id
                    ? 'bg-cyan-600/25 border-cyan-500 text-cyan-200 font-bold'
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
              ¿Qué compraron?
            </label>
            <input
              type="text"
              placeholder="Ej: Pizza en la 45, Polas en la tienda, Taxi..."
              value={desc}
              onChange={e => setDesc(e.target.value)}
              className="w-full bg-black/30 border border-white/[0.1] focus:border-cyan-500 rounded-xl px-3.5 py-2 text-sm text-white placeholder-zinc-500 transition-colors"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Monto total ($)
              </label>
              <div className="flex gap-1">
                {[20000, 50000, 100000].map(val => (
                  <button
                    key={val}
                    onClick={() => sumarMonto(val)}
                    className="text-[10px] py-0.5 px-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-zinc-400 hover:text-cyan-300 font-mono"
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
              className="w-full bg-black/30 border border-white/[0.1] focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-base font-mono font-bold text-cyan-400 placeholder-zinc-600 transition-colors"
            />
          </div>
        </div>

        {/* Participants Selection */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              ¿Quiénes van en esta cuenta? ({seleccionados.length}/{contactos.length})
            </label>
            <button
              onClick={seleccionarTodos}
              className="text-[10px] font-bold text-cyan-400 hover:text-cyan-300"
            >
              {seleccionados.length === contactos.length ? 'Deseleccionar' : 'Todos'}
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {contactos.map(c => {
              const isSelected = seleccionados.includes(c.id);
              return (
                <button
                  key={c.id}
                  onClick={() => toggleSeleccionado(c.id)}
                  className={`py-1.5 px-3 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    isSelected
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm'
                      : 'bg-white/[0.03] text-zinc-500 border border-white/[0.05]'
                  }`}
                >
                  <span>{c.avatar || '😎'}</span>
                  <span>{c.nombre}</span>
                  {isSelected && <Check size={11} className="text-cyan-400 ml-0.5" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Real-time Division Preview */}
        {seleccionados.length >= 2 && Number(monto) > 0 && (
          <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-between animate-pop-in">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-cyan-400" />
              <div>
                <p className="text-[11px] text-zinc-300 font-medium">
                  {fmt(Number(monto) / seleccionados.length)} cada uno
                </p>
                <p className="text-[10px] text-cyan-300">
                  Dividido entre {seleccionados.length} amigos
                </p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-cyan-400">
              Total {fmt(Number(monto))}
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
          className={`w-full btn-neon !bg-gradient-to-r !from-cyan-600 !to-teal-600 ${
            exito ? '!bg-emerald-600 text-white' : ''
          }`}
        >
          {exito ? (
            <>
              <Check size={18} />
              ¡Salida Registrada!
            </>
          ) : (
            <>
              <Plus size={18} />
              Guardar Gasto de Salida
            </>
          )}
        </button>
      </section>

      {/* ── HISTORIAL DE SALIDAS ───────────────────────── */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Salidas Registradas ({gastosSalida.length})
          </h3>
          <span className="text-xs font-mono font-bold text-cyan-400">
            Total: {fmt(totalSalidas)}
          </span>
        </div>

        {gastosSalida.length === 0 ? (
          <div className="glass-card p-8 text-center text-zinc-500">
            <div className="text-3xl mb-2 opacity-50">🍕</div>
            <p className="text-xs font-medium">No hay salidas registradas aún.</p>
            <p className="text-[11px] text-zinc-600 mt-1">Registra una comida, polas o taxi arriba.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {gastosSalida.map(g => {
              const porPersona = g.monto / g.personas.length;

              return (
                <div key={g.id} className="glass-card p-3.5 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-white tracking-tight">{g.descripcion}</h4>
                      <p className="text-[11px] text-zinc-400">
                        {g.personas.length} amigos · {fmt(porPersona)} cada uno
                      </p>
                    </div>
                    <span className="text-sm font-mono font-bold text-cyan-400">
                      {fmt(g.monto)}
                    </span>
                  </div>

                  {/* Individual shares */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {g.personas.map(pid => (
                      <span
                        key={pid}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.06] text-[11px] text-zinc-300"
                      >
                        <span>{getNombre(pid, contactos)}</span>
                        <span className="text-cyan-400 font-mono font-semibold">
                          {fmt(porPersona)}
                        </span>
                      </span>
                    ))}
                  </div>

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
