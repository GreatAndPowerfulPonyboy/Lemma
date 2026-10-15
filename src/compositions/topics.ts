/** Creating, renaming, and deleting topics. A topic is a Categorizing category owned by the signed-in user. */
import { endpoint, receive, respond } from "@mit-sdg/sync-engine/boundary";
import { no, where } from "@mit-sdg/sync-engine/language";
import { concepts } from "../concepts.ts";
import { ownsTopic } from "./access.ts";
import { textInput } from "./reusable/inputs.ts";

const { Categorizing, Sessioning } = concepts;

const CreateTopic = endpoint(
  "/topics/create",
  ({ session, name, user, category }) =>
    receive({ session, name })
      .then(Sessioning.use({ session }).responds({ subject: user }))
      .then(Categorizing.create({ owner: user, name }).responds({ category }))
      .then(respond({ category })),
  { validators: { input: textInput } },
);

const RenameTopic = endpoint(
  "/topics/rename",
  ({ session, category, name, user }) =>
    receive({ session, category, name })
      .then(Sessioning.use({ session }).responds({ subject: user }))
      .then(
        where(ownsTopic({ user, category }))
          .then(Categorizing.rename({ category, name }).responds({}))
          .then(respond({ category }))
          .named("owner"),
        where(no(ownsTopic({ user, category })))
          .then(respond({ error: "NOT_FOUND" }))
          .named("refused"),
      ),
  { validators: { input: textInput } },
);

const DeleteTopic = endpoint(
  "/topics/delete",
  ({ session, category, user }) =>
    receive({ session, category })
      .then(Sessioning.use({ session }).responds({ subject: user }))
      .then(
        where(ownsTopic({ user, category }))
          .then(Categorizing.delete({ category }).responds({}))
          .then(respond({ category }))
          .named("owner"),
        where(no(ownsTopic({ user, category })))
          .then(respond({ error: "NOT_FOUND" }))
          .named("refused"),
      ),
  { validators: { input: textInput } },
);

export const composition = {
  managing: { CreateTopic, RenameTopic, DeleteTopic },
};
