"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState, useCallback } from "react";
import { Bot, User, Send, MessageSquare, Plus, Menu, X as XIcon, Mic, MicOff, Loader2, Volume2, LogIn, LogOut, Paperclip, X, BarChart3 } from "lucide-react";
import type { Message } from "@/types";
import ChatBackground from "@/components/ChatBackground";
import GapGraph from "@/components/GapGraph";
import ReactMarkdown from "react-markdown";
import { useWebSpeech } from "@/hooks/useWebSpeech";
import { db } from "@/lib/firebase";
import { collection, doc, setDoc, onSnapshot, query, orderBy, getDoc } from "firebase/firestore";
import { useAuth } from "@/components/AuthProvider";

const WELCOME: Message = {
  role: "assistant",
  content: "Namaste! 🙏 I'm **Sahayak AI**, your personal guide to government welfare schemes in India.\n\nTell me a little about yourself — your **age**, **occupation**, and **state** — and I'll find the best schemes for you.\n\nYou can also use **voice input** in 38+ languages!",
};

const SUPPORTED_LANGUAGES = [
  { value: "en-IN", label: "English" },
  { value: "hi-IN", label: "Hindi" },
  { value: "bn-IN", label: "Bengali" },
  { value: "af-ZA", label: "Afrikaans" },
  { value: "ar-SA", label: "Arabic" },
  { value: "bg-BG", label: "Bulgarian" },
  { value: "cs-CZ", label: "Czech" },
  { value: "da-DK", label: "Danish" },
  { value: "de-DE", label: "German" },
  { value: "el-GR", label: "Greek" },
  { value: "es-ES", label: "Spanish" },
  { value: "fi-FI", label: "Finnish" },
  { value: "fr-FR", label: "French" },
  { value: "gu-IN", label: "Gujarati" },
  { value: "he-IL", label: "Hebrew" },
  { value: "hr-HR", label: "Croatian" },
  { value: "hu-HU", label: "Hungarian" },
  { value: "id-ID", label: "Indonesian" },
  { value: "it-IT", label: "Italian" },
  { value: "ja-JP", label: "Japanese" },
  { value: "kn-IN", label: "Kannada" },
  { value: "ko-KR", label: "Korean" },
  { value: "ml-IN", label: "Malayalam" },
  { value: "mr-IN", label: "Marathi" },
  { value: "nl-NL", label: "Dutch" },
  { value: "no-NO", label: "Norwegian" },
  { value: "pa-IN", label: "Punjabi" },
  { value: "pl-PL", label: "Polish" },
  { value: "pt-BR", label: "Portuguese" },
  { value: "ro-RO", label: "Romanian" },
  { value: "ru-RU", label: "Russian" },
  { value: "sv-SE", label: "Swedish" },
  { value: "ta-IN", label: "Tamil" },
  { value: "te-IN", label: "Telugu" },
  { value: "tr-TR", label: "Turkish" },
  { value: "uk-UA", label: "Ukrainian" },
  { value: "ur-IN", label: "Urdu" },
  { value: "vi-VN", label: "Vietnamese" },
  { value: "zh-CN", label: "Chinese" },
];

