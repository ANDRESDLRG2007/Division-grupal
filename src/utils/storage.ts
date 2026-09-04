import { Persona, GastoMensual, GastoSalida } from '../types';

export const DEFAULT_ROOMIES: Persona[] = [
  { id: 'r1', nombre: 'Yo', avatar: '🐼', color: '#8b5cf6' },
  { id: 'r2', nombre: 'Carlos', avatar: '🦊', color: '#06b6d4' },
  { id: 'r3', nombre: 'Laura', avatar: '🚀', color: '#f59e0b' },
];

export const DEFAULT_CONTACTOS: Persona[] = [
  { id: 'c1', nombre: 'Yo', avatar: '🐼', color: '#8b5cf6' },
  { id: 'c2', nombre: 'Mateo', avatar: '🎸', color: '#10b981' },
  { id: 'c3', nombre: 'Valen', avatar: '🥑', color: '#f43f5e' },
  { id: 'c4', nombre: 'Santi', avatar: '⚡', color: '#3b82f6' },
];

export interface AppStateData {
  roomies: Persona[];
  gastosMensuales: GastoMensual[];
  contactos: Persona[];
  gastosSalida: GastoSalida[];
}

export const exportarBackupJSON = (data: AppStateData) => {
  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
    JSON.stringify(data, null, 2)
  )}`;
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', jsonString);
  downloadAnchor.setAttribute('download', `unisplit_backup_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
};
