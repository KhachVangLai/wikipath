import type { HealthState } from "../features/path-search/useHealthStatus";

interface ApiStatusBadgeProps {
  status: HealthState;
}

export function ApiStatusBadge({ status }: ApiStatusBadgeProps) {
  const config =
    status === "healthy"
      ? {
          label: "API ready",
          detail: "Connected to WikiPath backend",
          className: "status-badge status-badge--healthy"
        }
      : status === "unavailable"
        ? {
            label: "API unavailable",
            detail: "Check the backend service",
            className: "status-badge status-badge--unavailable"
          }
        : {
            label: "Checking API",
            detail: "Verifying backend health",
            className: "status-badge status-badge--checking"
          };

  return (
    <div className={config.className} aria-live="polite">
      <span className="status-badge__dot" aria-hidden="true" />
      <div>
        <strong>{config.label}</strong>
        <span>{config.detail}</span>
      </div>
    </div>
  );
}

