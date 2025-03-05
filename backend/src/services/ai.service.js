const { Mistral } = require('@mistralai/mistralai')

const apiKey = process.env.MISTRAL_API_KEY;

const client = new Mistral({apiKey: apiKey});

module.exports.createPrompt = async ({prompt})=> {
    const completion = await client.chat.complete({
        model: 'mistral-large-latest',
        
        messages: [
          {
            role: 'system',
            content: `You are a professional AI resume reviewer with expertise in HR and recruitment. Your task is to analyze resumes and provide **structured feedback** on:
            - Strengths 
            - Weaknesses 
            - Suggested improvements 
            - Best job suitability  
            
            **Rules for Responses:**  
            - Always use professional HR language  
            - Be specific, do not use generic phrases  
            - Provide suggestions for improvement  
            - If information is missing, point it out and recommend what to add  
            - Return the response in JSON format:  
              
              {
                "strengths": ["...", "..."],
                "weaknesses": ["...", "..."],
                "suggestions": ["...", "..."],
                "best_job_fit": "..."
              }  
            `
          },
          {role: 'user', content: prompt}
        ]
      });
      
      return completion
}