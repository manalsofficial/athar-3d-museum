import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, Compass, Play, X, Volume2 } from "lucide-react";
import { Logo } from "../components/Logo";
import { BottomNav } from "../components/BottomNav";
import { MuseumRoom } from "../components/MuseumRoom";
import { MuseumAmbience } from "../components/MuseumAmbience";
import { LanguageButton } from "../components/LanguageButton";
import { VoiceButton } from "../components/VoiceButton";
import { contributors, exhibits, stories } from "../data/demo";
import type { Exhibit } from "../types";
import { useApp } from "../context/AppContext";

export default function Explore() {
  const { t, speak } = useApp();
  const [params, setParams] = useSearchParams();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedExhibit, setSelectedExhibit] = useState<Exhibit | null>(null);
  const [exploring, setExploring] = useState(false);

  const categoryStories = useMemo(() => selectedExhibit
    ? stories.filter(story => story.category === selectedExhibit.category)
    : [], [selectedExhibit]);

  useEffect(() => {
    const requested = params.get("exhibit");
    if (!requested) return;
    const needle = requested.toLowerCase();
    const index = exhibits.findIndex(exhibit =>
      [exhibit.id, exhibit.title, exhibit.category].some(value => value.toLowerCase().includes(needle))
    );
    if (index >= 0) {
      setSelectedIndex(index);
      setSelectedExhibit(exhibits[index] as Exhibit);
      setExploring(true);
      params.delete("exhibit");
      setParams(params, { replace: true });
    }
  }, [params, setParams]);

  useEffect(() => {
    const open = (event: Event) => {
      const detail = (event as CustomEvent).detail as { exhibit?: string; action?: string } | undefined;
      if (detail?.action === "close") {
        setSelectedExhibit(null);
        return;
      }
      if (!detail?.exhibit) return;
      const needle = detail.exhibit.toLowerCase();
      const index = exhibits.findIndex(exhibit =>
        [exhibit.id, exhibit.title, exhibit.category].some(value => value.toLowerCase().includes(needle))
      );
      if (index >= 0) {
        setSelectedIndex(index);
        setSelectedExhibit(exhibits[index] as Exhibit);
        setExploring(true);
      }
    };
    window.addEventListener("athar:open-exhibit", open);
    return () => window.removeEventListener("athar:open-exhibit", open);
  }, []);

  function playRecording(storyId: string) {
    const story = stories.find(item => item.id === storyId);
    if (!story) return;
    if (story.audioUrl) {
      const audio = new Audio(story.audioUrl);
      audio.play().catch(() => speak(story.transcript));
    } else {
      speak(story.transcript);
    }
  }

  return (
    <div className="app-page museum-page">
      <MuseumAmbience />
      <header className="app-header">
        <Logo />
        <div className="header-actions"><LanguageButton /><VoiceButton /></div>
      </header>

      <div className="museum-heading">
        <span className="eyebrow">{t("gallery")}</span>
        <h1>{t("exploreMuseum")}<br />{t("clickExhibit")}</h1>
      </div>

      <MuseumRoom
        selectedIndex={selectedIndex}
        exploring={exploring}
        onSelectedIndexChange={setSelectedIndex}
        onSelect={(exhibit) => setSelectedExhibit(exhibit)}
      />

      {!exploring ? (
        <div className="museum-intro-card">
          <span className="eyebrow">{t("gallery")}</span>
          <h2>{t("exploreMuseum")}</h2>
          <p>{t("museumIntro")}</p>
          <button type="button" onClick={() => setExploring(true)}>
            <Compass size={15} />
            <span>{t("exploreMuseum")}</span>
          </button>
        </div>
      ) : (
        <div className="museum-selection-card">
          <span className="eyebrow">{(exhibits[selectedIndex] as Exhibit)?.category}</span>
          <h2>{(exhibits[selectedIndex] as Exhibit)?.title}</h2>
          <p>{(exhibits[selectedIndex] as Exhibit)?.description}</p>
          <button type="button" onClick={() => setSelectedExhibit(exhibits[selectedIndex] as Exhibit)}>
            <Volume2 size={15} />
            <span>{t("voicesFromExhibit")}</span>
          </button>
        </div>
      )}

      {selectedExhibit && (
        <div className="story-modal" onClick={() => setSelectedExhibit(null)}>
          <div className="recordings-panel" onClick={event => event.stopPropagation()}>
            <button className="recordings-close" type="button" onClick={() => setSelectedExhibit(null)} aria-label="Close">
              <X size={19} />
            </button>

            <div className="recordings-header">
              <span className="eyebrow">{selectedExhibit.category}</span>
              <h2>{t("voicesFromExhibit")}</h2>
              <p>{t("listenToPeople")}</p>
            </div>

            <div className="recordings-list">
              {categoryStories.length === 0 ? (
                <p className="empty-recordings">{t("noRecordings")}</p>
              ) : categoryStories.map(story => {
                const person = contributors.find(contributor => contributor.id === story.contributorId);
                if (!person) return null;
                return (
                  <div className="recording-row" key={story.id}>
                    <img src={person.image} alt="" className="recording-person-image" />
                    <div className="recording-info">
                      <strong>{story.title}</strong>
                      <span>{person.name} · {person.region}</span>
                      <small>{story.duration || "Story"}</small>
                    </div>
                    <button className="play-recording" type="button" onClick={() => playRecording(story.id)} aria-label={`Play ${story.title}`}>
                      <Play size={17} fill="currentColor" />
                    </button>
                  </div>
                );
              })}
            </div>

            <Link className="learn-button" to="/app/find">
              <span>{t("findTeacherAction")}</span><ArrowRight size={15} />
            </Link>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
