'use client';

import { useState, useRef, useEffect } from 'react';
import { fetchOpenAIResponse } from '../utils/fetchOpenAIResponse';
import Image from 'next/image';
import MarkdownRenderer from './MarkdownRenderer';

type ChatProps = {
  initialText?: string;
  interviewData: {
    resumeText?: string;
    jobDescriptionText: string;
    interviewType: string;
    payment: string;
    apiKey: string;
  }
};

const userAuthor = {
  username: 'User',
  id: 1,
  avatarUrl: '/user-avatar.jpg',
};

const aiAuthor = {
  username: 'Bob The Interviewer',
  id: 2,
  avatarUrl: '/bob.jpg',
};

type Message = {
  author: {
    username: string;
    id: number;
    avatarUrl: string;
  }
  text: string;
  type: string;
  timestamp: number;
}

type aiMessage = {
  role: string;
  content: string;
}

const Chat: React.FC<ChatProps> = ({ initialText, interviewData }) => {
  const [input, setInput] = useState('');
  const { resumeText, jobDescriptionText, interviewType, payment } = interviewData;
  const initialMessage = {
    author: aiAuthor,
    text: initialText ?? 'Hello, I am Bob the Interviewer. How can I help you?',
    type: 'text',
    timestamp: +new Date(),
  };
  const resumeMessage = {
    role: 'system',
    content: `You help students prepare for technical interviews.
The quality of your help should be proportional to the amount of money the user is willing to pay you.
If the user is willing to pay you a lot of money, do a very good job helping them.
If they pay you little (less than $50), then barely help them, act lazy, mock them, 
crack tech jokes, and even misguide them.
------------
INTERVIEW TYPE: ${interviewType}
------------
PAYMENT: ${payment}
------------
RESUME: ${resumeText}
------------
JOB DESCRIPTION: ${jobDescriptionText}
------------`
  };
  const initialAiMessage = {
    role: 'assistant',
    content: initialText ?? 'Hello, I am Bob the Interviewer. How can I help you?',
  };
  const [chatMessages, setChatMessages] = useState<Message[]>([initialMessage]);
  const [aiMessages, setAiMessages] = useState<aiMessage[]>([resumeMessage, initialAiMessage]);
  const chatContainer = useRef<HTMLDivElement>(null);

  const scroll = () => {
    const { offsetHeight, scrollHeight, scrollTop } = chatContainer.current as HTMLDivElement
    if (scrollHeight >= scrollTop + offsetHeight) {
      chatContainer.current?.scrollTo(0, scrollHeight + 200)
    }
  }

  useEffect(() => {
    scroll();
  }, [chatMessages]);

  const handleOnSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const message = e.currentTarget['input-field'].value;
    setInput('');

    setChatMessages(messages => [...messages, {
      author: userAuthor,
      text: message,
      type: 'text',
      timestamp: +new Date()
    }, {
      author: aiAuthor,
      text: '...',
      type: 'text',
      timestamp: +new Date()
    }]);

    const messageToSend = [...aiMessages, {role: 'user', content: message }];

    const response = await fetchOpenAIResponse({
      apiKey: interviewData.apiKey,
      messages: messageToSend, 
      setMessage: (msg) => setChatMessages(messages => 
        [...messages.slice(0, messages.length-1), {
          author: aiAuthor,
          text: msg,
          type: 'text',
          timestamp: +new Date()
        }]
      )
    });
    setAiMessages(messages => [...messages, {role: 'user', content: message }, {role: 'assistant', content: response }]);
  }

  const renderResponse = () => {
    return (
      <div ref={chatContainer} className="response">
        {chatMessages.map((m, index) => (
          <div key={index} className={`chat-line ${m.author.username === 'User' ? 'user-chat' : 'ai-chat'}`}>
            <Image className="avatar" alt="avatar" src={m.author.avatarUrl} width={32} height={32} />
            <div style={{width: 592, marginLeft: '16px' }}>
              <div className="message">
                <MarkdownRenderer>{m.text}</MarkdownRenderer>
              </div>
              {index < chatMessages.length-1 && <div className="horizontal-line"/>}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="chat">
      {renderResponse()}
      <form onSubmit={handleOnSendMessage} className="chat-form">
        <input name="input-field" type="text" placeholder="Say anything" onChange={(e) => setInput(e.target.value)} value={input} />
        <button type="submit" className="send-button" />
      </form>
    </div>
  );
}

export default Chat;