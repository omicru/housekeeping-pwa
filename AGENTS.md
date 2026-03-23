# Project instructions

Build a mobile-first housekeeping hotel PWA in Italian.

Product priorities:
1. Simplicity for room attendants
2. Fast taps and readable UI
3. Correct role-based access
4. Realtime updates
5. Reliable room completion flow with linen counts

Project rules:
- Do not build a generic task manager.
- This must feel like a real hotel housekeeping operations tool.
- Keep the UX very simple and operational.
- Use large buttons, large text, and concise labels.
- Default all visible UI labels to Italian.
- Prefer Supabase for auth, Postgres, and realtime.
- Keep TypeScript types clean and explicit.
- Keep components reusable but pragmatic.
- Prioritize mobile-first design over desktop polish.
- Avoid unnecessary complexity, animations, and extra features in V1.
- The most important flow is:
  supervisor manages the day -> cameriera sees assigned rooms -> cameriera taps "Completata" -> linen usage screen appears with selectors 0..4 -> confirms -> room is completed -> supervisor sees updated totals.

Implementation guidance:
- Use React + TypeScript + Vite + Tailwind.
- Build an installable PWA with manifest and service worker.
- Enforce role-based access properly.
- Ensure workers only see their own current-day assignments.
- Supervisor can see all data and daily totals.
- Include realistic seed/demo data.

Before finishing:
- run typecheck
- run build
- fix obvious errors
- remove placeholder content
- ensure the main flow works end-to-end
