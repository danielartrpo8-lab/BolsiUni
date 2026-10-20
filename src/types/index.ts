/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * MOAI Inmobiliaria - Tipos y Modelos de Datos
 * Sistema de gestión contable, presupuestal, liquidación de cánones y control de socios.
 */

export type MovementType = 'income' | 'expense';

// Tipo de fondo contable: clave para separar los fondos propios de la inmobiliaria de los de terceros
export type FundType = 'moai_operativa' | 'custodia_propietarios';

// Categorías de ingresos de MOAI Inmobiliaria
export type MoaiIncomeCategory =
  | 'comision_arriendos'     // Comisión de administración de arriendos (8% - 10%)
  | 'comision_ventas'        // Comisión por venta / corretaje (3% comercial)
  | 'recaudo_canon'          // Recaudo bruto de canon (Fondo de terceros)
  | 'servicio_reformas'      // Línea MOAI Reformas y adecuaciones
  | 'mantenimiento_locativo' // Reparaciones y mantenimientos con margen
  | 'mudanzas_logistica'     // Servicio MOAI Mudanzas
  | 'asesorias_legales'      // Asesorías jurídicas, avalúos y estudios
  | 'anticipo_canones'       // Rendimiento por anticipo de cánones
  | 'otros_ingresos';        // Otros ingresos comerciales

// Categorías de egresos de MOAI Inmobiliaria
export type MoaiExpenseCategory =
  | 'dispersion_propietarios' // Giro neto de canon al propietario
  | 'comisiones_asesores'     // Pago de comisión a asesores/captadores
  | 'portales_marketing'      // Finca Raíz, Ciencuadras, Meta Ads, Google
  | 'polizas_fianzas'         // Pólizas colectivas (El Libertador, Unifianza)
  | 'mantenimientos_inmuebles'// Pago a técnicos/contratistas de reparaciones
  | 'administracion_ph'       // Pago cuotas de administración de copropiedades
  | 'oficina_servicios'       // Sede Medellín (Calle 32C # 80A 45) y servicios
  | 'nomina_seguridad_social' // Salarios de planta y seguridad social
  | 'software_tecnologia'     // CRM, hosting, dominios, licencias
  | 'impuestos_tributario'    // ICA Medellín, IVA bimestral, Retefuente
  | 'honorarios_profesionales'// Contador, revisor fiscal, abogados
  | 'otros_gastos';           // Gastos varios

export type CategoryId = MoaiIncomeCategory | MoaiExpenseCategory;

export interface CategoryInfo {
  id: CategoryId;
  name: string;
  shortName: string;
  emoji: string;
  color: string;
  bgLight: string;
  type: MovementType;
  fundType: FundType;
  description: string;
}

// Inmueble administrado por MOAI
export type PropertyType = 'apartamento' | 'casa' | 'local' | 'oficina' | 'bodega' | 'lote';
export type PropertyStatus = 'arrendado' | 'disponible' | 'en_venta' | 'en_reforma';

export interface Property {
  id: string;
  code: string;            // Ej: MOAI-APT-402
  title: string;           // Ej: Apto 402 Edificio Laureles Real
  address: string;         // Ej: Circular 4 # 73-20
  neighborhood: string;    // Ej: Laureles, El Poblado, Envigado, Belén
  city: string;            // Medellín, Envigado, Sabaneta, Itagüí, Rionegro
  type: PropertyType;
  status: PropertyStatus;
  monthlyRent: number;     // Canon mensual en COP
  adminFee: number;        // Cuota administración copropiedad (PH) en COP
  commissionRate: number;  // Porcentaje comisión MOAI (ej: 8 o 10)
  ivaOnCommission: boolean;// Si aplica IVA 19% sobre la comisión de corretaje
  
  // Datos del Propietario para dispersión bancaria
  ownerName: string;
  ownerDocument: string;
  ownerBank: string;
  ownerAccountType: 'ahorros' | 'corriente';
  ownerAccountNumber: string;
  ownerEmail: string;
  ownerPhone: string;

  // Datos del Inquilino
  tenantName?: string;
  tenantDocument?: string;
  tenantPhone?: string;
  paymentDueDay: number;   // Día del mes en que vence el pago (ej: 5)

  // Respaldo de póliza o fianza
  insuranceCompany: 'El Libertador' | 'Unifianza' | 'FianzaCrédito' | 'Sura' | 'Directa' | 'Ninguna';
  policyNumber?: string;
}

