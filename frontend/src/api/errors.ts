const pointName = "A point's name must have 1 to 80 characters.";
const topicName = "A topic's name must have 1 to 80 characters.";
const topicTaken = "You already have a topic with that name.";
const noPoint = "That point isn't available.";
const noTopic = "That topic isn't available.";
const promptName = "A prompt's name must have 1 to 200 characters.";
const noPrompt = "That prompt isn't available.";
const noAttempt = "That attempt isn't available.";
const notCorrectable = "This attempt can't be corrected now.";

/** The sentence to show for each HTTP category, by endpoint outside `/auth`. Each refusal is mapped to its category in `src/host/http.ts`. */
const messages: Record<string, Record<string, string>> = {
  "/point/create": { INVALID_REQUEST: pointName },
  "/point/createIn": { INVALID_REQUEST: pointName, NOT_FOUND: noTopic },
  "/point/rename": { INVALID_REQUEST: pointName, NOT_FOUND: noPoint },
  "/point/delete": { NOT_FOUND: noPoint },
  "/point/move": { NOT_FOUND: "That point or topic isn't available." },
  "/point/unplace": { INVALID_REQUEST: "That point isn't in a topic.", NOT_FOUND: noPoint },
  "/topic/create": { INVALID_REQUEST: topicName, CONFLICT: topicTaken },
  "/topic/rename": { INVALID_REQUEST: topicName, CONFLICT: topicTaken, NOT_FOUND: noTopic },
  "/topic/delete": { CONFLICT: "Move or delete this topic's points before deleting it.", NOT_FOUND: noTopic },
  "/check/open": { INVALID_REQUEST: promptName },
  "/check/rename": { INVALID_REQUEST: promptName, NOT_FOUND: noPrompt },
  "/check/delete": { NOT_FOUND: noPrompt },
  "/check/include": { NOT_FOUND: "That prompt or point isn't available." },
  "/check/exclude": { NOT_FOUND: "That prompt or point isn't available." },
  "/check/attempt": { CONFLICT: "Finish or abandon the current attempt first.", NOT_FOUND: noPrompt },
  "/check/show": { NOT_FOUND: noPrompt },
  "/attempt/submit": { CONFLICT: "This attempt has already been submitted.", NOT_FOUND: noAttempt },
  "/attempt/mention": { CONFLICT: notCorrectable, INVALID_REQUEST: "That point isn't part of this attempt.", NOT_FOUND: noAttempt },
  "/attempt/omit": { CONFLICT: notCorrectable, INVALID_REQUEST: "That point isn't part of this attempt.", NOT_FOUND: noAttempt },
  "/attempt/close": { CONFLICT: "This attempt can't be closed now.", NOT_FOUND: noAttempt },
  "/attempt/abandon": { CONFLICT: "This attempt is already finished.", NOT_FOUND: noAttempt },
  "/attempt/show": { NOT_FOUND: noAttempt },
  "/check/share": {
    INVALID_REQUEST: "There's no user with that username.",
    CONFLICT: "You can't share a prompt with yourself.",
    NOT_FOUND: noPrompt,
  },
  "/check/unshare": { NOT_FOUND: noPrompt },
  "/shared/show": { NOT_FOUND: "That prompt isn't shared with you anymore." },
};

/** The sentence to show when the endpoint at `path` returns `error`. */
export function messageFor(path: string, error: string): string {
  const fallback = error === "NOT_FOUND" ? "That point or topic isn't available." : "Something went wrong. Try again.";
  return messages[path]?.[error] ?? fallback;
}
