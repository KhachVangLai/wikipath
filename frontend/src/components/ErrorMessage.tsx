import type { ApiClientError } from "../types/api";
import { getFriendlyErrorMessage } from "../utils/errorMessages";

interface ErrorMessageProps {
  error: ApiClientError;
}

export function ErrorMessage({ error }: ErrorMessageProps) {
  return (
    <div className="feedback-card feedback-card--error" role="alert">
      <span className="eyebrow">Search error</span>
      <h3>We could not complete that path search.</h3>
      <p>{getFriendlyErrorMessage(error)}</p>
      <div className="feedback-card__meta">
        <span>Error code</span>
        <strong>{error.code}</strong>
      </div>
    </div>
  );
}

