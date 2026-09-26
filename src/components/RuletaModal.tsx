import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Dices, RotateCw, Share2, Plus, X, PartyPopper } from 'lucide-react';
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

      // Subtle outer shadow (no neon glow)
      ctx.save();
      ctx.shadowColor = 'rgba(79, 70, 229, 0.2)';
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.arc(cx, cy, r + 4, 0, 2 * Math.PI);
      ctx.fillStyle = '#101420';
      ctx.fill();
      ctx.restore();

      // Outer rim — clean thin border
      ctx.beginPath();
      ctx.arc(cx, cy, r + 2, 0, 2 * Math.PI);
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
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
        ctx.strokeStyle = '#090a0f';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Text label inside slice
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(start + slice / 2);
        ctx.textAlign = 'right';
        ctx.fillStyle = '#ffffff';

        const fontSize = Math.min(13, Math.max(10, 160 / count));
        ctx.font = `600 ${fontSize}px "Plus Jakarta Sans", sans-serif`;
        ctx.shadowColor = 'rgba(0,0,0,0.7)';
        ctx.shadowBlur = 3;

        const maxLen = 13;
        const label = item.length > maxLen ? item.slice(0, maxLen) + '…' : item;
        ctx.fillText(label, r - 16, fontSize / 3);
        ctx.restore();
      });

      // Center Hub
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, 22, 0, 2 * Math.PI);
      ctx.fillStyle = '#090a0f';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.5)';
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx, cy, 9, 0, 2 * Math.PI);
      ctx.fillStyle = '#6366f1';
      ctx.fill();
      ctx.restore();

      // Top Pointer / Needle
      ctx.save();
      ctx.translate(cx, cy - r - 4);
      ctx.beginPath();
      ctx.moveTo(0, 14);
      ctx.lineTo(-10, -6);
      ctx.lineTo(10, -6);
      ctx.closePath();
      ctx.fillStyle = '#6366f1';
      ctx.shadowColor = 'rgba(99, 102, 241, 0.5)';
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
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
<<<<<<< HEAD
          ? 'fixed inset-0 z-50 bg-[#090a0f]/96 backdrop-blur-xl flex flex-col items-center justify-center p-4 overflow-y-auto'
          : 'px-5 py-5 animate-fade-in'
=======
          ? 'fixed inset-0 z-50 bg-[#0b0f19]/96 backdrop-blur-2xl flex flex-col items-center justify-center p-4 overflow-y-auto'
          : 'py-3 animate-fade-in'
>>>>>>> ae824147ff56f4e377b864695131bb809be1795c
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
            className="absolute top-4 right-4 w-9 h-9 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.07] flex items-center justify-center text-white transition-all active:scale-90"
          >
            <X size={18} />
          </button>
        )}

        {/* Title Header */}
        <div className="text-center mb-4">
          <span className="inline-block text-[11px] font-semibold text-indigo-300 bg-indigo-500/[0.08] border border-indigo-500/20 px-3 py-1 rounded-full mb-2">
            🎰 RULETA UNIVERSITARIA
          </span>
          <h2 className="text-xl font-bold text-white tracking-tight">
            {modo === 'pagador' ? '¿Quién paga la cuenta?' : modo === 'castigo' ? 'Ruleta de Castigos' : 'Ruleta Personalizada'}
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            {count < 2 ? '⚠️ Agrega al menos 2 opciones' : `Girando entre ${count} opciones`}
          </p>
        </div>

        {/* Mode Selector Tabs */}
<<<<<<< HEAD
        <div className="w-full grid grid-cols-3 gap-1 p-1 bg-white/[0.03] border border-white/[0.07] rounded-xl mb-5">
=======
        <div className="w-full grid grid-cols-3 gap-2 p-1.5 bg-[#12192b] border-2 border-slate-700/80 rounded-2xl mb-4 shadow-md">
>>>>>>> ae824147ff56f4e377b864695131bb809be1795c
          <button
            onClick={() => {
              playClickSound();
              setModo('pagador');
            }}
