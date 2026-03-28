import { useState, useEffect, useRef, useCallback } from "react";

/**
 * Custom hook for Web Speech API (recognition) + Google Translate TTS proxy (synthesis).
 * 
 * For English/Hindi: uses browser's native speechSynthesis (fast, no network).
 * For all other languages: uses our /api/tts proxy that fetches from Google Translate
 * (same pronunciation quality as Google Translate's listen button).
 */

// BCP-47 → Google Translate language code mapping
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

  useEffect(() => { onTextRef.current = onText; }, [onText]);

  // ─── Speech Recognition Setup ───
  useEffect(() => {
    if (typeof window === "undefined") return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      onTextRef.current(text);
      setIsListening(false);
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;

    return () => { try { recognition.stop(); } catch { /* */ } };
  }, []);

  const startListening = useCallback((lang: string = "en-IN") => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.lang = lang;
        recognitionRef.current.start();
        setIsListening(true);
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
    }
  }, []);

  // ─── Check if browser has a usable native voice ───
  const hasNativeVoice = useCallback((langCode: string): boolean => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return false;
    const voices = window.speechSynthesis.getVoices();
    const prefix = langCode.toLowerCase().split("-")[0];
    return voices.some(v => v.lang.toLowerCase().startsWith(prefix));
  }, []);

  // ─── Native browser TTS (English, Hindi) ───
  const speakNative = useCallback((text: string, langCode: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const targetPrefix = langCode.toLowerCase().split("-")[0];

    // Find best voice: prefer Google > exact match > prefix match
    const googleMatch = voices.find(v =>
      v.lang.toLowerCase().startsWith(targetPrefix) && v.name.toLowerCase().includes("google")
    );
    const exactMatch = voices.find(v => v.lang.toLowerCase() === langCode.toLowerCase());
    const prefixMatch = voices.find(v => v.lang.toLowerCase().startsWith(targetPrefix));

    const bestVoice = googleMatch || exactMatch || prefixMatch;
    if (bestVoice) {
      utterance.voice = bestVoice;
      utterance.lang = bestVoice.lang;
    } else {
      utterance.lang = langCode;
    }

    if (targetPrefix !== "en") utterance.rate = 0.9;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onerror = () => setIsSpeaking(false);

    // Chrome 15s pause fix
    const timer = setInterval(() => {
      if (window.speechSynthesis.speaking) window.speechSynthesis.resume();
      else clearInterval(timer);
    }, 10000);

    utterance.onend = () => { clearInterval(timer); setIsSpeaking(false); };
    window.speechSynthesis.speak(utterance);
  }, []);

  // ─── Split text into TTS-friendly chunks (~180 chars max) ───
  const splitIntoChunks = (text: string, maxLen: number = 180): string[] => {
    // Split on sentence boundaries (including Hindi/Bengali danda ।)
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

  // ─── Play audio chunks sequentially via our /api/tts proxy ───
  const playNextChunk = useCallback(() => {
    if (audioQueueRef.current.length === 0) {
      setIsSpeaking(false);
      return;
    }

    const url = audioQueueRef.current.shift()!;
    const audio = new Audio(url);
    audioRef.current = audio;

    audio.onended = () => playNextChunk();
    audio.onerror = (err) => {
      console.error("TTS audio chunk failed:", err);
      playNextChunk(); // skip failed chunk
    };

    audio.play().catch(err => {
      console.error("TTS play failed:", err);
      setIsSpeaking(false);
    });
  }, []);

  const speakViaTTSProxy = useCallback((text: string, langCode: string) => {
    const gttsLang = GTTS_LANG_MAP[langCode] || langCode.split("-")[0];
    const chunks = splitIntoChunks(text);

    console.log(`TTS: Using Google Translate voice for "${gttsLang}" (${chunks.length} chunks)`);

    // Build URLs through our own /api/tts proxy (bypasses CORS)
    const urls = chunks.map(chunk => {
      const encoded = encodeURIComponent(chunk);
      return `/api/tts?text=${encoded}&lang=${gttsLang}`;
    });

    audioQueueRef.current = urls;
    setIsSpeaking(true);
    playNextChunk();
  }, [playNextChunk]);

  // ─── Main speak function ───
  const speak = useCallback((text: string, lang?: string) => {
    if (typeof window === "undefined") return;

    // Stop any ongoing speech
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    audioQueueRef.current = [];

    // Clean markdown for TTS
    const cleanText = text
      .replace(/[#*_~`>]/g, "")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/\n{2,}/g, ". ")
      .replace(/\s{2,}/g, " ")
      .trim();

    if (!cleanText) return;

    const langCode = lang || "en-IN";

    // Use native voice for English/Hindi (fast), Google TTS proxy for everything else
    if (hasNativeVoice(langCode)) {
      console.log(`TTS: Using native browser voice for ${langCode}`);
      speakNative(cleanText, langCode);
    } else {
      speakViaTTSProxy(cleanText, langCode);
    }
  }, [hasNativeVoice, speakNative, speakViaTTSProxy]);

  const stopSpeaking = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    audioQueueRef.current = [];
    setIsSpeaking(false);
  }, []);

  return { isListening, isSpeaking, startListening, stopListening, speak, stopSpeaking };
}
