import axios from 'axios';

// We use Open-Meteo as it requires no API key and provides excellent free forecasting
const BASE_URL = 'https://api.open-meteo.com/v1/forecast';
const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';

export interface WeatherData {
    current: {
        temp: number;
        condition: string;
        windSpeed: number;
        humidity: number;
        precipitationProb: number;
        isDay: boolean;
        weatherCode: number;
    };
    forecast: {
        day: string;
        tempMax: number;
        tempMin: number;
        condition: string;
        weatherCode: number;
        precipitationProb: number;
    }[];
    location: string;
}

// Maps WMO Weather codes to our UI conditions
const getWeatherCondition = (code: number): string => {
    if (code === 0) return 'Clear sky';
    if (code === 1 || code === 2 || code === 3) return 'Partly cloudy';
    if (code === 45 || code === 48) return 'Foggy';
    if (code >= 51 && code <= 55) return 'Drizzle';
    if (code >= 61 && code <= 65) return 'Rain';
    if (code >= 71 && code <= 77) return 'Snow';
    if (code >= 80 && code <= 82) return 'Rain showers';
    if (code >= 95 && code <= 99) return 'Thunderstorm';
    return 'Unknown';
};

export const weatherService = {
    getWeatherByCoords: async (lat: number, lon: number): Promise<WeatherData> => {
        try {
            // 1. Get location name (Reverse Geocoding isn't directly on OpenMeteo, but we can do a proximity search or just use Lat/Lon if it fails)
            // For simplicity, we'll try to get the nearest city from the geocoding API if we need its name,
            // but for coordinates, we just fetch weather first.

            const weatherResponse = await axios.get(BASE_URL, {
                params: {
                    latitude: lat,
                    longitude: lon,
                    current: 'temperature_2m,relative_humidity_2m,is_day,precipitation,weather_code,wind_speed_10m',
                    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
                    timezone: 'auto'
                }
            });

            const data = weatherResponse.data;
            const current = data.current;
            const daily = data.daily;

            // Format daily forecast (next 5 days)
            const forecastDays = [];
            const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

            // Loop from tomorrow (index 1) to day 5 (index 5)
            for (let i = 1; i <= 5; i++) {
                if (daily.time[i]) {
                    const date = new Date(daily.time[i]);
                    forecastDays.push({
                        day: daysOfWeek[date.getDay()],
                        tempMax: Math.round(daily.temperature_2m_max[i]),
                        tempMin: Math.round(daily.temperature_2m_min[i]),
                        condition: getWeatherCondition(daily.weather_code[i]),
                        weatherCode: daily.weather_code[i],
                        precipitationProb: daily.precipitation_probability_max[i] || 0
                    });
                }
            }

            return {
                current: {
                    temp: Math.round(current.temperature_2m),
                    condition: getWeatherCondition(current.weather_code),
                    windSpeed: Math.round(current.wind_speed_10m),
                    humidity: Math.round(current.relative_humidity_2m),
                    precipitationProb: daily.precipitation_probability_max[0] || current.precipitation || 0,
                    isDay: current.is_day === 1,
                    weatherCode: current.weather_code
                },
                forecast: forecastDays,
                // We'll update the location name in the hook using expo-location's reverse geocode
                location: `${lat.toFixed(2)}, ${lon.toFixed(2)}`
            };
        } catch (error: any) {
            console.error('Error fetching weather data:', error.message);
            throw new Error('Failed to fetch weather data.');
        }
    }
};
