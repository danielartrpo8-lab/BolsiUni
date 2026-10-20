/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * MOAI Inmobiliaria - Catálogo de Categorías Contables
 * Diseñado para la operación inmobiliaria en Medellín y Colombia:
 * Arrendamientos, comisiones de venta, recaudos de terceros y egresos operativos.
 */

import { CategoryId, CategoryInfo, MoaiExpenseCategory, MoaiIncomeCategory } from '../types';

export const MOAI_INCOME_CATEGORIES: Record<MoaiIncomeCategory, CategoryInfo> = {
  comision_arriendos: {
    id: 'comision_arriendos',
    name: 'Comisión Administración Arriendos',
    shortName: 'Comisión Arriendos',
    emoji: '🏢',
    color: '#e10b17', // MOAI Red
    bgLight: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/40',
    type: 'income',
    fundType: 'moai_operativa',
    description: 'Comisión de corretaje/administración (8% - 10%) retenida del canon'
  },
  comision_ventas: {
    id: 'comision_ventas',
    name: 'Comisión por Venta de Inmuebles',
    shortName: 'Comisión Ventas (3%)',
    emoji: '🤝',
    color: '#059669', // Emerald
    bgLight: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/40',
    type: 'income',
    fundType: 'moai_operativa',
    description: 'Honorarios por intermediación de compraventa (3% urbano)'
  },
  recaudo_canon: {
    id: 'recaudo_canon',
    name: 'Recaudo Canon de Arrendamiento',
    shortName: 'Recaudo Canon (Terceros)',
    emoji: '📥',
    color: '#2563eb', // Blue
    bgLight: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/40',
    type: 'income',
    fundType: 'custodia_propietarios',
    description: 'Canon bruto pagado por inquilino (fondo temporal en custodia para el propietario)'
  },
  servicio_reformas: {
    id: 'servicio_reformas',
    name: 'Servicios MOAI Reformas y Adecuaciones',
    shortName: 'Reformas MOAI',
    emoji: '🔨',
    color: '#d97706', // Amber
    bgLight: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/40',
    type: 'income',
    fundType: 'moai_operativa',
    description: 'Margen de obra en remodelaciones, acabados y diseño de espacios'
  },
  mantenimiento_locativo: {
    id: 'mantenimiento_locativo',
    name: 'Mantenimiento y Reparaciones Locativas',
    shortName: 'Mantenimientos',
    emoji: '🔧',
    color: '#0891b2', // Cyan
    bgLight: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-200 dark:border-cyan-900/40',
    type: 'income',
    fundType: 'moai_operativa',
    description: 'Gestión técnica y supervisión de arreglos en inmuebles administrados'
  },
  mudanzas_logistica: {
    id: 'mudanzas_logistica',
    name: 'Servicio MOAI Mudanzas',
    shortName: 'Mudanzas',
    emoji: '🚚',
    color: '#7c3aed', // Purple
    bgLight: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-900/40',
    type: 'income',
    fundType: 'moai_operativa',
    description: 'Logística de mudanza y empaque para clientes MOAI'
  },
  asesorias_legales: {
    id: 'asesorias_legales',
    name: 'Asesorías Jurídicas, Avalúos y Créditos',
    shortName: 'Asesorías & Avalúos',
    emoji: '⚖️',
    color: '#475569', // Slate
    bgLight: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800/40',
    type: 'income',
    fundType: 'moai_operativa',
    description: 'Estudios de títulos, avalúos comerciales y consultoría legal'
  },
  anticipo_canones: {
    id: 'anticipo_canones',
    name: 'Rendimiento Anticipo de Cánones',
    shortName: 'Anticipos Cánones',
    emoji: '💰',
    color: '#16a34a', // Green
    bgLight: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-200 dark:border-green-900/40',
    type: 'income',
    fundType: 'moai_operativa',
    description: 'Comisión y tasa de liquidez por adelantar arriendos a propietarios'
  },
  otros_ingresos: {
    id: 'otros_ingresos',
    name: 'Otros Ingresos Inmobiliarios',
    shortName: 'Otros Ingresos',
    emoji: '✨',
    color: '#6b7280', // Gray
    bgLight: 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-800/40',
    type: 'income',
    fundType: 'moai_operativa',
    description: 'Intereses bancarios, penalidades de contrato o ingresos varios'
  }
};

