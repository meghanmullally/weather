import dotenv from 'dotenv';

dotenv.config();

export default function handler(req, res) {
    console.log('API key endpoint hit');
    const apiKey = process.env.WEATHER_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'API key is missing' });
    }

    res.status(200).json({ apiKey });
}