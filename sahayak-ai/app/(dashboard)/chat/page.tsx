"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, User, Send, MessageSquare, Plus, Menu, Mic, MicOff, Loader2, Volume2 } from "lucide-react";
import type { Message } from "@/types";
import ChatBackground from "@/components/ChatBackground";
import { useWebSpeech } from "@/hooks/useWebSpeech";
import { db } from "@/lib/firebase";
import { collection, doc, setDoc, onSnapshot, query, orderBy, serverTimestamp, getDoc } from "firebase/firestore";

const WELCOME: Message = {
  role: "assistant",
  content: "Hi. I am Sahayak AI. How can I assist you with government schemes today?",
};

export default function ChatAIStudioLayout() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [chatId, setChatId] = useState<string | null>(null);
  const [chats, setChats] = useState<{ id: string; title: string; timestamp: unknown }[]>([]);
  const [speechLang, setSpeechLang] = useState("en-IN");
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const { isListening, isSpeaking, startListening, stopListening, speak, stopSpeaking } = useWebSpeech((text) => {
    setInput(text);
  });

  // Load chat history sidebar
  useEffect(() => {
    try {
      const q = query(collection(db, "chats"), orderBy("timestamp", "desc"));     
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const chatList = snapshot.docs.map(doc => ({
          id: doc.id,
          title: doc.data().title || "New Chat",
          timestamp: doc.data().timestamp
        }));
        setChats(chatList);
      }, (error) => {
        console.warn("Firestore snapshot error (likely permissions). History disabled.", error);
      });

      return () => unsubscribe();
    } catch (e) {
      console.warn("Firestore initialization error. History disabled.", e);
    }  }, []);
  // Scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const loadChat = async (id: string) => {
    try {
      setLoading(true);
      const docRef = doc(db, "chats", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setMessages(data.messages || [WELCOME]);
        setChatId(id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const startNewChat = () => {
    setChatId(null);
    setMessages([WELCOME]);
    setInput("");
  };

  async function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    if (isSpeaking) {
      stopSpeaking();
    }

    const userMessage: Message = { role: "user", content: trimmed };
    const nextMessages = [...messages, userMessage];
    
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/conversation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });

      if (!res.ok) {
        throw new Error(res.statusText);
      }

      const data = await res.json();
      const assistant: Message = {
        role: "assistant",
        content: data.reply,
        schemes: data.schemes,
        profile: data.profile,
        isComplete: data.isComplete
      };

      const finalMessages = [...nextMessages, assistant];
      setMessages(finalMessages);

      // Auto-save to Firebase (wrapped in a try-catch so it doesn't break the UI if Firestore permissions fail)
      try {
        const currentChatId = chatId || Math.random().toString(36).substring(7);
        if (!chatId) {
          setChatId(currentChatId);
        }

        const chatDocRef = doc(db, "chats", currentChatId);
        await setDoc(chatDocRef, {
          id: currentChatId,
          title: finalMessages.find(m => m.role === 'user')?.content.substring(0, 30) + '...' || "New Chat",
          messages: finalMessages,
          timestamp: serverTimestamp()
        }, { merge: true });
      } catch (firebaseErr) {
        console.error("Firebase sync failed, but chat continues:", firebaseErr);
      }

      // Speak response automatically
      speak(assistant.content);

    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { role: "assistant", content: "Error communicating. Please try again." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-[calc(100vh)] bg-[#050101] text-gray-200 relative overflow-hidden">
      <ChatBackground />
      {/* Sidebar: AI Studio Style */}
      <aside className="w-64 bg-[#1a1a1a]/40 backdrop-blur-xl border-r border-[#333]/50 flex-col hidden md:flex z-10">
        <div className="p-4 border-b border-[#333]/50">
          <button 
            onClick={startNewChat}
            className="flex items-center justify-center space-x-2 text-sm bg-[#E15A15] hover:bg-[#DA1702] rounded-lg w-full py-2.5 px-3 transition-colors text-white font-semibold shadow-lg"
          >     
            <Plus size={16} />
            <span>New Chat</span>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3 px-2 mt-2">Memory Logs</p>
          {chats.length === 0 ? (
            <p className="text-xs text-gray-500 px-2">No history yet.</p>
          ) : (
            chats.map(chat => (
              <button 
                key={chat.id} 
                onClick={() => loadChat(chat.id)}
                className={`flex items-center space-x-3 w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-[#2a2a2a]/60 transition-colors ${chatId === chat.id ? 'bg-[#333]/50 text-[#E15A15]' : 'text-gray-300'}`}
              >
                <MessageSquare size={14} className={chatId === chat.id ? 'text-[#E15A15]' : 'text-gray-500'} />
                <span className="truncate">{chat.title}</span>
              </button>
            ))
          )}
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col h-full bg-transparent z-10">        
        <header className="h-14 border-b border-[#333]/50 flex items-center px-4 justify-between bg-[#111111]/40 backdrop-blur-md">
          <div className="flex items-center space-x-3">
            <Menu className="md:hidden text-gray-400" size={20} />
            <h1 className="text-sm font-medium tracking-wide">Sahayak <span className="text-[#DA1702]">Intelligence</span></h1>       
          </div>
          <div className="flex items-center space-x-3 text-xs">
            {isSpeaking && (
              <span className="flex items-center gap-1 text-[#E15A15] animate-pulse">
                <Loader2 size={12} className="animate-spin" />
                Speaking...
              </span>
            )}
            <span className="bg-[#222]/50 px-2 py-1 rounded text-[#E15A15] font-mono text-[10px] tracking-wide border border-[#E15A15]/20 backdrop-blur-sm">Gemini Flash Voice</span> 
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 scroll-smooth">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] flex space-x-4 ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-lg ${msg.role === 'user' ? 'bg-[#E15A15]' : 'bg-[#1a1a1a] border border-[#333]'}`}>
                  {msg.role === 'user' ? <User size={14} className="text-white"/> : <Bot size={14} className="text-[#E15A15]"/>}
                </div>
                <div className="flex flex-col space-y-2 max-w-2xl">
                  <div className="flex items-start gap-2">
                    <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-md ${msg.role === 'user' ? 'bg-[#E15A15] text-white rounded-tr-none' : 'bg-[#1a1a1a]/80 backdrop-blur-md text-gray-200 border border-[#333]/80 rounded-tl-none'}`}>
                      <p className="whitespace-pre-wrap">{msg.content}</p>        
                    </div>
                    {msg.role === 'assistant' && (
                      <button 
                        onClick={() => speak(msg.content, "hi-IN")}
                        className="mt-2 p-1.5 rounded-full text-gray-500 hover:text-[#E15A15] hover:bg-[#222] transition-colors"
                        title="Read aloud"
                      >
                        <Volume2 size={16} />
                      </button>
                    )}
                  </div>
                  {msg.schemes && msg.schemes.length > 0 && (
                    <div className="mt-2 space-y-3">
                      <p className="text-[11px] text-[#A78F62] font-medium uppercase tracking-wider pl-1">Targeted Programs</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">   
                        {msg.schemes.map((s: { name: string, benefits: string, tags?: string[], score?: number }, idx: number) => (
                          <div key={idx} className="flex flex-col bg-[#151515]/90 backdrop-blur shadow-sm p-4 rounded-xl border border-[#333]/50 hover:border-[#E15A15]/40 transition-colors">
                            <div className="flex justify-between items-start mb-2 gap-2">
                              <strong className="text-sm text-[#A78F62] leading-tight">{s.name}</strong>
                              {s.score !== undefined && (
                                <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 border border-green-500/20">
                                  {Math.round((s.score / 15) * 100)}% Match
                               </span>
                              )}
                            </div>
                            <span className="text-xs text-gray-400 line-clamp-2 leading-relaxed mb-3 flex-grow">{s.benefits}</span>
                            {s.tags && s.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-auto">
                                {s.tags.slice(0, 3).map((tag, tagIdx) => (
                                  <span key={tagIdx} className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-[#222] text-gray-300 border border-[#444]">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          <div ref={bottomRef} className="h-4" />
        </div>

          {/* Input Area */}
        <div className="p-4 md:p-6 bg-gradient-to-t from-[#050101] to-transparent relative">
          <div className="max-w-4xl mx-auto flex items-end space-x-2 bg-[#1a1a1a]/90 backdrop-blur-xl border border-[#333] rounded-3xl pt-2 pb-2 px-3 focus-within:ring-1 ring-[#E15A15]/50 focus-within:border-[#E15A15]/50 transition-all shadow-2xl">
            <div className="flex items-center space-x-1 mb-0.5">
              <select
                value={speechLang}
                onChange={(e) => setSpeechLang(e.target.value)}
                className="bg-transparent text-gray-500 hover:text-gray-300 text-xs outline-none cursor-pointer p-1 appearance-none text-center font-medium font-mono"
                title="Select Voice Language"
              >
                <option value="en-IN">EN</option>
                <option value="hi-IN">HI</option>
                <option value="bn-IN">BN</option>
              </select>
              <button 
                onClick={isListening ? stopListening : () => startListening(speechLang)}
                className={`p-2 transition-colors rounded-full ${isListening ? 'bg-red-500/20 text-red-500 animate-pulse' : 'text-gray-400 hover:text-[#E15A15] hover:bg-[#2a2a2a]'}`} 
                title="Voice Input Dictation"
              >
                {isListening ? <MicOff size={18} /> : <Mic size={18} />}
              </button>
            </div>
            <textarea
              className="flex-1 max-h-48 min-h-[44px] bg-transparent text-sm resize-none focus:outline-none p-2.5 text-gray-200 placeholder-gray-500"
              placeholder="Ask anything or use voice dictation..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              rows={1}
            />
            <button
              onClick={handleSend}
              disabled={loading || (!input.trim() && !isListening)}
              className="bg-[#E15A15] hover:bg-[#DA1702] disabled:opacity-40 disabled:hover:bg-[#E15A15] text-white p-2.5 rounded-full transition-colors mb-0.5 mt-auto flex items-center justify-center shadow-lg"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className="ml-0.5" />}
            </button>
          </div>
          <p className="text-center text-[11px] text-gray-500 mt-4 font-medium drop-shadow-sm">
            Sahayak Intelligence can analyze your situation. Global Voice dictate enabled. Responses are generated by AI.
          </p>
        </div>
      </main>
    </div>
  );
}
