/** The main page: each of the user's topics, alphabetically, with the points in it. */
import { endpoint, receive, respond } from "@mit-sdg/sync-engine/boundary";
import { each, former } from "@mit-sdg/sync-engine/language";
import { concepts } from "../concepts.ts";
import { textInput } from "./reusable/inputs.ts";

const { Categorizing, Cueing, Sessioning } = concepts;

const myTopics = former("the topics of (user) with their points", ({ user }, { category, name, cue, cueName }) =>
  each(Categorizing._categories({ owner: user }).is({ category, name })).form({
    category,
    name,
    points: each(Categorizing._items({ category }).is({ item: cue }))
      .where(Cueing._get({ cue }).is({ name: cueName }))
      .form({ cue, name: cueName }),
  }),
);

const ShowHome = endpoint(
  "/home",
  ({ session, user }) =>
    receive({ session })
      .then(Sessioning.use({ session }).responds({ subject: user }))
      .then(respond({ topics: myTopics({ user }) })),
  { validators: { input: textInput } },
);

export const composition = {
  showing: { ShowHome, myTopics },
};
