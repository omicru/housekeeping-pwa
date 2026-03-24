import { useState } from 'react';
import { LinenModal } from '../components/LinenModal';
import { useApp } from '../lib/AppContext';
import { formatTime, statusColor } from '../lib/format';

export function CamerieraTodayPage(): JSX.Element {
  const { currentUser, rooms, startRoom, completeRoom, reportIssue, settings } = useApp();
  const [linenRoomId, setLinenRoomId] = useState<string | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);

  if (!currentUser) return <p>Utente non autenticato.</p>;

  const assigned = rooms.filter((room) => room.assignedUserId === currentUser.id);
  const activeRooms = assigned.filter((room) => room.workflowStatus !== 'completata');
  const completedRooms = assigned.filter((room) => room.workflowStatus === 'completata');

  return (
    <div className="space-y-3">
      <div className="card">
        <p className="text-sm text-slate-500">Cameriera</p>
        <h2 className="text-2xl font-bold">{currentUser.fullName}</h2>
        <p className="text-sm">Attive: {activeRooms.length} · Completate: {completedRooms.length}</p>
      </div>

      {activeRooms.length === 0 ? (
        <div className="card text-center text-sm font-semibold text-green-700">Tutte le camere assegnate sono completate.</div>
      ) : (
        activeRooms.map((room) => (
          <article key={room.id} className="card space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">{room.roomNumber}</h3>
              {room.modified && <span className="chip bg-red-100 text-red-700">MODIFICATA</span>}
            </div>
            <p className="text-sm">Piano {room.floor} · Stato {room.housekeepingStatus} · Persone {room.peopleCount}</p>
            <div className="flex flex-wrap gap-1">
              <span className={`chip ${statusColor(room.workflowStatus)}`}>{room.workflowStatus}</span>
              {room.extraBed && <span className="chip bg-indigo-100 text-indigo-700">Letto extra</span>}
              {room.balcony && <span className="chip bg-teal-100 text-teal-700">Balcone</span>}
              {(room.roomType === 'tripla' || room.roomType === 'quadrupla') && (
                <span className="chip bg-purple-100 text-purple-700">{room.roomType}</span>
              )}
            </div>
            {room.supervisorNote && <p className="rounded-lg bg-red-50 p-2 text-sm font-semibold text-red-700">Nota: {room.supervisorNote}</p>}
            <p className="text-xs text-slate-500">Ultimo aggiornamento {formatTime(room.lastUpdatedAt)}</p>
            <div className="grid grid-cols-3 gap-2">
              <button type="button" onClick={() => startRoom(room.id, currentUser.id)} className="rounded-xl bg-yellow-500 py-3 font-semibold text-white">
                Inizia
              </button>
              <button
                type="button"
                onClick={() => {
                  if (settings.mandatoryLinenOnComplete) setLinenRoomId(room.id);
                  else {
                    completeRoom(
                      room.id,
                      {
                        federe: 0,
                        lenzuolo: 0,
                        coprilenzuolo: 0,
                        asciugamaniViso: 0,
                        asciugamaniGrandi: 0,
                        asciugamaniBidet: 0
                      },
                      currentUser.id
                    );
                  }
                }}
                className="rounded-xl bg-green-600 py-3 font-semibold text-white"
              >
                Completata
              </button>
              <button
                type="button"
                onClick={() =>
                  reportIssue(
                    {
                      createdBy: currentUser.id,
                      roomAssignmentId: room.id,
                      category: 'richiesta_supervisor',
                      note: `Supporto richiesto camera ${room.roomNumber}`
                    },
                    currentUser.id
                  )
                }
                className="rounded-xl bg-red-600 py-3 font-semibold text-white"
              >
                Segnala
              </button>
            </div>
          </article>
        ))
      )}

      <button type="button" className="btn-secondary" onClick={() => setShowCompleted((prev) => !prev)}>
        {showCompleted ? 'Nascondi completate' : 'Mostra completate'}
      </button>

      {showCompleted && (
        <div className="space-y-2">
          <h3 className="text-lg font-bold">Camere completate</h3>
          {completedRooms.length === 0 ? (
            <div className="card text-sm text-slate-500">Nessuna camera completata.</div>
          ) : (
            completedRooms.map((room) => (
              <article key={room.id} className="card">
                <p className="text-lg font-bold">Camera {room.roomNumber}</p>
                <p className="text-sm text-slate-600">Completata alle {formatTime(room.completedAt)}</p>
              </article>
            ))
          )}
        </div>
      )}

      {linenRoomId && (
        <LinenModal
          onClose={() => setLinenRoomId(null)}
          onConfirm={(values) => {
            completeRoom(linenRoomId, values as never, currentUser.id);
            setLinenRoomId(null);
          }}
        />
      )}
    </div>
  );
}
