# Housekeeping Hotel PWA (V1.5 demo)

PWA mobile-first in italiano per operazioni housekeeping reali (supervisor, cameriere ai piani, facchini).

## Cosa include questa V1.5

- **Mappa camere reale** implementata esattamente da specifica (piani 0..6, esclusioni corrette, triple/quadruple corrette).
- **Ruoli demo** separati: supervisor, cameriera, facchino.
- **Workflow cameriera** con sezioni distinte:
  - Camere da fare
  - Camere in corso
  - Camere completate
- **Workflow facchino** con sezioni distinte:
  - Task da fare
  - Task in corso
  - Task completate
- **Flow completamento camera in 3 step**:
  1. Biancheria (selector 0..4)
  2. Minibar (selector 0..4)
  3. Conferma finale
- **Supervisor dashboard operativa** con assegnazione bulk:
  - filtro piano
  - filtro solo camere non assegnate
  - selezione multipla camere
  - assegnazione in un tap verso una cameriera
  - conteggio carico camere per cameriera (target pratico ~14/15)
- **Totali giornalieri demo**:
  - biancheria
  - minibar

## Stack

- React + TypeScript + Vite + Tailwind
- Routing con `react-router-dom`
- PWA (`vite-plugin-pwa`)
- Data model locale pulito, pronto a futura migrazione Supabase

## Route principali

- `/` Login demo
- `/supervisor` Dashboard supervisor
- `/cameriera` Vista cameriera
- `/facchino` Vista facchino

## Avvio locale

```bash
npm install
npm run dev
```

## Verifiche

```bash
npm run typecheck
npm run build
```

## Nota architetturale

Il modello dati locale separa chiaramente:

- camere (`HotelRoom`)
- assegnazioni giornaliere (`DailyRoomAssignment`)
- completamenti con consumi (`RoomCompletion`)
- task facchini (`FacchinoTask`)

Questa struttura è pensata per passare facilmente a Supabase (tabelle relazionali + realtime) in un secondo step.
