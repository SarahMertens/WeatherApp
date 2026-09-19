import axiosRoot from 'axios';

const baseUrl = import.meta.env.VITE_API_URL;

export const axios = axiosRoot.create({
  baseURL: baseUrl,
});

export async function searchCities(query) {
  const { data } = await axios.get('/cities/search', {
    params: { q: query },
  });

  return data.items;
}

export async function getWeather(
  latitude,
  longitude,
  unit = 'celsius',
) {
  const { data } = await axios.get('/weather', {
    params: {
      latitude,
      longitude,
      unit,
    },
  });

  return data;
}

export async function getFavorites() {
  const { data } = await axios.get('/favorites');
  return data.items;
}

export async function addFavorite(city) {
  const { data } = await axios.post('/favorites', {
    cityName: city.name,
    country: city.country,
    latitude: city.latitude,
    longitude: city.longitude,
  });

  return data;
}

export async function deleteFavorite(id) {
  await axios.delete(`/favorites/${id}`);
}