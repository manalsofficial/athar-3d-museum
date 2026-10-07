import { Mic, MicOff } from "lucide-react";
import { useApp } from "../context/AppContext";
import { useVoice } from "../context/VoiceContext";

export function VoiceButton() {
  const { t } = useApp();
  const { listening, startListening, stopListening } = useVoice();

  return (
    <button
      type="button"
      className={`voice-button ${listening ? "voice-active" : ""}`}
      onClick={listening ? stopListening : startListening}
      aria-label={t("voiceMode")}
      aria-pressed={listening}
    >
      {listening ? <MicOff size={16} /> : <Mic size={16} />}
      <span>{t("voiceMode")}</span>
    </button>
  );
}
