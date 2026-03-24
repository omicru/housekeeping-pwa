import { useParams } from 'react-router-dom';
import { useApp } from '../lib/AppContext';

export function RoomDetailPage(): JSX.Element {
  const { id } = useParams();
  const { rooms, users, updateRoom, currentUser } = useApp();
  const room = rooms.find((r) => r.id === id);

  if (!room) return <p>Camera non trovata.</p>;

  return (
    <div className="space-y-3">
      <h2 className="text-2xl font-bold">Camera {room.roomNumber}</h2>
      <div className="card space-y-3">
        <label className="text-sm font-semibold">Assegnata a</label>
        <select className="w-full rounded-xl border p-3" value={room.assignedUserId} onChange={(e) => updateRoom(room.id, { assignedUserId: e.target.value }, currentUser!.id)}>
          {users.filter((u) => u.role === 'cameriera').map((u) => <option key={u.id} value={u.id}>{u.fullName}</option>)}
        </select>
        <label className="text-sm font-semibold">Note supervisor</label>
        <textarea className="w-full rounded-xl border p-3" value={room.supervisorNote ?? ''} onChange={(e) => updateRoom(room.id, { supervisorNote: e.target.value }, currentUser!.id)} />
      </div>
    </div>
  );
}
