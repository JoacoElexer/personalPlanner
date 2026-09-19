# Personal Planner

Planificador personal multiplataforma (Android y Windows desktop) con tareas,
sub-tareas y categorías, persistencia **local-first** y sincronización en la nube
con **Supabase**. Una sola base de código web (React + Vite + TypeScript) empaquetada
con **Capacitor**.

## Características

- **Tareas**: título, descripción, categoría, estado, prioridad, deadline (fecha y
  hora) y agenda para el calendario (día + rango horario).
- **Sub-tareas**: estructura jerárquica ilimitada (auto-relación en la misma tabla).
- **Categorías**: color + icono, agrupación y conteo de tareas.
- **Vistas inteligentes**: buckets por vencimiento (Vencidas / Hoy / Próximas / Más
  adelante / Sin fecha / Completadas), búsqueda y filtros.
- **Offline-first**: todo el CRUD se guarda al instante en `localStorage` y se
  sincroniza con la nube cuando hay conexión (realtime incluido).
- **Auth**: email + contraseña con Supabase Auth, RLS por usuario.

## Estado del proyecto

| Módulo | Estado |
| --- | --- |
| Auth | ✅ Implementado |
| Tareas + sub-tareas | ✅ Implementado |
| Categorías | ✅ Implementado |
| Sincronización local-first + Supabase | ✅ Implementado |
| Dashboard (widgets/gráficos) | 🚧 Fase 4 (próxima) |
| Calendario (semana/mes) | 🚧 Fase 4 (próxima) |

## Stack

React 19 · TypeScript 6 · Vite 8 · Tailwind v4 · shadcn/ui · Zustand ·
react-hook-form + zod · date-fns · Supabase · Capacitor (Android + Electron ·
desktop Windows) · Vitest · oxlint · Prettier

## Cómo empezar

```bash
npm install
npm run dev          # http://localhost:5173
```

Sin credenciales de Supabase la app arranca igual y muestra las instrucciones de
configuración. Para activar la nube:

1. Creamos un proyecto en [supabase.com](https://supabase.com).
2. Ejecutamos la migración `supabase/migrations/0001_init.sql` (SQL Editor o
   `supabase db push`).
3. Copiamos `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` a un archivo `.env`
   (ver `.env.example`).

## Scripts

```bash
npm run dev            # dev server
npm run typecheck      # tsc -b
npm run lint           # oxlint
npm test               # vitest run
npm run build          # tsc -b && vite build
npm run android:sync   # build + cap sync android
npm run android:open   # Android Studio
npm run desktop:sync   # build + cap sync @capawesome/capacitor-electron
npm run desktop:run    # app desktop (Windows)
npm run desktop:package
```

## Documentación

- **`docs/README.md`** — documentación técnica completa (arquitectura, módulos,
  backend, conexión a la base en la nube, reproducción paso a paso para otro dev).
- **`AGENTS.md`** — contexto del proyecto para agentes de programación (convenciones,
  comandos, mapa de módulos).

## Roadmap

- **Fase 4**: calendario semana/mes + dashboard con widgets y gráficos
  personalizables (config local, sin sync) usando recharts.
- Fases posteriores: notificaciones, configuración avanzada, etc.