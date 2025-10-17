// Weather service placeholder
export class WeatherService {
  static async getCurrentWeather(lat: number, lon: number) {
    // Mock weather data for demo
    return {
      temperature: 72,
      humidity: 45,
      windSpeed: 5,
      conditions: 'Sunny',
      forecast: [
        { day: 'Today', high: 75, low: 62, conditions: 'Sunny' },
        { day: 'Tomorrow', high: 78, low: 65, conditions: 'Partly Cloudy' }
      ]
    };
  }

  static async getWeatherHistory(lat: number, lon: number, days: number = 7) {
    // Mock historical weather data
    return Array.from({ length: days }, (_, i) => ({
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      temperature: 70 + Math.random() * 10,
      humidity: 40 + Math.random() * 20,
      windSpeed: 3 + Math.random() * 7
    }));
  }
}