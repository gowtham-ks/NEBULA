import type { ReactNode } from 'react';

export function Slider(p: {
  label: string; value: number; min: number; max: number; step?: number; unit?: string;
  onChange: (v: number) => void; onClear?: () => void; isDefault?: boolean;
}) {
  return (
    <label className="block">
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="text-neutral-400">{p.label}</span>
        <span className="flex items-center gap-2">
          <span className="font-display text-neutral-200">{p.isDefault ? 'Site default' : `${p.value}${p.unit ?? ''}`}</span>
          {p.onClear && !p.isDefault && (
            <button type="button" onClick={p.onClear} className="text-neutral-500 hover:text-white">Default</button>
          )}
        </span>
      </div>
      <input
        type="range" min={p.min} max={p.max} step={p.step ?? 1} value={p.value}
        onChange={(e) => p.onChange(Number(e.target.value))}
        className="w-full accent-nothing"
      />
    </label>
  );
}

export function ColorField(p: { label: string; value: string | null; onChange: (v: string | null) => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm">{p.label}</span>
      <div className="flex items-center gap-2">
        <input
          type="color" value={p.value ?? '#000000'} onChange={(e) => p.onChange(e.target.value)}
          className="h-7 w-10 cursor-pointer rounded border border-white/20 bg-transparent"
        />
        {p.value ? (
          <button onClick={() => p.onChange(null)} className="text-xs text-neutral-500 hover:text-white">Default</button>
        ) : (
          <span className="text-xs text-neutral-600">Site default</span>
        )}
      </div>
    </div>
  );
}

export function SelectField(p: {
  label: string; value: string; options: [string, string][]; onChange: (v: string) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-3">
      <span className="text-sm">{p.label}</span>
      <select
        value={p.value} onChange={(e) => p.onChange(e.target.value)}
        className="rounded-card border border-white/15 bg-graphite px-2 py-1 text-sm"
      >
        {p.options.map(([l, v]) => <option key={v + l} value={v}>{l}</option>)}
      </select>
    </label>
  );
}

export function Card({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <section className="glass max-w-xl space-y-4 p-4">
      {title && <p className="label-dot">{title}</p>}
      {children}
    </section>
  );
}