<<<<<<< HEAD
            className={`py-2 px-1 text-xs font-bold rounded-lg transition-all active:scale-95 ${
=======
            className={`py-2 px-4 text-xs font-black rounded-xl transition-all active:scale-95 ${
>>>>>>> ae824147ff56f4e377b864695131bb809be1795c
              modo === 'pagador'
                ? 'bg-indigo-600 text-white'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            💸 Quién paga
          </button>
          <button
            onClick={() => {
              playClickSound();
              setModo('castigo');
            }}
<<<<<<< HEAD
            className={`py-2 px-1 text-xs font-bold rounded-lg transition-all active:scale-95 ${
=======
            className={`py-2 px-4 text-xs font-black rounded-xl transition-all active:scale-95 ${
>>>>>>> ae824147ff56f4e377b864695131bb809be1795c
              modo === 'castigo'
                ? 'bg-indigo-600 text-white'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            🧽 Castigos
          </button>
          <button
            onClick={() => {
              playClickSound();
              setModo('personalizado');
            }}
<<<<<<< HEAD
            className={`py-2 px-1 text-xs font-bold rounded-lg transition-all active:scale-95 ${
=======
            className={`py-2 px-4 text-xs font-black rounded-xl transition-all active:scale-95 ${
>>>>>>> ae824147ff56f4e377b864695131bb809be1795c
              modo === 'personalizado'
                ? 'bg-indigo-600 text-white'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            ✏️ Libre
          </button>
        </div>

        {/* Source selector for "Quién Paga" */}
        {modo === 'pagador' && (
<<<<<<< HEAD
          <div className="flex items-center gap-2 mb-4 text-xs">
            <span className="text-zinc-400 font-medium">Usar lista de:</span>
=======
          <div className="flex flex-wrap items-center gap-2 mb-3 text-xs">
            <span className="text-slate-400 font-bold">Usar lista de:</span>
>>>>>>> ae824147ff56f4e377b864695131bb809be1795c
            <button
              onClick={() => {
                playClickSound();
                setFuentePersonas('contactos');
              }}
<<<<<<< HEAD
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all active:scale-95 ${
=======
              className={`px-4 py-2 rounded-xl font-black transition-all active:scale-95 ${
>>>>>>> ae824147ff56f4e377b864695131bb809be1795c
                fuentePersonas === 'contactos'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white/[0.04] border border-white/[0.07] text-zinc-400 hover:text-white'
              }`}
            >
              🍕 Salidas ({contactos.length})
            </button>
            <button
              onClick={() => {
                playClickSound();
                setFuentePersonas('roomies');
              }}
<<<<<<< HEAD
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all active:scale-95 ${
=======
              className={`px-4 py-2 rounded-xl font-black transition-all active:scale-95 ${
>>>>>>> ae824147ff56f4e377b864695131bb809be1795c
                fuentePersonas === 'roomies'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white/[0.04] border border-white/[0.07] text-zinc-400 hover:text-white'
              }`}
            >
              🏠 Roomies ({roomies.length})
            </button>
          </div>
        )}

        {/* Wheel Canvas Display */}
        <div className="relative my-2 flex items-center justify-center p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
          <canvas
            ref={canvasRef}
            className="w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] block rounded-full"
          />
        </div>

        {/* Spin Button */}
        <button
          onClick={girar}
          disabled={girando || count < 2}
          className={`w-full max-w-[300px] mt-4 py-4 px-6 rounded-xl font-bold text-base tracking-wide flex items-center justify-center gap-2 transition-all active:scale-95 ${
            girando
              ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
              : count < 2
              ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white'
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
          <div className="w-full mt-5 p-5 rounded-xl clean-card border-indigo-500/30 text-center animate-fade-in">
            <div className="inline-flex items-center gap-1.5 text-2xl mb-1">
              <PartyPopper className="text-indigo-400" />
              <span>👑</span>
            </div>

            <p className="text-[11px] font-semibold uppercase tracking-widest text-indigo-300 mt-1">
              {modo === 'castigo' ? 'Le toca el castigo a:' : 'Hoy le toca pagar a:'}
            </p>

            <h3 className="text-2xl font-bold text-white tracking-tight my-2">
              {ganador}
            </h3>

            <p className="text-xs text-zinc-400 italic mb-5">
              "{memeActual}"
            </p>

            <div className="flex items-center gap-2.5 justify-center">
              <button
                onClick={compartirResultado}
                className="py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95"
              >
                <Share2 size={14} />
                Mandar al WhatsApp
              </button>

              <button
                onClick={girar}
                className="btn-secondary !py-2.5"
              >
                <RotateCw size={14} />
                Otra vez
              </button>
            </div>
          </div>
        )}

        {/* Custom Items Manager when in 'personalizado' mode */}
        {modo === 'personalizado' && (
          <div className="w-full mt-5 clean-card p-5">
            <p className="text-xs font-bold text-zinc-300 mb-3 flex items-center gap-1.5">
              <span>🎯</span> Opciones de la ruleta ({customItems.length}):
            </p>
            <div className="flex flex-wrap gap-2 mb-3">
              {customItems.map((item, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.07] text-xs font-medium text-zinc-200"
                >
                  {item}
                  {customItems.length > 2 && (
                    <button
                      onClick={() => eliminarCustomItem(idx)}
                      className="hover:text-rose-400 ml-0.5 text-zinc-500 font-bold"
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
                className="input-clean flex-1 !py-2 !text-xs"
              />
              <button
                onClick={agregarCustomItem}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1 transition-colors"
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
