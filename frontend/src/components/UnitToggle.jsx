export default function UnitToggle({ unit, onChange }) {
  const buttonClass = (value) =>
    `h-9 w-11 rounded-lg transition-all duration-200 ${
      unit === value
        ? 'bg-white/15 text-white shadow-lg'
        : 'text-slate-400 hover:bg-white/5 hover:text-white'
    }`;

  return (
    <div className="flex rounded-xl border border-white/10 bg-white/5 p-1">
      <button
        className={buttonClass('celsius')}
        onClick={() => onChange('celsius')}
        data-testid="unit-celsius"
      >
        °C
      </button>

      <button
        className={buttonClass('fahrenheit')}
        onClick={() => onChange('fahrenheit')}
        data-testid="unit-fahrenheit"
      >
        °F
      </button>
    </div>
  );
}