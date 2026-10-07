import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "./AppContext";
import type { Language } from "../types";

export type VoiceContextValue = {
  listening: boolean;
  voiceLanguage: Language | null;
  startListening: () => void;
  stopListening: () => void;
  chooseLanguage: (language: Language) => void;
};

const VoiceContext = createContext<VoiceContextValue | null>(null);

type Recognition = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: any) => void) | null;
  onresult: ((event: any) => void) | null;
  start: () => void;
  stop: () => void;
};

function normalize(text: string) {
  return text.toLowerCase().trim().replace(/[؟?!.,،]/g, "");
}

export function VoiceProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const { language, setLanguage, speakWithAI, stopSpeaking } = useApp();

  const [listening, setListening] = useState(false);
  const [voiceLanguage, setVoiceLanguage] = useState<Language | null>(null);
  const [choosingLanguage, setChoosingLanguage] = useState(false);
  const recognitionRef = useRef<Recognition | null>(null);
  const commandModeRef = useRef<"language" | "command">("language");
  const restartRef = useRef(false);
  const handleVoiceCommandRef = useRef<(text: string) => void>(() => {});

  const RecognitionClass = useCallback(() => {
    return (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  }, []);

  const stopListening = useCallback(() => {
    restartRef.current = false;
    try { recognitionRef.current?.stop(); } catch {}
    setListening(false);
  }, []);

  const createRecognition = useCallback((lang: Language) => {
    const SpeechRecognition = RecognitionClass();
    if (!SpeechRecognition) return null;

    const recognition = new SpeechRecognition() as Recognition;
    recognition.lang = lang === "ar" ? "ar-SA" : "en-US";
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onstart = () => setListening(true);
    recognition.onerror = (event: any) => {
      if (event?.error !== "no-speech") console.warn("ATHAR voice error", event?.error);
      setListening(false);
    };
    recognition.onend = () => {
      setListening(false);
      if (restartRef.current) {
        window.setTimeout(() => {
          try { recognition.start(); } catch {}
        }, 250);
      }
    };
    recognition.onresult = (event: any) => {
      const last = event.results[event.results.length - 1];
      const transcript = last?.[0]?.transcript?.trim() || "";
      if (!transcript) return;
      handleVoiceCommandRef.current(transcript);
    };

    return recognition;
  }, [RecognitionClass]);

  const beginCommandListening = useCallback((lang: Language) => {
    recognitionRef.current = createRecognition(lang);
    if (!recognitionRef.current) return;
    restartRef.current = true;
    try { recognitionRef.current.start(); } catch {}
  }, [createRecognition]);

  const chooseLanguage = useCallback((lang: Language) => {
    setLanguage(lang);
    setVoiceLanguage(lang);
    setChoosingLanguage(false);
    commandModeRef.current = "command";
    speakWithAI(
      lang === "ar"
        ? "تم اختيار اللغة العربية. يمكنك الآن قول الرئيسية، استكشف المتحف، ابحث عن شخص، شارك قصتك، أو رجوع."
        : "English selected. You can say home, explore the museum, find a person, share your story, or go back.",
      lang
    ).finally(() => beginCommandListening(lang));
  }, [beginCommandListening, setLanguage, speakWithAI]);

  const askForLanguage = useCallback(() => {
    const SpeechRecognition = RecognitionClass();
    if (!SpeechRecognition) {
      speakWithAI("Voice navigation is not supported in this browser. Please use Safari or Chrome with microphone access.", language);
      return;
    }

    setChoosingLanguage(true);
    commandModeRef.current = "language";
    stopListening();
    const promptLanguage = language;
    speakWithAI(
      promptLanguage === "ar"
        ? "مرحباً بك في أثر. هل تريد استخدام العربية أم الإنجليزية؟"
        : "Welcome to ATHAR. Would you like to use English or Arabic?",
      promptLanguage
    ).finally(() => {
      recognitionRef.current = createRecognition(promptLanguage);
      if (!recognitionRef.current) return;
      restartRef.current = false;
      try { recognitionRef.current.start(); } catch {}
    });
  }, [RecognitionClass, createRecognition, language, speakWithAI, stopListening]);

  const startListening = useCallback(() => {
    if (!voiceLanguage) {
      askForLanguage();
      return;
    }
    commandModeRef.current = "command";
    beginCommandListening(voiceLanguage);
  }, [askForLanguage, beginCommandListening, voiceLanguage]);

  const announce = useCallback(async (en: string, ar: string, lang: Language) => {
    restartRef.current = false;
    try { recognitionRef.current?.stop(); } catch {}
    setListening(false);
    await speakWithAI(lang === "ar" ? ar : en, lang);
    if (voiceLanguage === lang) {
      restartRef.current = true;
      try { recognitionRef.current?.start(); } catch {}
    }
  }, [speakWithAI, voiceLanguage]);

  const handleVoiceCommand = useCallback((raw: string) => {
    const text = normalize(raw);

    if (commandModeRef.current === "language" || choosingLanguage) {
      if (/(arabic|عربي|العربية|العربي)/i.test(text)) {
        chooseLanguage("ar");
      } else if (/(english|إنجليزي|انجليزي|الإنجليزية|الانجليزية)/i.test(text)) {
        chooseLanguage("en");
      }
      return;
    }

    const lang = voiceLanguage || language;
    const say = (en: string, ar: string) => announce(en, ar, lang);

    if (/(stop|توقف|اسكت|إيقاف)/i.test(text)) {
      stopSpeaking();
      stopListening();
      return;
    }

    if (/(back|go back|رجوع|عودة|ارجع)/i.test(text)) {
      navigate(-1);
      void say("Going back.", "رجوع.");
      return;
    }

    if (/(home|main|الرئيسية|الصفحة الرئيسية)/i.test(text)) {
      navigate("/app");
      void say("Opening home.", "تم فتح الصفحة الرئيسية.");
      return;
    }

    if (/(explore|museum|gallery|استكشف|المتحف|المعرض)/i.test(text)) {
      navigate("/app/explore");
      void say("Opening the museum.", "نفتح المتحف.");
      return;
    }

    if (/(share.*story|my story|record.*story|شارك.*قص|قصتي|شارك قصتي|سجل قصتي)/i.test(text)) {
      navigate("/app/share");
      void say("Opening Share Your Story.", "تم فتح صفحة مشاركة قصتك.");
      return;
    }

    if (/(help|مساعدة)/i.test(text)) {
      void say(
        "You can say home, explore the museum, find a person, share your story, back, or stop.",
        "يمكنك قول الرئيسية، استكشف المتحف، ابحث عن شخص، شارك قصتك، رجوع، أو توقف."
      );
      return;
    }

    const findMatch = text.match(/(?:who can teach me|find someone|find a person|teach me)\s*(.*)/i);
    const arabicFind = text.match(/(?:من يمكنه تعليمي|من يعلمني|ابحث عن شخص|ابحث لي عن شخص)\s*(.*)/i);
    if (findMatch || arabicFind || /(teach|person|يعلم|تعليم|شخص)/i.test(text)) {
      const query = (findMatch?.[1] || arabicFind?.[1] || "").trim();
      navigate(query ? `/app/find?q=${encodeURIComponent(query)}` : "/app/find");
      void say("Opening people who can teach you.", "تم فتح الأشخاص الذين يمكنهم تعليمك.");
      return;
    }

    const exhibitMatch = text.match(/(?:open|show|view|افتح|اعرض|شاهد)\s+(.+)/i);
    if (exhibitMatch) {
      navigate(`/app/explore?exhibit=${encodeURIComponent(exhibitMatch[1])}`);
      void say("Opening that exhibit.", "تم فتح المعرض المطلوب.");
      return;
    }

    void say(
      "I did not understand. Say help for the available commands.",
      "لم أفهم الطلب. قل مساعدة لمعرفة الأوامر المتاحة."
    );
  }, [announce, chooseLanguage, choosingLanguage, language, navigate, speakWithAI, stopListening, stopSpeaking, voiceLanguage]);

  handleVoiceCommandRef.current = handleVoiceCommand;

  useEffect(() => {
    if (!recognitionRef.current || !voiceLanguage) return;
    recognitionRef.current.lang = voiceLanguage === "ar" ? "ar-SA" : "en-US";
  }, [voiceLanguage]);

  useEffect(() => {
    return () => stopListening();
  }, [stopListening]);

  return (
    <VoiceContext.Provider value={{ listening, voiceLanguage, startListening, stopListening, chooseLanguage }}>
      {children}
    </VoiceContext.Provider>
  );
}

export function useVoice() {
  const context = useContext(VoiceContext);
  if (!context) throw new Error("useVoice must be used inside VoiceProvider");
  return context;
}
