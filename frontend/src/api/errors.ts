const pointName = "A point's name must have 1 to 80 characters.";
const topicName = "A topic's name must have 1 to 80 characters.";
const topicTaken = "You already have a topic with that name.";
const noPoint = "That point isn't available.";
const noTopic = "That topic isn't available.";

/** The sentence to show for each HTTP category, by endpoint outside `/auth`. Each refusal is mapped to its category in `src/host/http.ts`. */
const messages: Record<string, Record<string, string>> = {
  "/point/create": { INVALID_REQUEST: pointName },
  "/point/createIn": { INVALID_REQUEST: pointName, NOT_FOUND: noTopic },
  "/point/rename": { INVALID_REQUEST: pointName, NOT_FOUND: noPoint },
  "/point/delete": { NOT_FOUND: noPoint },
  "/point/move": { NOT_FOUND: "That point or topic isn't available." },
  "/topic/create": { INVALID_REQUEST: topicName, CONFLICT: topicTaken },
  "/topic/rename": { INVALID_REQUEST: topicName, CONFLICT: topicTaken, NOT_FOUND: noTopic },
  "/topic/delete": { CONFLICT: "Move or delete this topic's points before deleting it.", NOT_FOUND: noTopic },
};

/** The sentence to show when the endpoint at `path` returns `error`. */
export function messageFor(path: string, error: string): string {
  const fallback = error === "NOT_FOUND" ? "That point or topic isn't available." : "Something went wrong. Try again.";
  return messages[path]?.[error] ?? fallback;
}
