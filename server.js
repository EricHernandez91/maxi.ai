require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

app.post('/process_image', async (req, res) => {
  try {
    const imageBase64 = req.body.image;
    if (!imageBase64) {
      return res.status(400).send('No image provided.');
    }

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "gpt-4-vision-preview",
        messages: [{
          role: "user",
          content: [
            {
              type: "text",
              text: "You are a world renound mixologist. Based on the things you see in this image, give me 2 cocktail recipes I can make with what I have. Give your response in a fun, bartender like fashion. Complement me on my selection as well! If you don't see any drinks in the photo, please ask me to upload a new photo. I can't respond to any of your responses, but I can always upload a better photo. "
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`
              }
            }
          ]
        }],
        max_tokens: 300
      })
    });

    if (!openaiResponse.ok) {
      const errorBody = await openaiResponse.text();
      console.error(`OpenAI API error response: ${errorBody}`);
      return res.status(openaiResponse.status).json({ error: errorBody });
    }

    const openaiData = await openaiResponse.json();
// Based on the structure of openaiData logged, the text is nested inside 'message' property
const cocktailSuggestions = openaiData.choices[0].message.content.trim(); // Corrected path to 'content'

res.json({ suggestions: cocktailSuggestions });

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).send('Error processing image');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
