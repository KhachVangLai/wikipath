const numberFormatter = new Intl.NumberFormat("en-US");

export function formatCount(value: number) {
  return numberFormatter.format(value);
}

export function formatDuration(value: number) {
  return `${numberFormatter.format(value)} ms`;
}

export function getHopLabel(depth: number) {
  if (depth <= 0) {
    return "No connecting path";
  }

  return depth === 1 ? "1 hop away" : `${depth} hops away`;
}

