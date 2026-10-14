/** The sentence to show for each HTTP category, by endpoint outside `/auth`. Each refusal is mapped to its category in `src/host/http.ts`. */
const messages: Record<string, Record<string, string>> = {
};

/** The sentence to show when the endpoint at `path` returns `error`. */
export function messageFor(path: string, error: string): string {
  const fallback = error === "NOT_FOUND" ? "That file isn't available." : "Something went wrong. Try again.";
  return messages[path]?.[error] ?? fallback;
}
