import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type { ChatMessage } from '../../models';
import { nanoid } from 'nanoid/non-secure';

interface ChatCtx {
  messages: ChatMessage[];
  send: (content: string) => void;
}

const Ctx = createContext<ChatCtx | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<ChatMessage[]>([{
    id: nanoid(),
    role: 'agent',
    ts: Date.now(),
    content: 'Hi! I can help monitor missions, datasets, and pipeline. Ask me anything.',
  }]);

  const send = (content: string) => {
    const user: ChatMessage = { id: nanoid(), role: 'user', ts: Date.now(), content };
    setMessages((m) => [...m, user]);
    setTimeout(() => {
      const agent: ChatMessage = {
        id: nanoid(),
        role: 'agent',
        ts: Date.now(),
        content: `Thanks! Here is a mocked response.\n\n- I parsed your request\n- I will look into it\n\n\`\`\`ts\nconsole.log('hello from agent');\n\`\`\``,
      };
      setMessages((m) => [...m, agent]);
    }, 1000);
  };

  const value = useMemo(() => ({ messages, send }), [messages]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useChat() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useChat must be used within ChatProvider');
  return ctx;
}

