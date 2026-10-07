/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BolsiUni - Aplicación Web de Finanzas para Universitarios en Colombia
 * Componente principal que orquesta estado, persistencia local y vistas.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { TabsNav } from './components/TabsNav';
import { DashboardView } from './components/views/DashboardView';
import { TransactionsView } from './components/views/TransactionsView';
import { BudgetView } from './components/views/BudgetView';
import { GoalsView } from './components/views/GoalsView';
import { AIAssistantView } from './components/views/AIAssistantView';
import { SettingsView } from './components/views/SettingsView';
import { TransactionModal } from './components/TransactionModal';
import { GoalModal } from './components/GoalModal';
import { GoalDepositModal } from './components/GoalDepositModal';
import { 
  ActiveTab, 
  AIAnalysisResult, 
  BudgetConfig, 
  SavingsGoal, 
  Transaction, 
  UserProfile 
} from './types';
import { 
  INITIAL_BUDGET, 
  INITIAL_SAVINGS_GOALS, 
  INITIAL_TRANSACTIONS, 
  INITIAL_USER_PROFILE,
  SAMPLE_BUDGET,
  SAMPLE_SAVINGS_GOALS,
  SAMPLE_TRANSACTIONS,
  SAMPLE_USER_PROFILE
} from './data/initialData';
import { getStoredApiKey } from './services/gemini';
import { generateFinancialPDFReport } from './services/pdfReport';
import { Plus } from 'lucide-react';

const STORAGE_KEYS = {
  TRANSACTIONS: 'bolsiuni_v2_transactions',
  BUDGET: 'bolsiuni_v2_budget',
  GOALS: 'bolsiuni_v2_goals',
  PROFILE: 'bolsiuni_v2_profile',
  AI_ANALYSIS: 'bolsiuni_v2_ai_analysis',
  DARK_MODE: 'bolsiuni_dark_mode'
};

