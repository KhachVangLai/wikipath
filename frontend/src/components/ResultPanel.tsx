import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { ApiClientError, PathSearchResponse } from "../types/api";
import { getHopLabel } from "../utils/formatters";
import { EmptyState } from "./EmptyState";
import { ErrorMessage } from "./ErrorMessage";
import { LoadingState } from "./LoadingState";
import { MetricsPanel } from "./MetricsPanel";
import { PathVisualizer } from "./PathVisualizer";

interface ResultPanelProps {
  backdropResult: PathSearchResponse | null;
  error: ApiClientError | null;
  hasSearched: boolean;
  isLoading: boolean;
  result: PathSearchResponse | null;
}

function SuccessState({
  result,
  muted = false
}: {
  result: PathSearchResponse;
  muted?: boolean;
}) {
  return (
    <div className={muted ? "result-state result-state--muted" : "result-state"}>
      <div className="result-state__header">
        <div>
          <span className="eyebrow">Result</span>
          <h2>Relationship path discovered</h2>
        </div>
        <p>
          {result.path.length} articles connected, {getHopLabel(result.depth)}.
        </p>
      </div>

      <PathVisualizer
        from={result.from}
        to={result.to}
        path={result.path}
        depth={result.depth}
        muted={muted}
      />

      <MetricsPanel metrics={result.metrics} />
    </div>
  );
}

function NotFoundState({ result }: { result: PathSearchResponse }) {
  return (
    <div className="result-state">
      <div className="feedback-card feedback-card--not-found">
        <span className="eyebrow">No path found</span>
        <h3>
          No relationship path was found between {result.from} and {result.to}.
        </h3>
        <p>
          Try a more popular entity or increase the max depth to give the search
          more room.
        </p>
      </div>

      <MetricsPanel metrics={result.metrics} />
    </div>
  );
}

function MotionFrame({
  children,
  frameKey
}: {
  children: ReactNode;
  frameKey: string;
}) {
  return (
    <motion.div
      key={frameKey}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.26, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

export function ResultPanel({
  backdropResult,
  error,
  hasSearched,
  isLoading,
  result
}: ResultPanelProps) {
  const showBackdrop = Boolean(isLoading && backdropResult);

  return (
    <section className="result-panel panel">
      <div className="panel__header panel__header--result">
        <span className="eyebrow">Visualizer</span>
        <h2>Make the backend result feel tangible.</h2>
        <p>
          The path view turns a raw array of entities into a readable connection
          story, with metrics that support the underlying BFS search.
        </p>
      </div>

      <div className="result-panel__content">
        {showBackdrop ? <SuccessState result={backdropResult!} muted /> : null}

        <AnimatePresence mode="wait">
          {!hasSearched && !isLoading ? (
            <MotionFrame frameKey="empty">
              <EmptyState />
            </MotionFrame>
          ) : isLoading && !showBackdrop ? (
            <MotionFrame frameKey="loading">
              <LoadingState />
            </MotionFrame>
          ) : error ? (
            <MotionFrame frameKey="error">
              <ErrorMessage error={error} />
            </MotionFrame>
          ) : result?.found ? (
            <MotionFrame frameKey={`${result.from}-${result.to}-${result.depth}`}>
              <SuccessState result={result} />
            </MotionFrame>
          ) : result ? (
            <MotionFrame frameKey={`${result.from}-${result.to}-not-found`}>
              <NotFoundState result={result} />
            </MotionFrame>
          ) : (
            <MotionFrame frameKey="loading-fallback">
              <LoadingState />
            </MotionFrame>
          )}
        </AnimatePresence>

        {showBackdrop ? <LoadingState overlay /> : null}
      </div>
    </section>
  );
}

