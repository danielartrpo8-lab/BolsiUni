# 🇨🇴 EduPlata - Finanzas para Universitarios

**EduPlata** es una aplicación web moderna de finanzas personales diseñada especialmente para estudiantes universitarios en Colombia que administran presupuestos ajustados (mesada familiar, auxilios de sostenimiento, becas o trabajos de medio tiempo).

Permite registrar gastos del día a día (almuerzos corrientazos, fotocopias, pasajes de bus/metro, polas de viernes), fijar presupuestos mensuales con alertas visuales, planificar metas de ahorro con cálculo de ritmo semanal/mensual, generar reportes en PDF y recibir diagnósticos inteligentes con **Google Gemini AI**.

---

## 🚀 Características Principales

1. **Registro de Movimientos:**
   - Ingresos y Gastos en Pesos Colombianos (**COP** con formato `$1.000.000`).
   - Categorías estudiantiles: *Comida (corrientazos/empanadas)*, *Transporte (TransMilenio/Metro/bus)*, *Fotocopias y útiles*, *Matrícula y semestre*, *Salidas y ocio (polas/rumbas)*, *Suscripciones (Spotify Universitario)*, *Salud*, *Otros*.
   - Botones rápidos para gastos comunes universitarios ($1.500 tinto, $3.200 pasaje, $6.000 empanada, $14.000 almuerzo).
   - Edición y eliminación en tiempo real con persistencia en `localStorage`.

2. **Dashboard Visual e Interactivo:**
   - Métricas: Saldo en bolsillo, Total de ingresos del mes, Total de gastos del mes, Límite mensual.
   - **Alerta visual automática** cuando el usuario gasta más del 80% o el 100% de su presupuesto.
   - Gráfico de dona interactivo (Recharts) con el porcentaje gastado por categoría.
   - Gráfico de barras con la evolución de gastos en los últimos días con actividad.

3. **Presupuesto Mensual:**
   - Establece un tope mensual global y límites específicos por categoría.
   - Barras de progreso con código de colores según el semáforo financiero:
     - 🟢 **Verde:** Menos del 70% gastado (Zona segura).
     - 🟡 **Amarillo:** Entre 70% y 90% gastado (Precaución).
     - 🔴 **Rojo:** Más del 90% o superado (Alerta crítica).

4. **Metas de Ahorro ("Marranito"):**
   - Crea metas como *"Portátil nuevo para programar"*, *"Viaje de fin de semestre"* o *"Fondo para parciales"*.
   - La app calcula automáticamente cuánto debes ahorrar por semana y por mes según la fecha límite.
   - Botón *"Aportar Plata"* para ir sumando ahorros con animación de confeti 🎉 al cumplir la meta.

5. **Asistente Inteligente con IA (Google Gemini):**
   - **100% Privado:** Tu API Key se guarda únicamente en el `localStorage` de tu navegador; nunca viaja a ningún servidor ni queda escrita en el código.
   - **Botón "Analizar mis finanzas":** Gemini examina tus movimientos y devuelve:
     - Resumen amigable en lenguaje claro y motivador.
     - Los 3 gastos donde más puedes recortar plata.
     - 3 consejos de ahorro realistas para la vida universitaria en Colombia.
   - **Chat Financiero Interactivo:** Pregúntale cosas como *"¿Me alcanza para ir a un concierto este mes?"* o *"¿Cómo ahorro $100.000?"* y responderá con base en tus cuentas reales.

6. **Informe en PDF:**
   - Descarga directa en el navegador generada con `jsPDF`.
   - Incluye membrete con la marca EduPlata, datos del estudiante, KPIs, tabla completa de gastos por categoría, estado de las metas y los consejos de la IA.

7. **Extras:**
   - Modo Claro y Modo Oscuro con detección de preferencia del sistema.
   - Copia de seguridad: Exportar e Importar datos en formato JSON.
   - Datos de ejemplo precargados con botón para restablecer o vaciar.
   - Diseño 100% responsive (optimizado para celular con barra inferior estilo app móvil).

---

## 🛠️ Tecnologías Utilizadas

- **React 19** + **TypeScript**
- **Vite 8** (con soporte base relativo para GitHub Pages)
- **Tailwind CSS v4** (con temas claro/oscuro y tipografía fluida)
- **Recharts** (gráficos de dona y barras responsivos)
- **jsPDF** (generación y descarga de reportes PDF en el cliente)
- **Google Gemini API** (`gemini-2.5-flash` mediante API REST en el cliente)
- **Lucide Icons** & **Canvas-Confetti**

