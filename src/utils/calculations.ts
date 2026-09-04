import { Persona, GastoMensual, GastoSalida, Deuda } from '../types';

export const fmt = (n: number): string => {
  if (isNaN(n) || n === null || n === undefined) return '$0';
  return '$' + Math.round(n).toLocaleString('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

export const uid = (): string =>
  Date.now().toString(36) + Math.random().toString(36).substring(2, 7);

export const AVATARES = ['😎', '🤓', '🤠', '🦊', '🚀', '⚡', '🍕', '🎸', '🎮', '☕', '🐱', '🐼', '🦁', '🥑'];

export const PALETA_COLORES = [
  '#8b5cf6', // Violeta
  '#06b6d4', // Cyan
  '#10b981', // Esmeralda / Mint
  '#f59e0b', // Ámbar
  '#f43f5e', // Rosa neón
  '#3b82f6', // Azul eléctrico
  '#ec4899', // Magenta
  '#84cc16', // Lima
  '#a855f7', // Púrpura brillante
  '#14b8a6', // Teal
];

export const getNombre = (id: string, lista: Persona[]): string =>
  lista.find(p => p.id === id)?.nombre || 'Alguien';

export const getPersona = (id: string, lista: Persona[]): Persona | undefined =>
  lista.find(p => p.id === id);

// ── Algoritmo de Simplificación de Deudas (Mensual) ─────────────────────────
export const calcularDeudas = (gastos: GastoMensual[], personas: Persona[]): Deuda[] => {
  const balance: Record<string, number> = {};
  personas.forEach(p => (balance[p.id] = 0));

  gastos.forEach(g => {
    if (!g.participantes || g.participantes.length === 0) return;
    const parte = g.monto / g.participantes.length;
    g.participantes.forEach(pid => {
      if (balance[pid] === undefined) balance[pid] = 0;
      balance[pid] -= parte; // debe su parte
    });
    if (balance[g.pagadoPor] === undefined) balance[g.pagadoPor] = 0;
    balance[g.pagadoPor] += g.monto; // recupera lo pagado
  });

  // Simplificar deudas directas
  const deudas: Deuda[] = [];
  const acreedores = Object.entries(balance)
    .filter(([, v]) => v > 0.5)
    .map(([id, v]) => ({ id, v }));
  const deudores = Object.entries(balance)
    .filter(([, v]) => v < -0.5)
    .map(([id, v]) => ({ id, v: -v }));

  let i = 0;
  let j = 0;
  while (i < acreedores.length && j < deudores.length) {
    const ac = acreedores[i];
    const de = deudores[j];
    const pago = Math.min(ac.v, de.v);
    
    if (pago > 0.5) {
      deudas.push({ de: de.id, para: ac.id, monto: Math.round(pago) });
    }
    
    ac.v -= pago;
    de.v -= pago;
    if (ac.v < 0.5) i++;
    if (de.v < 0.5) j++;
  }
  return deudas;
};

// ── Resumen de Balances Mensuales ─────────────────────────
export interface ResumenPersonaMensual extends Persona {
  pago: number;
  debia: number;
  balance: number;
}

export const calcularResumenMensual = (gastos: GastoMensual[], personas: Persona[]): ResumenPersonaMensual[] => {
  return personas.map(p => {
    const pago = gastos
      .filter(g => g.pagadoPor === p.id)
      .reduce((s, g) => s + g.monto, 0);

    const debia = gastos
      .filter(g => g.participantes.includes(p.id) && g.participantes.length > 0)
      .reduce((s, g) => s + g.monto / g.participantes.length, 0);

    return {
      ...p,
      pago,
      debia,
      balance: pago - debia,
    };
  });
};

// ── Resumen de Salidas Grupales ─────────────────────────
export interface ResumenPersonaSalida extends Persona {
  total: number;
  participaciones: number;
}

export const calcularResumenSalidas = (gastos: GastoSalida[], personas: Persona[]): ResumenPersonaSalida[] => {
  return personas
    .map(c => {
      const salidasDeEstaPersona = gastos.filter(g => g.personas.includes(c.id) && g.personas.length > 0);
      const total = salidasDeEstaPersona.reduce((s, g) => s + g.monto / g.personas.length, 0);
      return {
        ...c,
        total,
        participaciones: salidasDeEstaPersona.length,
      };
    })
    .filter(c => c.total > 0 || c.participaciones > 0);
};
