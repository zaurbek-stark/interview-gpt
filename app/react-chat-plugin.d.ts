declare module 'react-chat-plugin' {
    interface ChatMessage {
      author: {
        username: string;
        id: number;
        avatarUrl: string;
      },
      text: string;
      type: string;
      timestamp: number;
    };
  
    export interface ChatBoxProps {
      messages: ChatMessage[];
      userId: number;
      onSendMessage: (message: string) => void;
      width?: string;
      height?: string;
      style?: React.CSSProperties;
    };
  
    const ChatBox: React.ComponentType<ChatBoxProps>;
    export default ChatBox;
  }