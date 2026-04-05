import type { ChangeEvent } from "react";
import type { SuggestionState } from "../features/path-search/useSuggestions";
import { SuggestionDropdown } from "./SuggestionDropdown";

interface SearchInputProps {
  id: string;
  label: string;
  helperText: string;
  placeholder: string;
  value: string;
  suggestionState: SuggestionState;
  onChange: (value: string) => void;
}

export function SearchInput({
  id,
  label,
  helperText,
  placeholder,
  value,
  suggestionState,
  onChange
}: SearchInputProps) {
  const listId = `${id}-suggestions`;
  const activeDescendant =
    suggestionState.highlightedIndex >= 0
      ? `${listId}-${suggestionState.highlightedIndex}`
      : undefined;

  return (
    <div className="search-field" ref={suggestionState.containerRef}>
      <div className="search-field__meta">
        <label htmlFor={id}>{label}</label>
        <span>{helperText}</span>
      </div>

      <div className="search-field__control">
        <input
          id={id}
          type="text"
          autoComplete="off"
          spellCheck="false"
          placeholder={placeholder}
          value={value}
          role="combobox"
          aria-expanded={suggestionState.isOpen}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={activeDescendant}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            onChange(event.target.value)
          }
          onFocus={suggestionState.handleInputFocus}
          onKeyDown={suggestionState.handleKeyDown}
        />

        <SuggestionDropdown
          errorMessage={suggestionState.errorMessage}
          id={listId}
          items={suggestionState.items}
          isLoading={suggestionState.isLoading}
          isOpen={suggestionState.isOpen}
          highlightedIndex={suggestionState.highlightedIndex}
          queryLength={value.trim().length}
          onSelect={suggestionState.selectSuggestion}
        />
      </div>
    </div>
  );
}
