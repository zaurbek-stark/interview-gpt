type Message = {
  role: string;
  content: string;
}

export async function fetchOpenAIResponse(messages: Message[], setMessage: (message: string) => void) {
  const response = await fetch(`/api/openai-gpt`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ messages }),
  });

  if (!response.body) {
    throw new Error('No response body');
  }

  const reader = response.body.getReader();
  let chunks = [];

  const decoder = new TextDecoder('utf-8');
  let text = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    chunks.push(value);
    text = chunks.map(chunk => decoder.decode(chunk)).join('');
    setMessage(text);
  }

  return text;
}