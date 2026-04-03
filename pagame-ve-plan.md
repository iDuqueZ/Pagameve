# 🇻🇪 PágameVe — Plan de Desarrollo MVP

> Gestor de deudas entre usuarios con autenticación y base de datos en Supabase.

---

## 1. Visión general del producto

**PágameVe** es una web app donde cualquier usuario registrado puede registrar deudas con otros usuarios, quienes deben aceptarlas. El flujo parte de la confianza mutua: una deuda no es válida hasta que el deudor la confirma.

**Stack sugerido:**
- **Frontend:** React + Vite + TailwindCSS
- **Backend/DB:** Supabase (Auth + PostgreSQL + Realtime)
- **Hosting:** Vercel o Netlify (frontend gratuito)

---

## 2. Modelo de datos (Supabase / PostgreSQL)

### Tabla: `profiles`
Extiende `auth.users` de Supabase con datos del perfil.

```sql
create table profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  username    text unique not null,
  full_name   text,
  avatar_url  text,
  created_at  timestamptz default now()
);
```

### Tabla: `debts`
Núcleo de la aplicación.

```sql
create table debts (
  id            uuid primary key default gen_random_uuid(),
  creditor_id   uuid not null references profiles(id),   -- quien prestó
  debtor_id     uuid not null references profiles(id),   -- quien debe
  amount        numeric(12, 2) not null check (amount > 0),
  description   text not null,
  due_date      date,
  status        text not null default 'pending_acceptance'
                  check (status in (
                    'pending_acceptance', -- deudor aún no acepta
                    'active',             -- deuda aceptada y vigente
                    'paid',               -- marcada como pagada
                    'forgiven',           -- perdonada por el acreedor
                    'rejected'            -- rechazada por el deudor
                  )),
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);
```

### Tabla: `payments`
Registra pagos parciales o totales sobre una deuda.

```sql
create table payments (
  id         uuid primary key default gen_random_uuid(),
  debt_id    uuid not null references debts(id) on delete cascade,
  amount     numeric(12, 2) not null check (amount > 0),
  note       text,
  paid_at    timestamptz default now()
);
```

### Tabla: `notifications`
Notificaciones internas del sistema.

```sql
create table notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references profiles(id) on delete cascade,
  type        text not null,  -- 'new_debt', 'debt_accepted', 'debt_paid', 'debt_forgiven', 'debt_rejected'
  debt_id     uuid references debts(id) on delete set null,
  message     text not null,
  read        boolean default false,
  created_at  timestamptz default now()
);
```

> **Nota sobre RLS (Row Level Security):** Todas las tablas deben tener RLS habilitado. Un usuario solo puede ver las deudas donde es `creditor_id` o `debtor_id`. Las notificaciones solo las ve su `user_id`.

---

## 3. Arquitectura de la app

```
src/
├── components/
│   ├── ui/              # Botones, modales, badges, inputs reutilizables
│   ├── DebtCard.jsx     # Tarjeta de deuda individual
│   ├── DebtForm.jsx     # Formulario para crear deuda
│   ├── PaymentModal.jsx # Modal para registrar pago
│   └── Navbar.jsx
├── pages/
│   ├── Auth.jsx         # Login / registro
│   ├── Dashboard.jsx    # Resumen general
│   ├── TheyOweMe.jsx    # Lo que me deben
│   ├── IOwe.jsx         # Lo que yo debo
│   └── Notifications.jsx
├── hooks/
│   ├── useDebts.js      # Lógica de fetch y mutaciones de deudas
│   └── useNotifications.js
├── lib/
│   └── supabase.js      # Cliente de Supabase
└── App.jsx
```

---

## 4. Pantallas y funcionalidades MVP

### 4.1 Autenticación (`/auth`)
- Login con email + contraseña vía Supabase Auth
- Registro: email, contraseña, username único, nombre completo
- Redirección automática al dashboard si ya hay sesión activa

---

### 4.2 Dashboard (`/`)
**Objetivo:** de un vistazo, saber el estado financiero informal del usuario.

**Widgets principales:**
| Widget | Descripción |
|---|---|
| 💸 Total que me deben | Suma de `amount` de deudas `active` donde soy acreedor, menos pagos recibidos |
| 🔴 Total que debo | Suma de `amount` de deudas `active` donde soy deudor, menos pagos realizados |
| ⏳ Pendientes de aceptar | Deudas que yo creé y el deudor no ha aceptado aún |
| 🔔 Notificaciones nuevas | Badge con conteo de no leídas |

