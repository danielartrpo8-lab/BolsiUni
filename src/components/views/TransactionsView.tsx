/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * MOAI Inmobiliaria - Libro Diario y Movimientos Contables
 * Registro detallado con separación de Caja Propia MOAI vs Fondos en Custodia de Propietarios,
 * filtros avanzados por inmueble, comprobante, categoría y exportación contable.
 */

import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  FileSpreadsheet, 
  Download, 
  Trash2, 
  Edit3, 
  Building2,
  ArrowUpRight,
  ArrowDownRight,
  ShieldAlert,
  Wallet
} from 'lucide-react';
import { FundType, MovementType, Transaction } from '../../types';
import { ALL_MOAI_CATEGORIES, getCategoryInfo } from '../../utils/categories';
import { formatCOP } from '../../utils/formatters';

interface TransactionsViewProps {
  transactions: Transaction[];
  onOpenAddModal: () => void;
  onEditTransaction: (t: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onExportExcel: () => void;
  onExportPDF: () => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  transactions,
  onOpenAddModal,
  onEditTransaction,
  onDeleteTransaction,
  onExportExcel,
  onExportPDF
}) => {
  const [filterFund, setFilterFund] = useState<'all' | FundType>('all');
  const [filterType, setFilterType] = useState<'all' | MovementType>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc'>('date_desc');

  // Filtrado y ordenamiento de movimientos
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((t) => {
        if (filterFund !== 'all' && t.fundType !== filterFund) return false;
        if (filterType !== 'all' && t.type !== filterType) return false;
        if (filterCategory !== 'all' && t.category !== filterCategory) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const desc = (t.description || '').toLowerCase();
          const recip = (t.recipientOrPayer || '').toLowerCase();
          const prop = (t.propertyCode || '').toLowerCase();
          const ref = (t.referenceNumber || '').toLowerCase();
          const catName = getCategoryInfo(t.category).name.toLowerCase();
          if (!desc.includes(q) && !recip.includes(q) && !prop.includes(q) && !ref.includes(q) && !catName.includes(q)) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date_desc') return b.date.localeCompare(a.date);
        if (sortBy === 'date_asc') return a.date.localeCompare(b.date);
        if (sortBy === 'amount_desc') return b.amount - a.amount;
        if (sortBy === 'amount_asc') return a.amount - b.amount;
        return 0;
      });
  }, [transactions, filterFund, filterType, filterCategory, searchQuery, sortBy]);

  // Totales del filtro actual
  const summary = useMemo(() => {
    let moaiIncomes = 0;
    let moaiExpenses = 0;
    let custodyCollected = 0;
    let custodyDisbursed = 0;

    filteredTransactions.forEach((t) => {
      if (t.fundType === 'moai_operativa') {
        if (t.type === 'income') moaiIncomes += t.amount;
        else moaiExpenses += t.amount;
      } else {
        if (t.type === 'income') custodyCollected += t.amount;
        else custodyDisbursed += t.amount;
      }
    });

    return {
      moaiIncomes,
      moaiExpenses,
      moaiNet: moaiIncomes - moaiExpenses,
      custodyCollected,
      custodyDisbursed,
      custodyPending: custodyCollected - custodyDisbursed
    };
  }, [filteredTransactions]);

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#15171c] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-[#e10b17] uppercase tracking-wider">
              Contabilidad MOAI
            </span>
            <span className="text-gray-300 dark:text-gray-700">•</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Libro Diario General
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white font-heading tracking-tight">
            Registro de Movimientos
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Ingresos por comisiones, servicios, recaudos de cánones y egresos operativos con soporte de comprobante.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={onExportExcel}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-gray-100 dark:bg-[#1f2229] hover:bg-gray-200 dark:hover:bg-[#282c35] text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700/80 transition-colors"
            title="Exportar a Excel (CSV)"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline">Excel</span>
          </button>

          <button
            onClick={onExportPDF}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-gray-100 dark:bg-[#1f2229] hover:bg-gray-200 dark:hover:bg-[#282c35] text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700/80 transition-colors"
            title="Exportar Reporte PDF"
          >
            <Download className="w-4 h-4 text-blue-600" />
            <span className="hidden sm:inline">PDF</span>
          </button>

          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 bg-[#e10b17] hover:bg-[#c00510] text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-xl shadow-xs transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Movimiento</span>
          </button>
        </div>
      </div>

      {/* Barra de Resumen de los Registros Filtrados */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-[#15171c] p-3.5 rounded-xl border border-gray-200 dark:border-gray-800">
          <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">
            Ingresos MOAI
          </span>
          <span className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400">
            {formatCOP(summary.moaiIncomes)}
          </span>
        </div>

        <div className="bg-white dark:bg-[#15171c] p-3.5 rounded-xl border border-gray-200 dark:border-gray-800">
          <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">
            Gastos MOAI
          </span>
          <span className="text-base font-bold font-mono text-rose-600 dark:text-rose-400">
            {formatCOP(summary.moaiExpenses)}
          </span>
        </div>

        <div className="bg-white dark:bg-[#15171c] p-3.5 rounded-xl border border-gray-200 dark:border-gray-800">
          <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">
            Recaudado Terceros
          </span>
          <span className="text-base font-bold font-mono text-blue-600 dark:text-blue-400">
            {formatCOP(summary.custodyCollected)}
          </span>
        </div>

        <div className="bg-white dark:bg-[#15171c] p-3.5 rounded-xl border border-gray-200 dark:border-gray-800">
          <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">
            Dispersado a Dueños
          </span>
          <span className="text-base font-bold font-mono text-purple-600 dark:text-purple-400">
            {formatCOP(summary.custodyDisbursed)}
          </span>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white dark:bg-[#15171c] p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          
          {/* Búsqueda */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por concepto, comprobante, inmueble o beneficiario..."
              className="w-full bg-gray-50 dark:bg-[#1c1f26] border border-gray-200 dark:border-gray-700/80 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-[#e10b17]"
            />
          </div>

          {/* Selector de Fondo */}
          <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <span className="text-xs text-gray-400 font-semibold whitespace-nowrap mr-1">Fondo:</span>
            {[
              { id: 'all', label: 'Todos' },
              { id: 'moai_operativa', label: 'Caja MOAI' },
              { id: 'custodia_propietarios', label: 'Custodia Terceros' }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterFund(f.id as any)}
                className={`text-xs px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-colors ${
                  filterFund === f.id
                    ? 'bg-[#e10b17] text-white'
                    : 'bg-gray-100 dark:bg-[#1f2229] text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Filtros Secundarios */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-gray-100 dark:border-gray-800 text-xs">
          
          {/* Tipo de movimiento */}
          <div className="flex items-center gap-1.5">
            <span className="text-gray-400 font-semibold">Tipo:</span>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="bg-gray-50 dark:bg-[#1c1f26] border border-gray-200 dark:border-gray-700 rounded-lg px-2.5 py-1 text-gray-800 dark:text-gray-200 focus:outline-none cursor-pointer"
            >
              <option value="all">Todos los tipos</option>
              <option value="income">Solo Ingresos (+)</option>
              <option value="expense">Solo Egresos (-)</option>
            </select>
          </div>

          {/* Categoría */}
          <div className="flex items-center gap-1.5">
            <span className="text-gray-400 font-semibold">Categoría:</span>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-gray-50 dark:bg-[#1c1f26] border border-gray-200 dark:border-gray-700 rounded-lg px-2.5 py-1 text-gray-800 dark:text-gray-200 focus:outline-none cursor-pointer max-w-[200px]"
            >
              <option value="all">Todas las categorías</option>
              {Object.values(ALL_MOAI_CATEGORIES).map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Orden */}
          <div className="flex items-center gap-1.5 ml-auto">
            <span className="text-gray-400 font-semibold">Ordenar:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-gray-50 dark:bg-[#1c1f26] border border-gray-200 dark:border-gray-700 rounded-lg px-2.5 py-1 text-gray-800 dark:text-gray-200 focus:outline-none cursor-pointer"
            >
              <option value="date_desc">Más recientes primero</option>
              <option value="date_asc">Más antiguos primero</option>
              <option value="amount_desc">Mayor monto</option>
              <option value="amount_asc">Menor monto</option>
            </select>
          </div>

        </div>
      </div>

      {/* Tabla de Movimientos */}
      <div className="bg-white dark:bg-[#15171c] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 dark:bg-[#1a1d23] text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider border-b border-gray-200 dark:border-gray-800">
              <tr>
                <th className="py-3 px-4">Fecha</th>
                <th className="py-3 px-4">Fondo</th>
                <th className="py-3 px-4">Concepto / Descripción</th>
                <th className="py-3 px-4">Categoría</th>
                <th className="py-3 px-4">Inmueble / Ref</th>
                <th className="py-3 px-4 text-right">Monto (COP)</th>
                <th className="py-3 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800/80">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400 italic">
                    No hay movimientos que coincidan con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => {
                  const cat = getCategoryInfo(tx.category);
                  const isMoaiOwn = tx.fundType === 'moai_operativa';

                  return (
                    <tr key={tx.id} className="hover:bg-gray-50/60 dark:hover:bg-[#1a1d23]/50 transition-colors">
                      
                      {/* Fecha */}
                      <td className="py-3.5 px-4 font-mono text-gray-600 dark:text-gray-400 whitespace-nowrap">
                        {tx.date}
                      </td>

                      {/* Fondo */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                          isMoaiOwn
                            ? 'bg-red-50 text-[#e10b17] dark:bg-red-950/60 dark:text-red-400 border border-red-200 dark:border-red-900/40'
                            : 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200 dark:border-blue-900/40'
                        }`}>
                          {isMoaiOwn ? 'Caja MOAI' : 'Custodia Terceros'}
                        </span>
                      </td>

                      {/* Concepto / Descripción */}
                      <td className="py-3.5 px-4 font-medium text-gray-900 dark:text-white max-w-xs truncate">
                        <div>
                          <span>{tx.description}</span>
                          {tx.recipientOrPayer && (
                            <span className="block text-[11px] text-gray-400 truncate">
                              Beneficiario/Pagador: {tx.recipientOrPayer}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Categoría */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
                          <span>{cat.emoji}</span>
                          <span>{cat.shortName}</span>
                        </span>
                      </td>

                      {/* Inmueble / Comprobante */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {tx.propertyCode ? (
                          <span className="font-mono text-[11px] font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded">
                            {tx.propertyCode}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-[11px]">General</span>
                        )}
                        {tx.referenceNumber && (
                          <span className="block text-[10px] font-mono text-gray-400 mt-0.5">
                            {tx.referenceNumber}
                          </span>
                        )}
                      </td>

                      {/* Monto */}
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-sm whitespace-nowrap">
                        <span className={tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-white'}>
                          {tx.type === 'income' ? '+' : '-'} {formatCOP(tx.amount)}
                        </span>
                      </td>

                      {/* Acciones */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onEditTransaction(tx)}
                            className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            title="Editar movimiento"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteTransaction(tx.id)}
                            className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                            title="Eliminar movimiento"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
