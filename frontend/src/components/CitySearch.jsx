import { useEffect, useState } from 'react';
import { LoaderCircle, MapPin, Search } from 'lucide-react';
import { searchCities } from '../api';

const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 300;

export default function CitySearch({ onSelect }) {
  const [query, setQuery] = useState('');
  // `null` means "nothing to show"; an empty array means "searched, no match".
  const [cities, setCities] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const trimmedQuery = query.trim();

  useEffect(() => {
    if (trimmedQuery.length < MIN_QUERY_LENGTH) return;

    let ignore = false;

    // Wait until the user pauses typing, so we send one request per search
    // instead of one per keystroke.
    const timeout = setTimeout(async () => {
      setLoading(true);

      try {
        const results = await searchCities(trimmedQuery);

        // `ignore` is true when the query changed in the meantime: an older,
        // slower response must not replace the results of a newer search.
        if (!ignore) {
          setCities(results);
          setError('');
        }
      } catch {
        if (!ignore) {
          setCities(null);
          setError('Unable to search cities.');
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      ignore = true;
      clearTimeout(timeout);
    };
  }, [trimmedQuery]);

  function reset() {
    setQuery('');
    setCities(null);
    setError('');
    setLoading(false);
  }

  function handleChange(event) {
    const value = event.target.value;

    if (value.trim().length < MIN_QUERY_LENGTH) {
      reset();
    }

    setQuery(value);
  }

  function selectCity(city) {
    onSelect(city);
    reset();
  }

  const showResults = Boolean(error) || cities !== null;

  return (
    <div className="relative z-20 w-full">
      <div className="flex h-[50px] items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.07] px-4 backdrop-blur-xl transition focus-within:border-indigo-400/60 focus-within:bg-white/10">
        <Search size={20} className="shrink-0 text-slate-400" aria-hidden />

        <input
          data-testid="city-search-input"
          type="text"
          value={query}
          onChange={handleChange}
          onKeyDown={(event) => {
            if (event.key === 'Escape') reset();
          }}
          placeholder="Search for a city..."
          aria-label="Search for a city"
          autoComplete="off"
          className="w-full border-0 bg-transparent text-white outline-none placeholder:text-slate-500"
        />

        {loading && (
          <LoaderCircle
            data-testid="search-loader"
            size={18}
            className="shrink-0 animate-spin text-slate-400"
            aria-label="Searching"
          />
        )}
      </div>

      {showResults && (
        <div
          data-testid="city-search-results"
          className="absolute top-[58px] w-full overflow-hidden rounded-2xl border border-white/10 bg-[#0f162a]/95 p-2 shadow-2xl backdrop-blur-2xl"
        >
          {error ? (
            <p
              data-testid="city-search-error"
              role="alert"
              className="px-3 py-3 text-sm text-red-300"
            >
              {error}
            </p>
          ) : cities.length === 0 ? (
            <p
              data-testid="city-search-empty"
              className="px-3 py-3 text-sm text-slate-400"
            >
              No cities found.
            </p>
          ) : (
            <ul>
              {cities.map((city, index) => (
                <li key={`${city.latitude},${city.longitude},${index}`}>
                  <button
                    type="button"
                    data-testid="city-option"
                    onClick={() => selectCity(city)}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-slate-200 transition hover:bg-white/[0.07] focus-visible:bg-white/[0.07] focus-visible:outline-none"
                  >
                    <MapPin
                      size={17}
                      className="shrink-0 text-indigo-300"
                      aria-hidden
                    />

                    <span className="flex flex-col">
                      <strong className="font-medium">{city.name}</strong>

                      <small className="mt-0.5 text-slate-500">
                        {city.country}
                      </small>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
