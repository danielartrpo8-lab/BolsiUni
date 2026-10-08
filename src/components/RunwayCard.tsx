/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Tarjeta en el Inicio: "¿Hasta cuándo me alcanza?"
 * Proyecta la duración del saldo en días según el gasto diario de los últimos 14 días,
 * muestra un semáforo interactivo, alerta preventiva para parciales y una mini línea de tiempo del semestre.
 */

import React, { useMemo } from 'react';
import { 
  Hourglass, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  SlidersHorizontal, 
  TrendingDown, 
  Wallet, 
  Coins,
  BookOpen,
  Sparkles
} from 'lucide-react';
import { SemesterConfig, Transaction } from '../types';
import { calculateRunway, formatShortDateEs } from '../utils/runwayCalculator';
import { formatCOP } from '../utils/formatters';

interface RunwayCardProps {
  balance: number;
  transactions: Transaction[];
  semesterConfig: SemesterConfig;
  onNavigateToSettings: () => void;
  onOpenAddModal: (type?: 'income' | 'expense') => void;
}

export const RunwayCard: React.FC<RunwayCardProps> = ({
  balance,
  transactions,
  semesterConfig,
  onNavigateToSettings,
  onOpenAddModal
}) => {
  const runway = useMemo(() => {
    return calculateRunway(balance, transactions, semesterConfig);
  }, [balance, transactions, semesterConfig]);

  // Estilos y detalles del semáforo
  const trafficDetails = useMemo(() => {
    switch (runway.trafficLight) {
      case 'green':
        return {
          bg: 'bg-emerald-500/10 dark:bg-emerald-950/40',
          border: 'border-emerald-500/30 dark:border-emerald-500/20',
          text: 'text-emerald-900 dark:text-emerald-200',
          badgeBg: 'bg-emerald-600 dark:bg-emerald-500 text-white',
          badgeText: 'SEMÁFORO VERDE • VAS BIEN',
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
        };
      case 'yellow':
        return {
          bg: 'bg-amber-500/10 dark:bg-amber-950/40',
          border: 'border-amber-500/30 dark:border-amber-500/20',
          text: 'text-amber-900 dark:text-amber-200',
          badgeBg: 'bg-amber-600 dark:bg-amber-500 text-white',
          badgeText: 'SEMÁFORO AMARILLO • OJO AL RITMO',
          icon: <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
        };
      case 'red':
      default:
        return {
          bg: 'bg-rose-500/10 dark:bg-rose-950/40',
          border: 'border-rose-500/30 dark:border-rose-500/20',
          text: 'text-rose-900 dark:text-rose-200',
          badgeBg: 'bg-rose-600 dark:bg-rose-500 text-white',
          badgeText: 'SEMÁFORO ROJO • AJUSTE NECESARIO',
          icon: <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
        };
    }
  }, [runway.trafficLight]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 sm:p-6 space-y-5">
      {/* 1. CABECERA DE LA TARJETA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-800 dark:text-slate-200 shrink-0">
            <Hourglass className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white tracking-tight">
                ¿Hasta cuándo me alcanza?
              </h3>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                14 días analizados
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Proyección basada en tu gasto promedio diario y el calendario de tu semestre
            </p>
          </div>
        </div>

        <button
          onClick={onNavigateToSettings}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors self-start sm:self-auto cursor-pointer"
          title="Configurar fechas del semestre y mesada"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
          <span>Configurar Semestre</span>
        </button>
      </div>

      {/* 2. MENSAJE TIPO SEMÁFORO */}
      <div className={`p-4 sm:p-5 rounded-2xl border ${trafficDetails.bg} ${trafficDetails.border} space-y-2`}>
        <div className="flex items-center justify-between gap-2">
          <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${trafficDetails.badgeBg}`}>
            {trafficDetails.badgeText}
          </span>
          <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300">
            {runway.daysLeft >= 999 
              ? 'Saldo estable' 
              : runway.daysLeft === 0 
                ? 'Saldo agotado' 
                : `${runway.daysLeft} días de autonomía`}
          </span>
        </div>

        <div className="flex items-start gap-3 pt-1">
          {trafficDetails.icon}
          <div className="flex-1">
            <p className={`text-sm sm:text-base font-bold ${trafficDetails.text} leading-snug`}>
              {runway.message}
            </p>
            {runway.trafficLight === 'red' && runway.maxDailyToSurvive > 0 && (
              <p className="text-xs text-rose-700 dark:text-rose-300 mt-1 opacity-90">
                💡 Consejo: Si limitas tus salidas y gastos no esenciales a {formatCOP(runway.maxDailyToSurvive)} al día, lograrás aguantar hasta tu {semesterConfig.incomeFrequency === 'mensual' ? 'mesada mensual' : 'próximo ingreso'}.
              </p>
            )}
            {runway.trafficLight === 'yellow' && (
              <p className="text-xs text-amber-800 dark:text-amber-300 mt-1 opacity-90">
                💡 Consejo: Estás al límite. Procura no hacer gastos hormiga (cafés, paquetes o taxis) para no quedarte en ceros antes del {runway.nextIncomeFormatted}.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 3. ALERTA PREVENTIVA DE PARCIALES (1 SEMANA ANTES) */}
      {runway.parcialesAlert && runway.parcialesAlert.isWithinWeek && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 flex items-start gap-3 animate-in fade-in duration-300">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-700 dark:text-amber-300 shrink-0 mt-0.5">
            <BookOpen className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300">
                Alerta de Parciales
              </span>
              <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                {runway.parcialesAlert.daysUntil === 0 
                  ? '¡Empiezan hoy!' 
                  : runway.parcialesAlert.daysUntil === 1 
                    ? '¡Empiezan mañana!' 
                    : `Faltan ${runway.parcialesAlert.daysUntil} días`}
              </span>
            </div>
            <p className="text-xs sm:text-sm font-bold text-amber-950 dark:text-amber-100 mt-1">
              {runway.parcialesAlert.event.title} ({formatShortDateEs(runway.parcialesAlert.event.date)})
            </p>
            <p className="text-xs text-amber-800 dark:text-amber-300 mt-0.5">
              Una semana antes de parciales, te sugerimos guardar un colchón para fotocopias, transporte extra y comida para las trasnochadas de estudio.
            </p>
          </div>
        </div>
      )}

      {/* 4. MÉTRICAS CLAVE EN CUADRÍCULA */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Métrica 1: Gasto Promedio Diario */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mb-1">
            <span className="font-semibold">Gasto promedio</span>
            <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
          </div>
          <div className="text-lg sm:text-xl font-extrabold font-mono text-slate-900 dark:text-white">
            {formatCOP(runway.dailyAvgExpense)}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            por día (últimos 14d)
          </div>
        </div>

        {/* Métrica 2: Saldo a $0 */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mb-1">
            <span className="font-semibold">Saldo llega a $0</span>
            <Hourglass className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="text-lg sm:text-xl font-extrabold font-mono text-slate-900 dark:text-white">
            {runway.zeroDateFormatted}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            {runway.balance <= 0 ? '¡Actualmente en $0!' : `en ~${runway.daysLeft} días`}
          </div>
        </div>

        {/* Métrica 3: Próximo Ingreso */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mb-1">
            <span className="font-semibold">Próximo ingreso</span>
            <Coins className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div className="text-lg sm:text-xl font-extrabold font-mono text-emerald-700 dark:text-emerald-400">
            {runway.nextIncomeFormatted}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            en {runway.daysUntilNextIncome} {runway.daysUntilNextIncome === 1 ? 'día' : 'días'} ({semesterConfig.incomeFrequency})
          </div>
        </div>

        {/* Métrica 4: Saldo en Bolsillo */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mb-1">
            <span className="font-semibold">Saldo en bolsillo</span>
            <Wallet className="w-3.5 h-3.5 text-slate-500" />
          </div>
          <div className={`text-lg sm:text-xl font-extrabold font-mono ${runway.balance >= 0 ? 'text-slate-900 dark:text-white' : 'text-rose-600'}`}>
            {formatCOP(runway.balance)}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            disponible hoy
          </div>
        </div>
      </div>

      {/* 5. MINI LÍNEA DE TIEMPO DEL SEMESTRE CON INGRESOS Y FECHAS IMPORTANTES */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-500" />
            <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
              Mini Línea de Tiempo del Semestre
            </h4>
          </div>
          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            {formatShortDateEs(semesterConfig.startDate)} — {formatShortDateEs(semesterConfig.endDate)}
          </div>
        </div>

        {/* Barra de progreso con indicador de HOY */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-medium text-slate-500 dark:text-slate-400">
              Inicio del semestre
            </span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
              📍 HOY ({runway.semesterProgressPct}% del semestre)
            </span>
            <span className="font-medium text-slate-500 dark:text-slate-400">
              Fin del semestre
            </span>
          </div>

          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden relative">
            <div 
              className="h-full bg-emerald-600 dark:bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${runway.semesterProgressPct}%` }}
            />
          </div>
        </div>

        {/* Hitos del semestre (carrusel horizontal para celular y desktop) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 -mx-1 px-1 scrollbar-none">
          {/* Hito fijo: HOY */}
          <div className="shrink-0 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 min-w-[130px] flex flex-col justify-between">
            <div className="flex items-center justify-between gap-1 mb-1">
              <span className="text-base">📍</span>
              <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded-md bg-emerald-600 text-white">
                HOY
              </span>
            </div>
            <div className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
              Día Actual
            </div>
            <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-mono mt-0.5">
              Saldo: {formatCOP(runway.balance)}
            </div>
          </div>

          {/* Hitos ordenados del semestre */}
          {runway.upcomingMilestones.map((ms) => {
            const isNextIncome = ms.type === 'income';
            return (
              <div
                key={ms.id}
                className={`shrink-0 p-2.5 rounded-xl border min-w-[140px] max-w-[170px] flex flex-col justify-between transition-colors ${
                  isNextIncome 
                    ? 'bg-slate-900 dark:bg-slate-800 text-white border-slate-800 dark:border-slate-700' 
                    : ms.isPast
                      ? 'bg-slate-50 dark:bg-slate-800/30 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-800'
                      : 'bg-slate-50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-base">{ms.emoji}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${
                    isNextIncome 
                      ? 'bg-emerald-500 text-slate-950 font-extrabold' 
                      : ms.isPast 
                        ? 'bg-slate-200 dark:bg-slate-700 text-slate-500' 
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}>
                    {ms.formattedDate}
                  </span>
                </div>

                <div className={`text-xs font-bold truncate ${isNextIncome ? 'text-white' : 'text-slate-900 dark:text-white'}`} title={ms.title}>
                  {ms.title}
                </div>

                <div className={`text-[11px] mt-0.5 ${
                  isNextIncome 
                    ? 'text-emerald-300 font-medium' 
                    : ms.isPast 
                      ? 'text-slate-400' 
                      : 'text-slate-500 dark:text-slate-400'
                }`}>
                  {ms.daysDiff === 0 
                    ? 'Hoy' 
                    : ms.daysDiff > 0 
                      ? `En ${ms.daysDiff} días` 
                      : `Pasó hace ${Math.abs(ms.daysDiff)}d`}
                </div>
              </div>
            );
          })}
        </div>

        {/* Acceso rápido a registrar o planear */}
        <div className="flex items-center justify-between text-xs pt-1">
          <span className="text-slate-500 dark:text-slate-400">
            ¿Cambió tu fecha de mesada o parciales?
          </span>
          <button
            onClick={onNavigateToSettings}
            className="font-bold text-slate-800 dark:text-slate-200 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Ajustar en Configuración</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
