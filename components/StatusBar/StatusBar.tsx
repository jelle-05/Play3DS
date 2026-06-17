import ThemeToggle from "@/components/ThemeToggle/ThemeToggle";
import "./StatusBar.css";

export default function StatusBar() {
  return (
    <header className="status-bar" role="banner">
      <div className="status-bar-brand">
        <span className="status-bar-logo-mark" aria-hidden="true">▶</span>
        <span className="status-bar-name">Play3DS</span>
      </div>

      <div className="status-bar-status" aria-label="Status indicators">
        <span className="status-bar-date" aria-hidden="true">08/25</span>
        <span className="status-bar-divider" aria-hidden="true">|</span>
        <span className="status-bar-time" aria-hidden="true">12:00</span>
        <span className="status-bar-online" aria-label="Online" title="Online" />
        <ThemeToggle />
      </div>
    </header>
  );
}
