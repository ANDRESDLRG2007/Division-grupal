import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Sparkles, Dices, RotateCw, Share2, Plus, X, Flame, PartyPopper } from 'lucide-react';
import { Persona, ModoRuleta } from '../types';
import { playTickSound, playWinSound, playClickSound } from '../utils/audio';
import { launchConfetti } from '../utils/confetti';
import { compartirPorWhatsApp } from '../utils/whatsapp';
import { PALETA_COLORES } from '../utils/calculations';

interface RuletaProps {
  roomies: Persona[];
  contactos: Persona[];
  onCerrar?: () => void;
  isModal?: boolean;
}

const CASTIGOS_DEFAULT = [
  'Lavar la loza 🧽',
  'Sacar la basura 🗑️',
  'Ir a la tienda por hielo 🧊',
  'Poner la música 🎵',
  'Traer las polas 🍻',
  'Hacer el café de las 6am ☕',
  'Barrer la sala 🧹',
  'Pagar el taxi/Uber 🚕',
];

const MEMES_GANADOR = [
  '¡Que no se haga el loco! 💸',
  'Le tocó el destino universitario 🎯',
  'A pagar con Nequi sin chistar 📱',
  'El universo ha hablado 🪐',
  'Hoy no te salvaste 😂',
  'Que le quede de aprendizaje 🎓',
];

