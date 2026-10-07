import { useEffect, useState } from "react";
import { Mic, Search } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { Logo } from "../components/Logo";
import { BottomNav } from "../components/BottomNav";
import { PersonCard } from "../components/PersonCard";
import { contributors } from "../data/demo";
import { searchPeople } from "../lib/api";
import { useApp } from "../context/AppContext";
import type { SearchResult } from "../types";
import { LanguageButton } from "../components/LanguageButton";
import { VoiceButton } from "../components/VoiceButton";

export default function FindPerson() {
  const { language, t } = useApp();
  const [params] = useSearchParams();
  const [query, setQuery] = useState(params.get("q") || "");
  const [results, setResults] = useState<SearchResult[]>(contributors);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(Boolean(params.get("q")));

  async function runSearch(value = query) {
    if (!value.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      setResults(await searchPeople(value, language));
    } catch {
      const needle = value.toLowerCase();
      setResults(contributors.filter(c => `${c.skill} ${c.region} ${c.name} ${c.bio}`.toLowerCase().includes(needle)));
    } finally { setLoading(false); }
  }

  useEffect(() => {
    const q = params.get("q");
    if (q) void runSearch(q);
    // Initial voice navigation only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="app-page">
      <header className="app-header">
        <Logo />
        <div className="header-actions"><LanguageButton /><VoiceButton /></div>
      </header>
      <main className="app-content find-page">
        <span className="eyebrow">{t("findPerson")}</span>
        <h1>{language === "ar" ? <>لا تبحث عن المعلومات فقط.<br /><em>ابحث عن الشخص الذي عاشها.</em></> : <>Don't just search for information.<br /><em>Search for the person who lived it.</em></>}</h1>
        <div className="search-box">
          <Search size={17} />
          <input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && void runSearch()} placeholder={t("searchStory")} />
          <button type="button" onClick={() => void runSearch()}>{loading ? "…" : t("search")}</button>
        </div>
        <div className="voice-search-hint"><Mic size={14} /><span>{t("askByVoice")}</span></div>
        {!searched && <div className="suggestions"><span>{t("tryAsking")}</span><button onClick={() => { setQuery("traditional embroidery"); void runSearch("traditional embroidery"); }}>traditional embroidery</button><button onClick={() => { setQuery("Sadu weaving"); void runSearch("Sadu weaving"); }}>Sadu weaving</button><button onClick={() => { setQuery("old Jeddah food"); void runSearch("old Jeddah food"); }}>old Jeddah food</button></div>}
        <section className="results"><div className="section-title"><div><span className="eyebrow">{searched ? t("matches") : t("peopleBehind")}</span><h2>{results.length} {t("peopleFound")}</h2></div></div>{results.map(p => <PersonCard key={p.id} person={p} />)}</section>
      </main>
      <BottomNav />
    </div>
  );
}