**Lista de deudas recientes:** las últimas 5 movimientos de cualquier tipo.

---

### 4.3 Me deben (`/they-owe-me`)
Lista de deudas donde el usuario es **acreedor**.

**Funcionalidades:**
- Ver deudas `active`, `pending_acceptance`, `paid`, `forgiven`
- **Filtrar** por deudor (búsqueda por username)
- **Filtrar** por estado
- En cada deuda con estado `active`:
  - Botón **"Registrar pago"** → modal con campo de monto y nota
  - Botón **"Perdonar deuda"** → confirmación antes de ejecutar
- Ver historial de pagos de cada deuda (expandible)
- Crear nueva deuda (botón flotante o CTA superior)

---

### 4.4 Debo (`/i-owe`)
Lista de deudas donde el usuario es **deudor**.

**Funcionalidades:**
- Ver deudas `active`, `pending_acceptance`, `paid`, `forgiven`, `rejected`
- En cada deuda con estado `pending_acceptance`:
  - Botón **"Aceptar deuda"** → cambia status a `active` + dispara notificación al acreedor
  - Botón **"Rechazar deuda"** → cambia status a `rejected` + notificación al acreedor
- **Filtrar** por acreedor
- Ver historial de pagos

---

### 4.5 Notificaciones (`/notifications`)
Centro de alertas del usuario.

**Tipos de notificación:**
| Tipo | Quién la recibe | Cuándo |
|---|---|---|
| `new_debt` | Deudor | Cuando alguien le crea una deuda |
| `debt_accepted` | Acreedor | Cuando el deudor acepta |
| `debt_rejected` | Acreedor | Cuando el deudor rechaza |
| `debt_paid` | Acreedor | Cuando se registra un pago |
| `debt_forgiven` | Deudor | Cuando el acreedor perdona |

- Marcar como leídas (individual o todas)
- Click en notificación → navega a la deuda relevante

---

## 5. Flujo principal: ciclo de vida de una deuda

```
Acreedor crea deuda
        │
        ▼
  [pending_acceptance]  ──────────────────────────────────┐
        │                                                  │
  Deudor recibe notificación                               │
        │                                                  │
    ┌───┴───┐                                              │
    │       │                                              │
 Acepta   Rechaza                                          │
    │       │                                              │
    ▼       ▼                                           (sin cambio)
 [active] [rejected]
    │
    ├──── Acreedor registra pago parcial ──▶ sigue [active]
    │
    ├──── Acreedor registra pago total ───▶ [paid]
    │
    └──── Acreedor perdona ───────────────▶ [forgiven]
```

---

## 6. Paso a paso de implementación

### Fase 0 — Configuración base (Día 1)
- [x] Crear proyecto en Supabase
- [x] Crear las 4 tablas con sus constraints y RLS policies
- [x] Habilitar Auth por email en Supabase
- [x] Crear proyecto React con Vite + TailwindCSS
- [x] Instalar `@supabase/supabase-js`
- [x] Configurar cliente Supabase en `src/lib/supabase.js` con variables de entorno

---

### Fase 1 — Autenticación (Día 1-2)
- [x] Página de login/registro (`/auth`)
- [x] Formulario de registro que crea `profile` después del `signUp`
- [x] `AuthContext` o hook `useUser` para acceso global al usuario
- [x] Rutas protegidas: redirigir a `/auth` si no hay sesión

---

### Fase 2 — Crear deuda (Día 2-3)
- [ ] Formulario `DebtForm.jsx` con campos: username del deudor, monto, descripción, fecha límite (opcional)
- [ ] Buscar usuario por `username` → obtener su `id`
- [ ] Validar que el acreedor no sea igual al deudor
- [ ] Insert en tabla `debts` con status `pending_acceptance`
- [ ] Insert en tabla `notifications` para el deudor
- [ ] Feedback visual de éxito/error

---

### Fase 3 — Vistas Me deben / Debo (Día 3-4)
- [ ] Hook `useDebts(type)` que consulta deudas según rol (`creditor` o `debtor`)
- [ ] Consulta con joins para mostrar nombre del acreedor/deudor
- [ ] `DebtCard.jsx` con estados visuales diferenciados por `status`
- [ ] Filtros por usuario y por estado (controlados con estado local)
- [ ] Acciones de aceptar/rechazar (desde la vista "Debo")
- [ ] Al aceptar/rechazar → update `status` + insert `notification`

