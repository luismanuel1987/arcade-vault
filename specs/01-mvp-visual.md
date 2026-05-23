---
id: 01-mvp-visual
state: Implementado
dependencies: ninguna
date: 2026-05-22
---

# 01 — MVP Visual: Arcade Vault

**Objetivo:** Implementar todas las pantallas de Arcade Vault como páginas de Next.js App Router, traduciendo fielmente los templates de referencia sin implementar lógica de juego real.

---

## Scope

### Dentro del scope
- 5 rutas de Next.js App Router con sus páginas correspondientes
- Componente `Nav` compartido (barra de navegación + menú mobile)
- Capas de fondo animadas (`av-bg`, `av-noise`) en el layout raíz
- `UserContext` (cliente) para compartir estado de sesión entre páginas
- Datos mock en `lib/data.ts` (GAMES, CATS, seededScores con tipado TypeScript)
- Todos los efectos visuales del template: tilt en cards, score auto-incrementado,
  pantalla CRT con enemigos animados, modal de game over, guardar puntuación en localStorage
- Navegación con `useRouter` / `<Link>` de Next.js (no hash routing)

### Fuera del scope
- Lógica de juego real (ningún juego funcional)
- Backend, base de datos, API Routes
- Autenticación real (el login solo guarda el nombre en localStorage/contexto)
- Multiplayer
- Tests

---

## Modelo de datos

### `lib/data.ts`
Tipos y datos mock compartidos por toda la aplicación.

```ts
export type Game = {
  id: string;
  title: string;
  short: string;
  long: string;
  cat: string;
  cover: string;        // clase CSS: "cover-bricks", "cover-tetro", etc.
  color: "cyan" | "magenta" | "yellow" | "green";
  best: number;
  plays: string;
};

export type ScoreRow = {
  rank: number;
  name: string;
  score: number;
  date: string;
};

export type User = {
  name: string;         // máx 10 chars, mayúsculas
};

export const GAMES: Game[] = [ /* 8 juegos del template */ ];
export const CATS: string[] = ["TODOS", "ARCADE", "PUZZLE", "SHOOTER", "VERSUS"];
export function seededScores(seed: number, count?: number): ScoreRow[] { ... }
```

### `lib/context/UserContext.tsx`
Context de React (client) para compartir el usuario activo entre `Nav` y páginas.

```ts
// Expone:
type UserContextValue = {
  user: User | null;
  login: (u: User) => void;
  logout: () => void;
};
```
Persiste en `localStorage` bajo la clave `"av_user"`.

### localStorage
| Clave | Contenido |
|---|---|
| `av_user` | `User \| null` — sesión activa |
| `av_scores` | `Array<{ game: string; score: number; name: string; at: number }>` |

---

## Plan de implementación

1. **`lib/data.ts`** — Exportar GAMES, CATS, seededScores con tipos TypeScript.

2. **`lib/context/UserContext.tsx`** — Crear UserProvider + useUser hook.
   Leer/escribir localStorage. Marcar `'use client'`.

3. **`app/layout.tsx`** — Actualizar:
   - Envolver `children` en `<UserProvider>`
   - Agregar `<div className="av-bg" />` y `<div className="av-noise" />`
   - Agregar `<Nav />` antes del `<main>`
   - Agregar `<footer>` con copyright
   - Mantener fuentes Press Start 2P + JetBrains Mono ya configuradas

4. **`components/Nav.tsx`** (`'use client'`) — Barra sticky + menú mobile.
   Usa `useUser()` para mostrar nombre / botón logout.
   Navega con `useRouter` + `<Link>`.

5. **`app/page.tsx`** (`'use client'`) — Pantalla Library (Biblioteca).
   Incluye hero, buscador, chips de categoría y grid de GameCards.

6. **`components/GameCard.tsx`** (`'use client'`) — Card individual con efecto
   tilt 3D en `onMouseMove`. Botón JUGAR navega a `/games/[id]`.

7. **`app/games/[id]/page.tsx`** (server component) — Pantalla GameDetail.
   `await params` para leer `id`. Muestra cover, stats, leaderboard lateral
   y botón ▶ JUGAR AHORA → `/games/[id]/play`.

8. **`app/games/[id]/play/page.tsx`** (`'use client'`) — Pantalla GamePlayer.
   Score auto-incrementado con `setInterval`, pausa, modal de game over,
   guardar puntuación en `av_scores` de localStorage.

