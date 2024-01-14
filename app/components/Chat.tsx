import { useEffect, useState } from 'react';
import { useChat } from 'ai/react';
import ChatBox from 'react-chat-plugin';

type ChatProps = {
  initialText?: string;
};

const userAuthor = {
  username: 'User',
  id: 1,
  avatarUrl: 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
};

const aiAuthor = {
  username: 'Bob The Interviewer',
  id: 2,
  avatarUrl: '/bob.jpg',
};

const Chat: React.FC<ChatProps> = ({ initialText }) => {
  const initialMessage = {
    author: aiAuthor,
    text: initialText ?? 'Hello, I am Bob the Interviewer. How can I help you?',
    type: 'text',
    timestamp: +new Date(),
  };
  const [chatMessages, setChatMessages] = useState([initialMessage]);
  const { append, messages } = useChat({
    api: '/api/openai-gpt',
  });

  useEffect(() => {
    if (messages.length < 1) return;
    const authors = {
      user: userAuthor,
      assistant: aiAuthor,
    }
    const chatMessagesArr = messages?.map(message => {
      return ({
        author: authors[message.role as keyof typeof authors],
        text: message?.content,
        type: 'text',
        timestamp: +new Date(),
      });
    });
    setChatMessages([initialMessage, ...chatMessagesArr]);
  }, [messages]);

  const handleOnSendMessage = (message: string) => {
    append({
      content: message,
      role: 'user'
    });
  }

  return (
    <ChatBox
      style={{margin: 'auto'}}
      messages={chatMessages}
      userId={1}
      onSendMessage={handleOnSendMessage}
      width={'550px'}
      height={'500px'}
    />
  );
}

export default Chat;