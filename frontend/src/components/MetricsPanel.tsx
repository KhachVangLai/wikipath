import type { PathMetrics } from "../types/api";
import { formatCount, formatDuration } from "../utils/formatters";

interface MetricsPanelProps {
  metrics: PathMetrics;
}

const metricItems = [
  {
    key: "expandedNodes",
    label: "Expanded nodes",
    format: formatCount
  },
  {
    key: "durationMs",
    label: "Search duration",
    format: formatDuration
  },
  {
    key: "cacheHits",
    label: "Cache hits",
    format: formatCount
  },
  {
    key: "cacheMisses",
    label: "Cache misses",
    format: formatCount
  }
] as const;

export function MetricsPanel({ metrics }: MetricsPanelProps) {
  return (
    <div className="metrics-panel">
      {metricItems.map((item) => (
        <article key={item.key} className="metric-card">
          <span className="metric-card__label">{item.label}</span>
          <strong className="metric-card__value">
            {item.format(metrics[item.key])}
          </strong>
        </article>
      ))}
    </div>
  );
}

