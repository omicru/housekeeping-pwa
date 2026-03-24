export function formatTime(iso?: string): string {
  if (!iso) return '-';
  return new Date(iso).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
}

export function statusColor(status: string): string {
  if (status === 'urgente') return 'bg-red-100 text-red-800';
  if (status === 'in_corso') return 'bg-yellow-100 text-yellow-800';
  if (status === 'completata' || status === 'fatto') return 'bg-green-100 text-green-800';
  return 'bg-slate-100 text-slate-700';
}
