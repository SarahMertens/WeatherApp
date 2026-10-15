/**
 * WMO weather interpretation codes as returned by Open-Meteo.
 * Same table as backend/src/weather/weather-codes.ts, needed here for the demo mode.
 * @see https://open-meteo.com/en/docs#weather_variable_documentation
 */
const UNKNOWN = { condition: 'Unknown', icon: 'cloud' };

const WEATHER_CODES = {
  0: { condition: 'Clear sky', icon: 'sun' },
  1: { condition: 'Mainly clear', icon: 'cloud-sun' },
  2: { condition: 'Partly cloudy', icon: 'cloud-sun' },
  3: { condition: 'Overcast', icon: 'cloud' },
  45: { condition: 'Fog', icon: 'cloud' },
  48: { condition: 'Fog', icon: 'cloud' },
  51: { condition: 'Drizzle', icon: 'cloud-rain' },
  53: { condition: 'Drizzle', icon: 'cloud-rain' },
  55: { condition: 'Drizzle', icon: 'cloud-rain' },
  56: { condition: 'Freezing drizzle', icon: 'cloud-rain' },
  57: { condition: 'Freezing drizzle', icon: 'cloud-rain' },
  61: { condition: 'Rain', icon: 'cloud-rain' },
  63: { condition: 'Rain', icon: 'cloud-rain' },
  65: { condition: 'Rain', icon: 'cloud-rain' },
  66: { condition: 'Freezing rain', icon: 'cloud-rain' },
  67: { condition: 'Freezing rain', icon: 'cloud-rain' },
  71: { condition: 'Snow', icon: 'cloud-snow' },
  73: { condition: 'Snow', icon: 'cloud-snow' },
  75: { condition: 'Snow', icon: 'cloud-snow' },
  77: { condition: 'Snow', icon: 'cloud-snow' },
  80: { condition: 'Rain showers', icon: 'cloud-rain' },
  81: { condition: 'Rain showers', icon: 'cloud-rain' },
  82: { condition: 'Rain showers', icon: 'cloud-rain' },
  85: { condition: 'Snow showers', icon: 'cloud-snow' },
  86: { condition: 'Snow showers', icon: 'cloud-snow' },
  95: { condition: 'Thunderstorm', icon: 'zap' },
  96: { condition: 'Thunderstorm', icon: 'zap' },
  99: { condition: 'Thunderstorm', icon: 'zap' },
};

export function getWeatherInfo(code) {
  return WEATHER_CODES[code] ?? UNKNOWN;
}
