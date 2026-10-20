/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * MOAI Inmobiliaria - Cartera de Inmuebles, Contratos y Liquidaciones
 * Gestión de propiedades administradas en Medellín, cálculo de liquidación de canon,
 * retención de comisiones MOAI (10% + IVA) y dispersión a propietarios.
 */

import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  Plus, 
  Search, 
  Filter, 
  Calculator, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  User, 
  Phone, 
  Shield, 
  ArrowRight,
  Printer,
  FileCheck,
  CreditCard,
  MapPin,
  ExternalLink
} from 'lucide-react';
import { Property, RentLiquidation } from '../../types';
import { formatCOP } from '../../utils/formatters';

interface PropertiesViewProps {
  properties: Property[];
  onAddProperty: () => void;
  onEditProperty: (property: Property) => void;
  onGenerateLiquidation: (liquidation: RentLiquidation) => void;
}

export const PropertiesView: React.FC<PropertiesViewProps> = ({
  properties,
  onAddProperty,
  onEditProperty,
  onGenerateLiquidation
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [selectedPropertyForLiquidation, setSelectedPropertyForLiquidation] = useState<Property | null>(null);

  // Estados para el cálculo de liquidación dentro del modal
  const [customRepairs, setCustomRepairs] = useState<number>(0);
  const [customAdminFee, setCustomAdminFee] = useState<number>(0);
  const [liquidationNotes, setLiquidationNotes] = useState<string>('');

  // Filtrado de propiedades
  const filteredProperties = useMemo(() => {
    return properties.filter((p) => {
      const matchSearch = 
        p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.neighborhood.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.tenantName && p.tenantName.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchStatus = statusFilter === 'todos' || p.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [properties, searchTerm, statusFilter]);

  // Cálculos de liquidación activa
  const liquidationCalculation = useMemo(() => {
    if (!selectedPropertyForLiquidation) return null;
    const prop = selectedPropertyForLiquidation;
    const grossRent = prop.monthlyRent;
    const rate = prop.commissionRate; // ej: 10
    const commissionAmount = Math.round(grossRent * (rate / 100));
    const ivaAmount = prop.ivaOnCommission ? Math.round(commissionAmount * 0.19) : 0;
    const totalMoaiFee = commissionAmount + ivaAmount;
    
    // Deducciones aplicadas al propietario
    const adminFeeDeduction = customAdminFee !== undefined ? customAdminFee : prop.adminFee;
    const repairsDeduction = customRepairs || 0;
    
    const netDisbursement = Math.max(0, grossRent - totalMoaiFee - adminFeeDeduction - repairsDeduction);

    return {
      grossRent,
      rate,
      commissionAmount,
      ivaAmount,
      totalMoaiFee,
      adminFeeDeduction,
      repairsDeduction,
      netDisbursement
    };
  }, [selectedPropertyForLiquidation, customRepairs, customAdminFee]);

  const handleOpenLiquidationModal = (property: Property) => {
    setSelectedPropertyForLiquidation(property);
    setCustomAdminFee(property.adminFee);
    setCustomRepairs(0);
    setLiquidationNotes(`Liquidación canon correspondiente al mes actual. Póliza ${property.insuranceCompany || 'Directa'}.`);
  };

  const handleConfirmLiquidation = () => {
    if (!selectedPropertyForLiquidation || !liquidationCalculation) return;
    const prop = selectedPropertyForLiquidation;
    const dateToday = new Date().toISOString().slice(0, 10);

    const liquidation: RentLiquidation = {
      id: `liq-${Date.now()}`,
      propertyId: prop.id,
      propertyCode: prop.code,
      propertyAddress: prop.address,
      ownerName: prop.ownerName,
      month: 'Mes en Curso',
      grossRent: liquidationCalculation.grossRent,
      commissionRate: liquidationCalculation.rate,
      commissionAmount: liquidationCalculation.commissionAmount,
      ivaAmount: liquidationCalculation.ivaAmount,
      totalMoaiFee: liquidationCalculation.totalMoaiFee,
      adminFeeDeduction: liquidationCalculation.adminFeeDeduction,
      repairsDeduction: liquidationCalculation.repairsDeduction,
      netDisbursement: liquidationCalculation.netDisbursement,
      dateGenerated: dateToday,
      status: 'recaudado_custodia',
      notes: liquidationNotes
    };

    onGenerateLiquidation(liquidation);
    setSelectedPropertyForLiquidation(null);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Encabezado y Acciones */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#15171c] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-[#e10b17] uppercase tracking-wider">
              Cartera Inmobiliaria MOAI
            </span>
            <span className="text-gray-300 dark:text-gray-700">•</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {properties.length} inmuebles en Medellín y Antioquia
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white font-heading tracking-tight">
            Gestión de Inmuebles & Liquidaciones
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Administración de cánones, pólizas de fianza y liquidación mensual a propietarios con comisiones e IVA.
          </p>
        </div>

        <button
          onClick={onAddProperty}
          className="flex items-center gap-2 bg-[#e10b17] hover:bg-[#c00510] text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-all active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Inmueble</span>
        </button>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white dark:bg-[#15171c] p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por código (ej: MOAI-APT-402), dirección, barrio o propietario..."
            className="w-full bg-gray-50 dark:bg-[#1c1f26] border border-gray-200 dark:border-gray-700/80 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-[#e10b17]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-4 h-4 text-gray-400 shrink-0 ml-1 hidden sm:block" />
          {['todos', 'arrendado', 'disponible', 'en_venta'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`text-xs px-3 py-1.5 rounded-xl capitalize font-semibold whitespace-nowrap transition-colors ${
                statusFilter === status
                  ? 'bg-[#e10b17] text-white'
                  : 'bg-gray-100 dark:bg-[#1f2229] text-gray-600 dark:text-gray-300 hover:bg-gray-200'
              }`}
            >
              {status === 'en_venta' ? 'En Venta' : status}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Propiedades */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredProperties.length === 0 ? (
          <div className="col-span-full bg-white dark:bg-[#15171c] p-12 text-center rounded-2xl border border-gray-200 dark:border-gray-800">
            <Building2 className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
              No se encontraron inmuebles con los criterios de búsqueda.
            </p>
          </div>
        ) : (
          filteredProperties.map((prop) => {
            const isLeased = prop.status === 'arrendado';

            return (
              <div
                key={prop.id}
                className="bg-white dark:bg-[#15171c] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs p-5 flex flex-col justify-between hover:border-gray-300 dark:hover:border-gray-700 transition-all"
              >
                <div>
                  
                  {/* Encabezado Inmueble */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <span className="text-[11px] font-mono font-bold text-[#e10b17] bg-red-50 dark:bg-red-950/60 px-2 py-0.5 rounded-md border border-red-200 dark:border-red-900/40">
                        {prop.code}
                      </span>
                      <h3 className="font-bold text-base text-gray-900 dark:text-white mt-1.5 line-clamp-1 font-heading">
                        {prop.title}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                        <span className="truncate">{prop.address}, {prop.neighborhood}</span>
                      </p>
                    </div>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase shrink-0 ${
                      isLeased
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400'
                        : prop.status === 'disponible'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-400'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400'
                    }`}>
                      {prop.status}
                    </span>
                  </div>

                  {/* Cifras Financieras del Inmueble */}
                  <div className="bg-gray-50 dark:bg-[#1a1d23] p-3 rounded-xl border border-gray-200/80 dark:border-gray-800 mb-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500 dark:text-gray-400">Canon Mensual:</span>
                      <span className="font-bold font-mono text-gray-900 dark:text-white text-sm">
                        {formatCOP(prop.monthlyRent)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs mt-1">
                      <span className="text-gray-500 dark:text-gray-400">Cuota Admin PH:</span>
                      <span className="font-mono text-gray-700 dark:text-gray-300">
                        {formatCOP(prop.adminFee)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs mt-1 pt-1 border-t border-gray-200 dark:border-gray-800">
                      <span className="text-[#e10b17] font-semibold">Comisión MOAI:</span>
                      <span className="font-mono font-bold text-[#e10b17]">
                        {prop.commissionRate}% + IVA
                      </span>
                    </div>
                  </div>

                  {/* Datos del Propietario e Inquilino */}
                  <div className="space-y-1.5 text-xs text-gray-600 dark:text-gray-300 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Propietario:</span>
                      <span className="font-medium text-right truncate max-w-[160px]">{prop.ownerName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Banco / Cuenta:</span>
                      <span className="font-mono text-[11px] text-right truncate max-w-[160px]">
                        {prop.ownerBank} ({prop.ownerAccountType})
                      </span>
                    </div>
                    {isLeased && (
                      <div className="flex items-center justify-between pt-1 border-t border-gray-100 dark:border-gray-800/80">
                        <span className="text-gray-400">Inquilino:</span>
                        <span className="font-medium text-emerald-600 dark:text-emerald-400 truncate max-w-[160px]">
                          {prop.tenantName || 'Inquilino Activo'}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Póliza / Aseguradora:</span>
                      <span className="font-medium text-blue-600 dark:text-blue-400 flex items-center gap-1">
                        <Shield className="w-3 h-3" /> {prop.insuranceCompany}
                      </span>
                    </div>
                  </div>

                </div>

                {/* Acciones */}
                <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center gap-2">
                  <button
                    onClick={() => handleOpenLiquidationModal(prop)}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-[#e10b17] hover:bg-[#c00510] text-white text-xs font-semibold py-2 rounded-xl transition-all shadow-xs"
                    title="Calcular liquidación de canon para el propietario"
                  >
                    <Calculator className="w-3.5 h-3.5" />
                    <span>Liquidar Canon</span>
                  </button>
                  <button
                    onClick={() => onEditProperty(prop)}
                    className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs transition-colors"
                    title="Editar ficha del inmueble"
                  >
                    Editar
                  </button>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Modal de Liquidación de Canon a Propietario */}
      {selectedPropertyForLiquidation && liquidationCalculation && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#15171c] w-full max-w-xl rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl p-6 overflow-y-auto max-h-[90vh]">
            
            <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-800">
              <div>
                <span className="text-xs font-bold font-mono text-[#e10b17]">
                  {selectedPropertyForLiquidation.code}
                </span>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white font-heading">
                  Liquidación de Canon a Propietario
                </h3>
              </div>
              <button
                onClick={() => setSelectedPropertyForLiquidation(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Datos Inmueble y Propietario */}
            <div className="my-4 p-3.5 rounded-xl bg-gray-50 dark:bg-[#1a1d23] border border-gray-200/80 dark:border-gray-800 space-y-1 text-xs">
              <p className="font-bold text-sm text-gray-900 dark:text-white">
                {selectedPropertyForLiquidation.title}
              </p>
              <p className="text-gray-500">
                Propietario: <span className="font-semibold text-gray-800 dark:text-gray-200">{selectedPropertyForLiquidation.ownerName}</span> ({selectedPropertyForLiquidation.ownerDocument})
              </p>
              <p className="text-gray-500">
                Dispersión bancaria a: <span className="font-mono text-gray-800 dark:text-gray-200">{selectedPropertyForLiquidation.ownerBank} {selectedPropertyForLiquidation.ownerAccountNumber}</span>
              </p>
            </div>

            {/* Desglose Contable */}
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between font-semibold">
                <span>(+) Canon Bruto Recaudado:</span>
                <span className="font-mono">{formatCOP(liquidationCalculation.grossRent)}</span>
              </div>

              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 space-y-1.5 text-xs text-red-900 dark:text-red-300">
                <div className="flex items-center justify-between">
                  <span>(-) Comisión MOAI ({liquidationCalculation.rate}%):</span>
                  <span className="font-mono font-bold">-{formatCOP(liquidationCalculation.commissionAmount)}</span>
                </div>
                {selectedPropertyForLiquidation.ivaOnCommission && (
                  <div className="flex items-center justify-between">
                    <span>(-) IVA 19% sobre comisión:</span>
                    <span className="font-mono font-bold">-{formatCOP(liquidationCalculation.ivaAmount)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between font-bold pt-1 border-t border-red-200 dark:border-red-800">
                  <span>Total Honorarios MOAI (Ingreso Propio):</span>
                  <span className="font-mono">{formatCOP(liquidationCalculation.totalMoaiFee)}</span>
                </div>
              </div>

              {/* Deducción Cuota de Administración PH */}
              <div>
                <label className="text-xs text-gray-500 block mb-1">
                  (-) Deducción Cuota Administración Copropiedad (PH):
                </label>
                <input
                  type="number"
                  value={customAdminFee}
                  onChange={(e) => setCustomAdminFee(Number(e.target.value))}
                  className="w-full bg-gray-50 dark:bg-[#1c1f26] border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm font-mono text-gray-900 dark:text-white"
                />
              </div>

              {/* Deducción Mantenimientos o Reparaciones Locativas */}
              <div>
                <label className="text-xs text-gray-500 block mb-1">
                  (-) Deducción Reparaciones / Mantenimientos Locativos:
                </label>
                <input
                  type="number"
                  value={customRepairs}
                  onChange={(e) => setCustomRepairs(Number(e.target.value))}
                  placeholder="0"
                  className="w-full bg-gray-50 dark:bg-[#1c1f26] border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm font-mono text-gray-900 dark:text-white"
                />
              </div>

              {/* Total Neto a Dispersar */}
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 flex items-center justify-between">
                <div>
                  <span className="text-xs uppercase font-bold text-emerald-800 dark:text-emerald-400 block tracking-wider">
                    Neto a Transferir al Propietario
                  </span>
                  <span className="text-[11px] text-gray-500">
                    Dispersión bancaria final
                  </span>
                </div>
                <span className="text-xl font-extrabold font-mono text-emerald-700 dark:text-emerald-300">
                  {formatCOP(liquidationCalculation.netDisbursement)}
                </span>
              </div>

              {/* Notas */}
              <div>
                <label className="text-xs text-gray-500 block mb-1">Notas del extracto:</label>
                <textarea
                  rows={2}
                  value={liquidationNotes}
                  onChange={(e) => setLiquidationNotes(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-[#1c1f26] border border-gray-200 dark:border-gray-700 rounded-xl p-2.5 text-xs text-gray-900 dark:text-white"
                />
              </div>

            </div>

            {/* Botones de Confirmación */}
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedPropertyForLiquidation(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmLiquidation}
                className="flex items-center gap-1.5 bg-[#e10b17] hover:bg-[#c00510] text-white px-5 py-2 text-xs font-bold rounded-xl shadow-xs transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Asentar Liquidación en Libros</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
