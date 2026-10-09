import { getWeatherInfo } from './weather-codes';

describe('getWeatherInfo', () => {
  it.each([
    [0, 'Clear sky', 'sun'],
    [2, 'Partly cloudy', 'cloud-sun'],
    [3, 'Overcast', 'cloud'],
    [48, 'Fog', 'cloud'],
    [55, 'Drizzle', 'cloud-rain'],
    [65, 'Rain', 'cloud-rain'],
    [67, 'Freezing rain', 'cloud-rain'],
    [75, 'Snow', 'cloud-snow'],
    [82, 'Rain showers', 'cloud-rain'],
    [86, 'Snow showers', 'cloud-snow'],
    [99, 'Thunderstorm', 'zap'],
  ])('maps WMO code %i to %s (%s)', (code, condition, icon) => {
    expect(getWeatherInfo(code)).toEqual({ condition, icon });
  });

  it('falls back to "Unknown" for codes that are not in the table', () => {
    expect(getWeatherInfo(999)).toEqual({
      condition: 'Unknown',
      icon: 'cloud',
    });
    expect(getWeatherInfo(-1)).toEqual({ condition: 'Unknown', icon: 'cloud' });
  });
});
