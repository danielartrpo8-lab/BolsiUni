/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * MOAI Inmobiliaria - Barra de Navegación por Módulos
 * Pestañas ejecutivas: Panel, Inmuebles, Movimientos, Calendario, Presupuesto, Socios, Asistente y Configuración.
 */

import React from 'react';
import { 
  LayoutDashboard, 
  Building2, 
  ArrowLeftRight, 
  CalendarDays, 
  PieChart, 
  Users, 
  MessageSquareText, 
  Settings,
  Sparkles
} from 'lucide-react';
import { ActiveTab } from '../types';

interface TabsNavProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  pendingDisbursementsCount?: number;
}

interface TabItem {
  id: ActiveTab;
  label: string;
  mobileLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  highlight?: boolean;
}

export const TabsNav: React.FC<TabsNavProps> = ({ 
  activeTab, 
  onTabChange, 
  pendingDisbursementsCount = 0 
}) => {
  const tabs: TabItem[] = [
    { id: 'dashboard', label: 'Panel Ejecutivo', mobileLabel: 'Inicio', icon: LayoutDashboard },
    { id: 'properties', label: 'Inmuebles & Contratos', mobileLabel: 'Inmuebles', icon: Building2 },
    { id: 'transactions', label: 'Movimientos', mobileLabel: 'Libro', icon: ArrowLeftRight },
    { 
      id: 'calendar', 
      label: 'Calendario & Pagos', 
      mobileLabel: 'Fechas', 
      icon: CalendarDays,
      badge: pendingDisbursementsCount > 0 ? pendingDisbursementsCount : undefined
    },
    { id: 'budget', label: 'Presupuesto', mobileLabel: 'Presupuesto', icon: PieChart },
    { id: 'partners', label: 'Junta de Socios', mobileLabel: 'Socios', icon: Users },
    { 
      id: 'chat', 
      label: 'Asistente IA / Voz', 
      mobileLabel: 'Asistente', 
      icon: MessageSquareText,
      highlight: true
    },
    { id: 'settings', label: 'Configuración', mobileLabel: 'Ajustes', icon: Settings },
  ];

  return (
    <>
      {/* Navegación Desktop / Tablet */}
      <div className="hidden md:block bg-white dark:bg-[#121418] border-b border-gray-200 dark:border-gray-800 transition-colors sticky top-18 z-20 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1.5 py-2 overflow-x-auto scrollbar-none" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`
                    flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 whitespace-nowrap relative
                    ${isActive
                      ? 'bg-[#e10b17] text-white shadow-xs font-bold'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#1a1d23]'
                    }
                    ${tab.highlight && !isActive ? 'border border-[#e10b17]/30 text-[#e10b17] dark:text-red-400' : ''}
                  `}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : tab.highlight ? 'text-[#e10b17]' : 'text-gray-500 dark:text-gray-400'}`} />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-white text-[#e10b17] font-bold">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Navegación Móvil (Bottom Navigation Bar) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#121418]/95 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 px-2 py-1.5 shadow-lg">
        <div className="grid grid-cols-5 gap-1">
          {tabs.slice(0, 5).map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex flex-col items-center justify-center py-1.5 rounded-lg text-[10px] font-medium transition-colors relative ${
                  isActive
                    ? 'text-[#e10b17] dark:text-red-400 font-bold'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'text-[#e10b17] scale-110' : ''}`} />
                <span className="truncate max-w-[60px]">{tab.mobileLabel}</span>
                {tab.badge && (
                  <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-[#e10b17]" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};
