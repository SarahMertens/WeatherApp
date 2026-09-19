import { useEffect, useState } from 'react';
import {
  LoaderCircle,
  MapPin,
  Search,
} from 'lucide-react';
import { searchCities } from '../api';

export default function CitySearch({ onSelect }) {
  const [query, setQuery] = useState('');
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const trimmedQuery = query.trim();

    if (trimmedQuery.length < 2) {
      setCities([]);
      setError('');
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        setLoading(true);
        setError('');

        const results = await searchCities(trimmedQuery);
        setCities(results);
      } catch {
        setCities([]);
        setError('Unable to search cities.');
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  function selectCity(city) {
    onSelect(city);
    setQuery('');
    setCities([]);
  }

  return (
    <div className="relative z-20 w-full">
      <div className="flex h-[50px] items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.07] px-4 backdrop-blur-xl transition focus-within:border-indigo-400/60 focus-within:bg-white/10">
        <Search
          size={20}
          className="shrink-0 text-slate-400"
        />

        <input
          data-testid="city-search-input"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search for a city..."
          className="w-full border-0 bg-transparent text-white outline-none placeholder:text-slate-500"
        />

        {loading && (
          <LoaderCircle
            data-testid="search-loader"
            size={18}
            className="shrink-0 animate-spin text-slate-400"
          />
        )}
      </div>

      {(cities.length > 0 || error) && (
        <div
          data-testid="city-search-results"
          className="absolute top-[58px] w-full overflow-hidden rounded-2xl border border-white/10 bg-[#0f162a]/95 p-2 shadow-2xl backdrop-blur-2xl">
          {error ? (
            <p
              data-testid="city-search-error"
              className="px-3 py-3 text-sm text-red-300"
            >
              {error}
            </p>
          ) : (
            cities.map((city, index) => (
              <button
                key={`${city.latitude}-${city.longitude}-${index}`}
                data-testid="city-option"
                onClick={() => selectCity(city)}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-slate-200 transition hover:bg-white/[0.07]"
              >
                <MapPin
                  size={17}
                  className="shrink-0 text-indigo-300"
                />

                <span className="flex flex-col">
                  <strong className="font-medium">
                    {city.name}
                  </strong>

                  <small className="mt-0.5 text-slate-500">
                    {city.country}
                  </small>
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}