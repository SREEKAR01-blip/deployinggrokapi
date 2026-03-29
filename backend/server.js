const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { runLoop } = require('./agent.js');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/loop', async (req, res) => {
    try {
        const { prompt } = req.body;
        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        console.log(`Starting loop for prompt: "${prompt}"`);
        const versions = await runLoop(prompt);

        res.json({ versions });
    } catch (error) {
        console.error('Error in /api/loop:', error);
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Backend server listening on port ${PORT}`);
});
