/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * MOAI Inmobiliaria - Generador de Balance y Reporte Contable en PDF
 * Utiliza jsPDF directamente en el navegador del usuario con diseño corporativo oficial.
 */

import { jsPDF } from 'jspdf';
import { CompanyProfile, BudgetConfig, Property, Transaction, Partner } from '../types';
import { formatCOP } from '../utils/formatters';
import { getCategoryInfo } from '../utils/categories';

export interface PDFReportData {
  companyProfile: CompanyProfile;
  transactions: Transaction[];
  properties: Property[];
  budget: BudgetConfig;
  partners: Partner[];
}

export function generateFinancialPDFReport(data: PDFReportData): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  let y = margin;

  // Cálculos contables
  let moaiIncomes = 0;
  let moaiExpenses = 0;
  let custodyIncomes = 0;
  let custodyExpenses = 0;

  data.transactions.forEach((t) => {
    if (t.fundType === 'moai_operativa') {
      if (t.type === 'income') moaiIncomes += t.amount;
      else moaiExpenses += t.amount;
    } else {
      if (t.type === 'income') custodyIncomes += t.amount;
      else custodyExpenses += t.amount;
    }
  });

  const moaiNetProfit = moaiIncomes - moaiExpenses;
  const custodyPending = custodyIncomes - custodyExpenses;
  const today = new Date().toISOString().slice(0, 10);

  // Encabezado Corporativo MOAI (Rojo #e10b17 y carbón)
  doc.setFillColor(225, 11, 23); // #e10b17
  doc.rect(margin, y, pageWidth - margin * 2, 22, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('MOAI INMOBILIARIA S.A.S.', margin + 6, y + 9);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Medellín, Antioquia • Calle 32C # 80A 45 • NIT: 901.845.210-4', margin + 6, y + 16);
  doc.text(`Fecha: ${today}`, pageWidth - margin - 35, y + 16);

  y += 28;

  // Título del Reporte
  doc.setTextColor(30, 32, 34);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('INFORME CONTABLE Y ESTADO DE CAJA EJECUTIVO', margin, y);
  y += 6;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text('Separación de Flujo Propio MOAI (Comisiones) vs Fondos en Custodia de Terceros (Cánones)', margin, y);
  y += 8;

  // Cuadro 1: Caja Operativa MOAI
  doc.setFillColor(248, 249, 250);
  doc.roundedRect(margin, y, (pageWidth - margin * 2) / 2 - 2, 26, 3, 3, 'F');
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(225, 11, 23);
  doc.text('CAJA OPERATIVA MOAI (PROPIA)', margin + 4, y + 6);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(50, 50, 50);
  doc.text(`Ingresos (Comisiones & Servicios): ${formatCOP(moaiIncomes)}`, margin + 4, y + 12);
  doc.text(`Egresos Operativos (Pauta, Nómina, Sede): ${formatCOP(moaiExpenses)}`, margin + 4, y + 17);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(5, 150, 105);
  doc.text(`Utilidad Neta MOAI: ${formatCOP(moaiNetProfit)}`, margin + 4, y + 22);

  // Cuadro 2: Fondo en Custodia (Terceros)
  const xRight = margin + (pageWidth - margin * 2) / 2 + 2;
  doc.setFillColor(248, 249, 250);
  doc.roundedRect(xRight, y, (pageWidth - margin * 2) / 2 - 2, 26, 3, 3, 'F');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(37, 99, 235);
  doc.text('FONDO EN CUSTODIA (PROPIETARIOS)', xRight + 4, y + 6);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(50, 50, 50);
  doc.text(`Cánones Brutos Recaudados: ${formatCOP(custodyIncomes)}`, xRight + 4, y + 12);
  doc.text(`Dispersado a Cuentas de Dueños: ${formatCOP(custodyExpenses)}`, xRight + 4, y + 17);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(37, 99, 235);
  doc.text(`Saldo Pendiente en Custodia: ${formatCOP(custodyPending)}`, xRight + 4, y + 22);

  y += 32;

  // Participaciones de Socios
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 32, 34);
  doc.text('JUNTA DE SOCIOS & PARTICIPACIÓN ACCIONARIA', margin, y);
  y += 5;

  data.partners.forEach((partner) => {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    const partnerShare = Math.round(moaiNetProfit * (partner.sharePercentage / 100));
    doc.text(`• ${partner.name} (${partner.role}) — ${partner.sharePercentage}% | Utilidad estimada: ${formatCOP(partnerShare)}`, margin + 2, y);
    y += 4.5;
  });

  y += 6;

  // Tabla de Movimientos Recientes
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 32, 34);
  doc.text('ÚLTIMOS ASIENTOS CONTABLES EN LIBRO DIARIO', margin, y);
  y += 5;

  // Encabezados tabla
  doc.setFillColor(235, 238, 242);
  doc.rect(margin, y, pageWidth - margin * 2, 6, 'F');
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(50, 50, 50);
  doc.text('Fecha', margin + 2, y + 4);
  doc.text('Fondo', margin + 22, y + 4);
  doc.text('Inmueble', margin + 50, y + 4);
  doc.text('Concepto', margin + 75, y + 4);
  doc.text('Monto COP', pageWidth - margin - 22, y + 4);

  y += 7;

  const sorted = [...data.transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 18);

  sorted.forEach((t) => {
    if (y > 270) {
      doc.addPage();
      y = margin;
    }

    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);

    const fundShort = t.fundType === 'moai_operativa' ? 'Caja MOAI' : 'Custodia';
    const propCode = t.propertyCode || 'General';
    const safeDesc = t.description.length > 38 ? t.description.slice(0, 38) + '...' : t.description;
    const sign = t.type === 'income' ? '+' : '-';

    doc.text(t.date, margin + 2, y + 3.5);
    doc.text(fundShort, margin + 22, y + 3.5);
    doc.text(propCode, margin + 50, y + 3.5);
    doc.text(safeDesc, margin + 75, y + 3.5);
    
    if (t.type === 'income') {
      doc.setTextColor(5, 150, 105);
    } else {
      doc.setTextColor(220, 38, 38);
    }
    doc.text(`${sign} ${formatCOP(t.amount)}`, pageWidth - margin - 22, y + 3.5);

    y += 5.5;
  });

  // Pie de página
  doc.setFontSize(7);
  doc.setTextColor(140, 140, 140);
  doc.text('Documento generado por MOAI Inmobiliaria Suite Contable • Medellín, Colombia', margin, 287);

  doc.save(`MOAI_Balance_Contable_${today}.pdf`);
}
