/**
 * Who may act on what. Every endpoint about an existing topic or point checks one of these views,
 * so a request can never act on someone else's topic or point.
 */
import { view, where } from "@mit-sdg/sync-engine/language";
import { concepts } from "../concepts.ts";

const { Categorizing, Cueing } = concepts;

/** A topic belongs to whoever created it. */
export const ownsTopic = view("(user) owns topic (category)", ({ user, category }) =>
  where(Categorizing._get({ category }).is({ owner: user })),
).holds();

/** A point belongs to whoever created it. */
export const ownsCue = view("(user) owns point (cue)", ({ user, cue }) =>
  where(Cueing._get({ cue }).is({ owner: user })),
).holds();

export const composition = {
  permissions: { ownsTopic, ownsCue },
};
