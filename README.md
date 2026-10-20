# 🏢 MOAI Inmobiliaria — Suite Contable, Presupuestal y Junta de Socios

Aplicación web empresarial desarrollada a la medida para los socios y el equipo directivo de **MOAI Inmobiliaria S.A.S.** ([www.inmobiliariamoai.com](https://www.inmobiliariamoai.com)) en Medellín, Antioquia (Calle 32C # 80A 45).

La plataforma permite el control contable estricto de la inmobiliaria, gestión de cartera de inmuebles administrados, cálculo automático de liquidaciones de canon a propietarios (comisión 10% + IVA), programación de pagos y vencimientos con exportación a Google Calendar / `.ics`, y un módulo exclusivo para la **Junta de Socios** con simulador de reparto de dividendos.

---

## 🎨 Identidad Visual y Colores Oficiales

- **Color Primario (MOAI Red):** `#e10b17`
- **Rojo Oscuro:** `#c00510`
- **Texto & Carbón Ejecutivo:** `#1e2022` / `#383b3d`
- **Fondo:** Blanco y gris sutil `#f8f9fa` en modo claro; negro obsidiana `#0f1013` / `#15171c` en modo oscuro.
- **Tipografías:** *Be Vietnam Pro* (títulos y encabezados) e *Instrument Sans* (cuerpo y datos).
- **Montos:** Tipografía monoespaciada con formato en pesos colombianos (`$1.000.000 COP`).

---

## 🚀 ¿Cómo Levantarlo en GitHub Codespaces desde tu Fork (`daniagudelo06`)?

Si hiciste fork del repositorio a tu cuenta de GitHub (`daniagudelo06`) y vas a abrir un Codespace, sigue estos 3 pasos:

### 1. Abrir la Terminal en tu Codespace
En la parte inferior de tu pantalla en Codespaces (o presionando ``Ctrl + ` `` o ``Cmd + ` ``):

```bash
# 1. Instalar todas las dependencias
npm install
```

### 2. Configurar la clave de Claude (Anthropic)
Copia el archivo `.env.example` a `.env`:

```bash
cp .env.example .env
```

Abre el archivo `.env` y coloca tu clave de Claude si la tienes:
```env
ANTHROPIC_API_KEY="sk-ant-api03-tu-clave-aqui"
PORT=3000
```
> **Nota importante:** Si aún no le has puesto tu clave de Claude, **¡la app funciona al 100%!** Cuenta con un motor heurístico offline especializado en jerga inmobiliaria colombiana que procesa inmediatamente cánones, comisiones, dispersiones y compras en lenguaje natural.

### 3. Iniciar el Servidor de Desarrollo
```bash
npm run dev
```
Codespaces detectará automáticamente el puerto **3000**. Haz clic en **"Open in Browser"** (Abrir en el navegador) y verás la suite contable en funcionamiento.

---

## 💡 Innovaciones Contables Incorporadas ("Lo que una inmobiliaria necesita y los software genéricos no tienen")

### 1. Separación Estricta de Fondos: Caja Propia MOAI vs. Fondo de Custodia de Propietarios
En una inmobiliaria, cobrar un canon de $3.000.000 **NO** es ingreso de la empresa; es dinero de un tercero (el propietario). Mezclar la plata de los arriendos con la caja operativa es el error contable más común y peligroso.

- **Caja Operativa MOAI:** Registra exclusivamente el dinero que le pertenece a la inmobiliaria: comisiones de arrendamiento (8% - 10%), comisiones por ventas (3%), márgenes de reformas, mantenimientos locativos y mudanzas. De aquí se pagan la pauta en portales (Finca Raíz, Ciencuadras), la oficina, asesores e impuestos.
- **Fondo de Custodia (Propietarios):** Registra los cánones brutos recaudados de inquilinos y las dispersiones netas transferidas a las cuentas bancarias de los dueños. Permite saber en todo momento cuánta plata en tránsito tiene la inmobiliaria en custodia.

### 2. Liquidación Automática de Canon a Propietarios
En la pestaña **Inmuebles & Contratos**, cada propiedad cuenta con un botón **"Liquidar Canon"** que calcula en un clic:
$$\text{Canon Bruto} - \text{Comisión MOAI (10\%)} - \text{IVA sobre Comisión (19\%)} - \text{Cuota Admin Copropiedad} - \text{Mantenimientos} = \text{Neto a Dispersar}$$
Al confirmar la liquidación, la app genera automáticamente los asientos en los libros contables sin riesgo de error humano.

### 3. Módulo de Junta de Socios (Andrés, Juan Pablo, Simón)
Diseñado específicamente para los 3 fundadores de MOAI Inmobiliaria:
- Porcentajes accionarios y capital inicial aportado.
- Cálculo de **Utilidad Neta Real** de la empresa.
- Descuento de **Reserva Legal Obligatoria (10%)** (según Código de Comercio en Colombia) y reserva operativa de maniobra (15%).
- **Simulador de Reparto de Dividendos:** Ingresa un monto a distribuir (ej. $15.000.000 COP) y calcula la cifra exacta para cada socio, permitiendo asentar los comprobantes de egreso correspondientes con un solo clic.

### 4. Calendario y Fechas Clave del Negocio Inmobiliario
- Días 1 al 10: Vencimiento de recaudo de cánones a inquilinos.
- Días 10 al 15: Dispersión masiva a cuentas de propietarios.
- Fin de mes: Pago de primas de pólizas colectivas a aseguradoras (El Libertador, Unifianza, FianzaCrédito).
- Comparador de tesorería a 15 días: Alerta si el saldo disponible no alcanza para cubrir los pagos que vienen.
- **Sincronización:** Cada compromiso cuenta con botón para añadir directo a **Google Calendar** y para **descargar archivo `.ics`** con alarma recordatoria (VALARM) para iPhone y Outlook.

### 5. Cartera de Inmuebles Administrados
Ficha completa de propiedades en Medellín, Laureles, El Poblado, Envigado, Sabaneta:
- Datos del propietario y su cuenta bancaria de dispersión (Bancolombia, Davivienda, etc.).
- Datos del inquilino y póliza de seguro de arrendamiento respaldada.
- Estado: *Arrendado*, *Disponible*, *En Consignación Venta*, *En Reforma*.

### 6. Asistente Inteligente de Registro (Claude Ready & Dictado por Voz)
- Accesible desde el Dashboard y desde la pestaña **Asistente IA / Voz**.
- Micrófono integrado con Web Speech API en español de Colombia (`es-CO`).
- Entiende expresiones del sector inmobiliario:
  - *"Cobramos canon de 2.600.000 del apto 402"*
  - *"Comisión por venta de 19.5 millones de casa en Castropol"*
  - *"Dispersión a Doña Martha Gómez de 2.290.600 el día 10"*
  - *"Pagar pauta en Finca Raíz de 450 mil"*
  - *"Reparación de tubería 180 lucas en local 5"*
- **Confirmación previa:** Muestra tarjeta con desglose antes de guardar en libros contables.

### 7. Exportación Contable
- **Excel (CSV contable con UTF-8 BOM):** Con columnas de fecha, fondo contable, tipo, categoría, inmueble, concepto, comprobante y monto.
- **Balance General en PDF:** Generado en el navegador con membrete corporativo oficial de MOAI Inmobiliaria, estado de caja, distribución de socios y libro diario.

---

## 🏗️ Estructura del Código

```text
├── index.html                   # HTML con fuentes Be Vietnam Pro & Instrument Sans y branding MOAI
├── metadata.json                # Metadatos de la aplicación
├── package.json                 # Scripts y dependencias
├── server.ts                    # Backend Express seguro + Proxy para la API de Claude (Anthropic)
├── .env.example                 # Variables de entorno documentadas (ANTHROPIC_API_KEY)
└── src/
    ├── App.tsx                  # Componente raíz con estado central y persistencia
    ├── index.css                # Tailwind CSS v4 con variables de diseño MOAI Red
    ├── types/                   # Modelos de datos TypeScript (Inmuebles, Liquidación, Socios)
    ├── data/
    │   └── initialData.ts       # Datos semilla de cartera, socios y transacciones
    ├── utils/
    │   ├── categories.ts        # Catálogo de categorías inmobiliarias y mapeador inteligente
    │   ├── calendarUtils.ts     # Generador de enlaces Google Calendar y archivos .ics
    │   └── formatters.ts        # Formato de moneda COP y fechas colombianas
    ├── services/
    │   ├── claudeService.ts     # Conexión frontend segura con backend (/api/claude/chat)
    │   ├── excelReport.ts       # Exportación CSV compatible con Excel
    │   └── pdfReport.ts         # Generación de informe ejecutivo en PDF (jsPDF)
    └── components/
        ├── Navbar.tsx           # Barra superior con logo MOAI, saldos de caja y selector de socio
        ├── TabsNav.tsx          # Pestañas ejecutivas de navegación y barra móvil
        ├── QuickChatBar.tsx     # Barra de registro rápido WhatsApp style en Inicio
        ├── UpcomingPaymentsCard.tsx # Tarjeta de compromisos y alertas de liquidez a 15 días
        ├── TransactionModal.tsx # Modal de registro de movimiento contable
        ├── PropertyModal.tsx    # Modal de ficha técnica de inmueble
        └── views/
            ├── DashboardView.tsx   # Panel ejecutivo con KPIs, gráficos y separación de caja
            ├── PropertiesView.tsx  # Cartera de inmuebles y liquidación de canon
            ├── TransactionsView.tsx# Libro diario contable de ingresos y egresos
            ├── CalendarView.tsx    # Calendario interactivo mensual y pagos programados
            ├── BudgetView.tsx      # Metas de ingresos y techo de gastos operativos
            ├── PartnersView.tsx    # Módulo de socios fundadores y simulador de dividendos
            ├── QuickChatView.tsx   # Asistente conversacional con voz y confirmaciones
            └── SettingsView.tsx    # Ficha de la empresa, backup y guía de Codespaces
```

---

## 🔒 Seguridad de la API Key

- La clave `ANTHROPIC_API_KEY` se lee exclusivamente desde las variables de entorno del servidor en `server.ts`.
- **Nunca** viaja al navegador ni queda expuesta en el código del cliente.

---

Desarrollado para **MOAI Inmobiliaria S.A.S.** • Medellín, Colombia.