export default function ChatAIStudioLayout() {
  const [input, setInput] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [chatId, setChatId] = useState<string | null>(null);
  const [chats, setChats] = useState<{ id: string; title: string; timestamp: unknown }[]>([]);
  const [speechLang, setSpeechLang] = useState("en-IN");
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [usedVoiceInput, setUsedVoiceInput] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const { user, signInWithGoogle, signOut } = useAuth();

  const onSpeechText = useCallback((text: string) => {
    setInput(text);
    setUsedVoiceInput(true);
  }, []);

  const { isListening, isSpeaking, startListening, stopListening, speak, stopSpeaking } = useWebSpeech(onSpeechText);

  // Load chat history sidebar
  useEffect(() => {
    if (!user) { setChats([]); return; }
    try {
      const q = query(collection(db, "users", user.uid, "chats"), orderBy("timestamp", "desc"));
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
    }
  }, [user]);

  // Scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const loadChat = async (id: string) => {
    if (!user) return;
    try {
      setLoading(true);
      const docRef = doc(db, "users", user.uid, "chats", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setMessages(data.messages || [WELCOME]);
        setChatId(id);
      }
      setMobileMenuOpen(false);
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
    setMobileMenuOpen(false);
  };

  async function uploadFileToCloudinary(file: File) {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      throw new Error("Missing Cloudinary configuration. Please provide NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET in your .env.local file.");
    }

    // Client-side file size validation (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error("File too large. Maximum size is 5MB.");
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, { method: "POST", body: formData });
    if (!res.ok) {
      const errorText = await res.text();
      console.error("Cloudinary response:", errorText);
      throw new Error(`Upload failed: ${res.statusText}`);
    }
    const data = await res.json();
    return data.secure_url;
  }

  async function handleSend() {
    const trimmed = input.trim();
    if ((!trimmed && !attachment) || loading) return;

    if (isSpeaking) {
      stopSpeaking();
    }

    setLoading(true);
    let attachedUrl = "";
    if (attachment) {
      try {
        if (!user) {
          alert("Please sign in to process documents.");
          setLoading(false);
          return;
        }
        attachedUrl = await uploadFileToCloudinary(attachment);
      } catch(e: unknown) {
        console.error("Upload Error:", e);
        alert(e instanceof Error ? e.message : "Failed to upload document.");
        setLoading(false);
        return;
      }
    }

    const userMessage: Message = { role: "user", content: trimmed, attachmentUrl: attachedUrl || undefined };
    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setInput("");
    setAttachment(null);

    try {
      const selectedLanguageLabel = SUPPORTED_LANGUAGES.find(l => l.value === speechLang)?.label || "English";
      const res = await fetch("/api/conversation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages, language: selectedLanguageLabel, languageCode: speechLang }),
      });

      if (!res.ok) {
        throw new Error(`Server error: ${res.status} ${res.statusText}`);
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

      // Save profile to sessionStorage for gap-report page
      if (data.isComplete && data.profile) {
        try {
          sessionStorage.setItem("sahayak_profile", JSON.stringify(data.profile));
        } catch { /* sessionStorage may be unavailable */ }
      }

      // Auto-save to Firebase
      try {
        if (!user) throw new Error("Not logged in");
        const currentChatId = chatId || crypto.randomUUID();
        if (!chatId) {
          setChatId(currentChatId);
        }

        const sanitizedMessages = JSON.parse(JSON.stringify(finalMessages));

        const chatDocRef = doc(db, "users", user.uid, "chats", currentChatId);
        await setDoc(chatDocRef, {
          id: currentChatId,
          title: sanitizedMessages.find((m: Message) => m.role === "user")?.content.substring(0, 30) + "..." || "New Chat",
          messages: sanitizedMessages,
          timestamp: Date.now()
        }, { merge: true });
      } catch (firebaseErr: unknown) {
        console.error("Firebase sync failed:", (firebaseErr as Error)?.message || firebaseErr);
      }

      // Only auto-speak if the user used voice input
      if (usedVoiceInput) {
        speak(assistant.content, speechLang);
        setUsedVoiceInput(false);
      }

    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "I'm sorry, there was an error processing your request. Please try again."
      }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-[calc(100vh)] bg-[#050101] text-gray-200 relative overflow-hidden">
      <ChatBackground />

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setMobileMenuOpen(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <aside
            className="absolute left-0 top-0 h-full w-72 bg-[#1a1a1a]/95 backdrop-blur-xl border-r border-[#333]/50 flex flex-col z-50 animate-in slide-in-from-left"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-4 border-b border-[#333]/50 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-200">Chats</h2>
              <button onClick={() => setMobileMenuOpen(false)} className="p-1 text-gray-400 hover:text-white">
                <XIcon size={18} />
              </button>
            </div>
            <div className="p-4 border-b border-[#333]/50 flex flex-col gap-3">
              <button
                onClick={startNewChat}
                className="flex items-center justify-center space-x-2 text-sm bg-[#E15A15] hover:bg-[#DA1702] rounded-lg w-full py-2.5 px-3 transition-colors text-white font-semibold shadow-lg"
              >
                <Plus size={16} />
                <span>New Chat</span>
              </button>
              <Link
                href="/gap-report"
                className="flex items-center justify-center space-x-2 text-sm bg-transparent hover:bg-[#333]/50 text-gray-300 border border-[#333]/50 rounded-lg w-full py-2 px-3 transition-colors"
              >
                <BarChart3 size={15} />
                <span>Gap Reports</span>
              </Link>
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
                    className={`flex items-center space-x-3 w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-[#2a2a2a]/60 transition-colors ${chatId === chat.id ? "bg-[#333]/50 text-[#E15A15]" : "text-gray-300"}`}
                  >
                    <MessageSquare size={14} className={chatId === chat.id ? "text-[#E15A15]" : "text-gray-500"} />
                    <span className="truncate">{chat.title}</span>
                  </button>
                ))
              )}
            </div>
          </aside>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="w-64 bg-[#1a1a1a]/40 backdrop-blur-xl border-r border-[#333]/50 flex-col hidden md:flex z-10">
        <div className="p-4 border-b border-[#333]/50 flex flex-col gap-3">
          <button
            onClick={startNewChat}
            className="flex items-center justify-center space-x-2 text-sm bg-[#E15A15] hover:bg-[#DA1702] rounded-lg w-full py-2.5 px-3 transition-colors text-white font-semibold shadow-lg"
          >
            <Plus size={16} />
            <span>New Chat</span>
          </button>

          <Link
            href="/gap-report"
            className="flex items-center justify-center space-x-2 text-sm bg-transparent hover:bg-[#333]/50 text-gray-300 border border-[#333]/50 rounded-lg w-full py-2 px-3 transition-colors"
          >
            <BarChart3 size={15} />
            <span>Gap Reports</span>
          </Link>
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
                className={`flex items-center space-x-3 w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-[#2a2a2a]/60 transition-colors ${chatId === chat.id ? "bg-[#333]/50 text-[#E15A15]" : "text-gray-300"}`}
              >
                <MessageSquare size={14} className={chatId === chat.id ? "text-[#E15A15]" : "text-gray-500"} />
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
            <button
              className="md:hidden text-gray-400 hover:text-white transition-colors p-1"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-2">
              <Image src="/logo.jpeg" alt="Sahayak Logo" width={40} height={40} className="h-10 w-10 rounded-md object-cover" />
              <h1 className="text-[16px] font-medium tracking-wide">Sahayak <span className="text-[#DA1702]">Intelligence</span></h1>
            </div>
          </div>
          <div className="flex items-center space-x-3 text-xs">
            {isSpeaking && (
              <button
                onClick={stopSpeaking}
                className="flex items-center gap-1 text-[#E15A15] animate-pulse hover:text-[#DA1702] transition-colors"
              >
                <Loader2 size={12} className="animate-spin" />
                Speaking...
              </button>
            )}
            <span className="bg-[#222]/50 px-2 py-1 rounded text-[#E15A15] font-mono text-[10px] tracking-wide border border-[#E15A15]/20 backdrop-blur-sm hidden sm:inline-block">Gemini 2.5 Flash</span>
            <Link href="/gap-report" className="rounded-full border border-[#E15A15]/30 bg-[#111]/70 px-3 py-1 text-[10px] uppercase tracking-[0.35em] text-amber-200 transition hover:bg-[#E15A15]/10 hover:border-[#E15A15]/60">
              Gap report
            </Link>
            {user ? (
              <button onClick={signOut} className="flex items-center gap-1 bg-[#222]/50 px-3 py-1.5 rounded text-gray-300 hover:text-white transition-colors border border-[#333]">
                <LogOut size={12} />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            ) : (
              <button onClick={signInWithGoogle} className="flex items-center gap-1 bg-[#E15A15] hover:bg-[#DA1702] px-3 py-1.5 rounded text-white transition-colors">
                <LogIn size={12} />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 scroll-smooth">
          {messages.map((msg, i) => (
            <div key={`${msg.role}-${i}-${msg.content.substring(0, 20)}`} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[95%] lg:max-w-4xl xl:max-w-5xl flex space-x-4 ${msg.role === "user" ? "flex-row-reverse space-x-reverse" : ""}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-lg ${msg.role === "user" ? "bg-[#E15A15]" : "bg-[#1a1a1a] border border-[#333]"}`}>
                  {msg.role === "user" ? <User size={14} className="text-white"/> : <Bot size={14} className="text-[#E15A15]"/>}
                </div>
                <div className={`flex flex-col space-y-2 ${msg.role === "user" ? "items-end" : "items-start"} w-auto max-w-4xl xl:max-w-5xl`}>
                  <div className="flex items-start gap-2">
                    <div className={`p-4 md:p-5 rounded-2xl text-base md:text-lg leading-relaxed shadow-md ${msg.role === "user" ? "bg-[#E15A15] text-white rounded-tr-none" : "bg-[#1a1a1a]/80 backdrop-blur-md text-gray-200 border border-[#333]/80 rounded-tl-none"}`}>
                        <div className="prose prose-invert max-w-none text-base md:text-lg prose-p:text-base md:prose-p:text-lg prose-p:leading-relaxed prose-li:text-base md:prose-li:text-lg prose-pre:bg-[#222] prose-pre:border prose-pre:border-[#333] prose-a:text-blue-400 hover:prose-a:text-blue-300">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      {msg.attachmentUrl && (
                        <div className="mt-3 inline-flex border border-[#333] rounded-lg p-2 bg-[#222]/50 hover:bg-[#333]/50 transition-colors">
                          <a href={msg.attachmentUrl} target="_blank" rel="noopener noreferrer" className="text-white hover:text-[#E15A15] flex items-center gap-2 text-xs">
                            <Paperclip size={14} /> View File
                          </a>
                        </div>
                      )}
                    </div>
                    {msg.role === "assistant" && (
                      <button
                        onClick={() => speak(msg.content, speechLang)}
                        className="mt-2 p-1.5 rounded-full text-gray-500 hover:text-[#E15A15] hover:bg-[#222] transition-colors"
                        title="Read aloud"
                      >
                        <Volume2 size={16} />
                      </button>
                    )}
                  </div>
                  {msg.schemes && msg.schemes.length > 0 && (
                    <div className="mt-2 space-y-3 w-full">
                      <p className="text-[11px] text-[#A78F62] font-medium uppercase tracking-wider pl-1">Targeted Programs</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {msg.schemes.map((s, idx) => (
                          <div key={`scheme-${s.id}-${idx}`} className="flex flex-col bg-[#151515]/90 backdrop-blur shadow-sm p-4 rounded-xl border border-[#333]/50 hover:border-[#E15A15]/40 transition-colors">
                            <div className="flex justify-between items-start mb-2 gap-2">
                              <strong className="text-sm text-[#A78F62] leading-tight">{s.name}</strong>
                              {s.score !== undefined && (
                                <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                  Math.round((s.score / 20) * 100) >= 80
                                    ? "bg-green-500/10 text-green-500 border-green-500/20"
                                    : Math.round((s.score / 20) * 100) >= 60
                                    ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                    : "bg-gray-500/10 text-gray-400 border-gray-500/20"
                                }`}>
                                  {Math.round((s.score / 20) * 100)}% Match
                               </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-400 leading-relaxed mb-3 flex-grow space-y-2">
                              {s.description && (
                                <p className="line-clamp-2 text-gray-300" title={s.description}>{s.description}</p>
                              )}
                              <p className="line-clamp-2" title={s.benefits}>{s.benefits}</p>

                              {s.estimatedBenefit > 0 && (
                                <div className="mt-1 pt-1 border-t border-[#333]/50">
                                  <span className="text-[#E15A15] font-semibold">₹{s.estimatedBenefit.toLocaleString("en-IN")}</span>
                                  <span className="text-gray-500 ml-1">estimated annual benefit</span>
                                </div>
                              )}

                              {s.documents && s.documents.length > 0 && (
                                <div className="mt-1 pt-1 border-t border-[#333]/50 text-[#E15A15]/80">
                                  <strong className="text-[10px] uppercase text-gray-500 mr-2">Documents:</strong>
                                  {s.documents.join(", ")}
                                </div>
                              )}

                              {s.links && s.links.length > 0 && (
                                <div className="mt-1 flex flex-wrap gap-1">
                                  <strong className="text-[10px] uppercase text-gray-500 w-full">Apply Here:</strong>
                                  {s.links.map((link, lidx) => (
                                    <a key={lidx} href={link} target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-400 hover:text-blue-300 underline inline-flex items-center bg-blue-500/10 px-1.5 py-0.5 rounded">
                                      Official Portal {lidx + 1}
                                    </a>
                                  ))}
                                </div>
                              )}
                            </div>
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
                      {/* GapGraph with real data from matched schemes */}
                      {(() => {
                        const totalEligible = msg.schemes?.reduce((sum, s) => sum + (s.estimatedBenefit || 5000), 0) || 0;
                        // Estimate received as 40% of eligible (realistic gap)
                        const totalReceived = Math.round(totalEligible * 0.4);
                        return (
                          <div className="mt-6">
                            <GapGraph totalEligible={totalEligible} totalReceived={totalReceived} unit="currency" />
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="max-w-[95%] lg:max-w-4xl xl:max-w-5xl flex space-x-4">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-lg bg-[#1a1a1a] border border-[#333]">
                  <Bot size={14} className="text-[#E15A15]"/>
                </div>
                <div className="p-4 md:p-5 rounded-2xl bg-[#1a1a1a]/80 backdrop-blur-md text-gray-200 border border-[#333]/80 rounded-tl-none">
                  <div className="flex items-center gap-3">
                    <div className="flex space-x-1">
                      <span className="w-2 h-2 bg-[#E15A15] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 bg-[#E15A15] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 bg-[#E15A15] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                    <span className="text-sm text-gray-400">Analyzing your situation...</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} className="h-4" />
        </div>

        {/* Input Area */}
        <div className="p-4 md:p-6 bg-gradient-to-t from-[#050101] to-transparent relative">
          <div className="max-w-4xl mx-auto w-full">
            {attachment && (
              <div className="mb-2 inline-flex items-center gap-2 bg-[#222] border border-[#333] px-3 py-1.5 rounded-xl text-sm text-gray-300 ml-2">
                <Paperclip size={14} className="text-[#E15A15]"/>
                <span className="truncate max-w-[200px]">{attachment.name}</span>
                <button onClick={() => setAttachment(null)} className="text-gray-500 hover:text-white"><X size={14}/></button>
              </div>
            )}
            <div className="flex items-end space-x-2 bg-[#1a1a1a]/90 backdrop-blur-xl border border-[#333] rounded-3xl pt-3 pb-3 px-4 focus-within:ring-1 ring-[#E15A15]/50 focus-within:border-[#E15A15]/50 transition-all shadow-2xl">
            <button onClick={() => fileInputRef.current?.click()} className="p-2 mb-0.5 text-gray-400 hover:text-[#E15A15] transition-colors rounded-full hover:bg-[#2a2a2a]"><Paperclip size={18} /></button>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*,.pdf"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file && file.size > 5 * 1024 * 1024) {
                  alert("File too large. Maximum size is 5MB.");
                  return;
                }
                setAttachment(file || null);
              }}
            />
            <div className="relative flex items-center space-x-1 mb-0.5">
              <button
                onClick={() => setShowLangDropdown(!showLangDropdown)}
                className="flex items-center justify-center p-2 text-xs font-bold font-mono text-gray-400 hover:text-[#E15A15] hover:bg-[#2a2a2a] transition-colors rounded-full relative group"
                title="Select Voice Language"
              >
                <div className="absolute inset-0 bg-[#E15A15]/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative z-10">{SUPPORTED_LANGUAGES.find(l => l.value === speechLang)?.label || "EN"}</span>
              </button>

              {showLangDropdown && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowLangDropdown(false)} />
                  <div className="absolute bottom-full left-0 mb-3 w-40 max-h-64 overflow-y-auto bg-[#1a1a1a] border border-[#333] rounded-2xl shadow-2xl p-1.5 z-50 transform origin-bottom-left custom-scrollbar">
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <button
                        key={lang.value}
                        onClick={() => { setSpeechLang(lang.value); setShowLangDropdown(false); }}
                        className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-xl transition-all ${speechLang === lang.value ? "bg-[#E15A15]/10 text-[#E15A15] font-semibold" : "text-gray-400 hover:bg-[#252525] hover:text-gray-200"}`}
                      >
                        <span>{lang.label}</span>
                        <span className="text-[10px] opacity-40">{lang.value.split("-")[0].toUpperCase()}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
              <button
                onClick={isListening ? stopListening : () => { startListening(speechLang); setUsedVoiceInput(true); }}
                className={`p-2 transition-colors rounded-full ${isListening ? "bg-red-500/20 text-red-500 animate-pulse" : "text-gray-400 hover:text-[#E15A15] hover:bg-[#2a2a2a]"}`}
                title="Voice Input Dictation"
              >
                {isListening ? <MicOff size={18} /> : <Mic size={18} />}
              </button>
            </div>
            <textarea
                className="flex-1 max-h-48 min-h-[52px] bg-transparent text-sm resize-none focus:outline-none p-2.5 text-gray-200 placeholder-gray-500"
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
              disabled={loading || (!input.trim() && !attachment)}
              className="bg-[#E15A15] hover:bg-[#DA1702] disabled:opacity-40 disabled:hover:bg-[#E15A15] text-white p-2.5 rounded-full transition-colors mb-0.5 mt-auto flex items-center justify-center shadow-lg"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className="ml-0.5" />}
            </button>
          </div>
          </div>
          <p className="text-center text-[11px] text-gray-500 mt-4 font-medium drop-shadow-sm">
            Sahayak Intelligence can analyze your situation. Global Voice dictation enabled. Responses are generated by AI.
          </p>
        </div>
      </main>
    </div>
  );
}
