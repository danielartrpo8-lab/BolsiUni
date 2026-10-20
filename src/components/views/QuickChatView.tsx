/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * MOAI Inmobiliaria - Asistente Contable Inteligente (Preparado para Claude / Voz)
 * Entrada por lenguaje natural en jerga inmobiliaria y financiera colombiana (es-CO).
 * Tarjetas interactivas de confirmación antes de asentar en libros contables o en calendario.
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Mic, 
  MicOff, 
  Sparkles, 
  Check, 
  X, 
  Edit3, 
  CalendarDays, 
  Building2, 
  Trash2, 
  PlusCircle, 
  AlertCircle,
  ShieldCheck,
  Calculator
} from 'lucide-react';
import { 
  QuickChatMessage, 
  ClaudeToolCall, 
  Transaction, 
  ScheduledPayment, 
  CategoryId, 
  MovementType, 
  FundType 
} from '../../types';
import { sendChatMessageToClaude } from '../../services/claudeService';
import { formatCOP } from '../../utils/formatters';
import { getCategoryInfo, mapNaturalLanguageCategoryToId } from '../../utils/categories';

interface QuickChatViewProps {
  onAddTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => void;
  onAddScheduledPayment: (payment: ScheduledPayment) => void;
  transactions: Transaction[];
  onOpenManualTransactionModal: () => void;
  initialMessageToSend?: string;
  onClearInitialMessage?: () => void;
}

const STORAGE_CHAT_KEY = 'moai_claude_quick_chat_history_v1';

