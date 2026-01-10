#!/usr/bin/env node

require('dotenv').config();
const { testYouTubeVideoAnalysis } = require('./src/api/gemini/test');

const youtubeUrl = 'https://www.youtube.com/watch?v=r1t3yhQMV4E';

console.log('Testing Gemini YouTube video analysis...');
console.log(`URL: ${youtubeUrl}`);
console.log('');

testYouTubeVideoAnalysis(youtubeUrl)
  .then(response => {
    console.log('✓ API Response received');
    console.log('Status:', response.status);
    console.log('');
    console.log('Response text:');
    const text = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
    console.log(text || 'No text in response');
    console.log('');
    console.log('Full response:');
    console.log(JSON.stringify(response.data, null, 2));
  })
  .catch(error => {
    console.error('✗ Error:', error.message);
    if (error.response?.data) {
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
  });
