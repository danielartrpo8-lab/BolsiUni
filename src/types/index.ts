/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * EduPlata - Tipos y modelos de datos
 * Diseñado específicamente para finanzas de estudiantes universitarios en Colombia.
 */

export type MovementType = 'income' | 'expense';

// Categorías de gastos universitarios
export type ExpenseCategoryId =
  | 'comida'
  | 'transporte'
  | 'fotocopias'
  | 'matricula'
  | 'ocio'
  | 'suscripciones'
  | 'salud'
  | 'otros';

// Categorías de ingresos universitarios
export type IncomeCategoryId =
  | 'mesada'
  | 'trabajo'
  | 'auxilio'
  | 'emprendimiento'
  | 'otros_ingresos';

export type CategoryId = ExpenseCategoryId | IncomeCategoryId;

export interface CategoryInfo {
  id: CategoryId;
  name: string;
  emoji: string;
  color: string;
  bgLight: string;
  type: MovementType;
  description: string;
}

export interface Transaction {
  id: string;
  type: MovementType;
  amount: number; // En pesos colombianos (COP)
  category: CategoryId;
  date: string; // Formato YYYY-MM-DD
  note?: string;
  createdAt: number;
}

export interface CategoryBudget {
  categoryId: ExpenseCategoryId;
  limit: number; // Límite en COP
}

export interface BudgetConfig {
  monthlyIncomeTarget: number; // Estimado mensual
  monthlyExpenseLimit: number; // Presupuesto mensual total
  categoryLimits: Record<ExpenseCategoryId, number>;
}

export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number; // Monto objetivo en COP
  currentAmount: number; // Ahorro actual en COP
  deadline: string; // Fecha límite YYYY-MM-DD
  emoji: string;
  color: string;
  notes?: string;
  createdAt: number;
}

export interface CutSuggestion {
  title: string;
  explanation: string;
  potentialSaving: number; // Ahorro potencial mensual en COP
}

export interface AIAnalysisResult {
  summary: string;
  cutSuggestions: CutSuggestion[];
  savingsTips: string[];
  analyzedAt: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export interface UserProfile {
  name: string;
  university: string;
  career: string;
  semester: string;
}

export type ActiveTab = 'dashboard' | 'transactions' | 'budget' | 'goals' | 'ai' | 'settings';
