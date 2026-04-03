import { useState } from "react";
import { ApiStatusBadge } from "../components/ApiStatusBadge";
import { ResultPanel } from "../components/ResultPanel";
import {
  SearchPanel,
  type SearchFormValues
} from "../components/SearchPanel";
import { useHealthStatus } from "../features/path-search/useHealthStatus";
import { usePathSearch } from "../features/path-search/usePathSearch";
import { useSuggestions } from "../features/path-search/useSuggestions";

const heroHighlights = [
  {
    title: "Shortest path search",
    description: "Surface the cleanest Wikipedia connection between two entities."
  },
  {
    title: "Live suggestions",
    description: "Reduce friction with debounced title lookups as you type."
  },
  {
    title: "Search metrics",
    description: "Expose expanded nodes, duration, and cache behavior for demos."
  }
];

const initialFormValues: SearchFormValues = {
  from: "",
  to: "",
  maxDepth: 4
};

export function HomePage() {
  const [values, setValues] = useState<SearchFormValues>(initialFormValues);
  const { status, markUnavailable } = useHealthStatus();
  const { result, error, hasSearched, isLoading, backdropResult, runSearch } =
    usePathSearch({
      onConnectionError: markUnavailable
    });

  const fromSuggestions = useSuggestions({
    query: values.from,
    onSuggestionSelected: (value) =>
      setValues((currentValue) => ({
        ...currentValue,
        from: value
      })),
    onConnectionError: markUnavailable
  });

  const toSuggestions = useSuggestions({
    query: values.to,
    onSuggestionSelected: (value) =>
      setValues((currentValue) => ({
        ...currentValue,
        to: value
      })),
    onConnectionError: markUnavailable
  });

  const canSubmit =
    values.from.trim().length > 0 && values.to.trim().length > 0;

  async function handleSubmit() {
    fromSuggestions.closeSuggestions();
    toSuggestions.closeSuggestions();

    await runSearch({
      from: values.from.trim(),
      to: values.to.trim(),
      maxDepth: values.maxDepth
    });
  }

  function handleSwap() {
    fromSuggestions.closeSuggestions();
    toSuggestions.closeSuggestions();

    setValues((currentValue) => ({
      ...currentValue,
      from: currentValue.to,
      to: currentValue.from
    }));
  }

  return (
    <main className="page-shell">
      <div className="page-shell__backdrop" aria-hidden="true" />

      <section className="hero">
        <div className="hero__content">
          <span className="hero__eyebrow">Wikipedia relationship explorer</span>
          <h1>WikiPath</h1>
          <p className="hero__subtitle">
            Find the shortest relationship path between two Wikipedia entities
            and present the result like a polished product demo, not raw JSON.
          </p>

          <div className="hero__status-row">
            <ApiStatusBadge status={status} />
            <p className="hero__support-copy">
              Reads the API base URL from <code>VITE_API_BASE_URL</code> and
              uses the existing backend contracts exactly as-is.
            </p>
          </div>
        </div>

        <div className="hero__highlights">
          {heroHighlights.map((item) => (
            <article key={item.title} className="highlight-card">
              <span className="eyebrow">Feature</span>
              <h2>{item.title}</h2>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="workspace-grid">
        <SearchPanel
          values={values}
          canSubmit={canSubmit}
          isSubmitting={isLoading}
          fromSuggestions={fromSuggestions}
          toSuggestions={toSuggestions}
          onSubmit={handleSubmit}
          onSwap={handleSwap}
          onFieldChange={(field, value) =>
            setValues((currentValue) => ({
              ...currentValue,
              [field]: value
            }))
          }
          onMaxDepthChange={(maxDepth) =>
            setValues((currentValue) => ({
              ...currentValue,
              maxDepth
            }))
          }
        />

        <ResultPanel
          backdropResult={backdropResult}
          error={error}
          hasSearched={hasSearched}
          isLoading={isLoading}
          result={result}
        />
      </section>
    </main>
  );
}
