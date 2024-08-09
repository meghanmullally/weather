import express from 'express';
import dotenv from 'dotenv';
import apiKeyHandler from './api/api-key';
import weatherHandler from './api/weather';

dotenv.config();

const app = express();

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Route to fetch API key
app.get('/api-key', apiKeyHandler);

// Route to fetch weather data
app.get('/weather', weatherHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});