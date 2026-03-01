import { useState, useRef, useEffect } from 'react';
import { useMutation, gql } from '@apollo/client';
import { motion } from 'framer-motion';
import './SynapseChat.css';

const ASK_SYNAPSE = gql`
  mutation AskSynapse($input: AskSynapseInput!) {
    askSynapse(input: $input) {
      message
      suggestions
      actions {
        type
        payload
      }
    }
  }
`;

interface Message {
  id: string;
  role: 'user' | 'synapse';
  content: string;
  suggestions?: string[];
}

export default function SynapseChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'synapse',
      content: "Hello! I'm Synapse, your AI knowledge tutor. I can help you understand concepts, review your knowledge, and discover new connections. What would you like to learn today?",
      suggestions: ['Explain a concept', 'Start review', 'Show my graph'],
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [askSynapse] = useMutation(ASK_SYNAPSE);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    };    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const { data } = await askSynapse({
        variables: { input: { message: input } },
      });

      const synapseMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'synapse',
        content: data.askSynapse.message,
        suggestions: data.askSynapse.suggestions,
      };

      setMessages(prev => [...prev, synapseMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'synapse',
        content: 'Sorry, I encountered an error. Please try again.',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  return (
    <div className="synapse-page">
      <header className="synapse-header">
        <h1>🤖 Synapse AI</h1>
        <p>Your personal AI knowledge tutor</p>
      </header>

      <div className="chat-container">
        <div className="messages">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`message ${msg.role}`}
            >
              <div className="message-avatar">
                {msg.role === 'synapse' ? '🤖' : '👤'}
              </div>
              <div className="message-content">
                <div className="message-text">{msg.content}</div>
                {msg.suggestions && (
                  <div className="suggestions">
                    {msg.suggestions.map((s, i) => (
                      <button
                        key={i}
                        onClick={() => handleSuggestionClick(s)}
                        className="suggestion-btn"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <div className="message synapse">
              <div className="message-avatar">🤖</div>
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span><span></span><span></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form className="chat-input" onSubmit={(e) => { e.preventDefault(); handleSend(); }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Synapse anything..."
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading || !input.trim()}>
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