// Movimiento contable registrado
export interface Transaction {
  id: string;
  type: MovementType;
  fundType: FundType;
  amount: number;          // Monto en COP
  category: CategoryId;
  date: string;            // Formato YYYY-MM-DD
  description: string;
  propertyId?: string;     // Inmueble asociado (si aplica)
  propertyCode?: string;
  recipientOrPayer?: string; // Nombre del propietario, inquilino, proveedor o asesor
  referenceNumber?: string; // Número de comprobante o factura
  createdAt: number;
}

// Liquidación mensual de canon para un propietario
export interface RentLiquidation {
  id: string;
  propertyId: string;
  propertyCode: string;
  propertyAddress: string;
  ownerName: string;
  month: string;           // Ej: "Octubre 2026"
  grossRent: number;       // Canon bruto cobrado
  commissionRate: number;  // % Comisión MOAI
  commissionAmount: number;// Comisión bruta en COP
  ivaAmount: number;       // IVA sobre comisión (19%)
  totalMoaiFee: number;    // Comisión + IVA
  adminFeeDeduction: number; // Pago administración edificio deducido
  repairsDeduction: number;  // Mantenimientos o reparaciones deducidos
  netDisbursement: number;   // Neto transferido al propietario
  dateGenerated: string;
  status: 'pendiente_recaudo' | 'recaudado_custodia' | 'dispersado_propietario';
  notes?: string;
}

// Pagos y Cobros Programados en Calendario
export type PaymentRecurrence = 'ninguna' | 'quincenal' | 'mensual' | 'anual';
export type ScheduledEventType = 
  | 'cobro_canon' 
  | 'dispersion_propietario' 
  | 'pago_poliza' 
  | 'pago_administracion' 
  | 'nomina_comision' 
  | 'impuesto_dian_ica' 
  | 'servicio_general';

export interface ScheduledPayment {
  id: string;
  title: string;
  amount: number;
  category: string;
  categoryId: CategoryId;
  eventType: ScheduledEventType;
  dueDate: string;          // YYYY-MM-DD
  recurrence: PaymentRecurrence;
  reminderDaysBefore: number;
  status: 'pendiente' | 'ejecutado' | 'vencido';
  propertyId?: string;
  propertyCode?: string;
  beneficiary: string;
  notes?: string;
}

// Estructura de Socios de MOAI Inmobiliaria
export interface Partner {
  id: string;
  name: string;
  role: string;
  document: string;
  email: string;
  sharePercentage: number;   // Ej: 33.34%
  initialCapital: number;    // Aporte inicial en COP
  totalDividendsPaid: number;// Total utilidades retiradas
  avatarUrl?: string;
}

// Configuración presupuestal
export interface BudgetConfig {
  monthlyIncomeTarget: number;  // Meta comisiones y servicios MOAI
  monthlyExpenseLimit: number;  // Límite gastos operativos propios MOAI
  categoryLimits: Record<MoaiExpenseCategory, number>;
  categoryTargets: Record<MoaiIncomeCategory, number>;
  annualSalesTarget: number;    // Meta de comisiones por ventas inmobiliarias
  targetLeasedProperties: number;// Meta de inmuebles en administración
}

// Perfil de la empresa MOAI
export interface CompanyProfile {
  name: string;
  nit: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  website: string;
  defaultCommissionRate: number; // Por defecto 8 o 10
  defaultIvaEnabled: boolean;
  legalReserveRate: number;      // 10% según código de comercio en Colombia
}

// Navegación de pestañas
export type ActiveTab =
  | 'dashboard'     // Métricas ejecutivas y caja
  | 'properties'    // Cartera de inmuebles y liquidación
  | 'transactions'  // Registro diario contable
  | 'calendar'      // Programación de fechas y pagos
  | 'budget'        // Presupuestos y metas
  | 'partners'      // Módulo de socios y distribución
  | 'chat'          // Registro rápido con Claude / Voz
  | 'settings';     // Configuración general

// Mensajes y herramientas para el Asistente Claude
export interface QuickChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: number;
  tools?: ClaudeToolCall[];
}

export interface ClaudeToolCall {
  id: string;
  toolName: 'registrar_movimiento' | 'programar_pago' | 'liquidar_canon' | 'pedir_aclaracion';
  parameters: any;
  status?: 'pending' | 'saved' | 'discarded';
}
