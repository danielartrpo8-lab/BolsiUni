/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * MOAI Inmobiliaria - Exportador Contable a Excel (.CSV)
 * Genera libro diario compatible con Microsoft Excel (BOM UTF-8, separador ;)
 * con separación de fondos propios de MOAI y fondos en custodia de terceros.
 */

import { CompanyProfile, Transaction } from '../types';
import { getCategoryInfo } from '../utils/categories';
import { formatCOP } from '../utils/formatters';

export function exportTransactionsToExcel(
  transactions: Transaction[],
  companyProfile: CompanyProfile
): void {
  const today = new Date().toISOString().slice(0, 10);

  // Cálculos contables
  let moaiIncomes = 0;
  let moaiExpenses = 0;
  let custodyIncomes = 0;
  let custodyExpenses = 0;

  transactions.forEach((t) => {
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

  const rows: string[] = [];

  // Metadatos de la Empresa
  rows.push(`"MOAI Inmobiliaria S.A.S. - Libro Diario y Reporte Contable"`);
  rows.push(`"NIT:";"${companyProfile.nit}"`);
  rows.push(`"Sede:";"${companyProfile.address}, ${companyProfile.city}"`);
  rows.push(`"Contacto:";"${companyProfile.phone} - ${companyProfile.email}"`);
  rows.push(`"Fecha de Emisión:";"${today}"`);
  rows.push('');
  rows.push(`"ESTADO DE CAJA PROPIA MOAI"`);
  rows.push(`"Ingresos Operativos (Comisiones & Servicios):";"${formatCOP(moaiIncomes)}"`);
  rows.push(`"Gastos Operativos (Pauta, Nómina, Oficina):";"${formatCOP(moaiExpenses)}"`);
  rows.push(`"Utilidad Neta MOAI:";"${formatCOP(moaiNetProfit)}"`);
  rows.push('');
  rows.push(`"FONDO EN CUSTODIA (CUENTAS DE TERCEROS - PROPIETARIOS)"`);
  rows.push(`"Total Cánones Recaudados:";"${formatCOP(custodyIncomes)}"`);
  rows.push(`"Total Cánones Dispersados a Dueños:";"${formatCOP(custodyExpenses)}"`);
  rows.push(`"Saldo Pendiente en Custodia:";"${formatCOP(custodyPending)}"`);
  rows.push('');

  // Encabezados de tabla
  rows.push(`"Fecha";"Fondo Contable";"Tipo";"Categoría";"Inmueble";"Concepto / Descripción";"Beneficiario / Pagador";"N° Comprobante";"Monto en COP"`);

  // Movimientos ordenados por fecha
  const sorted = [...transactions].sort((a, b) => b.date.localeCompare(a.date));

  sorted.forEach((t) => {
    const cat = getCategoryInfo(t.category);
    const fundName = t.fundType === 'moai_operativa' ? 'Caja Operativa MOAI' : 'Custodia Propietarios';
    const typeName = t.type === 'income' ? 'Ingreso (+)' : 'Egreso (-)';
    const amountSign = t.type === 'income' ? t.amount : -t.amount;
    const safeDesc = (t.description || '').replace(/"/g, '""');
    const safeRecip = (t.recipientOrPayer || '').replace(/"/g, '""');
    const safeProp = t.propertyCode || 'General';
    const safeRef = t.referenceNumber || 'N/A';

    rows.push(
      `"${t.date}";"${fundName}";"${typeName}";"${cat.name}";"${safeProp}";"${safeDesc}";"${safeRecip}";"${safeRef}";"${amountSign}"`
    );
  });

  // Codificación UTF-8 con BOM para acentos y caracteres especiales en Excel
  const csvContent = '\uFEFF' + rows.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `MOAI_Libro_Contable_${today}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
