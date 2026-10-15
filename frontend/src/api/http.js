import axios from 'axios';

const api = axios.create({
  // Falls back to the backend's default dev address when no .env is present.
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api',
  timeout: 10000,
});

export async function searchCities(query) {
  const { data } = await api.get('/cities/search', {
    params: { q: query },
  });

  return data.items;
}

export async function getWeather(latitude, longitude, unit = 'celsius') {
  const { data } = await api.get('/weather', {
    params: { latitude, longitude, unit },
  });

  return data;
}

export async function getFavorites() {
  const { data } = await api.get('/favorites');

  return data.items;
}

export async function addFavorite(city) {
  const { data } = await api.post('/favorites', {
    cityName: city.name,
    country: city.country,
    latitude: city.latitude,
    longitude: city.longitude,
  });

  return data;
}

export async function deleteFavorite(id) {
  await api.delete(`/favorites/${id}`);
}
