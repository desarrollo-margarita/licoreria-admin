# Changelog

Todos los cambios notables de este proyecto se documentarán en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto se adhiere a [Semantic Versioning](https://semver.org/lang/es/).

---

## [1.0.1] - 2026-08-31

### 🛠️ Mejoras y Correcciones (Fixed & Improved)
* **Persistencia de Sesión y Vista SuperAdmin (`App.jsx`, `AuthContext.jsx`):**
  * Se implementó la restauración automática del estado de vista (`currentView`) tras recargas de página (`F5`). Si el usuario está autenticado como administrador, se mantiene activo en el `AdminDashboard` sin ser redirigido a la landing page.
  * Sincronización precisa de navegación y limpieza de estado al hacer clic en *"Volver a la Web"* o cerrar sesión (`logout`).
* **Diseño y Espaciado de Navegación (`Navbar.jsx`):**
  * Se corrigió la superposición y cercanía entre el enlace **FAQ** y el botón de acción **Acceso SuperAdmin**.
  * Se introdujo un divisor visual de cristal (`border-l border-white/10`), margen izquierdo independiente y ajuste responsivo de separaciones (`gap-5 2xl:gap-7`) para garantizar una legibilidad impecable en todas las resoluciones de pantalla.

---

## [1.0.0] - 2026-08-31

### ✨ Añadido (Added)
#### 🌐 Landing Page Comercial VentroX
* **Hero Section:** Sección de presentación interactiva con llamada a la acción (CTA) y previsualización gráfica del sistema.
* **Industries Section:** Catálogo de industrias compatibles (Licorerías, Bodegones, Supermercados, Farmacias, etc.).
* **Feature Grid:** Cuadrícula de características principales (Facturación rápida, control de inventario, soporte multimoneda USD/VES, gestión multi-caja).
* **Live POS Simulator:** Simulador interactivo en tiempo real del flujo de cobro y punto de venta.
* **Interactive Pricing:** Calculadora de planes de suscripción (Mensual / Anual) con desglose de precios y descuentos.
* **Testimonios & FAQ:** Sección de prueba social y acordeón interactivo de preguntas frecuentes.
* **Navbar & Footer:** Navegación fluida con acceso directo al panel administrativo SuperAdmin.

#### 🛡️ Consola SuperAdmin y Gestión de Licencias
* **Autenticación SuperAdmin:** Sistema de inicio de sesión seguro en sesión de navegador (`AuthContext`) con control de estado y cierre de sesión.
* **Dashboard de KPIs:** Tarjetas de métricas en tiempo real:
  * Total de clientes y licencias activas.
  * Ingreso mensual recurrente estimado (MRR en USD).
  * Contador de suscripciones próximas a vencer.
  * Estado de clientes con pagos pendientes o en mora.
* **Gestión de Clientes y Comercios:**
  * Alta de nuevos comercios con asignación automática de licencia (`VX-XXXX-XXXX-XXXX`).
  * Edición de información fiscal (RIF/Cédula, Razón Social, Teléfono, Correo, Persona de Contacto).
  * Activación, suspensión y eliminación de comercios.
* **Control de Planes y Suscripciones:**
  * Modal para cambio de plan (Mensual, Trimestral, Semestral, Anual).
  * Configuración de límite de cajas registradoras permitidas por comercio.
  * Ajuste de fechas de inicio, vencimiento y canon mensual.
* **Historial de Pagos y Facturación:**
  * Registro de transacciones con soporte bimoneda (USD y Bolívares VES).
  * Métodos de pago configurables (Zelle, Pago Móvil, Transferencia Bancaria, Efectivo, Binance Pay).
  * Extensión automática del período de vigencia de la licencia al asentar un pago.
  * Historial completo y auditable de transacciones por cliente.
* **Telemetría de Dispositivos (Cajas POS):**
  * Modal de gestión de dispositivos enlazados por comercio.
  * Registro de nombres de equipo, identificadores de máquina (Hardware ID) y última fecha/hora de conexión (`last_seen`).
  * Capacidad de desvincular o revocar acceso a cajas específicas.
* **Generador de Mensajes WhatsApp:**
  * Plantillas automáticas con formato profesional para envío directo por WhatsApp Web:
    * Mensaje de Bienvenida y Entrega de Licencia.
    * Recordatorio preventivo de vencimiento de suscripción.
    * Aviso de suspensión / pago pendiente.
    * Comprobante de recepción de pago.
* **Integración Supabase & Almacenamiento Híbrido:**
  * Conector oficial con **Supabase** (`@supabase/supabase-js`) para almacenamiento en la nube.
  * Generador integrado de esquemas SQL DDL para creación de tablas (`businesses`, `subscriptions`, `payments`, `pos_devices`).
  * Servicio de respaldo y sincronización local (`storageService.js`) con tolerancia a fallos y fallback en `localStorage`.

#### 🚀 Infraestructura & Despliegue
* **Vite 8 & React 19:** Configuración de compilación optimizada con soporte para Fast Refresh.
* **Tailwind CSS v4:** Motor de estilos ultra rápido basado en variables CSS modernas.
* **Soporte Vercel:** Archivo de configuración `vercel.json` con reescritura de rutas para despliegues SPA.
* **Control de Versiones:** Inicialización de repositorio Git con `.gitignore` robusto que protege archivos de entorno `.env`.

---

## [Unreleased]

### 🔮 Planificado para Próximas Versiones
* Integración de inicio de sesión con Supabase Auth (Magic Links y autenticación multifactor).
* Exportación de reportes financieros y listado de clientes a formato PDF y Excel (.xlsx).
* Webhooks para notificaciones automáticas a Telegram / Discord ante nuevos pagos.
