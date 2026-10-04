/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Formateadores de moneda (Pesos Colombianos COP) y fechas
 */

/**
 * Formatea un número en formato estándar de Pesos Colombianos (COP)
 * Ejemplo: 1000000 -> "$1.000.000"
 */
export function formatCOP(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '$0';
  }
  
  const isNegative = amount < 0;
  const absAmount = Math.round(Math.abs(amount));
  
  // Usar formato es-CO con separador de miles con punto
  const formatted = absAmount.toLocaleString('es-CO');
  return `${isNegative ? '-' : ''}$${formatted}`;
}

/**
 * Convierte un string de input a número limpio
 */
export function parseCOPInput(value: string): number {
  if (!value) return 0;
  // Elimina signos de pesos, puntos, comas y espacios
  const clean = value.replace(/[^0-9]/g, '');
  const parsed = parseInt(clean, 10);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Formatea fechas a formato amigable en español
 */
export function formatDate(dateString: string): string {
  if (!dateString) return '';
  
  try {
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const target = new Date(year, month - 1, day);
    target.setHours(0, 0, 0, 0);
    
    const diffTime = today.getTime() - target.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    if (diffDays === -1) return 'Mañana';
    
    return date.toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
    });
  } catch {
    return dateString;
  }
}

/**
 * Retorna la fecha de hoy en formato YYYY-MM-DD
 */
export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Calcula días restantes, semanas restantes y monto sugerido por semana/mes
 */
export function calculateSavingsRate(targetAmount: number, currentAmount: number, deadlineDate: string) {
  const remainingAmount = Math.max(0, targetAmount - currentAmount);
  if (remainingAmount === 0) {
    return {
      daysRemaining: 0,
      weeksRemaining: 0,
      monthsRemaining: 0,
      weeklyAmount: 0,
      monthlyAmount: 0,
      isCompleted: true,
      isOverdue: false
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const [y, m, d] = deadlineDate.split('-').map(Number);
  const deadline = new Date(y, m - 1, d);
  deadline.setHours(0, 0, 0, 0);

  const diffMs = deadline.getTime() - today.getTime();
  const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (daysRemaining <= 0) {
    return {
      daysRemaining: 0,
      weeksRemaining: 0,
      monthsRemaining: 0,
      weeklyAmount: remainingAmount,
      monthlyAmount: remainingAmount,
      isCompleted: false,
      isOverdue: true
    };
  }

  const weeksRemaining = Math.max(1, Math.round(daysRemaining / 7));
  const monthsRemaining = Math.max(1, +(daysRemaining / 30.4).toFixed(1));

  const weeklyAmount = Math.ceil(remainingAmount / weeksRemaining);
  const monthlyAmount = Math.ceil(remainingAmount / Math.max(1, Math.ceil(daysRemaining / 30.4)));

  return {
    daysRemaining,
    weeksRemaining,
    monthsRemaining,
    weeklyAmount,
    monthlyAmount,
    isCompleted: false,
    isOverdue: false
  };
}