---

### Fase 4 — Registrar pago y perdonar (Día 4-5)
- [ ] `PaymentModal.jsx`: campo de monto, nota, confirmación
- [ ] Lógica: si la suma de pagos ≥ monto total → auto-cambiar status a `paid`
- [ ] Acción "Perdonar": update status a `forgiven` + insert notification al deudor
- [ ] Mostrar barra de progreso de pago en `DebtCard` (pagado vs total)

---

### Fase 5 — Dashboard (Día 5)
- [ ] Query agregada: suma de deudas activas como acreedor - pagos recibidos
- [ ] Query agregada: suma de deudas activas como deudor - pagos realizados
- [ ] Conteo de `pending_acceptance`
- [ ] Lista de últimas 5 deudas recientes

---

### Fase 6 — Notificaciones (Día 5-6)
- [ ] Página `/notifications` con lista ordenada por fecha
- [ ] Badge en navbar con conteo de no leídas (query reactiva o Supabase Realtime)
- [ ] Marcar como leída al hacer click
- [ ] Botón "Marcar todas como leídas"

---

### Fase 7 — Pulido y deploy (Día 6-7)
- [ ] Manejo de estados vacíos (empty states con ilustración o copy motivador)
- [ ] Manejo de errores (toasts o mensajes inline)
- [ ] Loading skeletons en listas
- [ ] Responsive mobile-first
- [ ] Deploy en Vercel con variables de entorno de Supabase
- [ ] Verificar RLS: un usuario no puede ver ni modificar deudas ajenas

---

## 7. Políticas RLS recomendadas

```sql
-- Profiles: cualquier usuario autenticado puede leer perfiles (para buscar por username)
create policy "Profiles are viewable by authenticated users"
  on profiles for select using (auth.role() = 'authenticated');

-- Debts: solo puedes ver tus propias deudas
create policy "Users see their own debts"
  on debts for select using (
    auth.uid() = creditor_id or auth.uid() = debtor_id
  );

-- Solo el acreedor puede crear deudas
create policy "Creditor can create debts"
  on debts for insert with check (auth.uid() = creditor_id);

-- Solo acreedor o deudor pueden actualizar (con restricciones de negocio en app)
create policy "Parties can update their debts"
  on debts for update using (
    auth.uid() = creditor_id or auth.uid() = debtor_id
  );

-- Payments: solo el acreedor puede registrar pagos
create policy "Creditor registers payments"
  on payments for insert with check (
    exists (
      select 1 from debts
      where debts.id = debt_id and debts.creditor_id = auth.uid()
    )
  );

-- Notifications: cada quien ve las suyas
create policy "Users see their notifications"
  on notifications for select using (auth.uid() = user_id);
```

---

## 8. Consideraciones para después del MVP

Estas funciones quedan fuera del MVP pero vale anotarlas para no perder el hilo:

| Feature | Razón de diferir |
|---|---|
| Recordatorios automáticos por email | Requiere Edge Functions o cron job |
| Grupos de deuda (deuda compartida entre varios) | Modelo de datos más complejo |
| Historial de actividad por deuda (audit log) | Nice to have, no bloqueante |
| Exportar a PDF/Excel | Bajo impacto en MVP |
| Login con Google/GitHub | Auth social simple pero no prioritaria |
| Foto de perfil | UX enhancement, no MVP |
| Deudas en múltiples monedas | Complejidad innecesaria al inicio |

---

## 9. Estimación de tiempo

| Fase | Días estimados |
|---|---|
| Configuración base | 0.5 |
| Autenticación | 1 |
| Crear deuda | 1 |
| Vistas Me deben / Debo | 1.5 |
| Pagos y perdones | 1 |
| Dashboard | 0.5 |
| Notificaciones | 1 |
| Pulido y deploy | 1 |
| **Total MVP** | **~7.5 días** |

> Estimación asumiendo trabajo a tiempo parcial (~4-5 horas/día) con familiaridad básica en React y Supabase.

---

*PágameVe — porque las deudas entre amigos no deberían arruinar la amistad, solo recordarla.*
