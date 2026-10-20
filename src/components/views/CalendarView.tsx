/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * MOAI Inmobiliaria - Calendario Financiero y Programación de Pagos
 * Vencimientos de cánones, dispersiones a propietarios, pólizas colectivas,
 * sincronización con Google Calendar y descarga de archivos .ics con alarmas.
 */

import React, { useState, useMemo } from 'react';
import { 
  CalendarDays, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  CheckCircle2, 
  CalendarPlus, 
  Download, 
  Clock, 
  Trash2, 
  AlertTriangle, 
  Building2,
  BellRing,
  ExternalLink,
  ShieldAlert,
  Repeat
} from 'lucide-react';
import { ScheduledPayment, ScheduledEventType, CategoryId } from '../../types';
import { formatCOP } from '../../utils/formatters';
import { getCategoryInfo, ALL_MOAI_CATEGORIES } from '../../utils/categories';
import { 
  generateGoogleCalendarUrl, 
  downloadICSFile, 
  getDaysRemaining 
} from '../../utils/calendarUtils';

interface CalendarViewProps {
  payments: ScheduledPayment[];
  onAddPayment: (payment: ScheduledPayment) => void;
  onUpdatePayment: (payment: ScheduledPayment) => void;
  onDeletePayment: (paymentId: string) => void;
  onExecutePayment: (payment: ScheduledPayment) => void;
  currentBalance: number;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  payments,
  onAddPayment,
  onUpdatePayment,
  onDeletePayment,
  onExecutePayment,
  currentBalance
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Formulario nuevo pago
  const [newTitle, setNewTitle] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newDueDate, setNewDueDate] = useState(new Date().toISOString().slice(0, 10));
  const [newCategory, setNewCategory] = useState<CategoryId>('dispersion_propietarios');
  const [newEventType, setNewEventType] = useState<ScheduledEventType>('dispersion_propietario');
  const [newBeneficiary, setNewBeneficiary] = useState('');
  const [newPropertyCode, setNewPropertyCode] = useState('');
  const [newRecurrence, setNewRecurrence] = useState<'ninguna' | 'quincenal' | 'mensual' | 'anual'>('mensual');
  const [newNotes, setNewNotes] = useState('');

  // Navegación de mes
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  // Matriz de días del mes
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Domingo
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];

    // Relleno de días previos
    for (let i = 0; i < firstDayIndex; i++) {
      days.push({ day: null, dateStr: null });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const monthStr = String(month + 1).padStart(2, '0');
      const dayStr = String(d).padStart(2, '0');
      const dateStr = `${year}-${monthStr}-${dayStr}`;
      days.push({ day: d, dateStr });
    }

    return days;
  }, [year, month]);

  // Agrupar pagos por fecha
  const paymentsByDate = useMemo(() => {
    const map: Record<string, ScheduledPayment[]> = {};
    payments.forEach((p) => {
      if (!map[p.dueDate]) map[p.dueDate] = [];
      map[p.dueDate].push(p);
    });
    return map;
  }, [payments]);

  // Lista ordenada de pagos
  const sortedPayments = useMemo(() => {
    return [...payments].sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  }, [payments]);

  // Manejar creación
  const handleCreatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newAmount) return;

    const parsedAmount = parseInt(newAmount.replace(/\D/g, ''), 10) || 0;
    if (parsedAmount <= 0) return;

    const catInfo = getCategoryInfo(newCategory);

    const created: ScheduledPayment = {
      id: `sch-${Date.now()}`,
      title: newTitle.trim(),
      amount: parsedAmount,
      category: catInfo.name,
      categoryId: newCategory,
      eventType: newEventType,
      dueDate: newDueDate,
      recurrence: newRecurrence,
      reminderDaysBefore: 2,
      status: 'pendiente',
      propertyCode: newPropertyCode.trim() || undefined,
      beneficiary: newBeneficiary.trim() || 'MOAI Inmobiliaria',
      notes: newNotes.trim() || undefined
    };

    onAddPayment(created);
    setIsModalOpen(false);
    // Reset
    setNewTitle('');
    setNewAmount('');
    setNewBeneficiary('');
    setNewPropertyCode('');
    setNewNotes('');
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#15171c] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-[#e10b17] uppercase tracking-wider">
              Tesorería & Calendario
            </span>
            <span className="text-gray-300 dark:text-gray-700">•</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Vencimientos y Dispersiones
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white font-heading tracking-tight">
            Calendario de Pagos y Cánones
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Fechas de corte de arriendos, dispersiones bancarias a dueños, pólizas colectivas y recordatorios con alarmas.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-[#e10b17] hover:bg-[#c00510] text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-all active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Programar Compromiso</span>
        </button>
      </div>

      {/* Grid: Calendario a la izquierda, Lista a la derecha */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Calendario Mensual Interactivo (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-[#15171c] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs">
          
          {/* Barra de Navegación de Mes */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-extrabold text-lg text-gray-900 dark:text-white font-heading">
              {monthNames[month]} {year}
            </h3>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handlePrevMonth}
                className="p-2 rounded-xl bg-gray-100 dark:bg-[#1a1d23] hover:bg-gray-200 dark:hover:bg-[#22262f] text-gray-600 dark:text-gray-300 transition-colors"
                title="Mes anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-[#1a1d23] hover:bg-gray-200 dark:hover:bg-[#22262f] text-gray-700 dark:text-gray-300 transition-colors"
              >
                Hoy
              </button>
              <button
                onClick={handleNextMonth}
                className="p-2 rounded-xl bg-gray-100 dark:bg-[#1a1d23] hover:bg-gray-200 dark:hover:bg-[#22262f] text-gray-600 dark:text-gray-300 transition-colors"
                title="Mes siguiente"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Días de la semana */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-gray-400 dark:text-gray-500 uppercase mb-2">
            <span>Dom</span>
            <span>Lun</span>
            <span>Mar</span>
            <span>Mié</span>
            <span>Jue</span>
            <span>Vie</span>
            <span>Sáb</span>
          </div>

          {/* Cuadrícula de Días */}
          <div className="grid grid-cols-7 gap-1.5">
            {calendarDays.map((item, idx) => {
              if (!item.day) {
                return <div key={`empty-${idx}`} className="h-14 sm:h-18 rounded-xl bg-transparent" />;
              }

              const hasPayments = item.dateStr && paymentsByDate[item.dateStr];
              const isSelected = item.dateStr === selectedDateStr;
              const isToday = item.dateStr === new Date().toISOString().slice(0, 10);

              return (
                <button
                  key={item.dateStr}
                  onClick={() => setSelectedDateStr(isSelected ? null : item.dateStr)}
                  className={`h-14 sm:h-18 p-1.5 rounded-xl border flex flex-col justify-between text-left transition-all relative ${
                    isSelected
                      ? 'border-[#e10b17] bg-red-50/50 dark:bg-red-950/20'
                      : isToday
                      ? 'border-gray-400 dark:border-gray-600 bg-gray-50 dark:bg-[#1a1d23]'
                      : 'border-gray-100 dark:border-gray-800/80 hover:border-gray-200 dark:hover:border-gray-700 bg-white dark:bg-[#15171c]'
                  }`}
                >
                  <span className={`text-xs font-bold ${
                    isToday ? 'text-[#e10b17]' : 'text-gray-700 dark:text-gray-300'
                  }`}>
                    {item.day}
                  </span>

                  {/* Indicadores de eventos */}
                  {hasPayments && (
                    <div className="flex flex-wrap gap-1">
                      {hasPayments.slice(0, 3).map((p) => {
                        const isDisbursement = p.eventType === 'dispersion_propietario';
                        const isRent = p.eventType === 'cobro_canon';
                        return (
                          <span
                            key={p.id}
                            className={`w-2 h-2 rounded-full ${
                              isDisbursement
                                ? 'bg-purple-500'
                                : isRent
                                ? 'bg-blue-500'
                                : 'bg-[#e10b17]'
                            }`}
                            title={`${p.title} (${formatCOP(p.amount)})`}
                          />
                        );
                      })}
                      {hasPayments.length > 3 && (
                        <span className="text-[9px] font-bold text-gray-400">
                          +{hasPayments.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Leyenda */}
          <div className="flex items-center gap-4 mt-5 pt-4 border-t border-gray-100 dark:border-gray-800 text-[11px] text-gray-500 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span>Cobro de Canon</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
              <span>Dispersión Propietario</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#e10b17]" />
              <span>Póliza / Operativo</span>
            </div>
          </div>

        </div>

        {/* Lista de Pagos y Acciones (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-[#15171c] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-gray-900 dark:text-white font-heading">
                {selectedDateStr ? `Compromisos del ${selectedDateStr}` : 'Todos los Compromisos'}
              </h3>
              <span className="text-xs font-mono font-bold text-gray-500">
                {selectedDateStr 
                  ? (paymentsByDate[selectedDateStr]?.length || 0) 
                  : sortedPayments.filter(p => p.status === 'pendiente').length} pendientes
              </span>
            </div>

            <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1">
              {(selectedDateStr ? (paymentsByDate[selectedDateStr] || []) : sortedPayments).length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-8 italic">
                  No hay compromisos programados para esta vista.
                </p>
              ) : (
                (selectedDateStr ? (paymentsByDate[selectedDateStr] || []) : sortedPayments).map((p) => {
                  const days = getDaysRemaining(p.dueDate);
                  const isPending = p.status === 'pendiente';

                  return (
                    <div
                      key={p.id}
                      className={`p-4 rounded-xl border transition-all ${
                        !isPending
                          ? 'bg-gray-50/50 dark:bg-gray-900/30 border-gray-200/50 opacity-60'
                          : days < 0
                          ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40'
                          : 'bg-gray-50 dark:bg-[#1a1d23] border-gray-200/80 dark:border-gray-800'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-sm font-bold text-gray-900 dark:text-white">
                              {p.title}
                            </span>
                            {p.propertyCode && (
                              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold">
                                {p.propertyCode}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">
                            Vence: <span className="font-mono font-semibold">{p.dueDate}</span> • Beneficiario: {p.beneficiary}
                          </p>
                        </div>

                        <span className="text-sm font-bold font-mono text-gray-900 dark:text-white whitespace-nowrap">
                          {formatCOP(p.amount)}
                        </span>
                      </div>

                      {p.notes && (
                        <p className="text-[11px] text-gray-500 italic mb-3 bg-white/60 dark:bg-black/20 p-2 rounded-lg">
                          {p.notes}
                        </p>
                      )}

                      {/* Botones de Acción */}
                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-200/60 dark:border-gray-800 text-xs">
                        
                        <div className="flex items-center gap-1.5">
                          {/* Agregar a Google Calendar */}
                          <a
                            href={generateGoogleCalendarUrl(p)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-gray-100 hover:bg-blue-50 hover:text-blue-600 dark:bg-gray-800 dark:hover:bg-blue-950/60 transition-colors"
                            title="Agregar a Google Calendar"
                          >
                            <CalendarPlus className="w-3.5 h-3.5" />
                          </a>

                          {/* Descargar .ics */}
                          <button
                            onClick={() => downloadICSFile(p)}
                            className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
                            title="Descargar archivo .ics (iPhone / Outlook)"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>

                          {/* Eliminar */}
                          <button
                            onClick={() => onDeletePayment(p.id)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                            title="Eliminar evento"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Botón Ya lo Pagué */}
                        {isPending && (
                          <button
                            onClick={() => onExecutePayment(p)}
                            className="flex items-center gap-1 bg-[#e10b17] hover:bg-[#c00510] text-white px-3 py-1.5 rounded-lg font-bold transition-all shadow-xs"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Ya lo pagué</span>
                          </button>
                        )}

                      </div>

                    </div>
                  );
                })
              )}
            </div>

          </div>
        </div>

      </div>

      {/* Modal para Programar Nuevo Pago */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#15171c] w-full max-w-lg rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-800">
              <h3 className="font-bold text-base text-gray-900 dark:text-white font-heading">
                Programar Pago o Cobro Inmobiliario
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <form onSubmit={handleCreatePayment} className="space-y-3.5 mt-4 text-xs">
              <div>
                <label className="text-gray-600 dark:text-gray-400 block mb-1 font-semibold">
                  Concepto / Título:
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ej: Dispersión canon Martha Gómez o Póliza El Libertador"
                  className="w-full bg-gray-50 dark:bg-[#1c1f26] border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm text-gray-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-600 dark:text-gray-400 block mb-1 font-semibold">
                    Monto en COP:
                  </label>
                  <input
                    type="number"
                    required
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    placeholder="Ej: 2290600"
                    className="w-full bg-gray-50 dark:bg-[#1c1f26] border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm font-mono text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-gray-600 dark:text-gray-400 block mb-1 font-semibold">
                    Fecha Vencimiento:
                  </label>
                  <input
                    type="date"
                    required
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-[#1c1f26] border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-600 dark:text-gray-400 block mb-1 font-semibold">
                    Tipo de Evento:
                  </label>
                  <select
                    value={newEventType}
                    onChange={(e) => setNewEventType(e.target.value as any)}
                    className="w-full bg-gray-50 dark:bg-[#1c1f26] border border-gray-200 dark:border-gray-700 rounded-xl px-2.5 py-2 text-gray-900 dark:text-white"
                  >
                    <option value="dispersion_propietario">Dispersión Propietario</option>
                    <option value="cobro_canon">Cobro de Canon a Inquilino</option>
                    <option value="pago_poliza">Pago Póliza Colectiva</option>
                    <option value="pago_administracion">Cuota Administración PH</option>
                    <option value="nomina_comision">Nómina / Comisiones Asesores</option>
                    <option value="impuesto_dian_ica">Impuesto DIAN / ICA</option>
                    <option value="servicio_general">Servicio General / Oficina</option>
                  </select>
                </div>

                <div>
                  <label className="text-gray-600 dark:text-gray-400 block mb-1 font-semibold">
                    Recurrencia:
                  </label>
                  <select
                    value={newRecurrence}
                    onChange={(e) => setNewRecurrence(e.target.value as any)}
                    className="w-full bg-gray-50 dark:bg-[#1c1f26] border border-gray-200 dark:border-gray-700 rounded-xl px-2.5 py-2 text-gray-900 dark:text-white"
                  >
                    <option value="mensual">Mensual (Cada mes)</option>
                    <option value="quincenal">Quincenal</option>
                    <option value="anual">Anual</option>
                    <option value="ninguna">Una sola vez</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-600 dark:text-gray-400 block mb-1 font-semibold">
                    Beneficiario / Involucrado:
                  </label>
                  <input
                    type="text"
                    value={newBeneficiary}
                    onChange={(e) => setNewBeneficiary(e.target.value)}
                    placeholder="Ej: Martha Gómez o El Libertador"
                    className="w-full bg-gray-50 dark:bg-[#1c1f26] border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-gray-600 dark:text-gray-400 block mb-1 font-semibold">
                    Código Inmueble (Opcional):
                  </label>
                  <input
                    type="text"
                    value={newPropertyCode}
                    onChange={(e) => setNewPropertyCode(e.target.value)}
                    placeholder="Ej: MOAI-APT-402"
                    className="w-full bg-gray-50 dark:bg-[#1c1f26] border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 font-mono text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-gray-600 dark:text-gray-400 block mb-1 font-semibold">
                  Notas adicionales:
                </label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Detalles sobre número de póliza, cuenta bancaria, etc."
                  className="w-full bg-gray-50 dark:bg-[#1c1f26] border border-gray-200 dark:border-gray-700 rounded-xl p-2 text-gray-900 dark:text-white"
                />
              </div>

              <div className="pt-3 border-t border-gray-200 dark:border-gray-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-[#e10b17] hover:bg-[#c00510] text-white px-5 py-2 rounded-xl font-bold transition-all shadow-xs"
                >
                  Guardar en Calendario
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
