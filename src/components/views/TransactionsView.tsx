/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Vista de Movimientos
 * Registro, filtrado por tipo, categoría, búsqueda y edición/eliminación.
 */

import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Trash2, 
  Edit3, 
  Calendar,
  X
} from 'lucide-react';
import { CategoryId, MovementType, Transaction } from '../../types';
import { ALL_CATEGORIES, getCategoryInfo } from '../../utils/categories';
import { formatCOP, formatDate } from '../../utils/formatters';

interface TransactionsViewProps {
  transactions: Transaction[];
  onOpenAddModal: (defaultType?: MovementType) => void;
  onEditTransaction: (t: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  transactions,
  onOpenAddModal,
  onEditTransaction,
  onDeleteTransaction
}) => {
  const [filterType, setFilterType] = useState<'all' | MovementType>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc'>('date_desc');

  // Filtrado y ordenamiento de movimientos
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((t) => {
        // Filtro por tipo
        if (filterType !== 'all' && t.type !== filterType) return false;
        // Filtro por categoría
        if (filterCategory !== 'all' && t.category !== filterCategory) return false;
        // Búsqueda en notas o categoría
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const categoryName = getCategoryInfo(t.category).name.toLowerCase();
          const noteText = (t.note || '').toLowerCase();
          if (!categoryName.includes(q) && !noteText.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date_desc') {
          return new Date(b.date).getTime() - new Date(a.date).getTime() || b.createdAt - a.createdAt;
        }
        if (sortBy === 'date_asc') {
          return new Date(a.date).getTime() - new Date(b.date).getTime() || a.createdAt - b.createdAt;
        }
        if (sortBy === 'amount_desc') {
          return b.amount - a.amount;
        }
        if (sortBy === 'amount_asc') {
          return a.amount - b.amount;
        }
        return 0;
      });
  }, [transactions, filterType, filterCategory, searchQuery, sortBy]);

  // Totales del filtro actual
  const { filteredIncome, filteredExpense } = useMemo(() => {
    let inc = 0;
    let exp = 0;
    filteredTransactions.forEach((t) => {
      if (t.type === 'income') inc += t.amount;
      else exp += t.amount;
    });
    return { filteredIncome: inc, filteredExpense: exp };
  }, [filteredTransactions]);

  const clearFilters = () => {
    setFilterType('all');
    setFilterCategory('all');
    setSearchQuery('');
    setSortBy('date_desc');
  };

  const hasActiveFilters = filterType !== 'all' || filterCategory !== 'all' || searchQuery.trim().length > 0;

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      
      {/* BARRA SUPERIOR: TÍTULO Y BOTÓN NUEVO */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Historial de Movimientos
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Control detallado de cada ingreso y gasto de tu vida universitaria
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenAddModal('income')}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/80 dark:hover:bg-teal-900 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 text-xs font-bold transition-all cursor-pointer shadow-xs"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>+ Ingreso</span>
          </button>
          <button
            onClick={() => onOpenAddModal('expense')}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/80 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-bold transition-all cursor-pointer shadow-xs"
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>+ Gasto</span>
          </button>
          <button
            onClick={() => onOpenAddModal('expense')}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Movimiento</span>
          </button>
        </div>
      </div>

      {/* CONTROLES DE FILTRADO Y BÚSQUEDA */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3.5">
        
        {/* Fila 1: Pestañas de tipo (Todos / Gastos / Ingresos) + Buscador */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Tipo de movimiento */}
          <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterType === 'all'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Todos ({transactions.length})
            </button>
            <button
              onClick={() => setFilterType('expense')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                filterType === 'expense'
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <ArrowDownLeft className="w-3.5 h-3.5" />
              <span>Gastos</span>
            </button>
            <button
              onClick={() => setFilterType('income')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                filterType === 'income'
                  ? 'bg-emerald-500 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Ingresos</span>
            </button>
          </div>

          {/* Búsqueda por texto */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por notas (ej: corrientazo, fotocopias, tinto)..."
              className="w-full pl-9 pr-8 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

        </div>

        {/* Fila 2: Selector de Categoría y Ordenamiento */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-400 font-medium">Categoría:</span>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="all">Todas las categorías</option>
              {Object.values(ALL_CATEGORIES).map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.emoji} {cat.name} ({cat.type === 'income' ? 'Ingreso' : 'Gasto'})
                </option>
              ))}
            </select>

            <span className="text-slate-400 font-medium ml-2">Ordenar por:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="date_desc">Más recientes primero</option>
              <option value="date_asc">Más antiguos primero</option>
              <option value="amount_desc">Mayor monto ($)</option>
              <option value="amount_asc">Menor monto ($)</option>
            </select>
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>Limpiar filtros</span>
            </button>
          )}

        </div>

      </div>

      {/* RESUMEN DE ELEMENTOS FILTRADOS */}
      <div className="flex flex-wrap items-center justify-between text-xs px-2 text-slate-500 dark:text-slate-400">
        <div>
          Mostrando <strong>{filteredTransactions.length}</strong> de {transactions.length} movimientos
        </div>
        <div className="flex items-center gap-4 font-mono font-bold">
          {filteredIncome > 0 && (
            <span className="text-emerald-600 dark:text-emerald-400">
              +{formatCOP(filteredIncome)}
            </span>
          )}
          {filteredExpense > 0 && (
            <span className="text-rose-600 dark:text-rose-400">
              -{formatCOP(filteredExpense)}
            </span>
          )}
        </div>
      </div>

      {/* LISTADO DE MOVIMIENTOS */}
      {filteredTransactions.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-5xl">🔍</span>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mt-3">
            No se encontraron movimientos
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-sm mx-auto">
            {hasActiveFilters
              ? 'Prueba cambiando o limpiando los filtros de búsqueda.'
              : 'Empieza a registrar tus gastos e ingresos universitarios para no perder la cuenta de tu mesada.'}
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            {hasActiveFilters ? (
              <button
                onClick={clearFilters}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                Limpiar filtros
              </button>
            ) : (
              <>
                <button
                  onClick={() => onOpenAddModal('income')}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white cursor-pointer shadow-xs"
                >
                  + Agregar Ingreso
                </button>
                <button
                  onClick={() => onOpenAddModal('expense')}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer shadow-xs"
                >
                  + Agregar Gasto
                </button>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredTransactions.map((t) => {
            const info = getCategoryInfo(t.category);
            const isInc = t.type === 'income';

            return (
              <div
                key={t.id}
                className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all flex items-center justify-between gap-3 group"
              >
                {/* Icono + Detalles */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <div 
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 group-hover:scale-105 transition-transform"
                    style={{ backgroundColor: `${info.color}15` }}
                  >
                    {info.emoji}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-white truncate">
                        {t.note || info.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                      <span className="font-medium text-slate-600 dark:text-slate-300">
                        {info.name}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {formatDate(t.date)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Monto y Botones de acción */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span className={`text-sm sm:text-base font-extrabold font-mono ${isInc ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-slate-100'}`}>
                      {isInc ? '+' : '-'}{formatCOP(t.amount)}
                    </span>
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">
                      {isInc ? 'Ingreso' : 'Gasto'}
                    </p>
                  </div>

                  {/* Acciones Editar y Eliminar */}
                  <div className="flex items-center gap-1 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onEditTransaction(t)}
                      className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Editar movimiento"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`¿Eliminar este movimiento de ${formatCOP(t.amount)}?`)) {
                          onDeleteTransaction(t.id);
                        }
                      }}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                      title="Eliminar movimiento"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
