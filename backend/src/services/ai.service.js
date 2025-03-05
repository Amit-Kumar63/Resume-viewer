const { Mistral } = require('@mistralai/mistralai')

const apiKey = process.env.MISTRAL_API_KEY;

const client = new Mistral({apiKey: apiKey});

module.exports.createPrompt = async ({prompt})=> {
    const completion = await client.chat.complete({
        model: 'mistral-large-latest',
        messages: [{role: 'user', content: prompt}]
      });
      
      return completion
}