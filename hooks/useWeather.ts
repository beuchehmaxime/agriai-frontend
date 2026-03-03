import { useQuery } from '@tanstack/react-query';
import { weatherService, WeatherData } from '../services/weatherService';
import * as Location from 'expo-location';

export const useWeather = () => {
    return useQuery<WeatherData, Error>({
        queryKey: ['weather'],
        queryFn: async () => {
            // 1. Request permission
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                throw new Error('Permission to access location was denied. Please enable it in your settings.');
            }

            // 2. Get location 
            const location = await Location.getCurrentPositionAsync({});
            const { latitude, longitude } = location.coords;

            // 3. Get weather data from our OpenMeteo service
            const weatherData = await weatherService.getWeatherByCoords(latitude, longitude);

            // 4. Try to get a human-readable city name via Expo Location reserve geocoding
            try {
                const reverseGeocode = await Location.reverseGeocodeAsync({ latitude, longitude });
                if (reverseGeocode && reverseGeocode.length > 0) {
                    const place = reverseGeocode[0];
                    // Example format: Yaoundé, Cameroon or Subregion, Country
                    weatherData.location = `${place.city || place.subregion || place.name}, ${place.country}`;
                }
            } catch (e) {
                console.log("Could not reverse geocode:", e);
                // Fallback is already the Lat/Lon formatted string in the service
            }

            return weatherData;
        },
        staleTime: 1000 * 60 * 30, // 30 minutes
        retry: 1,
    });
};
