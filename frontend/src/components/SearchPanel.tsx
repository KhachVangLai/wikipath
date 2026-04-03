import { SearchInput } from "./SearchInput";
import type { SuggestionState } from "../features/path-search/useSuggestions";

export interface SearchFormValues {
  from: string;
  to: string;
  maxDepth: number;
}

interface SearchPanelProps {
  values: SearchFormValues;
  canSubmit: boolean;
  isSubmitting: boolean;
  fromSuggestions: SuggestionState;
  toSuggestions: SuggestionState;
  onSubmit: () => void;
  onSwap: () => void;
  onFieldChange: (field: "from" | "to", value: string) => void;
  onMaxDepthChange: (value: number) => void;
}

const MAX_DEPTH_OPTIONS = [1, 2, 3, 4, 5, 6];

export function SearchPanel({
  values,
  canSubmit,
  isSubmitting,
  fromSuggestions,
  toSuggestions,
  onSubmit,
  onSwap,
  onFieldChange,
  onMaxDepthChange
}: SearchPanelProps) {
  return (
    <section className="search-panel panel">
      <div className="panel__header">
        <span className="eyebrow">Search</span>
        <h2>Trace a relationship path</h2>
        <p>
          Choose two Wikipedia entities and let WikiPath reveal the shortest
          article-to-article bridge between them.
        </p>
      </div>

      <form
        className="search-panel__form"
        onSubmit={(event) => {
          event.preventDefault();

          if (!canSubmit) {
            return;
          }

          onSubmit();
        }}
      >
        <SearchInput
          id="from"
          label="From"
          helperText="Starting entity"
          placeholder="Elon Musk"
          value={values.from}
          suggestionState={fromSuggestions}
          onChange={(value) => onFieldChange("from", value)}
        />

        <SearchInput
          id="to"
          label="To"
          helperText="Destination entity"
          placeholder="OpenAI"
          value={values.to}
          suggestionState={toSuggestions}
          onChange={(value) => onFieldChange("to", value)}
        />

        <div className="search-panel__controls">
          <label className="select-field">
            <span>Max depth</span>
            <select
              value={values.maxDepth}
              onChange={(event) => onMaxDepthChange(Number(event.target.value))}
            >
              {MAX_DEPTH_OPTIONS.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            className="button button--secondary"
            onClick={onSwap}
          >
            Swap
          </button>

          <button
            type="submit"
            className="button button--primary"
            disabled={!canSubmit || isSubmitting}
          >
            {isSubmitting ? "Searching..." : "Explore path"}
          </button>
        </div>
      </form>
    </section>
  );
}
