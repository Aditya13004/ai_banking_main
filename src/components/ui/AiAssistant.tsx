import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AiAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "agent", text: "Hi there! I am your AI Onboarding Assistant. Do you need help with your application today?" }
  ]);
  const [inputMessage, setInputMessage] = useState("");

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    // Add user message
    setMessages(prev => [...prev, { role: "user", text: inputMessage }]);
    const userMsg = inputMessage;
    setInputMessage("");

    // Simulate AI response
    setTimeout(() => {
      setMessages(prev => [
        ...prev, 
        { role: "agent", text: "I can help with that. Let me review your request and guide you through the next steps." }
      ]);
    }, 1000);
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-primary text-primary-foreground shadow-2xl hover:scale-110 active:scale-95 transition-all glow-primary"
            aria-label="Open AI Assistant"
          >
            <MessageSquare size={24} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-6 right-6 z-50 w-80 sm:w-96 h-[500px] flex flex-col bg-card border border-border shadow-2xl rounded-2xl overflow-hidden glass"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-background/50 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center">
                  <Bot size={18} />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Onboard AI</h3>
                  <p className="text-xs text-success flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-success"></span> Online
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-md text-muted-foreground hover:bg-secondary transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  key={i} 
                  className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'agent' && (
                    <div className="w-6 h-6 shrink-0 rounded-full bg-primary/20 text-primary flex items-center justify-center mt-1">
                      <Bot size={12} />
                    </div>
                  )}
                  <div 
                    className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                      msg.role === 'user' 
                        ? 'bg-primary text-primary-foreground rounded-br-none' 
                        : 'bg-secondary text-foreground border border-border rounded-bl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-border bg-background/50 backdrop-blur-sm flex items-center gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask me anything..."
                className="flex-1 bg-secondary border border-border rounded-full px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors"
              />
              <Button type="submit" size="icon" disabled={!inputMessage.trim()} className="rounded-full shrink-0 w-10 h-10 glow-primary transition-all duration-300">
                <Send size={16} />
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
