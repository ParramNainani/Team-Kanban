import { useState, useEffect, useRef, useCallback } from "react";

/**
 * Custom hook for Web Speech API (recognition + synthesis).
 * 
 * Strategy:
 * - Always try native speechSynthesis first (Chrome has great voices for most languages).
 * - Just set utterance.lang = BCP-47 code and let Chrome pick the right voice automatically.
 * - If native speech fires an error, fall back to Google Translate TTS via /api/tts proxy.
 */

// BCP-47 → Google Translate language code mapping (fallback only)
const GTTS_LANG_MAP: Record<string, string> = {
  "en-IN": "en", "hi-IN": "hi", "bn-IN": "bn", "ta-IN": "ta",
  "te-IN": "te", "gu-IN": "gu", "kn-IN": "kn", "ml-IN": "ml",
  "mr-IN": "mr", "pa-IN": "pa", "ur-IN": "ur", "af-ZA": "af",
  "ar-SA": "ar", "bg-BG": "bg", "cs-CZ": "cs", "da-DK": "da",
  "de-DE": "de", "el-GR": "el", "es-ES": "es", "fi-FI": "fi",
  "fr-FR": "fr", "he-IL": "iw", "hr-HR": "hr", "hu-HU": "hu",
  "id-ID": "id", "it-IT": "it", "ja-JP": "ja", "ko-KR": "ko",
  "nl-NL": "nl", "no-NO": "no", "pl-PL": "pl", "pt-BR": "pt",
  "ro-RO": "ro", "ru-RU": "ru", "sv-SE": "sv", "tr-TR": "tr",
  "uk-UA": "uk", "vi-VN": "vi", "zh-CN": "zh-CN",
};

export function useWebSpeech(onText: (text: string) => void) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const onTextRef = useRef(onText);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioQueueRef = useRef<string[]>([]);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => { onTextRef.current = onText; }, [onText]);

  // ─── Speech Recognition Setup ───
  useEffect(() => {
    if (typeof window === "undefined") return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      let currentTranscript = "";
      for (let i = 0; i < event.results.length; i++) {
        currentTranscript += event.results[i][0].transcript;
      }
      onTextRef.current(currentTranscript);
      
      // Reset silence timeout
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = setTimeout(() => {
        try { recognition.stop(); } catch { /* */ }
        setIsListening(false);
      }, 3000);
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    };
    recognition.onend = () => {
      setIsListening(false);
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    };
    recognitionRef.current = recognition;
    return () => { 
      try { recognition.stop(); } catch { /* */ } 
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    };
  }, []);

  const startListening = useCallback((lang: string = "en-IN") => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.lang = lang;
        recognitionRef.current.start();
        setIsListening(true);
        
        // Start initial silence timeout
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = setTimeout(() => {
          try { recognitionRef.current.stop(); } catch { /* */ }
          setIsListening(false);
        }, 3000);
      } catch (e) {
        console.error("Failed to start recognition:", e);
        setIsListening(false);
      }
    } else {
      alert("Voice input is not supported in this browser.");
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch { /* */ }
      setIsListening(false);
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    }
  }, []);

  // ─── Google TTS Proxy Fallback (chunked) ───
  const splitIntoChunks = (text: string, maxLen: number = 180): string[] => {
    const sentences = text.match(/[^.!?।\n]+[.!?।\n]?/g) || [text];
    const chunks: string[] = [];
    let current = "";
    for (const sentence of sentences) {
      const trimmed = sentence.trim();
      if (!trimmed) continue;
      if ((current + " " + trimmed).length > maxLen && current) {
        chunks.push(current.trim());
        current = trimmed;
      } else {
        current = current ? current + " " + trimmed : trimmed;
      }
    }
    if (current.trim()) chunks.push(current.trim());
    return chunks;
  };

  const playNextChunk = useCallback(() => {
    if (audioQueueRef.current.length === 0) {
      setIsSpeaking(false);
      return;
    }
    const url = audioQueueRef.current.shift()!;
    const audio = new Audio(url);
    audioRef.current = audio;
    audio.onended = () => playNextChunk();
    audio.onerror = () => playNextChunk(); // skip failed chunk
    audio.play().catch(() => setIsSpeaking(false));
  }, []);

  const speakViaProxy = useCallback((text: string, langCode: string) => {
    const gttsLang = GTTS_LANG_MAP[langCode] || langCode.split("-")[0];
    const chunks = splitIntoChunks(text);
    console.log(`TTS fallback: Google Translate for "${gttsLang}" (${chunks.length} chunks)`);
    audioQueueRef.current = chunks.map(chunk =>
      `/api/tts?text=${encodeURIComponent(chunk)}&lang=${gttsLang}`
    );
    setIsSpeaking(true);
    playNextChunk();
  }, [playNextChunk]);

  // ─── Main speak function ───
  const speak = useCallback((text: string, lang?: string) => {
    if (typeof window === "undefined") return;

    // Cancel any ongoing speech
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    audioQueueRef.current = [];

    // Clean markdown
    const cleanText = text
      .replace(/[#*_~`>]/g, "")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/\n{2,}/g, ". ")
      .replace(/\s{2,}/g, " ")
      .trim();
    if (!cleanText) return;

    const langCode = lang || "en-IN";
    const langPrefix = langCode.split("-")[0];

    // ─── Native speechSynthesis ONLY for English and Hindi ───
    // These are the only languages where browser voices sound correct.
    // All other languages (Bengali, Tamil, Telugu, etc.) use Google TTS proxy.
    if ((langPrefix === "en" || langPrefix === "hi") && "speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = langCode;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onerror = (e) => {
        console.warn("Native TTS failed, falling back to proxy:", e.error);
        speakViaProxy(cleanText, langCode);
      };

      // Chrome 15s pause fix
      const timer = setInterval(() => {
        if (window.speechSynthesis.speaking) window.speechSynthesis.resume();
        else clearInterval(timer);
      }, 10000);
      utterance.onend = () => { clearInterval(timer); setIsSpeaking(false); };

      window.speechSynthesis.speak(utterance);
      return;
    }

    // ─── All other languages → Google Translate TTS proxy ───
    speakViaProxy(cleanText, langCode);
  }, [speakViaProxy]);

  const stopSpeaking = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    audioQueueRef.current = [];
    setIsSpeaking(false);
  }, []);

  return { isListening, isSpeaking, startListening, stopListening, speak, stopSpeaking };
}
