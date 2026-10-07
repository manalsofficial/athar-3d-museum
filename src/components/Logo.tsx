import { Link } from "react-router-dom";

export function Logo() {
  return (
    <Link to="/app" className="athar-logo" aria-label="ATHAR home">
      <div className="athar-logo-mark">
        <img src="/logo.svg" alt="" aria-hidden="true" />
      </div>
      <div className="athar-logo-text">
        <strong>ATHAR</strong>
        <small>أثر · LIVING HERITAGE</small>
      </div>
    </Link>
  );
}
