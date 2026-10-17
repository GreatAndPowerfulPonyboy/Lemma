import { registerConcept } from "@mit-sdg/sync-engine/assembly";
import spec from "@design/concepts/Flashcarding.md" with { type: "text" };
import type { Db } from "mongodb";
import type { Cue } from "../Cueing/Cueing.ts";
import { AlreadyAnswered, FlashcardingConcept, InvalidAnswer, NoAnswer } from "./Flashcarding.ts";

/** In Lemma, answers are written for Cueing's cues: a point with an answer is a card. */
class Flashcarding extends FlashcardingConcept<Cue> {}

export const flashcarding = registerConcept({
  class: Flashcarding,
  spec,
  refusals: {
    INVALID_ANSWER: InvalidAnswer,
    ALREADY_ANSWERED: AlreadyAnswered,
    NO_ANSWER: NoAnswer,
  },
  floors: { mongo: ({ database }: { database: Db }, name: string) => new Flashcarding(database, name) },
});
