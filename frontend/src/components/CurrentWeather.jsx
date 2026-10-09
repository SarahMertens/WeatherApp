import {
  Cloud,
  CloudRain,
  CloudSnow,
  CloudSun,
  Star,
  Sun,
  Zap,
} from 'lucide-react';

const weatherIcons = {
  sun: Sun,
  'cloud-sun': CloudSun,
  cloud: Cloud,
  'cloud-rain': CloudRain,
  'cloud-snow': CloudSnow,
  zap: Zap,
};

function WeatherIcon({ icon }) {
  const Icon = weatherIcons[icon] ?? Cloud;

  return <Icon size={110} strokeWidth={1.2} aria-hidden />;
}

export default function CurrentWeather({
  city,
  weather,
  isFavorite,
  onFavorite,
}) {
  return (
    <section
      data-testid="current-weather"
      className="min-h-[355px] rounded-[27px] border border-white/10 bg-gradient-to-br from-white/[0.095] to-white/[0.035] p-6 shadow-2xl shadow-black/10 backdrop-blur-xl sm:p-8"
    >
      <div className="flex justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold tracking-[0.15em] text-slate-400">
            CURRENT WEATHER
          </span>

          <h2
            data-testid="city-name"
            className="mt-2 font-['Manrope'] text-2xl font-bold"
          >
            {city.name}
          </h2>

          <p data-testid="city-country" className="mt-1 text-slate-400">
            {city.country}
          </p>
        </div>

        <button
          type="button"
          data-testid="favorite-button"
          onClick={onFavorite}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          aria-pressed={isFavorite}
          className={`grid h-11 w-11 shrink-0 place-items-center rounded-[14px] border transition ${
            isFavorite
              ? 'border-amber-300/20 bg-amber-300/10 text-amber-300'
              : 'border-white/10 bg-white/5 text-slate-400 hover:bg-amber-300/10 hover:text-amber-300'
          }`}
        >
          <Star
            size={23}
            fill={isFavorite ? 'currentColor' : 'none'}
            aria-hidden
          />
        </button>
      </div>

      <div className="mt-9 flex items-center gap-4 sm:gap-12">
        <div className="grid h-[120px] w-[120px] shrink-0 place-items-center rounded-full bg-[radial-gradient(circle,rgba(103,123,255,0.18),transparent_67%)] text-indigo-300 sm:h-[170px] sm:w-[170px]">
          <div className="scale-75 sm:scale-100">
            <WeatherIcon icon={weather.icon} />
          </div>
        </div>

        <div>
          <div
            data-testid="temperature"
            className="font-['Manrope'] text-[64px] leading-[0.9] font-semibold tracking-[-0.07em] sm:text-[96px]"
          >
            {weather.temperature}
            {weather.temperatureUnit}
          </div>

          <h3 data-testid="condition" className="mt-5 text-lg font-semibold">
            {weather.condition}
          </h3>

          <p data-testid="feels-like" className="mt-1 text-slate-400">
            Feels like {weather.feelsLike}
            {weather.temperatureUnit}
          </p>
        </div>
      </div>
    </section>
  );
}