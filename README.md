# Housekeeping Hotel PWA (V1)

PWA mobile-first in italiano per operazioni housekeeping hotel.

## Architettura rapida

- **Frontend:** React + TypeScript + Vite + Tailwind.
- **Routing:** `react-router-dom` con viste dedicate per ruolo.
- **State/data in V1 demo:** `AppContext` con dataset realistico locale e log attività.
- **Backend target:** Supabase (Auth + Postgres + Realtime) con schema SQL e policy RLS in `supabase/schema.sql`.
- **PWA:** manifest e service worker via `vite-plugin-pwa`.

## Flusso core implementato

1. Supervisor apre dashboard/crea giornata.
2. Cameriera vede solo camere assegnate.
3. Tap su **Completata** apre schermata biancheria (0..4).
4. Conferma salva quantità per camera/operatore.
5. Camera passa a completata.
6. Supervisor vede progresso e totali biancheria aggiornati.

## Route principali

- `/` Login
- `/supervisor` Dashboard supervisore
- `/setup` Setup giornata
- `/rooms` Lista camere
- `/rooms/:id` Dettaglio camera
- `/cameriera` Vista cameriera
- `/facchino` Vista facchino
- `/issue` Segnalazioni
- `/history` Storico audit
- `/users` Gestione utenti

## Demo data inclusi

- 149 camere (prevalenza doppie, 15 triple, 2 quadruple)
- Casi realistici:
  - 214 partenza->fermata
  - 307 doppia->tripla
  - 118 urgente
  - 512 fuori servizio
  - 409 riassegnata
- Utenti demo: 1 supervisor, 3 cameriere, 2 facchini

## Setup locale (macchina sviluppo)

### Requisiti

- Node.js **20.x LTS** o **22.x LTS**
- npm **10+**

### Installazione e avvio

```bash
git clone <your-repo-url>
cd housekeeping-pwa
npm install
npm run dev
```

L'app sarà disponibile su `http://localhost:5173`.

### Verifiche richieste

```bash
npm run typecheck
npm run build
npm run preview
```

### Se vedi errori su `vite/client` o `node` types

Di solito significa che i `devDependencies` non sono installati. Esegui:

```bash
rm -rf node_modules package-lock.json
npm install
npm run typecheck
npm run build
```

## Deploy (esempio Vercel/Netlify)

1. Collegare repository.
2. Build command: `npm run build`
3. Output dir: `dist`
4. Configurare variabili Supabase future:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

## Tradeoff V1

- La demo usa store locale per garantire avvio immediato senza backend.
- Lo schema Supabase è pronto, ma integrazione auth/realtime live è il prossimo step.
- Filtri avanzati dashboard sono minimi in V1.

## V2 suggerito

- Collegamento completo a Supabase Auth + realtime channels.
- Sincronizzazione offline write queue.
- Export giornaliero Excel/PDF.
- Config checklist più avanzata per camera.
- Notifiche push per modifiche urgenti.
