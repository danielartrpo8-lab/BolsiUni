/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * MOAI Inmobiliaria - Modal para Crear o Editar Inmuebles en Cartera
 * Ficha completa de propiedad: canon mensual, cuota PH, póliza, datos de propietario para dispersión e inquilino.
 */

import React, { useState, useEffect } from 'react';
import { X, Building2, Shield, User, MapPin } from 'lucide-react';
import { Property, PropertyStatus, PropertyType } from '../types';

interface PropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (property: Property) => void;
  initialProperty?: Property | null;
}

export const PropertyModal: React.FC<PropertyModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialProperty
}) => {
  const [formData, setFormData] = useState<Partial<Property>>({
    code: '',
    title: '',
    address: '',
    neighborhood: 'Laureles',
    city: 'Medellín',
    type: 'apartamento',
    status: 'arrendado',
    monthlyRent: 2500000,
    adminFee: 300000,
    commissionRate: 10,
    ivaOnCommission: true,
    ownerName: '',
    ownerDocument: '',
    ownerBank: 'Bancolombia',
    ownerAccountType: 'ahorros',
    ownerAccountNumber: '',
    ownerEmail: '',
    ownerPhone: '',
    tenantName: '',
    tenantPhone: '',
    paymentDueDay: 5,
    insuranceCompany: 'El Libertador',
    policyNumber: ''
  });

  useEffect(() => {
    if (initialProperty) {
      setFormData(initialProperty);
    } else {
      setFormData({
        id: `prop-${Date.now()}`,
        code: `MOAI-INM-${Math.floor(100 + Math.random() * 900)}`,
        title: '',
        address: '',
        neighborhood: 'Laureles',
        city: 'Medellín',
        type: 'apartamento',
        status: 'arrendado',
        monthlyRent: 2500000,
        adminFee: 300000,
        commissionRate: 10,
        ivaOnCommission: true,
        ownerName: '',
        ownerDocument: '',
        ownerBank: 'Bancolombia',
        ownerAccountType: 'ahorros',
        ownerAccountNumber: '',
        ownerEmail: '',
        ownerPhone: '',
        tenantName: '',
        tenantPhone: '',
        paymentDueDay: 5,
        insuranceCompany: 'El Libertador',
        policyNumber: ''
      });
    }
  }, [initialProperty, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim() || !formData.ownerName?.trim()) return;

    onSave({
      id: formData.id || `prop-${Date.now()}`,
      code: formData.code?.trim() || `MOAI-${Date.now().toString().slice(-4)}`,
      title: formData.title.trim(),
      address: formData.address?.trim() || '',
      neighborhood: formData.neighborhood?.trim() || 'Medellín',
      city: formData.city?.trim() || 'Medellín',
      type: (formData.type || 'apartamento') as PropertyType,
      status: (formData.status || 'arrendado') as PropertyStatus,
      monthlyRent: Number(formData.monthlyRent) || 0,
      adminFee: Number(formData.adminFee) || 0,
      commissionRate: Number(formData.commissionRate) || 10,
      ivaOnCommission: Boolean(formData.ivaOnCommission),
      ownerName: formData.ownerName.trim(),
      ownerDocument: formData.ownerDocument?.trim() || 'CC N/A',
      ownerBank: formData.ownerBank?.trim() || 'Bancolombia',
      ownerAccountType: formData.ownerAccountType || 'ahorros',
      ownerAccountNumber: formData.ownerAccountNumber?.trim() || 'N/A',
      ownerEmail: formData.ownerEmail?.trim() || '',
      ownerPhone: formData.ownerPhone?.trim() || '',
      tenantName: formData.tenantName?.trim() || undefined,
      tenantPhone: formData.tenantPhone?.trim() || undefined,
      paymentDueDay: Number(formData.paymentDueDay) || 5,
      insuranceCompany: formData.insuranceCompany || 'El Libertador',
      policyNumber: formData.policyNumber?.trim() || undefined
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#15171c] w-full max-w-2xl rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl p-6 overflow-y-auto max-h-[92vh]">
        
        <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#e10b17]" />
            <h3 className="font-bold text-base text-gray-900 dark:text-white font-heading">
              {initialProperty ? `Editar ${initialProperty.code}` : 'Registrar Nuevo Inmueble en Cartera'}
            </h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4 text-xs">
          
          {/* Identificación del Inmueble */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-gray-600 dark:text-gray-400 block mb-1 font-semibold">Código:</label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full bg-gray-50 dark:bg-[#1c1f26] border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 font-mono text-gray-900 dark:text-white"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-gray-600 dark:text-gray-400 block mb-1 font-semibold">Título / Identificador:</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ej: Apto 402 Laureles Real"
                className="w-full bg-gray-50 dark:bg-[#1c1f26] border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-gray-600 dark:text-gray-400 block mb-1 font-semibold">Dirección:</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Circular 4 # 73-20"
                className="w-full bg-gray-50 dark:bg-[#1c1f26] border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="text-gray-600 dark:text-gray-400 block mb-1 font-semibold">Barrio / Sector:</label>
              <input
                type="text"
                value={formData.neighborhood}
                onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                placeholder="Laureles, Poblado, Envigado"
                className="w-full bg-gray-50 dark:bg-[#1c1f26] border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="text-gray-600 dark:text-gray-400 block mb-1 font-semibold">Municipio:</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Medellín"
                className="w-full bg-gray-50 dark:bg-[#1c1f26] border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-gray-600 dark:text-gray-400 block mb-1 font-semibold">Tipo de Inmueble:</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full bg-gray-50 dark:bg-[#1c1f26] border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-gray-900 dark:text-white"
              >
                <option value="apartamento">Apartamento</option>
                <option value="casa">Casa</option>
                <option value="local">Local Comercial</option>
                <option value="oficina">Oficina</option>
                <option value="bodega">Bodega</option>
                <option value="lote">Lote</option>
              </select>
            </div>
            <div>
              <label className="text-gray-600 dark:text-gray-400 block mb-1 font-semibold">Estado del Inmueble:</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full bg-gray-50 dark:bg-[#1c1f26] border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-gray-900 dark:text-white"
              >
                <option value="arrendado">Arrendado (Activo)</option>
                <option value="disponible">Disponible para Arrendar</option>
                <option value="en_venta">En Consignación Venta</option>
                <option value="en_reforma">En Adecuación / Reforma</option>
              </select>
            </div>
          </div>

          {/* Cánones y Comisiones */}
          <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-[#1a1d23] border border-gray-200/80 dark:border-gray-800 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#e10b17] block">
              Valores Económicos & Comisión MOAI
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-gray-500 block mb-1">Canon Mensual (COP):</label>
                <input
                  type="number"
                  required
                  value={formData.monthlyRent}
                  onChange={(e) => setFormData({ ...formData, monthlyRent: Number(e.target.value) })}
                  className="w-full bg-white dark:bg-[#15171c] border border-gray-200 dark:border-gray-700 rounded-lg px-2.5 py-1.5 font-mono text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="text-gray-500 block mb-1">Cuota Admin PH (COP):</label>
                <input
                  type="number"
                  value={formData.adminFee}
                  onChange={(e) => setFormData({ ...formData, adminFee: Number(e.target.value) })}
                  className="w-full bg-white dark:bg-[#15171c] border border-gray-200 dark:border-gray-700 rounded-lg px-2.5 py-1.5 font-mono text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="text-gray-500 block mb-1">% Comisión MOAI:</label>
                <input
                  type="number"
                  value={formData.commissionRate}
                  onChange={(e) => setFormData({ ...formData, commissionRate: Number(e.target.value) })}
                  className="w-full bg-white dark:bg-[#15171c] border border-gray-200 dark:border-gray-700 rounded-lg px-2.5 py-1.5 font-mono text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Datos del Propietario */}
          <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-[#1a1d23] border border-gray-200/80 dark:border-gray-800 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 block">
              Datos del Propietario (Para Dispersión Bancaria)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-gray-500 block mb-1">Nombre Completo / Razón Social:</label>
                <input
                  type="text"
                  required
                  value={formData.ownerName}
                  onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                  placeholder="Martha Lucía Gómez"
                  className="w-full bg-white dark:bg-[#15171c] border border-gray-200 dark:border-gray-700 rounded-lg px-2.5 py-1.5 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="text-gray-500 block mb-1">Cédula o NIT:</label>
                <input
                  type="text"
                  value={formData.ownerDocument}
                  onChange={(e) => setFormData({ ...formData, ownerDocument: e.target.value })}
                  placeholder="CC 43.560.120"
                  className="w-full bg-white dark:bg-[#15171c] border border-gray-200 dark:border-gray-700 rounded-lg px-2.5 py-1.5 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="text-gray-500 block mb-1">Banco Dispersión:</label>
                <input
                  type="text"
                  value={formData.ownerBank}
                  onChange={(e) => setFormData({ ...formData, ownerBank: e.target.value })}
                  placeholder="Bancolombia, Davivienda, etc."
                  className="w-full bg-white dark:bg-[#15171c] border border-gray-200 dark:border-gray-700 rounded-lg px-2.5 py-1.5 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="text-gray-500 block mb-1">Número de Cuenta:</label>
                <input
                  type="text"
                  value={formData.ownerAccountNumber}
                  onChange={(e) => setFormData({ ...formData, ownerAccountNumber: e.target.value })}
                  placeholder="031-892401-22"
                  className="w-full bg-white dark:bg-[#15171c] border border-gray-200 dark:border-gray-700 rounded-lg px-2.5 py-1.5 font-mono text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Póliza y Seguro */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-gray-600 dark:text-gray-400 block mb-1 font-semibold">Aseguradora / Fianza:</label>
              <select
                value={formData.insuranceCompany}
                onChange={(e) => setFormData({ ...formData, insuranceCompany: e.target.value as any })}
                className="w-full bg-gray-50 dark:bg-[#1c1f26] border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-gray-900 dark:text-white"
              >
                <option value="El Libertador">El Libertador (Seguros Bolívar)</option>
                <option value="Unifianza">Unifianza</option>
                <option value="FianzaCrédito">FianzaCrédito</option>
                <option value="Sura">Seguros Sura</option>
                <option value="Directa">Garantía Directa</option>
              </select>
            </div>
            <div>
              <label className="text-gray-600 dark:text-gray-400 block mb-1 font-semibold">N° Póliza:</label>
              <input
                type="text"
                value={formData.policyNumber}
                onChange={(e) => setFormData({ ...formData, policyNumber: e.target.value })}
                placeholder="LIB-2026-9041"
                className="w-full bg-gray-50 dark:bg-[#1c1f26] border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 font-mono text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-gray-200 dark:border-gray-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 dark:text-gray-300 font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-[#e10b17] hover:bg-[#c00510] text-white px-5 py-2 rounded-xl font-bold shadow-xs transition-all"
            >
              Guardar Inmueble
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
