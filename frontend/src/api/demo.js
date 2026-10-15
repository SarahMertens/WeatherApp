import { getWeatherInfo } from './wmoCodes';

/**
 * Demo data source: the same five functions as `http.js`, but without our own backend.
 *
 * - Cities and weather come straight from Open-Meteo (free, no API key, CORS allowed).
 * - Favorites are kept in this browser's localStorage instead of MySQL.
 *
 * The return values match the backend's responses exactly, so the components
 * and hooks don't know (or care) which data source is used.
 */

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';
const MAX_RESULTS = 10;
const REQUEST_TIMEOUT_MS = 10000;
const STORAGE_KEY = 'weatherly-demo-favorites';

const CURRENT_FIELDS = [
  'temperature_2m',
  'apparent_temperature',
  'relative_humidity_2m',
  'wind_speed_10m',
  'weather_code',
];

/** Shown the very first time, so the favorites panel isn't empty. */
const STARTER_FAVORITES = [
  { id: 1, cityName: 'Ghent', country: 'Belgium', latitude: 51.05, longitude: 3.71667 },
  { id: 2, cityName: 'Ostend', country: 'Belgium', latitude: 51.21551, longitude: 2.927 },
];

async function getJson(url, params) {
  const query = new URLSearchParams(params);
  const response = await fetch(`${url}?${query.toString()}`, {
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(`Open-Meteo returned status ${response.status}`);
  }

  return response.json();
}

export async function searchCities(query) {
  const data = await getJson(GEOCODING_URL, {
    name: query,
    count: String(MAX_RESULTS),
    language: 'en',
    format: 'json',
  });

  // Open-Meteo leaves `results` out entirely when nothing matches.
  return (data.results ?? []).map((city) => ({
    name: city.name,
    country: city.country ?? 'Unknown',
    latitude: city.latitude,
    longitude: city.longitude,
  }));
}

export async function getWeather(latitude, longitude, unit = 'celsius') {
  const { current } = await getJson(FORECAST_URL, {
    latitude: String(latitude),
    longitude: String(longitude),
    current: CURRENT_FIELDS.join(','),
    temperature_unit: unit,
    wind_speed_unit: 'kmh',
  });

  const { condition, icon } = getWeatherInfo(current.weather_code);

  return {
    temperature: Math.round(current.temperature_2m),
    feelsLike: Math.round(current.apparent_temperature),
    humidity: current.relative_humidity_2m,
    windSpeed: current.wind_speed_10m,
    condition,
    icon,
    temperatureUnit: unit === 'fahrenheit' ? '°F' : '°C',
    windSpeedUnit: 'km/h',
  };
}

/* ---------- favorites in localStorage ---------- */

function readFavorites() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === null) return STARTER_FAVORITES;

  try {
    const items = JSON.parse(stored);
    return Array.isArray(items) ? items : [];
  } catch {
    return []; // damaged data: start over
  }
}

function writeFavorites(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export async function getFavorites() {
  return readFavorites();
}

export async function addFavorite(city) {
  const items = readFavorites();

  // Same rule as the unique index on (latitude, longitude) in the database.
  if (items.some((f) => f.latitude === city.latitude && f.longitude === city.longitude)) {
    throw new Error('This location is already in your favorites');
  }

  const favorite = {
    id: Math.max(0, ...items.map((f) => f.id)) + 1,
    cityName: city.name,
    country: city.country,
    latitude: city.latitude,
    longitude: city.longitude,
  };

  writeFavorites([...items, favorite]);
  return favorite;
}

export async function deleteFavorite(id) {
  const items = readFavorites();

  if (!items.some((f) => f.id === id)) {
    throw new Error('No favorite exists with this id');
  }

  writeFavorites(items.filter((f) => f.id !== id));
}
