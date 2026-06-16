import type { ActivityItem, ActivityType } from "@/lib/homeFeed";
import "./ActivityFeed.css";

const TYPE_ICON: Record<ActivityType, string> = {
  log_time: "⏱",
  status_change: "✓",
  review: "★",
  started: "▶",
};

interface ActivityFeedProps {
  items: ActivityItem[];
}

export default function ActivityFeed({ items }: ActivityFeedProps) {
  return (
    <section className="activity-feed feed-section">
      <div className="feed-section-header">
        <h2 className="feed-section-title">Recent Activity</h2>
      </div>
      {items.length === 0 ? (
        <p className="activity-feed__empty">No activity yet.</p>
      ) : (
        <ul className="activity-feed__list">
          {items.map((item) => (
            <li key={item.id} className="activity-item">
              <div className={`activity-item__dot ${item.gradientClass}`} />
              <div className="activity-item__content">
                <span className="activity-item__icon" aria-hidden="true">
                  {TYPE_ICON[item.type]}
                </span>
                <span className="activity-item__desc">{item.description}</span>
              </div>
              <span className="activity-item__time">{item.relativeTime}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
