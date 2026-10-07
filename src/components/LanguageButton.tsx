import { Languages } from "lucide-react";
import { useApp } from "../context/AppContext";

export function LanguageButton() {
  const { language, setLanguage, t } = useApp();
  return (
    <button
      type="button"
      className="language-toggle"
      onClick={() => setLanguage(language === "en" ? "ar" : "en")}
      aria-label={t("changeLanguage")}
    >
      <Languages size={16} />
      <span>{language === "en" ? "العربية" : "English"}</span>
    </button>
  );
}
