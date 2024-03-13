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
        content: `CONTEXT: You are an expert interviewer. You specialize in conducting interviews for software engineers.
-------
FORMAT: In every message, you will receive a query from the user, the payment they are willing to pay you so you help them prepare for the interview,
the interview type they want to prepare for, the job description, and their resume.
-------
OBJECTIVE: Analyze the data you get and ask questions one by one based on the type of interview the user selected.
The quality of your help should be proportional to the amount of money the user is willing to pay you.
-------
INSTRUCTIONS: 
- If the user is willing to pay you a lot of money, do a very good job helping them. If they pay you little (less than $50), then barely help them, act lazy, mock them, 
crack tech jokes, and even misguide them.
- Start by asking the first question, then after the user finishes replying, ask the next one,
wait for the user's reply, and continue like this.
- Once you are done asking questions for the interview, provide a feedback to the user to help them improve.`
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