/**
 * Creating, renaming, moving, and deleting points. A point is a Cueing cue; Lemma requires every point to be
 * in exactly one topic, so creating a point also places it, and deleting one also takes it out of its topic.
 */
import { endpoint, receive, respond } from "@mit-sdg/sync-engine/boundary";
import { no, reaction, when, where } from "@mit-sdg/sync-engine/language";
import { concepts } from "../concepts.ts";
import { ownsCue, ownsTopic } from "./access.ts";
import { textInput } from "./reusable/inputs.ts";

const { Categorizing, Cueing, Sessioning } = concepts;

/** Checks the topic before creating anything, so a point is never created without a topic to go in. */
const CreateCue = endpoint(
  "/cues/create",
  ({ session, category, name, user, cue }) =>
    receive({ session, category, name })
      .then(Sessioning.use({ session }).responds({ subject: user }))
      .then(
        where(ownsTopic({ user, category }))
          .then(Cueing.create({ owner: user, name }).responds({ cue }))
          .then(Categorizing.place({ item: cue, category }).responds({}))
          .then(respond({ cue }))
          .named("owner"),
        where(no(ownsTopic({ user, category })))
          .then(respond({ error: "NOT_FOUND" }))
          .named("refused"),
      ),
  { validators: { input: textInput } },
);

const RenameCue = endpoint(
  "/cues/rename",
  ({ session, cue, name, user }) =>
    receive({ session, cue, name })
      .then(Sessioning.use({ session }).responds({ subject: user }))
      .then(
        where(ownsCue({ user, cue }))
          .then(Cueing.rename({ cue, name }).responds({}))
          .then(respond({ cue }))
          .named("owner"),
        where(no(ownsCue({ user, cue })))
          .then(respond({ error: "NOT_FOUND" }))
          .named("refused"),
      ),
  { validators: { input: textInput } },
);

/** Both the point and the destination topic must belong to the user. */
const MoveCue = endpoint(
  "/cues/move",
  ({ session, cue, category, user }) =>
    receive({ session, cue, category })
      .then(Sessioning.use({ session }).responds({ subject: user }))
      .then(
        where(ownsCue({ user, cue }), ownsTopic({ user, category }))
          .then(Categorizing.place({ item: cue, category }).responds({}))
          .then(respond({ cue, category }))
          .named("owner"),
        where(no(ownsCue({ user, cue })))
          .then(respond({ error: "NOT_FOUND" }))
          .named("no-point"),
        where(ownsCue({ user, cue }), no(ownsTopic({ user, category })))
          .then(respond({ error: "NOT_FOUND" }))
          .named("no-topic"),
      ),
  { validators: { input: textInput } },
);

const DeleteCue = endpoint(
  "/cues/delete",
  ({ session, cue, user }) =>
    receive({ session, cue })
      .then(Sessioning.use({ session }).responds({ subject: user }))
      .then(
        where(ownsCue({ user, cue }))
          .then(Cueing.delete({ cue }).responds({}))
          .then(respond({ cue }))
          .named("owner"),
        where(no(ownsCue({ user, cue })))
          .then(respond({ error: "NOT_FOUND" }))
          .named("refused"),
      ),
  { validators: { input: textInput } },
);

/** Without this, a deleted point would still count as being in its topic, and the topic could never be deleted. */
const UnplaceDeleted = reaction(({ cue }) =>
  when(Cueing.delete({ cue }).responds({}))
    .where(Categorizing._category({ item: cue }))
    .then(Categorizing.unplace({ item: cue })),
);

export const composition = {
  editing: { CreateCue, RenameCue, MoveCue, DeleteCue },
  deleting: { UnplaceDeleted },
};