9. **`app/auth/page.tsx`** (`'use client'`) — Pantalla Auth.
   Tabs login/registro. Submit llama `login()` del contexto y redirige a `/`.

10. **`app/hall-of-fame/page.tsx`** (`'use client'`) — Pantalla HallOfFame.
    Tabs por juego, pódium top 3, tabla completa. Si hay usuario en contexto
    muestra su fila resaltada.

---

## Criterios de aceptación

- [ ] `/` muestra la biblioteca con hero animado, buscador funcional y grid de 8 cards
- [ ] El filtro por categoría y la búsqueda por nombre reducen las cards visibles en tiempo real
- [ ] Cada card tiene efecto tilt 3D al pasar el mouse
- [ ] `/games/[id]` muestra el cover, stats, descripción, leaderboard lateral y botón JUGAR
- [ ] Navegar a un `id` inexistente no rompe la app (retorna `null` / not found)
- [ ] `/games/[id]/play` muestra el HUD con score que sube automáticamente cada ~220ms
- [ ] El botón PAUSA detiene el contador; REANUDAR lo reactiva
- [ ] El botón FIN abre el modal de game over con la puntuación final
- [ ] El modal permite guardar la puntuación (escribe en `av_scores` de localStorage)
- [ ] `/auth` permite login y registro; al hacer submit guarda el usuario y redirige a `/`
- [ ] JUGAR COMO INVITADO cierra el formulario y redirige a `/` sin guardar usuario
- [ ] `/hall-of-fame` muestra pódium top 3 y tabla de 12 filas por juego
- [ ] Cambiar el tab de juego en Hall of Fame actualiza pódium y tabla
- [ ] Si hay usuario en sesión, su fila aparece resaltada en amarillo al final de la tabla
- [ ] El `Nav` muestra el nombre del usuario logueado; al hacer clic cierra sesión
- [ ] El menú hamburger funciona en mobile (panel lateral con backdrop)
- [ ] Las capas `av-bg` y `av-noise` se ven en todas las páginas
- [ ] `npm run build` completa sin errores de TypeScript ni de Next.js

---

## Decisiones tomadas y descartadas

| Decisión | Elegida | Descartada | Motivo |
|---|---|---|---|
| Navegación | Rutas Next.js App Router (`/games/[id]`, etc.) | Hash routing del template | URLs limpias, SSR-friendly, convención del proyecto |
| Estilos | `globals.css` existente + Tailwind para lo nuevo | Migrar todo a utilitarios Tailwind | El CSS ya está completo y migrado; duplicar trabajo no aporta valor en el MVP |
| Estado de usuario | `UserContext` (React Context + localStorage) | Zustand / Jotai / leer localStorage en cada componente | Mínima dependencia, suficiente para el alcance del MVP |
| `GameDetail` | Server Component (await params, datos estáticos) | Client Component | No necesita estado; aprovechar el default de App Router |
| Autenticación | Simulada (solo guarda nombre en contexto) | Auth real (NextAuth, Supabase, etc.) | Fuera del scope del MVP visual |
| Datos mock | `lib/data.ts` con tipos TypeScript | Inline en cada componente | Reutilización entre páginas, única fuente de verdad |

---

## Riesgos identificados

1. **`params` como Promise (Next.js 16).**
   En `app/games/[id]/page.tsx` y `app/games/[id]/play/page.tsx` los params
   son `Promise<{ id: string }>` — hay que hacer `await params` antes de leer
   `id`. Olvidarlo genera un error en runtime difícil de diagnosticar.

2. **`UserProvider` en el layout raíz.**
   `app/layout.tsx` es un Server Component; no puede importar directamente un
   Client Component con lógica de estado. La solución es extraer el provider a
   un archivo separado con `'use client'` y usarlo como wrapper en el layout.
   Si se añade `'use client'` al layout directamente se pierde el SSR de todas
   las páginas.

3. **Z-index de las capas de fondo.**
   `.av-bg` (z-index 0) y `.av-noise` (z-index 1) son `position: fixed`.
   El contenido principal debe tener z-index ≥ 2 para no quedar tapado.
   El `globals.css` ya define `#root { z-index: 2 }`, pero en Next.js no hay
   `#root` — habrá que asegurarse de que el wrapper equivalente en el layout
   tenga el z-index correcto.
