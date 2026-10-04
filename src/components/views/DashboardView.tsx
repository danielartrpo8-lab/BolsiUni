/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Vista de Dashboard / Inicio
 * Tarjetas de métricas, gráfico de dona por categoría, evolución de gastos,
 * alerta visual de presupuesto > 80%, y accesos rápidos.
 */

import React, { useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  AlertTriangle, 
  Plus, 
  Sparkles, 
  ArrowRight, 
  Calendar,
  PieChart as PieIcon,
  BarChart3,
  Target
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid 
} from 'recharts';
import { ActiveTab, BudgetConfig, SavingsGoal, Transaction } from '../../types';
import { formatCOP, formatDate } from '../../utils/formatters';
import { getCategoryInfo } from '../../utils/categories';

interface DashboardViewProps {
  transactions: Transaction[];
  budget: BudgetConfig;
  goals: SavingsGoal[];
  onOpenAddModal: () => void;
  onEditTransaction: (t: Transaction) => void;
  onNavigateTab: (tab: ActiveTab) => void;
  hasApiKey: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  transactions,
  budget,
  goals,
  onOpenAddModal,
  onEditTransaction,
  onNavigateTab,
  hasApiKey
}) => {
  // Cálculos principales
  const { totalIncome, totalExpense, balance, budgetSpentPct, isOver80, isOver100 } = useMemo(() => {
    const inc = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const exp = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const bal = inc - exp;
    const spentPct = budget.monthlyExpenseLimit > 0 
      ? Math.round((exp / budget.monthlyExpenseLimit) * 100) 
      : 0;

    return {
      totalIncome: inc,
      totalExpense: exp,
      balance: bal,
      budgetSpentPct: spentPct,
      isOver80: spentPct >= 80,
      isOver100: spentPct >= 100
    };
  }, [transactions, budget]);

  // Datos para el gráfico de dona (Gastos por Categoría)
  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    transactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        map[t.category] = (map[t.category] || 0) + t.amount;
      });

    return Object.entries(map)
      .map(([catId, amount]) => {
        const info = getCategoryInfo(catId as any);
        return {
          id: catId,
          name: info.name,
          emoji: info.emoji,
          value: amount,
          color: info.color
        };
      })
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  // Datos para la evolución de gastos (agrupados por fecha de los últimos 7 días con movimientos)
  const evolutionData = useMemo(() => {
    const expenseTx = transactions.filter((t) => t.type === 'expense');
    const dayMap: Record<string, number> = {};

    expenseTx.forEach((t) => {
      dayMap[t.date] = (dayMap[t.date] || 0) + t.amount;
    });

    const sortedDates = Object.keys(dayMap).sort();
    // Tomar los últimos 7 registros con actividad
    return sortedDates.slice(-7).map((d) => {
      const parts = d.split('-');
      const label = parts.length === 3 ? `${parts[2]}/${parts[1]}` : d;
      return {
        date: label,
        fullDate: d,
        gasto: dayMap[d]
      };
    });
  }, [transactions]);

  // Movimientos recientes
  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime() || b.createdAt - a.createdAt)
      .slice(0, 5);
  }, [transactions]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* ALERTA VISUAL DE PRESUPUESTO > 80% */}
      {isOver80 && (
        <div className={`p-4 sm:p-5 rounded-2xl border flex items-start gap-3.5 shadow-sm ${
          isOver100 
            ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200' 
            : 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200'
        }`}>
          <div className={`p-2 rounded-xl shrink-0 ${isOver100 ? 'bg-rose-500 text-white' : 'bg-amber-500 text-white'}`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h4 className="font-extrabold text-sm sm:text-base">
              {isOver100 
                ? `🚨 ¡Superaste tu presupuesto! (${budgetSpentPct}% gastado)` 
                : `⚠️ ¡Ojo al bolsillo! Has gastado el ${budgetSpentPct}% de tu presupuesto`}
            </h4>
            <p className="text-xs sm:text-sm mt-0.5 opacity-90">
              {isOver100
                ? `Llevas ${formatCOP(totalExpense)} gastados de tu límite de ${formatCOP(budget.monthlyExpenseLimit)}. Es momento de congelar salidas y gastos no esenciales.`
                : `Te quedan ${formatCOP(Math.max(0, budget.monthlyExpenseLimit - totalExpense))} para lo que resta del mes. Modera las polas y comidas fuera de casa para no colapsar.`}
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('budget')}
            className={`text-xs px-3 py-1.5 rounded-xl font-bold shrink-0 self-center transition-all ${
              isOver100
                ? 'bg-rose-600 hover:bg-rose-700 text-white'
                : 'bg-amber-600 hover:bg-amber-700 text-white'
            }`}
          >
            Ajustar
          </button>
        </div>
      )}

      {/* TARJETAS PRINCIPALES DE MÉTRICAS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Saldo Actual */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Saldo en Bolsillo
            </span>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${balance >= 0 ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400' : 'bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400'}`}>
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className={`text-2xl sm:text-3xl font-extrabold font-mono tracking-tight ${balance >= 0 ? 'text-slate-900 dark:text-white' : 'text-rose-600 dark:text-rose-400'}`}>
              {formatCOP(balance)}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Disponible para terminar el mes
          </p>
          <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* Total Ingresos */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Ingresos del Mes
            </span>
            <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-600 dark:bg-teal-950 dark:text-teal-400 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400 tracking-tight">
              +{formatCOP(totalIncome)}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Mesada, auxilios y trabajos
          </p>
        </div>

        {/* Total Gastos */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Gastos del Mes
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400 flex items-center justify-center">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-rose-600 dark:text-rose-400 tracking-tight">
              -{formatCOP(totalExpense)}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span>{budgetSpentPct}% del presupuesto</span>
          </div>
        </div>

        {/* Presupuesto Total Restante */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Límite Mensual
            </span>
            <div className="w-9 h-9 rounded-xl bg-violet-100 text-violet-600 dark:bg-violet-950 dark:text-violet-400 flex items-center justify-center">
              <BarChart3 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 dark:text-white tracking-tight">
              {formatCOP(budget.monthlyExpenseLimit)}
            </span>
          </div>
          {/* Barra de progreso rápida */}
          <div className="mt-2 w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                budgetSpentPct > 90 ? 'bg-rose-500' : budgetSpentPct > 70 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, budgetSpentPct)}%` }}
            />
          </div>
        </div>

      </div>

      {/* ACCIONES RÁPIDAS Y BANNER IA */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-violet-700 rounded-3xl text-white shadow-lg shadow-emerald-700/15">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6 text-amber-300" />
          </div>
          <div>
            <h3 className="font-bold text-base sm:text-lg leading-tight">
              ¿En qué se te está yendo la plata?
            </h3>
            <p className="text-xs sm:text-sm text-emerald-100">
              Analiza tus gastos con Gemini y descubre qué recortar para llegar al fin de semestre
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onNavigateTab('ai')}
            className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-white text-emerald-800 font-bold text-xs sm:text-sm hover:bg-emerald-50 transition-colors shadow-sm"
          >
            Consultar Asistente IA
          </button>
          <button
            onClick={onOpenAddModal}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs sm:text-sm transition-colors shadow-sm flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Movimiento</span>
          </button>
        </div>
      </div>

      {/* SECCIÓN DE GRÁFICOS: DONA + BARRAS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Gráfico 1: Gastos por Categoría (Dona) */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <PieIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Gastos por Categoría
              </h3>
            </div>
            <span className="text-xs font-semibold text-slate-400">
              Total: {formatCOP(totalExpense)}
            </span>
          </div>

          {categoryData.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-12 text-slate-400 text-center">
              <span className="text-4xl mb-2">📊</span>
              <p className="text-sm font-medium">Aún no hay gastos registrados este mes</p>
              <button
                onClick={onOpenAddModal}
                className="mt-3 text-xs text-emerald-600 dark:text-emerald-400 font-bold underline"
              >
                Registrar primer gasto
              </button>
            </div>
          ) : (
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-12 items-center gap-4">
              {/* Gráfico Recharts */}
              <div className="sm:col-span-7 h-52 sm:h-60 relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={4}
                    >
                      {categoryData.map((entry) => (
                        <Cell key={`cell-${entry.id}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: any) => [formatCOP(Number(value)), 'Gasto']}
                      contentStyle={{
                        borderRadius: '16px',
                        backgroundColor: '#0f172a',
                        border: 'none',
                        color: '#fff',
                        fontSize: '12px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Texto central de la dona */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[11px] text-slate-400 uppercase font-semibold">Gastado</span>
                  <span className="text-sm font-extrabold font-mono text-slate-900 dark:text-white">
                    {formatCOP(totalExpense)}
                  </span>
                </div>
              </div>

              {/* Leyenda con badges */}
              <div className="sm:col-span-5 space-y-2 max-h-56 overflow-y-auto pr-1">
                {categoryData.map((item) => {
                  const pct = totalExpense > 0 ? Math.round((item.value / totalExpense) * 100) : 0;
                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between text-xs p-1.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="truncate text-slate-700 dark:text-slate-300">
                          {item.emoji} {item.name}
                        </span>
                      </div>
                      <span className="font-mono font-bold text-slate-900 dark:text-white ml-2 shrink-0">
                        {pct}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Gráfico 2: Evolución de Gastos (Barras por Día) */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-violet-600 dark:text-violet-400" />
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Evolución de Gastos
              </h3>
            </div>
            <span className="text-xs text-slate-400">Últimos días con actividad</span>
          </div>

          {evolutionData.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-12 text-slate-400 text-center">
              <span className="text-4xl mb-2">📈</span>
              <p className="text-sm font-medium">No hay suficiente historial para mostrar la tendencia</p>
            </div>
          ) : (
            <div className="h-56 sm:h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={evolutionData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 11, fill: '#94a3b8' }} 
                    axisLine={false} 
                    tickLine={false} 
                  />
                  <YAxis 
                    tick={{ fontSize: 10, fill: '#94a3b8' }} 
                    axisLine={false} 
                    tickLine={false}
                    tickFormatter={(val) => `$${Math.round(val / 1000)}k`}
                  />
                  <Tooltip
                    formatter={(value: any) => [formatCOP(Number(value)), 'Gasto del día']}
                    labelFormatter={(label) => `Fecha: ${label}`}
                    contentStyle={{
                      borderRadius: '16px',
                      backgroundColor: '#0f172a',
                      border: 'none',
                      color: '#fff',
                      fontSize: '12px'
                    }}
                  />
                  <Bar 
                    dataKey="gasto" 
                    fill="#8b5cf6" 
                    radius={[8, 8, 0, 0]} 
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

      </div>

      {/* SECCIÓN INFERIOR: MOVIMIENTOS RECIENTES + METAS DE AHORRO */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Lista de últimos movimientos */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Últimos Movimientos
            </h3>
            <button
              onClick={() => onNavigateTab('transactions')}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              <span>Ver todos ({transactions.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentTransactions.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No hay movimientos recientes.</p>
          ) : (
            <div className="space-y-2.5">
              {recentTransactions.map((t) => {
                const info = getCategoryInfo(t.category);
                const isInc = t.type === 'income';
                return (
                  <div
                    key={t.id}
                    onClick={() => onEditTransaction(t)}
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/40 dark:hover:bg-slate-800/80 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-700/80 shadow-xs flex items-center justify-center text-xl shrink-0 group-hover:scale-105 transition-transform">
                        {info.emoji}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                          {t.note || info.name}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {formatDate(t.date)} • {info.name}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <span className={`text-xs sm:text-sm font-bold font-mono ${isInc ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-200'}`}>
                        {isInc ? '+' : '-'}{formatCOP(t.amount)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Resumen de Metas de Ahorro */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Tus Metas Universitarias
                </h3>
              </div>
              <button
                onClick={() => onNavigateTab('goals')}
                className="text-xs font-bold text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1"
              >
                <span>Ver metas</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {goals.length === 0 ? (
              <div className="py-6 text-center text-slate-400">
                <p className="text-xs">No te has fijado metas de ahorro aún.</p>
                <button
                  onClick={() => onNavigateTab('goals')}
                  className="mt-2 text-xs text-violet-600 dark:text-violet-400 font-bold underline"
                >
                  Crear mi primera meta
                </button>
              </div>
            ) : (
              <div className="space-y-3.5">
                {goals.slice(0, 3).map((goal) => {
                  const pct = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
                  return (
                    <div key={goal.id} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 truncate">
                          <span>{goal.emoji}</span>
                          <span className="truncate">{goal.title}</span>
                        </span>
                        <span className="font-mono font-bold text-violet-600 dark:text-violet-400 shrink-0 ml-2">
                          {pct}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-violet-600 dark:bg-violet-500 transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
                        <span>{formatCOP(goal.currentAmount)}</span>
                        <span>Meta: {formatCOP(goal.targetAmount)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
            <span className="text-slate-500 dark:text-slate-400">
              Total ahorrado: <strong className="text-slate-800 dark:text-slate-200 font-mono">{formatCOP(goals.reduce((s, g) => s + g.currentAmount, 0))}</strong>
            </span>
            <button
              onClick={() => onNavigateTab('goals')}
              className="text-violet-600 dark:text-violet-400 font-bold hover:underline"
            >
              + Aportar o crear
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
