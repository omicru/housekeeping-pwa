import { useApp } from '../lib/AppContext';

export function SetupWorkdayPage(): JSX.Element {
  const { createWorkday } = useApp();

  return (
    <div className="card space-y-3">
      <h2 className="text-2xl font-bold">Setup giornata</h2>
      <p className="text-sm">Crea o aggiorna il piano giornaliero e sincronizza assegnazioni camere/task.</p>
      <button type="button" className="btn-primary" onClick={createWorkday}>Genera giornata operativa</button>
    </div>
  );
}
