import { useEffect, useState, ComponentType } from 'react';
import { useChat } from 'ai/react';
import dynamic from 'next/dynamic';

type ChatMessage = {
  author: {
    username: string;
    id: number;
    avatarUrl: string;
  },
  text: string;
  type: string;
  timestamp: number;
};

type ChatBoxProps = {
  messages: ChatMessage[];
  userId: number;
  onSendMessage: (message: string) => void;
  width?: string;
  height?: string;
  style?: React.CSSProperties;
};

type ChatProps = {
  initialText?: string;
};

const ChatBox = dynamic<ChatBoxProps>(
  () =>
    import('react-chat-plugin').then(
      (mod) => mod.default as ComponentType<ChatBoxProps>
    ),
  { loading: () => null, ssr: false }
);

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
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([initialMessage]);
  const { append, messages } = useChat({
    api: '/api/openai-gpt',
  });

  useEffect(() => {
    if (messages.length < 1) return;
    const authors = {
      user: userAuthor,
      system: aiAuthor,
      function: aiAuthor,
      assistant: aiAuthor,
      data: aiAuthor,
      tool: aiAuthor,
    }
    const chatMessagesArr = messages?.map(message => {
      return ({
        author: authors[message.role],
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