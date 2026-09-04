import React, { useRef } from 'react';
import { X, Download, Upload, RotateCcw, AlertTriangle, Check } from 'lucide-react';
import { Persona, GastoMensual, GastoSalida } from '../types';
import { exportarBackupJSON, DEFAULT_ROOMIES, DEFAULT_CONTACTOS } from '../utils/storage';
import { playClickSound, playWinSound } from '../utils/audio';

interface BackupModalProps {
  roomies: Persona[];
  gastosMensuales: GastoMensual[];
  contactos: Persona[];
  gastosSalida: GastoSalida[];
  onImportData: (data: {
    roomies: Persona[];
    gastosMensuales: GastoMensual[];
    contactos: Persona[];
    gastosSalida: GastoSalida[];
  }) => void;
  onResetData: () => void;
  onCerrar: () => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  roomies,
  gastosMensuales,
  contactos,
  gastosSalida,
  onImportData,
  onResetData,
  onCerrar,
}) => {
  const [mensaje, setMensaje] = React.useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportar = () => {
    playClickSound();
    exportarBackupJSON({
      roomies,
      gastosMensuales,
      contactos,
      gastosSalida,
    });
    setMensaje('✅ Respaldo descargado con éxito.');
  };

  const handleCargarArchivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.roomies && parsed.gastosMensuales) {
          onImportData({
            roomies: parsed.roomies || DEFAULT_ROOMIES,
            gastosMensuales: parsed.gastosMensuales || [],
            contactos: parsed.contactos || DEFAULT_CONTACTOS,
            gastosSalida: parsed.gastosSalida || [],
          });
          playWinSound();
          setMensaje('✅ Datos importados correctamente.');
          setTimeout(() => onCerrar(), 1200);
        } else {
          setMensaje('❌ El archivo no tiene un formato válido de UniSplit.');
        }
      } catch {
        setMensaje('❌ Error al procesar el archivo JSON.');
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (confirm('¿Seguro que deseas reiniciar todos los datos a la configuración inicial?')) {
      playClickSound();
      onResetData();
      setMensaje('🔄 Datos restablecidos.');
      setTimeout(() => onCerrar(), 1000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="w-full max-w-[420px] glass-card p-5 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
            ⚙️ Ajustes y Respaldo de Datos
          </h3>
          <button
            onClick={() => {
              playClickSound();
              onCerrar();
            }}
            className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.12] flex items-center justify-center text-zinc-400 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>

        {/* Message Alert */}
        {mensaje && (
          <div className="p-2.5 rounded-xl bg-violet-500/20 border border-violet-500/30 text-xs text-violet-200 animate-pop-in">
            {mensaje}
          </div>
        )}

        {/* Export JSON */}
        <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-2">
          <p className="text-xs font-bold text-white flex items-center gap-1.5">
            <Download size={14} className="text-violet-400" />
            Descargar Respaldo JSON
          </p>
          <p className="text-[11px] text-zinc-400">
            Guarda todos tus roomies, amigos, gastos mensuales y salidas en un archivo para no perder nada.
          </p>
          <button
            onClick={handleExportar}
            className="w-full py-2 px-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95"
          >
            <Download size={13} />
            Exportar datos (.json)
          </button>
        </div>

        {/* Import JSON */}
        <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-2">
          <p className="text-xs font-bold text-white flex items-center gap-1.5">
            <Upload size={14} className="text-cyan-400" />
            Restaurar Respaldo
          </p>
          <p className="text-[11px] text-zinc-400">
            Carga un archivo de respaldo que hayas descargado previamente.
          </p>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleCargarArchivo}
            accept=".json"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-2 px-3 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/40 text-cyan-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95"
          >
            <Upload size={13} />
            Cargar archivo (.json)
          </button>
        </div>

        {/* Reset */}
        <div className="pt-2">
          <button
            onClick={handleReset}
            className="w-full py-2.5 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
          >
            <RotateCcw size={13} />
            Restablecer a valores iniciales
          </button>
        </div>
      </div>
    </div>
  );
};
