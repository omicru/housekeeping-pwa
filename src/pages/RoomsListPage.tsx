import { Link } from 'react-router-dom';
import { useApp } from '../lib/AppContext';
import { formatTime } from '../lib/format';

export function RoomsListPage(): JSX.Element {
  const { rooms } = useApp();

  const groupedRooms = {
    da_fare: rooms.filter((room) => room.workflowStatus === 'da_fare'),
    in_corso: rooms.filter((room) => room.workflowStatus === 'in_corso'),
    completata: rooms.filter((room) => room.workflowStatus === 'completata')
  };

  const labels = {
    da_fare: 'Da fare',
    in_corso: 'In corso',
    completata: 'Completate'
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Camere di oggi</h2>
      {(['da_fare', 'in_corso', 'completata'] as const).map((status) => (
        <section key={status} className="space-y-2">
          <h3 className="px-1 text-sm font-semibold uppercase tracking-wide text-slate-500">{labels[status]} ({groupedRooms[status].length})</h3>
          {groupedRooms[status].length === 0 && <p className="card text-sm text-slate-500">Nessuna camera in questa sezione.</p>}
          {groupedRooms[status].map((room) => (
            <Link key={room.id} to={`/rooms/${room.id}`} className="card block">
              <div className="flex items-center justify-between">
                <p className="text-xl font-bold">Camera {room.roomNumber}</p>
                {room.modified && <span className="chip bg-red-100 text-red-800">MODIFICATA</span>}
              </div>
              <p className="text-sm text-slate-600">Piano {room.floor} · {room.roomType} · {room.housekeepingStatus}</p>
              <p className="text-xs text-slate-500">Agg. {formatTime(room.lastUpdatedAt)}</p>
            </Link>
          ))}
        </section>
      ))}
    </div>
  );
}
