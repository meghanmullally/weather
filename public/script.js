async function fetchWeather() {
    let searchInput = document.getElementById("search").value;
    const weatherDataSection = document.getElementById("weather-data");
    weatherDataSection.style.display = "block";

    /* ------ FETCH API KEY FROM SERVER -----------*/
    const apiKeyResponse = await fetch('/api-key');

      // Error handling for API key fetch
      if (!apiKeyResponse.ok) {
        console.error('Error fetching API key:', apiKeyResponse.status);
        weatherDataSection.innerHTML = `
            <div>
                <h2>Error fetching API key. Please try again later.</h2>
            </div>
        `;
        return;
    }

    const apiKeyData = await apiKeyResponse.json();
    const apiKey = apiKeyData.apiKey;

    /* ------ SEARCH INPUT & ERROR HANDLING -----------*/
    if (searchInput === "") {
        weatherDataSection.innerHTML = `
            <div>
                <h2>Empty Input!</h2>
                <p>Please try again with a valid <u>city name</u>.</p>
            </div>
        `;
        return;
    }

    /* ------ API CALL LONG & LAT DATA -----------*/
    async function getLonAndLat(apiKey) {
        const geocodeURL = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(searchInput)}&limit=1&appid=${apiKey}`;
        const response = await fetch(geocodeURL);
        if (!response.ok) {
            console.log("Bad response! ", response.status);
            return null;
        }

        const data = await response.json();
        if (data.length === 0) {
            console.log("Something went wrong here.");
            weatherDataSection.innerHTML = `
                <div>
                    <h2>Invalid Input: "${searchInput}"</h2>
                    <p>Please try again with a valid <u>city name</u>.</p>
                </div>
            `;
            return null;
        } else {
            return data[0];
        }
    }

    /* ------ API CALL WEATHER DATA -----------*/
    async function getWeatherData(lon, lat) {
        const weatherURL = `/weather?city=${encodeURIComponent(searchInput)}`;
        const response = await fetch(weatherURL);
        if (!response.ok) {
            console.log("Failed to fetch weather data");
            const errorData = await response.json();
            weatherDataSection.innerHTML = `
                <div>
                    <h2>Error: ${errorData.error}</h2>
                </div>
            `;
            return;
        }

        const data = await response.json();

        /* ------ DISPLAY CURRENT WEATHER FORECAST -----------*/
        const currentWeather = data.list[0];
        weatherDataSection.innerHTML = `
            <div id="current-weather">
                <div>
                <h2>${data.city.name}</h2>
                <h3>${formatDate(new Date(currentWeather.dt_txt))}</h3>
                <img src="https://openweathermap.org/img/wn/${currentWeather.weather[0].icon}@2x.png" alt="${currentWeather.weather[0].description}"/>
                </div>
                <div>
                    <p><strong>Current Temperature:</strong> ${Math.round(currentWeather.main.temp)}°F</p>
                    <p><strong>Humidity:</strong> ${currentWeather.main.humidity}%</p>
                    <p><strong>Wind:</strong> ${currentWeather.wind.speed} m/s</p>
                    <p><strong>Description:</strong> ${currentWeather.weather[0].description}</p>
                </div>
            </div>
        `;

        /* ------ DISPLAY 5-DAY WEATHER FORECAST -----------*/
        const forecastSection = document.createElement("div");
        forecastSection.className = "days-forecast";
        forecastSection.innerHTML =
            '<h2>5-Day Forecast</h2><ul class="weather-cards"></ul>';

        const weatherCards = forecastSection.querySelector(".weather-cards");
        // Every 8th item represents a day (3-hour intervals)
        const forecastDays = data.list.filter((_, index) => index % 8 === 0);

        forecastDays.forEach((forecast) => {
            const dayCard = document.createElement("li");
            dayCard.className = "card";
            dayCard.innerHTML = `
            <div>
            <h3>${formatDate(new Date(forecast.dt_txt))}</h3>
            <img src="https://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png" alt="${forecast.weather[0].description}"/>
            <p><strong>Temp: </strong> ${Math.round(forecast.main.temp)}°F</p>
            <p><strong>Humidity:</strong> ${forecast.main.humidity}%</p>
            <p><strong>Wind:</strong> ${forecast.wind.speed} m/s</p>
            <p><strong>Description:</strong> ${forecast.weather[0].description}</p>
            </div>
            `;
            weatherCards.appendChild(dayCard);
        });

        weatherDataSection.appendChild(forecastSection);
    }

    function formatDate(date) {
        const options = { year: "numeric", month: "short", day: "numeric" };
        return date.toLocaleDateString("en-US", options);
    }

    document.getElementById("search").value = "";
    const geocodeData = await getLonAndLat(apiKey);
    if (geocodeData) {
        getWeatherData(geocodeData.lon, geocodeData.lat);
    }
}
