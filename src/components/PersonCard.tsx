import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import type { SearchResult } from "../types";

export function PersonCard({ person }: { person: SearchResult }) {
  return (
    <Link className="person-card" to={`/app/person/${person.id}`}>
      <img src={person.image} alt="" />
      <div><span className="eyebrow">{person.region}</span><h3>{person.name}</h3><p>{person.skill}</p><small>{person.years} years of experience</small></div>
      <ArrowRight className="arrow" size={18} />
    </Link>
  );
}
