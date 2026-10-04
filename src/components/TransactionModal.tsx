/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Modal para registrar o editar un movimiento (Gasto o Ingreso)
 */

import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Check, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { CategoryId, MovementType, Transaction } from '../types';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../utils/categories';
import { formatCOP, getTodayDateString } from '../utils/formatters';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: Omit<Transaction, 'id' | 'createdAt'>, existingId?: string) => void;
  onDelete?: (id: string) => void;
  initialTransaction?: Transaction | null;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialTransaction
}) => {
  const [type, setType] = useState<MovementType>('expense');
  const [amountStr, setAmountStr] = useState<string>('');
  const [category, setCategory] = useState<CategoryId>('comida');
  const [date, setDate] = useState<string>(getTodayDateString());
  const [note, setNote] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (initialTransaction) {
      setType(initialTransaction.type);
      setAmountStr(initialTransaction.amount.toString());
      setCategory(initialTransaction.category);
      setDate(initialTransaction.date);
      setNote(initialTransaction.note || '');
    } else {
      setType('expense');
      setAmountStr('');
      setCategory('comida');
      setDate(getTodayDateString());
      setNote('');
    }
    setError('');
  }, [initialTransaction, isOpen]);

  // Cuando cambia el tipo, ajustar la categoría por defecto si no concuerda
  const handleTypeChange = (newType: MovementType) => {
    setType(newType);
    if (newType === 'expense' && !(category in EXPENSE_CATEGORIES)) {
      setCategory('comida');
    } else if (newType === 'income' && !(category in INCOME_CATEGORIES)) {
      setCategory('mesada');
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Permitir solo números
    const raw = e.target.value.replace(/[^0-9]/g, '');
    setAmountStr(raw);
    setError('');
  };

  const handleQuickAmount = (val: number, defaultNote?: string) => {
    setAmountStr(val.toString());
    if (defaultNote && !note) {
      setNote(defaultNote);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseInt(amountStr, 10);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Por favor ingresa un monto válido mayor a cero en pesos COP.');
      return;
    }

    if (!date) {
      setError('Selecciona la fecha del movimiento.');
      return;
    }

    onSave(
      {
        type,
        amount: parsedAmount,
        category,
        date,
        note: note.trim()
      },
      initialTransaction?.id
    );

    onClose();
  };

  if (!isOpen) return null;

  const currentCategories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
  const numAmount = parseInt(amountStr, 10) || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera del modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {initialTransaction ? 'Editar Movimiento' : 'Nuevo Movimiento'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Registra cada peso para que la plata rinda hasta final de mes
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          
          {/* Selector de Tipo: Gasto vs Ingreso */}
          <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl">
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all ${
                type === 'expense'
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ArrowDownLeft className="w-4 h-4" />
              <span>Gasto</span>
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all ${
                type === 'income'
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Ingreso</span>
            </button>
          </div>

          {/* Campo Monto en COP */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Monto en Pesos Colombianos (COP) *
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-400 dark:text-slate-500 font-mono">
                $
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={amountStr ? parseInt(amountStr, 10).toLocaleString('es-CO') : ''}
                onChange={handleAmountChange}
                placeholder="15.000"
                autoFocus
                className="w-full pl-10 pr-4 py-3.5 text-2xl font-bold font-mono bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600"
              />
            </div>
            {numAmount > 0 && (
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Registrando: <strong className="text-slate-700 dark:text-slate-200">{formatCOP(numAmount)} COP</strong>
              </p>
            )}

            {/* Atajos rápidos universitarios */}
            {type === 'expense' ? (
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                <span className="text-[11px] text-slate-400 flex items-center mr-1">Rápido:</span>
                <button
                  type="button"
                  onClick={() => handleQuickAmount(1500, 'Tinto en la cafetería')}
                  className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                >
                  $1.500 Tinto
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickAmount(3200, 'Pasaje de transporte')}
                  className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                >
                  $3.200 Bus/Metro
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickAmount(6000, 'Empanada con gaseosa')}
                  className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                >
                  $6.000 Empanada
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickAmount(14000, 'Almuerzo corrientazo U')}
                  className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                >
                  $14.000 Corrientazo
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickAmount(35000, 'Polas de viernes con amigos')}
                  className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                >
                  $35.000 Polas
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                <span className="text-[11px] text-slate-400 flex items-center mr-1">Rápido:</span>
                <button
                  type="button"
                  onClick={() => handleQuickAmount(50000, 'Venta o trabajito')}
                  className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                >
                  $50.000
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickAmount(200000, 'Pago monitoría/trabajo')}
                  className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                >
                  $200.000
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickAmount(650000, 'Mesada del mes')}
                  className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                >
                  $650.000 Mesada
                </button>
              </div>
            )}
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Categoría *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {Object.values(currentCategories).map((cat) => {
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all ${
                      isSelected
                        ? 'border-emerald-500 dark:border-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span className="text-2xl mb-1">{cat.emoji}</span>
                    <span className={`text-xs font-semibold leading-tight line-clamp-1 ${isSelected ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-700 dark:text-slate-300'}`}>
                      {cat.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Fecha y Nota */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Fecha *
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Nota u Ocasión (Opcional)
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ej: Almuerzo frente a la portería"
                maxLength={80}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-slate-400"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex items-center justify-between pt-2">
            {initialTransaction && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm('¿Seguro que deseas eliminar este movimiento?')) {
                    onDelete(initialTransaction.id);
                    onClose();
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Eliminar</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-600/25 transition-all"
              >
                <Check className="w-4 h-4" />
                <span>{initialTransaction ? 'Guardar Cambios' : 'Registrar'}</span>
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};
