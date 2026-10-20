/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * MOAI Inmobiliaria - Tarjeta Ejecutiva de "Próximos Pagos y Dispersiones"
 * Muestra los 3 compromisos más cercanos, total de los próximos 15 días,
 * y verifica la suficiencia de caja para cubrirlos.
 */

import React from 'react';
import { CalendarDays, AlertTriangle, CheckCircle2, Clock, ArrowRight, Building2 } from 'lucide-react';
import { ScheduledPayment } from '../types';
import { formatCOP } from '../utils/formatters';
import { getDaysRemaining } from '../utils/calendarUtils';

interface UpcomingPaymentsCardProps {
  payments: ScheduledPayment[];
  currentBalance: number;
  onNavigateToCalendar: () => void;
  onExecutePayment: (payment: ScheduledPayment) => void;
}

export const UpcomingPaymentsCard: React.FC<UpcomingPaymentsCardProps> = ({
  payments,
  currentBalance,
  onNavigateToCalendar,
  onExecutePayment
}) => {
  const pendingPayments = payments
    .filter(p => p.status === 'pendiente')
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  const next3 = pendingPayments.slice(0, 3);

  // Pagos en los próximos 15 días
  const next15Days = pendingPayments.filter(p => {
    const diff = getDaysRemaining(p.dueDate);
    return diff >= 0 && diff <= 15;
  });

  const totalNext15Days = next15Days.reduce((acc, p) => acc + p.amount, 0);
  const shortfall = Math.max(0, totalNext15Days - currentBalance);
  const isDeficit = shortfall > 0;

  return (
    <div className="bg-white dark:bg-[#15171c] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs mb-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-950/40 text-[#e10b17] flex items-center justify-center">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-gray-900 dark:text-white font-heading">
              Próximos Pagos y Dispersiones
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Control de tesorería y calendario inmobiliario a 15 días
            </p>
          </div>
        </div>

        <button
          onClick={onNavigateToCalendar}
          className="text-xs font-semibold text-[#e10b17] hover:underline flex items-center gap-1 self-start sm:self-auto"
        >
          Ver Calendario Completo <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Resumen de 15 días y Alerta de Liquidez */}
      <div className={`p-4 rounded-xl border mb-5 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
        isDeficit
          ? 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40'
          : 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40'
      }`}>
        <div className="flex items-start gap-3">
          {isDeficit ? (
            <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          )}
          <div>
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Total compromisos próximos 15 días ({next15Days.length} pagos)
            </p>
            <p className="text-lg font-bold font-mono text-gray-900 dark:text-white">
              {formatCOP(totalNext15Days)}
            </p>
          </div>
        </div>

        {isDeficit ? (
          <div className="text-right">
            <span className="inline-block text-xs font-bold text-rose-700 dark:text-rose-400 bg-rose-100 dark:bg-rose-900/40 px-2.5 py-1 rounded-lg">
              Faltan {formatCOP(shortfall)} para cubrir los pagos
            </span>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
              Verifica los recaudos de cánones pendientes por ingresar.
            </p>
          </div>
        ) : (
          <div className="text-right">
            <span className="inline-block text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/40 px-2.5 py-1 rounded-lg">
              Caja suficiente para cubrir los compromisos
            </span>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
              Excedente operativo: {formatCOP(currentBalance - totalNext15Days)}
            </p>
          </div>
        )}
      </div>

      {/* Lista de los 3 pagos más cercanos */}
      <div className="space-y-2.5">
        {next3.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4 italic">
            No hay pagos ni dispersiones pendientes registradas.
          </p>
        ) : (
          next3.map((payment) => {
            const days = getDaysRemaining(payment.dueDate);
            const isDueSoon = days <= 3 && days >= 0;
            const isOverdue = days < 0;

            return (
              <div
                key={payment.id}
                className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50 dark:bg-[#1a1d23] border border-gray-200/80 dark:border-gray-800 transition-colors hover:border-gray-300"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                    isOverdue
                      ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-600'
                      : isDueSoon
                      ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-600'
                      : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}>
                    {days === 0 ? 'Hoy' : isOverdue ? `-${Math.abs(days)}d` : `${days}d`}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {payment.title}
                      </span>
                      {payment.propertyCode && (
                        <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded-md bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                          {payment.propertyCode}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Vence: {payment.dueDate} • Beneficiario: {payment.beneficiary}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold font-mono text-gray-900 dark:text-white">
                    {formatCOP(payment.amount)}
                  </span>
                  <button
                    onClick={() => onExecutePayment(payment)}
                    className="text-xs font-semibold bg-gray-200 hover:bg-[#e10b17] hover:text-white dark:bg-gray-800 dark:hover:bg-[#e10b17] text-gray-700 dark:text-gray-200 px-2.5 py-1.5 rounded-lg transition-colors"
                    title="Asentar pago como ejecutado en libros"
                  >
                    Ya lo pagué
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
