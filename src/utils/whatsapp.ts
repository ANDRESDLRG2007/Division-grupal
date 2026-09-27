import { Deuda, GastoMensual, Persona } from '../types';
import { fmt, getNombre } from './calculations';

export const generarMensajeCobro = (deuda: Deuda, personas: Persona[]): string => {
  const deudor = getNombre(deuda.de, personas);
  const acreedor = getNombre(deuda.para, personas);

  return `💸 *UniSplit - Recordatorio de Pago* 💸\n\n` +
    `Hola ${deudor} 👋, según las cuentas:\n` +
    `➡️ Le debes a *${acreedor}*: *${fmt(deuda.monto)}*\n\n` +
    `📱 Puedes transferir por Nequi / Daviplata / Bancolombia / Bizum.\n` +
    `¡Cuentas claras conservan la amistad! ✨`;
};

export const generarMensajeCobroSalida = (
  deuda: Deuda,
  personas: Persona[],
  concepto?: string
): string => {
  const deudor = getNombre(deuda.de, personas);
  const acreedor = getNombre(deuda.para, personas);
  const detalle = concepto ? ` (por *${concepto}*)` : '';

  return `🍕 *UniSplit - Cuentas del Parche* 🍻\n\n` +
    `¡Hola ${deudor}! 👋 De la salida${detalle}:\n` +
    `➡️ Tu parte a transferir a *${acreedor}* es: *${fmt(deuda.monto)}*\n\n` +
    `📲 Pásalo por Nequi, Daviplata o tu app favorita ⚡\n` +
    `_¡Cero enredos, todo claro con UniSplit! 🎓_`;
};

export const generarResumenSalidas = (
  deudas: Deuda[],
  gastos: { descripcion: string; monto: number }[],
  total: number,
  personas: Persona[]
): string => {
  let msg = `🍻 *UniSplit - Resumen de la Salida / Parche* 🍕\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `💰 *Gasto Total del Parche:* ${fmt(total)}\n`;
  msg += `🧾 *Consumos registrados:* ${gastos.length}\n\n`;

  if (gastos.length > 0) {
    msg += `📋 *Detalle de consumos:*\n`;
    gastos.forEach((g) => {
      msg += `• ${g.descripcion}: ${fmt(g.monto)}\n`;
    });
    msg += `\n`;
  }

  if (deudas.length === 0) {
    msg += `🎉 *¡Todo cuadrado! Nadie le debe nada a nadie.*\n`;
  } else {
    msg += `⚡ *¿Quién le pasa a quién?*\n`;
    deudas.forEach((d, i) => {
      msg += `${i + 1}. *${getNombre(d.de, personas)}* ➡️ *${getNombre(d.para, personas)}*: ${fmt(d.monto)}\n`;
    });
  }

  msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `_¡A transferir por Nequi / Daviplata! Creado con UniSplit 🎓_`;
  return msg;
};

export const generarResumenCompleto = (
  deudas: Deuda[],
  gastos: GastoMensual[],
  total: number,
  personas: Persona[]
): string => {
  let msg = `📊 *UniSplit - Resumen de Cuentas del Mes* 🏠\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `💰 *Gasto Total:* ${fmt(total)}\n`;
  msg += `🧾 *Total de Gastos:* ${gastos.length}\n\n`;

  if (deudas.length === 0) {
    msg += `🎉 *¡Todo el mundo está al día! No hay deudas pendientes.*\n`;
  } else {
    msg += `📋 *Transferencias Pendientes:*\n`;
    deudas.forEach((d, i) => {
      msg += `${i + 1}. *${getNombre(d.de, personas)}* ➡️ *${getNombre(d.para, personas)}*: ${fmt(d.monto)}\n`;
    });
  }

  msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `_Generado con UniSplit 🎓_`;
  return msg;
};

export const compartirPorWhatsApp = (texto: string) => {
  if (typeof window === 'undefined') return;

  const url = `https://wa.me/?text=${encodeURIComponent(texto)}`;
  const link = document.createElement('a');
  link.href = url;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  document.body.appendChild(link);
  link.click();
  link.remove();
};