export const MOAI_EXPENSE_CATEGORIES: Record<MoaiExpenseCategory, CategoryInfo> = {
  dispersion_propietarios: {
    id: 'dispersion_propietarios',
    name: 'Dispersión / Giro a Propietarios',
    shortName: 'Giro a Propietarios',
    emoji: '📤',
    color: '#dc2626', // Red
    bgLight: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/40',
    type: 'expense',
    fundType: 'custodia_propietarios',
    description: 'Transferencia neta de cánones a cuentas de dueños de inmuebles'
  },
  comisiones_asesores: {
    id: 'comisiones_asesores',
    name: 'Comisiones a Asesores y Captadores',
    shortName: 'Comisiones Asesores',
    emoji: '💼',
    color: '#ea580c', // Orange
    bgLight: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-900/40',
    type: 'expense',
    fundType: 'moai_operativa',
    description: 'Pagos variables al equipo comercial por contratos cerrados'
  },
  portales_marketing: {
    id: 'portales_marketing',
    name: 'Portales Inmobiliarios y Pauta',
    shortName: 'Marketing & Portales',
    emoji: '📢',
    color: '#8b5cf6', // Violet
    bgLight: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-200 dark:border-violet-900/40',
    type: 'expense',
    fundType: 'moai_operativa',
    description: 'Finca Raíz, Ciencuadras, Metrocuadrado, Meta Ads y Google Ads'
  },
  polizas_fianzas: {
    id: 'polizas_fianzas',
    name: 'Pólizas Colectivas y Fianzas',
    shortName: 'Pólizas Aseguradoras',
    emoji: '🛡️',
    color: '#0284c7', // Sky
    bgLight: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-200 dark:border-sky-900/40',
    type: 'expense',
    fundType: 'moai_operativa',
    description: 'Pagos a aseguradoras (El Libertador, Unifianza, FianzaCrédito)'
  },
  mantenimientos_inmuebles: {
    id: 'mantenimientos_inmuebles',
    name: 'Mantenimientos y Reparaciones',
    shortName: 'Mantenimiento Inmuebles',
    emoji: '🛠️',
    color: '#0d9488', // Teal
    bgLight: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-200 dark:border-teal-900/40',
    type: 'expense',
    fundType: 'moai_operativa',
    description: 'Facturas de fontaneros, electricistas y técnicos locativos'
  },
  administracion_ph: {
    id: 'administracion_ph',
    name: 'Pago Cuotas Administración (PH)',
    shortName: 'Administración Edificios',
    emoji: '🏢',
    color: '#6366f1', // Indigo
    bgLight: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900/40',
    type: 'expense',
    fundType: 'custodia_propietarios',
    description: 'Cuotas ordinarias de copropiedades pagadas en nombre del propietario'
  },
  oficina_servicios: {
    id: 'oficina_servicios',
    name: 'Oficina y Servicios Públicos',
    shortName: 'Oficina Medellín',
    emoji: '📍',
    color: '#64748b', // Slate
    bgLight: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800/40',
    type: 'expense',
    fundType: 'moai_operativa',
    description: 'Sede Calle 32C # 80A 45, internet fibra óptica, café y servicios EPM'
  },
  nomina_seguridad_social: {
    id: 'nomina_seguridad_social',
    name: 'Nómina y Seguridad Social',
    shortName: 'Nómina & Seguridad Social',
    emoji: '👥',
    color: '#059669', // Emerald
    bgLight: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/40',
    type: 'expense',
    fundType: 'moai_operativa',
    description: 'Sueldos fijos administrativos y aportes a EPS, pensión y ARL'
  },
  software_tecnologia: {
    id: 'software_tecnologia',
    name: 'Software, CRM y Tecnología',
    shortName: 'Software & CRM',
    emoji: '💻',
    color: '#3b82f6', // Blue
    bgLight: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/40',
    type: 'expense',
    fundType: 'moai_operativa',
    description: 'Herramientas de IA, CRM inmobiliario, servidores y licencias'
  },
  impuestos_tributario: {
    id: 'impuestos_tributario',
    name: 'Impuestos y Retenciones (DIAN/Medellín)',
    shortName: 'Impuestos & ICA',
    emoji: '🏛️',
    color: '#e11d48', // Rose
    bgLight: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/40',
    type: 'expense',
    fundType: 'moai_operativa',
    description: 'ICA Medellín, IVA bimestral a la DIAN, retenciones fiscales'
  },
  honorarios_profesionales: {
    id: 'honorarios_profesionales',
    name: 'Honorarios Contables y Jurídicos',
    shortName: 'Contador & Abogados',
    emoji: '📜',
    color: '#78716c', // Stone
    bgLight: 'bg-stone-500/10 text-stone-600 dark:text-stone-400 border-stone-200 dark:border-stone-800/40',
    type: 'expense',
    fundType: 'moai_operativa',
    description: 'Honorarios de contador público, revisoría y asesoría notarial'
  },
  otros_gastos: {
    id: 'otros_gastos',
    name: 'Otros Gastos Operativos',
    shortName: 'Gastos Varios',
    emoji: '📦',
    color: '#94a3b8', // Light Slate
    bgLight: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800/40',
    type: 'expense',
    fundType: 'moai_operativa',
    description: 'Papelería, gastos bancarios, parqueaderos y cajas menores'
  }
};

