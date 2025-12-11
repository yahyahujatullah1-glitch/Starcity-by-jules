import { useChat, getCurrentUser } from "@/hooks/useData";
import { useEffect, useRef, useState } from "react";
import { Send, Image as ImageIcon } from "lucide-react";

export default function Chat() {
  const { messages, sendMessage } = useChat();
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const currentUser = getCurrentUser();

  useEffect(() => {
    if(scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = () => {
    if(!input.trim()) return;
    sendMessage(input);
    setInput("");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] bg-surface border border-border rounded-2xl overflow-hidden shadow-2xl">
      <div className="flex flex-1 min-h-0">
        <div className="w-72 border-r border-border bg-background/50 hidden md:block p-4">
          <div className="flex items-center gap-3 p-3 bg-primary/10 border border-primary/20 rounded-xl">
            <img src={currentUser?.avatar_url} className="h-10 w-10 rounded-full" />
            <div><p className="font-bold text-white text-sm">General Chat</p><p className="text-xs text-primary">Online</p></div>
          </div>
        </div>

        <div className="flex-1 flex flex-col bg-background/30 relative">
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((m) => {
              const isMe = m.sender_id === currentUser?.id;
              return (
                <div key={m.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                  <img src={m.profiles?.avatar_url} className="h-8 w-8 rounded-full border border-border" />
                  <div className={`max-w-[75%] space-y-1 ${isMe ? 'items-end flex flex-col' : ''}`}>
                    <div className="flex items-baseline gap-2">
                       <span className="text-xs text-gray-400 font-bold">{m.profiles?.full_name}</span>
                       <span className="text-[10px] bg-white/10 px-1.5 rounded text-gray-500">{m.profiles?.role}</span>
                    </div>
                    <div className={`p-3 rounded-2xl text-sm ${isMe ? 'bg-primary text-white rounded-tr-none' : 'bg-surface border border-border text-gray-200 rounded-tl-none'}`}>
                      {m.content}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-surface border-t border-border shrink-0">
            <div className="flex gap-2 items-center bg-background border border-border rounded-xl p-2 px-4 focus-within:border-primary transition-colors">
              <button className="text-gray-500 hover:text-primary"><ImageIcon size={20} /></button>
              <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder:text-gray-600 outline-none" placeholder="Type a message..." />
              <button onClick={handleSend} className="bg-primary hover:bg-primary-hover text-white p-2 rounded-lg"><Send size={18} /></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
                      }
