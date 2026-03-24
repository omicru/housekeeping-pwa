import { useMemo, useState } from 'react';
import { LinenModal } from '../components/LinenModal';
import { useApp } from '../lib/AppContext';
import { LinenUsage, MinibarUsage, RoomType, RoomWorkStatus } from '../lib/types';

interface RoomCardItem {
  assignmentId: string;
  roomId: string;
  roomNumber: string;
  floor: number;
  roomType: RoomType;
  status: RoomWorkStatus;
  supervisorNote?: string;
}

export function CamerieraTodayPage(): JSX.Element {
  const { assignments, currentUser, getRoomById, setRoomStatus, completeRoomWithUsage, createCompletionDraft } = useApp();
  const [draft, setDraft] = useState<{ assignmentId: string; linen: LinenUsage; minibar: MinibarUsage } | null>(null);
  const [step, setStep] = useState<1 | 2 | 3>(1);

  if (!currentUser) return <p>Utente non autenticato.</p>;

  const myRooms = useMemo(() => {
    const rows: RoomCardItem[] = [];
    assignments.forEach((assignment) => {
      if (assignment.assignedCamerieraId !== currentUser.id) return;
      const room = getRoomById(assignment.roomId);
      if (!room) return;
      rows.push({
        assignmentId: assignment.id,
        roomId: room.id,
        roomNumber: room.roomNumber,
        floor: room.floor,
        roomType: room.roomType,
        status: assignment.status,
        supervisorNote: assignment.supervisorNote
      });
    });
    return rows.sort((a, b) => Number(a.roomNumber) - Number(b.roomNumber));
  }, [assignments, currentUser.id, getRoomById]);

  const daFare = myRooms.filter((room) => room.status === 'da_fare');
  const inCorso = myRooms.filter((room) => room.status === 'in_corso');
  const completate = myRooms.filter((room) => room.status === 'completata');

  const openCompletionWizard = (assignmentId: string): void => {
    setDraft(createCompletionDraft(assignmentId));
    setStep(1);
  };

  const renderRoomCard = (room: RoomCardItem): JSX.Element => (
    <article key={room.assignmentId} className="card space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold">{room.roomNumber}</h3>
        <span className="chip bg-slate-100 text-slate-700">Piano {room.floor}</span>
      </div>
      <p className="text-sm font-medium text-slate-600">{room.roomType}</p>
      {room.supervisorNote && <p className="rounded-xl bg-amber-100 p-2 text-sm font-semibold text-amber-800">Nota: {room.supervisorNote}</p>}

      {room.status !== 'completata' && (
        <div className="grid grid-cols-2 gap-2">
          {room.status === 'da_fare' ? (
            <button type="button" className="rounded-xl bg-amber-500 py-3 text-lg font-bold text-white" onClick={() => void setRoomStatus(room.assignmentId, 'in_corso')}>
              Inizia
            </button>
          ) : (
            <button type="button" className="rounded-xl border border-slate-300 py-3 text-lg font-bold" onClick={() => void setRoomStatus(room.assignmentId, 'da_fare')}>
              Rimetti da fare
            </button>
          )}
          <button type="button" className="rounded-xl bg-green-600 py-3 text-lg font-bold text-white" onClick={() => openCompletionWizard(room.assignmentId)}>
            Completata
          </button>
        </div>
      )}
    </article>
  );

  return (
    <div className="space-y-4">
      <section className="card">
        <p className="text-sm text-slate-500">Cameriera ai piani</p>
        <h2 className="text-2xl font-bold">{currentUser.fullName}</h2>
        <p className="text-sm">Attive: {daFare.length + inCorso.length} · Completate: {completate.length}</p>
      </section>

      <section className="space-y-2">
        <h3 className="text-sm font-bold uppercase tracking-wide text-slate-600">Camere da fare ({daFare.length})</h3>
        {daFare.length === 0 ? <p className="card text-sm text-slate-500">Nessuna camera da fare.</p> : daFare.map(renderRoomCard)}
      </section>

      <section className="space-y-2">
        <h3 className="text-sm font-bold uppercase tracking-wide text-slate-600">Camere in corso ({inCorso.length})</h3>
        {inCorso.length === 0 ? <p className="card text-sm text-slate-500">Nessuna camera in corso.</p> : inCorso.map(renderRoomCard)}
      </section>

      <section className="space-y-2">
        <h3 className="text-sm font-bold uppercase tracking-wide text-slate-600">Camere completate ({completate.length})</h3>
        {completate.length === 0 ? <p className="card text-sm text-slate-500">Nessuna camera completata.</p> : completate.map(renderRoomCard)}
      </section>

      {draft && (
        <LinenModal
          step={step}
          linen={draft.linen}
          minibar={draft.minibar}
          roomLabel={getRoomById(assignments.find((item) => item.id === draft.assignmentId)?.roomId ?? '')?.roomNumber ?? '-'}
          onClose={() => setDraft(null)}
          onBack={() => setStep((prev) => (prev === 1 ? 1 : ((prev - 1) as 1 | 2 | 3)))}
          onNext={() => setStep((prev) => (prev === 3 ? 3 : ((prev + 1) as 1 | 2 | 3)))}
          onConfirm={() => {
            void completeRoomWithUsage(draft.assignmentId, draft.linen, draft.minibar, currentUser.id);
            setDraft(null);
          }}
          onLinenChange={(key, value) => setDraft((prev) => (prev ? { ...prev, linen: { ...prev.linen, [key]: value } } : prev))}
          onMinibarChange={(key, value) => setDraft((prev) => (prev ? { ...prev, minibar: { ...prev.minibar, [key]: value } } : prev))}
        />
      )}
    </div>
  );
}