export const RuletaModal: React.FC<RuletaProps> = ({
  roomies,
  contactos,
  onCerrar,
  isModal = false,
}) => {
  const [modo, setModo] = useState<ModoRuleta>('pagador');
  const [fuentePersonas, setFuentePersonas] = useState<'contactos' | 'roomies'>('contactos');
  
  // Custom items list
  const [customItems, setCustomItems] = useState<string[]>([
    'Pizza 🍕',
    'Hamburguesa 🍔',
    'Tacos 🌮',
    'Sushi 🍣',
    'Chuzo desgranado 🌭',
  ]);
  const [nuevoItem, setNuevoItem] = useState('');

  // Wheel state
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [girando, setGirando] = useState(false);
  const [ganador, setGanador] = useState<string | null>(null);
  const [mostrarGanador, setMostrarGanador] = useState(false);
  const [memeActual, setMemeActual] = useState('');

  const anguloRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const lastPegRef = useRef<number>(-1);

  // Determine active items list for wheel
  const getItemsActuales = useCallback((): string[] => {
    if (modo === 'castigo') {
      return CASTIGOS_DEFAULT;
    }
    if (modo === 'personalizado') {
      return customItems.length >= 2 ? customItems : ['Opción 1', 'Opción 2'];
    }
    const lista = fuentePersonas === 'roomies' ? roomies : contactos;
    return lista.length >= 2 ? lista.map((p) => p.nombre) : ['Nadie 1', 'Nadie 2'];
  }, [modo, fuentePersonas, roomies, contactos, customItems]);

  const items = getItemsActuales();
  const count = items.length;
  const slice = (2 * Math.PI) / Math.max(count, 1);

  // Canvas drawing
  const dibujar = useCallback(
    (angulo: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const r = Math.min(cx, cy) - 12;

      // Outer glow
      ctx.save();
      ctx.shadowColor = 'rgba(139, 92, 246, 0.45)';
      ctx.shadowBlur = 28;
      ctx.beginPath();
      ctx.arc(cx, cy, r + 4, 0, 2 * Math.PI);
      ctx.fillStyle = '#101420';
      ctx.fill();
      ctx.restore();

      // Outer rim
      ctx.beginPath();
      ctx.arc(cx, cy, r + 2, 0, 2 * Math.PI);
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#262d42';
      ctx.stroke();

      // Draw Slices
      items.forEach((item, i) => {
        const start = angulo + i * slice;
        const end = start + slice;

        // Slice background
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, r, start, end);
        ctx.closePath();

        const color = PALETA_COLORES[i % PALETA_COLORES.length];
        ctx.fillStyle = color;
        ctx.fill();

        // Slice border
        ctx.strokeStyle = '#090b11';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Text label inside slice
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(start + slice / 2);
        ctx.textAlign = 'right';
        ctx.fillStyle = '#ffffff';

        const fontSize = Math.min(13, Math.max(10, 160 / count));
        ctx.font = `bold ${fontSize}px "Plus Jakarta Sans", sans-serif`;
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = 4;

        const maxLen = 13;
        const label = item.length > maxLen ? item.slice(0, maxLen) + '…' : item;
        ctx.fillText(label, r - 16, fontSize / 3);
        ctx.restore();
      });

      // Center Hub with UniSplit Coin
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, 24, 0, 2 * Math.PI);
      ctx.fillStyle = '#090b11';
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#8b5cf6';
      ctx.shadowColor = '#8b5cf6';
      ctx.shadowBlur = 10;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx, cy, 10, 0, 2 * Math.PI);
      ctx.fillStyle = '#fbbf24';
      ctx.fill();
      ctx.restore();

      // Top Pointer / Needle (Triangular marker)
      ctx.save();
      ctx.translate(cx, cy - r - 4);
      ctx.beginPath();
      ctx.moveTo(0, 16);
      ctx.lineTo(-12, -8);
      ctx.lineTo(12, -8);
      ctx.closePath();
      ctx.fillStyle = '#fbbf24';
      ctx.shadowColor = 'rgba(251, 191, 36, 0.8)';
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();

      ctx.restore();
    },
    [items, slice, count]
  );

  useEffect(() => {
    dibujar(anguloRef.current);
  }, [dibujar]);

  // Spin the wheel
  const girar = () => {
    if (girando || count < 2) return;

    playClickSound();
    setGanador(null);
    setMostrarGanador(false);
    setGirando(true);

    const vueltas = 7 + Math.random() * 6; // 7 to 13 full rotations
    const anguloFinal = anguloRef.current + vueltas * 2 * Math.PI;
    const duracion = 4200 + Math.random() * 1200;
    const inicio = performance.now();
    const anguloInicio = anguloRef.current;
    lastPegRef.current = -1;

    const easeOutQuart = (x: number): number => 1 - Math.pow(1 - x, 4);

    const animar = (ahora: number) => {
      const transcurrido = ahora - inicio;
      const progress = Math.min(transcurrido / duracion, 1);
      const easedProgress = easeOutQuart(progress);
      const anguloActual = anguloInicio + (anguloFinal - anguloInicio) * easedProgress;

      anguloRef.current = anguloActual;
      dibujar(anguloActual);

      // Sound ticks when passing a sector
      const normAngulo = ((anguloActual % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
      const currentPeg = Math.floor(normAngulo / slice);
      if (currentPeg !== lastPegRef.current) {
        lastPegRef.current = currentPeg;
        playTickSound(500 + (currentPeg % 3) * 60);
      }

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animar);
      } else {
        // Calculate Winner (pointer is at 12 o'clock = -Math.PI / 2)
        const norm = ((anguloActual % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
        const pointerPos = (2 * Math.PI - norm + (3 * Math.PI) / 2) % (2 * Math.PI);
        const idx = Math.floor(pointerPos / slice) % count;

        const elegido = items[idx];
        setGanador(elegido);
        setMemeActual(MEMES_GANADOR[Math.floor(Math.random() * MEMES_GANADOR.length)]);
        setGirando(false);

        playWinSound();
        launchConfetti();
        setTimeout(() => setMostrarGanador(true), 150);
      }
    };

    rafRef.current = requestAnimationFrame(animar);
  };

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const agregarCustomItem = () => {
    if (!nuevoItem.trim()) return;
    setCustomItems([...customItems, nuevoItem.trim()]);
    setNuevoItem('');
  };

  const eliminarCustomItem = (index: number) => {
    if (customItems.length <= 2) return;
    setCustomItems(customItems.filter((_, i) => i !== index));
  };

  const compartirResultado = () => {
    if (!ganador) return;
    const msg = `🎰 *UniSplit - ¡La Ruleta Ha Decidido!* 🎯\n\n` +
      `📌 *Modo:* ${modo === 'pagador' ? '¿Quién paga hoy?' : modo === 'castigo' ? 'Castigo Universitario' : 'Ruleta de la suerte'}\n` +
      `👑 *Resultado:* 👉 *${ganador}* 👈\n` +
      `💬 _"${memeActual}"_\n\n` +
      `_¡Cero excusas! Generado con UniSplit 🎓_`;
    compartirPorWhatsApp(msg);
  };

  return (
    <div
      className={`${
        isModal
          ? 'fixed inset-0 z-50 bg-[#0b0f19]/96 backdrop-blur-2xl flex flex-col items-center justify-center p-4 overflow-y-auto'
          : 'py-3 animate-fade-in'
      }`}
    >
      <div className="w-full max-w-[480px] mx-auto flex flex-col items-center">
        {/* Modal Close Button */}
        {isModal && onCerrar && (
          <button
            onClick={() => {
              playClickSound();
              onCerrar();
            }}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-slate-800/80 hover:bg-slate-700 border border-slate-700 flex items-center justify-center text-white transition-all active:scale-90 shadow-md"
          >
            <X size={20} />
          </button>
        )}

        {/* Title Header */}
        <div className="text-center mb-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border-2 border-amber-500/40 text-amber-300 text-xs font-black mb-1.5 shadow-md shadow-amber-500/10">
            <Flame size={14} className="text-amber-400" />
            RULETA UNIVERSITARIA 🎰
          </div>
          <h2 className="text-xl font-black text-white tracking-tight">
            {modo === 'pagador' ? '¿Quién paga la cuenta?' : modo === 'castigo' ? 'Ruleta de Castigos' : 'Ruleta Personalizada'}
          </h2>
          <p className="text-xs text-slate-300 font-semibold mt-0.5">
            {count < 2 ? '⚠️ Agrega al menos 2 opciones' : `Girando entre ${count} opciones`}
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div className="w-full grid grid-cols-3 gap-2 p-1.5 bg-[#12192b] border-2 border-slate-700/80 rounded-2xl mb-4 shadow-md">
          <button
            onClick={() => {
              playClickSound();
              setModo('pagador');
            }}
            className={`py-2 px-4 text-xs font-black rounded-xl transition-all active:scale-95 ${
              modo === 'pagador'
                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            💸 Quién paga
          </button>
          <button
            onClick={() => {
              playClickSound();
              setModo('castigo');
            }}
            className={`py-2 px-4 text-xs font-black rounded-xl transition-all active:scale-95 ${
              modo === 'castigo'
                ? 'bg-gradient-to-r from-rose-600 to-amber-600 text-white shadow-md shadow-rose-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🧽 Castigos
          </button>
          <button
            onClick={() => {
              playClickSound();
              setModo('personalizado');
            }}
            className={`py-2 px-4 text-xs font-black rounded-xl transition-all active:scale-95 ${
              modo === 'personalizado'
                ? 'bg-gradient-to-r from-emerald-600 to-cyan-600 text-slate-950 shadow-md shadow-emerald-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            ✏️ Libre
          </button>
        </div>

        {/* Source selector for "Quién Paga" */}
        {modo === 'pagador' && (
          <div className="flex flex-wrap items-center gap-2 mb-3 text-xs">
            <span className="text-slate-400 font-bold">Usar lista de:</span>
            <button
              onClick={() => {
                playClickSound();
                setFuentePersonas('contactos');
              }}
              className={`px-4 py-2 rounded-xl font-black transition-all active:scale-95 ${
                fuentePersonas === 'contactos'
                  ? 'bg-cyan-500/25 text-cyan-200 border-2 border-cyan-400 shadow-sm'
                  : 'bg-[#141b2d] border border-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              🍕 Salidas ({contactos.length})
            </button>
            <button
              onClick={() => {
                playClickSound();
                setFuentePersonas('roomies');
              }}
              className={`px-4 py-2 rounded-xl font-black transition-all active:scale-95 ${
                fuentePersonas === 'roomies'
                  ? 'bg-violet-500/25 text-violet-200 border-2 border-violet-400 shadow-sm'
                  : 'bg-[#141b2d] border border-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              🏠 Roomies ({roomies.length})
            </button>
          </div>
        )}

        {/* Wheel Canvas Display */}
        <div className="relative my-2 flex items-center justify-center p-3 rounded-3xl bg-[#12192b]/80 border-2 border-slate-700/60 shadow-2xl">
          <canvas
            ref={canvasRef}
            className="w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] block rounded-full"
          />
        </div>

        {/* Spin Button */}
        <button
          onClick={girar}
          disabled={girando || count < 2}
          className={`w-full max-w-[300px] mt-4 py-4 px-6 rounded-2xl font-black text-base tracking-wide flex items-center justify-center gap-2 transition-all active:scale-95 border-2 border-amber-300/30 ${
            girando
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed shadow-none border-transparent'
              : count < 2
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border-transparent'
              : 'bg-gradient-to-r from-amber-400 via-rose-500 to-violet-600 text-white shadow-xl shadow-rose-500/30 hover:brightness-110'
          }`}
        >
          {girando ? (
            <>
              <RotateCw className="animate-spin" size={20} />
              Girando la ruleta...
            </>
          ) : (
            <>
              <Dices size={22} className="stroke-[2.5]" />
              ¡GIRAR RULETA!
            </>
          )}
        </button>

        {/* Result Winner Popup / Banner */}
        {mostrarGanador && ganador && (
          <div className="w-full mt-4 p-5 rounded-2xl bg-gradient-to-br from-violet-950/90 via-[#151d32] to-slate-900 border-2 border-amber-400 shadow-2xl animate-pop-in text-center">
            <div className="inline-flex items-center gap-1.5 text-2xl mb-1">
              <PartyPopper className="text-amber-400 animate-bounce" />
              <span>👑</span>
              <Sparkles className="text-violet-400 animate-pulse" />
            </div>

            <p className="text-[11px] font-black uppercase tracking-widest text-amber-300">
              {modo === 'castigo' ? 'Le toca el castigo a:' : 'Hoy le toca pagar a:'}
            </p>

            <h3 className="text-2xl font-black text-white tracking-tight my-1.5 text-gradient-gold">
              {ganador}
            </h3>

            <p className="text-xs text-slate-200 font-medium italic mb-4">
              "{memeActual}"
            </p>

            <div className="flex items-center gap-2.5 justify-center">
              <button
                onClick={compartirResultado}
                className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 transition-all active:scale-95"
              >
                <Share2 size={14} />
                Mandar al WhatsApp
              </button>

              <button
                onClick={girar}
                className="py-2.5 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-black flex items-center gap-1 transition-all active:scale-95"
              >
                <RotateCw size={14} />
                Otra vez
              </button>
            </div>
          </div>
        )}

        {/* Custom Items Manager when in 'personalizado' mode */}
        {modo === 'personalizado' && (
          <div className="w-full mt-5 p-4 rounded-2xl bg-[#12192b] border-2 border-slate-700/80 shadow-md">
            <p className="text-xs font-black text-slate-200 mb-2.5 flex items-center gap-1.5">
              <span>🎯</span> Opciones de la ruleta ({customItems.length}):
            </p>
            <div className="flex flex-wrap gap-2 mb-3">
              {customItems.map((item, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/90 border border-slate-700 text-xs font-bold text-slate-100"
                >
                  {item}
                  {customItems.length > 2 && (
                    <button
                      onClick={() => eliminarCustomItem(idx)}
                      className="hover:text-rose-400 ml-1 text-slate-400 font-bold"
                    >
                      ×
                    </button>
                  )}
                </span>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Agregar nueva opción..."
                value={nuevoItem}
                onChange={(e) => setNuevoItem(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && agregarCustomItem()}
                className="flex-1 bg-[#0b0f19] border-2 border-slate-700 focus:border-violet-400 rounded-xl px-3.5 py-2 text-xs font-bold text-white placeholder-slate-500"
              />
              <button
                onClick={agregarCustomItem}
                className="px-3.5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-black flex items-center gap-1 shadow-md shadow-violet-600/30"
              >
                <Plus size={15} />
                Añadir
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
