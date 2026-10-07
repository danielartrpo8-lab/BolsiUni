/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Servicio de Asistente IA con Google Gemini API
 * Funciona 100% en el frontend usando la API Key del usuario almacenada en su localStorage.
 * No requiere servidor y es compatible con despliegue en GitHub Pages.
 */

import { AIAnalysisResult, BudgetConfig, ChatMessage, SavingsGoal, Transaction, UserProfile } from '../types';
import { formatCOP } from '../utils/formatters';
import { getCategoryInfo } from '../utils/categories';

const STORAGE_KEY = 'bolsiuni_gemini_api_key';

/**
 * Obtiene la API Key configurada por el estudiante en su navegador
 */
export function getStoredApiKey(): string {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && saved.trim().length > 0) {
      return saved.trim();
    }
  } catch (e) {
    console.error('Error al leer de localStorage:', e);
  }
  // En caso de que se pase por variables de entorno en compilación local
  return (import.meta as any).env?.VITE_GEMINI_API_KEY || '';
}

/**
 * Guarda la API Key únicamente en el navegador del usuario
 */
export function saveStoredApiKey(apiKey: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, apiKey.trim());
  } catch (e) {
    console.error('Error al guardar en localStorage:', e);
  }
}

/**
 * Elimina la API Key guardada
 */
export function removeStoredApiKey(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Error al remover de localStorage:', e);
  }
}

/**
 * Prueba la validez de una API key con una consulta liviana
 */
export async function testApiKey(apiKey: string): Promise<{ success: boolean; message: string }> {
  if (!apiKey || apiKey.trim().length < 10) {
    return { success: false, message: 'Ingresa una clave válida de Google AI Studio.' };
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey.trim()}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Responde solo la palabra: OK' }] }]
        })
      }
    );

    if (!response.ok) {
      const errData = await response.json().catch(() => null);
      const errMsg = errData?.error?.message || `Error ${response.status}: Clave no autorizada`;
      return { success: false, message: errMsg };
    }

    return { success: true, message: '¡Conexión exitosa con Gemini AI!' };
  } catch (err: any) {
    return { success: false, message: err.message || 'Error de red al conectar con Gemini.' };
  }
}

/**
 * Genera el prompt financiero con el contexto de las cuentas del estudiante
 */
function buildFinancialContext(
  transactions: Transaction[],
  budget: BudgetConfig,
  goals: SavingsGoal[],
  userProfile?: UserProfile
): string {
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  // Gastos por categoría
  const expenseByCategory: Record<string, number> = {};
  transactions
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      expenseByCategory[t.category] = (expenseByCategory[t.category] || 0) + t.amount;
    });

  const categoryBreakdown = Object.entries(expenseByCategory)
    .sort(([, a], [, b]) => b - a)
    .map(([cat, amount]) => {
      const info = getCategoryInfo(cat as any);
      const limit = (budget.categoryLimits as Record<string, number>)[cat] || 0;
      const pct = totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0;
      return `- ${info.name}: ${formatCOP(amount)} (${pct}% del total gastado). Límite fijado: ${formatCOP(limit)}`;
    })
    .join('\n');

  // Metas de ahorro
  const goalsSummary = goals
    .map((g) => {
      const pct = Math.round((g.currentAmount / g.targetAmount) * 100);
      return `- Meta "${g.title}": Lleva ${formatCOP(g.currentAmount)} de ${formatCOP(g.targetAmount)} (${pct}% completado). Fecha límite: ${g.deadline}`;
    })
    .join('\n');

  const recentTx = transactions
    .slice(0, 15)
    .map((t) => `${t.date} | ${t.type === 'income' ? '+' : '-'}${formatCOP(t.amount)} | ${getCategoryInfo(t.category).name} | ${t.note || 'Sin nota'}`)
    .join('\n');

  return `
ESTUDIANTE: ${userProfile?.name || 'Estudiante'} (${userProfile?.university || 'Universidad en Colombia'} - ${userProfile?.career || 'Carrera'})
MONEDA: Pesos Colombianos (COP)

PANORAMA FINANCIERO DEL MES:
- Ingresos totales recibidos: ${formatCOP(totalIncome)}
- Gastos totales realizados: ${formatCOP(totalExpense)}
- Saldo en bolsillo actualmente: ${formatCOP(balance)}
- Presupuesto mensual establecido: ${formatCOP(budget.monthlyExpenseLimit)}
- Porcentaje del presupuesto consumido: ${budget.monthlyExpenseLimit > 0 ? Math.round((totalExpense / budget.monthlyExpenseLimit) * 100) : 0}%

DESGLOSE DE GASTOS POR CATEGORÍA:
${categoryBreakdown || 'No hay gastos registrados aún.'}

METAS DE AHORRO DEL ESTUDIANTE:
${goalsSummary || 'No tiene metas activas.'}

ÚLTIMOS MOVIMIENTOS:
${recentTx || 'No hay movimientos.'}
`;
}

/**
 * Analiza las finanzas con Gemini y retorna resumen, recortes y consejos
 */
