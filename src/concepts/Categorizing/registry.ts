import { registerConcept } from "@mit-sdg/sync-engine/assembly";
import spec from "@design/concepts/Categorizing.md" with { type: "text" };
import type { Db } from "mongodb";
import type { Cue } from "../Cueing/Cueing.ts";
import type { User } from "../Registering/Registering.ts";
import {
  CategorizingConcept,
  CategoryExists,
  CategoryNotEmpty,
  CategoryNotFound,
  InvalidCategory,
  NotPlaced,
} from "./Categorizing.ts";

/** In Lemma, Registering's users own categories (topics), and the items placed in them are Cueing's cues. */
class Categorizing extends CategorizingConcept<User, Cue> {}

export const categorizing = registerConcept({
  class: Categorizing,
  spec,
  refusals: {
    INVALID_CATEGORY: InvalidCategory,
    CATEGORY_EXISTS: CategoryExists,
    CATEGORY_NOT_FOUND: CategoryNotFound,
    CATEGORY_NOT_EMPTY: CategoryNotEmpty,
    NOT_PLACED: NotPlaced,
  },
  floors: { mongo: ({ database }: { database: Db }, name: string) => new Categorizing(database, name) },
});
