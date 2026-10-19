/**
 * A card is a point with an answer. The owner of a point writes its answer once they've missed it, revises it,
 * or removes it, and reads it back to check a later attempt against. Deleting a point removes its answer.
 */
import { endpoint, receive, respond } from "@mit-sdg/sync-engine/boundary";
import { each, former, no, reaction, when, whether, where } from "@mit-sdg/sync-engine/language";
import { concepts } from "../concepts.ts";
import { ownsPoint } from "./access.ts";
import { textInput } from "./reusable/inputs.ts";

const { Cueing, Flashcarding, RecallChecking, Sessioning } = concepts;

export const WriteAnswer = endpoint(
  "/card/write",
  ({ session, user, cue, answer }) =>
    receive({ session, cue, answer })
      .then(Sessioning.use({ session }).responds({ subject: user }))
      .then(
        where(ownsPoint({ user, cue }))
          .then(Flashcarding.write({ item: cue, answer }).responds({}))
          .then(respond({ cue }))
          .named("creator"),
        where(no(ownsPoint({ user, cue })))
          .then(respond({ error: "NOT_FOUND" }))
          .named("refused"),
      ),
  { validators: { input: textInput } },
);

export const ReviseAnswer = endpoint(
  "/card/revise",
  ({ session, user, cue, answer }) =>
    receive({ session, cue, answer })
      .then(Sessioning.use({ session }).responds({ subject: user }))
      .then(
        where(ownsPoint({ user, cue }))
          .then(Flashcarding.revise({ item: cue, answer }).responds({}))
          .then(respond({ cue }))
          .named("creator"),
        where(no(ownsPoint({ user, cue })))
          .then(respond({ error: "NOT_FOUND" }))
          .named("refused"),
      ),
  { validators: { input: textInput } },
);

export const RemoveAnswer = endpoint(
  "/card/remove",
  ({ session, user, cue }) =>
    receive({ session, cue })
      .then(Sessioning.use({ session }).responds({ subject: user }))
      .then(
        where(ownsPoint({ user, cue }))
          .then(Flashcarding.remove({ item: cue }).responds({}))
          .then(respond({ cue }))
          .named("creator"),
        where(no(ownsPoint({ user, cue })))
          .then(respond({ error: "NOT_FOUND" }))
          .named("refused"),
      ),
  { validators: { input: textInput } },
);

/** The point's name and its answer, which a point that isn't a card doesn't have. */
export const cardOf = former("the card of (cue)", ({ cue }, { name, answer }) =>
  each(Cueing._get({ cue }).is({ name }))
    .where(whether(Flashcarding._answer({ item: cue }).is({ answer })))
    .form({ name, answer }),
);

export const ShowCard = endpoint(
  "/card/show",
  ({ session, user, cue }) =>
    receive({ session, cue })
      .then(Sessioning.use({ session }).responds({ subject: user }))
      .then(
        where(ownsPoint({ user, cue }))
          .then(respond({ card: cardOf({ cue }) }))
          .named("creator"),
        where(no(ownsPoint({ user, cue })))
          .then(respond({ error: "NOT_FOUND" }))
          .named("refused"),
      ),
  { validators: { input: textInput } },
);

/** A deleted point's answer goes with it, so a new point can never inherit one. */
const RemoveAnswerOfDeleted = reaction(({ cue }) =>
  when(Cueing.delete({ cue }).responds({}))
    .where(Flashcarding._answer({ item: cue }))
    .then(Flashcarding.remove({ item: cue })),
);

/** How many closed attempts a point must be missed in before it's suggested as a card. */
const MISSES_TO_SUGGEST = 3;

/**
 * The promotion queue: the user's points missed in enough closed attempts to earn an answer, most misses first.
 * A point that already has an answer is a card, so it leaves the queue.
 */
export const suggestedCards = former(
  "the cards suggested to (user)",
  ({ user }, { cue, pointName, misses }) =>
    each(RecallChecking._missed({ owner: user, atLeast: MISSES_TO_SUGGEST }).is({ item: cue, misses }))
      .where(ownsPoint({ user, cue }), Cueing._get({ cue }).is({ name: pointName }), no(Flashcarding._answer({ item: cue })))
      .form({ cue, pointName, misses }),
);

export const composition = {
  answering: { WriteAnswer, ReviseAnswer, RemoveAnswer },
  promoting: { suggestedCards },
  showing: { ShowCard, cardOf },
  deleting: { RemoveAnswerOfDeleted },
};
