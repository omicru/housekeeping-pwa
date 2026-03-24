import { LinenUsage, MinibarUsage } from '../lib/types';

interface CompletionWizardProps {
  step: 1 | 2 | 3;
  linen: LinenUsage;
  minibar: MinibarUsage;
  roomLabel: string;
  onClose: () => void;
  onBack: () => void;
  onNext: () => void;
  onConfirm: () => void;
  onLinenChange: (key: keyof LinenUsage, value: number) => void;
  onMinibarChange: (key: keyof MinibarUsage, value: number) => void;
}

function SelectorRow({
  label,
  value,
  onChange
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}): JSX.Element {
  return (
    <div className="space-y-2 rounded-xl border border-slate-200 p-3">
      <p className="text-sm font-semibold uppercase tracking-wide text-slate-600">{label}</p>
      <div className="grid grid-cols-5 gap-2">
        {[0, 1, 2, 3, 4].map((num) => (
          <button
            key={num}
            type="button"
            onClick={() => onChange(num)}
            className={`rounded-xl py-3 text-lg font-bold ${
              value === num ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            {num}
          </button>
        ))}
      </div>
    </div>
  );
}

export function LinenModal({
  step,
  linen,
  minibar,
  roomLabel,
  onClose,
  onBack,
  onNext,
  onConfirm,
  onLinenChange,
  onMinibarChange
}: CompletionWizardProps): JSX.Element {
  return (
    <div className="fixed inset-0 z-30 flex items-end bg-black/40 p-3">
      <div className="max-h-[95vh] w-full overflow-y-auto rounded-2xl bg-white p-4">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-sm text-slate-500">Camera {roomLabel}</p>
            <h3 className="text-xl font-bold">
              {step === 1 ? 'Step 1 · Biancheria' : step === 2 ? 'Step 2 · Minibar' : 'Step 3 · Conferma'}
            </h3>
          </div>
          <button type="button" className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold" onClick={onClose}>
            Chiudi
          </button>
        </div>

        {step === 1 && (
          <div className="space-y-3">
            <SelectorRow label="federe" value={linen.federe} onChange={(value) => onLinenChange('federe', value)} />
            <SelectorRow label="lenzuolo" value={linen.lenzuolo} onChange={(value) => onLinenChange('lenzuolo', value)} />
            <SelectorRow label="coprilenzuolo" value={linen.coprilenzuolo} onChange={(value) => onLinenChange('coprilenzuolo', value)} />
            <SelectorRow label="asciugamani viso" value={linen.asciugamaniViso} onChange={(value) => onLinenChange('asciugamaniViso', value)} />
            <SelectorRow label="asciugamani grandi" value={linen.asciugamaniGrandi} onChange={(value) => onLinenChange('asciugamaniGrandi', value)} />
            <SelectorRow label="asciugamani bidet" value={linen.asciugamaniBidet} onChange={(value) => onLinenChange('asciugamaniBidet', value)} />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3">
            <SelectorRow label="acqua naturale" value={minibar.acquaNaturale} onChange={(value) => onMinibarChange('acquaNaturale', value)} />
            <SelectorRow label="acqua frizzante" value={minibar.acquaFrizzante} onChange={(value) => onMinibarChange('acquaFrizzante', value)} />
            <SelectorRow label="coca cola" value={minibar.cocaCola} onChange={(value) => onMinibarChange('cocaCola', value)} />
            <SelectorRow label="estathe" value={minibar.estathe} onChange={(value) => onMinibarChange('estathe', value)} />
            <SelectorRow label="fanta" value={minibar.fanta} onChange={(value) => onMinibarChange('fanta', value)} />
            <SelectorRow label="succo" value={minibar.succo} onChange={(value) => onMinibarChange('succo', value)} />
            <SelectorRow label="snack dolce" value={minibar.snackDolce} onChange={(value) => onMinibarChange('snackDolce', value)} />
            <SelectorRow label="snack salato" value={minibar.snackSalato} onChange={(value) => onMinibarChange('snackSalato', value)} />
            <SelectorRow label="prosecco" value={minibar.prosecco} onChange={(value) => onMinibarChange('prosecco', value)} />
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 text-sm">
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="mb-2 font-semibold">Riepilogo biancheria</p>
              <p>Federe {linen.federe} · Lenzuolo {linen.lenzuolo} · Coprilenzuolo {linen.coprilenzuolo}</p>
              <p>Viso {linen.asciugamaniViso} · Grandi {linen.asciugamaniGrandi} · Bidet {linen.asciugamaniBidet}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="mb-2 font-semibold">Riepilogo minibar</p>
              <p>Acqua N {minibar.acquaNaturale} · Acqua F {minibar.acquaFrizzante} · Coca {minibar.cocaCola} · Estathe {minibar.estathe}</p>
              <p>Fanta {minibar.fanta} · Succo {minibar.succo} · Dolce {minibar.snackDolce} · Salato {minibar.snackSalato} · Prosecco {minibar.prosecco}</p>
            </div>
          </div>
        )}

        <div className="mt-4 grid grid-cols-2 gap-2">
          {step > 1 ? (
            <button type="button" className="rounded-xl border border-slate-300 py-3 font-semibold" onClick={onBack}>
              Indietro
            </button>
          ) : (
            <div />
          )}
          {step < 3 ? (
            <button type="button" className="rounded-xl bg-slate-900 py-3 font-semibold text-white" onClick={onNext}>
              Avanti
            </button>
          ) : (
            <button type="button" className="rounded-xl bg-green-600 py-3 font-semibold text-white" onClick={onConfirm}>
              Conferma completamento
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
