export function EmptyState() {
  return (
    <div className="feedback-card feedback-card--empty">
      <span className="eyebrow">Ready to explore</span>
      <h3>Search two entities to reveal their relationship path.</h3>
      <p>
        WikiPath turns raw backend data into a readable chain of connected
        Wikipedia articles, complete with search metrics and path depth.
      </p>

      <div className="empty-state__chips" aria-hidden="true">
        <span>Start article</span>
        <span>Wikipedia hop</span>
        <span>Destination</span>
      </div>
    </div>
  );
}

