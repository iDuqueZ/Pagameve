# 🎨 PágameVe — Sistema de diseño UI/UX

> Guía completa de decisiones visuales para implementar el frontend con tema oscuro y navegación lateral.

---

## 1. Paleta de colores

Define estas variables en tu archivo `index.css` o `globals.css` dentro de `:root`:

```css
:root {
  /* Fondos */
  --bg-base:       #0d0f14; /* fondo base de toda la app */
  --bg-surface:    #13161e; /* sidebar, topbar */
  --bg-card:       #1a1e28; /* cards, filas de deuda */
  --bg-elevated:   #222736; /* inputs, hover, progress vacío */

  /* Bordes */
  --border:        #2a2f3f; /* borde por defecto */
  --border-strong: #353c52; /* borde en hover o énfasis */

  /* Texto */
  --txt-primary:   #e8eaf0; /* texto principal */
  --txt-secondary: #8b90a0; /* etiquetas, metadatos */
  --txt-muted:     #555c70; /* placeholders, nav-labels */

  /* Acento principal (morado) */
  --accent:        #7c6af7;
  --accent-light:  #9d8ff9;
  --accent-bg:     #1e1a3a;

  /* Semánticos */
  --green:         #22c97a; /* me deben, pagado, aceptado */
  --green-bg:      #0d2a1e;
  --red:           #f45b5b; /* debo, rechazo, alerta */
  --red-bg:        #2a1010;
  --amber:         #f0a640; /* pendiente de aceptación */
  --amber-bg:      #2a1e08;
  --blue:          #4a9eff; /* notificaciones informativas */
  --blue-bg:       #0d1e33;

  /* Layout */
  --sidebar-width: 200px;
  --topbar-height: 48px;
  --radius:        10px;
  --radius-sm:     6px;
}
```

### Cuándo usar cada color semántico

| Color | Rol en la app |
|---|---|
| `--green` | Monto que me deben, deuda pagada, botón "Aceptar" |
| `--red` | Monto que debo, deuda rechazada, botón "Rechazar" |
| `--amber` | Estado `pending_acceptance`, advertencias no críticas |
| `--blue` | Notificaciones informativas (alguien aceptó, etc.) |
| `--accent` | Ítem activo en sidebar, botón primario "Nueva deuda", borde de acción requerida |

---

## 2. Tipografía

