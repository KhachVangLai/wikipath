import { AnimatePresence, motion } from "framer-motion";

interface SuggestionDropdownProps {
  errorMessage: string | null;
  id: string;
  items: string[];
  isLoading: boolean;
  isOpen: boolean;
  highlightedIndex: number;
  queryLength: number;
  onSelect: (value: string) => void;
}

export function SuggestionDropdown({
  errorMessage,
  id,
  items,
  isLoading,
  isOpen,
  highlightedIndex,
  queryLength,
  onSelect
}: SuggestionDropdownProps) {
  const shouldRender =
    queryLength >= 2 && (isLoading || Boolean(errorMessage) || (isOpen && items.length > 0));

  return (
    <AnimatePresence initial={false}>
      {shouldRender ? (
        <motion.div
          key="suggestions"
          className="suggestions"
          initial={{ opacity: 0, y: -8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.98 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
        >
          {isLoading ? (
            <div className="suggestions__status">Searching Wikipedia titles...</div>
          ) : errorMessage ? (
            <div className="suggestions__status suggestions__status--error">
              {errorMessage}
            </div>
          ) : (
            <ul id={id} role="listbox" className="suggestions__list">
              {items.map((item, index) => (
                <li key={item} role="presentation">
                  <button
                    id={`${id}-${index}`}
                    type="button"
                    role="option"
                    aria-selected={index === highlightedIndex}
                    className={
                      index === highlightedIndex
                        ? "suggestions__item suggestions__item--active"
                        : "suggestions__item"
                    }
                    onMouseDown={(event) => {
                      event.preventDefault();
                      onSelect(item);
                    }}
                  >
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
