import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Compass, UserRoundSearch, Mic, ArrowRight } from "lucide-react";
import { Logo } from "../components/Logo";
import { BottomNav } from "../components/BottomNav";
import { StoryCard } from "../components/StoryCard";
import { contributors, stories } from "../data/demo";
import { LanguageButton } from "../components/LanguageButton";
import { VoiceButton } from "../components/VoiceButton";
import { useApp } from "../context/AppContext";

export default function AppHome() {
  const { t } = useApp();
  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return t("goodMorning");
    if (h < 18) return t("goodAfternoon");
    return t("goodEvening");
  }, [t]);

  const story = stories[0];
  const person = contributors.find(c => c.id === story.contributorId)!;

  return (
    <div className="app-page">
      <header className="app-header">
        <Logo />
        <div className="header-actions"><LanguageButton /><VoiceButton /></div>
      </header>

      <main className="app-content">
        <p className="eyebrow">{greeting}</p>
        <h1>{t("whatRemember")}</h1>

        <section className="quick-actions">
          <Link to="/app/explore" className="action-card">
            <Compass size={24} /><b>{t("exploreMuseum")}</b><small>{t("walkHeritage")}</small>
          </Link>
          <Link to="/app/find" className="action-card">
            <UserRoundSearch size={24} /><b>{t("whoCanTeach")}</b><small>{t("findPersonDescription")}</small>
          </Link>
          <Link to="/app/share" className="action-card">
            <Mic size={24} /><b>{t("shareYourStory")}</b><small>{t("preserveMemory")}</small>
          </Link>
        </section>

        <section className="section-block">
          <div className="section-title">
            <div><span className="eyebrow">{t("listenToday")}</span><h2>{t("archiveVoice")}</h2></div>
            <Link to="/app/explore">{t("viewAll")} <ArrowRight size={14} /></Link>
          </div>
          <StoryCard story={story} contributor={person} />
        </section>
      </main>
      <BottomNav />
    </div>
  );
}
