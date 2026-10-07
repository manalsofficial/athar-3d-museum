import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Volume2, Send } from "lucide-react";
import { Logo } from "../components/Logo";
import { BottomNav } from "../components/BottomNav";
import { contributors, stories } from "../data/demo";
import { useApp } from "../context/AppContext";
import { askStory } from "../lib/api";
import { LanguageButton } from "../components/LanguageButton";
import { VoiceButton } from "../components/VoiceButton";

export default function Person() {
  const { id } = useParams();
  const person = contributors.find(c => c.id === id);
  const story = stories.find(s => s.contributorId === id);
  const { speak, language, t } = useApp();
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  if (!person || !story) {
    return <div className="app-page"><header className="app-header"><Logo /><div className="header-actions"><LanguageButton /><VoiceButton /></div></header><main className="empty-state">{t("personNotFound")}</main><BottomNav /></div>;
  }

  const selectedPerson = person;
  const selectedStory = story;

  async function ask() {
    if (!question.trim()) return;
    setLoading(true);
    try {
      const response = await askStory(selectedStory, question, selectedPerson, language);
      setAnswer(response.answer);
    } catch {
      setAnswer(t("noStoryAnswer"));
    } finally { setLoading(false); }
  }

  return (
    <div className="app-page">
      <header className="app-header"><Logo /><div className="header-actions"><LanguageButton /><VoiceButton /></div></header>
      <main className="app-content person-page">
        <Link to="/app/find" className="back-link"><ArrowLeft size={14} /> <span>{t("findPerson")}</span></Link>
        <div className="person-hero"><img src={person.image} alt="" /><div><span className="eyebrow">{person.region} · {person.years} YEARS</span><h1>{person.name}</h1><p>{person.skill}</p></div></div>
        <section className="story-feature"><span className="eyebrow">{t("theirStory")}</span><h2>{story.title}</h2><p>{story.summary}</p><button className="primary-cta small" onClick={() => speak(story.transcript)}><Volume2 size={16} /><span>{t("listenStory")}</span></button></section>
        <section className="ask-story"><span className="eyebrow">{t("askStory")}</span><h2>{t("whatKnow")}</h2><div className="search-box"><input value={question} onChange={e => setQuestion(e.target.value)} onKeyDown={e => e.key === "Enter" && void ask()} placeholder={t("askQuestionPlaceholder")} /><button onClick={() => void ask()} disabled={loading}><Send size={15} />{loading ? "…" : t("ask")}</button></div>{answer && <div className="answer-card"><b>ATHAR</b><p>{answer}</p><button onClick={() => speak(answer, language)}><Volume2 size={15} /><span>{t("hearAnswer")}</span></button></div>}</section>
        <button className="learn-button" onClick={() => speak(language === "ar" ? `يمكنك تعلم ${person.skill} من ${person.name}.` : `You can learn ${person.skill} from ${person.name}.`)}>{t("learnSkill")} <span>{person.name}</span></button>
      </main>
      <BottomNav />
    </div>
  );
}
