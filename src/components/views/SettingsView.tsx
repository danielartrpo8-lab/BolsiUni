/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * MOAI Inmobiliaria - Vista de Configuración y Parámetros
 * Datos de la empresa (Medellín), guía de despliegue en GitHub Codespaces (daniagudelo06),
 * configuración de ANTHROPIC_API_KEY para Claude y gestión de backups.
 */

import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Key, 
  Github, 
  Terminal, 
  Download, 
  Upload, 
  RotateCcw, 
  CheckCircle2, 
  ExternalLink,
  ShieldCheck,
  Save
} from 'lucide-react';
import { CompanyProfile, BudgetConfig, Property, ScheduledPayment, Transaction, Partner } from '../../types';

interface SettingsViewProps {
  companyProfile: CompanyProfile;
  onUpdateCompanyProfile: (profile: CompanyProfile) => void;
  onResetFactoryData: () => void;
  onLoadDemoData?: () => void;
  onClearAllData?: () => void;
  allData: {
    companyProfile: CompanyProfile;
    transactions: Transaction[];
    properties: Property[];
    scheduledPayments: ScheduledPayment[];
    budget: BudgetConfig;
    partners: Partner[];
  };
  onImportData: (data: any) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  companyProfile,
  onUpdateCompanyProfile,
  onResetFactoryData,
  onLoadDemoData,
  onClearAllData,
  allData,
  onImportData
}) => {
  const [profileForm, setProfileForm] = useState<CompanyProfile>(companyProfile);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateCompanyProfile(profileForm);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // Exportar backup en JSON
  const handleExportJSON = () => {
    const jsonStr = JSON.stringify(allData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `moai_inmobiliaria_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Importar backup
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.transactions || parsed.properties) {
          onImportData(parsed);
          alert('¡Datos de MOAI Inmobiliaria importados exitosamente!');
        } else {
          alert('El archivo no contiene un formato válido de MOAI Inmobiliaria.');
        }
      } catch (err) {
        alert('Error al leer el archivo JSON.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#15171c] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-[#e10b17] uppercase tracking-wider">
              Configuración del Sistema
            </span>
            <span className="text-gray-300 dark:text-gray-700">•</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              MOAI Inmobiliaria S.A.S.
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white font-heading tracking-tight">
            Parámetros de la Empresa & GitHub
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Datos fiscales en Medellín, comisiones por defecto, conexión con Claude y guía para GitHub Codespaces.
          </p>
        </div>

        <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 text-[#e10b17] flex items-center justify-center font-bold text-xl">
          M
        </div>
      </div>

      {/* Guía Especial: Cómo levantar en GitHub Codespaces (daniagudelo06) */}
      <div className="bg-gradient-to-br from-gray-900 via-[#181a20] to-black text-white p-6 rounded-2xl border border-gray-800 shadow-md space-y-4">
        <div className="flex items-center gap-2.5">
          <Github className="w-5 h-5 text-red-500" />
          <h3 className="font-bold text-base text-white font-heading">
            Cómo levantar esta app desde tu fork en Codespaces (<span className="text-red-400 font-mono">daniagudelo06</span>)
          </h3>
        </div>

        <p className="text-xs text-gray-300 leading-relaxed">
          Ya que tienes el fork en tu cuenta de GitHub, sigue estos 3 sencillos pasos para correr el servidor de MOAI Inmobiliaria en Codespaces:
        </p>

        <div className="space-y-2.5 text-xs font-mono">
          <div className="bg-black/60 p-3 rounded-xl border border-gray-800">
            <span className="text-gray-400 block mb-1 text-[11px] font-sans font-semibold">1. Instalar dependencias en la terminal:</span>
            <code className="text-emerald-400">npm install</code>
          </div>

          <div className="bg-black/60 p-3 rounded-xl border border-gray-800">
            <span className="text-gray-400 block mb-1 text-[11px] font-sans font-semibold">2. Configurar la clave de Claude (Anthropic):</span>
            <p className="text-gray-400 font-sans text-[11px] mb-1">
              Copia el archivo de ejemplo o edita <code className="text-yellow-400">.env</code>:
            </p>
            <code className="text-yellow-400 block">ANTHROPIC_API_KEY=sk-ant-api03-tu-clave-aqui</code>
            <p className="text-[11px] text-gray-400 font-sans mt-1">
              (Si no colocas la clave todavía, ¡no te preocupes! El parser heurístico colombiano de MOAI funciona 100% offline para registrar todos los movimientos).
            </p>
          </div>

          <div className="bg-black/60 p-3 rounded-xl border border-gray-800">
            <span className="text-gray-400 block mb-1 text-[11px] font-sans font-semibold">3. Iniciar el servidor contable:</span>
            <code className="text-emerald-400">npm run dev</code>
            <p className="text-gray-400 font-sans text-[11px] mt-1">
              Abre el puerto 3000 y verás la suite completa lista para los socios.
            </p>
          </div>
        </div>
      </div>

      {/* Formulario Perfil Corporativo MOAI */}
      <form onSubmit={handleSaveProfile} className="bg-white dark:bg-[#15171c] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs space-y-4">
        <h3 className="font-bold text-base text-gray-900 dark:text-white font-heading">
          Ficha Fiscal de MOAI Inmobiliaria S.A.S.
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="text-gray-500 block mb-1 font-semibold">Razón Social:</label>
            <input
              type="text"
              value={profileForm.name}
              onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
              className="w-full bg-gray-50 dark:bg-[#1c1f26] border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm text-gray-900 dark:text-white font-medium"
            />
          </div>

          <div>
            <label className="text-gray-500 block mb-1 font-semibold">NIT:</label>
            <input
              type="text"
              value={profileForm.nit}
              onChange={(e) => setProfileForm({ ...profileForm, nit: e.target.value })}
              className="w-full bg-gray-50 dark:bg-[#1c1f26] border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm font-mono text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="text-gray-500 block mb-1 font-semibold">Dirección Sede Medellín:</label>
            <input
              type="text"
              value={profileForm.address}
              onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
              className="w-full bg-gray-50 dark:bg-[#1c1f26] border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="text-gray-500 block mb-1 font-semibold">Ciudad / Departamento:</label>
            <input
              type="text"
              value={profileForm.city}
              onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
              className="w-full bg-gray-50 dark:bg-[#1c1f26] border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="text-gray-500 block mb-1 font-semibold">WhatsApp / Teléfono:</label>
            <input
              type="text"
              value={profileForm.phone}
              onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
              className="w-full bg-gray-50 dark:bg-[#1c1f26] border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm font-mono text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="text-gray-500 block mb-1 font-semibold">Correo Electrónico:</label>
            <input
              type="email"
              value={profileForm.email}
              onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
              className="w-full bg-gray-50 dark:bg-[#1c1f26] border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="text-gray-500 block mb-1 font-semibold">Sitio Web Oficial:</label>
            <input
              type="text"
              value={profileForm.website}
              onChange={(e) => setProfileForm({ ...profileForm, website: e.target.value })}
              className="w-full bg-gray-50 dark:bg-[#1c1f26] border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="text-gray-500 block mb-1 font-semibold">% Comisión Estándar Arriendos:</label>
            <input
              type="number"
              value={profileForm.defaultCommissionRate}
              onChange={(e) => setProfileForm({ ...profileForm, defaultCommissionRate: Number(e.target.value) })}
              className="w-full bg-gray-50 dark:bg-[#1c1f26] border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm font-mono text-gray-900 dark:text-white"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
          {savedSuccess ? (
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
              ✓ Parámetros guardados con éxito
            </span>
          ) : <div />}

          <button
            type="submit"
            className="flex items-center gap-1.5 bg-[#e10b17] hover:bg-[#c00510] text-white px-5 py-2 rounded-xl text-xs font-bold shadow-xs transition-all active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>Guardar Parámetros</span>
          </button>
        </div>
      </form>

      {/* Copias de Seguridad y Datos */}
      <div className="bg-white dark:bg-[#15171c] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs space-y-4">
        <h3 className="font-bold text-base text-gray-900 dark:text-white font-heading">
          Gestión de Datos & Copias de Seguridad
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            onClick={handleExportJSON}
            className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 dark:bg-[#1f2229] dark:hover:bg-[#282c35] text-gray-800 dark:text-gray-200 p-3 rounded-xl text-xs font-semibold border border-gray-200 dark:border-gray-700/80 transition-colors"
          >
            <Download className="w-4 h-4 text-blue-600" />
            <span>Descargar Copia JSON</span>
          </button>

          <label className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 dark:bg-[#1f2229] dark:hover:bg-[#282c35] text-gray-800 dark:text-gray-200 p-3 rounded-xl text-xs font-semibold border border-gray-200 dark:border-gray-700/80 transition-colors cursor-pointer">
            <Upload className="w-4 h-4 text-emerald-600" />
            <span>Importar Copia JSON</span>
            <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
          </label>

          <button
            onClick={() => {
              if (window.confirm('¿Deseas vaciar completamente todos los movimientos, inmuebles y pagos para iniciar desde cero?')) {
                onClearAllData?.();
              }
            }}
            className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 dark:bg-[#1f2229] dark:hover:bg-[#282c35] text-gray-800 dark:text-gray-200 p-3 rounded-xl text-xs font-semibold border border-gray-200 dark:border-gray-700/80 transition-colors"
          >
            <RotateCcw className="w-4 h-4 text-gray-500" />
            <span>Vaciar a Ceros (Limpio)</span>
          </button>

          <button
            onClick={() => {
              if (window.confirm('¿Deseas cargar datos de prueba para ver el funcionamiento con ejemplos?')) {
                onLoadDemoData?.();
              }
            }}
            className="flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-950/60 text-[#e10b17] p-3 rounded-xl text-xs font-semibold border border-red-200 dark:border-red-900/40 transition-colors"
          >
            <Building2 className="w-4 h-4" />
            <span>Cargar Ejemplos Demo</span>
          </button>
        </div>
      </div>

    </div>
  );
};
