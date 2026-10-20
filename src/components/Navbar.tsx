/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * MOAI Inmobiliaria - Barra Superior de Navegación y Control
 * Identidad visual oficial: #e10b17, logo MOAI, saldos de caja propia vs custodia y accesos rápidos.
 */

import React from 'react';
import { Moon, Sun, Plus, FileSpreadsheet, Download, Building2, ShieldCheck, Users } from 'lucide-react';
import { formatCOP } from '../utils/formatters';
import { Partner } from '../types';

interface NavbarProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  moaiBalance: number;       // Saldo de la caja operativa de MOAI
  custodyBalance: number;    // Fondo en custodia de propietarios
  onExportPDF: () => void;
  onExportExcel: () => void;
  onOpenNewTransaction: () => void;
  onOpenNewPayment: () => void;
  partners: Partner[];
  activePartner: Partner;
  onChangePartner: (partner: Partner) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  darkMode,
  onToggleDarkMode,
  moaiBalance,
  custodyBalance,
  onExportPDF,
  onExportExcel,
  onOpenNewTransaction,
  onOpenNewPayment,
  partners,
  activePartner,
  onChangePartner
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-[#121418]/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        
        {/* Logo y Branding MOAI */}
        <div className="flex items-center gap-3.5 min-w-max">
          <div className="relative flex items-center justify-center">
            <img 
              src="https://storage.googleapis.com/public-access-moai/Home.png" 
              alt="MOAI Inmobiliaria" 
              className="w-10 h-10 object-contain drop-shadow-sm rounded-lg"
              onError={(e) => {
                // Fallback elegante en caso de offline
                (e.currentTarget as HTMLElement).style.display = 'none';
              }}
            />
            <div className="w-10 h-10 rounded-xl bg-[#e10b17] text-white flex items-center justify-center font-bold text-lg shadow-sm" style={{ display: 'none' }}>
              M
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight text-gray-900 dark:text-white font-heading">
                MOAI<span className="text-[#e10b17]">.</span>
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950/60 text-[#e10b17] font-semibold border border-red-200 dark:border-red-900/50">
                Inmobiliaria
              </span>
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium hidden sm:block">
              Medellín • Calle 32C # 80A-45 • Suite Contable
            </p>
          </div>
        </div>

        {/* Resumen de Caja en Cabecera (Separación Contable Clave) */}
        <div className="hidden lg:flex items-center gap-3">
          
          {/* Caja Operativa MOAI (Dinero real de la empresa) */}
          <div className="flex items-center gap-2.5 bg-gray-50 dark:bg-[#1a1d23] px-3.5 py-1.5 rounded-xl border border-gray-200 dark:border-gray-800">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <div>
              <p className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 tracking-wider">
                Caja Operativa MOAI
              </p>
              <p className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400">
                {formatCOP(moaiBalance)}
              </p>
            </div>
          </div>

          {/* Fondo de Cánones en Custodia (Fondos de Propietarios) */}
          <div className="flex items-center gap-2.5 bg-gray-50 dark:bg-[#1a1d23] px-3.5 py-1.5 rounded-xl border border-gray-200 dark:border-gray-800" title="Dinero recaudado de inquilinos pendiente o en proceso de dispersión a propietarios">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <div>
              <p className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 tracking-wider">
                Custodia Propietarios
              </p>
              <p className="text-sm font-bold font-mono text-blue-600 dark:text-blue-400">
                {formatCOP(custodyBalance)}
              </p>
            </div>
          </div>
        </div>

        {/* Acciones y Selector de Socio */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Selector de Socio Activo */}
          <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-[#1a1d23] px-2 sm:px-2.5 py-1 rounded-xl border border-gray-200 dark:border-gray-800">
            <Users className="w-3.5 h-3.5 text-[#e10b17]" />
            <select
              value={activePartner.id}
              onChange={(e) => {
                const selected = partners.find(p => p.id === e.target.value);
                if (selected) onChangePartner(selected);
              }}
              className="text-xs font-semibold bg-transparent text-gray-700 dark:text-gray-200 focus:outline-none cursor-pointer pr-1"
              title="Socio activo en la sesión"
            >
              {partners.map(p => (
                <option key={p.id} value={p.id} className="dark:bg-[#1a1d23]">
                  {p.name.split(' ')[0]} ({p.sharePercentage}%)
                </option>
              ))}
            </select>
          </div>

          {/* Botón Nuevo Movimiento */}
          <button
            onClick={onOpenNewTransaction}
            className="flex items-center gap-1.5 bg-[#e10b17] hover:bg-[#c00510] text-white px-3 sm:px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold shadow-sm transition-all duration-150 active:scale-95"
            title="Registrar nuevo movimiento contable"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nuevo Movimiento</span>
          </button>

          {/* Exportar Reporte */}
          <div className="hidden sm:flex items-center gap-1">
            <button
              onClick={onExportExcel}
              className="p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Exportar a Excel (CSV Contable)"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            </button>
            <button
              onClick={onExportPDF}
              className="p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Descargar Balance en PDF"
            >
              <Download className="w-4 h-4 text-blue-600" />
            </button>
          </div>

          {/* Toggle Modo Oscuro / Claro */}
          <button
            onClick={onToggleDarkMode}
            className="p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title={darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-gray-600" />}
          </button>
        </div>

      </div>
    </header>
  );
};
