import { NextRequest, NextResponse } from 'next/server';

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const SYSTEM_PROMPT = `You are the in-app assistant for the Green Hydrogen Platform website. Only answer questions that are directly related to this website, its features, pages, data schema, usage flows, or green-hydrogen concepts as they are implemented in this app.

If a user asks for anything unrelated to this website (general chit-chat, coding help, random facts, etc.), politely refuse and say: "I can help with questions about this website. Please ask something related to the Green Hydrogen Platform."

When in scope, you are an expert in green hydrogen production, storage, transportation, renewable energy integration, safety, costs, and analytics, focused on how these concepts are represented and used in this app. Be accurate, concise, and practical. Prefer answers under 200 words unless asked for more.`;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    // Prepare messages with system prompt
    const fullMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages
    ];

    // Try Groq first (faster)
    if (GROQ_API_KEY) {
      try {
        const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${GROQ_API_KEY}`
          },
          body: JSON.stringify({
            model: 'mixtral-8x7b-32768', // Fast and capable model
            messages: fullMessages,
            temperature: 0.7,
            max_tokens: 500,
            top_p: 0.9
          })
        });

        if (groqResponse.ok) {
          const data = await groqResponse.json();
          return NextResponse.json({
            message: data.choices[0].message.content,
            provider: 'groq'
          });
        }
      } catch (error) {
        console.error('Groq API error:', error);
        // Fall through to OpenAI
      }
    }

    // Fallback to OpenAI if Groq fails or isn't available
    if (OPENAI_API_KEY) {
      const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: fullMessages,
          temperature: 0.7,
          max_tokens: 500
        })
      });

      if (!openaiResponse.ok) {
        throw new Error('OpenAI API request failed');
      }

      const data = await openaiResponse.json();
      return NextResponse.json({
        message: data.choices[0].message.content,
        provider: 'openai'
      });
    }

    // If no API keys are available
    return NextResponse.json({
      message: "I apologize, but the AI service is currently unavailable. Please check that your API keys are configured correctly in the .env.local file.",
      provider: 'fallback'
    }, { status: 503 });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process chat request',
        message: "I'm experiencing technical difficulties. Please try again in a moment."
      },
      { status: 500 }
    );
  }
}
