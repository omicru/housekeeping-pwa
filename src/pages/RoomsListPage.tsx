import { Link } from 'react-router-dom';
import { useApp } from '../lib/AppContext';
import { formatTime } from '../lib/format';

export function RoomsListPage(): JSX.Element {
  const { rooms } = useApp();

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-bold">Camere di oggi</h2>
      {rooms.map((room) => (
        <Link key={room.id} to={`/rooms/${room.id}`} className="card block">
          <div className="flex items-center justify-between">
            <p className="text-xl font-bold">Camera {room.roomNumber}</p>
            {room.modified && <span className="chip bg-red-100 text-red-800">MODIFICATA</span>}
          </div>
          <p className="text-sm text-slate-600">Piano {room.floor} · {room.roomType} · {room.housekeepingStatus}</p>
          <p className="text-xs text-slate-500">Agg. {formatTime(room.lastUpdatedAt)}</p>
        </Link>
      ))}
    </div>
  );
}