export const QuickChatView: React.FC<QuickChatViewProps> = ({
  onAddTransaction,
  onAddScheduledPayment,
  transactions,
  onOpenManualTransactionModal,
  initialMessageToSend,
  onClearInitialMessage
}) => {
  const [messages, setMessages] = useState<QuickChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CHAT_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // ignore
    }
    return [
      {
        id: 'msg-welcome',
        sender: 'assistant',
        text: '¡Hola! Soy el asistente contable de MOAI Inmobiliaria. Puedes escribir o dictar operaciones en lenguaje natural, por ejemplo:\n• "Cobramos canon de 2.600.000 del apto 402"\n• "Comisión de venta 19.5M casa Castropol"\n• "Dispersión a Doña Martha de 2.290.600 el día 10"\n• "Pagar pauta en Finca Raíz de 450 mil"',
        timestamp: Date.now()
      }
    ];
  });

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Guardar historial en local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_CHAT_KEY, JSON.stringify(messages.slice(-30)));
    } catch (e) {
      // ignore
    }
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Configurar Web Speech API (es-CO)
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.lang = 'es-CO';
      rec.continuous = false;
      rec.interimResults = false;

      rec.onstart = () => setIsRecording(true);
      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
      };
      rec.onerror = () => setIsRecording(false);
      rec.onend = () => setIsRecording(false);

      recognitionRef.current = rec;
    }
  }, []);

  // Manejar mensaje inicial si viene de la barra rápida
  useEffect(() => {
    if (initialMessageToSend && initialMessageToSend.trim()) {
      handleSendMessage(initialMessageToSend.trim());
      onClearInitialMessage?.();
    }
  }, [initialMessageToSend]);

  const handleToggleVoice = () => {
    if (!recognitionRef.current) {
      setErrorMessage('Tu navegador no soporta dictado por voz.');
      return;
    }
    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
      } catch (e) {
        setIsRecording(false);
      }
    }
  };

  const handleSendMessage = async (customText?: string) => {
    const textToSend = (customText || inputText).trim();
    if (!textToSend || isLoading) return;

    setInputText('');
    setErrorMessage(null);

    const userMsg: QuickChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: Date.now()
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setIsLoading(true);

    try {
      const response = await sendChatMessageToClaude(textToSend, newHistory);

      if (!response.success) {
        setErrorMessage(response.error || 'No pude procesar eso ahora, intenta de nuevo.');
        const botErrorMsg: QuickChatMessage = {
          id: `bot-err-${Date.now()}`,
          sender: 'assistant',
          text: 'No pude procesar la solicitud contable en este momento. Puedes intentar de nuevo o asentar el movimiento manualmente.',
          timestamp: Date.now()
        };
        setMessages((prev) => [...prev, botErrorMsg]);
        return;
      }

      const botMsg: QuickChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: response.text || 'He procesado tu instrucción inmobiliaria:',
        timestamp: Date.now(),
        tools: response.tools || []
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      setErrorMessage('No pude procesar eso ahora, intenta de nuevo');
    } finally {
      setIsLoading(false);
    }
  };

  // Guardar movimiento desde tarjeta de confirmación
  const handleSaveMovement = (tool: ClaudeToolCall, messageId: string) => {
    const p = tool.parameters;
    const catId = mapNaturalLanguageCategoryToId(p.categoria, p.tipo === 'gasto' ? 'expense' : 'income');
    const fundType: FundType = p.tipo_fondo || (catId === 'recaudo_canon' || catId === 'dispersion_propietarios' ? 'custodia_propietarios' : 'moai_operativa');

    onAddTransaction({
      type: p.tipo === 'gasto' ? 'expense' : 'income',
      fundType,
      amount: Math.abs(Number(p.monto)),
      category: catId,
      date: p.fecha || new Date().toISOString().slice(0, 10),
      description: p.descripcion || 'Movimiento contable MOAI',
      propertyCode: p.inmueble_codigo || undefined,
      recipientOrPayer: p.beneficiario_o_pagador || undefined,
      referenceNumber: `MOV-${Date.now().toString().slice(-5)}`
    });

    // Actualizar estado de la tarjeta
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id !== messageId || !msg.tools) return msg;
        return {
          ...msg,
          tools: msg.tools.map((t) => (t.id === tool.id ? { ...t, status: 'saved' } : t))
        };
      })
    );

    // Mensaje amable de confirmación
    const confirmMsg: QuickChatMessage = {
      id: `bot-confirm-${Date.now()}`,
      sender: 'assistant',
      text: `Listo ✅ Se asentó ${p.tipo === 'gasto' ? 'el egreso' : 'el ingreso'} de ${formatCOP(p.monto)} en los libros de MOAI Inmobiliaria (${fundType === 'moai_operativa' ? 'Caja MOAI' : 'Custodia Propietarios'}).`,
      timestamp: Date.now()
    };
    setMessages((prev) => [...prev, confirmMsg]);
  };

  // Guardar pago programado desde tarjeta
  const handleSavePayment = (tool: ClaudeToolCall, messageId: string) => {
    const p = tool.parameters;
    const catId = mapNaturalLanguageCategoryToId(p.categoria, 'expense');

    const scheduled: ScheduledPayment = {
      id: `sch-${Date.now()}`,
      title: p.titulo || p.descripcion || 'Compromiso programado',
      amount: Math.abs(Number(p.monto)),
      category: p.categoria || 'Compromiso',
      categoryId: catId,
      eventType: p.tipo_evento || 'servicio_general',
      dueDate: p.fecha_vencimiento || new Date().toISOString().slice(0, 10),
      recurrence: p.recurrencia || 'ninguna',
      reminderDaysBefore: Number(p.recordatorio_dias_antes) || 2,
      status: 'pendiente',
      propertyCode: p.inmueble_codigo || undefined,
      beneficiary: p.beneficiario || 'MOAI Inmobiliaria'
    };

    onAddScheduledPayment(scheduled);

    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id !== messageId || !msg.tools) return msg;
        return {
          ...msg,
          tools: msg.tools.map((t) => (t.id === tool.id ? { ...t, status: 'saved' } : t))
        };
      })
    );

    const confirmMsg: QuickChatMessage = {
      id: `bot-confirm-${Date.now()}`,
      sender: 'assistant',
      text: `Listo ✅ Quedó programado en el calendario para el ${scheduled.dueDate}: ${scheduled.title} (${formatCOP(scheduled.amount)}).`,
      timestamp: Date.now()
    };
    setMessages((prev) => [...prev, confirmMsg]);
  };

  // Descartar tarjeta
  const handleDiscardTool = (tool: ClaudeToolCall, messageId: string) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id !== messageId || !msg.tools) return msg;
        return {
          ...msg,
          tools: msg.tools.map((t) => (t.id === tool.id ? { ...t, status: 'discarded' } : t))
        };
      })
    );
  };

  const handleClearHistory = () => {
    if (window.confirm('¿Borrar el historial de conversación del asistente?')) {
      localStorage.removeItem(STORAGE_CHAT_KEY);
      setMessages([
        {
          id: 'msg-welcome-new',
          sender: 'assistant',
          text: 'Historial reiniciado. Puedes escribir o dictar operaciones contables de MOAI Inmobiliaria.',
          timestamp: Date.now()
        }
      ]);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-14rem)] max-w-4xl mx-auto bg-white dark:bg-[#15171c] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs overflow-hidden">
      
      {/* Cabecera del Chat */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-200 dark:border-gray-800 bg-gray-50/80 dark:bg-[#1a1d23]/80">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#e10b17] text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-gray-900 dark:text-white font-heading">
                Asistente Contable MOAI
              </h3>
              <span className="text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 px-2 py-0.2 rounded-full border border-emerald-200 dark:border-emerald-900/40">
                es-CO
              </span>
            </div>
            <p className="text-[11px] text-gray-500">
              Lenguaje natural inmobiliario • Confirmación previa antes de asentar
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenManualTransactionModal}
            className="text-xs text-gray-600 dark:text-gray-300 hover:text-gray-900 px-2.5 py-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
            title="Abrir formulario manual tradicional"
          >
            Registro Manual
          </button>
          <button
            onClick={handleClearHistory}
            className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg transition-colors"
            title="Limpiar chat"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Área de Mensajes */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              {/* Burbuja de Texto */}
              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-xs ${
                  isUser
                    ? 'bg-[#e10b17] text-white rounded-tr-xs'
                    : 'bg-gray-100 dark:bg-[#1f2229] text-gray-900 dark:text-gray-100 rounded-tl-xs border border-gray-200/80 dark:border-gray-800'
                }`}
              >
                <p className="whitespace-pre-line">{msg.text}</p>
                <span
                  className={`text-[10px] block text-right mt-1.5 ${
                    isUser ? 'text-red-100' : 'text-gray-400'
                  }`}
                >
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {/* Tarjetas de Confirmación de Herramientas */}
              {msg.tools && msg.tools.length > 0 && (
                <div className="mt-2.5 space-y-2.5 w-full max-w-md">
                  {msg.tools.map((tool) => {
                    const isSaved = tool.status === 'saved';
                    const isDiscarded = tool.status === 'discarded';

                    if (tool.toolName === 'pedir_aclaracion') {
                      return (
                        <div
                          key={tool.id}
                          className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-300"
                        >
                          <p className="font-semibold">{tool.parameters.pregunta}</p>
                        </div>
                      );
                    }

                    if (tool.toolName === 'registrar_movimiento') {
                      const p = tool.parameters;
                      const isExpense = p.tipo === 'gasto';
                      const isCustody = p.tipo_fondo === 'custodia_propietarios';

                      return (
                        <div
                          key={tool.id}
                          className={`p-4 rounded-xl border transition-all ${
                            isSaved
                              ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800'
                              : isDiscarded
                              ? 'opacity-40 bg-gray-100 dark:bg-gray-800 border-gray-300'
                              : 'bg-white dark:bg-[#1a1d23] border-gray-200 dark:border-gray-700 shadow-sm'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                                  isExpense
                                    ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                                    : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                }`}>
                                  {isExpense ? 'Egreso' : 'Ingreso'}
                                </span>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                                  {isCustody ? 'Custodia Terceros' : 'Caja MOAI'}
                                </span>
                                {p.inmueble_codigo && (
                                  <span className="text-[10px] font-mono font-bold bg-gray-200 dark:bg-gray-700 px-1.5 py-0.2 rounded">
                                    {p.inmueble_codigo}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">
                                {p.descripcion}
                              </p>
                            </div>

                            <span className={`text-base font-extrabold font-mono ${
                              isExpense ? 'text-rose-600' : 'text-emerald-600'
                            }`}>
                              {formatCOP(p.monto)}
                            </span>
                          </div>

                          <div className="text-xs text-gray-500 mb-3 space-y-0.5">
                            <p>Categoría: <span className="font-semibold text-gray-700 dark:text-gray-300">{p.categoria}</span></p>
                            <p>Fecha: <span className="font-mono">{p.fecha}</span></p>
                          </div>

                          {/* Botones de Confirmación */}
                          {!isSaved && !isDiscarded && (
                            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                              <button
                                onClick={() => handleDiscardTool(tool, msg.id)}
                                className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700 font-semibold"
                              >
                                Descartar
                              </button>
                              <button
                                onClick={() => handleSaveMovement(tool, msg.id)}
                                className="flex items-center gap-1.5 bg-[#e10b17] hover:bg-[#c00510] text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Asentar en Libros</span>
                              </button>
                            </div>
                          )}

                          {isSaved && (
                            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                              ✓ Asentado en la contabilidad
                            </span>
                          )}
                        </div>
                      );
                    }

                    if (tool.toolName === 'programar_pago') {
                      const p = tool.parameters;

                      return (
                        <div
                          key={tool.id}
                          className={`p-4 rounded-xl border transition-all ${
                            isSaved
                              ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-300'
                              : isDiscarded
                              ? 'opacity-40 bg-gray-100'
                              : 'bg-white dark:bg-[#1a1d23] border-gray-200 dark:border-gray-700 shadow-sm'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                                Compromiso Futuro
                              </span>
                              <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">
                                {p.titulo || p.descripcion}
                              </p>
                            </div>
                            <span className="text-base font-extrabold font-mono text-gray-900 dark:text-white">
                              {formatCOP(p.monto)}
                            </span>
                          </div>

                          <div className="text-xs text-gray-500 mb-3 space-y-0.5">
                            <p>Vence: <span className="font-mono font-semibold">{p.fecha_vencimiento}</span></p>
                            <p>Recurrencia: <span className="capitalize">{p.recurrencia}</span></p>
                            {p.beneficiario && <p>Beneficiario: {p.beneficiario}</p>}
                          </div>

                          {!isSaved && !isDiscarded && (
                            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                              <button
                                onClick={() => handleDiscardTool(tool, msg.id)}
                                className="px-3 py-1.5 text-xs text-gray-500 font-semibold"
                              >
                                Descartar
                              </button>
                              <button
                                onClick={() => handleSavePayment(tool, msg.id)}
                                className="flex items-center gap-1.5 bg-[#e10b17] hover:bg-[#c00510] text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Programar en Calendario</span>
                              </button>
                            </div>
                          )}

                          {isSaved && (
                            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                              ✓ Programado en el calendario
                            </span>
                          )}
                        </div>
                      );
                    }

                    return null;
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* Indicador de Escribiendo */}
        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-gray-500 italic py-2">
            <div className="w-2 h-2 rounded-full bg-[#e10b17] animate-ping" />
            <span>MOAI Contable está procesando la operación...</span>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Alerta de Error */}
      {errorMessage && (
        <div className="px-4 py-2 bg-rose-50 dark:bg-rose-950/40 border-t border-rose-200 dark:border-rose-900/40 text-xs text-rose-700 dark:text-rose-300 flex items-center justify-between">
          <span>{errorMessage}</span>
          <button onClick={() => setErrorMessage(null)} className="font-bold">✕</button>
        </div>
      )}

      {/* Barra de Entrada de Chat */}
      <div className="p-3 sm:p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#1a1d23]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Escribe o dicta: ej. 'Cobro canon 2.6M apto 402' o 'Pagar pauta 450k'..."
            className="flex-1 bg-white dark:bg-[#15171c] border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-[#e10b17]"
          />

          {/* Botón Micrófono */}
          <button
            type="button"
            onClick={handleToggleVoice}
            className={`p-2.5 rounded-xl border transition-all active:scale-95 ${
              isRecording
                ? 'bg-red-500 text-white border-red-600 animate-pulse'
                : 'bg-white dark:bg-[#15171c] text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:border-gray-400'
            }`}
            title={isRecording ? 'Detener dictado' : 'Dictar por voz (es-CO)'}
          >
            {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Botón Enviar */}
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="bg-[#e10b17] hover:bg-[#c00510] disabled:opacity-40 text-white p-2.5 rounded-xl shadow-xs transition-all active:scale-95"
            title="Enviar mensaje contable"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>

    </div>
  );
};
