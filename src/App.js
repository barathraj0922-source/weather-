import React, { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [city, setCity] = useState("Chennai");
  const [searchCity, setSearchCity] = useState("Chennai");

  const [weather, setWeather] = useState(null);
  const [location, setLocation] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Get weather whenever city changes
  useEffect(() => {
    const searchWeather = async () => {
      if (city.trim() === "") {
        setError("Please enter a city name.");
        return;
      }

      setLoading(true);
      setError("");

      try {
        // Step 1: Find the city
        const locationResponse = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
            city
          )}&count=1&language=en&format=json`
        );

        if (!locationResponse.ok) {
          throw new Error("Unable to find the city.");
        }

        const locationData = await locationResponse.json();

        if (
          !locationData.results ||
          locationData.results.length === 0
        ) {
          throw new Error("City not found.");
        }

        const cityData = locationData.results[0];

        // Step 2: Get weather
        const weatherResponse = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${cityData.latitude}&longitude=${cityData.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,weather_code&timezone=auto`
        );

        if (!weatherResponse.ok) {
          throw new Error("Unable to get weather data.");
        }

        const weatherData = await weatherResponse.json();

        setLocation(cityData);
        setWeather(weatherData);
        setSearchCity(cityData.name);
      } catch (err) {
        setError(err.message);
        setWeather(null);
        setLocation(null);
      } finally {
        setLoading(false);
      }
    };

    searchWeather();
  }, [city]);

  // Weather description
  const getWeatherDescription = (code) => {
    const weatherCodes = {
      0: "Clear sky",
      1: "Mainly clear",
      2: "Partly cloudy",
      3: "Overcast",
      45: "Fog",
      48: "Depositing rime fog",
      51: "Light drizzle",
      53: "Moderate drizzle",
      55: "Dense drizzle",
      61: "Slight rain",
      63: "Moderate rain",
      65: "Heavy rain",
      71: "Slight snow",
      73: "Moderate snow",
      75: "Heavy snow",
      80: "Slight rain showers",
      81: "Moderate rain showers",
      82: "Violent rain showers",
      95: "Thunderstorm",
      96: "Thunderstorm with hail",
      99: "Thunderstorm with heavy hail",
    };

    return weatherCodes[code] || "Unknown weather";
  };

  // Weather icon
  const getWeatherIcon = (code) => {
    if (code === 0) {
      return "☀️";
    }

    if (code === 1 || code === 2) {
      return "🌤️";
    }

    if (code === 3) {
      return "☁️";
    }

    if (code >= 45 && code <= 48) {
      return "🌫️";
    }

    if (code >= 51 && code <= 67) {
      return "🌧️";
    }

    if (code >= 71 && code <= 77) {
      return "❄️";
    }

    if (code >= 80 && code <= 82) {
      return "🌦️";
    }

    if (code >= 95) {
      return "⛈️";
    }

    return "🌤️";
  };

  // Search button
  const handleSubmit = (event) => {
    event.preventDefault();

    const trimmedCity = searchCity.trim();

    if (trimmedCity === "") {
      setError("Please enter a city name.");
      return;
    }

    setCity(trimmedCity);
  };

  return (
    <div className="app">
      <div className="weather-container">

        <div className="header">
          <h1>🌤️ Weather App</h1>
          <p>Check the current weather of any city</p>
        </div>

        <form
          className="search-box"
          onSubmit={handleSubmit}
        >
          <input
            type="text"
            placeholder="Enter city name..."
            value={searchCity}
            onChange={(event) =>
              setSearchCity(event.target.value)
            }
          />

          <button type="submit">
            🔍 Search
          </button>
        </form>

        {/* Loading */}
        {loading && (
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading weather...</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="error">
            <span>⚠️</span>
            <p>{error}</p>
          </div>
        )}

        {/* Weather */}
        {weather && location && !loading && !error && (
          <div className="weather-content">

            <div className="location">
              <h2>📍 {location.name}</h2>

              <p>
                {location.admin1
                  ? `${location.admin1}, `
                  : ""}
                {location.country}
              </p>
            </div>

            <div className="main-weather">

              <div className="weather-icon">
                {getWeatherIcon(
                  weather.current.weather_code
                )}
              </div>

              <div>
                <div className="temperature">
                  {Math.round(
                    weather.current.temperature_2m
                  )}
                  °C
                </div>

                <p className="description">
                  {getWeatherDescription(
                    weather.current.weather_code
                  )}
                </p>
              </div>

            </div>

            <div className="weather-details">

              {/* Feels Like */}
              <div className="detail-card">
                <span className="detail-icon">
                  🌡️
                </span>

                <div>
                  <p>Feels Like</p>

                  <strong>
                    {Math.round(
                      weather.current.apparent_temperature
                    )}
                    °C
                  </strong>
                </div>
              </div>

              {/* Humidity */}
              <div className="detail-card">
                <span className="detail-icon">
                  💧
                </span>

                <div>
                  <p>Humidity</p>

                  <strong>
                    {weather.current.relative_humidity_2m}%
                  </strong>
                </div>
              </div>

              {/* Wind */}
              <div className="detail-card">
                <span className="detail-icon">
                  💨
                </span>

                <div>
                  <p>Wind Speed</p>

                  <strong>
                    {weather.current.wind_speed_10m} km/h
                  </strong>
                </div>
              </div>

            </div>

            <div className="updated">
              Weather information loaded successfully.
            </div>

          </div>
        )}

        <div className="footer">
          <p>Built with React ⚛️</p>
        </div>

      </div>
    </div>
  );
}

export default App;