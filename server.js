import fetch from 'node-fetch';
import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Route to fetch API key
app.get('/api-key', (req, res) => {
    res.json({ apiKey: process.env.WEATHER_API_KEY });
});

// Route to fetch weather data
app.get('/weather', async (req, res) => {
    const city = req.query.city;
    const apiKey = process.env.WEATHER_API_KEY;

    if (!city) {
        return res.status(400).send({ error: 'City is required' });
    }

    try {
        const geocodeURL = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${apiKey}`;
        const geocodeResponse = await fetch(geocodeURL);
        if (!geocodeResponse.ok) {
            return res.status(500).send({ error: 'Failed to fetch geocode data' });
        }
        const geocodeData = await geocodeResponse.json();
        if (geocodeData.length === 0) {
            return res.status(404).send({ error: 'City not found' });
        }

        const { lat, lon } = geocodeData[0];
        const weatherURL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`;
        const weatherResponse = await fetch(weatherURL);
        if (!weatherResponse.ok) {
            return res.status(500).send({ error: 'Failed to fetch weather data' });
        }
        const weatherData = await weatherResponse.json();
        res.send(weatherData);
    } catch (error) {
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});