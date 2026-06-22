import Link from "next/link";
import type { ActivityItem } from "@/lib/activity-types";
import "./ActivityFeed.css";

interface ActivityFeedProps {
  items: ActivityItem[];
  emptyText?: string;
}

export default function ActivityFeed({
  items,
  emptyText = "No activity yet.",
}: ActivityFeedProps) {
  return (
    <section className="activity-feed feed-section">
      <div className="feed-section-header">
        <h2 className="feed-section-title">Recent Activity</h2>
      </div>
      {items.length === 0 ? (
        <p className="activity-feed__empty">{emptyText}</p>
      ) : (
        <ul className="activity-feed__list">
          {items.map((item) => (
            <li key={item.id} className="activity-item">
              <div className={`activity-item__dot ${item.gradientClass}`} />
              <div className="activity-item__content">
                <span className="activity-item__icon" aria-hidden="true">
                  {item.icon}
                </span>
                <span className="activity-item__desc">
                  <Link href={item.actorHref} className="activity-item__actor">
                    {item.actor}
                  </Link>{" "}
                  {item.href ? (
                    <Link href={item.href} className="activity-item__link">
                      {item.text}
                    </Link>
                  ) : (
                    item.text
                  )}
                </span>
              </div>
              <span className="activity-item__time">{item.relativeTime}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
