import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

export default async function handler(req, res) {
    const city = req.query.city;
    const apiKey = process.env.WEATHER_API_KEY;

    if (!city) {
        return res.status(400).json({ error: 'City is required' });
    }

    const geocodeURL = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${apiKey}`;
    const geocodeResponse = await fetch(geocodeURL);
    if (!geocodeResponse.ok) {
        return res.status(500).json({ error: 'Failed to fetch geocode data' });
    }

    const geocodeData = await geocodeResponse.json();
    if (geocodeData.length === 0) {
        return res.status(404).json({ error: 'City not found' });
    }

    const { lat, lon } = geocodeData[0];
    const weatherURL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`;
    const weatherResponse = await fetch(weatherURL);
    if (!weatherResponse.ok) {
        return res.status(500).json({ error: 'Failed to fetch weather data' });
    }

    const weatherData = await weatherResponse.json();
    res.status(200).json(weatherData);
}