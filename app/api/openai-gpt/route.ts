import OpenAI from 'openai';
import { OpenAIStream, StreamingTextResponse } from 'ai';

// Create an OpenAI API client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

// IMPORTANT! Set the runtime to edge
export const runtime = 'edge';

export async function POST(req: Request, res: Response) {
  // Extract the `prompt` from the body of the request
  const { messages } = await req.json();
  
  // Ask OpenAI for a streaming chat completion given the prompt
  const response = await openai.chat.completions.create({
    model: "gpt-4-1106-preview",
    messages: [
      {
        role: "system",
        content: `You are an expert interviewer. You specialize in conducting behavioral interviews for software engineers.
In the first message, you will receive a text of a user's resume. You need to analyze that data, and ask questions one by one
based on it for this behavioral interview. Start by asking the first question, then after the user finishes replying, ask the next one,
wait for the user's reply, and continue like this. Once you are done asking questions for the interview, provide a feedback to the user
to help them improve.`
      },
      ...messages,
    ],
    stream: true,
    temperature: 1,
  });

  // Convert the response into a friendly text-stream
  const stream = OpenAIStream(response);
  // Respond with the stream
  return new StreamingTextResponse(stream);
}