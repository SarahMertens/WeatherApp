const UNITS = [
  { value: 'celsius', label: '°C', name: 'Celsius' },
  { value: 'fahrenheit', label: '°F', name: 'Fahrenheit' },
];

export default function UnitToggle({ unit, onChange }) {
  return (
    <div
      role="group"
      aria-label="Temperature unit"
      className="flex rounded-xl border border-white/10 bg-white/5 p-1"
    >
      {UNITS.map(({ value, label, name }) => (
        <button
          key={value}
          type="button"
          data-testid={`unit-${value}`}
          aria-label={name}
          aria-pressed={unit === value}
          onClick={() => onChange(value)}
          className={`h-9 w-11 rounded-lg transition-all duration-200 ${
            unit === value
              ? 'bg-white/15 text-white shadow-lg'
              : 'text-slate-400 hover:bg-white/5 hover:text-white'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
