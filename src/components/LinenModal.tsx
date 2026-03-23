import { useState } from 'react';

interface Props {
  onConfirm: (values: Record<string, number>) => void;
  onClose: () => void;
}

const fields = [
  { key: 'federe', label: 'Federe' },
  { key: 'lenzuolo', label: 'Lenzuolo' },
  { key: 'coprilenzuolo', label: 'Coprilenzuolo' },
  { key: 'asciugamaniViso', label: 'Asciugamani viso' },
  { key: 'asciugamaniGrandi', label: 'Asciugamani grandi' },
  { key: 'asciugamaniBidet', label: 'Asciugamani bidet' }
] as const;

export function LinenModal({ onConfirm, onClose }: Props): JSX.Element {
  const [values, setValues] = useState<Record<string, number>>(
    fields.reduce((acc, field) => ({ ...acc, [field.key]: 0 }), {})
  );

  return (
    <div className="fixed inset-0 z-30 flex items-end bg-black/40 p-2">
      <div className="max-h-[90vh] w-full overflow-y-auto rounded-2xl bg-white p-4">
        <h3 className="text-xl font-bold">Conferma biancheria</h3>
        <p className="mb-4 text-sm text-slate-600">Seleziona quantità 0..4 per completare la camera.</p>
        <div className="space-y-4">
          {fields.map((field) => (
            <div key={field.key}>
              <p className="mb-2 text-base font-semibold">{field.label}</p>
              <div className="grid grid-cols-5 gap-2">
                {[0, 1, 2, 3, 4].map((value) => (
                  <button
                    type="button"
                    key={value}
                    onClick={() => setValues((prev) => ({ ...prev, [field.key]: value }))}
                    className={`rounded-xl py-3 text-lg font-bold ${
                      values[field.key] === value ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-5 space-y-2">
          <button type="button" onClick={() => onConfirm(values)} className="btn-primary">
            Conferma
          </button>
          <button type="button" onClick={onClose} className="btn-secondary">
            Annulla
          </button>
        </div>
      </div>
    </div>
  );
}
