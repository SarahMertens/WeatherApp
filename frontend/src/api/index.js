import * as backend from './http';
import * as demo from './demo';

/**
 * Which data source the app uses is decided when the app is built:
 *
 * - `pnpm build`       → our NestJS backend (VITE_API_URL)
 * - `pnpm build:demo`  → demo mode: Open-Meteo directly and favorites in the browser
 *                        (reads `.env.demo`, which sets VITE_DEMO=true)
 *
 * Components and hooks always import from here, so they work with both.
 */
export const IS_DEMO = import.meta.env.VITE_DEMO === 'true';

const source = IS_DEMO ? demo : backend;

export const { searchCities, getWeather, getFavorites, addFavorite, deleteFavorite } = source;
