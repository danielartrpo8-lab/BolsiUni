/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * MOAI Inmobiliaria - Utilidades de Calendario y Pagos Programados
 * Generación de enlaces de Google Calendar, archivos .ics con alarmas (VALARM) y proyecciones.
 */

import { ScheduledPayment } from '../types';

/**
 * Formatea una fecha YYYY-MM-DD a formato YYYYMMDD para calendarios
 */
export function formatDateToCalendarString(dateStr: string): string {
  return dateStr.replace(/-/g, '');
}

/**
 * Calcula la fecha del día siguiente en formato YYYYMMDD
 */
export function getNextDayCalendarString(dateStr: string): string {
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr.replace(/-/g, '');
  const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  d.setDate(d.getDate() + 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}${m}${day}`;
}

/**
 * Genera el enlace directo a Google Calendar para un evento inmobiliario
 */
export function generateGoogleCalendarUrl(payment: ScheduledPayment): string {
  const start = formatDateToCalendarString(payment.dueDate);
  const end = getNextDayCalendarString(payment.dueDate);
  const title = `[MOAI] ${payment.title} - $${payment.amount.toLocaleString('es-CO')}`;
  const details = `Control Contable MOAI Inmobiliaria.\nBeneficiario/Involucrado: ${payment.beneficiary || 'N/A'}\nInmueble: ${payment.propertyCode || 'General'}\nNotas: ${payment.notes || 'Sin notas adicionales.'}\nSede Medellín: Calle 32C # 80A-45`;

  let url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${start}/${end}&details=${encodeURIComponent(details)}`;

  if (payment.recurrence === 'mensual') {
    url += '&recur=RRULE:FREQ=MONTHLY';
  } else if (payment.recurrence === 'quincenal') {
    url += '&recur=RRULE:FREQ=WEEKLY;INTERVAL=2';
  } else if (payment.recurrence === 'anual') {
    url += '&recur=RRULE:FREQ=YEARLY';
  }

  return url;
}

/**
 * Genera el contenido del archivo .ics estándar RFC 5545 con alarma VALARM
 */
export function generateICSContent(payment: ScheduledPayment): string {
  const start = formatDateToCalendarString(payment.dueDate);
  const end = getNextDayCalendarString(payment.dueDate);
  const title = `[MOAI] ${payment.title} - $${payment.amount.toLocaleString('es-CO')}`;
  const daysBefore = Math.max(1, payment.reminderDaysBefore || 1);
  const uid = `moai-${payment.id}-${Date.now()}@inmobiliariamoai.com`;

  let recurRule = '';
  if (payment.recurrence === 'mensual') {
    recurRule = 'RRULE:FREQ=MONTHLY\r\n';
  } else if (payment.recurrence === 'quincenal') {
    recurRule = 'RRULE:FREQ=WEEKLY;INTERVAL=2\r\n';
  } else if (payment.recurrence === 'anual') {
    recurRule = 'RRULE:FREQ=YEARLY\r\n';
  }

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//MOAI Inmobiliaria//Sistema Contable//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${formatDateToCalendarString(new Date().toISOString().slice(0, 10))}T120000Z`,
    `DTSTART;VALUE=DATE:${start}`,
    `DTEND;VALUE=DATE:${end}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:Control Contable MOAI Inmobiliaria. Inmueble: ${payment.propertyCode || 'General'}. Beneficiario: ${payment.beneficiary}. ${payment.notes || ''}`,
    `LOCATION:MOAI Inmobiliaria - Medellín, Colombia`,
    recurRule.trim(),
    'BEGIN:VALARM',
    `TRIGGER:-P${daysBefore}D`,
    'ACTION:DISPLAY',
    `DESCRIPTION:Recordatorio MOAI: ${title}`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ].filter(Boolean).join('\r\n');
}

/**
 * Descarga directamente el archivo .ics en el navegador
 */
export function downloadICSFile(payment: ScheduledPayment): void {
  const content = generateICSContent(payment);
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const safeTitle = payment.title.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 25);
  link.download = `moai_${safeTitle}_${payment.dueDate}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Calcula los días faltantes para una fecha YYYY-MM-DD
 */
export function getDaysRemaining(dueDateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const parts = dueDateStr.split('-');
  if (parts.length !== 3) return 0;
  const targetDate = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  targetDate.setHours(0, 0, 0, 0);

  const diffTime = targetDate.getTime() - today.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Calcula los pagos en los próximos N días
 */
export function getUpcomingPaymentsWithinDays(payments: ScheduledPayment[], days: number = 15): {
  upcoming: ScheduledPayment[];
  totalAmount: number;
} {
  const pending = payments.filter(p => p.status === 'pendiente');
  
  const upcoming = pending.filter(p => {
    const diff = getDaysRemaining(p.dueDate);
    return diff >= 0 && diff <= days;
  }).sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  const totalAmount = upcoming.reduce((acc, curr) => acc + curr.amount, 0);
  return { upcoming, totalAmount };
}
