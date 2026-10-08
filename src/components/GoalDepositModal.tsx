/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Modal rápido para sumar ahorro ("Aportar plata") a una meta
 */

import React, { useState } from 'react';
import { X, PiggyBank, Plus, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { SavingsGoal } from '../types';
import { formatCOP } from '../utils/formatters';

interface GoalDepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal: SavingsGoal | null;
  onDeposit: (goalId: string, amount: number) => void;
}

export const GoalDepositModal: React.FC<GoalDepositModalProps> = ({
  isOpen,
  onClose,
  goal,
  onDeposit
}) => {
  const [amountStr, setAmountStr] = useState<string>('');
  const [error, setError] = useState<string>('');

  if (!isOpen || !goal) return null;

  const current = goal.currentAmount;
  const target = goal.targetAmount;
  const remaining = Math.max(0, target - current);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(amountStr.replace(/[^0-9]/g, ''), 10);
    if (isNaN(val) || val <= 0) {
      setError('Ingresa un monto válido para aportar.');
      return;
    }

    onDeposit(goal.id, val);

    // Si con este abono completa o supera la meta, lanzamos confeti festivo
    if (current + val >= target) {
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // Fallback sin confeti si falla
      }
    }

    setAmountStr('');
    setError('');
    onClose();
  };

  const handleQuickAdd = (amount: number) => {
    setAmountStr(amount.toString());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">{goal.emoji}</span>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-1">
                Aportar a: {goal.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Faltan {formatCOP(remaining)} para la meta
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Monto a meter al marranito (COP)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xl font-bold text-slate-400 font-mono">
                $
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={amountStr ? parseInt(amountStr.replace(/[^0-9]/g, ''), 10).toLocaleString('es-CO') : ''}
                onChange={(e) => {
                  setAmountStr(e.target.value.replace(/[^0-9]/g, ''));
                  setError('');
                }}
                placeholder="20.000"
                autoFocus
                className="w-full pl-9 pr-4 py-3 text-xl font-bold font-mono bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Atajos rápidos */}
          <div>
            <span className="text-[11px] text-slate-400 block mb-1.5 font-medium">
              Sugerencias de aporte:
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleQuickAdd(10000)}
                className="text-xs px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 font-semibold text-slate-700 dark:text-slate-300 transition-colors"
              >
                +$10.000
              </button>
              <button
                type="button"
                onClick={() => handleQuickAdd(25000)}
                className="text-xs px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 font-semibold text-slate-700 dark:text-slate-300 transition-colors"
              >
                +$25.000
              </button>
              <button
                type="button"
                onClick={() => handleQuickAdd(50000)}
                className="text-xs px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 font-semibold text-slate-700 dark:text-slate-300 transition-colors"
              >
                +$50.000
              </button>
              {remaining > 0 && (
                <button
                  type="button"
                  onClick={() => handleQuickAdd(remaining)}
                  className="text-xs px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold hover:bg-slate-800 dark:hover:bg-white transition-colors cursor-pointer"
                >
                  Completar ({formatCOP(remaining)})
                </button>
              )}
            </div>
          </div>

          {error && (
            <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-xs font-medium">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 shadow-sm transition-all cursor-pointer"
            >
              <PiggyBank className="w-4 h-4" />
              <span>Guardar Ahorro</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
