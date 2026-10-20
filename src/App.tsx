/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * MOAI Inmobiliaria - Suite Contable, Presupuestal y Gestión de Socios
 * Componente principal que orquesta el estado, navegación, persistencia y módulos.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { TabsNav } from './components/TabsNav';
import { DashboardView } from './components/views/DashboardView';
import { PropertiesView } from './components/views/PropertiesView';
import { TransactionsView } from './components/views/TransactionsView';
import { CalendarView } from './components/views/CalendarView';
import { BudgetView } from './components/views/BudgetView';
import { PartnersView } from './components/views/PartnersView';
import { QuickChatView } from './components/views/QuickChatView';
import { SettingsView } from './components/views/SettingsView';
import { TransactionModal } from './components/TransactionModal';
import { PropertyModal } from './components/PropertyModal';
import { 
  ActiveTab, 
  BudgetConfig, 
  CompanyProfile, 
  Partner, 
  Property, 
  RentLiquidation, 
  ScheduledPayment, 
  Transaction 
} from './types';
import { 
  INITIAL_BUDGET, 
  INITIAL_COMPANY_PROFILE, 
  INITIAL_PARTNERS, 
  INITIAL_PROPERTIES, 
  INITIAL_SCHEDULED_PAYMENTS, 
  INITIAL_TRANSACTIONS,
  DEMO_SAMPLE_PROPERTIES,
  DEMO_SAMPLE_TRANSACTIONS,
  DEMO_SAMPLE_SCHEDULED_PAYMENTS
} from './data/initialData';
import { exportTransactionsToExcel } from './services/excelReport';
import { generateFinancialPDFReport } from './services/pdfReport';

const STORAGE_KEYS = {
  TRANSACTIONS: 'moai_kash_v1_transactions',
  PROPERTIES: 'moai_kash_v1_properties',
  SCHEDULED_PAYMENTS: 'moai_kash_v1_payments',
  PARTNERS: 'moai_kash_v1_partners',
  BUDGET: 'moai_kash_v1_budget',
  COMPANY_PROFILE: 'moai_kash_v1_profile',
  ACTIVE_PARTNER: 'moai_kash_v1_active_partner_id',
  DARK_MODE: 'moai_kash_v1_dark_mode'
};

