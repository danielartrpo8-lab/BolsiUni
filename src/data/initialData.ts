/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * MOAI Inmobiliaria - Datos Iniciales y Configuración Base
 * Inicia completamente en ceros para registrar operaciones reales desde el día 1.
 */

import { BudgetConfig, CompanyProfile, Partner, Property, ScheduledPayment, Transaction } from '../types';

export const INITIAL_COMPANY_PROFILE: CompanyProfile = {
  name: 'MOAI Inmobiliaria S.A.S.',
  nit: '901.845.210-4',
  address: 'Calle 32C # 80A - 45',
  city: 'Medellín, Antioquia',
  phone: '+57 (305) 233-2242',
  email: 'contacto@inmobiliariamoai.com',
  website: 'https://www.inmobiliariamoai.com',
  defaultCommissionRate: 10, // 10% estándar en Medellín
  defaultIvaEnabled: true,   // 19% IVA sobre la comisión
  legalReserveRate: 10       // 10% reserva legal en Colombia
};

export const INITIAL_PARTNERS: Partner[] = [
  {
    id: 'partner-1',
    name: 'Andrés Ferro',
    role: 'Socio Fundador & Dirección Estratégica',
    document: 'CC 1.017.240.890',
    email: 'andres.ferro@inmobiliariamoai.com',
    sharePercentage: 34.0,
    initialCapital: 0,
    totalDividendsPaid: 0,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'partner-2',
    name: 'Juan Pablo Villegas',
    role: 'Socio Fundador & Dirección de Operaciones',
    document: 'CC 1.020.480.123',
    email: 'juanpablo.villegas@inmobiliariamoai.com',
    sharePercentage: 33.0,
    initialCapital: 0,
    totalDividendsPaid: 0,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'partner-3',
    name: 'Simón Ibarra Zuluaga',
    role: 'Socio Fundador & Dirección Jurídica y Comercial',
    document: 'CC 1.037.605.991',
    email: 'simon.ibarra@inmobiliariamoai.com',
    sharePercentage: 33.0,
    initialCapital: 0,
    totalDividendsPaid: 0,
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
  }
];

// INICIA EN CEROS: Cartera vacía para que el usuario registre sus inmuebles reales
export const INITIAL_PROPERTIES: Property[] = [];

// INICIA EN CEROS: Libro diario vacío para registrar los movimientos reales
export const INITIAL_TRANSACTIONS: Transaction[] = [];

// INICIA EN CEROS: Calendario vacío para programar los pagos reales
export const INITIAL_SCHEDULED_PAYMENTS: ScheduledPayment[] = [];

export const INITIAL_BUDGET: BudgetConfig = {
  monthlyIncomeTarget: 30000000,   // Meta configurable en COP
  monthlyExpenseLimit: 12000000,   // Techo configurable en COP
  annualSalesTarget: 100000000,    // Meta anual de ventas
  targetLeasedProperties: 30,      // Meta de captaciones
  categoryTargets: {
    comision_arriendos: 15000000,
    comision_ventas: 10000000,
    recaudo_canon: 0,
    servicio_reformas: 3000000,
    mantenimiento_locativo: 1000000,
    mudanzas_logistica: 500000,
    asesorias_legales: 500000,
    anticipo_canones: 0,
    otros_ingresos: 0
  },
  categoryLimits: {
    dispersion_propietarios: 0,
    comisiones_asesores: 4000000,
    portales_marketing: 2000000,
    polizas_fianzas: 800000,
    mantenimientos_inmuebles: 600000,
    administracion_ph: 0,
    oficina_servicios: 2000000,
    nomina_seguridad_social: 2000000,
    software_tecnologia: 500000,
    impuestos_tributario: 1000000,
    honorarios_profesionales: 600000,
    otros_gastos: 300000
  }
};

