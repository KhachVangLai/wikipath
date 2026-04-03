import {
  type KeyboardEvent,
  type MutableRefObject,
  useCallback,
  useEffect,
  useRef,
  useState
} from "react";
import { isAbortError, suggestTitles } from "../../api/client";
import { isConnectionError } from "../../utils/errorMessages";

interface UseSuggestionsOptions {
  query: string;
  onSuggestionSelected: (value: string) => void;
  onConnectionError?: () => void;
  debounceMs?: number;
  minLength?: number;
}

export interface SuggestionState {
  containerRef: MutableRefObject<HTMLDivElement | null>;
  highlightedIndex: number;
  isLoading: boolean;
  isOpen: boolean;
  items: string[];
  closeSuggestions: () => void;
  handleKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  handleInputFocus: () => void;
  selectSuggestion: (value: string) => void;
}

export function useSuggestions({
  query,
  onSuggestionSelected,
  onConnectionError,
  debounceMs = 300,
  minLength = 2
}: UseSuggestionsOptions): SuggestionState {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const requestIdRef = useRef(0);
  const committedSelectionRef = useRef<string | null>(null);
  const [items, setItems] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const closeSuggestions = useCallback(() => {
    setIsOpen(false);
    setHighlightedIndex(-1);
  }, []);

  const selectSuggestion = useCallback(
    (value: string) => {
      committedSelectionRef.current = value;
      onSuggestionSelected(value);
      setItems([]);
      setIsOpen(false);
      setHighlightedIndex(-1);
    },
    [onSuggestionSelected]
  );

  const handleInputFocus = useCallback(() => {
    if (items.length > 0) {
      setIsOpen(true);
      setHighlightedIndex((currentValue) =>
        currentValue >= 0 ? currentValue : 0
      );
    }
  }, [items.length]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (!items.length) {
        if (event.key === "Escape") {
          closeSuggestions();
        }
        return;
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        setIsOpen(true);
        setHighlightedIndex((currentValue) =>
          currentValue < items.length - 1 ? currentValue + 1 : 0
        );
        return;
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        setIsOpen(true);
        setHighlightedIndex((currentValue) =>
          currentValue > 0 ? currentValue - 1 : items.length - 1
        );
        return;
      }

      if (event.key === "Enter" && isOpen && highlightedIndex >= 0) {
        event.preventDefault();
        selectSuggestion(items[highlightedIndex]);
        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();
        closeSuggestions();
      }
    },
    [closeSuggestions, highlightedIndex, isOpen, items, selectSuggestion]
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        event.target instanceof Node &&
        !containerRef.current.contains(event.target)
      ) {
        closeSuggestions();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [closeSuggestions]);

  useEffect(() => {
    const normalizedQuery = query.trim();

    if (normalizedQuery.length < minLength) {
      committedSelectionRef.current = null;
      setItems([]);
      setIsOpen(false);
      setHighlightedIndex(-1);
      setIsLoading(false);
      return;
    }

    if (normalizedQuery === committedSelectionRef.current) {
      setItems([]);
      setIsOpen(false);
      setHighlightedIndex(-1);
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    const timer = window.setTimeout(async () => {
      setIsLoading(true);

      try {
        const response = await suggestTitles(normalizedQuery, controller.signal);

        if (requestIdRef.current !== requestId || controller.signal.aborted) {
          return;
        }

        setItems(response.items);
        setIsOpen(
          response.items.length > 0 &&
            Boolean(
              containerRef.current?.contains(
                document.activeElement instanceof Node
                  ? document.activeElement
                  : null
              )
            )
        );
        setHighlightedIndex(response.items.length > 0 ? 0 : -1);
      } catch (error) {
        if (isAbortError(error)) {
          return;
        }

        if (isConnectionError(error)) {
          onConnectionError?.();
        }

        setItems([]);
        setIsOpen(false);
        setHighlightedIndex(-1);
      } finally {
        if (requestIdRef.current === requestId) {
          setIsLoading(false);
        }
      }
    }, debounceMs);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [debounceMs, minLength, onConnectionError, query]);

  return {
    containerRef,
    highlightedIndex,
    isLoading,
    isOpen,
    items,
    closeSuggestions,
    handleKeyDown,
    handleInputFocus,
    selectSuggestion
  };
}
