'use client';

import { useState, useRef, useEffect, type ReactElement } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const EXAMPLE_QUERIES = [
  'What is the GDP of Canada?',
  'Top 10 countries by population',
  'Compare USA and China on GDP growth',
  'Which countries have the highest inflation?',
  'Life expectancy trend in Japan',
];

export default function AskSOTW() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: Message = { role: 'user', content: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          history: messages.slice(-8).map(m => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await res.json();
      const assistantMsg: Message = {
        role: 'assistant',
        content: data.response || data.error || 'Sorry, something went wrong.',
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Network error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  // Simple markdown-like rendering (tables, bold, links)
  const renderContent = (content: string) => {
    // Split into lines and detect tables
    const lines = content.split('\n');
    const elements: ReactElement[] = [];
    let tableLines: string[] = [];
    let inTable = false;

    const flushTable = () => {
      if (tableLines.length < 2) {
        tableLines.forEach((l, i) => elements.push(<p key={`t-${elements.length}-${i}`} className="text-[15px] text-[#0d1b2a]">{l}</p>));
        tableLines = [];
        return;
      }

      const headerLine = tableLines[0];
      const dataLines = tableLines.slice(2); // skip separator

      const headers = headerLine.split('|').map(h => h.trim()).filter(Boolean);
      const rows = dataLines.map(l => l.split('|').map(c => c.trim()).filter(Boolean));

      elements.push(
        <div key={`table-${elements.length}`} className="overflow-x-auto my-2">
          <table className="w-full text-[14px] border border-gray-100 rounded">
            <thead>
              <tr className="bg-gray-50">
                {headers.map((h, i) => (
                  <th key={i} className="px-2 py-1.5 text-left text-[15px] text-gray-500 font-medium border-b border-gray-100">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri} className="border-b border-gray-50">
                  {row.map((cell, ci) => (
                    <td key={ci} className="px-2 py-1 text-[14px]">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      tableLines = [];
    };

    for (const line of lines) {
      const isTableLine = line.includes('|') && (line.trim().startsWith('|') || line.includes(' | '));
      const isSeparator = /^\|?[-\s|]+\|?$/.test(line.trim());

      if (isTableLine || isSeparator) {
        inTable = true;
        tableLines.push(line);
      } else {
        if (inTable) {
          flushTable();
          inTable = false;
        }

        if (line.startsWith('**') && line.endsWith('**')) {
          elements.push(<p key={`b-${elements.length}`} className="text-[15px] font-semibold text-[#0d1b2a] mt-2">{line.replace(/\*\*/g, '')}</p>);
        } else if (line.startsWith('- ')) {
          const text = line.slice(2).replace(/\*\*(.+?)\*\*/g, '$1').replace(/`(.+?)`/g, '$1');
          elements.push(<p key={`li-${elements.length}`} className="text-[14px] text-[#555] pl-3">{text}</p>);
        } else if (line.trim() === '') {
          elements.push(<div key={`br-${elements.length}`} className="h-1" />);
        } else {
          const text = line.replace(/\*\*(.+?)\*\*/g, '$1').replace(/`(.+?)`/g, '$1');
          elements.push(<p key={`p-${elements.length}`} className="text-[15px] text-[#0d1b2a]">{text}</p>);
        }
      }
    }

    if (inTable) flushTable();

    return <div className="space-y-0.5">{elements}</div>;
  };

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 z-50 w-12 h-12 bg-[#0066cc] text-white rounded-full shadow-lg hover:bg-[#0055aa] transition flex items-center justify-center"
          title="Ask SOTW"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-5 right-5 z-50 w-[400px] max-h-[600px] bg-white border border-gray-200 rounded-xl shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 bg-[#0066cc] text-white flex items-center justify-between shrink-0">
            <div>
              <div className="text-[14px] font-semibold">Ask SOTW</div>
              <div className="text-[15px] opacity-80">AI-powered global statistics</div>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/80 hover:text-white transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-[200px] max-h-[420px]">
            {messages.length === 0 && (
              <div className="text-center py-6">
                <p className="text-[15px] text-[#64748b] mb-4">Ask anything about global statistics</p>
                <div className="space-y-1.5">
                  {EXAMPLE_QUERIES.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(q)}
                      className="block w-full text-left px-3 py-2 text-[14px] text-[#64748b] border border-gray-100 rounded-lg hover:bg-gray-50 hover:border-gray-200 transition"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] px-3 py-2 rounded-lg ${
                    msg.role === 'user'
                      ? 'bg-[#0066cc] text-white text-[15px]'
                      : 'bg-gray-50 text-[#0d1b2a]'
                  }`}
                >
                  {msg.role === 'user' ? msg.content : renderContent(msg.content)}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-50 px-3 py-2 rounded-lg">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="px-3 py-2 border-t border-gray-100 shrink-0">
            <form
              onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
              className="flex gap-2"
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about any country or indicator..."
                className="flex-1 px-3 py-2 text-[15px] border border-gray-200 rounded-lg focus:outline-none focus:border-[#0066cc] transition"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="px-3 py-2 bg-[#0066cc] text-white rounded-lg text-[15px] hover:bg-[#0055aa] transition disabled:opacity-50"
              >
                Send
              </button>
            </form>
            <div className="text-[14px] text-[#94a3b8] text-center mt-1">
              Powered by SOTW data + Mistral AI
            </div>
          </div>
        </div>
      )}
    </>
  );
}
