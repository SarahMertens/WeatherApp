import { useEffect, useState } from 'react';
import { addFavorite, deleteFavorite, getFavorites } from '../api';

/** Favorites are identified by their coordinates, just like in the backend. */
function isSameLocation(a, b) {
  return a.latitude === b.latitude && a.longitude === b.longitude;
}

/**
 * Keeps the list of favorite cities in sync with the backend.
 *
 * After every change the list is fetched again, so the UI always shows what
 * is really stored instead of what we assume was stored.
 */
export function useFavorites() {
  const [favorites, setFavorites] = useState([]);
  const [error, setError] = useState('');

  // Initial load.
  useEffect(() => {
    let ignore = false;

    getFavorites()
      .then((items) => {
        if (!ignore) setFavorites(items);
      })
      .catch(() => {
        if (!ignore) setError('Unable to load your favorites.');
      });

    return () => {
      ignore = true;
    };
  }, []);

  const findFavorite = (city) =>
    favorites.find((favorite) => isSameLocation(favorite, city));

  async function run(action, failureMessage) {
    try {
      setError('');
      await action();
      setFavorites(await getFavorites());
    } catch {
      setError(failureMessage);
    }
  }

  function toggleFavorite(city) {
    const existing = findFavorite(city);

    return run(
      () => (existing ? deleteFavorite(existing.id) : addFavorite(city)),
      'Unable to update favorites.',
    );
  }

  function removeFavorite(id) {
    return run(() => deleteFavorite(id), 'Unable to remove favorite.');
  }

  return {
    favorites,
    error,
    isFavorite: (city) => Boolean(findFavorite(city)),
    toggleFavorite,
    removeFavorite,
  };
}
