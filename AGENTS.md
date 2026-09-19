# AGENTS.md — Contexto del proyecto

> Este archivo resume el contexto completo de **Personal Planner** para que cualquier
> agente (IA o dev humano) pueda trabajar sin fricciones. Leerlo antes de tocar código.
> La documentación técnica detallada vive en `docs/README.md`.

## Qué es

Aplicación de planificación personal multiplataforma (Android + Windows desktop) con
tareas, sub-tareas y categorías. Persistencia **local-first** (localStorage) y
sincronización en la nube con **Supabase** (Postgres + Auth + Realtime).

## Stack (versiones reales)

- Node 24+, npm 11+, Vite 8, React 19, TypeScript 6 (`tsc -b`)
- Tailwind CSS v4 (`@tailwindcss/vite`), shadcn/ui (radix-ui), `next-themes`
- Zustand 5, react-hook-form + zod + `@hookform/resolvers`, date-fns 4 (locale `es`)
- @supabase/supabase-js 2.116, lucide-react, sonner, recharts 3 (dashboard futuro)
- Capacitor 8: `@capacitor/android` + `@capawesome/capacitor-electron` (Windows)
- Tests: Vitest 5, jsdom, Testing Library · Lint: oxlint · Formato: Prettier

## Comandos

```bash
npm run dev            # dev server
npm run typecheck      # tsc -b
npm run lint           # oxlint
npm test               # vitest run (CI)
npm run test:watch     # vitest watch
npm run format         # prettier --write .
npm run build          # tsc -b && vite build
npm run android:sync   # build + cap sync android
npm run android:open   # Android Studio
npm run desktop:sync   # build + cap sync @capawesome/capacitor-electron
npm run desktop:run    # app desktop Windows
npm run desktop:package
```

**Antes de dar una tarea por terminada:** `npm run lint`, `npm run typecheck`,
`npm test` y `npm run build`.

## Convenciones (obligatorias)

- **[Verbose TS]**: `erasableSyntaxOnly` prohibe `enum` → usar uniones de literales
  (`TASK_STATUSES`, `TaskStatus`, etc.). `verbatimModuleSyntax` → usar `import type`.
- **Alias `@/*`** → `./src/*`. Los `paths` están en el **`tsconfig.json` raíz**
  (con project references) — NO usar `baseUrl` (deprecado en TS6).
- **Routing**: `HashRouter` (obligatorio para Capacitor/Electron). Páginas **lazy**
  y con **export default**.
- **Offline-first**: en la UI nunca se lee/escribe Supabase directo; todo pasa por
  los stores Zustand, que persisten en localStorage y encolan en la outbox.
- **Soft delete**: `deleted = true` (filtra `visibleTasks`); `removeTask` borra toda
  la rama de descendientes.
- **Fechas**: strings `YYYY-MM-DD` (`date` input) y `HH:mm` (`time` input). Fechas
  armadas con `toDateKey()` (nunca `toISOString` para el día local).
- **Radix Select**: los `SelectItem` NO aceptan `value=""` → usar centinela
  (`'__none__'` en TaskFormDialog).
- **Toast**: sonner (`toast.success(...)`).
- **Idioma UI**: español rioplatense.
- **Sin comentarios** salvo pedido explícito.

## Arquitectura en una línea

UI (páginas lazy) → stores Zustand (auth / data / sync) → `persistence.ts`
(localStorage: datos, outbox, checkpoints) ↔ `sync.ts` (push outbox, pull
incremental por checkpoint, Realtime) → Supabase. Merge **LWW** por `updated_at`
(`merge.ts`).

Claves de localStorage: `pp:data:{userId}`, `pp:outbox:{userId}`,
`pp:checkpoint:{userId}:{table}`.

## Mapa de módulos (`src/`)

| Ruta | Contenido |
| --- | --- |
| `App.tsx` | HashRouter + AuthGate + DataBootstrap + páginas lazy |
| `components/ui/` | 20 componentes shadcn (primitivas) |
| `components/layout/` | `AppShell` (sidebar lg+, bottom-nav móvil), `PageHeader` |
| `components/tasks/` | `TaskCard`, `TaskFormDialog`, `SubtaskList`, `ConfirmDialog`, `statusBadges` |
| `components/categories/` | `CategoryIcon`, `CategoryEditorDialog` |
| `components/form/` | `FormSelect` (Select con react-hook-form) |
| `lib/persistence.ts` | localStorage (datos, outbox, checkpoints) |
| `lib/merge.ts` | merge LWW genérico |
| `lib/sync.ts` | push/pull/Realtime/triggers online/focus/60s |
| `lib/supabase.ts` | cliente supabase-js + `isSupabaseConfigured` |
| `lib/taskUtils.ts` | buckets, `isOverdue`, sub-tareas, `sortTasksByDue`, `toDateKey` |
| `lib/dateUtils.ts` | formatos de fecha en español (Hoy/Mañana/EEE d MMM) |
| `pages/` | `auth/AuthPage`, `TasksPage`, `CategoriesPage`, `SettingsPage` (real); `DashboardPage`, `CalendarPage` (placeholders) |
| `stores/` | `useAuthStore`, `useDataStore` (CRUD + outbox), `useSyncStore` |
| `types/index.ts` | tipos de dominio + constantes (statuses, prioridades, colores, iconos) |

## Backend (Supabase)

- Migración única: `supabase/migrations/0001_init.sql`.
  - Tablas: `profiles`, `categories`, `tasks` (sub-tareas = `parent_id` self FK).
  - Trigger `handle_new_user` crea `profiles` al registrarse.
  - Trigger `set_updated_at` refresca `updated_at` en cada UPDATE (clave del LWW).
  - RLS por `user_id = auth.uid()` en todas las tablas.
  - Realtime: `tasks` y `categories` agregadas a `supabase_realtime`.
- Envíroment: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` en `.env`
  (`.env.example` es la plantilla). Sin ellas, `isSupabaseConfigured=false` → la app
  muestra pantalla de setup. `.env` y `docs/` están en `.gitignore`.
- **RLS es la seguridad real**; la `anon key` es pública. Nunca usar `service_role`.

## Estados del proyecto

- **Fase 1** ✅ — Scaffold, Tailwind+shadcn, Capacitor Android/Electron.
- **Fase 2** ✅ — Tipos, stores, local-first (persistencia/outbox/checkpoints), sync
  + Realtime, AuthPage, migración SQL.
- **Fase 3** ✅ — Núcleo de tareas/categorías: CRUD, sub-tareas, buckets, filtros,
  TaskCard/FormDialog, CategoriesPage, testes.
- **Fase 4** 🚧 — **Próxima**: CalendarPage (semana/mes con `due_date` y
  `scheduled_date`) + DashboardPage real (widgets + gráficos recharts,
  personalizable SOLO local, sin sync).

## Regla del equipo

**Cada vez que se avanza una fase (o se agrega un módulo relevante), actualizar
`docs/README.md` y este `AGENTS.md`** (mapa de módulos, estados, convenciones que
surjan). `docs/` es local (gitignored); `AGENTS.md` y `README.md` sí se versionan.