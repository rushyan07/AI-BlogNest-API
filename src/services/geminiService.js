const { GoogleGenerativeAI } = require('@google/generative-ai');

const callGemini = async (prompt) => {
  const apiKey = process.env.GEMINI_API_KEY;

  const modelName =
    process.env.GEMINI_MODEL === 'gemini-1.5'
      ? 'gemini-1.5-flash'
      : (process.env.GEMINI_MODEL || 'gemini-1.5-flash');

  if (!apiKey) {
    throw new Error('Gemini API key is not configured');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: modelName,
  });

  const maxRetries = 3;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      console.log(
        `Calling Gemini model: ${modelName} (attempt ${attempt + 1})`
      );

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      if (!text) {
        throw new Error('Invalid Gemini response');
      }

      return text;
    } catch (error) {
      console.error('Gemini API Error:', error.message);

      const is503 =
        error.message?.includes('503') ||
        error.message?.includes('Service Unavailable') ||
        error.message?.includes('high demand');

      if (!is503 || attempt === maxRetries) {
        throw error;
      }

      const delay = 1000 * Math.pow(2, attempt);

      console.log(
        `Gemini temporarily unavailable. Retrying in ${delay}ms...`
      );

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};

module.exports = {
  callGemini,
};