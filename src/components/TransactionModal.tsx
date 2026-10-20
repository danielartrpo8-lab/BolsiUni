/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * MOAI Inmobiliaria - Modal para Asentar o Editar Movimiento Contable
 * Soporte para caja propia MOAI vs custodia de propietarios, inmueble asociado y soporte de comprobante.
 */

import React, { useState, useEffect } from 'react';
import { X, Check, Building2, Wallet } from 'lucide-react';
import { CategoryId, FundType, MovementType, Property, Transaction } from '../types';
import { MOAI_EXPENSE_CATEGORIES, MOAI_INCOME_CATEGORIES, getCategoryInfo } from '../utils/categories';
import { formatCOP, getTodayDateString } from '../utils/formatters';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: Omit<Transaction, 'id' | 'createdAt'>, existingId?: string) => void;
  onDelete?: (id: string) => void;
  initialTransaction?: Transaction | null;
  properties: Property[];
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialTransaction,
  properties
}) => {
  const [type, setType] = useState<MovementType>('income');
  const [fundType, setFundType] = useState<FundType>('moai_operativa');
  const [amountStr, setAmountStr] = useState<string>('');
  const [category, setCategory] = useState<CategoryId>('comision_arriendos');
  const [propertyId, setPropertyId] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [recipientOrPayer, setRecipientOrPayer] = useState<string>('');
  const [referenceNumber, setReferenceNumber] = useState<string>('');
  const [date, setDate] = useState<string>(getTodayDateString());
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (initialTransaction) {
      setType(initialTransaction.type);
      setFundType(initialTransaction.fundType || 'moai_operativa');
      setAmountStr(initialTransaction.amount.toString());
      setCategory(initialTransaction.category);
      setPropertyId(initialTransaction.propertyId || '');
      setDescription(initialTransaction.description);
      setRecipientOrPayer(initialTransaction.recipientOrPayer || '');
      setReferenceNumber(initialTransaction.referenceNumber || '');
      setDate(initialTransaction.date);
    } else {
      setType('income');
      setFundType('moai_operativa');
      setAmountStr('');
      setCategory('comision_arriendos');
      setPropertyId('');
      setDescription('');
      setRecipientOrPayer('');
      setReferenceNumber(`COMP-${Date.now().toString().slice(-5)}`);
      setDate(getTodayDateString());
    }
    setError('');
  }, [initialTransaction, isOpen]);

  if (!isOpen) return null;

  const handleTypeChange = (newType: MovementType) => {
    setType(newType);
    if (newType === 'income') {
      setCategory('comision_arriendos');
    } else {
      setCategory(fundType === 'custodia_propietarios' ? 'dispersion_propietarios' : 'portales_marketing');
    }
  };

  const handleFundChange = (newFund: FundType) => {
    setFundType(newFund);
    if (newFund === 'custodia_propietarios') {
      setCategory(type === 'income' ? 'recaudo_canon' : 'dispersion_propietarios');
    } else {
      setCategory(type === 'income' ? 'comision_arriendos' : 'portales_marketing');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanAmount = parseInt(amountStr.replace(/\D/g, ''), 10);
    if (isNaN(cleanAmount) || cleanAmount <= 0) {
      setError('Por favor ingresa un monto válido mayor a 0');
      return;
    }
    if (!description.trim()) {
      setError('Por favor ingresa el concepto o descripción');
      return;
    }

    const selectedProp = properties.find(p => p.id === propertyId);

    onSave({
      type,
      fundType,
      amount: cleanAmount,
      category,
      date,
      description: description.trim(),
      propertyId: propertyId || undefined,
      propertyCode: selectedProp ? selectedProp.code : undefined,
      recipientOrPayer: recipientOrPayer.trim() || undefined,
      referenceNumber: referenceNumber.trim() || undefined
    }, initialTransaction?.id);

    onClose();
  };

  const currentCategories = type === 'income' ? MOAI_INCOME_CATEGORIES : MOAI_EXPENSE_CATEGORIES;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#15171c] w-full max-w-lg rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl p-6 overflow-y-auto max-h-[92vh]">
        
        {/* Cabecera */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-800">
          <h3 className="font-bold text-base text-gray-900 dark:text-white font-heading">
            {initialTransaction ? 'Editar Asiento Contable' : 'Asentar Nuevo Movimiento en Libros'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        {error && (
          <div className="mt-3 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mt-4 text-xs">
          
          {/* Selector de Tipo (Ingreso / Egreso) */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              className={`py-2 rounded-xl font-bold transition-all ${
                type === 'income'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-gray-100 dark:bg-[#1a1d23] text-gray-600 dark:text-gray-300'
              }`}
            >
              + Ingreso
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              className={`py-2 rounded-xl font-bold transition-all ${
                type === 'expense'
                  ? 'bg-[#e10b17] text-white shadow-xs'
                  : 'bg-gray-100 dark:bg-[#1a1d23] text-gray-600 dark:text-gray-300'
              }`}
            >
              - Egreso
            </button>
          </div>

          {/* Selector de Fondo (Caja MOAI vs Custodia Terceros) */}
          <div>
            <label className="text-gray-600 dark:text-gray-400 block mb-1 font-semibold">
              Destino Contable (Fondo):
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleFundChange('moai_operativa')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  fundType === 'moai_operativa'
                    ? 'border-[#e10b17] bg-red-50/50 dark:bg-red-950/20 text-[#e10b17]'
                    : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1c1f26] text-gray-600 dark:text-gray-300'
                }`}
              >
                <span className="font-bold block text-xs">Caja Operativa MOAI</span>
                <span className="text-[10px] text-gray-500 block">Comisiones, servicios, nómina</span>
              </button>

              <button
                type="button"
                onClick={() => handleFundChange('custodia_propietarios')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  fundType === 'custodia_propietarios'
                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300'
                    : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1c1f26] text-gray-600 dark:text-gray-300'
                }`}
              >
                <span className="font-bold block text-xs">Custodia Propietarios</span>
                <span className="text-[10px] text-gray-500 block">Recaudo y giros de cánones</span>
              </button>
            </div>
          </div>

          {/* Monto en COP */}
          <div>
            <label className="text-gray-600 dark:text-gray-400 block mb-1 font-semibold">
              Monto en COP:
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-gray-400">$</span>
              <input
                type="text"
                required
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                placeholder="Ej: 2.600.000 o 450.000"
                className="w-full bg-gray-50 dark:bg-[#1c1f26] border border-gray-200 dark:border-gray-700 rounded-xl pl-8 pr-3 py-2 text-base font-mono font-bold text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Categoría */}
          <div>
            <label className="text-gray-600 dark:text-gray-400 block mb-1 font-semibold">
              Categoría Contable:
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full bg-gray-50 dark:bg-[#1c1f26] border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs text-gray-900 dark:text-white cursor-pointer"
            >
              {Object.values(currentCategories).map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.emoji} {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Inmueble Asociado */}
          <div>
            <label className="text-gray-600 dark:text-gray-400 block mb-1 font-semibold">
              Inmueble Vinculado (Opcional):
            </label>
            <select
              value={propertyId}
              onChange={(e) => setPropertyId(e.target.value)}
              className="w-full bg-gray-50 dark:bg-[#1c1f26] border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs text-gray-900 dark:text-white cursor-pointer"
            >
              <option value="">-- Operación General de la Empresa --</option>
              {properties.map((prop) => (
                <option key={prop.id} value={prop.id}>
                  {prop.code} - {prop.title} ({prop.neighborhood})
                </option>
              ))}
            </select>
          </div>

          {/* Concepto / Descripción */}
          <div>
            <label className="text-gray-600 dark:text-gray-400 block mb-1 font-semibold">
              Concepto / Descripción del Asiento:
            </label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ej: Recaudo canon mensual Apto 402 Laureles"
              className="w-full bg-gray-50 dark:bg-[#1c1f26] border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs text-gray-900 dark:text-white"
            />
          </div>

          {/* Beneficiario / Pagador y Referencia */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-gray-600 dark:text-gray-400 block mb-1 font-semibold">
                Beneficiario / Pagador:
              </label>
              <input
                type="text"
                value={recipientOrPayer}
                onChange={(e) => setRecipientOrPayer(e.target.value)}
                placeholder="Ej: Santiago Restrepo"
                className="w-full bg-gray-50 dark:bg-[#1c1f26] border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="text-gray-600 dark:text-gray-400 block mb-1 font-semibold">
                N° Comprobante / Ref:
              </label>
              <input
                type="text"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                className="w-full bg-gray-50 dark:bg-[#1c1f26] border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs font-mono text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Fecha */}
          <div>
            <label className="text-gray-600 dark:text-gray-400 block mb-1 font-semibold">
              Fecha de la Operación:
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-gray-50 dark:bg-[#1c1f26] border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs text-gray-900 dark:text-white"
            />
          </div>

          {/* Botones */}
          <div className="pt-3 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
            {initialTransaction && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('¿Eliminar este asiento contable?')) {
                    onDelete(initialTransaction.id);
                    onClose();
                  }
                }}
                className="text-xs text-rose-600 hover:underline font-semibold"
              >
                Eliminar Asiento
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
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
                {initialTransaction ? 'Actualizar Asiento' : 'Asentar en Libros'}
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
