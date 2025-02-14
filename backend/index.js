const express = require('express');
const app = express();
require('dotenv').config();
const cors = require('cors');
const analyze_image = require('./utils/configGemini');

// middleware
app.use(express.json());
app.use(cors());


// routes
app.post('/calculate', async (req, res) => {
    try {
        const { image, dict_of_vars } = req.body;

        if (!image) {
            return res.status(400).json({ error: "No image provided" });
        }
        
        const response = await analyze_image(image, dict_of_vars);
        res.status(200).json(response);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "An error occurred while processing the image" });
    }
})


app.get('/', (req, res) => {
    res.send('Hello, World!');
});

app.listen(process.env.PORT || 4000);