// Datos de demostración opcionales (por si el usuario desea cargar un ejemplo de prueba)
export const DEMO_SAMPLE_PROPERTIES: Property[] = [
  {
    id: 'demo-prop-1',
    code: 'MOAI-APT-402',
    title: 'Apartamento 402 - Laureles Nogal',
    address: 'Circular 4 # 73-20, Laureles',
    neighborhood: 'Laureles',
    city: 'Medellín',
    type: 'apartamento',
    status: 'arrendado',
    monthlyRent: 2600000,
    adminFee: 320000,
    commissionRate: 10,
    ivaOnCommission: true,
    ownerName: 'Martha Lucía Gómez',
    ownerDocument: 'CC 43.560.120',
    ownerBank: 'Bancolombia',
    ownerAccountType: 'ahorros',
    ownerAccountNumber: '031-892401-22',
    ownerEmail: 'martha.gomez@gmail.com',
    ownerPhone: '310 445 8920',
    tenantName: 'Santiago Restrepo',
    tenantPhone: '301 789 2311',
    paymentDueDay: 5,
    insuranceCompany: 'El Libertador',
    policyNumber: 'LIB-2026-9041'
  },
  {
    id: 'demo-prop-2',
    code: 'MOAI-CAS-108',
    title: 'Casa Campestre - Las Palmas',
    address: 'Km 7 Vía Las Palmas, Envigado',
    neighborhood: 'Las Palmas',
    city: 'Envigado',
    type: 'casa',
    status: 'arrendado',
    monthlyRent: 6500000,
    adminFee: 680000,
    commissionRate: 8,
    ivaOnCommission: true,
    ownerName: 'Inversiones El Prado S.A.S.',
    ownerDocument: 'NIT 900.540.320-1',
    ownerBank: 'Davivienda',
    ownerAccountType: 'corriente',
    ownerAccountNumber: '450-019283-90',
    ownerEmail: 'gerencia@elprado.com.co',
    ownerPhone: '315 882 1040',
    tenantName: 'Clínica Dental del Sur',
    tenantPhone: '320 540 9988',
    paymentDueDay: 5,
    insuranceCompany: 'Unifianza',
    policyNumber: 'UNI-2026-4412'
  }
];

export const DEMO_SAMPLE_TRANSACTIONS: Transaction[] = [
  {
    id: 'demo-tx-1',
    type: 'income',
    fundType: 'custodia_propietarios',
    amount: 2600000,
    category: 'recaudo_canon',
    date: '2026-10-05',
    description: 'Recaudo canon mensual Apto 402 Laureles',
    propertyCode: 'MOAI-APT-402',
    recipientOrPayer: 'Santiago Restrepo',
    referenceNumber: 'REC-2026-101',
    createdAt: Date.now() - 15 * 86400000
  },
  {
    id: 'demo-tx-2',
    type: 'income',
    fundType: 'moai_operativa',
    amount: 309400,
    category: 'comision_arriendos',
    date: '2026-10-05',
    description: 'Comisión administración canon Apto 402 Laureles (10% + IVA)',
    propertyCode: 'MOAI-APT-402',
    recipientOrPayer: 'MOAI Inmobiliaria S.A.S.',
    referenceNumber: 'COM-2026-101',
    createdAt: Date.now() - 15 * 86400000
  }
];

export const DEMO_SAMPLE_SCHEDULED_PAYMENTS: ScheduledPayment[] = [
  {
    id: 'demo-sch-1',
    title: 'Recaudo Canon Apto 402 Laureles',
    amount: 2600000,
    category: 'Recaudo Canon',
    categoryId: 'recaudo_canon',
    eventType: 'cobro_canon',
    dueDate: '2026-11-05',
    recurrence: 'mensual',
    reminderDaysBefore: 2,
    status: 'pendiente',
    propertyCode: 'MOAI-APT-402',
    beneficiary: 'Santiago Restrepo (Inquilino)',
    notes: 'Día 5 de cada mes'
  }
];
