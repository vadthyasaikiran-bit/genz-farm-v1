import { WeatherData } from './types';

function getWeatherCondition(code: number): string {
  if (code === 0) return 'Clear Sky';
  if (code === 1 || code === 2) return 'Partly Cloudy';
  if (code === 3) return 'Overcast';
  if (code === 45 || code === 48) return 'Foggy';
  if (code >= 51 && code <= 55) return 'Light Drizzle';
  if (code >= 61 && code <= 65) return 'Rain Showers';
  if (code >= 71 && code <= 77) return 'Snow / Hail';
  if (code >= 80 && code <= 82) return 'Heavy Rain Showers';
  if (code >= 95) return 'Thunderstorm';
  return 'Fair / Variable';
}

export function isValidCoordinate(latStr?: string | null, lonStr?: string | null): boolean {
  if (!latStr || !lonStr) return false;
  const lat = parseFloat(String(latStr).trim());
  const lon = parseFloat(String(lonStr).trim());
  if (isNaN(lat) || isNaN(lon)) return false;
  if (lat < -90 || lat > 90) return false;
  if (lon < -180 || lon > 180) return false;
  return true;
}

export async function fetchLiveWeather(
  latitudeStr?: string | null,
  longitudeStr?: string | null
): Promise<WeatherData> {
  if (!isValidCoordinate(latitudeStr, longitudeStr)) {
    return {
      temperature: 0,
      conditionDescription: 'Weather Unavailable',
      isUnavailable: true,
      unavailableReason:
        'Missing or unverified GPS coordinates. Under GenZ Farm core principles, coordinates must be explicitly verified; weather will never be guessed from village text.',
    };
  }

  const lat = parseFloat(String(latitudeStr).trim());
  const lon = parseFloat(String(longitudeStr).trim());

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto&forecast_days=7`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Weather service returned HTTP ${response.status}`);
    }

    const data = await response.json();
    const current = data.current;
    const daily = data.daily;

    const conditionDescription = getWeatherCondition(current.weather_code || 0);

    const forecast = (daily?.time || []).map((date: string, index: number) => ({
      date,
      tempMax: Math.round(daily.temperature_2m_max?.[index] ?? 0),
      tempMin: Math.round(daily.temperature_2m_min?.[index] ?? 0),
      rainMm: Math.round((daily.precipitation_sum?.[index] ?? 0) * 10) / 10,
      condition: getWeatherCondition(daily.weather_code?.[index] ?? 0),
    }));

    return {
      temperature: Math.round(current.temperature_2m),
      humidity: Math.round(current.relative_humidity_2m),
      weatherCode: current.weather_code,
      windSpeed: Math.round(current.wind_speed_10m),
      conditionDescription,
      rainProbability: daily?.precipitation_sum?.[0] > 0 ? 80 : 10,
      forecast,
      isUnavailable: false,
      fetchedAt: new Date().toISOString(),
    };
  } catch (err: any) {
    return {
      temperature: 0,
      conditionDescription: 'Live Weather Unavailable',
      isUnavailable: true,
      unavailableReason: `Could not retrieve live weather for (${lat}, ${lon}): ${err.message || 'Network error'}. Refusing to fabricate fallback weather.`,
    };
  }
}