---

## 💻 Ejecución en Local

### 1. Clonar el repositorio
```bash
git clone https://github.com/TU-USUARIO/bolsiuni.git
cd bolsiuni
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Iniciar el servidor de desarrollo
```bash
npm run dev
```
Abre en tu navegador la URL que indique la consola (normalmente `http://localhost:3000` o `http://localhost:5173`).

---

## 🔑 Cómo Obtener tu API Key de Gemini Gratis

La app utiliza la inteligencia artificial de Google Gemini sin cobrarte nada:

1. Ve a [Google AI Studio](https://aistudio.google.com/apikey) e inicia sesión con tu cuenta de Google.
2. Haz clic en el botón azul **"Create API key"** (o "Crear clave de API").
3. Selecciona tu proyecto o crea uno nuevo en un clic y copia la clave generada (empieza por `AIzaSy...`).
4. En **EduPlata**, dirígete a la pestaña **Configuración** ⚙️ y pégala en el campo correspondiente.
5. Haz clic en **"Probar Conexión"** y luego en **"Guardar Clave"**.

> 💡 **Nota de Seguridad:** La clave queda guardada **únicamente en tu propio navegador** mediante `localStorage`. Ningún tercero tiene acceso a ella.

---

## 🌐 Cómo Desplegar en GitHub Pages

La aplicación está preparada para compilarse como un sitio 100% estático frontend sin backend:

1. Sube tu proyecto a un repositorio en GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit EduPlata"
   git branch -M main
   git remote add origin https://github.com/TU-USUARIO/bolsiuni.git
   git push -u origin main
   ```

2. En tu repositorio en GitHub, ve a **Settings** > **Pages**.
3. En la sección **Build and deployment**, en **Source** selecciona:
   👉 **GitHub Actions**.
4. ¡Listo! El workflow `.github/workflows/deploy.yml` incluido en el proyecto compilará y publicará la web automáticamente con cada push a la rama `main`. Tu app estará disponible en:
   `https://TU-USUARIO.github.io/bolsiuni/`

---

## 📁 Estructura del Código

```text
├── .github/workflows/deploy.yml # Workflow de despliegue automático en GitHub Pages
├── src/
│   ├── components/
│   │   ├── views/
│   │   │   ├── DashboardView.tsx    # Dashboard principal con gráficos Recharts y KPIs
│   │   │   ├── TransactionsView.tsx # Historial con filtros de búsqueda y orden
│   │   │   ├── BudgetView.tsx       # Presupuesto mensual y límites por categoría
│   │   │   ├── GoalsView.tsx        # Metas de ahorro y cálculos de ritmo
│   │   │   ├── AIAssistantView.tsx  # Diagnóstico y chat con Google Gemini AI
│   │   │   └── SettingsView.tsx     # Gestión de API key, perfil y respaldo JSON
│   │   ├── Navbar.tsx               # Barra superior con saldo y exportación PDF
│   │   ├── TabsNav.tsx              # Pestañas desktop y navegación fija móvil
│   │   ├── TransactionModal.tsx     # Modal para registrar o editar movimientos
│   │   ├── GoalModal.tsx            # Modal para crear o editar metas
│   │   └── GoalDepositModal.tsx     # Modal para abonar a una meta con confeti
│   ├── data/
│   │   └── initialData.ts           # Datos de muestra de estudiante en Colombia
│   ├── services/
│   │   ├── gemini.ts                # Conexión pura en el cliente con Gemini API
│   │   └── pdfReport.ts             # Generador de reportes PDF con jsPDF
│   ├── types/
│   │   └── index.ts                 # Definición de tipos TypeScript
│   ├── utils/
│   │   ├── categories.ts            # Catálogo de categorías universitarias
│   │   └── formatters.ts            # Formateador de pesos COP ($1.000.000) y fechas
│   ├── App.tsx                      # Componente raíz con estado y persistencia
│   ├── main.tsx                     # Punto de entrada de React
│   └── index.css                    # Configuración de Tailwind CSS v4 y modo oscuro
├── index.html                       # HTML con metadatos y fuentes Google Fonts
├── metadata.json                    # Metadatos de la aplicación
├── package.json
├── tsconfig.json
└── vite.config.ts                   # Configuración de Vite con base relativa
```

---

## 📄 Licencia

Este proyecto se distribuye bajo la licencia Apache-2.0. Desarrollado con 💚 para apoyar a los estudiantes universitarios de Colombia.
