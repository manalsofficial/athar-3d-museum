import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useRef,
  type ReactNode,
} from "react";
import type { Language } from "../types";
import { translations, type TranslationKey } from "../data/translations";

export type AppContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  speak: (text: string, language?: Language) => void;
  speakWithAI: (text: string, language?: Language) => Promise<void>;
  stopSpeaking: () => void;
  t: (key: TranslationKey) => string;
};

const AppContext = createContext<AppContextValue | null>(null);

function getBestVoice(language: Language): SpeechSynthesisVoice | undefined {
  if (!("speechSynthesis" in window)) return undefined;
  const voices = window.speechSynthesis.getVoices();
  const wanted = language === "ar" ? "ar" : "en";
  const matching = voices.filter(v => v.lang.toLowerCase().startsWith(wanted));

  if (language === "ar") {
    return matching.find(v => v.lang.toLowerCase() === "ar-sa") ||
      matching.find(v => /arabic|maged|naayf/i.test(v.name)) ||
      matching[0];
  }

  return matching.find(v => v.lang.toLowerCase() === "en-us") ||
    matching.find(v => /samantha|alex|daniel|karen/i.test(v.name)) ||
    matching[0];
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");
  const aiAudioRef = useRef<HTMLAudioElement | null>(null);

  const t = useCallback(
    (key: TranslationKey) => translations[language][key],
    [language]
  );

  const speak = useCallback(
    (text: string, lang: Language = language) => {
      if (!("speechSynthesis" in window)) return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const voice = getBestVoice(lang);
      if (voice) utterance.voice = voice;
      utterance.lang = lang === "ar" ? "ar-SA" : "en-US";
      utterance.rate = lang === "ar" ? 0.88 : 0.92;
      utterance.pitch = 0.96;
      utterance.volume = 1;
      window.speechSynthesis.speak(utterance);
    },
    [language]
  );

  const speakWithAI = useCallback(
    async (text: string, lang: Language = language) => {
      try {
        if (aiAudioRef.current) {
          aiAudioRef.current.pause();
          aiAudioRef.current.currentTime = 0;
          aiAudioRef.current = null;
        }
        const response = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, language: lang }),
        });
        if (!response.ok) throw new Error("TTS request failed");
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audio.preload = "auto";
        aiAudioRef.current = audio;
        audio.onended = () => {
          URL.revokeObjectURL(url);
          if (aiAudioRef.current === audio) aiAudioRef.current = null;
        };
        await audio.play();
      } catch {
        if (!("speechSynthesis" in window)) return;
        await new Promise<void>(resolve => {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(text);
          const voice = getBestVoice(lang);
          if (voice) utterance.voice = voice;
          utterance.lang = lang === "ar" ? "ar-SA" : "en-US";
          utterance.rate = lang === "ar" ? 0.88 : 0.92;
          utterance.pitch = 0.96;
          utterance.volume = 1;
          utterance.onend = () => resolve();
          utterance.onerror = () => resolve();
          window.speechSynthesis.speak(utterance);
        });
      }
    },
    [language, speak]
  );

  const stopSpeaking = useCallback(() => {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    if (aiAudioRef.current) {
      aiAudioRef.current.pause();
      aiAudioRef.current.currentTime = 0;
      aiAudioRef.current = null;
    }
  }, []);

  useEffect(() => {
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = language;

    if ("speechSynthesis" in window) {
      window.speechSynthesis.getVoices();
    }
  }, [language]);

  const value = useMemo(
    () => ({ language, setLanguage, speak, speakWithAI, stopSpeaking, t }),
    [language, speak, speakWithAI, stopSpeaking, t]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used inside AppProvider");
  return context;
}
