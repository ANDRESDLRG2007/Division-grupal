import React, { useState } from 'react';
import { Check, Edit2, RotateCcw, Settings2, Trash2, Upload, X } from 'lucide-react';
import { GastoMensual, GastoSalida, Persona } from '../types';
import { AVATARES } from '../utils/calculations';
import { playClickSound } from '../utils/audio';

interface GroupManagementModalProps {
  roomies: Persona[];
  contactos: Persona[];
  gastosMensuales: GastoMensual[];
  gastosSalida: GastoSalida[];
  onAddRoomie: (nombre: string, avatar: string) => Persona | null;
  onEditRoomie: (id: string, nombre: string, avatar: string) => void;
  onDeleteRoomie: (id: string) => void;
  onAddContacto: (nombre: string, avatar: string) => Persona | null;
  onEditContacto: (id: string, nombre: string, avatar: string) => void;
  onDeleteContacto: (id: string) => void;
  onOpenBackup: () => void;
  onCerrar: () => void;
}

export const GroupManagementModal: React.FC<GroupManagementModalProps> = ({
  roomies,
  contactos,
  gastosMensuales,
  gastosSalida,
  onAddRoomie,
  onEditRoomie,
  onDeleteRoomie,
  onAddContacto,
  onEditContacto,
  onDeleteContacto,
  onOpenBackup,
  onCerrar,
}) => {
  const [nombreRoomie, setNombreRoomie] = useState('');
  const [avatarRoomie, setAvatarRoomie] = useState('🦊');
  const [nombreContacto, setNombreContacto] = useState('');
  const [avatarContacto, setAvatarContacto] = useState('🐼');
  const [editando, setEditando] = useState<{ tipo: 'roomie' | 'contacto'; id: string } | null>(null);
  const [nombreEdicion, setNombreEdicion] = useState('');
  const [avatarEdicion, setAvatarEdicion] = useState('😎');

  const iniciarEdicion = (persona: Persona, tipo: 'roomie' | 'contacto') => {
    setEditando({ tipo, id: persona.id });
    setNombreEdicion(persona.nombre);
    setAvatarEdicion(persona.avatar || '😎');
  };

  const guardarEdicion = () => {
    if (!editando || !nombreEdicion.trim()) return;
    if (editando.tipo === 'roomie') {
      onEditRoomie(editando.id, nombreEdicion, avatarEdicion);
    } else {
      onEditContacto(editando.id, nombreEdicion, avatarEdicion);
    }
    setEditando(null);
  };

  const confirmarEliminacionRoomie = (id: string) => {
    if (roomies.length <= 2) return;
    const usos = gastosMensuales.filter(gasto =>
      gasto.pagadoPor === id || gasto.participantes.includes(id)
    ).length;
    if (usos > 0 && !window.confirm(`Esta persona aparece en ${usos} gasto${usos === 1 ? '' : 's'} registrado${usos === 1 ? '' : 's'}. Si la eliminas, esos gastos mostrarán "Alguien" en su lugar. ¿Eliminar de todas formas?`)) {
      return;
    }
    onDeleteRoomie(id);
  };

  const confirmarEliminacionContacto = (id: string) => {
    if (contactos.length <= 1) return;
    const usos = gastosSalida.filter(gasto => gasto.personas.includes(id)).length;
    if (usos > 0 && !window.confirm(`Esta persona aparece en ${usos} gasto${usos === 1 ? '' : 's'} registrado${usos === 1 ? '' : 's'}. Si la eliminas, esos gastos mostrarán "Alguien" en su lugar. ¿Eliminar de todas formas?`)) {
      return;
    }
    onDeleteContacto(id);
  };

  const renderPersona = (persona: Persona, tipo: 'roomie' | 'contacto') => {
    const isEditing = editando?.tipo === tipo && editando.id === persona.id;
    if (isEditing) {
      return (
        <div key={persona.id} className="flex items-center gap-2 rounded-xl border border-violet-400 bg-[#172138] p-2">
          <select value={avatarEdicion} onChange={event => setAvatarEdicion(event.target.value)} className="bg-[#101626] p-1 rounded-lg border border-slate-700">
            {AVATARES.map(avatar => <option key={avatar} value={avatar}>{avatar}</option>)}
          </select>
          <input value={nombreEdicion} onChange={event => setNombreEdicion(event.target.value)} onKeyDown={event => event.key === 'Enter' && guardarEdicion()} className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-[#101626] px-2 py-1 text-sm text-white" autoFocus />
          <button type="button" onClick={guardarEdicion} className="rounded-lg bg-violet-600 p-2 text-white" title="Guardar edición"><Check size={14} /></button>
          <button type="button" onClick={() => setEditando(null)} className="rounded-lg bg-slate-800 p-2 text-slate-300" title="Cancelar edición"><X size={14} /></button>
        </div>
      );
    }

    return (
      <div key={persona.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-700/80 bg-[#161f33] px-3 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="text-base">{persona.avatar || '😎'}</span>
          <span className="truncate text-sm font-medium text-slate-100">{persona.nombre}</span>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button type="button" onClick={() => iniciarEdicion(persona, tipo)} className="rounded-lg p-2 text-slate-400 hover:text-violet-300" title="Editar"><Edit2 size={14} /></button>
          <button type="button" onClick={() => tipo === 'roomie' ? confirmarEliminacionRoomie(persona.id) : confirmarEliminacionContacto(persona.id)} className="rounded-lg p-2 text-slate-400 hover:text-rose-300" title="Eliminar"><Trash2 size={14} /></button>
        </div>
      </div>
    );
  };

  const agregarRoomie = () => {
    const nuevo = onAddRoomie(nombreRoomie, avatarRoomie);
    if (nuevo) setNombreRoomie('');
  };

  const agregarContacto = () => {
    const nuevo = onAddContacto(nombreContacto, avatarContacto);
    if (nuevo) setNombreContacto('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#0b0f19]/90 p-4 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-[460px] space-y-5 rounded-3xl border-2 border-slate-700/80 bg-[#12192b] p-5 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-700/80 pb-3">
          <h2 className="flex items-center gap-2 text-base font-semibold text-white"><Settings2 size={18} className="text-violet-300" /> Gestionar grupo</h2>
          <button type="button" onClick={onCerrar} className="rounded-full bg-slate-800 p-2 text-slate-300" title="Cerrar"><X size={16} /></button>
        </div>

        <section className="space-y-3 border-b border-slate-700/80 pb-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold tracking-wide text-slate-200">Roomies del apartamento</h3>
              <p className="text-xs text-slate-400">{roomies.length} integrantes</p>
            </div>
            <span className="text-xl">🏠</span>
          </div>
          <div className="space-y-2">{roomies.map(roomie => renderPersona(roomie, 'roomie'))}</div>
          <div className="flex items-center gap-2">
            <select value={avatarRoomie} onChange={event => setAvatarRoomie(event.target.value)} className="bg-[#101626] p-2 rounded-xl border border-slate-700">{AVATARES.map(avatar => <option key={avatar} value={avatar}>{avatar}</option>)}</select>
            <input value={nombreRoomie} onChange={event => setNombreRoomie(event.target.value)} onKeyDown={event => event.key === 'Enter' && agregarRoomie()} placeholder="Nuevo roomie" className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-[#101626] px-3 py-2 text-sm text-white placeholder-slate-500" />
            <button type="button" onClick={agregarRoomie} className="rounded-xl bg-violet-600 px-3 py-2 text-xs font-bold text-white">Agregar</button>
          </div>
        </section>

        <section className="space-y-3 border-b border-slate-700/80 pb-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold tracking-wide text-slate-200">Contactos de salidas</h3>
              <p className="text-xs text-slate-400">{contactos.length} contactos</p>
            </div>
            <span className="text-xl">🍕</span>
          </div>
          <div className="space-y-2">{contactos.map(contacto => renderPersona(contacto, 'contacto'))}</div>
          <div className="flex items-center gap-2">
            <select value={avatarContacto} onChange={event => setAvatarContacto(event.target.value)} className="bg-[#101626] p-2 rounded-xl border border-slate-700">{AVATARES.map(avatar => <option key={avatar} value={avatar}>{avatar}</option>)}</select>
            <input value={nombreContacto} onChange={event => setNombreContacto(event.target.value)} onKeyDown={event => event.key === 'Enter' && agregarContacto()} placeholder="Nuevo contacto" className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-[#101626] px-3 py-2 text-sm text-white placeholder-slate-500" />
            <button type="button" onClick={agregarContacto} className="rounded-xl bg-cyan-600 px-3 py-2 text-xs font-bold text-slate-950">Agregar</button>
          </div>
        </section>

        <button type="button" onClick={() => { playClickSound(); onOpenBackup(); }} className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-bold text-slate-200"><Upload size={14} /> Abrir respaldo de datos</button>
        <button type="button" onClick={onCerrar} className="w-full rounded-xl bg-slate-700 px-3 py-2 text-sm font-semibold text-white">Cerrar</button>
      </div>
    </div>
  );
};