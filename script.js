async function fetchWeather() {
    let searchInput = document.getElementById("search").value;
    const weatherDataSection = document.getElementById("weather-data");
    weatherDataSection.style.display = "block";
    
    require('dotenv').config();
    const apiKey = process.env.WEATHER_API_KEY;

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
    async function getLonAndLat() {
        const geocodeURL = `https://api.openweathermap.org/geo/1.0/direct?q=${searchInput.replace(
            " ",
            "%20"
        )}&limit=1&appid=${apiKey}`;
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
        const weatherURL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`;
        const response = await fetch(weatherURL);
        if (!response.ok) {
            console.log("Failed to fetch weather data");
            return;
        }

        const data = await response.json();

        /* ------ DISPLAY CURRENT WEATHER FORECAST -----------*/
        const currentWeather = data.list[0];
        console.log("currentWeather", currentWeather);
        weatherDataSection.innerHTML = `
      <img src="https://openweathermap.org/img/wn/${currentWeather.weather[0].icon}@2x.png" alt="${currentWeather.weather[0].description}"/>
      <div>
      <h2>${formatDate(new Date(currentWeather.dt_txt))}</h2>
            <h2>${data.city.name}</h2>
            <p><strong>Current Temperature:</strong> ${Math.round(currentWeather.main.temp)}°F</p>
            <p><strong>Humidity:</strong> ${currentWeather.main.humidity}%</p>
            <p><strong>Wind:</strong> ${currentWeather.wind.speed} m/s</p>
            <p><strong>Description:</strong> ${currentWeather.weather[0].description
            }</p>
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
            console.log("forecast", forecast);
            const dayCard = document.createElement("li");
            dayCard.className = "card";
            dayCard.innerHTML = `
            <h3>${formatDate(new Date(forecast.dt_txt))}</h3>
            <h6>Temp: ${Math.round(forecast.main.temp)}°F</h6>
            <h6>Humidity: ${forecast.main.humidity}%</h6>
            <h6>Wind: ${forecast.wind.speed} m/s</h6>
            <h6>Description: ${forecast.weather[0].description}</h6>
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
    const geocodeData = await getLonAndLat();
    if (geocodeData) {
        getWeatherData(geocodeData.lon, geocodeData.lat);
    }
}