export function App() {
  // 1. Estado de Modo Oscuro / Claro
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DARK_MODE);
      if (saved !== null) return JSON.parse(saved);
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch (e) {
      return false;
    }
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try {
      localStorage.setItem(STORAGE_KEYS.DARK_MODE, JSON.stringify(darkMode));
    } catch (e) {
      // ignore
    }
  }, [darkMode]);

  // 2. Estado de Navegación de Pestañas
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // 3. Estado de la Empresa
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.COMPANY_PROFILE);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_COMPANY_PROFILE;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.COMPANY_PROFILE, JSON.stringify(companyProfile));
  }, [companyProfile]);

  // 4. Estado de Socios
  const [partners, setPartners] = useState<Partner[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PARTNERS);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_PARTNERS;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PARTNERS, JSON.stringify(partners));
  }, [partners]);

  // Socio Activo en sesión
  const [activePartnerId, setActivePartnerId] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.ACTIVE_PARTNER) || INITIAL_PARTNERS[0].id;
    } catch (e) {
      return INITIAL_PARTNERS[0].id;
    }
  });

  const activePartner = useMemo(() => {
    return partners.find(p => p.id === activePartnerId) || partners[0];
  }, [partners, activePartnerId]);

  const handleChangePartner = (partner: Partner) => {
    setActivePartnerId(partner.id);
    localStorage.setItem(STORAGE_KEYS.ACTIVE_PARTNER, partner.id);
  };

  // 5. Estado de Inmuebles en Cartera
  const [properties, setProperties] = useState<Property[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROPERTIES);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_PROPERTIES;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROPERTIES, JSON.stringify(properties));
  }, [properties]);

  // 6. Estado de Movimientos Contables
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_TRANSACTIONS;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);

  // 7. Estado de Pagos Programados / Calendario
  const [scheduledPayments, setScheduledPayments] = useState<ScheduledPayment[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SCHEDULED_PAYMENTS);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_SCHEDULED_PAYMENTS;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SCHEDULED_PAYMENTS, JSON.stringify(scheduledPayments));
  }, [scheduledPayments]);

  // 8. Estado de Presupuesto
  const [budget, setBudget] = useState<BudgetConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BUDGET);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_BUDGET;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BUDGET, JSON.stringify(budget));
  }, [budget]);

  // Cargar base de datos guardada en disco al montar
  useEffect(() => {
    fetch('/api/database')
      .then(res => res.json())
      .then(res => {
        if (res.success && res.data) {
          if (Array.isArray(res.data.transactions) && res.data.transactions.length > 0) {
            setTransactions(res.data.transactions);
          }
          if (Array.isArray(res.data.properties) && res.data.properties.length > 0) {
            setProperties(res.data.properties);
          }
          if (Array.isArray(res.data.scheduledPayments) && res.data.scheduledPayments.length > 0) {
            setScheduledPayments(res.data.scheduledPayments);
          }
          if (Array.isArray(res.data.partners) && res.data.partners.length > 0) {
            setPartners(res.data.partners);
          }
          if (res.data.budget) {
            setBudget(res.data.budget);
          }
          if (res.data.companyProfile) {
            setCompanyProfile(res.data.companyProfile);
          }
        }
      })
      .catch(() => {});
  }, []);

  // Guardar automáticamente en disco en el backend (data/moai_database.json)
  useEffect(() => {
    const timer = setTimeout(() => {
      fetch('/api/database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyProfile,
          partners,
          properties,
          transactions,
          scheduledPayments,
          budget
        })
      }).catch(() => {});
    }, 800);
    return () => clearTimeout(timer);
  }, [companyProfile, partners, properties, transactions, scheduledPayments, budget]);

  // Modales
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);

  const [quickMessageForChat, setQuickMessageForChat] = useState<string>('');

  // Saldos de Cabecera
  const balances = useMemo(() => {
    let moaiIncomes = 0;
    let moaiExpenses = 0;
    let custodyIncomes = 0;
    let custodyExpenses = 0;

    transactions.forEach(t => {
      if (t.fundType === 'moai_operativa') {
        if (t.type === 'income') moaiIncomes += t.amount;
        else moaiExpenses += t.amount;
      } else {
        if (t.type === 'income') custodyIncomes += t.amount;
        else custodyExpenses += t.amount;
      }
    });

    return {
      moaiBalance: moaiIncomes - moaiExpenses,
      custodyBalance: custodyIncomes - custodyExpenses
    };
  }, [transactions]);

  // Handlers para Movimientos
  const handleSaveTransaction = (
    data: Omit<Transaction, 'id' | 'createdAt'>,
    existingId?: string
  ) => {
    if (existingId) {
      setTransactions(prev =>
        prev.map(t => (t.id === existingId ? { ...t, ...data } : t))
      );
    } else {
      const created: Transaction = {
        ...data,
        id: `tx-${Date.now()}`,
        createdAt: Date.now()
      };
      setTransactions(prev => [created, ...prev]);
    }
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  // Handlers para Inmuebles
  const handleSaveProperty = (property: Property) => {
    setProperties(prev => {
      const exists = prev.some(p => p.id === property.id);
      if (exists) {
        return prev.map(p => (p.id === property.id ? property : p));
      }
      return [property, ...prev];
    });
  };

  // Handler para Liquidación de Canon
  const handleGenerateLiquidation = (liq: RentLiquidation) => {
    // 1. Asiento: Recaudo Bruto de Canon en Custodia (Terceros)
    const recaudoTx: Transaction = {
      id: `tx-rec-${Date.now()}`,
      type: 'income',
      fundType: 'custodia_propietarios',
      amount: liq.grossRent,
      category: 'recaudo_canon',
      date: liq.dateGenerated,
      description: `Recaudo canon ${liq.propertyCode} (${liq.ownerName})`,
      propertyId: liq.propertyId,
      propertyCode: liq.propertyCode,
      recipientOrPayer: liq.ownerName,
      referenceNumber: `REC-LIQ-${Date.now().toString().slice(-4)}`,
      createdAt: Date.now()
    };

    // 2. Asiento: Comisión retenida para MOAI (Caja Operativa Propia)
    const comisionTx: Transaction = {
      id: `tx-com-${Date.now()}`,
      type: 'income',
      fundType: 'moai_operativa',
      amount: liq.totalMoaiFee,
      category: 'comision_arriendos',
      date: liq.dateGenerated,
      description: `Comisión administración ${liq.propertyCode} (${liq.commissionRate}% + IVA)`,
      propertyId: liq.propertyId,
      propertyCode: liq.propertyCode,
      recipientOrPayer: 'MOAI Inmobiliaria S.A.S.',
      referenceNumber: `COM-LIQ-${Date.now().toString().slice(-4)}`,
      createdAt: Date.now() + 10
    };

    // 3. Asiento: Dispersión neta al Propietario (Fondo Custodia)
    const dispersionTx: Transaction = {
      id: `tx-disp-${Date.now()}`,
      type: 'expense',
      fundType: 'custodia_propietarios',
      amount: liq.netDisbursement,
      category: 'dispersion_propietarios',
      date: liq.dateGenerated,
      description: `Dispersión bancaria canon neto ${liq.propertyCode} a ${liq.ownerName}`,
      propertyId: liq.propertyId,
      propertyCode: liq.propertyCode,
      recipientOrPayer: liq.ownerName,
      referenceNumber: `TRF-LIQ-${Date.now().toString().slice(-4)}`,
      createdAt: Date.now() + 20
    };

    setTransactions(prev => [dispersionTx, comisionTx, recaudoTx, ...prev]);
    alert(`¡Liquidación asentada en libros!\n• Recaudo Bruto: $${liq.grossRent.toLocaleString('es-CO')}\n• Comisión MOAI: $${liq.totalMoaiFee.toLocaleString('es-CO')}\n• Giro a Propietario: $${liq.netDisbursement.toLocaleString('es-CO')}`);
  };

  // Handlers para Pagos Programados
  const handleAddScheduledPayment = (payment: ScheduledPayment) => {
    setScheduledPayments(prev => [payment, ...prev]);
  };

  const handleUpdateScheduledPayment = (payment: ScheduledPayment) => {
    setScheduledPayments(prev => prev.map(p => (p.id === payment.id ? payment : p)));
  };

  const handleDeleteScheduledPayment = (id: string) => {
    setScheduledPayments(prev => prev.filter(p => p.id !== id));
  };

  // Ejecutar Pago Programado -> lo asienta como movimiento contable real
  const handleExecutePayment = (payment: ScheduledPayment) => {
    const today = new Date().toISOString().slice(0, 10);
    const isDisbursement = payment.eventType === 'dispersion_propietario';

    const newTx: Transaction = {
      id: `tx-exec-${Date.now()}`,
      type: payment.eventType === 'cobro_canon' ? 'income' : 'expense',
      fundType: isDisbursement ? 'custodia_propietarios' : 'moai_operativa',
      amount: payment.amount,
      category: payment.categoryId,
      date: today,
      description: payment.title,
      propertyCode: payment.propertyCode,
      recipientOrPayer: payment.beneficiary,
      referenceNumber: `PAG-${Date.now().toString().slice(-5)}`,
      createdAt: Date.now()
    };

    setTransactions(prev => [newTx, ...prev]);

    // Marcar como ejecutado o reprogramar si es recurrente
    if (payment.recurrence && payment.recurrence !== 'ninguna') {
      const parts = payment.dueDate.split('-');
      let y = parseInt(parts[0], 10);
      let m = parseInt(parts[1], 10);
      const d = parseInt(parts[2], 10);

      if (payment.recurrence === 'mensual') {
        m += 1;
        if (m > 12) { m = 1; y += 1; }
      } else if (payment.recurrence === 'anual') {
        y += 1;
      }

      const nextDue = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      setScheduledPayments(prev =>
        prev.map(p => (p.id === payment.id ? { ...p, dueDate: nextDue, status: 'pendiente' } : p))
      );
    } else {
      setScheduledPayments(prev =>
        prev.map(p => (p.id === payment.id ? { ...p, status: 'ejecutado' } : p))
      );
    }
  };

  // Reparto de dividendos a socios
  const handleDistributeDividends = (
    distribution: { partnerId: string; partnerName: string; amount: number }[]
  ) => {
    const today = new Date().toISOString().slice(0, 10);

    const newTxs: Transaction[] = distribution.map(d => ({
      id: `tx-div-${d.partnerId}-${Date.now()}`,
      type: 'expense',
      fundType: 'moai_operativa',
      amount: d.amount,
      category: 'otros_gastos',
      date: today,
      description: `Reparto de dividendos socio ${d.partnerName}`,
      recipientOrPayer: d.partnerName,
      referenceNumber: `DIV-${Date.now().toString().slice(-5)}`,
      createdAt: Date.now()
    }));

    setTransactions(prev => [...newTxs, ...prev]);

    // Actualizar dividendos acumulados de cada socio
    setPartners(prev =>
      prev.map(p => {
        const found = distribution.find(d => d.partnerId === p.id);
        if (found) {
          return {
            ...p,
            totalDividendsPaid: p.totalDividendsPaid + found.amount
          };
        }
        return p;
      })
    );
  };

  // Exportar Excel y PDF
  const handleExportExcel = () => {
    exportTransactionsToExcel(transactions, companyProfile);
  };

  const handleExportPDF = () => {
    generateFinancialPDFReport({
      companyProfile,
      transactions,
      properties,
      budget,
      partners
    });
  };

  // Restaurar de fábrica
  const handleResetFactoryData = () => {
    localStorage.clear();
    setTransactions(INITIAL_TRANSACTIONS);
    setProperties(INITIAL_PROPERTIES);
    setScheduledPayments(INITIAL_SCHEDULED_PAYMENTS);
    setPartners(INITIAL_PARTNERS);
    setBudget(INITIAL_BUDGET);
    setCompanyProfile(INITIAL_COMPANY_PROFILE);
    fetch('/api/database', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        companyProfile: INITIAL_COMPANY_PROFILE,
        partners: INITIAL_PARTNERS,
        properties: INITIAL_PROPERTIES,
        transactions: INITIAL_TRANSACTIONS,
        scheduledPayments: INITIAL_SCHEDULED_PAYMENTS,
        budget: INITIAL_BUDGET
      })
    }).catch(() => {});
    alert('Datos restaurados a los parámetros iniciales de MOAI Inmobiliaria.');
  };

  // Cargar datos demo opcionales para pruebas
  const handleLoadDemoData = () => {
    setProperties(DEMO_SAMPLE_PROPERTIES);
    setTransactions(DEMO_SAMPLE_TRANSACTIONS);
    setScheduledPayments(DEMO_SAMPLE_SCHEDULED_PAYMENTS);
    alert('Datos de prueba cargados con éxito.');
  };

  // Vaciar completamente la base de datos a ceros
  const handleClearAllData = () => {
    setProperties([]);
    setTransactions([]);
    setScheduledPayments([]);
    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
    localStorage.removeItem(STORAGE_KEYS.PROPERTIES);
    localStorage.removeItem(STORAGE_KEYS.SCHEDULED_PAYMENTS);
    fetch('/api/database', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        companyProfile,
        partners,
        properties: [],
        transactions: [],
        scheduledPayments: [],
        budget
      })
    }).catch(() => {});
    alert('Base de datos vaciada a ceros. Lista para registrar movimientos reales.');
  };

  // Importar backup
  const handleImportData = (data: any) => {
    if (data.transactions) setTransactions(data.transactions);
    if (data.properties) setProperties(data.properties);
    if (data.scheduledPayments) setScheduledPayments(data.scheduledPayments);
    if (data.partners) setPartners(data.partners);
    if (data.budget) setBudget(data.budget);
    if (data.companyProfile) setCompanyProfile(data.companyProfile);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9fa] dark:bg-[#0f1013] text-[#1e2022] dark:text-[#f1f2f4] transition-colors duration-200">
      
      {/* Barra de Navegación Superior */}
      <Navbar
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        moaiBalance={balances.moaiBalance}
        custodyBalance={balances.custodyBalance}
        onExportPDF={handleExportPDF}
        onExportExcel={handleExportExcel}
        onOpenNewTransaction={() => {
          setEditingTransaction(null);
          setIsTransactionModalOpen(true);
        }}
        onOpenNewPayment={() => setActiveTab('calendar')}
        partners={partners}
        activePartner={activePartner}
        onChangePartner={handleChangePartner}
      />

      {/* Navegación por Pestañas */}
      <TabsNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        pendingDisbursementsCount={scheduledPayments.filter(p => p.status === 'pendiente').length}
      />

      {/* Contenido Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            transactions={transactions}
            properties={properties}
            budget={budget}
            scheduledPayments={scheduledPayments}
            activePartner={activePartner}
            onNavigateTab={setActiveTab}
            onOpenNewTransaction={() => {
              setEditingTransaction(null);
              setIsTransactionModalOpen(true);
            }}
            onOpenNewPayment={() => setActiveTab('calendar')}
            onExecutePayment={handleExecutePayment}
            onSubmitQuickMessage={(text) => {
              setQuickMessageForChat(text);
              setActiveTab('chat');
            }}
          />
        )}

        {activeTab === 'properties' && (
          <PropertiesView
            properties={properties}
            onAddProperty={() => {
              setEditingProperty(null);
              setIsPropertyModalOpen(true);
            }}
            onEditProperty={(prop) => {
              setEditingProperty(prop);
              setIsPropertyModalOpen(true);
            }}
            onGenerateLiquidation={handleGenerateLiquidation}
          />
        )}

        {activeTab === 'transactions' && (
          <TransactionsView
            transactions={transactions}
            onOpenAddModal={() => {
              setEditingTransaction(null);
              setIsTransactionModalOpen(true);
            }}
            onEditTransaction={(tx) => {
              setEditingTransaction(tx);
              setIsTransactionModalOpen(true);
            }}
            onDeleteTransaction={handleDeleteTransaction}
            onExportExcel={handleExportExcel}
            onExportPDF={handleExportPDF}
          />
        )}

        {activeTab === 'calendar' && (
          <CalendarView
            payments={scheduledPayments}
            onAddPayment={handleAddScheduledPayment}
            onUpdatePayment={handleUpdateScheduledPayment}
            onDeletePayment={handleDeleteScheduledPayment}
            onExecutePayment={handleExecutePayment}
            currentBalance={balances.moaiBalance}
          />
        )}

        {activeTab === 'budget' && (
          <BudgetView
            budget={budget}
            transactions={transactions}
            properties={properties}
            onUpdateBudget={setBudget}
          />
        )}

        {activeTab === 'partners' && (
          <PartnersView
            partners={partners}
            transactions={transactions}
            onDistributeDividends={handleDistributeDividends}
            onUpdatePartner={(p) => {
              setPartners(prev => prev.map(item => item.id === p.id ? p : item));
            }}
          />
        )}

        {activeTab === 'chat' && (
          <QuickChatView
            onAddTransaction={(tx) => {
              handleSaveTransaction(tx);
            }}
            onAddScheduledPayment={handleAddScheduledPayment}
            transactions={transactions}
            onOpenManualTransactionModal={() => {
              setEditingTransaction(null);
              setIsTransactionModalOpen(true);
            }}
            initialMessageToSend={quickMessageForChat}
            onClearInitialMessage={() => setQuickMessageForChat('')}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            companyProfile={companyProfile}
            onUpdateCompanyProfile={setCompanyProfile}
            onResetFactoryData={handleResetFactoryData}
            onLoadDemoData={handleLoadDemoData}
            onClearAllData={handleClearAllData}
            allData={{
              companyProfile,
              transactions,
              properties,
              scheduledPayments,
              budget,
              partners
            }}
            onImportData={handleImportData}
          />
        )}
      </main>

      {/* Modales Globales */}
      <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={() => {
          setIsTransactionModalOpen(false);
          setEditingTransaction(null);
        }}
        onSave={handleSaveTransaction}
        onDelete={handleDeleteTransaction}
        initialTransaction={editingTransaction}
        properties={properties}
      />

      <PropertyModal
        isOpen={isPropertyModalOpen}
        onClose={() => {
          setIsPropertyModalOpen(false);
          setEditingProperty(null);
        }}
        onSave={handleSaveProperty}
        initialProperty={editingProperty}
      />

    </div>
  );
}

export default App;
