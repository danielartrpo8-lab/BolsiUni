/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Vista de Configuración
 * - Configuración de API Key de Gemini (guardada 100% en localStorage).
 * - Enlace a https://aistudio.google.com/apikey con guía paso a paso gratuita.
 * - Prueba de conexión con la IA.
 * - Gestión de datos (Restablecer datos de ejemplo, Borrar todo, Exportar/Importar JSON).
 * - Perfil de estudiante universitario.
 */

import React, { useState } from 'react';
import { 
  Key, 
  ExternalLink, 
  Check, 
  Trash2, 
  RotateCcw, 
  Download, 
  Upload, 
  Eye, 
  EyeOff, 
  User, 
  ShieldCheck, 
  Sparkles,
  Info,
  Building,
  GraduationCap
} from 'lucide-react';
import { BudgetConfig, SavingsGoal, Transaction, UserProfile } from '../../types';
import { saveStoredApiKey, removeStoredApiKey, testApiKey } from '../../services/gemini';

interface SettingsViewProps {
  apiKey: string;
  onApiKeyChange: (newKey: string) => void;
  userProfile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
  onResetSampleData: () => void;
  onClearAllData: () => void;
  allData: {
    transactions: Transaction[];
    budget: BudgetConfig;
    goals: SavingsGoal[];
    userProfile: UserProfile;
  };
  onImportData: (data: any) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  apiKey,
  onApiKeyChange,
  userProfile,
  onUpdateProfile,
  onResetSampleData,
  onClearAllData,
  allData,
  onImportData
}) => {
  const [keyInput, setKeyInput] = useState(apiKey);
  const [showKey, setShowKey] = useState(false);
  const [testStatus, setTestStatus] = useState<{ loading: boolean; success?: boolean; message?: string }>({
    loading: false
  });
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Perfil form
  const [profileForm, setProfileForm] = useState(userProfile);
  const [profileSaved, setProfileSaved] = useState(false);

  const handleSaveKey = () => {
    saveStoredApiKey(keyInput);
    onApiKeyChange(keyInput.trim());
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleRemoveKey = () => {
    removeStoredApiKey();
    setKeyInput('');
    onApiKeyChange('');
    setTestStatus({ loading: false });
  };

  const handleTestKey = async () => {
    if (!keyInput.trim()) {
      setTestStatus({ loading: false, success: false, message: 'Primero pega tu API Key para probarla.' });
      return;
    }
    setTestStatus({ loading: true });
    const res = await testApiKey(keyInput.trim());
    setTestStatus({ loading: false, success: res.success, message: res.message });
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(profileForm);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(allData, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute('href', dataStr);
    dlAnchorElem.setAttribute('download', `EduPlata_Backup_${new Date().toISOString().slice(0, 10)}.json`);
    dlAnchorElem.click();
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], 'UTF-8');
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed && Array.isArray(parsed.transactions)) {
            onImportData(parsed);
            alert('¡Datos restaurados con éxito desde el archivo!');
          } else {
            alert('El archivo no parece ser un respaldo válido de EduPlata.');
          }
        } catch (err) {
          alert('Error al leer el archivo JSON.');
        }
      };
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
      
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Configuración y Privacidad
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Personaliza tu perfil, conecta tu API Key de Gemini y gestiona tus datos
        </p>
      </div>

      {/* SECCIÓN 1: CONFIGURACIÓN DE GEMINI API KEY */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-6 space-y-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-violet-600/20">
              <Key className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white">
                API Key de Google Gemini AI
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tu clave se almacena exclusivamente en tu navegador (<code className="text-violet-600 font-mono">localStorage</code>), nunca en servidores ni en el código.
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
            <ShieldCheck className="w-4 h-4" />
            <span>100% Privado en tu PC</span>
          </div>
        </div>

        {/* Guía para obtener la clave */}
        <div className="p-4 rounded-2xl bg-violet-50/60 dark:bg-violet-950/40 border border-violet-100 dark:border-violet-900/40 space-y-2 text-xs text-slate-700 dark:text-slate-300">
          <div className="flex items-center justify-between">
            <span className="font-bold text-violet-900 dark:text-violet-200 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-violet-600" />
              ¿Cómo obtener tu clave de Gemini gratis en 30 segundos?
            </span>
            <a
              href="https://aistudio.google.com/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-bold text-violet-700 dark:text-violet-300 hover:underline"
            >
              <span>Abrir Google AI Studio</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
          <ol className="list-decimal list-inside space-y-1 text-slate-600 dark:text-slate-400 pl-1">
            <li>Entra a <strong className="text-violet-700 dark:text-violet-300">aistudio.google.com/apikey</strong> con tu cuenta de Google.</li>
            <li>Haz clic en el botón azul <strong className="text-slate-800 dark:text-slate-200">"Create API key"</strong>.</li>
            <li>Copia la clave generada y pégala en el campo de abajo. ¡No pide tarjeta de crédito y es gratis!</li>
          </ol>
        </div>

        {/* Campo de texto de la clave */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Tu Gemini API Key
          </label>
          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full pl-4 pr-12 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 font-mono text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              title={showKey ? 'Ocultar clave' : 'Mostrar clave'}
            >
              {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Acciones de la clave */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveKey}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-violet-600 hover:bg-violet-500 text-white shadow-md shadow-violet-600/20 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Guardar Clave</span>
            </button>
            <button
              onClick={handleTestKey}
              disabled={testStatus.loading}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all cursor-pointer"
            >
              {testStatus.loading ? 'Verificando...' : 'Probar Conexión'}
            </button>
            {apiKey && (
              <button
                onClick={handleRemoveKey}
                className="px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              >
                Eliminar Clave
              </button>
            )}
          </div>

          {savedSuccess && (
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
              <Check className="w-4 h-4" /> ¡Clave guardada en tu navegador!
            </span>
          )}
        </div>

        {testStatus.message && (
          <div
            className={`p-3 rounded-2xl text-xs font-medium ${
              testStatus.success
                ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                : 'bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
            }`}
          >
            {testStatus.message}
          </div>
        )}
      </div>

      {/* SECCIÓN 2: PERFIL UNIVERSITARIO */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Perfil de Estudiante
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Personaliza el nombre que saldrá en tu informe PDF y en los consejos de la IA
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
                Tu Nombre *
              </label>
              <input
                type="text"
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
                Universidad o Institución *
              </label>
              <input
                type="text"
                value={profileForm.university}
                onChange={(e) => setProfileForm({ ...profileForm, university: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
                Carrera o Programa
              </label>
              <input
                type="text"
                value={profileForm.career}
                onChange={(e) => setProfileForm({ ...profileForm, career: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
                Semestre
              </label>
              <input
                type="text"
                value={profileForm.semester}
                onChange={(e) => setProfileForm({ ...profileForm, semester: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all"
            >
              Guardar Perfil
            </button>
            {profileSaved && (
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                ¡Perfil actualizado!
              </span>
            )}
          </div>
        </form>
      </div>

      {/* SECCIÓN 3: GESTIÓN DE DATOS Y RESPALDO */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-6 space-y-4">
        <div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            Gestión de Datos y Copias de Seguridad
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Exporta tus cuentas en formato JSON o restablece los datos de ejemplo iniciales
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {/* Exportar JSON */}
          <button
            onClick={handleExportJSON}
            className="flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Exportar Copia de Seguridad (JSON)</span>
          </button>

          {/* Importar JSON */}
          <label className="flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors cursor-pointer">
            <Upload className="w-4 h-4 text-violet-600" />
            <span>Importar Copia de Seguridad (JSON)</span>
            <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
          </label>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => {
              if (confirm('¿Restablecer los datos de ejemplo con movimientos universitarios colombianos? Esto reemplazará los datos actuales.')) {
                onResetSampleData();
              }
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <RotateCcw className="w-4 h-4 text-amber-500" />
            <span>Restablecer datos de ejemplo</span>
          </button>

          <button
            onClick={() => {
              if (confirm('¿Deseas BORRAR TODOS tus movimientos, presupuesto y metas? Esta acción no se puede deshacer.')) {
                onClearAllData();
              }
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Borrar todos mis movimientos</span>
          </button>
        </div>
      </div>

    </div>
  );
};
