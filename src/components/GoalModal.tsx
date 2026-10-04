/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Modal para crear o editar una Meta de Ahorro
 */

import React, { useState, useEffect } from 'react';
import { X, Target, Trash2, Check, Sparkles } from 'lucide-react';
import { SavingsGoal } from '../types';
import { formatCOP } from '../utils/formatters';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (goal: Omit<SavingsGoal, 'id' | 'createdAt'>, existingId?: string) => void;
  onDelete?: (id: string) => void;
  initialGoal?: SavingsGoal | null;
}

const EMOJI_OPTIONS = ['💻', '🏖️', '🎒', '📚', '🍕', '🎮', '🛵', '🎧', '👟', '👕', '🎫', '🎓'];
const COLOR_OPTIONS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#3b82f6'];

export const GoalModal: React.FC<GoalModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialGoal
}) => {
  const [title, setTitle] = useState('');
  const [targetAmountStr, setTargetAmountStr] = useState('');
  const [currentAmountStr, setCurrentAmountStr] = useState('');
  const [deadline, setDeadline] = useState('');
  const [emoji, setEmoji] = useState('💻');
  const [color, setColor] = useState('#8b5cf6');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  // Siguiente fin de semestre por defecto (e.g. en 3 meses)
  const defaultDeadline = () => {
    const d = new Date();
    d.setMonth(d.getMonth() + 3);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-15`;
  };

  useEffect(() => {
    if (initialGoal) {
      setTitle(initialGoal.title);
      setTargetAmountStr(initialGoal.targetAmount.toString());
      setCurrentAmountStr(initialGoal.currentAmount.toString());
      setDeadline(initialGoal.deadline);
      setEmoji(initialGoal.emoji);
      setColor(initialGoal.color);
      setNotes(initialGoal.notes || '');
    } else {
      setTitle('');
      setTargetAmountStr('');
      setCurrentAmountStr('0');
      setDeadline(defaultDeadline());
      setEmoji('💻');
      setColor('#8b5cf6');
      setNotes('');
    }
    setError('');
  }, [initialGoal, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Por favor escribe el nombre de tu meta.');
      return;
    }

    const target = parseInt(targetAmountStr.replace(/[^0-9]/g, ''), 10);
    const current = parseInt(currentAmountStr.replace(/[^0-9]/g, '') || '0', 10);

    if (isNaN(target) || target <= 0) {
      setError('Por favor indica un monto objetivo válido mayor a cero.');
      return;
    }

    if (!deadline) {
      setError('Selecciona la fecha límite en la que deseas cumplir tu meta.');
      return;
    }

    onSave(
      {
        title: title.trim(),
        targetAmount: target,
        currentAmount: isNaN(current) ? 0 : current,
        deadline,
        emoji,
        color,
        notes: notes.trim()
      },
      initialGoal?.id
    );

    onClose();
  };

  const handleQuickPreset = (name: string, icon: string, amount: number) => {
    setTitle(name);
    setEmoji(icon);
    setTargetAmountStr(amount.toString());
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-violet-100 dark:bg-violet-950/80 flex items-center justify-center text-violet-600 dark:text-violet-400">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {initialGoal ? 'Editar Meta de Ahorro' : 'Nueva Meta de Ahorro'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ponte una meta clara y BolsiUni te dirá cuánto ahorrar por semana
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

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          
          {/* Metas universitarias frecuentes */}
          {!initialGoal && (
            <div>
              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1.5">
                Ideas populares de estudiantes:
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => handleQuickPreset('Portátil nuevo para la carrera', '💻', 2500000)}
                  className="text-xs px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-violet-100 dark:bg-slate-800 dark:hover:bg-violet-950/60 text-slate-700 dark:text-slate-300 transition-colors"
                >
                  💻 Portátil ($2.5M)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPreset('Viaje de fin de semestre', '🏖️', 600000)}
                  className="text-xs px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-violet-100 dark:bg-slate-800 dark:hover:bg-violet-950/60 text-slate-700 dark:text-slate-300 transition-colors"
                >
                  🏖️ Viaje ($600K)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPreset('Fondo de emergencia fotocopias', '🎒', 150000)}
                  className="text-xs px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-violet-100 dark:bg-slate-800 dark:hover:bg-violet-950/60 text-slate-700 dark:text-slate-300 transition-colors"
                >
                  🎒 Fondo de U ($150K)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPreset('Pizza de fin de parciales', '🍕', 60000)}
                  className="text-xs px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-violet-100 dark:bg-slate-800 dark:hover:bg-violet-950/60 text-slate-700 dark:text-slate-300 transition-colors"
                >
                  🍕 Pizza celebración ($60K)
                </button>
              </div>
            </div>
          )}

          {/* Título de la meta y emoji */}
          <div className="flex gap-2 items-start">
            <div className="w-14">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Icono
              </label>
              <div className="relative">
                <select
                  value={emoji}
                  onChange={(e) => setEmoji(e.target.value)}
                  className="w-full text-2xl p-2 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center cursor-pointer appearance-none"
                >
                  {EMOJI_OPTIONS.map((e) => (
                    <option key={e} value={e}>
                      {e}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Nombre de la meta *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Portátil nuevo, Concierto, Viaje"
                maxLength={60}
                required
                className="w-full px-3.5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
          </div>

          {/* Monto Objetivo y Ahorro Actual */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Monto Objetivo (COP) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400">
                  $
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={targetAmountStr ? parseInt(targetAmountStr.replace(/[^0-9]/g, ''), 10).toLocaleString('es-CO') : ''}
                  onChange={(e) => setTargetAmountStr(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="600.000"
                  required
                  className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white font-mono font-bold text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                ¿Cuánto tienes ya ahorrado?
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400">
                  $
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={currentAmountStr ? parseInt(currentAmountStr.replace(/[^0-9]/g, ''), 10).toLocaleString('es-CO') : ''}
                  onChange={(e) => setCurrentAmountStr(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="0"
                  className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white font-mono font-bold text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
            </div>
          </div>

          {/* Fecha Límite */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Fecha Límite para Cumplirla *
            </label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          {/* Color del tema */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Color de la tarjeta
            </label>
            <div className="flex gap-2">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-transform ${color === c ? 'scale-125 ring-2 ring-offset-2 ring-slate-400' : 'hover:scale-110'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Notas */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Notas o Motivación (Opcional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: Alojamiento con el parche y pasajes terrestres"
              rows={2}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 placeholder:text-slate-400"
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex items-center justify-between pt-2">
            {initialGoal && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm('¿Eliminar esta meta de ahorro?')) {
                    onDelete(initialGoal.id);
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
                className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-600/25 transition-all"
              >
                <Check className="w-4 h-4" />
                <span>{initialGoal ? 'Guardar Cambios' : 'Crear Meta'}</span>
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};
