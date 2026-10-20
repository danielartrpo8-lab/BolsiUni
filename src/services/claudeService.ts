/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * MOAI Inmobiliaria - Servicio Frontend para Claude (Anthropic)
 * Comunicación segura mediante backend proxy (/api/claude/chat), protegiendo la API key.
 */

import { QuickChatMessage, ClaudeToolCall } from '../types';

export interface ClaudeChatResponse {
  success: boolean;
  text?: string;
  tools?: ClaudeToolCall[];
  error?: string;
  mode?: string;
}

/**
 * Enviar mensaje al asistente inteligente de MOAI para registrar cánones, comisiones, pagos o liquidaciones
 */
export async function sendChatMessageToClaude(
  message: string,
  history: QuickChatMessage[] = []
): Promise<ClaudeChatResponse> {
  try {
    const response = await fetch('/api/claude/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message,
        history: history.slice(-6)
      })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => null);
      return {
        success: false,
        error: errData?.error || 'No se pudo conectar con el motor contable en este momento.'
      };
    }

    const data = await response.json();
    return {
      success: true,
      text: data.text,
      tools: data.tools || [],
      mode: data.mode
    };
  } catch (err: any) {
    console.error('Error llamando a Claude backend MOAI:', err);
    return {
      success: false,
      error: 'Error de conexión. Intenta de nuevo o registra manualmente.'
    };
  }
}