**Fuente recomendada:** [Geist Sans](https://vercel.com/font) o [Inter](https://fonts.google.com/specimen/Inter). Ambas gratuitas y con excelente legibilidad en fondos oscuros.

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500&display=swap');

body {
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 13px;
  line-height: 1.5;
  color: var(--txt-primary);
  background: var(--bg-base);
}
```

### Escala tipográfica

| Elemento | Tamaño | Peso | Color |
|---|---|---|---|
| Logo / título de página | `14px` | `500` | `--txt-primary` |
| Ítems de navegación | `12.5px` | `400` | `--txt-secondary` |
| Título de card / nombre | `12.5px` | `500` | `--txt-primary` |
| Descripción / metadato | `11px` | `400` | `--txt-muted` |
| Monto principal | `16–22px` | `500` | semántico |
| Etiqueta de sección (nav-label) | `10px` | `400` | `--txt-muted` + `letter-spacing: .08em` |
| Chips / badges | `10px` | `500` | semántico |

**Regla:** Solo usar pesos `400` y `500`. Nunca `600`, `700` ni bold por defecto — se ve pesado en fondos oscuros.

---

## 3. Iconografía

**Librería:** [Lucide React](https://lucide.dev/) — thin stroke, consistente, tiene binding oficial para React.

```bash
npm install lucide-react
```

```jsx
import { LayoutDashboard, Users, CreditCard, Bell, Plus } from 'lucide-react'
```

### Iconos por sección

| Sección | Ícono Lucide |
|---|---|
| Dashboard | `LayoutDashboard` |
| Me deben | `UserCheck` |
| Debo | `UserX` |
| Notificaciones | `Bell` |
| Nueva deuda | `Plus` |
| Registrar pago | `CheckCircle` |
| Perdonar deuda | `Heart` |
| Aceptar deuda | `ThumbsUp` |
| Rechazar deuda | `ThumbsDown` |
| Cerrar sesión | `LogOut` |

### Tamaños de ícono

```jsx
/* Sidebar nav */
<Icon size={15} strokeWidth={1.6} />

/* Botones de acción */
<Icon size={13} strokeWidth={1.8} />

/* Notificaciones (dentro del círculo) */
<Icon size={14} strokeWidth={1.8} />

/* Botón primario topbar */
<Icon size={12} strokeWidth={2} />
```

---

## 4. Layout general

La app usa un layout de **dos columnas fijas**: sidebar izquierdo + área de contenido con scroll.

```
┌─────────────────────────────────────────────────────┐
│  sidebar (200px fijo)  │  topbar (altura 48px)       │
│                        │─────────────────────────────│
│  logo                  │                             │
│  ─────────             │   contenido principal       │
│  nav items             │   (scroll vertical)         │
│                        │                             │
│  ─────────             │                             │
│  avatar usuario        │                             │
└─────────────────────────────────────────────────────┘
```

```css
.app-shell {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.sidebar {
  width: var(--sidebar-width);
  min-width: var(--sidebar-width);
  background: var(--bg-surface);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
}

.content-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.topbar {
  height: var(--topbar-height);
  background: var(--bg-surface);
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  padding: 0 20px;
  gap: 12px;
  flex-shrink: 0;
}

.main-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}
```

---

## 5. Sidebar

### Estructura interna

```
sidebar
├── logo-area         (padding: 16px, border-bottom)
├── nav-section       (flex: 1, overflow-y: auto)
│   ├── nav-label     ("Principal", "Sistema")
│   └── nav-item      (cada enlace)
└── user-avatar       (border-top, pegado al fondo)
```

### Nav item — estados

```css
.nav-item {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 7px 8px;
  border-radius: var(--radius-sm);
  color: var(--txt-secondary);
  font-size: 12.5px;
  cursor: pointer;
  position: relative;
  transition: background 0.15s, color 0.15s;
}

.nav-item:hover {
  background: var(--bg-card);
  color: var(--txt-primary);
}

/* Ítem activo: borde izquierdo + fondo accent */
.nav-item.active {
  background: var(--accent-bg);
  color: var(--accent-light);
}

.nav-item.active::before {
  content: '';
  position: absolute;
  left: 0; top: 6px; bottom: 6px;
  width: 2.5px;
  background: var(--accent);
  border-radius: 0 2px 2px 0;
}
```

### Badges de conteo en nav

```jsx
/* Deudas que debo (rojo) */
<span className="badge badge-red">2</span>

/* Me deben activas (verde) */
<span className="badge badge-green">3</span>

/* Notificaciones no leídas (accent) */
<span className="badge badge-accent">4</span>
```

```css
.badge {
  margin-left: auto;
  font-size: 9px;
  font-weight: 500;
  padding: 1px 5px;
  border-radius: 99px;
  min-width: 16px;
  text-align: center;
}
.badge-red    { background: var(--red);    color: #fff; }
.badge-green  { background: var(--green);  color: #fff; }
.badge-accent { background: var(--accent); color: #fff; }
```

---

## 6. Chips de estado (status pills)

Cada deuda tiene un estado visual que siempre aparece en la misma posición: junto al nombre del deudor/acreedor.

```css
.chip {
  display: inline-flex;
  align-items: center;
  font-size: 10px;
  font-weight: 500;
  padding: 2px 7px;
  border-radius: 99px;
}

.chip-pending  { background: var(--amber-bg); color: var(--amber); }
.chip-active   { background: var(--green-bg); color: var(--green); }
.chip-paid     { background: #1a2030;         color: var(--txt-muted); }
.chip-forgiven { background: var(--blue-bg);  color: var(--blue); }
.chip-rejected { background: var(--red-bg);   color: var(--red); }
```

| Estado DB | Chip | Color |
|---|---|---|
| `pending_acceptance` | "esperando" | amber |
| `active` | "activa" | green |
| `paid` | "pagada" | gris apagado |
| `forgiven` | "perdonada" | blue |
| `rejected` | "rechazada" | red |

---

## 7. Cards de deuda

### Anatomía de una debt-card

```
┌──────────────────────────────────────────────────────┐
│  [avatar]  Nombre deudor    [chip estado]  fecha      │
│                                                       │
│  Descripción de la deuda                   $62.000   │
│                                                       │
│  ████████░░░░░░░░░░░░░░  (barra de progreso)         │
│  Pagado: $18.600          Pendiente: $43.400          │
│                                                       │
│  [Registrar pago]   [Perdonar deuda]                 │
└──────────────────────────────────────────────────────┘
```

### Reglas de la card

- **Borde izquierdo accent** (`border-left: 2px solid var(--accent)`) solo en deudas que requieren acción inmediata (aceptar/rechazar en vista "Debo").
- **Barra de progreso** solo visible cuando `status === 'active'` y existen pagos parciales. Si no hay pagos, la barra no se muestra (no mostrar 0% — genera ruido visual).
- **Avatar:** iniciales del nombre, fondo semántico según el rol: verde si es deudor en "Me deben", rojo si es acreedor en "Debo".
- **Monto:** siempre verde en "Me deben", siempre rojo en "Debo", gris apagado en estados `paid` o `forgiven`.

```css
.debt-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 14px;
  margin-bottom: 8px;
  transition: border-color 0.15s;
}

.debt-card:hover {
  border-color: var(--border-strong);
}

/* Card con acción requerida */
.debt-card.requires-action {
  border-left: 2px solid var(--accent);
}

.progress-bar {
  height: 4px;
  background: var(--bg-elevated);
  border-radius: 2px;
  margin-top: 10px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 2px;
  background: var(--green);
  transition: width 0.3s ease;
}
```

---

## 8. Botones de acción

```css
/* Base */
.btn {
  padding: 5px 10px;
  border-radius: var(--radius-sm);
  font-size: 11px;
  cursor: pointer;
  border: 1px solid;
  transition: background 0.15s;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

/* Registrar pago */
.btn-pay    { background: var(--green-bg); border-color: var(--green); color: var(--green); }
.btn-pay:hover { background: #133d28; }

/* Perdonar / cancelar */
.btn-ghost  { background: transparent; border-color: var(--border-strong); color: var(--txt-secondary); }
.btn-ghost:hover { background: var(--bg-elevated); color: var(--txt-primary); }

/* Aceptar deuda */
.btn-accent { background: var(--accent-bg); border-color: var(--accent); color: var(--accent-light); }
.btn-accent:hover { background: #251f4a; }

/* Rechazar deuda */
.btn-danger { background: var(--red-bg); border-color: var(--red); color: var(--red); }
.btn-danger:hover { background: #3a1515; }

/* Nueva deuda (topbar — botón primario) */
.btn-primary {
  padding: 6px 13px;
  font-size: 12px;
  background: var(--accent);
  border-color: var(--accent);
  color: #fff;
  border-radius: var(--radius-sm);
}
.btn-primary:hover { background: var(--accent-light); }
```

---

## 9. Dashboard — widgets de resumen

```
┌────────────────┐  ┌────────────────┐
│  Me deben      │  │  Debo          │
│  $845.000      │  │  $320.000      │
│  3 activas     │  │  2 activas     │
└────────────────┘  └────────────────┘
┌─────────────────────────────────────┐
│  Balance neto   +$525.000           │
│  Estás a favor                      │
└─────────────────────────────────────┘
```

```css
.stat-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-bottom: 18px;
}

.stat-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 14px 16px;
}

.stat-label {
  font-size: 11px;
  color: var(--txt-muted);
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.stat-value {
  font-size: 22px;
  font-weight: 500;
  line-height: 1;
}

.stat-sub {
  font-size: 10px;
  color: var(--txt-muted);
  margin-top: 4px;
}
```

**Formato de montos:**
```js
// Siempre en pesos colombianos, sin decimales
const formatCOP = (n) => n.toLocaleString('es-CO', {
  style: 'currency',
  currency: 'COP',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})
// Resultado: $845.000
```

---

## 10. Notificaciones

### Estructura de un ítem

```
┌──────────────────────────────────────────────────────┐  ← borde izq accent si no leída
│  [icono círculo]  Carlos A. aceptó tu deuda de...   ●  ← punto si no leída
│                   Hace 2 horas                       │
└──────────────────────────────────────────────────────┘
```

```css
.notif-item {
  display: flex;
  gap: 10px;
  padding: 12px 14px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  margin-bottom: 6px;
  cursor: pointer;
  position: relative;
  transition: border-color 0.15s;
}

.notif-item.unread {
  border-left: 2px solid var(--accent);
}

.unread-dot {
  width: 7px; height: 7px;
  border-radius: 50%;
  background: var(--accent);
  position: absolute;
  top: 14px; right: 14px;
}
```

### Color del ícono por tipo de notificación

| Tipo | Ícono Lucide | Color del círculo |
|---|---|---|
| `new_debt` | `AlertCircle` | `--accent-bg` / `--accent-light` |
| `debt_accepted` | `CheckCircle` | `--green-bg` / `--green` |
| `debt_rejected` | `XCircle` | `--red-bg` / `--red` |
| `debt_paid` | `Banknote` | `--green-bg` / `--green` |
| `debt_forgiven` | `Heart` | `--blue-bg` / `--blue` |

---

## 11. Filtros y buscador

Aparecen en las vistas "Me deben" y "Debo", encima de la lista de cards.

```css
.filter-row {
  display: flex;
  gap: 8px;
  margin-bottom: 14px;
  align-items: center;
}

.filter-input {
  flex: 1;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 7px 10px;
  color: var(--txt-primary);
  font-size: 12px;
  outline: none;
  transition: border-color 0.15s;
}

.filter-input:focus {
  border-color: var(--border-strong);
}

.filter-input::placeholder {
  color: var(--txt-muted);
}

.filter-select {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 7px 8px;
  color: var(--txt-secondary);
  font-size: 12px;
  outline: none;
  cursor: pointer;
}
```

---

## 12. Modal "Nueva deuda" y "Registrar pago"

Los modales se muestran sobre un backdrop oscuro. Para evitar el bug de `position: fixed` en iframes, implementarlos como portal en React con `ReactDOM.createPortal`.

```css
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

.modal {
  background: var(--bg-surface);
  border: 1px solid var(--border-strong);
  border-radius: 14px;
  padding: 24px;
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.modal-title {
  font-size: 15px;
  font-weight: 500;
  color: var(--txt-primary);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.form-label {
  font-size: 11px;
  color: var(--txt-secondary);
}

.form-input {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 8px 10px;
  color: var(--txt-primary);
  font-size: 13px;
  outline: none;
  transition: border-color 0.15s;
}

.form-input:focus {
  border-color: var(--accent);
}
```

---

## 13. Estados vacíos (empty states)

Cada lista debe mostrar un estado vacío claro cuando no hay datos.

```jsx
/* Ejemplo para "Me deben" sin deudas */
<div className="empty-state">
  <UserCheck size={32} strokeWidth={1} color="var(--txt-muted)" />
  <p className="empty-title">Nadie te debe nada</p>
  <p className="empty-sub">Crea una deuda nueva cuando alguien te deba plata</p>
  <button className="btn btn-primary">Nueva deuda</button>
</div>
```

```css
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 48px 20px;
  color: var(--txt-muted);
  text-align: center;
}

.empty-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--txt-secondary);
  margin-top: 8px;
}

.empty-sub {
  font-size: 12px;
  color: var(--txt-muted);
  max-width: 220px;
  line-height: 1.5;
}
```

---

## 14. Checklist de implementación UI

### Paso 1 — Configurar Tailwind en modo oscuro
- [ ] Agregar `darkMode: 'class'` en `tailwind.config.js`
- [ ] Añadir clase `dark` en el `<html>` por defecto
- [ ] Definir las variables CSS custom en `index.css`

### Paso 2 — Layout base
- [ ] Crear `AppLayout.jsx` con sidebar + content area
- [ ] Sidebar: logo, nav items, avatar al fondo
- [ ] Topbar: título de página dinámico + botón "Nueva deuda"
- [ ] Rutas protegidas redirigen a `/auth` si no hay sesión

### Paso 3 — Componentes atómicos
- [ ] `Chip.jsx` con variantes por `status`
- [ ] `DebtAvatar.jsx` con iniciales y color según rol
- [ ] `StatCard.jsx` para el dashboard
- [ ] `EmptyState.jsx` reutilizable con ícono, título y subtítulo
- [ ] `Button.jsx` con variantes: `primary`, `pay`, `danger`, `accent`, `ghost`

### Paso 4 — Componentes de dominio
- [ ] `DebtCard.jsx` con barra de progreso y acciones
- [ ] `NotifItem.jsx` con estado leído/no leído
- [ ] `DebtForm.jsx` (modal nueva deuda)
- [ ] `PaymentModal.jsx` (registrar pago parcial)

### Paso 5 — Páginas
- [ ] `Dashboard.jsx` — stat grid + lista reciente
- [ ] `TheyOweMe.jsx` — filtros + lista de deudas como acreedor
- [ ] `IOwe.jsx` — filtros + lista de deudas como deudor
- [ ] `Notifications.jsx` — lista + marcar leídas

### Paso 6 — Detalles finales
- [ ] Formateo de montos con `toLocaleString('es-CO')`
- [ ] Loading skeletons en todas las listas (mismo shape que las cards)
- [ ] Toast de éxito/error en todas las acciones mutativas
- [ ] Responsive: en mobile el sidebar colapsa a un bottom nav de 4 ítems

---

*PágameVe — diseño oscuro, deudas claras.*
