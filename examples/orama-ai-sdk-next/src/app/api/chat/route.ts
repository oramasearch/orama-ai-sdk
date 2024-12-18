import { oramaProvider } from '@orama/ai-sdk-provider';

export const runtime = 'edge';

const provider = oramaProvider({
  endpoint: process.env.ORAMA_API_URL!,
  apiKey: process.env.ORAMA_API_KEY!
});

provider.createAnswerSession({
  userContext: "The user is a video game enthusiast provide concise answers",
  events: {
    onMessageChange: (messages) => console.log('Messages updated:', messages),
    onSourceChange: (sources) => console.log('Sources:', sources)
  }
});

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    return provider.answer(messages);
  } catch (error) {
    console.error('Route handler error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Request failed' }), 
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}