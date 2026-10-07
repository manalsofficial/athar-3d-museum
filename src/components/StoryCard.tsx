import { Play } from "lucide-react";
import type { Contributor, Story } from "../types";
import { useApp } from "../context/AppContext";

export function StoryCard({ story, contributor, compact = false }: { story: Story; contributor: Contributor; compact?: boolean }) {
  const { speak, t } = useApp();
  return (
    <article className={`story-card ${compact ? "compact" : ""}`}>
      <img src={contributor.image} alt="" />
      <div className="story-card-body">
        <div className="story-meta">{contributor.region} · {story.category}</div>
        <h3>{story.title}</h3>
        {!compact && <p>{story.summary}</p>}
        <div className="story-card-actions">
          <button onClick={() => speak(story.transcript)} className="play-button">
            <Play size={14} fill="currentColor" /> <span>{t("listenStory")}</span><small>{story.duration}</small>
          </button>
          <span className="contributor-name">{contributor.name}</span>
        </div>
      </div>
    </article>
  );
}
