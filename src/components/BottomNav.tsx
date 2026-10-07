import { Link, useLocation } from "react-router-dom";
import { House, Compass, UserRoundSearch, Mic } from "lucide-react";
import { useApp } from "../context/AppContext";

export function BottomNav() {
  const { t } = useApp();
  const location = useLocation();

  return (
    <nav className="bottom-nav" aria-label="Primary navigation">
      <Link className={location.pathname === "/app" ? "active" : ""} to="/app">
        <House size={19} /><span>{t("home")}</span>
      </Link>
      <Link className={location.pathname.startsWith("/app/explore") ? "active" : ""} to="/app/explore">
        <Compass size={19} /><span>{t("explore")}</span>
      </Link>
      <Link className={location.pathname.startsWith("/app/find") || location.pathname.startsWith("/app/person") ? "active" : ""} to="/app/find">
        <UserRoundSearch size={19} /><span>{t("findPerson")}</span>
      </Link>
      <Link className={location.pathname.startsWith("/app/share") ? "active" : ""} to="/app/share">
        <Mic size={19} /><span>{t("shareStory")}</span>
      </Link>
    </nav>
  );
}
