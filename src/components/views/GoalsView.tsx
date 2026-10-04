/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Vista de Metas de Ahorro
 * Metas estudiantiles con cálculo semanal y mensual de ahorro requerido,
 * barras de progreso y aportes rápidos ("meter al marranito").
 */

import React from 'react';
import { 
  Target, 
  Plus, 
  PiggyBank, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Edit3, 
  Trash2, 
  Sparkles,
  TrendingUp
} from 'lucide-react';
import { SavingsGoal } from '../../types';
import { calculateSavingsRate, formatCOP, formatDate } from '../../utils/formatters';

interface GoalsViewProps {
  goals: SavingsGoal[];
  onOpenCreateModal: () => void;
  onEditGoal: (goal: SavingsGoal) => void;
  onDeleteGoal: (id: string) => void;
  onOpenDepositModal: (goal: SavingsGoal) => void;
}

export const GoalsView: React.FC<GoalsViewProps> = ({
  goals,
  onOpenCreateModal,
  onEditGoal,
  onDeleteGoal,
  onOpenDepositModal
}) => {
  const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0);
  const totalCurrent = goals.reduce((s, g) => s + g.currentAmount, 0);
  const globalProgress = totalTarget > 0 ? Math.round((totalCurrent / totalTarget) * 100) : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* CABECERA Y CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Metas de Ahorro
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Ahorra poco a poco para el portátil, el viaje de vacaciones o la pizza de fin de parciales
          </p>
        </div>

        <button
          onClick={onOpenCreateModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-sm shadow-md shadow-violet-600/20 transition-all cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          <span>Nueva Meta</span>
        </button>
      </div>

      {/* TARJETA DE PROGRESO GLOBAL DE AHORRO */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-violet-500 to-emerald-500 flex items-center justify-center text-white shadow-md text-2xl">
            🐷
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Ahorro Total en Metas
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 dark:text-white mt-0.5">
              {formatCOP(totalCurrent)}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              De {formatCOP(totalTarget)} propuestos en tus {goals.length} metas
            </p>
          </div>
        </div>

        <div className="w-full md:w-64 space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-500">Progreso general</span>
            <span className="font-bold font-mono text-violet-600 dark:text-violet-400">{globalProgress}%</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-emerald-500 transition-all duration-500"
              style={{ width: `${Math.min(100, globalProgress)}%` }}
            />
          </div>
        </div>
      </div>

      {/* LISTADO DE METAS */}
      {goals.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-5xl">🎯</span>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mt-3">
            Aún no tienes metas de ahorro activas
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-sm mx-auto">
            Ahorrar de a $5.000 o $10.000 por semana hace que logres comprarte el portátil o irte de viaje sin endeudarte.
          </p>
          <button
            onClick={onOpenCreateModal}
            className="mt-4 px-5 py-2.5 rounded-xl text-xs font-bold bg-violet-600 text-white hover:bg-violet-500 shadow-md transition-all"
          >
            Crear mi primera meta
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {goals.map((goal) => {
            const progress = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
            const isCompleted = goal.currentAmount >= goal.targetAmount;
            const rates = calculateSavingsRate(goal.targetAmount, goal.currentAmount, goal.deadline);

            return (
              <div
                key={goal.id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between relative overflow-hidden group"
              >
                {/* Acento superior de color */}
                <div 
                  className="absolute top-0 left-0 right-0 h-1.5"
                  style={{ backgroundColor: goal.color || '#8b5cf6' }}
                />

                <div>
                  {/* Encabezado de la meta */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-2xl shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                        {goal.emoji}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white leading-tight line-clamp-1">
                          {goal.title}
                        </h4>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Límite: {formatDate(goal.deadline)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onEditGoal(goal)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Editar meta"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`¿Eliminar la meta "${goal.title}"?`)) {
                            onDeleteGoal(goal.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                        title="Eliminar meta"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Montos y Porcentaje */}
                  <div className="mt-4">
                    <div className="flex items-baseline justify-between mb-1.5">
                      <span className="text-xl sm:text-2xl font-extrabold font-mono text-slate-900 dark:text-white">
                        {formatCOP(goal.currentAmount)}
                      </span>
                      <span className="text-xs font-bold font-mono text-slate-500 dark:text-slate-400">
                        Meta: {formatCOP(goal.targetAmount)}
                      </span>
                    </div>

                    {/* Barra de progreso */}
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isCompleted ? 'bg-emerald-500' : 'bg-violet-600'
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>

                    <div className="flex justify-between items-center text-xs mt-1.5 text-slate-500 dark:text-slate-400">
                      <span>{progress}% completado</span>
                      <span>
                        {isCompleted ? (
                          <strong className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> ¡Meta cumplida!
                          </strong>
                        ) : (
                          `Faltan ${formatCOP(goal.targetAmount - goal.currentAmount)}`
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Notas o descripción */}
                  {goal.notes && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 italic mt-3 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/60 line-clamp-2">
                      "{goal.notes}"
                    </p>
                  )}

                  {/* CÁLCULO DE CUÁNTO DEBE AHORRAR POR SEMANA O POR MES */}
                  {!isCompleted && (
                    <div className="mt-4 p-3 rounded-2xl bg-violet-50/70 dark:bg-violet-950/40 border border-violet-100 dark:border-violet-900/40 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-violet-900 dark:text-violet-300">
                        <Clock className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
                        <span>Plan de Ahorro Sugerido:</span>
                      </div>
                      
                      {rates.isOverdue ? (
                        <p className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">
                          La fecha límite ya pasó. ¡Puedes actualizar la fecha o completar lo que falta!
                        </p>
                      ) : (
                        <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                          <div className="bg-white dark:bg-slate-900 p-2 rounded-xl border border-violet-100 dark:border-violet-950">
                            <span className="text-[10px] text-slate-400 block">Por semana:</span>
                            <strong className="font-mono text-violet-700 dark:text-violet-300 font-bold">
                              {formatCOP(rates.weeklyAmount)}
                            </strong>
                            <span className="text-[10px] text-slate-400 block mt-0.5">
                              ({rates.weeksRemaining} sem. restantes)
                            </span>
                          </div>

                          <div className="bg-white dark:bg-slate-900 p-2 rounded-xl border border-violet-100 dark:border-violet-950">
                            <span className="text-[10px] text-slate-400 block">Por mes:</span>
                            <strong className="font-mono text-emerald-700 dark:text-emerald-300 font-bold">
                              {formatCOP(rates.monthlyAmount)}
                            </strong>
                            <span className="text-[10px] text-slate-400 block mt-0.5">
                              (~{rates.monthsRemaining} meses)
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                </div>

                {/* BOTÓN APORTAR PLATA */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => onOpenDepositModal(goal)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs bg-slate-100 hover:bg-emerald-600 text-slate-700 hover:text-white dark:bg-slate-800 dark:hover:bg-emerald-600 dark:text-slate-200 transition-all cursor-pointer group/btn"
                  >
                    <PiggyBank className="w-4 h-4 text-emerald-600 dark:text-emerald-400 group-hover/btn:text-white transition-colors" />
                    <span>Aportar Plata al Marranito</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
