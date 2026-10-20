/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * MOAI Inmobiliaria - Control Presupuestal y Metas Comerciales
 * Seguimiento de metas de ingresos (comisiones arriendos, ventas y reformas)
 * y techos de gastos operativos por departamento (marketing, asesores, oficina).
 */

import React, { useState, useMemo } from 'react';
import { 
  PieChart, 
  Target, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle2, 
  Building2, 
  SlidersHorizontal,
  Plus,
  Coins
} from 'lucide-react';
import { BudgetConfig, MoaiExpenseCategory, MoaiIncomeCategory, Transaction, Property } from '../../types';
import { MOAI_EXPENSE_CATEGORIES, MOAI_INCOME_CATEGORIES, getCategoryInfo } from '../../utils/categories';
import { formatCOP } from '../../utils/formatters';

interface BudgetViewProps {
  budget: BudgetConfig;
  transactions: Transaction[];
  properties: Property[];
  onUpdateBudget: (newBudget: BudgetConfig) => void;
  onOpenBudgetModal?: () => void;
}

export const BudgetView: React.FC<BudgetViewProps> = ({
  budget,
  transactions,
  properties,
  onUpdateBudget,
  onOpenBudgetModal
}) => {
  const [isEditingModalOpen, setIsEditingModalOpen] = useState(false);
  const [formIncomeTarget, setFormIncomeTarget] = useState(budget.monthlyIncomeTarget.toString());
  const [formExpenseLimit, setFormExpenseLimit] = useState(budget.monthlyExpenseLimit.toString());
  const [formPropertiesTarget, setFormPropertiesTarget] = useState(budget.targetLeasedProperties.toString());

  // Ingresos reales por categoría (solo caja operativa MOAI)
  const incomeRealized = useMemo(() => {
    const map: Record<string, number> = {};
    transactions
      .filter(t => t.type === 'income' && t.fundType === 'moai_operativa')
      .forEach(t => {
        map[t.category] = (map[t.category] || 0) + t.amount;
      });
    return map;
  }, [transactions]);

  // Gastos reales por categoría (solo gastos operativos propios MOAI)
  const expenseRealized = useMemo(() => {
    const map: Record<string, number> = {};
    transactions
      .filter(t => t.type === 'expense' && t.fundType === 'moai_operativa')
      .forEach(t => {
        map[t.category] = (map[t.category] || 0) + t.amount;
      });
    return map;
  }, [transactions]);

  const totalIncomeRealized = useMemo(() => {
    return Object.values(incomeRealized).reduce((sum, v) => sum + v, 0);
  }, [incomeRealized]);

  const totalExpenseRealized = useMemo(() => {
    return Object.values(expenseRealized).reduce((sum, v) => sum + v, 0);
  }, [expenseRealized]);

  const incomeExecution = budget.monthlyIncomeTarget > 0 
    ? (totalIncomeRealized / budget.monthlyIncomeTarget) * 100 
    : 0;

  const expenseExecution = budget.monthlyExpenseLimit > 0 
    ? (totalExpenseRealized / budget.monthlyExpenseLimit) * 100 
    : 0;

  const leasedCount = properties.filter(p => p.status === 'arrendado').length;
  const portfolioExecution = budget.targetLeasedProperties > 0
    ? (leasedCount / budget.targetLeasedProperties) * 100
    : 0;

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateBudget({
      ...budget,
      monthlyIncomeTarget: parseInt(formIncomeTarget.replace(/\D/g, ''), 10) || budget.monthlyIncomeTarget,
      monthlyExpenseLimit: parseInt(formExpenseLimit.replace(/\D/g, ''), 10) || budget.monthlyExpenseLimit,
      targetLeasedProperties: parseInt(formPropertiesTarget.replace(/\D/g, ''), 10) || budget.targetLeasedProperties
    });
    setIsEditingModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#15171c] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-[#e10b17] uppercase tracking-wider">
              Control de Gestión MOAI
            </span>
            <span className="text-gray-300 dark:text-gray-700">•</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Presupuesto Mensual & Metas
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white font-heading tracking-tight">
            Presupuesto & Metas Comerciales
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Monitoreo en tiempo real de metas de comisiones de arriendos, ventas cerradas y control de gastos operativos.
          </p>
        </div>

        <button
          onClick={() => setIsEditingModalOpen(true)}
          className="flex items-center gap-2 bg-gray-100 dark:bg-[#1f2229] hover:bg-gray-200 dark:hover:bg-[#282c35] text-gray-800 dark:text-gray-200 text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700/80 transition-all self-start sm:self-auto"
        >
          <SlidersHorizontal className="w-4 h-4 text-[#e10b17]" />
          <span>Ajustar Metas y Techos</span>
        </button>
      </div>

      {/* 3 Grandes Metas Globales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Meta 1: Ingresos por Comisiones */}
        <div className="bg-white dark:bg-[#15171c] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Meta Ingresos MOAI
            </span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>

          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-2xl font-extrabold font-mono text-gray-900 dark:text-white">
              {formatCOP(totalIncomeRealized)}
            </span>
            <span className="text-xs text-gray-400 font-mono">
              / {formatCOP(budget.monthlyIncomeTarget)}
            </span>
          </div>

          <div className="w-full bg-gray-100 dark:bg-gray-800 h-2.5 rounded-full overflow-hidden mb-2">
            <div 
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, incomeExecution)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-emerald-600">{incomeExecution.toFixed(1)}% alcanzado</span>
            <span className="text-gray-400">
              Resta {formatCOP(Math.max(0, budget.monthlyIncomeTarget - totalIncomeRealized))}
            </span>
          </div>
        </div>

        {/* Meta 2: Techo de Gastos Operativos */}
        <div className="bg-white dark:bg-[#15171c] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Techo de Gastos Operativos
            </span>
            <TrendingDown className="w-4 h-4 text-rose-600" />
          </div>

          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-2xl font-extrabold font-mono text-gray-900 dark:text-white">
              {formatCOP(totalExpenseRealized)}
            </span>
            <span className="text-xs text-gray-400 font-mono">
              / {formatCOP(budget.monthlyExpenseLimit)}
            </span>
          </div>

          <div className="w-full bg-gray-100 dark:bg-gray-800 h-2.5 rounded-full overflow-hidden mb-2">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                expenseExecution > 95 ? 'bg-rose-500' : expenseExecution > 80 ? 'bg-amber-500' : 'bg-blue-500'
              }`}
              style={{ width: `${Math.min(100, expenseExecution)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className={`font-bold ${expenseExecution > 95 ? 'text-rose-600' : 'text-gray-600 dark:text-gray-300'}`}>
              {expenseExecution.toFixed(1)}% ejecutado
            </span>
            <span className="text-gray-400">
              Disponible {formatCOP(Math.max(0, budget.monthlyExpenseLimit - totalExpenseRealized))}
            </span>
          </div>
        </div>

        {/* Meta 3: Captación de Inmuebles en Cartera */}
        <div className="bg-white dark:bg-[#15171c] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Inmuebles en Administración
            </span>
            <Building2 className="w-4 h-4 text-[#e10b17]" />
          </div>

          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-2xl font-extrabold font-mono text-gray-900 dark:text-white">
              {leasedCount}
            </span>
            <span className="text-xs text-gray-400 font-mono">
              / Meta {budget.targetLeasedProperties} inmuebles
            </span>
          </div>

          <div className="w-full bg-gray-100 dark:bg-gray-800 h-2.5 rounded-full overflow-hidden mb-2">
            <div 
              className="bg-[#e10b17] h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, portfolioExecution)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#e10b17]">{portfolioExecution.toFixed(1)}% meta</span>
            <span className="text-gray-400">
              Faltan {Math.max(0, budget.targetLeasedProperties - leasedCount)} captaciones
            </span>
          </div>
        </div>

      </div>

      {/* Control Detallado de Gastos por Centro de Costo */}
      <div className="bg-white dark:bg-[#15171c] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs">
        <h3 className="font-bold text-base text-gray-900 dark:text-white font-heading mb-4">
          Control de Gastos por Departamento
        </h3>

        <div className="space-y-4">
          {Object.entries(MOAI_EXPENSE_CATEGORIES)
            .filter(([catId]) => catId !== 'dispersion_propietarios' && catId !== 'administracion_ph')
            .map(([catId, catInfo]) => {
              const spent = expenseRealized[catId] || 0;
              const limit = budget.categoryLimits[catId as MoaiExpenseCategory] || 1000000;
              const pct = limit > 0 ? (spent / limit) * 100 : 0;
              const isOver = spent > limit;

              return (
                <div key={catId} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                      <span>{catInfo.emoji}</span>
                      <span>{catInfo.name}</span>
                    </span>
                    <span className="font-mono">
                      <span className="font-bold text-gray-900 dark:text-white">{formatCOP(spent)}</span>
                      <span className="text-gray-400"> / {formatCOP(limit)}</span>
                    </span>
                  </div>

                  <div className="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all ${
                        isOver ? 'bg-rose-500' : pct > 80 ? 'bg-amber-500' : 'bg-gray-600 dark:bg-gray-400'
                      }`}
                      style={{ width: `${Math.min(100, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Modal Editar Metas */}
      {isEditingModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#15171c] w-full max-w-md rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-800">
              <h3 className="font-bold text-base text-gray-900 dark:text-white font-heading">
                Ajustar Metas y Techos Presupuestales
              </h3>
              <button onClick={() => setIsEditingModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <form onSubmit={handleSaveBudget} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="text-gray-600 dark:text-gray-400 block mb-1 font-semibold">
                  Meta Mensual de Ingresos MOAI (COP):
                </label>
                <input
                  type="number"
                  value={formIncomeTarget}
                  onChange={(e) => setFormIncomeTarget(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-[#1c1f26] border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm font-mono text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-gray-600 dark:text-gray-400 block mb-1 font-semibold">
                  Techo Mensual de Gastos Operativos (COP):
                </label>
                <input
                  type="number"
                  value={formExpenseLimit}
                  onChange={(e) => setFormExpenseLimit(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-[#1c1f26] border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm font-mono text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-gray-600 dark:text-gray-400 block mb-1 font-semibold">
                  Meta de Inmuebles en Administración:
                </label>
                <input
                  type="number"
                  value={formPropertiesTarget}
                  onChange={(e) => setFormPropertiesTarget(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-[#1c1f26] border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm font-mono text-gray-900 dark:text-white"
                />
              </div>

              <div className="pt-3 border-t border-gray-200 dark:border-gray-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditingModalOpen(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-[#e10b17] hover:bg-[#c00510] text-white px-5 py-2 rounded-xl font-bold shadow-xs"
                >
                  Guardar Presupuesto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
