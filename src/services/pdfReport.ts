/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Generador de informe en PDF para EduPlata usando jsPDF
 * 100% en el navegador del usuario, sin llamadas a backend.
 */

import { jsPDF } from 'jspdf';
import { AIAnalysisResult, BudgetConfig, SavingsGoal, Transaction, UserProfile } from '../types';
import { formatCOP } from '../utils/formatters';
import { getCategoryInfo } from '../utils/categories';

export interface PDFReportData {
  userProfile: UserProfile;
  transactions: Transaction[];
  budget: BudgetConfig;
  goals: SavingsGoal[];
  aiAnalysis: AIAnalysisResult | null;
}

export function generateFinancialPDFReport(data: PDFReportData): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // Cálculos financieros
  const totalIncome = data.transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = data.transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;
  const budgetSpentPct = data.budget.monthlyExpenseLimit > 0
    ? Math.round((totalExpense / data.budget.monthlyExpenseLimit) * 100)
    : 0;

  // Agrupar gastos por categoría
  const categoryExpenses: Record<string, number> = {};
  data.transactions
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      categoryExpenses[t.category] = (categoryExpenses[t.category] || 0) + t.amount;
    });

  const sortedCategories = Object.entries(categoryExpenses).sort(([, a], [, b]) => b - a);

  // --- HEADER BANNER ---
  // Fondo superior esmeralda oscuro / púrpura
  doc.setFillColor(16, 185, 129); // Emerald-500
  doc.rect(0, 0, pageWidth, 28, 'F');

  // Acento morado
  doc.setFillColor(124, 58, 237); // Purple-600
  doc.rect(pageWidth - 40, 0, 40, 28, 'F');

  // Título y branding
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('EduPlata', margin, 13);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Reporte Financiero Universitario | Colombia (COP)', margin, 19);

  // Fecha y estudiante a la derecha
  const today = new Date().toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  doc.setFontSize(8);
  doc.text(`Fecha: ${today}`, margin, 24);

  y = 35;

  // --- INFO DEL ESTUDIANTE ---
  doc.setFillColor(248, 250, 252); // Slate-50
  doc.setDrawColor(226, 232, 240); // Slate-200
  doc.roundedRect(margin, y, contentWidth, 14, 2, 2, 'FD');

  doc.setTextColor(51, 65, 85); // Slate-700
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(`Estudiante: ${data.userProfile.name || 'Sin nombre'}`, margin + 4, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139); // Slate-500
  doc.text(
    `${data.userProfile.university || 'Universidad'} • ${data.userProfile.career || 'Estudiante'} • ${data.userProfile.semester || ''}`,
    margin + 4,
    y + 10.5
  );

  y += 19;

  // --- TARJETAS KPI DE RESUMEN ---
  const kpiWidth = (contentWidth - 6) / 3;
  const kpiHeight = 20;

  // KPI 1: Saldo Actual
  doc.setFillColor(240, 253, 244); // Emerald-50
  doc.setDrawColor(187, 247, 208); // Emerald-200
  doc.roundedRect(margin, y, kpiWidth, kpiHeight, 2, 2, 'FD');

  doc.setTextColor(22, 101, 52); // Emerald-800
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('SALDO ACTUAL', margin + 4, y + 6);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(formatCOP(balance), margin + 4, y + 14);

  // KPI 2: Ingresos del Mes
  doc.setFillColor(245, 243, 255); // Violet-50
  doc.setDrawColor(221, 214, 254); // Violet-200
  doc.roundedRect(margin + kpiWidth + 3, y, kpiWidth, kpiHeight, 2, 2, 'FD');

  doc.setTextColor(91, 33, 182); // Violet-800
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('INGRESOS MES', margin + kpiWidth + 7, y + 6);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(formatCOP(totalIncome), margin + kpiWidth + 7, y + 14);

  // KPI 3: Gastos del Mes
  doc.setFillColor(254, 242, 242); // Rose-50
  doc.setDrawColor(254, 205, 211); // Rose-200
  doc.roundedRect(margin + (kpiWidth + 3) * 2, y, kpiWidth, kpiHeight, 2, 2, 'FD');

  doc.setTextColor(159, 18, 57); // Rose-800
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`GASTOS MES (${budgetSpentPct}% pres.)`, margin + (kpiWidth + 3) * 2 + 4, y + 6);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(formatCOP(totalExpense), margin + (kpiWidth + 3) * 2 + 4, y + 14);

  y += kpiHeight + 8;

  // --- SECCIÓN: DESGLOSE DE GASTOS POR CATEGORÍA ---
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Desglose de Gastos Universitarios', margin, y);

  y += 4;
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.line(margin, y, margin + contentWidth, y);
  y += 5;

  if (sortedCategories.length === 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text('No hay gastos registrados en este periodo.', margin, y);
    y += 8;
  } else {
    // Encabezados de tabla
    doc.setFillColor(241, 245, 249);
    doc.rect(margin, y, contentWidth, 6, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text('Categoría', margin + 3, y + 4.2);
    doc.text('Total Gastado', margin + 70, y + 4.2);
    doc.text('Límite Fijado', margin + 110, y + 4.2);
    doc.text('% Gastado', margin + 150, y + 4.2);

    y += 7;

    sortedCategories.forEach(([catKey, amount]) => {
      const info = getCategoryInfo(catKey as any);
      const limit = (data.budget.categoryLimits as Record<string, number>)[catKey] || 0;
      const pctOfTotal = totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0;
      const pctOfLimit = limit > 0 ? Math.round((amount / limit) * 100) : null;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(51, 65, 85);
      doc.text(`${info.name}`, margin + 3, y + 3.5);
      doc.text(formatCOP(amount), margin + 70, y + 3.5);
      doc.text(limit > 0 ? formatCOP(limit) : 'Sin límite', margin + 110, y + 3.5);

      // Estado del presupuesto en color
      if (pctOfLimit !== null) {
        if (pctOfLimit > 100) {
          doc.setTextColor(225, 29, 72); // Red
        } else if (pctOfLimit > 80) {
          doc.setTextColor(217, 119, 6); // Yellow/Amber
        } else {
          doc.setTextColor(22, 163, 74); // Green
        }
        doc.text(`${pctOfLimit}% del límite (${pctOfTotal}% del mes)`, margin + 150, y + 3.5);
      } else {
        doc.setTextColor(100, 116, 139);
        doc.text(`${pctOfTotal}% del mes`, margin + 150, y + 3.5);
      }

      // Línea divisoria suave
      y += 5.5;
      doc.setDrawColor(241, 245, 249);
      doc.line(margin, y, margin + contentWidth, y);
      y += 1.5;
    });
  }

  y += 4;

  // --- SECCIÓN: METAS DE AHORRO ---
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Progreso en Metas de Ahorro', margin, y);

  y += 4;
  doc.setDrawColor(203, 213, 225);
  doc.line(margin, y, margin + contentWidth, y);
  y += 5;

  if (data.goals.length === 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text('Aún no has creado metas de ahorro.', margin, y);
    y += 8;
  } else {
    data.goals.forEach((goal) => {
      const progress = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(51, 65, 85);
      doc.text(goal.title, margin + 2, y + 3);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      const textProgress = `${formatCOP(goal.currentAmount)} / ${formatCOP(goal.targetAmount)} (${progress}%) - Límite: ${goal.deadline}`;
      doc.text(textProgress, margin + contentWidth - doc.getTextWidth(textProgress) - 2, y + 3);

      y += 4.5;
      // Barra de progreso de fondo
      doc.setFillColor(226, 232, 240);
      doc.roundedRect(margin + 2, y, contentWidth - 4, 3, 1.5, 1.5, 'F');
      
      // Barra de progreso completada
      if (progress > 0) {
        doc.setFillColor(16, 185, 129); // Emerald
        const filledWidth = Math.max(3, ((contentWidth - 4) * progress) / 100);
        doc.roundedRect(margin + 2, y, filledWidth, 3, 1.5, 1.5, 'F');
      }

      y += 7;
    });
  }

  y += 4;

  // --- SECCIÓN: CONSEJOS Y DIAGNÓSTICO IA (SI EXISTEN) ---
  if (data.aiAnalysis) {
    // Si no queda espacio suficiente para el bloque de IA, agregamos nueva página
    if (y > pageHeight - 55) {
      doc.addPage();
      y = margin + 5;
    }

    doc.setTextColor(124, 58, 237); // Purple-600
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Consejos Personalizados de EduPlata IA', margin, y);

    y += 4;
    doc.setDrawColor(221, 214, 254);
    doc.line(margin, y, margin + contentWidth, y);
    y += 5;

    // Caja de resumen
    doc.setFillColor(250, 245, 255); // Purple-50
    doc.setDrawColor(233, 213, 255);
    doc.roundedRect(margin, y, contentWidth, 18, 2, 2, 'FD');

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8.5);
    doc.setTextColor(88, 28, 135);
    const summaryLines = doc.splitTextToSize(data.aiAnalysis.summary, contentWidth - 8);
    doc.text(summaryLines, margin + 4, y + 5);

    y += 22;

    // Recortes sugeridos
    if (data.aiAnalysis.cutSuggestions.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(159, 18, 57);
      doc.text('3 Gastos Clave para Recortar:', margin, y);
      y += 4.5;

      data.aiAnalysis.cutSuggestions.slice(0, 3).forEach((cut, idx) => {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(51, 65, 85);
        doc.text(`${idx + 1}. ${cut.title} (Ahorro est.: ${formatCOP(cut.potentialSaving)})`, margin + 2, y);
        y += 3.5;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(100, 116, 139);
        const expLines = doc.splitTextToSize(cut.explanation, contentWidth - 6);
        doc.text(expLines, margin + 4, y);
        y += expLines.length * 3.2 + 2;
      });
    }

    // Consejos realistas
    if (data.aiAnalysis.savingsTips.length > 0 && y < pageHeight - 30) {
      y += 2;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(16, 185, 129);
      doc.text('Tips Prácticos para Estudiantes:', margin, y);
      y += 4.5;

      data.aiAnalysis.savingsTips.slice(0, 3).forEach((tip, idx) => {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.8);
        doc.setTextColor(51, 65, 85);
        const tipLines = doc.splitTextToSize(`• ${tip}`, contentWidth - 6);
        doc.text(tipLines, margin + 2, y);
        y += tipLines.length * 3.2 + 1;
      });
    }
  }

  // --- FOOTER ---
  const totalPages = doc.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184); // Slate-400
    doc.text(
      'EduPlata - Tu app universitaria de finanzas personales | Hecho para estudiantes de Colombia',
      margin,
      pageHeight - 6
    );
    doc.text(`Página ${i} de ${totalPages}`, pageWidth - margin - 18, pageHeight - 6);
  }

  // Descarga directa en el navegador
  const fileName = `EduPlata_Reporte_${(data.userProfile.name || 'Estudiante').replace(/\s+/g, '_')}_${today.replace(/\s+/g, '_')}.pdf`;
  doc.save(fileName);
}
