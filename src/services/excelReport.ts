/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Generador de informe en Excel (.CSV compatible con Microsoft Excel)
 * para EduPlata. Funciona 100% en el navegador con soporte de tildes UTF-8 BOM.
 */

import { BudgetConfig, Transaction, UserProfile } from '../types';
import { getCategoryInfo } from '../utils/categories';
import { formatCOP } from '../utils/formatters';

export function exportTransactionsToExcel(
  transactions: Transaction[],
  userProfile: UserProfile,
  budget: BudgetConfig
): void {
  const studentName = userProfile.name?.trim() ? userProfile.name.trim() : 'Estudiante (No registrado)';
  const universityName = userProfile.university?.trim() ? userProfile.university.trim() : 'No registrada';
  const today = new Date().toISOString().slice(0, 10);

  // Cálculos
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  // Encabezados con separador de punto y coma ';' que es el estándar de Excel en países hispanohablantes
  const rows: string[] = [];

  // Metadatos
  rows.push(`"EduPlata - Reporte Financiero Universitario"`);
  rows.push(`"Estudiante:";"${studentName}"`);
  rows.push(`"Universidad:";"${universityName}"`);
  if (userProfile.career?.trim()) {
    rows.push(`"Carrera:";"${userProfile.career.trim()}"`);
  }
  if (userProfile.semester?.trim()) {
    rows.push(`"Semestre:";"${userProfile.semester.trim()}"`);
  }
  rows.push(`"Fecha de exportación:";"${today}"`);
  rows.push(`"Saldo en Bolsillo:";"${formatCOP(balance)}"`);
  rows.push(`"Ingresos Totales:";"${formatCOP(totalIncome)}"`);
  rows.push(`"Gastos Totales:";"${formatCOP(totalExpense)}"`);
  rows.push(`"Presupuesto Mensual Fijado:";"${formatCOP(budget.monthlyExpenseLimit)}"`);
  rows.push(''); // Fila vacía

  // Cabecera de la tabla de movimientos
  rows.push(`"Fecha";"Tipo";"Categoría";"Monto (COP)";"Concepto / Nota"`);

  // Filas de movimientos ordenadas por fecha
  const sorted = [...transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  sorted.forEach((t) => {
    const info = getCategoryInfo(t.category);
    const tipo = t.type === 'income' ? 'Ingreso (+)' : 'Gasto (-)';
    const monto = t.type === 'income' ? t.amount : -t.amount;
    const nota = (t.note || '').replace(/"/g, '""');

    rows.push(`"${t.date}";"${tipo}";"${info.name}";"${monto}";"${nota}"`);
  });

  rows.push('');
  rows.push(`"RESUMEN FINAL";"";"";"";""`);
  rows.push(`"TOTAL INGRESOS";"";"";"${totalIncome}";""`);
  rows.push(`"TOTAL GASTOS";"";"";"-${totalExpense}";""`);
  rows.push(`"SALDO DISPONIBLE";"";"";"${balance}";""`);

  // Construir archivo CSV con BOM UTF-8 para que Excel lo abra con acentos correctos
  const csvContent = '\uFEFF' + rows.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const cleanName = studentName.replace(/\s+/g, '_');
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `EduPlata_Movimientos_${cleanName}_${today}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
