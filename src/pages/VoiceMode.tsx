import { Mic, MicOff, Languages, Volume2, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Logo } from "../components/Logo";
import { LanguageButton } from "../components/LanguageButton";
import { VoiceButton } from "../components/VoiceButton";
import { useApp } from "../context/AppContext";
import { useVoice } from "../context/VoiceContext";

export default function VoiceMode() {
  const navigate = useNavigate();
  const { language, setLanguage, speakWithAI, t } = useApp();
  const { listening, voiceLanguage, startListening, stopListening } = useVoice();

  const say = () => void speakWithAI(
    language === "ar" ? "مرحباً بك في أثر. كل صوت يترك أثراً." : "Welcome to ATHAR. Every voice leaves an أثر.",
    language
  );

  return (
    <div className="app-page voice-page">
      <header className="app-header"><Logo /><div className="header-actions"><LanguageButton /><VoiceButton /></div></header>
      <main className="voice-main">
        <span className="eyebrow">ATHAR · {t("voiceMode")}</span>
        <h1>{t("voiceGuide")}</h1>
        <p>{t("voiceDescription")}</p>

        <button className={`voice-orb ${listening ? "active" : ""}`} onClick={listening ? stopListening : startListening} aria-label={t("voiceMode")}>
          {listening ? <MicOff size={38} /> : <Mic size={38} />}
        </button>
        <strong>{listening ? t("listeningNow") : t("tapSpeak")}</strong>

        <div className="voice-language-card">
          <Languages size={18} />
          <span>{voiceLanguage === "ar" ? "العربية" : voiceLanguage === "en" ? "English" : language === "ar" ? "اختر لغة الصوت" : "Choose a voice language"}</span>
          <div>
            <button onClick={() => setLanguage("en")}>English</button>
            <button onClick={() => setLanguage("ar")}>العربية</button>
          </div>
        </div>

        <div className="voice-commands">
          <span>{language === "ar" ? "جرّب قول" : "Try saying"}</span>
          <button onClick={() => navigate("/app")}>{language === "ar" ? "الرئيسية" : "Home"}</button>
          <button onClick={() => navigate("/app/explore")}>{language === "ar" ? "استكشف المتحف" : "Explore the museum"}</button>
          <button onClick={() => navigate("/app/find")}>{language === "ar" ? "من يمكنه تعليمي؟" : "Who can teach me?"}</button>
          <button onClick={() => navigate("/app/share")}>{t("yourStoryButton")}</button>
          <button onClick={() => navigate(-1)}>{t("back")}</button>
        </div>

        <button className="voice-test-button" onClick={say}><Volume2 size={16} />{t("testVoice")}</button>
        <button className="back-link" onClick={() => navigate(-1)}><ArrowLeft size={14} />{t("back")}</button>
      </main>
    </div>
  );
}
