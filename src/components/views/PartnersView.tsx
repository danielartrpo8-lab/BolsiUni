/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * MOAI Inmobiliaria - Módulo de Junta de Socios y Reparto de Utilidades
 * Control de participaciones societarias (Andrés Ferro, Juan Pablo Villegas, Simón Ibarra),
 * cálculo de utilidad neta distribuible, reserva legal del 10% y simulador de dividendos.
 */

import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Wallet, 
  PieChart as PieIcon, 
  Coins, 
  ArrowUpRight, 
  CheckCircle2, 
  ShieldCheck, 
  FileText,
  DollarSign,
  Briefcase
} from 'lucide-react';
import { Partner, Transaction } from '../../types';
import { formatCOP } from '../../utils/formatters';

interface PartnersViewProps {
  partners: Partner[];
  transactions: Transaction[];
  onDistributeDividends: (distribution: { partnerId: string; partnerName: string; amount: number }[]) => void;
  onUpdatePartner: (partner: Partner) => void;
}

export const PartnersView: React.FC<PartnersViewProps> = ({
  partners,
  transactions,
  onDistributeDividends,
  onUpdatePartner
}) => {
  const [distributionInput, setDistributionInput] = useState<string>('15000000');
  const [distributionSuccess, setDistributionSuccess] = useState(false);

  // Utilidad neta real acumulada de la caja operativa de MOAI
  const financialSummary = useMemo(() => {
    const moaiIncomes = transactions
      .filter(t => t.type === 'income' && t.fundType === 'moai_operativa')
      .reduce((sum, t) => sum + t.amount, 0);

    const moaiExpenses = transactions
      .filter(t => t.type === 'expense' && t.fundType === 'moai_operativa')
      .reduce((sum, t) => sum + t.amount, 0);

    const accumulatedNetProfit = moaiIncomes - moaiExpenses;

    // Reserva legal 10% (estándar Código de Comercio colombiano para SAS)
    const legalReserve = Math.round(accumulatedNetProfit * 0.10);
    // Fondo de maniobra operativo (15% sugerido para imprevistos y portales)
    const operativeReserve = Math.round(accumulatedNetProfit * 0.15);
    // Utilidad máxima prudente para distribuir
    const distributableProfit = Math.max(0, accumulatedNetProfit - legalReserve - operativeReserve);

    return {
      moaiIncomes,
      moaiExpenses,
      accumulatedNetProfit,
      legalReserve,
      operativeReserve,
      distributableProfit
    };
  }, [transactions]);

  // Simulación de reparto por socio
  const parsedDistAmount = parseInt(distributionInput.replace(/\D/g, ''), 10) || 0;

  const simulatedShares = useMemo(() => {
    return partners.map(p => {
      const shareAmount = Math.round(parsedDistAmount * (p.sharePercentage / 100));
      return {
        ...p,
        simulatedAmount: shareAmount
      };
    });
  }, [partners, parsedDistAmount]);

  const handleExecuteDistribution = () => {
    if (parsedDistAmount <= 0) return;
    const distribution = simulatedShares.map(s => ({
      partnerId: s.id,
      partnerName: s.name,
      amount: s.simulatedAmount
    }));

    onDistributeDividends(distribution);
    setDistributionSuccess(true);
    setTimeout(() => setDistributionSuccess(false), 4000);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#15171c] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-[#e10b17] uppercase tracking-wider">
              Gobierno Corporativo MOAI
            </span>
            <span className="text-gray-300 dark:text-gray-700">•</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Junta de Socios Fundadores
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white font-heading tracking-tight">
            Socios & Reparto de Utilidades
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Distribución de capital, reservas legales y simulación de dividendos para los socios fundadores.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 px-3.5 py-2 rounded-xl text-xs font-bold text-[#e10b17]">
          <ShieldCheck className="w-4 h-4" />
          <span>3 Socios Fundadores Registrados</span>
        </div>
      </div>

      {/* Tarjetas de Resumen Financiero de Socios */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white dark:bg-[#15171c] p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider mb-2">
            Utilidad Neta Acumulada
          </span>
          <p className="text-2xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
            {formatCOP(financialSummary.accumulatedNetProfit)}
          </p>
          <span className="text-xs text-gray-500 mt-1 block">
            Caja operativa propia MOAI
          </span>
        </div>

        <div className="bg-white dark:bg-[#15171c] p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider mb-2">
            Reserva Legal (10% Colombia)
          </span>
          <p className="text-2xl font-extrabold font-mono text-gray-900 dark:text-white">
            {formatCOP(financialSummary.legalReserve)}
          </p>
          <span className="text-xs text-gray-500 mt-1 block">
            Fondo de protección estatutario
          </span>
        </div>

        <div className="bg-white dark:bg-[#15171c] p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider mb-2">
            Reserva Operativa (15%)
          </span>
          <p className="text-2xl font-extrabold font-mono text-blue-600 dark:text-blue-400">
            {formatCOP(financialSummary.operativeReserve)}
          </p>
          <span className="text-xs text-gray-500 mt-1 block">
            Colchón de caja y marketing
          </span>
        </div>

        <div className="bg-white dark:bg-[#15171c] p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-[#e10b17] block tracking-wider mb-2">
            Disponible para Dividendos
          </span>
          <p className="text-2xl font-extrabold font-mono text-[#e10b17]">
            {formatCOP(financialSummary.distributableProfit)}
          </p>
          <span className="text-xs text-gray-500 mt-1 block">
            Margen distribuible sugerido
          </span>
        </div>

      </div>

      {/* Fichas de los Socios */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {partners.map((partner) => (
          <div
            key={partner.id}
            className="bg-white dark:bg-[#15171c] rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-3.5 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-[#1f2229] border border-gray-200 dark:border-gray-700/80 overflow-hidden flex items-center justify-center font-bold text-lg text-[#e10b17]">
                  {partner.avatarUrl ? (
                    <img src={partner.avatarUrl} alt={partner.name} className="w-full h-full object-cover" />
                  ) : (
                    partner.name.charAt(0)
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-base text-gray-900 dark:text-white font-heading">
                    {partner.name}
                  </h3>
                  <p className="text-xs text-[#e10b17] font-semibold">
                    {partner.role}
                  </p>
                  <p className="text-[11px] text-gray-400 font-mono">
                    {partner.document}
                  </p>
                </div>
              </div>

              <div className="space-y-2.5 bg-gray-50 dark:bg-[#1a1d23] p-4 rounded-xl border border-gray-200/80 dark:border-gray-800 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Participación:</span>
                  <span className="font-bold font-mono text-sm text-[#e10b17]">
                    {partner.sharePercentage}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Capital Aportado:</span>
                  <span className="font-mono text-gray-800 dark:text-gray-200 font-semibold">
                    {formatCOP(partner.initialCapital)}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-gray-200 dark:border-gray-800">
                  <span className="text-gray-500">Dividendos Pagados:</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                    {formatCOP(partner.totalDividendsPaid)}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 text-[11px] text-gray-400 flex items-center justify-between">
              <span>{partner.email}</span>
              <span className="text-emerald-600 font-semibold">Activo</span>
            </div>
          </div>
        ))}
      </div>

      {/* Simulador de Dividendos y Retiro de Utilidades */}
      <div className="bg-white dark:bg-[#15171c] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="font-bold text-lg text-gray-900 dark:text-white font-heading">
              Simulador de Reparto de Dividendos
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Ingresa el monto neto a distribuir entre los socios fundadores según sus porcentajes societarios.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-500">Monto total a repartir:</span>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">$</span>
              <input
                type="number"
                value={distributionInput}
                onChange={(e) => setDistributionInput(e.target.value)}
                className="bg-gray-50 dark:bg-[#1c1f26] border border-gray-200 dark:border-gray-700 rounded-xl pl-7 pr-3 py-1.5 text-sm font-mono font-bold text-gray-900 dark:text-white w-40 focus:outline-none focus:border-[#e10b17]"
              />
            </div>
          </div>
        </div>

        {/* Tabla de Distribución Simulada */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {simulatedShares.map((share) => (
            <div
              key={share.id}
              className="p-4 rounded-xl bg-gray-50 dark:bg-[#1a1d23] border border-gray-200/80 dark:border-gray-800"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  {share.name}
                </span>
                <span className="text-xs font-mono font-bold text-[#e10b17]">
                  {share.sharePercentage}%
                </span>
              </div>
              <p className="text-xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
                {formatCOP(share.simulatedAmount)}
              </p>
              <p className="text-[11px] text-gray-400 mt-1">
                Giro sugerido a cuenta del socio
              </p>
            </div>
          ))}
        </div>

        {/* Botón de Ejecutar Reparto */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
          <p className="text-xs text-gray-500">
            Al asentar el reparto, se generarán automáticamente los comprobantes de egreso por dividendos en el libro contable.
          </p>

          <button
            onClick={handleExecuteDistribution}
            disabled={parsedDistAmount <= 0}
            className="flex items-center gap-2 bg-[#e10b17] hover:bg-[#c00510] text-white text-xs sm:text-sm font-bold px-6 py-2.5 rounded-xl shadow-xs transition-all active:scale-95 disabled:opacity-40"
          >
            <Coins className="w-4 h-4" />
            <span>Asentar Reparto de Utilidades ({formatCOP(parsedDistAmount)})</span>
          </button>
        </div>

        {distributionSuccess && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>¡Reparto de utilidades asentado con éxito en el libro diario de MOAI Inmobiliaria!</span>
          </div>
        )}

      </div>

    </div>
  );
};
