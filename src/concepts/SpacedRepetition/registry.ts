import { registerConcept } from "@mit-sdg/sync-engine/assembly";
import spec from "@design/concepts/SpacedRepetition.md" with { type: "text" };
import type { Db } from "mongodb";
import type { Cue } from "../Cueing/Cueing.ts";
import { AlreadyEnrolled, InvalidCredit, NotEnrolled, SpacedRepetitionConcept } from "./SpacedRepetition.ts";

/** In Lemma, the items scheduled are Cueing's cues: every point has its own schedule. */
class SpacedRepetition extends SpacedRepetitionConcept<Cue> {}

export const spacedRepetition = registerConcept({
  class: SpacedRepetition,
  spec,
  refusals: {
    ALREADY_ENROLLED: AlreadyEnrolled,
    NOT_ENROLLED: NotEnrolled,
    INVALID_CREDIT: InvalidCredit,
  },
  floors: { mongo: ({ database }: { database: Db }, name: string) => new SpacedRepetition(database, name) },
});
