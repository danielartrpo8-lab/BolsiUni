/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * EduPlata - Calculador de Runway / "¿Hasta cuándo me alcanza?"
 * Módulo de proyección financiera para estudiantes universitarios colombianos.
 */

import { AcademicEvent, SemesterConfig, Transaction } from '../types';
import { formatCOP } from './formatters';

export interface RunwayCalculation {
  trafficLight: 'green' | 'yellow' | 'red';
  message: string;
  dailyAvgExpense: number;
  recentExpenses14d: number;
  expenseTxCount14d: number;
  balance: number;
  daysLeft: number;
  zeroDate: Date | null;
  zeroDateFormatted: string;
  nextIncomeDate: Date;
  nextIncomeFormatted: string;
  daysUntilNextIncome: number;
  surplusAtNextIncome: number;
  maxDailyToSurvive: number;
  daysShort: number;
  parcialesAlert: {
    isWithinWeek: boolean;
    daysUntil: number;
    event: AcademicEvent;
  } | null;
  semesterProgressPct: number;
  semesterDaysTotal: number;
  semesterDaysElapsed: number;
  upcomingMilestones: Array<{
    id: string;
    title: string;
    date: string;
    formattedDate: string;
    daysDiff: number;
    type: 'income' | 'parciales' | 'finales' | 'matricula' | 'vacaciones' | 'otro';
    emoji: string;
    isPast: boolean;
    isToday: boolean;
  }>;
}

// Meses en español abreviados
const MONTHS_ES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

/**
 * Formatea una fecha como "15 oct" o "22 nov"
 */
export function formatShortDateEs(date: Date | string): string {
  try {
    let d: Date;
    if (typeof date === 'string') {
      const [year, month, day] = date.split('-').map(Number);
      d = new Date(year, month - 1, day);
    } else {
      d = date;
    }
    const day = d.getDate();
    const month = MONTHS_ES[d.getMonth()] || '';
    return `${day} ${month}`;
  } catch {
    return String(date);
  }
}

/**
 * Helper para parsear string YYYY-MM-DD a Date a medianoche local
 */
export function parseISODateLocal(isoStr: string): Date {
  const [y, m, d] = isoStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setHours(0, 0, 0, 0);
  return date;
}

/**
 * Calcula el próximo ingreso a partir de la configuración
 */
export function getNextIncomeDate(config: SemesterConfig, baseDate: Date = new Date()): Date {
  const today = new Date(baseDate);
  today.setHours(0, 0, 0, 0);

  const freq = config.incomeFrequency;
  const day1 = Math.min(31, Math.max(1, config.incomeDay || 15));
  const day2 = Math.min(31, Math.max(1, config.incomeDaySecond || 30));

  if (freq === 'semanal') {
    // day1: 1 (Lunes) .. 7 (Domingo)
    const currentDayOfWeek = today.getDay() === 0 ? 7 : today.getDay();
    let daysUntil = (day1 - currentDayOfWeek + 7) % 7;
    if (daysUntil === 0) {
      // Si hoy es el día, el próximo es en 7 días para proyectar hacia adelante
      daysUntil = 7;
    }
    const next = new Date(today);
    next.setDate(today.getDate() + daysUntil);
    return next;
  }

  if (freq === 'quincenal') {
    const currentDay = today.getDate();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();

    const dMin = Math.min(day1, day2);
    const dMax = Math.max(day1, day2);

    if (currentDay < dMin) {
      return new Date(currentYear, currentMonth, dMin);
    } else if (currentDay < dMax) {
      return new Date(currentYear, currentMonth, dMax);
    } else {
      // Pasa al siguiente mes
      return new Date(currentYear, currentMonth + 1, dMin);
    }
  }

  // Por defecto mensual
  const currentDay = today.getDate();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();

  if (currentDay < day1) {
    return new Date(currentYear, currentMonth, day1);
  } else {
    return new Date(currentYear, currentMonth + 1, day1);
  }
}

