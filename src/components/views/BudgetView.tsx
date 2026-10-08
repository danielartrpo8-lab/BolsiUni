/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Vista de Presupuesto Mensual
 * Configuración del presupuesto global y límites por categoría,
 * barras de progreso dinámicas (verde, amarillo, rojo).
 */

import React, { useState, useMemo } from 'react';
import { 
  PieChart, 
  Settings2, 
  AlertCircle, 
  CheckCircle2, 
  Check, 
  Edit3, 
  Info, 
  ArrowUpRight,
  TrendingDown,
  SlidersHorizontal
} from 'lucide-react';
import { BudgetConfig, ExpenseCategoryId, Transaction } from '../../types';
import { EXPENSE_CATEGORIES } from '../../utils/categories';
import { formatCOP } from '../../utils/formatters';

interface BudgetViewProps {
  budget: BudgetConfig;
  transactions: Transaction[];
  onUpdateBudget: (newBudget: BudgetConfig) => void;
  onOpenBudgetModal?: () => void;
}

export const BudgetView: React.FC<BudgetViewProps> = ({
  budget,
  transactions,
  onUpdateBudget,
  onOpenBudgetModal
}) => {
  const [isEditingGlobal, setIsEditingGlobal] = useState(false);
  const [globalLimitStr, setGlobalLimitStr] = useState(budget.monthlyExpenseLimit.toString());

  const [editingCategory, setEditingCategory] = useState<ExpenseCategoryId | null>(null);
  const [catLimitStr, setCatLimitStr] = useState('');
  const [budgetError, setBudgetError] = useState<string | null>(null);

  // Gastos del mes agrupados por categoría
  const categorySpent = useMemo(() => {
    const map: Record<string, number> = {};
    transactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        map[t.category] = (map[t.category] || 0) + t.amount;
      });
    return map;
  }, [transactions]);

  const totalSpent = useMemo(() => {
    return Object.values(categorySpent).reduce((s, v) => s + v, 0);
  }, [categorySpent]);

  const globalSpentPct = budget.monthlyExpenseLimit > 0
    ? Math.round((totalSpent / budget.monthlyExpenseLimit) * 100)
    : 0;

  const totalAllocatedSpecific = useMemo(() => {
    return Object.values(budget.categoryLimits).reduce((s, v) => s + (v || 0), 0);
  }, [budget.categoryLimits]);

  const handleSaveGlobal = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(globalLimitStr.replace(/[^0-9]/g, ''), 10);
    if (!isNaN(val) && val >= 0) {
      if (val > 0 && totalAllocatedSpecific > val) {
        setBudgetError(
          `El presupuesto mensual (${formatCOP(val)}) no puede ser menor que la suma de tus gastos específicos asignados (${formatCOP(totalAllocatedSpecific)}).`
        );
        return;
      }
      setBudgetError(null);
      onUpdateBudget({
        ...budget,
        monthlyExpenseLimit: val
      });
      setIsEditingGlobal(false);
    }
  };

  const handleStartEditCat = (catId: ExpenseCategoryId) => {
    setEditingCategory(catId);
    setBudgetError(null);
    setCatLimitStr((budget.categoryLimits[catId] || 0).toString());
  };

  const handleSaveCatLimit = (catId: ExpenseCategoryId) => {
    const val = parseInt(catLimitStr.replace(/[^0-9]/g, ''), 10) || 0;
    const newLimits = {
      ...budget.categoryLimits,
      [catId]: val
    };
    const newTotalSpecific = Object.values(newLimits).reduce((s, v) => s + (v || 0), 0);
    if (budget.monthlyExpenseLimit > 0 && newTotalSpecific > budget.monthlyExpenseLimit) {
      setBudgetError(
        `No se puede asignar ${formatCOP(val)} a ${EXPENSE_CATEGORIES[catId]?.name || catId}. La suma de gastos específicos (${formatCOP(newTotalSpecific)}) superaría tu presupuesto total (${formatCOP(budget.monthlyExpenseLimit)}).`
      );
      return;
    }
    setBudgetError(null);
    onUpdateBudget({
      ...budget,
      categoryLimits: newLimits
    });
    setEditingCategory(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* CABECERA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Presupuesto Mensual Universitario
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Define topes máximos para no gastar de más en comida, salidas o fotocopias
          </p>
        </div>
        {onOpenBudgetModal && (
          <button
            onClick={onOpenBudgetModal}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-bold transition-all shadow-sm cursor-pointer self-start sm:self-auto"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Configurar Todos los Límites</span>
          </button>
        )}
      </div>

      {budgetError && (
        <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center justify-between gap-2 animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
            <span>{budgetError}</span>
          </div>
          <button
            onClick={() => setBudgetError(null)}
            className="text-xs underline font-bold shrink-0 text-rose-800 dark:text-rose-200"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* TARJETA DEL PRESUPUESTO GLOBAL */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Límite de Gastos Totales del Mes
            </span>
            {isEditingGlobal ? (
              <form onSubmit={handleSaveGlobal} className="flex items-center gap-2 mt-2">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-400 font-mono">
                    $
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={globalLimitStr ? parseInt(globalLimitStr.replace(/[^0-9]/g, ''), 10).toLocaleString('es-CO') : ''}
                    onChange={(e) => setGlobalLimitStr(e.target.value.replace(/[^0-9]/g, ''))}
                    autoFocus
                    className="pl-8 pr-3 py-1.5 text-lg font-bold font-mono rounded-xl border border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500"
                >
                  Guardar
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingGlobal(false)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold"
                >
                  Cancelar
                </button>
              </form>
            ) : (
              <div className="flex items-center gap-3 mt-1">
                <span className="text-3xl font-extrabold font-mono text-slate-900 dark:text-white">
                  {formatCOP(budget.monthlyExpenseLimit)}
                </span>
                <button
                  onClick={() => {
                    setGlobalLimitStr(budget.monthlyExpenseLimit.toString());
                    setIsEditingGlobal(true);
                  }}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                  title="Cambiar presupuesto mensual"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div className="text-left md:text-right">
            <span className="text-xs text-slate-400">Total gastado hasta hoy:</span>
            <div className="text-xl sm:text-2xl font-extrabold font-mono text-rose-600 dark:text-rose-400">
              {formatCOP(totalSpent)}
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {globalSpentPct}% consumido • {formatCOP(Math.max(0, budget.monthlyExpenseLimit - totalSpent))} libre
            </span>
          </div>
        </div>

        {/* Barra de progreso global */}
        <div className="mt-5 space-y-1.5">
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-3.5 rounded-full overflow-hidden p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                globalSpentPct > 90
                  ? 'bg-rose-500'
                  : globalSpentPct > 70
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, globalSpentPct)}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[11px] text-slate-400">
            <span>0%</span>
            <span className="font-semibold">
              {globalSpentPct <= 70 && '🟢 Zona segura (verde)'}
              {globalSpentPct > 70 && globalSpentPct <= 90 && '🟡 Precaución (amarillo)'}
              {globalSpentPct > 90 && '🔴 Límite crítico (rojo)'}
            </span>
            <span>100%</span>
          </div>
        </div>
      </div>

      {/* LÍMITES POR CATEGORÍA */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            Límites por Categoría de Gasto
          </h3>
          <span className="text-xs text-slate-400">
            Haz clic en el lápiz para ajustar cada tope
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.values(EXPENSE_CATEGORIES).map((cat) => {
            const catId = cat.id as ExpenseCategoryId;
            const spent = categorySpent[catId] || 0;
            const limit = budget.categoryLimits[catId] || 0;
            const hasLimit = limit > 0;
            const spentPct = hasLimit ? Math.round((spent / limit) * 100) : 0;
            const isEditing = editingCategory === catId;

            // Colores de la barra por categoría:
            // Verde (<70%), Amarillo (70-90%), Rojo (>90% o superado)
            let statusColor = 'bg-emerald-500';
            let badgeBg = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
            let statusLabel = 'Controlado';

            if (spentPct > 90) {
              statusColor = 'bg-rose-500';
              badgeBg = 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800';
              statusLabel = spentPct > 100 ? 'Excedido' : 'Alerta crítica';
            } else if (spentPct > 70) {
              statusColor = 'bg-amber-500';
              badgeBg = 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800';
              statusLabel = 'Cerca al límite';
            }

            return (
              <div
                key={cat.id}
                className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Encabezado de la categoría */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xl shrink-0">
                        {cat.emoji}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                          {cat.name}
                        </h4>
                        <p className="text-[11px] text-slate-400 line-clamp-1">
                          {cat.description}
                        </p>
                      </div>
                    </div>

                    {hasLimit && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeBg}`}>
                        {statusLabel}
                      </span>
                    )}
                  </div>

                  {/* Números: Gastado vs Límite */}
                  <div className="flex items-baseline justify-between mt-3 text-xs">
                    <div>
                      <span className="text-slate-400">Gastado: </span>
                      <strong className="text-sm font-bold font-mono text-slate-900 dark:text-white">
                        {formatCOP(spent)}
                      </strong>
                    </div>

                    <div>
                      <span className="text-slate-400">Límite: </span>
                      {isEditing ? (
                        <div className="inline-flex items-center gap-1">
                          <input
                            type="text"
                            inputMode="numeric"
                            value={catLimitStr ? parseInt(catLimitStr.replace(/[^0-9]/g, ''), 10).toLocaleString('es-CO') : ''}
                            onChange={(e) => setCatLimitStr(e.target.value.replace(/[^0-9]/g, ''))}
                            autoFocus
                            placeholder="0"
                            className="w-24 px-2 py-0.5 rounded-lg border border-emerald-500 bg-white dark:bg-slate-800 text-xs font-mono font-bold"
                          />
                          <button
                            onClick={() => handleSaveCatLimit(catId)}
                            className="p-1 rounded bg-emerald-600 text-white hover:bg-emerald-500"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span className="font-bold font-mono text-slate-700 dark:text-slate-300 inline-flex items-center gap-1">
                          {hasLimit ? formatCOP(limit) : 'Sin límite'}
                          <button
                            onClick={() => handleStartEditCat(catId)}
                            className="text-slate-400 hover:text-slate-600 p-0.5 ml-1"
                            title="Modificar límite de categoría"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Barra de progreso de la categoría */}
                  <div className="mt-3">
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${hasLimit ? statusColor : 'bg-slate-300 dark:bg-slate-700'}`}
                        style={{ width: `${hasLimit ? Math.min(100, spentPct) : (spent > 0 ? 100 : 0)}%` }}
                      />
                    </div>
                  </div>

                </div>

                {/* Pie de la tarjeta */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  {hasLimit ? (
                    <>
                      <span>{spentPct}% gastado</span>
                      <span className={spent > limit ? 'text-rose-600 dark:text-rose-400 font-bold' : ''}>
                        {spent > limit ? `Excedido por ${formatCOP(spent - limit)}` : `Te sobran ${formatCOP(limit - spent)}`}
                      </span>
                    </>
                  ) : (
                    <span className="text-slate-400 italic">
                      Fija un límite para recibir alertas antes de que se acabe la plata
                    </span>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* CONSEJOS UNIVERSITARIOS DE PRESUPUESTO */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white p-6 rounded-3xl shadow-md border border-slate-800 space-y-3">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">💡</span>
          <h4 className="font-bold text-base text-white">
            Estrategia de supervivencia universitaria
          </h4>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-300">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <strong className="block text-emerald-400 mb-1">🍱 Almuerzos y refrigerios</strong>
            Llevar almuerzo de casa 2 días a la semana te ahorra cerca de $120.000 al mes en corrientazos.
          </div>
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <strong className="block text-teal-400 mb-1">🚌 Tarifa estudiantil de transporte</strong>
            Pregunta en bienestar universitario por el auxilio o descuento de pasajes del sistema integrado.
          </div>
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <strong className="block text-amber-400 mb-1">📚 Copias y libros digitales</strong>
            Usa los repositorios de la biblioteca y comparte archivos PDF con tus compañeros en vez de imprimir todo.
          </div>
        </div>
      </div>

    </div>
  );
};
