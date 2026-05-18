import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles, Loader2, ThumbsUp, ThumbsDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import api from '../lib/api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  feedbackGiven?: boolean;
}

export default function AIChatConcierge({ listing }: { listing: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: `Hi! I'm your NestAI Concierge. I know everything about ${listing.title} in ${listing.locality}. How can I assist you?` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedbackInput, setFeedbackInput] = useState<{ index: number, text: string } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading, feedbackInput]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const history = messages.slice(-6).map(m => ({ role: m.role, content: m.content }));
      const res = await api.post('/ai/property-chat', { 
        listing,
        message: userMsg,
        history
      });
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.response }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm having a bit of trouble connecting to the ecosystem right now. Please try again in a moment." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = async (index: number, rating: number, text?: string) => {
    const msg = messages[index];
    const prevMsg = messages[index - 1]; // This is usually the user query

    try {
      await api.post('/ai/property-chat/feedback', {
        listingId: listing.id,
        query: prevMsg?.content || 'Initial greeting',
        response: msg.content,
        rating,
        feedback: text || ''
      });

      setMessages(prev => prev.map((m, i) => i === index ? { ...m, feedbackGiven: true } : m));
      setFeedbackInput(null);
    } catch (err) {
      console.error('Failed to send feedback', err);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="absolute bottom-24 right-0 w-[calc(100vw-40px)] sm:w-[420px] max-h-[calc(100vh-120px)] h-[650px] bg-white rounded-[40px] sm:rounded-[48px] shadow-3xl border border-terra-border flex flex-col overflow-hidden z-50"
          >
            {/* Header */}
            <div className="p-8 bg-terra-green text-white flex justify-between items-center shrink-0">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20">
                  <Sparkles className="w-6 h-6 text-white animate-pulse" />
                </div>
                <div>
                  <h3 className="text-xl font-serif italic tracking-tight text-white">Nest Concierge</h3>
                  <div className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse shadow-sm shadow-emerald-400" />
                    <span className="text-[9px] font-bold text-white/60 uppercase tracking-[0.2em]">Live Insights Active</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-3 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat History */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-8 space-y-8 bg-terra-bg/30 scroll-smooth"
            >
              {messages.map((m, i) => (
                <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'} space-y-2`}>
                  <div className={`max-w-[90%] px-6 py-4 rounded-[32px] text-sm leading-relaxed ${
                    m.role === 'user' 
                      ? 'bg-terra-green text-white rounded-tr-none shadow-xl shadow-terra-green/10 font-medium' 
                      : 'bg-white text-terra-text border border-terra-border rounded-tl-none font-serif italic shadow-sm'
                  }`}>
                    {m.content}
                  </div>
                  
                  {/* Feedback UI for Assistant Messages */}
                  {m.role === 'assistant' && i !== 0 && !m.feedbackGiven && (
                    <div className="flex items-center space-x-3 px-2">
                      <button 
                        onClick={() => handleFeedback(i, 1)}
                        className="p-1.5 text-terra-text-muted hover:text-terra-green transition-colors hover:bg-terra-green/5 rounded-full"
                        title="Helpful"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => setFeedbackInput({ index: i, text: '' })}
                        className="p-1.5 text-terra-text-muted hover:text-red-500 transition-colors hover:bg-red-50 rounded-full"
                        title="Not helpful"
                      >
                        <ThumbsDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {m.role === 'assistant' && m.feedbackGiven && (
                    <div className="flex items-center space-x-1.5 px-2 text-[10px] text-terra-green font-bold uppercase tracking-widest">
                       <Check className="w-3 h-3" />
                       <span>Thanks for feedback</span>
                    </div>
                  )}

                  {/* Feedback Text Input */}
                  {feedbackInput?.index === i && (
                    <div className="w-full mt-2 p-4 bg-white border border-terra-border rounded-[24px] shadow-lg animate-in fade-in slide-in-from-top-2 duration-300">
                      <p className="text-[10px] font-bold text-terra-text-muted uppercase tracking-widest mb-3">How can I improve?</p>
                      <textarea 
                        autoFocus
                        className="w-full p-3 text-xs bg-terra-sidebar rounded-xl border border-terra-border focus:outline-none focus:ring-2 focus:ring-terra-green/20 min-h-[60px]"
                        placeholder="Tell me more..."
                        value={feedbackInput.text}
                        onChange={(e) => setFeedbackInput({ ...feedbackInput, text: e.target.value })}
                      />
                      <div className="flex justify-end space-x-2 mt-3">
                        <button 
                          onClick={() => setFeedbackInput(null)}
                          className="px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest text-terra-text-muted hover:text-terra-text"
                        >
                          Cancel
                        </button>
                        <button 
                          onClick={() => handleFeedback(i, -1, feedbackInput.text)}
                          className="px-4 py-1.5 bg-terra-green text-white text-[9px] font-bold uppercase tracking-widest rounded-lg hover:bg-terra-green/90"
                        >
                          Submit
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white px-6 py-4 rounded-[32px] rounded-tl-none border border-terra-border shadow-sm flex items-center space-x-3">
                    <Loader2 className="w-4 h-4 text-terra-green animate-spin" />
                    <span className="text-xs text-terra-text-muted font-medium italic">Consulting the ecosystem...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="p-8 bg-white border-t border-terra-border">
              <div className="relative group">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about price, events, community activities..." 
                  className="w-full pl-8 pr-16 py-5 bg-terra-sidebar border border-terra-border rounded-[28px] focus:outline-none focus:ring-4 focus:ring-terra-green/10 focus:border-terra-green transition-all font-medium text-sm text-terra-text shadow-inner"
                />
                <button 
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 bg-terra-green text-white rounded-2xl shadow-xl shadow-terra-green/20 hover:bg-terra-green/90 disabled:opacity-50 transition-all flex items-center justify-center active:scale-95 group-focus-within:scale-105"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
              <p className="mt-4 text-[9px] text-center text-terra-text-muted uppercase tracking-widest font-bold opacity-60">AI can make mistakes, please verify details.</p>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-20 h-20 rounded-[32px] flex items-center justify-center shadow-3xl transition-all active:scale-90 border-4 border-white ${
          isOpen ? 'bg-terra-text text-white' : 'bg-terra-green text-white hover:bg-terra-green/90'
        }`}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="w-8 h-8" />
            </motion.div>
          ) : (
            <motion.div key="chat" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 1.5, opacity: 0 }} className="relative">
              <Sparkles className="w-8 h-8" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-terra-green-light rounded-full border-2 border-terra-green animate-pulse" />
            </motion.div>
          )}
        </AnimatePresence>
      </button>
    </div>
  );
}
