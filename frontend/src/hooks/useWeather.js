import { useEffect, useState } from 'react';
import { getWeather } from '../api';

/**
 * Loads the current weather for a city in the given unit.
 *
 * Every result is stored together with the request it belongs to. Whatever is
 * on screen therefore always matches the selected city and unit: while a new
 * request is running we report `loading`, and a slow response for a previous
 * city can never overwrite the weather of the current one.
 */
export function useWeather(city, unit) {
  const { latitude, longitude } = city;
  const requestKey = `${latitude},${longitude},${unit}`;

  const [result, setResult] = useState(null);

  useEffect(() => {
    let ignore = false;

    getWeather(latitude, longitude, unit)
      .then((weather) => {
        if (!ignore) setResult({ requestKey, weather });
      })
      .catch(() => {
        if (!ignore) {
          setResult({
            requestKey,
            error: 'Unable to load the weather right now.',
          });
        }
      });

    return () => {
      ignore = true;
    };
  }, [latitude, longitude, unit, requestKey]);

  const isCurrent = result?.requestKey === requestKey;

  return {
    loading: !isCurrent,
    weather: isCurrent ? (result.weather ?? null) : null,
    error: isCurrent ? (result.error ?? '') : '',
  };
}
