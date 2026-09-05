import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Check, Dices, Users, AlertCircle, Sparkles } from 'lucide-react';
import { Persona, GastoSalida, PresetCategoria } from '../types';
import { fmt, uid, getNombre, AVATARES } from '../utils/calculations';
import { playCoinSound, playClickSound } from '../utils/audio';
import { Accordion } from './Accordion';

interface SalidasTabProps {
  contactos: Persona[];
  gastosSalida: GastoSalida[];
  onSaveContactos: (contactos: Persona[]) => void;
  onSaveGastos: (gastos: GastoSalida[]) => void;
  onAbrirRuleta: () => void;
  onAddContacto: (nombre: string, avatar: string) => Persona | null;
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
  onAddContacto,
}) => {
  // Form State
  const [desc, setDesc] = useState('');
  const [monto, setMonto] = useState('');
  const [seleccionados, setSeleccionados] = useState<string[]>(contactos.map(c => c.id));
  const [categoriaSel, setCategoriaSel] = useState<string>('');

  const [nuevoContacto, setNuevoContacto] = useState('');
  const [nuevoAvatar, setNuevoAvatar] = useState('🐼');
  const [mostrarNuevo, setMostrarNuevo] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');
  const [exito, setExito] = useState(false);

  useEffect(() => {
    setSeleccionados(prev => prev.filter(id => contactos.some(contacto => contacto.id === id)));
  }, [contactos]);

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
    const nuevo = onAddContacto(nuevoContacto, nuevoAvatar);
    if (!nuevo) return;
    setSeleccionados(prev => [...prev, nuevo.id]);
    setNuevoContacto('');
    setMostrarNuevo(false);
    playClickSound();
  };

  const totalSalidas = gastosSalida.reduce((s, g) => s + g.monto, 0);

  return (
    <div className="px-5 py-6 animate-fade-in space-y-6 layout-stack salida-layout page-content">
      {/* ── BANNER RULETA ───────────────────────── */}
      <div
        onClick={() => {
          playClickSound();
          onAbrirRuleta();
        }}
        className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-purple-600/20 to-violet-600/25 border-2 border-amber-500/40 shadow-xl shadow-amber-500/10 flex items-center justify-between gap-3 cursor-pointer hover:border-amber-400 transition-all active:scale-[0.98] roulette-banner"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-rose-500 flex items-center justify-center text-2xl shadow-lg shadow-amber-500/30">
            🎰
          </div>
          <div>
            <h4 className="text-sm font-black text-white flex items-center gap-2">
              ¿Quién paga la cuenta?
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-400/25 text-amber-300 border border-amber-400/40">
                RULETA
              </span>
            </h4>
            <p className="text-xs text-slate-300 font-medium mt-0.5">
              ¡Gira la ruleta y que el destino elija la víctima!
            </p>
          </div>
        </div>

        <button className="py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 text-white font-black text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/25 shrink-0">
          <Dices size={15} />
          Girar
        </button>
      </div>

      {/* ── FORMULARIO SALIDA ───────────────────────── */}
      <section className="glass-card-glow p-5 space-y-6 expense-form">
        <div className="flex items-center justify-between pb-1 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_10px_#38bdf8]"></span>
            <h2 className="text-sm font-black text-white tracking-tight">Registrar Gasto de Salida</h2>
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
              className="w-full bg-[#101626] border-2 border-slate-700/90 focus:border-cyan-500 rounded-2xl px-4 py-3 text-sm font-semibold text-white placeholder-slate-500 transition-all shadow-inner"
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
            <div className="flex items-center bg-[#101626] border-2 border-slate-700/90 focus-within:border-cyan-400 rounded-2xl px-4 py-2.5 transition-all shadow-inner">
              <span className="text-cyan-400 font-mono font-black text-xl mr-2">$</span>
              <input
                type="number"
                inputMode="numeric"
                placeholder="0"
                value={monto}
                onChange={e => setMonto(e.target.value)}
                className="w-full bg-transparent text-xl font-mono font-black text-cyan-400 placeholder-slate-600 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Participants Selection */}
        <Accordion
          className="people-fields"
          title={<span className="text-sm font-semibold tracking-wide text-slate-300">Detalles</span>}
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
                        : 'bg-[#141b2d] text-slate-400 border-slate-700/80 hover:text-slate-200'
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
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <span>🍕</span> Salidas Registradas ({gastosSalida.length})
          </h3>
          <span className="text-xs font-mono font-black text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-0.5 rounded-full">
            Total: {fmt(totalSalidas)}
          </span>
        </div>

        {gastosSalida.length === 0 ? (
          <div className="glass-card p-8 text-center text-slate-400 border border-slate-700/60">
            <div className="text-4xl mb-3">🍕</div>
            <p className="text-sm font-bold text-white">No hay salidas registradas aún</p>
            <p className="text-xs text-slate-400 mt-1">Registra una comida, unas polas o el taxi arriba.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {gastosSalida.map(g => {
              const porPersona = g.monto / g.personas.length;

              return (
                <div key={g.id} className="glass-card bg-[#111728] p-4 rounded-2xl space-y-4 border border-slate-700/80 shadow-md hover:border-slate-600 transition-all">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-black text-white tracking-tight">{g.descripcion}</h4>
                      <p className="text-xs text-slate-300 font-medium mt-0.5">
                        {g.personas.length} amigos · <strong className="text-cyan-300 font-bold">{fmt(porPersona)}</strong> cada uno
                      </p>
                    </div>
                    <span className="text-base font-mono font-black text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-1 rounded-xl shrink-0">
                      {fmt(g.monto)}
                    </span>
                  </div>

                  {/* Individual shares */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {g.personas.map(pid => (
                      <span
                        key={pid}
                        className="min-w-0 inline-flex items-center gap-1 rounded-lg bg-[#182331] px-2.5 py-1 text-xs font-bold text-slate-200"
                      >
                        <span className="truncate">{getNombre(pid, contactos)}</span>
                        <span className="shrink-0 text-cyan-400 font-mono font-black">
                          {fmt(porPersona)}
                        </span>
                      </span>
                    ))}
                  </div>

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
