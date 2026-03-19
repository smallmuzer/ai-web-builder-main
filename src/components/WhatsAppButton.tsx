import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";

type Msg = { role: "user" | "assistant"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

const WhatsAppButton = () => {
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "Hi! I'm the Systems Solutions virtual assistant. How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg: Msg = { role: "user", content: input.trim() };
    const allMessages = [...messages, userMsg];
    setMessages(allMessages);
    setInput("");
    setIsLoading(true);

    let assistantSoFar = "";
    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: allMessages }),
      });

      if (!resp.ok || !resp.body) throw new Error("Failed");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantSoFar += content;
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant" && prev.length > allMessages.length) {
                  return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
                }
                return [...prev, { role: "assistant", content: assistantSoFar }];
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, I'm having trouble connecting right now. Please try again or contact us at info@solutions.com.mv." }]);
    }
    setIsLoading(false);
  };

  return (
    <>
      {/* Two buttons side by side on the right */}
      <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2">
        {/* ChatBot toggle */}
        <AnimatePresence>
          {!chatOpen && (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              onClick={() => setChatOpen(true)}
              className="w-12 h-12 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
            >
              <Bot size={22} />
            </motion.button>
          )}
        </AnimatePresence>

        {/* WhatsApp */}
        <motion.a
          href="https://wa.me/9603011355"
          target="_blank"
          rel="noopener noreferrer"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="w-12 h-12 rounded-full bg-[#25D366] flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
          aria-label="Chat on WhatsApp"
        >
          <svg viewBox="0 0 32 32" width="24" height="24" fill="white">
            <path d="M16.004 2.667A13.26 13.26 0 002.667 15.89a13.16 13.16 0 001.907 6.848L2.667 29.333l6.81-1.786a13.3 13.3 0 006.527 1.706h.006c7.32 0 13.323-5.953 13.323-13.27a13.19 13.19 0 00-3.9-9.41 13.24 13.24 0 00-9.43-3.906zm0 24.29a11.04 11.04 0 01-5.627-1.54l-.404-.24-4.184 1.097 1.117-4.08-.263-.418a10.96 10.96 0 01-1.683-5.886c0-6.075 4.946-11.02 11.044-11.02a10.96 10.96 0 017.8 3.23 10.95 10.95 0 013.23 7.8c0 6.08-4.953 11.027-11.03 11.027v.03zm6.05-8.26c-.332-.166-1.963-.969-2.268-1.08-.305-.11-.527-.165-.749.167-.222.332-.86 1.08-1.054 1.302-.194.222-.388.25-.72.083-.332-.166-1.402-.517-2.67-1.648-.988-.88-1.654-1.966-1.848-2.298-.194-.332-.02-.512.146-.677.149-.149.332-.388.498-.582.166-.194.222-.332.332-.555.111-.222.056-.416-.028-.582-.083-.166-.748-1.804-1.025-2.47-.27-.648-.544-.56-.748-.57-.194-.01-.416-.012-.638-.012a1.224 1.224 0 00-.887.416c-.305.332-1.164 1.136-1.164 2.77 0 1.635 1.192 3.214 1.358 3.436.166.222 2.346 3.58 5.685 5.02.794.343 1.414.548 1.898.701.797.253 1.523.217 2.096.132.64-.095 1.963-.803 2.24-1.578.277-.775.277-1.44.194-1.578-.083-.138-.305-.222-.637-.388z"/>
          </svg>
        </motion.a>
      </div>

      {/* Chat window */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-20 right-4 z-50 w-[360px] max-w-[calc(100vw-2rem)] h-[500px] max-h-[70vh] glass-card flex flex-col overflow-hidden shadow-2xl"
          >
            <div className="flex items-center justify-between px-4 py-3 bg-secondary text-secondary-foreground rounded-t-xl">
              <div className="flex items-center gap-2">
                <Bot size={20} />
                <span className="font-heading font-semibold text-sm">Virtual Assistant</span>
              </div>
              <button onClick={() => setChatOpen(false)} className="p-1 rounded hover:bg-secondary-foreground/20">
                <X size={18} />
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : ""}`}>
                  {msg.role === "assistant" && (
                    <div className="w-7 h-7 rounded-full bg-secondary/20 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot size={14} className="text-secondary" />
                    </div>
                  )}
                  <div className={`max-w-[80%] px-3 py-2 rounded-xl text-sm ${
                    msg.role === "user"
                      ? "bg-secondary text-secondary-foreground"
                      : "bg-muted text-foreground"
                  }`}>
                    {msg.role === "assistant" ? (
                      <div className="prose prose-sm max-w-none [&>p]:m-0">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    ) : msg.content}
                  </div>
                  {msg.role === "user" && (
                    <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
                      <User size={14} className="text-muted-foreground" />
                    </div>
                  )}
                </div>
              ))}
              {isLoading && messages[messages.length - 1]?.role === "user" && (
                <div className="flex gap-2">
                  <div className="w-7 h-7 rounded-full bg-secondary/20 flex items-center justify-center shrink-0">
                    <Bot size={14} className="text-secondary" />
                  </div>
                  <div className="bg-muted px-3 py-2 rounded-xl">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-3 border-t border-border">
              <form onSubmit={(e) => { e.preventDefault(); send(); }} className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me anything..."
                  className="flex-1 px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm focus:ring-2 focus:ring-ring outline-none"
                  disabled={isLoading}
                />
                <button type="submit" disabled={isLoading || !input.trim()}
                  className="p-2 rounded-lg bg-secondary text-secondary-foreground hover:opacity-90 disabled:opacity-50">
                  <Send size={16} />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default WhatsAppButton;
