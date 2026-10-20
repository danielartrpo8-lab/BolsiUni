/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * MOAI Inmobiliaria - Panel Ejecutivo de Control y Caja
 * Separación estricta entre Caja Operativa de la Inmobiliaria y Fondos en Custodia de Propietarios.
 * KPIs de comisiones, gastos de pauta, utilidad neta, ocupación y proyecciones.
 */

import React, { useMemo } from 'react';
import { 
  Building2, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  ShieldCheck, 
  Plus, 
  ArrowUpRight, 
  ArrowDownRight, 
  CalendarDays,
  FileSpreadsheet,
  Download,
  Key,
  Home,
  CheckCircle2,
  Clock,
  Briefcase
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  CartesianGrid 
} from 'recharts';
import { 
  ActiveTab, 
  BudgetConfig, 
  Partner, 
  Property, 
  ScheduledPayment, 
  Transaction 
} from '../../types';
import { formatCOP, formatDate } from '../../utils/formatters';
import { getCategoryInfo } from '../../utils/categories';
import { UpcomingPaymentsCard } from '../UpcomingPaymentsCard';
import { QuickChatBar } from '../QuickChatBar';

interface DashboardViewProps {
  transactions: Transaction[];
  properties: Property[];
  budget: BudgetConfig;
  scheduledPayments: ScheduledPayment[];
  activePartner: Partner;
  onNavigateTab: (tab: ActiveTab) => void;
  onOpenNewTransaction: () => void;
  onOpenNewPayment: () => void;
  onExecutePayment: (payment: ScheduledPayment) => void;
  onSubmitQuickMessage: (text: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  transactions,
  properties,
  budget,
  scheduledPayments,
  activePartner,
  onNavigateTab,
  onOpenNewTransaction,
  onOpenNewPayment,
  onExecutePayment,
  onSubmitQuickMessage
}) => {
  // Cálculos financieros con separación contable estricta
  const metrics = useMemo(() => {
    // 1. Caja Operativa MOAI (Solo movimientos con fundType === 'moai_operativa')
    const moaiIncomes = transactions
      .filter(t => t.type === 'income' && t.fundType === 'moai_operativa')
      .reduce((sum, t) => sum + t.amount, 0);

    const moaiExpenses = transactions
      .filter(t => t.type === 'expense' && t.fundType === 'moai_operativa')
      .reduce((sum, t) => sum + t.amount, 0);

    const moaiNetProfit = moaiIncomes - moaiExpenses;
    const moaiMargin = moaiIncomes > 0 ? (moaiNetProfit / moaiIncomes) * 100 : 0;

    // 2. Fondo de Custodia de Propietarios (Cánones recaudados de inquilinos vs dispersados)
    const totalCollectedRents = transactions
      .filter(t => t.type === 'income' && t.fundType === 'custodia_propietarios')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalDisbursedRents = transactions
      .filter(t => t.type === 'expense' && t.fundType === 'custodia_propietarios')
      .reduce((sum, t) => sum + t.amount, 0);

    const pendingInCustody = totalCollectedRents - totalDisbursedRents;

    // 3. Métricas de Cartera de Inmuebles
    const totalProperties = properties.length;
    const leasedProperties = properties.filter(p => p.status === 'arrendado').length;
    const occupancyRate = totalProperties > 0 ? (leasedProperties / totalProperties) * 100 : 0;
    const totalMonthlyRentUnderManagement = properties.reduce((sum, p) => sum + p.monthlyRent, 0);

    return {
      moaiIncomes,
      moaiExpenses,
      moaiNetProfit,
      moaiMargin,
      totalCollectedRents,
      totalDisbursedRents,
      pendingInCustody,
      totalProperties,
      leasedProperties,
      occupancyRate,
      totalMonthlyRentUnderManagement
    };
  }, [transactions, properties]);

  // Datos para gráfico de Líneas de Ingreso MOAI
  const revenueChartData = useMemo(() => {
    const categoriesMap: Record<string, number> = {};

    transactions
      .filter(t => t.type === 'income' && t.fundType === 'moai_operativa')
      .forEach(t => {
        const info = getCategoryInfo(t.category);
        categoriesMap[info.shortName] = (categoriesMap[info.shortName] || 0) + t.amount;
      });

    const colors = ['#e10b17', '#059669', '#d97706', '#7c3aed', '#0891b2', '#2563eb'];
    return Object.entries(categoriesMap).map(([name, value], i) => ({
      name,
      value,
      color: colors[i % colors.length]
    }));
  }, [transactions]);

  // Datos para gráfico de Gastos Operativos
  const expenseChartData = useMemo(() => {
    const categoriesMap: Record<string, number> = {};

    transactions
      .filter(t => t.type === 'expense' && t.fundType === 'moai_operativa')
      .forEach(t => {
        const info = getCategoryInfo(t.category);
        categoriesMap[info.shortName] = (categoriesMap[info.shortName] || 0) + t.amount;
      });

    const colors = ['#ea580c', '#8b5cf6', '#0284c7', '#64748b', '#e11d48', '#0d9488'];
    return Object.entries(categoriesMap).map(([name, value], i) => ({
      name,
      value,
      color: colors[i % colors.length]
    }));
  }, [transactions]);

  // Últimos movimientos
  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 6);
  }, [transactions]);

  return (
    <div className="space-y-6 pb-12">
      
      {/* Saludo Ejecutivo & Datos de la Empresa */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#15171c] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-[#e10b17] uppercase tracking-wider">
              Portal de Socios MOAI
            </span>
            <span className="text-gray-300 dark:text-gray-700">•</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {activePartner.role}
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white font-heading tracking-tight">
            Hola, {activePartner.name}
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Estado financiero consolidado al día de hoy para Medellín y Antioquia.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onNavigateTab('properties')}
            className="flex items-center gap-2 bg-gray-100 dark:bg-[#1f2229] hover:bg-gray-200 dark:hover:bg-[#282c35] text-gray-800 dark:text-gray-200 text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700/80 transition-all active:scale-95"
          >
            <Building2 className="w-4 h-4 text-[#e10b17]" />
            <span>Ver {metrics.totalProperties} Inmuebles</span>
          </button>

          <button
            onClick={onOpenNewTransaction}
            className="flex items-center gap-2 bg-[#e10b17] hover:bg-[#c00510] text-white text-xs font-semibold px-3.5 py-2.5 rounded-xl shadow-xs transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Asentar Movimiento</span>
          </button>
        </div>
      </div>

      {/* Banner de Separación Contable: Fondo Propio vs Fondo de Terceros */}
      <div className="bg-gradient-to-r from-gray-900 via-[#181a20] to-gray-900 text-white p-5 rounded-2xl border border-gray-800 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/40 text-[#e10b17] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white font-heading">
                  Control Estricto de Tesorería Inmobiliaria
                </span>
                <span className="text-[10px] bg-red-500/20 text-red-300 border border-red-500/30 px-2 py-0.5 rounded-full font-semibold">
                  Medellín Legal & Contable
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1 max-w-2xl leading-relaxed">
                Los cánones recaudados pertenecen a los propietarios y se custodian temporalmente. La caja operativa real de MOAI proviene de comisiones retenidas, honorarios por ventas y servicios de reformas.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-black/40 p-3 rounded-xl border border-gray-800">
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">
                Cánones en Custodia
              </span>
              <span className="text-base font-bold font-mono text-blue-400">
                {formatCOP(metrics.pendingInCustody)}
              </span>
            </div>
            <div className="h-8 w-px bg-gray-800" />
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">
                Utilidad Neta MOAI
              </span>
              <span className="text-base font-bold font-mono text-emerald-400">
                {formatCOP(metrics.moaiNetProfit)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de Registro Rápido WhatsApp / Claude */}
      <QuickChatBar 
        onSubmitMessage={onSubmitQuickMessage}
        onOpenFullChat={() => onNavigateTab('chat')}
      />

      {/* Tarjeta de Próximos Pagos y Dispersiones */}
      <UpcomingPaymentsCard
        payments={scheduledPayments}
        currentBalance={metrics.moaiNetProfit}
        onNavigateToCalendar={() => onNavigateTab('calendar')}
        onExecutePayment={onExecutePayment}
      />

      {/* Cuadrícula de KPIs Ejecutivos MOAI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Ingresos Propios MOAI */}
        <div className="bg-white dark:bg-[#15171c] p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Ingresos MOAI (Mes)
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold font-mono text-gray-900 dark:text-white">
            {formatCOP(metrics.moaiIncomes)}
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-500">
            <span className="text-emerald-600 font-bold">Comisiones & Servicios</span>
            <span>• Meta {formatCOP(budget.monthlyIncomeTarget)}</span>
          </div>
        </div>

        {/* KPI 2: Gastos Operativos MOAI */}
        <div className="bg-white dark:bg-[#15171c] p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Gastos Operativos (Mes)
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold font-mono text-gray-900 dark:text-white">
            {formatCOP(metrics.moaiExpenses)}
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-500">
            <span className="text-rose-600 font-bold">Pauta, nómina, oficina</span>
            <span>• Techo {formatCOP(budget.monthlyExpenseLimit)}</span>
          </div>
        </div>

        {/* KPI 3: Utilidad Neta y Margen */}
        <div className="bg-white dark:bg-[#15171c] p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Utilidad Neta del Mes
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <p className={`text-2xl font-extrabold font-mono ${
            metrics.moaiNetProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
          }`}>
            {formatCOP(metrics.moaiNetProfit)}
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-500">
            <span className="font-bold text-gray-700 dark:text-gray-300">
              Margen: {metrics.moaiMargin.toFixed(1)}%
            </span>
            <span>• Disponible para socios</span>
          </div>
        </div>

        {/* KPI 4: Cartera Administrada */}
        <div className="bg-white dark:bg-[#15171c] p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Cartera Administrada
            </span>
            <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-950/60 text-[#e10b17] flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold font-mono text-gray-900 dark:text-white">
            {metrics.leasedProperties} / {metrics.totalProperties}
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-500">
            <span className="text-emerald-600 font-bold">{metrics.occupancyRate.toFixed(0)}% Ocupación</span>
            <span>• {formatCOP(metrics.totalMonthlyRentUnderManagement)}/mes</span>
          </div>
        </div>

      </div>

      {/* Gráficos Contables Ejecutivos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Gráfico 1: Fuentes de Ingreso MOAI */}
        <div className="bg-white dark:bg-[#15171c] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-base text-gray-900 dark:text-white font-heading">
                Líneas de Ingreso MOAI
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Comisiones arriendos, corretaje de ventas y reformas
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-600">
              {formatCOP(metrics.moaiIncomes)}
            </span>
          </div>

          <div className="h-64">
            {revenueChartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-gray-400 italic">
                No hay ingresos operativos registrados este mes.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={revenueChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {revenueChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any) => [formatCOP(Number(value)), 'Ingreso']}
                    contentStyle={{
                      backgroundColor: '#181a20',
                      borderRadius: '12px',
                      border: '1px solid #2a2d34',
                      color: '#fff',
                      fontSize: '12px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 text-xs">
            {revenueChartData.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="truncate text-gray-600 dark:text-gray-400">{item.name}</span>
                <span className="ml-auto font-mono font-bold text-gray-800 dark:text-gray-200">
                  {formatCOP(item.value)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Gráfico 2: Desglose de Gastos Operativos */}
        <div className="bg-white dark:bg-[#15171c] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-base text-gray-900 dark:text-white font-heading">
                Estructura de Gastos Operativos
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Pauta, comisiones a asesores, oficina Medellín y pólizas
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-rose-600">
              {formatCOP(metrics.moaiExpenses)}
            </span>
          </div>

          <div className="h-64">
            {expenseChartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-gray-400 italic">
                No hay egresos operativos registrados este mes.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {expenseChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any) => [formatCOP(Number(value)), 'Gasto']}
                    contentStyle={{
                      backgroundColor: '#181a20',
                      borderRadius: '12px',
                      border: '1px solid #2a2d34',
                      color: '#fff',
                      fontSize: '12px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 text-xs">
            {expenseChartData.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="truncate text-gray-600 dark:text-gray-400">{item.name}</span>
                <span className="ml-auto font-mono font-bold text-gray-800 dark:text-gray-200">
                  {formatCOP(item.value)}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Lista de Movimientos Recientes con Identificación de Fondo */}
      <div className="bg-white dark:bg-[#15171c] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-base text-gray-900 dark:text-white font-heading">
              Movimientos Contables Recientes
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Libro diario de ingresos, comisiones, dispersiones y facturas
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('transactions')}
            className="text-xs font-semibold text-[#e10b17] hover:underline"
          >
            Ver Libro Completo →
          </button>
        </div>

        <div className="divide-y divide-gray-100 dark:divide-gray-800/80">
          {recentTransactions.length === 0 ? (
            <div className="py-10 text-center text-xs text-gray-500 dark:text-gray-400">
              <p className="font-bold text-sm text-gray-700 dark:text-gray-300 mb-1">
                La contabilidad inicia en cero.
              </p>
              <p className="max-w-md mx-auto text-gray-400 dark:text-gray-500">
                Registra los cobros de cánones, comisiones o egresos de la inmobiliaria usando la barra rápida o el botón "+ Asentar Movimiento".
              </p>
            </div>
          ) : (
            recentTransactions.map((tx) => {
            const cat = getCategoryInfo(tx.category);
            const isMoaiOwnFund = tx.fundType === 'moai_operativa';

            return (
              <div key={tx.id} className="py-3.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0 bg-gray-100 dark:bg-[#1f2229]">
                    {cat.emoji}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {tx.description}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        isMoaiOwnFund
                          ? 'bg-red-50 text-[#e10b17] dark:bg-red-950/50 dark:text-red-400 border border-red-200 dark:border-red-900/40'
                          : 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400 border border-blue-200 dark:border-blue-900/40'
                      }`}>
                        {isMoaiOwnFund ? 'Caja MOAI' : 'Custodia Terceros'}
                      </span>
                      {tx.propertyCode && (
                        <span className="text-[10px] font-mono bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-1.5 py-0.2 rounded">
                          {tx.propertyCode}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                      {tx.date} • {cat.name} {tx.recipientOrPayer ? `• ${tx.recipientOrPayer}` : ''}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className={`text-sm font-bold font-mono ${
                    tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-white'
                  }`}>
                    {tx.type === 'income' ? '+' : '-'} {formatCOP(tx.amount)}
                  </p>
                  {tx.referenceNumber && (
                    <span className="text-[10px] text-gray-400 font-mono">
                      Ref: {tx.referenceNumber}
                    </span>
                  )}
                </div>
              </div>
            );
          }))}
        </div>
      </div>

    </div>
  );
};
