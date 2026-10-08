/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Modal para definir o ajustar el Saldo en Bolsillo directamente
 */

import React, { useState, useEffect } from 'react';
import { X, Wallet, Check, RotateCcw, ArrowRight } from 'lucide-react';
import { formatCOP } from '../utils/formatters';

interface BalanceAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBalance: number;
  onSaveBalance: (newBalance: number, note: string, resetAll: boolean) => void;
}

export const BalanceAdjustmentModal: React.FC<BalanceAdjustmentModalProps> = ({
  isOpen,
  onClose,
  currentBalance,
  onSaveBalance
}) => {
  const [balanceStr, setBalanceStr] = useState<string>('');
  const [note, setNote] = useState<string>('Saldo inicial en bolsillo');
  const [resetAllMovements, setResetAllMovements] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setBalanceStr(Math.max(0, currentBalance).toString());
      setNote(currentBalance === 0 ? 'Saldo inicial en bolsillo' : 'Ajuste de saldo en bolsillo');
      setResetAllMovements(false);
      setError('');
    }
  }, [isOpen, currentBalance]);

  if (!isOpen) return null;

  const targetAmount = parseInt(balanceStr.replace(/[^0-9]/g, ''), 10) || 0;
  const diff = targetAmount - currentBalance;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isNaN(targetAmount) || targetAmount < 0) {
      setError('Por favor ingresa un monto válido mayor o igual a cero.');
      return;
    }

    onSaveBalance(targetAmount, note.trim() || 'Ajuste de saldo', resetAllMovements);
    onClose();
  };

  const handleQuickChip = (val: number) => {
    setBalanceStr(val.toString());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Ajustar Saldo en Bolsillo
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Define cuánto dinero tienes en efectivo o en cuenta
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Saldo actual info */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs">
            <span className="text-slate-500 dark:text-slate-400">Saldo registrado actual:</span>
            <span className="font-bold font-mono text-slate-800 dark:text-slate-200">
              {formatCOP(currentBalance)}
            </span>
          </div>

          {/* Campo de nuevo saldo */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Nuevo Saldo que tienes ahora (COP) *
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-400 font-mono">
                $
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={balanceStr ? parseInt(balanceStr.replace(/[^0-9]/g, ''), 10).toLocaleString('es-CO') : ''}
                onChange={(e) => {
                  setBalanceStr(e.target.value.replace(/[^0-9]/g, ''));
                  setError('');
                }}
                placeholder="0"
                autoFocus
                className="w-full pl-10 pr-4 py-3.5 text-2xl font-bold font-mono bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Atajos de montos comunes */}
          <div>
            <span className="text-[11px] text-slate-400 block mb-1.5 font-medium">
              Valores rápidos:
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => handleQuickChip(0)}
                className="text-xs px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 transition-colors"
              >
                $0 (Ceros)
              </button>
              <button
                type="button"
                onClick={() => handleQuickChip(50000)}
                className="text-xs px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 transition-colors"
              >
                $50.000
              </button>
              <button
                type="button"
                onClick={() => handleQuickChip(100000)}
                className="text-xs px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 transition-colors"
              >
                $100.000
              </button>
              <button
                type="button"
                onClick={() => handleQuickChip(300000)}
                className="text-xs px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 transition-colors"
              >
                $300.000
              </button>
              <button
                type="button"
                onClick={() => handleQuickChip(650000)}
                className="text-xs px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 transition-colors"
              >
                $650.000 Mesada
              </button>
            </div>
          </div>

          {/* Nota */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Concepto / Nota
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ej: Saldo inicial, Plata en efectivo"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Si hay transacciones y el nuevo saldo es 0, dar opción de vaciar todo */}
          {targetAmount === 0 && (
            <label className="flex items-start gap-2.5 p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 cursor-pointer text-xs">
              <input
                type="checkbox"
                checked={resetAllMovements}
                onChange={(e) => setResetAllMovements(e.target.checked)}
                className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-amber-900 dark:text-amber-200 font-medium">
                Borrar también todos los movimientos anteriores y comenzar completamente desde cero ($0)
              </span>
            </label>
          )}

          {/* Explicación de cómo se aplicará el ajuste si no se reinicia */}
          {!resetAllMovements && diff !== 0 && (
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Se creará un registro de {diff > 0 ? 'ingreso' : 'gasto'} por <strong className="text-slate-700 dark:text-slate-200">{formatCOP(Math.abs(diff))}</strong> para que tu saldo coincida exactamente con {formatCOP(targetAmount)}.
            </p>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-md shadow-emerald-600/25 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Guardar Saldo</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
