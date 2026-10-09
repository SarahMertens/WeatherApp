import {
  CloudSun,
  Droplets,
  Thermometer,
  Wind,
} from 'lucide-react';

export default function WeatherHighlights({ weather }) {
  const highlights = [
    {
      testId: 'highlight-feels-like',
      label: 'Feels like',
      value: `${weather.feelsLike}${weather.temperatureUnit}`,
      icon: Thermometer,
    },
    {
      testId: 'highlight-humidity',
      label: 'Humidity',
      value: `${weather.humidity}%`,
      icon: Droplets,
    },
    {
      testId: 'highlight-wind-speed',
      label: 'Wind speed',
      value: `${weather.windSpeed} ${weather.windSpeedUnit}`,
      icon: Wind,
    },
    {
      testId: 'highlight-condition',
      label: 'Condition',
      value: weather.condition,
      icon: CloudSun,
    },
  ];

  return (
    <section data-testid="highlights">
      <span className="text-[11px] font-bold tracking-[0.15em] text-slate-400">
        TODAY&apos;S HIGHLIGHTS
      </span>

      <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {highlights.map(({ testId, label, value, icon: Icon }) => (
          <article
            key={label}
            data-testid={testId}
            className="min-h-[145px] rounded-[19px] border border-white/10 bg-gradient-to-br from-white/[0.095] to-white/[0.035] p-5 shadow-xl shadow-black/10 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-white/15"
          >
            <div className="mb-5 grid h-10 w-10 place-items-center rounded-xl bg-indigo-400/10 text-indigo-300">
              <Icon size={21} aria-hidden />
            </div>

            <span className="block text-xs text-slate-500">{label}</span>

            <strong
              data-testid="highlight-value"
              className="mt-1 block font-['Manrope'] text-lg"
            >
              {value}
            </strong>
          </article>
        ))}
      </div>
    </section>
  );
}