import { Deuda, GastoMensual, Persona } from '../types';
import { fmt, getNombre } from './calculations';

export const generarMensajeCobro = (deuda: Deuda, personas: Persona[]): string => {
  const deudor = getNombre(deuda.de, personas);
  const acreedor = getNombre(deuda.para, personas);

  return `💸 *UniSplit - Recordatorio de Pago* 💸\n\n` +
    `Hola ${deudor} 👋, según las cuentas del apartamento/salida:\n` +
    `➡️ Le debes a *${acreedor}*: *${fmt(deuda.monto)}*\n\n` +
    `📱 Puedes transferir por Nequi / Daviplata / Bancolombia / Bizum.\n` +
    `¡Cuentas claras conservan la amistad! ✨`;
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
  const encoded = encodeURIComponent(texto);
  const url = `https://api.whatsapp.com/send?text=${encoded}`;
  if (typeof window !== 'undefined') {
    window.open(url, '_blank');
  }
};