export const ALL_MOAI_CATEGORIES: Record<CategoryId, CategoryInfo> = {
  ...MOAI_INCOME_CATEGORIES,
  ...MOAI_EXPENSE_CATEGORIES
};

export function getCategoryInfo(categoryId: CategoryId): CategoryInfo {
  return ALL_MOAI_CATEGORIES[categoryId] || {
    id: categoryId,
    name: categoryId,
    shortName: categoryId,
    emoji: '🏷️',
    color: '#64748b',
    bgLight: 'bg-slate-500/10 text-slate-600 border-slate-200',
    type: 'expense',
    fundType: 'moai_operativa',
    description: 'Movimiento contable'
  };
}

// Mapeador de lenguaje natural (Claude & offline parser) a Categorías MOAI
export function mapNaturalLanguageCategoryToId(rawCat: string, movementType?: 'income' | 'expense'): CategoryId {
  const norm = (rawCat || '').toLowerCase().trim();

  // Ingresos
  if (norm.includes('comision') && (norm.includes('arriend') || norm.includes('alquiler') || norm.includes('renta'))) {
    return 'comision_arriendos';
  }
  if (norm.includes('venta') || norm.includes('corretaje') || norm.includes('escritur')) {
    return 'comision_ventas';
  }
  if (norm.includes('canon') || norm.includes('recaudo') || norm.includes('arriendo pagado') || norm.includes('pago de arriendo')) {
    return 'recaudo_canon';
  }
  if (norm.includes('reforma') || norm.includes('remodel') || norm.includes('obra')) {
    return 'servicio_reformas';
  }
  if (norm.includes('mudanza') || norm.includes('trasteo')) {
    return 'mudanzas_logistica';
  }
  if (norm.includes('asesor') || norm.includes('legal') || norm.includes('aval') || norm.includes('titulo')) {
    return 'asesorias_legales';
  }
  if (norm.includes('anticipo')) {
    return 'anticipo_canones';
  }

  // Egresos
  if (norm.includes('dispersion') || norm.includes('propietario') || norm.includes('giro') || norm.includes('dueno')) {
    return 'dispersion_propietarios';
  }
  if (norm.includes('asesor') || norm.includes('captador') || norm.includes('comision vendedor')) {
    return 'comisiones_asesores';
  }
  if (norm.includes('finca raiz') || norm.includes('ciencuadras') || norm.includes('portal') || norm.includes('pauta') || norm.includes('marketing') || norm.includes('publicidad') || norm.includes('meta')) {
    return 'portales_marketing';
  }
  if (norm.includes('poliza') || norm.includes('libertador') || norm.includes('fianza') || norm.includes('seguro')) {
    return 'polizas_fianzas';
  }
  if (norm.includes('mantenimiento') || norm.includes('plomer') || norm.includes('pintura') || norm.includes('reparaci') || norm.includes('arreglo') || norm.includes('fuga')) {
    return movementType === 'income' ? 'mantenimiento_locativo' : 'mantenimientos_inmuebles';
  }
  if (norm.includes('ph') || norm.includes('copropiedad') || norm.includes('edificio') || norm.includes('administracion ph')) {
    return 'administracion_ph';
  }
  if (norm.includes('oficina') || norm.includes('epm') || norm.includes('servicios') || norm.includes('sede')) {
    return 'oficina_servicios';
  }
  if (norm.includes('nomina') || norm.includes('sueldo') || norm.includes('salario') || norm.includes('arl') || norm.includes('eps')) {
    return 'nomina_seguridad_social';
  }
  if (norm.includes('crm') || norm.includes('software') || norm.includes('hosting') || norm.includes('tecnolog') || norm.includes('licencia')) {
    return 'software_tecnologia';
  }
  if (norm.includes('dian') || norm.includes('ica') || norm.includes('iva') || norm.includes('impuesto') || norm.includes('rete')) {
    return 'impuestos_tributario';
  }
  if (norm.includes('contador') || norm.includes('honorario') || norm.includes('revisor') || norm.includes('abogado')) {
    return 'honorarios_profesionales';
  }

  return movementType === 'income' ? 'otros_ingresos' : 'otros_gastos';
}
