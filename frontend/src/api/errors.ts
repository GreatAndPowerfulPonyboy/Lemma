/** The sentence to show for each HTTP category, by endpoint outside `/auth`. Each refusal is mapped to its category in `src/host/http.ts`. */
const messages: Record<string, Record<string, string>> = {
  "/topics/create": {
    INVALID_REQUEST: "A topic name must have 1 to 80 characters.",
    CONFLICT: "You already have a topic with that name.",
  },
  "/topics/rename": {
    INVALID_REQUEST: "A topic name must have 1 to 80 characters.",
    CONFLICT: "You already have a topic with that name.",
  },
  "/topics/delete": { CONFLICT: "Move or delete this topic's points before deleting it." },
  "/cues/create": { INVALID_REQUEST: "A point must have 1 to 100 characters." },
  "/cues/rename": { INVALID_REQUEST: "A point must have 1 to 100 characters." },
};

/** The sentence to show when the endpoint at `path` returns `error`. */
export function messageFor(path: string, error: string): string {
  const fallback = error === "NOT_FOUND" ? "That isn't available any more." : "Something went wrong. Try again.";
  return messages[path]?.[error] ?? fallback;
}