/**
 * Realiza todo el cálculo financiero de "¿Hasta cuándo me alcanza?"
 */
export function calculateRunway(
  balance: number,
  transactions: Transaction[],
  config: SemesterConfig,
  customToday?: Date
): RunwayCalculation {
  const today = customToday ? new Date(customToday) : new Date();
  today.setHours(0, 0, 0, 0);

  // 1. Filtrar gastos de los últimos 14 días
  const fourteenDaysAgo = new Date(today);
  fourteenDaysAgo.setDate(today.getDate() - 14);

  const expensesLast14Days = transactions.filter((t) => {
    if (t.type !== 'expense') return false;
    const tDate = parseISODateLocal(t.date);
    return tDate >= fourteenDaysAgo && tDate <= today;
  });

  const recentExpenses14d = expensesLast14Days.reduce((sum, t) => sum + t.amount, 0);
  const expenseTxCount14d = expensesLast14Days.length;

  // Promedio diario exacto de los últimos 14 días
  let dailyAvgExpense = Math.round(recentExpenses14d / 14);

  // Fallback inteligente: si en los últimos 14 días no hubo gastos pero sí hay gastos registrados
  // en el historial, calculamos un promedio basado en los gastos totales del mes para no dejar en 0
  if (dailyAvgExpense === 0) {
    const allExpenses = transactions.filter((t) => t.type === 'expense');
    if (allExpenses.length > 0) {
      const totalAllExp = allExpenses.reduce((sum, t) => sum + t.amount, 0);
      dailyAvgExpense = Math.max(1000, Math.round(totalAllExp / 30));
    }
  }

  // 2. Proyección de fecha en que el saldo llega a $0
  let daysLeft = 0;
  let zeroDate: Date | null = null;

  if (balance <= 0) {
    daysLeft = 0;
    zeroDate = new Date(today);
  } else if (dailyAvgExpense > 0) {
    daysLeft = Math.floor(balance / dailyAvgExpense);
    zeroDate = new Date(today);
    zeroDate.setDate(today.getDate() + daysLeft);
  } else {
    // Si no gasta nada, le dura indefinidamente
    daysLeft = 999;
    zeroDate = null;
  }

  // 3. Próximo ingreso
  const nextIncomeDate = getNextIncomeDate(config, today);
  const diffMs = nextIncomeDate.getTime() - today.getTime();
  const daysUntilNextIncome = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)));

  const projectedSpendUntilIncome = dailyAvgExpense * daysUntilNextIncome;
  const surplusAtNextIncome = balance - projectedSpendUntilIncome;

  const nextIncomeFormatted = formatShortDateEs(nextIncomeDate);
  const zeroDateFormatted = zeroDate ? formatShortDateEs(zeroDate) : 'Indefinido';

  // 4. Semáforo y mensajes tipo semáforo solicitados
  let trafficLight: 'green' | 'yellow' | 'red' = 'green';
  let message = '';
  let maxDailyToSurvive = Math.floor(Math.max(0, balance) / daysUntilNextIncome);
  const daysShort = Math.max(1, daysUntilNextIncome - daysLeft);

  if (balance <= 0) {
    trafficLight = 'red';
    message = `A este ritmo estás sin saldo disponible. Tu próximo ingreso es el ${nextIncomeFormatted} (en ${daysUntilNextIncome} días).`;
  } else if (daysLeft < daysUntilNextIncome) {
    // Rojo: se queda sin plata antes del próximo ingreso
    trafficLight = 'red';
    message = `A este ritmo te quedas sin plata el ${zeroDateFormatted}, ${daysShort} ${
      daysShort === 1 ? 'día' : 'días'
    } antes de tu mesada. Puedes gastar máximo ${formatCOP(maxDailyToSurvive)} diarios para llegar.`;
  } else if (
    daysLeft === daysUntilNextIncome ||
    daysLeft === daysUntilNextIncome + 1 ||
    surplusAtNextIncome <= 20000
  ) {
    // Amarillo: llega justo
    trafficLight = 'yellow';
    message = `Ojo: a este ritmo llegas justo.`;
  } else {
    // Verde: alcanza y sobra
    trafficLight = 'green';
    const roundedSurplus = Math.round(surplusAtNextIncome / 1000) * 1000;
    message = `Vas bien: te alcanza hasta el próximo ingreso (${nextIncomeFormatted}) y te sobran ~${formatCOP(
      roundedSurplus
    )}.`;
  }

  // 5. Alerta de parciales: 1 semana antes de parciales
  let parcialesAlert: RunwayCalculation['parcialesAlert'] = null;
  if (config.events && config.events.length > 0) {
    const parcialesEvents = config.events.filter(
      (e) => e.type === 'parciales' || e.title.toLowerCase().includes('parcial')
    );

    for (const evt of parcialesEvents) {
      const evtDate = parseISODateLocal(evt.date);
      const diffDays = Math.round((evtDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      // Una semana antes (entre 0 y 7 días previos)
      if (diffDays >= 0 && diffDays <= 7) {
        parcialesAlert = {
          isWithinWeek: true,
          daysUntil: diffDays,
          event: evt
        };
        break;
      }
    }
  }

  // 6. Mini línea de tiempo del semestre
  const semStart = parseISODateLocal(config.startDate || '2026-08-01');
  const semEnd = parseISODateLocal(config.endDate || '2026-12-15');
  const totalSemMs = Math.max(1, semEnd.getTime() - semStart.getTime());
  const elapsedSemMs = Math.min(totalSemMs, Math.max(0, today.getTime() - semStart.getTime()));

  const semesterDaysTotal = Math.round(totalSemMs / (1000 * 60 * 60 * 24));
  const semesterDaysElapsed = Math.round(elapsedSemMs / (1000 * 60 * 60 * 24));
  const semesterProgressPct = Math.min(100, Math.max(0, Math.round((elapsedSemMs / totalSemMs) * 100)));

  // Hitos ordenados para la línea de tiempo
  const milestones: RunwayCalculation['upcomingMilestones'] = [];

  // Próximo ingreso como hito
  milestones.push({
    id: 'next-income-milestone',
    title: 'Próximo Ingreso (Mesada/Pago)',
    date: nextIncomeDate.toISOString().slice(0, 10),
    formattedDate: nextIncomeFormatted,
    daysDiff: daysUntilNextIncome,
    type: 'income',
    emoji: '💰',
    isPast: false,
    isToday: daysUntilNextIncome === 0
  });

  // Eventos académicos configurados
  if (config.events) {
    config.events.forEach((evt) => {
      const evtDate = parseISODateLocal(evt.date);
      const diff = Math.round((evtDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      const emojis: Record<string, string> = {
        parciales: '📝',
        finales: '🎓',
        matricula: '💳',
        vacaciones: '🏖️',
        otro: '📌'
      };

      milestones.push({
        id: evt.id,
        title: evt.title,
        date: evt.date,
        formattedDate: formatShortDateEs(evt.date),
        daysDiff: diff,
        type: evt.type,
        emoji: emojis[evt.type] || '📌',
        isPast: diff < 0,
        isToday: diff === 0
      });
    });
  }

  milestones.sort((a, b) => a.daysDiff - b.daysDiff);

  return {
    trafficLight,
    message,
    dailyAvgExpense,
    recentExpenses14d,
    expenseTxCount14d,
    balance,
    daysLeft,
    zeroDate,
    zeroDateFormatted,
    nextIncomeDate,
    nextIncomeFormatted,
    daysUntilNextIncome,
    surplusAtNextIncome,
    maxDailyToSurvive,
    daysShort,
    parcialesAlert,
    semesterProgressPct,
    semesterDaysTotal,
    semesterDaysElapsed,
    upcomingMilestones: milestones
  };
}
