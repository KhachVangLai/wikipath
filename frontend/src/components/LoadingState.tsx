interface LoadingStateProps {
  overlay?: boolean;
}

export function LoadingState({ overlay = false }: LoadingStateProps) {
  return overlay ? (
    <div className="loading-overlay" aria-live="polite">
      <div className="loading-overlay__card">
        <span className="eyebrow">Searching</span>
        <p>Expanding article links and checking the closest path...</p>
      </div>
    </div>
  ) : (
    <div className="feedback-card feedback-card--loading" aria-live="polite">
      <span className="eyebrow">Searching</span>
      <h3>Looking for the shortest bridge between these entities.</h3>
      <div className="loading-skeleton">
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}
