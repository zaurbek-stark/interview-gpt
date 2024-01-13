// import formidable from "formidable";
import * as pdfjs from 'pdfjs-dist/build/pdf.min.mjs';
import type { TextContent, TextItem } from 'pdfjs-dist/types/src/display/api';
import { NextResponse, NextRequest } from 'next/server';

function mergeTextContent(textContent: TextContent) {
  return textContent.items.map(item => {
    const { str, hasEOL } = item as TextItem
    return str + (hasEOL ? '\n' : '')
  }).join('')
}

async function fetchOpenAIResponse(extractedText: string) {
  const response = await fetch('http://localhost:3000/api/openai-gpt', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ messages: [{role: 'user', content: `Here is my resume:
------
${extractedText}` }]}),
  });

  if (!response.body) {
    throw new Error('No response body');
  }

  const reader = response.body.getReader();
  let chunks = [];

  // Read the stream
  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    chunks.push(value);
  }

  // Convert the Uint8Array chunks to string
  const decoder = new TextDecoder('utf-8');
  const text = chunks.map(chunk => decoder.decode(chunk)).join('');

  return text;
}

export async function POST(req: NextRequest, res: NextResponse) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', {
      status: 405,
    });
  }

  try {
    const formData = await req.formData();
    const [ file ] = formData.getAll('file') as unknown as File[];

    if (!file) {
      return new Response('No file uploaded', {
        status: 400,
      });
    }

    const fileBuffer = await file.arrayBuffer();
    const fileData = new Uint8Array(fileBuffer);

    // Initialize pdf.js
    await import('pdfjs-dist/build/pdf.worker.mjs');

    // Load the PDF from the buffer
    const loadingTask = pdfjs.getDocument({ data: fileData });
    const pdf = await loadingTask.promise;

    if (!pdf.numPages) {
      return new Response(JSON.stringify({ status: 'ok', text: null }), {
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    const page = await pdf.getPage(1);
    const textContent = await page.getTextContent();
    const extractedText = mergeTextContent(textContent);

    // Send extracted resume text to openAI API to get the first question from the AI
    const openAIResponse = await fetchOpenAIResponse(extractedText);

    return new Response(JSON.stringify({ status: 'ok', text: openAIResponse }), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ status: 'error', error: String(err) }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}