export async function analyzeFinancesWithGemini(
  transactions: Transaction[],
  budget: BudgetConfig,
  goals: SavingsGoal[],
  userProfile?: UserProfile
): Promise<AIAnalysisResult> {
  const apiKey = getStoredApiKey();
  if (!apiKey) {
    throw new Error('MISSING_API_KEY');
  }

  const context = buildFinancialContext(transactions, budget, goals, userProfile);

  const systemInstruction = `
Eres EduPlata AI, el asesor financiero virtual de un estudiante universitario en Colombia.
Tu tono es cercano, motivador, empático, buena onda y 100% adaptado a la vida universitaria en Colombia (usa expresiones amigables como "parcero", "plata", "parche", "empanada", "cuadrar caja", "salvar el semestre", pero sin exagerar).
CERO tecnicismos financieros enredados (nada de EBITDA, bonos o fondos de cobertura). Háblale a alguien que vive con mesada, auxilio o sueldito de medio tiempo.

Debes responder ÚNICAMENTE en formato JSON con la siguiente estructura exacta:
{
  "summary": "Un párrafo de 3 a 5 líneas con un balance sincero, amigable y motivador de cómo va su plata este mes.",
  "cutSuggestions": [
    {
      "title": "Nombre corto del gasto a recortar (ej: Tintos y empanadas diarias, Salidas consecutivas de fin de semana, etc)",
      "explanation": "Explicación directa de por qué se le va la plata ahí y cómo solucionarlo fácilmente sin sufrir.",
      "potentialSaving": 45000 (monto numérico estimado en pesos colombianos COP que podría ahorrarse al mes)
    },
    {
      "title": "Segundo gasto a recortar",
      "explanation": "Explicación breve y práctica",
      "potentialSaving": 30000
    },
    {
      "title": "Tercer gasto a recortar",
      "explanation": "Explicación breve y práctica",
      "potentialSaving": 25000
    }
  ],
  "savingsTips": [
    "Consejo 1 realista para un estudiante universitario en Colombia (ej: cargar termo de agua, preparar snacks, compartir suscripciones familiares, aprovechar descuentos de carné)",
    "Consejo 2 realista y aplicable esta misma semana",
    "Consejo 3 que lo motive a cumplir sus metas de ahorro"
  ]
}
`;

  const prompt = `Analiza estos datos financieros de mi vida universitaria y dame tu diagnóstico en JSON:\n\n${context}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${systemInstruction}\n\n${prompt}` }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.7
          }
        })
      }
    );

    if (!response.ok) {
      const errorJson = await response.json().catch(() => null);
      const message = errorJson?.error?.message || `Error ${response.status} en la API de Gemini`;
      throw new Error(message);
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      throw new Error('Gemini no devolvió ninguna respuesta.');
    }

    // Limpieza de formato markdown de bloques ```json si viene incluido
    const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanJson);

    return {
      summary: parsed.summary || 'Tu bolsillo universitario se ve activo. ¡Sigue cuidando cada peso!',
      cutSuggestions: Array.isArray(parsed.cutSuggestions) ? parsed.cutSuggestions : [],
      savingsTips: Array.isArray(parsed.savingsTips) ? parsed.savingsTips : [],
      analyzedAt: new Date().toISOString()
    };
  } catch (err: any) {
    console.error('Error al analizar con Gemini:', err);
    throw err;
  }
}

/**
 * Chat interactivo con Gemini basado en las finanzas del estudiante
 */
export async function chatWithFinancialAdvisor(
  messages: ChatMessage[],
  transactions: Transaction[],
  budget: BudgetConfig,
  goals: SavingsGoal[],
  userProfile?: UserProfile
): Promise<string> {
  const apiKey = getStoredApiKey();
  if (!apiKey) {
    throw new Error('MISSING_API_KEY');
  }

  const context = buildFinancialContext(transactions, budget, goals, userProfile);

  const systemInstruction = `
Eres EduPlata AI, el tutor y amigo financiero de un estudiante universitario en Colombia.
Tienes acceso al panorama actual de sus finanzas:
${context}

Tu objetivo es responder sus preguntas sobre su plata de forma directa, honesta, comprensiva y con buena onda.
Si pregunta "¿me alcanza para ir a un concierto?" o "¿puedo comprarme unos tenis?", revisa su saldo real, sus gastos obligatorios del mes (transporte, comida, fotocopias) y sus metas de ahorro antes de decirle si puede o si es mejor esperar.
Si no le alcanza, dale una alternativa realista (ej: "si te ahorras 2 salidas este fin de semana o vendes unos apuntes, coronas").
Usa formato Markdown con listas y negritas cuando ayude a que sea más legible. Sé conciso y no des sermones largos.
`;

  // Construir historial de mensajes
  const conversationHistory = messages.map((m) => ({
    role: m.sender === 'user' ? 'user' : 'model',
    parts: [{ text: m.text }]
  }));

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemInstruction }]
          },
          contents: conversationHistory,
          generationConfig: {
            temperature: 0.75
          }
        })
      }
    );

    if (!response.ok) {
      const errorJson = await response.json().catch(() => null);
      const message = errorJson?.error?.message || `Error ${response.status} en la API de Gemini`;
      throw new Error(message);
    }

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return reply || '¡Aquí estoy para ayudarte con tu bolsillo!';
  } catch (err: any) {
    console.error('Error en el chat de Gemini:', err);
    throw err;
  }
}
