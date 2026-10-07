import { useNavigate } from "react-router-dom";
import { Languages } from "lucide-react";
import { useApp } from "../context/AppContext";
import { VoiceButton } from "../components/VoiceButton";

export default function Landing() {
  const navigate = useNavigate();
  const { t, language, setLanguage } = useApp();

  return (
    <main className="landing">
      <div className="landing-glow" />

      <div className="landing-content">

        {/* ATHAR SVG LOGO */}
        <div className="landing-logo">
          <img
            src="/logo.svg"
            alt="ATHAR"
            className="landing-logo-svg"
          />

          <div className="landing-logo-text">
            <b>ATHAR</b>
          
          </div>
        </div>

        <p className="eyebrow">
          A LIVING DIGITAL MUSEUM
        </p>

        <h1>
          {t("livingMuseum")}
        </h1>

        <div className="athar-script">
          أثر
        </div>

        <h2>
          {t("everyVoice")}
        </h2>

        <p className="landing-line">
          {language === "ar"
            ? "لا تبحث عن المعلومات فقط."
            : "Don't just search for information."}
          <br />

          <strong>
            {language === "ar"
              ? "ابحث عن الشخص الذي عاشها."
              : "Search for the person who lived it."}
          </strong>
        </p>

        <div className="landing-actions">

          <button
            className="landing-primary"
            onClick={() => navigate("/app")}
          >
            {t("enterMuseum")}
          </button>

          <VoiceButton />

          <button
            className="landing-language"
            onClick={() =>
              setLanguage(language === "en" ? "ar" : "en")
            }
          >
            <Languages size={15} />

            <span>
              {language === "en"
                ? "العربية"
                : "English"}
            </span>
          </button>

        </div>
      </div>

      <div className="landing-footer">
        PRESERVING STORIES · CONNECTING GENERATIONS
      </div>
    </main>
  );
}