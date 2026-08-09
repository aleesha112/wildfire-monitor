const express = require('express');
const Groq = require('groq-sdk');
const Fire = require('../models/Fire');

const router = express.Router();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

router.post('/ask', async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    // Get current fire data for context
    const fires = await Fire.find();
    const totalFires = fires.length;
    const highConfidence = fires.filter(f => f.confidence === 'h').length;

    // Group by date
    const dateGroups = {};
    fires.forEach(f => {
      dateGroups[f.acquiredDate] = (dateGroups[f.acquiredDate] || 0) + 1;
    });

    // Find brightest fire
    const brightest = fires.reduce((max, f) => (f.brightness > (max?.brightness || 0) ? f : max), null);

    const contextPrompt = `You are an AI assistant for a wildfire monitoring dashboard focused on Pakistan, using NASA VIIRS satellite data.

Current data summary:
- Total active fire detections: ${totalFires}
- High confidence detections: ${highConfidence}
- Detections by date: ${JSON.stringify(dateGroups)}
- Brightest fire detected: ${brightest ? `${brightest.brightness}K at coordinates ${brightest.latitude}, ${brightest.longitude} on ${brightest.acquiredDate}` : 'N/A'}

Answer the user's question using ONLY this data. Be concise (2-4 sentences), professional, and specific with numbers. If the question can't be answered from this data, say so honestly.`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: contextPrompt },
        { role: 'user', content: question }
      ],
      model: 'llama-3.3-70b-versatile',
    });

    const answer = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';

    res.json({ answer });

  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({ error: 'Failed to get response from AI' });
  }
});

module.exports = router;