export default function App() {
  // Pestaña activa
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // Modo Oscuro
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DARK_MODE);
      if (saved !== null) return JSON.parse(saved);
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  // Efecto para sincronizar la clase 'dark' en el documento raíz
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.DARK_MODE, JSON.stringify(darkMode));
    } catch (e) {
      console.error(e);
    }
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Transacciones
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_TRANSACTIONS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    } catch (e) {
      console.error(e);
    }
  }, [transactions]);

  // Presupuesto
  const [budget, setBudget] = useState<BudgetConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BUDGET);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_BUDGET;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.BUDGET, JSON.stringify(budget));
    } catch (e) {
      console.error(e);
    }
  }, [budget]);

  // Metas de ahorro
  const [goals, setGoals] = useState<SavingsGoal[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.GOALS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_SAVINGS_GOALS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
    } catch (e) {
      console.error(e);
    }
  }, [goals]);

  // Perfil del estudiante
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_USER_PROFILE;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(userProfile));
    } catch (e) {
      console.error(e);
    }
  }, [userProfile]);

  // Último análisis de IA
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.AI_ANALYSIS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return null;
  });

  const handleSaveAnalysis = (result: AIAnalysisResult) => {
    setAiAnalysis(result);
    try {
      localStorage.setItem(STORAGE_KEYS.AI_ANALYSIS, JSON.stringify(result));
    } catch (e) {
      console.error(e);
    }
  };

  // Clave de API de Gemini
  const [apiKey, setApiKey] = useState<string>(() => getStoredApiKey());
  const hasApiKey = Boolean(apiKey && apiKey.trim().length > 0);

  // Estados de Modales
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<SavingsGoal | null>(null);

  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [depositGoal, setDepositGoal] = useState<SavingsGoal | null>(null);

  // Cálculo del saldo general en tiempo real
  const currentBalance = useMemo(() => {
    const inc = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const exp = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    return inc - exp;
  }, [transactions]);

  // Manejo de Movimientos
  const handleSaveTransaction = (
    txData: Omit<Transaction, 'id' | 'createdAt'>,
    existingId?: string
  ) => {
    if (existingId) {
      setTransactions((prev) =>
        prev.map((t) => (t.id === existingId ? { ...t, ...txData } : t))
      );
    } else {
      const newTx: Transaction = {
        ...txData,
        id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        createdAt: Date.now()
      };
      setTransactions((prev) => [newTx, ...prev]);
    }
    setIsTxModalOpen(false);
    setSelectedTx(null);
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  // Manejo de Metas
  const handleSaveGoal = (
    goalData: Omit<SavingsGoal, 'id' | 'createdAt'>,
    existingId?: string
  ) => {
    if (existingId) {
      setGoals((prev) =>
        prev.map((g) => (g.id === existingId ? { ...g, ...goalData } : g))
      );
    } else {
      const newGoal: SavingsGoal = {
        ...goalData,
        id: `goal-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        createdAt: Date.now()
      };
      setGoals((prev) => [...prev, newGoal]);
    }
    setIsGoalModalOpen(false);
    setSelectedGoal(null);
  };

  const handleDeleteGoal = (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  };

  const handleDepositToGoal = (goalId: string, amount: number) => {
    setGoals((prev) =>
      prev.map((g) =>
        g.id === goalId ? { ...g, currentAmount: g.currentAmount + amount } : g
      )
    );
  };

  // Generar y Descargar Informe PDF
  const handleExportPDF = () => {
    generateFinancialPDFReport({
      userProfile,
      transactions,
      budget,
      goals,
      aiAnalysis
    });
  };

  // Restablecer Datos de Ejemplo
  const handleResetSampleData = () => {
    setTransactions(SAMPLE_TRANSACTIONS);
    setBudget(SAMPLE_BUDGET);
    setGoals(SAMPLE_SAVINGS_GOALS);
    setUserProfile(SAMPLE_USER_PROFILE);
    setAiAnalysis(null);
  };

  // Borrar Todos los Datos
  const handleClearAllData = () => {
    setTransactions([]);
    setGoals([]);
    setBudget({
      monthlyIncomeTarget: 0,
      monthlyExpenseLimit: 0,
      categoryLimits: {
        comida: 0,
        transporte: 0,
        fotocopias: 0,
        matricula: 0,
        ocio: 0,
        suscripciones: 0,
        salud: 0,
        otros: 0
      }
    });
    setAiAnalysis(null);
  };

  // Importar Respaldo
  const handleImportData = (data: any) => {
    if (data.transactions) setTransactions(data.transactions);
    if (data.budget) setBudget(data.budget);
    if (data.goals) setGoals(data.goals);
    if (data.userProfile) setUserProfile(data.userProfile);
    if (data.aiAnalysis) setAiAnalysis(data.aiAnalysis);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col transition-colors selection:bg-emerald-500 selection:text-white">
      
      {/* Barra de Navegación Superior */}
      <Navbar
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        balance={currentBalance}
        onExportPDF={handleExportPDF}
        hasApiKey={hasApiKey}
        onOpenSettings={() => setActiveTab('settings')}
        studentName={userProfile.name}
      />

      {/* Navegación por pestañas (Desktop top bar & Mobile bottom bar) */}
      <TabsNav
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        hasApiKey={hasApiKey}
      />

      {/* Contenido Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-12">
        {activeTab === 'dashboard' && (
          <DashboardView
            transactions={transactions}
            budget={budget}
            goals={goals}
            onOpenAddModal={() => {
              setSelectedTx(null);
              setIsTxModalOpen(true);
            }}
            onEditTransaction={(t) => {
              setSelectedTx(t);
              setIsTxModalOpen(true);
            }}
            onNavigateTab={(tab) => setActiveTab(tab)}
            hasApiKey={hasApiKey}
          />
        )}

        {activeTab === 'transactions' && (
          <TransactionsView
            transactions={transactions}
            onOpenAddModal={() => {
              setSelectedTx(null);
              setIsTxModalOpen(true);
            }}
            onEditTransaction={(t) => {
              setSelectedTx(t);
              setIsTxModalOpen(true);
            }}
            onDeleteTransaction={handleDeleteTransaction}
          />
        )}

        {activeTab === 'budget' && (
          <BudgetView
            budget={budget}
            transactions={transactions}
            onUpdateBudget={(newBudget) => setBudget(newBudget)}
          />
        )}

        {activeTab === 'goals' && (
          <GoalsView
            goals={goals}
            onOpenCreateModal={() => {
              setSelectedGoal(null);
              setIsGoalModalOpen(true);
            }}
            onEditGoal={(g) => {
              setSelectedGoal(g);
              setIsGoalModalOpen(true);
            }}
            onDeleteGoal={handleDeleteGoal}
            onOpenDepositModal={(g) => {
              setDepositGoal(g);
              setIsDepositModalOpen(true);
            }}
          />
        )}

        {activeTab === 'ai' && (
          <AIAssistantView
            transactions={transactions}
            budget={budget}
            goals={goals}
            userProfile={userProfile}
            aiAnalysis={aiAnalysis}
            onSaveAnalysis={handleSaveAnalysis}
            hasApiKey={hasApiKey}
            onOpenSettings={() => setActiveTab('settings')}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            apiKey={apiKey}
            onApiKeyChange={(k) => setApiKey(k)}
            userProfile={userProfile}
            onUpdateProfile={(p) => setUserProfile(p)}
            onResetSampleData={handleResetSampleData}
            onClearAllData={handleClearAllData}
            allData={{
              transactions,
              budget,
              goals,
              userProfile
            }}
            onImportData={handleImportData}
          />
        )}
      </main>

      {/* Botón flotante rápido para agregar movimiento en móviles */}
      <button
        onClick={() => {
          setSelectedTx(null);
          setIsTxModalOpen(true);
        }}
        className="md:hidden fixed right-4 bottom-20 z-30 w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white shadow-xl shadow-emerald-600/30 flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-transform"
        title="Registrar movimiento"
      >
        <Plus className="w-7 h-7" />
      </button>

      {/* Modales */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => {
          setIsTxModalOpen(false);
          setSelectedTx(null);
        }}
        onSave={handleSaveTransaction}
        onDelete={handleDeleteTransaction}
        initialTransaction={selectedTx}
      />

      <GoalModal
        isOpen={isGoalModalOpen}
        onClose={() => {
          setIsGoalModalOpen(false);
          setSelectedGoal(null);
        }}
        onSave={handleSaveGoal}
        onDelete={handleDeleteGoal}
        initialGoal={selectedGoal}
      />

      <GoalDepositModal
        isOpen={isDepositModalOpen}
        onClose={() => {
          setIsDepositModalOpen(false);
          setDepositGoal(null);
        }}
        goal={depositGoal}
        onDeposit={handleDepositToGoal}
      />

    </div>
  );
}
