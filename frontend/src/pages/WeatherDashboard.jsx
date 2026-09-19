import { useEffect, useState } from 'react';
import { CloudSun } from 'lucide-react';

import {
  addFavorite,
  deleteFavorite,
  getFavorites,
  getWeather,
} from '../api';

import CitySearch from '../components/CitySearch';
import CurrentWeather from '../components/CurrentWeather';
import Favorites from '../components/Favorites';
import UnitToggle from '../components/UnitToggle';
import WeatherHighlights from '../components/WeatherHighlights';

const DEFAULT_CITY = {
  name: 'Ghent',
  country: 'Belgium',
  latitude: 51.05,
  longitude: 3.71667,
};

export default function WeatherDashboard() {
  const [city, setCity] = useState(DEFAULT_CITY);
  const [weather, setWeather] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [unit, setUnit] = useState('celsius');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadFavorites();
  }, []);

 useEffect(() => {
    loadWeather(city, unit);
  }, [city, unit]);

  async function loadWeather(selectedCity, selectedUnit) {
    try {
      setLoading(true);
      setError('');

      const data = await getWeather(
        selectedCity.latitude,
        selectedCity.longitude,
        selectedUnit,
      );

      setWeather(data);
    } catch {
      setError('Unable to load the weather right now.');
    } finally {
      setLoading(false);
    }
  }

  async function loadFavorites() {
    try {
      const data = await getFavorites();
      setFavorites(data);
    } catch {
      setFavorites([]);
    }
  }

  async function handleFavorite() {
    try {
      const favorite = favorites.find(
        (item) =>
          item.latitude === city.latitude &&
          item.longitude === city.longitude,
      );

      if (favorite) {
        await deleteFavorite(favorite.id);
      } else {
        await addFavorite(city);
      }

      await loadFavorites();
    } catch {
      setError('Unable to update favorites.');
    }
  }

  async function handleDeleteFavorite(id) {
    try {
      await deleteFavorite(id);
      await loadFavorites();
    } catch {
      setError('Unable to remove favorite.');
    }
  }

  const isFavorite = favorites.some(
    (favorite) =>
      favorite.latitude === city.latitude &&
      favorite.longitude === city.longitude,
  );

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#080d1a] text-slate-50">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(64,98,255,0.22),transparent_30%),radial-gradient(circle_at_90%_15%,rgba(139,92,246,0.16),transparent_30%),linear-gradient(145deg,#070b16_0%,#0c1326_55%,#10172b_100%)]" />

      <div className="pointer-events-none absolute top-[35%] -left-[150px] h-[350px] w-[350px] rounded-full bg-blue-600/30 blur-[100px]" />

      <div className="pointer-events-none absolute -top-[100px] -right-[180px] h-[400px] w-[400px] rounded-full bg-violet-600/30 blur-[100px]" />

      <div className="relative z-10 mx-auto w-[calc(100%-24px)] max-w-[1180px] py-5 sm:w-[calc(100%-40px)] sm:py-8">
        {/* Header */}
        <header className="grid grid-cols-[1fr_auto] items-center gap-5 lg:grid-cols-[1fr_minmax(280px,470px)_1fr] lg:gap-8">
          <div className="flex items-center gap-3 font-['Manrope'] text-xl font-extrabold">
            <div className="grid h-11 w-11 place-items-center rounded-[14px] border border-white/10 bg-white/[0.08]">
              <CloudSun size={27} />
            </div>

            <span data-testid="app-title">Weatherly</span>
          </div>

          <div className="justify-self-end lg:order-3">
            <UnitToggle unit={unit} onChange={setUnit} />
          </div>

          <div className="col-span-2 lg:order-2 lg:col-span-1">
            <CitySearch onSelect={setCity} />
          </div>
        </header>

        {/* Intro */}
        <section className="my-12 sm:my-16 lg:mt-[75px] lg:mb-9">
          <span className="text-[11px] font-bold tracking-[0.15em] text-slate-400">
            WEATHER DASHBOARD
          </span>

          <h1 className="mt-2 max-w-[650px] font-['Manrope'] text-4xl leading-[1.08] font-extrabold tracking-[-0.04em] sm:text-5xl lg:text-[55px]">
            Your weather,
            <span className="text-indigo-400"> at a glance.</span>
          </h1>

          <p className="mt-3 text-slate-400">
            Search any city and discover its current conditions.
          </p>
        </section>

        {error && (
          <div
            data-testid="error"
            className="mb-5 rounded-2xl border border-red-400/20 bg-red-400/[0.08] p-5 text-red-200">
            {error}
          </div>
        )}

        {loading ? (
          <div
            data-testid="loader"
            className="grid min-h-[355px] place-items-center rounded-[27px] border border-white/10 bg-white/5 backdrop-blur-xl">
            <div className="flex flex-col items-center gap-4 text-slate-400">
              <div className="h-9 w-9 animate-spin rounded-full border-2 border-white/10 border-t-indigo-400" />

              <span className="text-sm">
                Loading weather...
              </span>
            </div>
          </div>
        ) : (
          weather && (
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(270px,0.8fr)]">
              <div className="flex min-w-0 flex-col gap-7">
                <CurrentWeather
                  city={city}
                  weather={weather}
                  isFavorite={isFavorite}
                  onFavorite={handleFavorite}
                />

                <WeatherHighlights weather={weather}/>
              </div>

              <Favorites
                favorites={favorites}
                onSelect={setCity}
                onDelete={handleDeleteFavorite}
              />
            </div>
          )
        )}

        <footer className="pt-10 text-center text-xs text-slate-600">
          Weather data provided by Open-Meteo
        </footer>
      </div>
    </main>
  );
}