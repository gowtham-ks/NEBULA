interface Props {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}

export function Switch({ checked, onChange, label }: Props) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-5 w-9 shrink-0 rounded-full border transition-colors ${
        checked ? 'border-nothing bg-nothing' : 'border-white/20 bg-white/10'
      }`}
    >
      <span
        className={`absolute top-0.5 h-3.5 w-3.5 rounded-full bg-white transition-all ${
          checked ? 'left-[18px]' : 'left-0.5'
        }`}
      />
    </button>
  );
}
