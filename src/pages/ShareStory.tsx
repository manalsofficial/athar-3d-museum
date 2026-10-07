import { useRef, useState } from "react";
import { Mic, MicOff, Sparkles } from "lucide-react";
import { Logo } from "../components/Logo";
import { BottomNav } from "../components/BottomNav";
import { processStory } from "../lib/api";
import { useApp } from "../context/AppContext";
import { LanguageButton } from "../components/LanguageButton";
import { VoiceButton } from "../components/VoiceButton";

export default function ShareStory() {
  const { speak, language, t } = useApp();
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [processing, setProcessing] = useState(false);
  const recognitionRef = useRef<any>(null);

  function toggleRecording() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setTranscript(t("typeStory"));
      return;
    }
    if (recording) {
      recognitionRef.current?.stop();
      setRecording(false);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = language === "ar" ? "ar-SA" : "en-US";
    recognition.interimResults = true;
    recognition.continuous = true;
    recognition.onresult = (event: any) => {
      let text = "";
      for (let i = 0; i < event.results.length; i++) text += `${event.results[i][0].transcript} `;
      setTranscript(text.trim());
    };
    recognition.onend = () => setRecording(false);
    recognitionRef.current = recognition;
    recognition.start();
    setRecording(true);
  }

  async function create() {
    if (!name || !age || !transcript) return;
    setProcessing(true);
    try {
      const result = await processStory({ name, age: Number(age), transcript, language });
      speak(language === "ar" ? "تم تحويل قصتك إلى معرض في أثر." : "Your story has been transformed into an ATHAR exhibit.", language);
      window.alert(`${result.title}`);
    } catch {
      window.alert(language === "ar" ? "تعذر الاتصال بخدمة الذكاء الاصطناعي." : "Could not connect to the AI service. Check the server and API key.");
    } finally { setProcessing(false); }
  }

  return (
    <div className="app-page">
      <header className="app-header"><Logo /><div className="header-actions"><LanguageButton /><VoiceButton /></div></header>
      <main className="app-content share-page">
        <span className="eyebrow">{t("yourStory")}</span>
        <h1>{t("storyHeadline")}</h1>
        <p className="lead">{t("storyLead")}</p>
        <div className="identity-form">
          <label>{t("yourName")}<input value={name} onChange={e => setName(e.target.value)} placeholder={t("creditName")} /></label>
          <label>{t("yourAge")}<input type="number" value={age} onChange={e => setAge(e.target.value)} /></label>
        </div>
        <div className={`record-box ${recording ? "recording" : ""}`}>
          <button className="record-circle" onClick={toggleRecording} aria-label={recording ? t("stop") : t("recordStory")}>
            {recording ? <MicOff size={25} /> : <Mic size={25} />}
          </button>
          <b>{recording ? t("listening") : t("recordStory")}</b>
          <small>{recording ? t("speakNaturally") : t("voiceBecomesExhibit")}</small>
        </div>
        <textarea value={transcript} onChange={e => setTranscript(e.target.value)} placeholder={t("typeStory")} rows={7} />
        <button className="primary-cta full" disabled={processing || !name || !age || !transcript} onClick={() => void create()}>
          <Sparkles size={16} /> <span>{processing ? t("creatingExhibit") : t("createExhibit")}</span>
        </button>
        <p className="privacy-note">{t("privacy")}</p>
      </main>
      <BottomNav />
    </div>
  );
}
