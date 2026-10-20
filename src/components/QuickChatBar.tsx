/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * MOAI Inmobiliaria - Barra de Entrada Rápida Contable (WhatsApp Style)
 * Permite a los socios y administradores registrar cobros, pagos, cánones y comisiones
 * mediante voz (es-CO) o texto en lenguaje natural.
 */

import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Send, Sparkles, Building2, HelpCircle } from 'lucide-react';

interface QuickChatBarProps {
  onSubmitMessage: (message: string) => void;
  onOpenFullChat: () => void;
}

export const QuickChatBar: React.FC<QuickChatBarProps> = ({
  onSubmitMessage,
  onOpenFullChat
}) => {
  const [text, setText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = 'es-CO';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsRecording(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
      };
      recognition.onerror = () => setIsRecording(false);
      recognition.onend = () => setIsRecording(false);

      recognitionRef.current = recognition;
    }
  }, []);

  const handleToggleRecord = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!recognitionRef.current) {
      onOpenFullChat();
      return;
    }
    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
      } catch (err) {
        setIsRecording(false);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSubmitMessage(text.trim());
    setText('');
  };

  const quickExamples = [
    'Cobro canon 2.6M Apto 402',
    'Dispersión a Martha Gómez 2.290.600 el 10',
    'Pauta en Finca Raíz 450 mil',
    'Comisión venta casa Poblado 19.5M'
  ];

  return (
    <div className="bg-white dark:bg-[#15171c] p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs mb-6 transition-all">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-red-100 dark:bg-red-950/60 flex items-center justify-center text-[#e10b17]">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
            Registro Rápido MOAI (Voz o Texto)
          </span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-500 font-mono">
            Claude Ready
          </span>
        </div>
        <button
          onClick={onOpenFullChat}
          className="text-xs text-[#e10b17] hover:underline font-semibold flex items-center gap-1"
        >
          Abrir Asistente Completo →
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder='Ej: "Cobramos canon de 2.6M del apto 402" o "Pagar pauta 450 mil"'
            className="w-full bg-gray-50 dark:bg-[#1c1f26] border border-gray-200 dark:border-gray-700/80 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-[#e10b17] focus:ring-1 focus:ring-[#e10b17]"
          />
        </div>

        {/* Botón Micrófono */}
        <button
          type="button"
          onClick={handleToggleRecord}
          className={`p-2.5 rounded-xl border transition-all active:scale-95 ${
            isRecording
              ? 'bg-red-500 text-white border-red-600 animate-pulse'
              : 'bg-gray-100 dark:bg-[#1c1f26] text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-gray-300'
          }`}
          title={isRecording ? 'Escuchando... clic para detener' : 'Dictar por voz (es-CO)'}
        >
          {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>

        {/* Botón Enviar */}
        <button
          type="submit"
          disabled={!text.trim()}
          className="bg-[#e10b17] hover:bg-[#c00510] disabled:opacity-40 disabled:hover:bg-[#e10b17] text-white p-2.5 rounded-xl transition-all active:scale-95 shadow-xs"
          title="Procesar movimiento"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

      {/* Sugerencias Rápidas */}
      <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto scrollbar-none pb-0.5">
        <span className="text-[11px] text-gray-400 font-medium whitespace-nowrap">Ejemplos:</span>
        {quickExamples.map((ex, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setText(ex)}
            className="text-[11px] bg-gray-100 hover:bg-gray-200 dark:bg-[#1a1d23] dark:hover:bg-[#22262e] text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-lg whitespace-nowrap transition-colors border border-gray-200/60 dark:border-gray-800"
          >
            {ex}
          </button>
        ))}
      </div>
    </div>
  );
};
