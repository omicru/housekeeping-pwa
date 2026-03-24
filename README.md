# Housekeeping Hotel PWA (Supabase realtime)

PWA mobile-first in italiano per operazioni housekeeping reali (supervisor, cameriere ai piani, facchini).

Questa versione mantiene il flusso operativo V1.5 (mappa camere, completamento camera in 3 step, sezioni attive/completate, assegnazione bulk supervisor) ma usa persistenza reale Supabase.

## Funzioni principali

- **Auth reale Supabase** email/password.
- **Ruoli reali** da tabella `profiles`: `supervisor`, `cameriera`, `facchino`.
- **Workday persistenti**: giornata attiva/chiusa.
- **Assegnazioni camere persistenti** con stato workflow.
- **Completamento camera in 3 step**:
  1. Biancheria (selector 0..4)
  2. Minibar (selector 0..4)
  3. Conferma finale
- **Task facchini persistenti** con stato da fare/in corso/completata.
- **Realtime Supabase** su workday, room assignments, task, linen, minibar.
- **RLS** per accessi per ruolo e assegnazione.

## Struttura dati Supabase

File SQL principali:

- `supabase/schema.sql`
  - tipi enum ruoli/stati
  - tabelle: `profiles`, `hotel_rooms`, `workdays`, `room_assignments`, `linen_entries`, `minibar_entries`, `facchino_tasks`, `issue_reports`, `app_settings`, `activity_log`
  - view `v_room_completions`
  - trigger `handle_new_user` su `auth.users`
  - policy RLS per supervisor/cameriera/facchino
  - pubblicazione realtime
- `supabase/seed.sql`
  - seed mappa camere reale (149 camere)
  - app settings base
  - guida creazione utenti iniziali

## Setup ambiente

1. Installa dipendenze:

```bash
npm install
```

2. Crea `.env` partendo da `.env.example`:

```bash
cp .env.example .env
```

3. Compila `.env`:

```env
VITE_SUPABASE_URL=https://emavjkfjaggjcxkuogay.supabase.co
VITE_SUPABASE_ANON_KEY=...anon key...
```

> Non committare mai il file `.env`.

## Setup Supabase (Dashboard SQL Editor)

1. Esegui `supabase/schema.sql`.
2. Esegui `supabase/seed.sql`.
3. In **Authentication > Users** crea gli utenti iniziali (email/password).
4. Assicurati che `public.profiles` abbia ruoli corretti.
5. Avvia app locale.

## Avvio locale

```bash
npm run dev
```

## Verifiche

```bash
npm run typecheck
npm run build
```

## Flussi operativi mantenuti

### Cameriera
- Camere da fare
- Camere in corso
- Camere completate
- Tasto `Completata` -> wizard biancheria/minibar/conferma

### Facchino
- Task da fare
- Task in corso
- Task completate

### Supervisor
- Crea/seleziona giornata attiva
- Assegna camere in bulk
- Crea task facchini
- Monitora avanzamento e totali

