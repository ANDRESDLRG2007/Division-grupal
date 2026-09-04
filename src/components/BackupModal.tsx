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
    <div className="fixed inset-0 z-50 bg-[#0b0f19]/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="w-full max-w-[420px] bg-[#12192b] border-2 border-slate-700/80 rounded-3xl p-5 space-y-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-700/80">
          <h3 className="text-sm font-black text-white flex items-center gap-2">
            ⚙️ Ajustes y Respaldo de Datos
          </h3>
          <button
            onClick={() => {
              playClickSound();
              onCerrar();
            }}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-all active:scale-90"
          >
            <X size={16} />
          </button>
        </div>

        {/* Message Alert */}
        {mensaje && (
          <div className="p-3 rounded-2xl bg-violet-500/20 border-2 border-violet-500/40 text-xs font-bold text-violet-200 animate-pop-in">
            {mensaje}
          </div>
        )}

        {/* Export JSON */}
        <div className="p-4 rounded-2xl bg-[#161f33] border border-slate-700/80 space-y-2.5 shadow-sm">
          <p className="text-xs font-black text-white flex items-center gap-2">
            <Download size={15} className="text-violet-400" />
            Descargar Respaldo JSON
          </p>
          <p className="text-xs text-slate-300 font-medium leading-relaxed">
            Guarda todos tus roomies, amigos, gastos del apartamento y salidas en un archivo seguro en tu teléfono.
          </p>
          <button
            onClick={handleExportar}
            className="w-full py-2.5 px-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-black text-xs flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md shadow-violet-600/30"
          >
            <Download size={14} />
            Exportar datos (.json)
          </button>
        </div>

        {/* Import JSON */}
        <div className="p-4 rounded-2xl bg-[#161f33] border border-slate-700/80 space-y-2.5 shadow-sm">
          <p className="text-xs font-black text-white flex items-center gap-2">
            <Upload size={15} className="text-cyan-400" />
            Restaurar Respaldo
          </p>
          <p className="text-xs text-slate-300 font-medium leading-relaxed">
            Carga un archivo de respaldo que hayas guardado antes para recuperar toda tu información.
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
            className="w-full py-2.5 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-black text-xs flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md shadow-cyan-600/30"
          >
            <Upload size={14} />
            Cargar archivo (.json)
          </button>
        </div>

        {/* Reset */}
        <div className="pt-2">
          <button
            onClick={handleReset}
            className="w-full py-2.5 px-3 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <RotateCcw size={14} />
            Restablecer a valores iniciales
          </button>
        </div>
      </div>
    </div>
  );
};
