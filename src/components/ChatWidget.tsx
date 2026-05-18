import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles, User, Bot, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import api from '../lib/api';

export default function ChatWidget({ listingContext }: { listingContext?: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([
    { role: 'assistant', content: 'Hi! I\'m NestAI. How can I help you find your perfect home today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-chat', handleOpen);
    return () => window.removeEventListener('open-chat', handleOpen);
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const res = await api.post('/ai/chat', { 
        messages: [...messages, { role: 'user', content: userMsg }],
        listingContext
      });
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.response }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble connecting right now." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-[60]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="mb-6 w-[400px] h-[600px] bg-terra-bg rounded-[48px] shadow-3xl border border-terra-border flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-8 bg-terra-green text-white flex justify-between items-center shrink-0">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md border border-white/20">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-serif italic tracking-tight text-white">NestAI Advisor</h3>
                  <div className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse shadow-sm shadow-emerald-400" />
                    <span className="text-[8px] font-bold text-white/60 uppercase tracking-[0.2em]">Curating for you</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2.5 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat History */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-6 bg-terra-bg"
            >
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] px-5 py-3.5 rounded-[28px] text-[13px] font-medium leading-relaxed ${
                    m.role === 'user' 
                      ? 'bg-terra-green text-white rounded-tr-none shadow-lg shadow-terra-green/10' 
                      : 'bg-terra-sidebar text-terra-text border border-terra-border rounded-tl-none font-serif italic'
                  }`}>
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white px-5 py-3.5 rounded-[28px] rounded-tl-none border border-terra-border flex items-center space-x-3">
                    <div className="flex space-x-1">
                       <div className="w-1 h-1 bg-terra-green rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                       <div className="w-1 h-1 bg-terra-green rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                       <div className="w-1 h-1 bg-terra-green rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-6 bg-white border-t border-terra-border">
              <div className="relative group">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask for home advice..." 
                  className="w-full pl-6 pr-14 py-4 bg-terra-sidebar border border-terra-border rounded-[20px] focus:outline-none focus:ring-4 focus:ring-terra-green/10 focus:border-terra-green transition-all font-medium text-sm text-terra-text"
                />
                <button 
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-terra-green text-white rounded-xl shadow-xl shadow-terra-green/20 hover:bg-terra-green/90 disabled:opacity-50 transition-all flex items-center justify-center active:scale-95"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 rounded-3xl flex items-center justify-center shadow-3xl transition-all active:scale-90 relative border-4 border-white ${
          isOpen ? 'bg-terra-text text-white' : 'bg-terra-green text-white hover:bg-terra-green/90'
        }`}
      >
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-terra-green-light rounded-full border-2 border-white shadow-sm flex items-center justify-center">
           <div className="w-1 h-1 bg-terra-green rounded-full animate-pulse"></div>
        </div>
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>
    </div>
  );
}
