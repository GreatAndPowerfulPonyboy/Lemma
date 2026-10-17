import { registerConcept } from "@mit-sdg/sync-engine/assembly";
import spec from "@design/concepts/RecallChecking.md" with { type: "text" };
import type { Db } from "mongodb";
import type { Cue } from "../Cueing/Cueing.ts";
import type { User } from "../Registering/Registering.ts";
import {
  AlreadyIncluded, AttemptInProgress, AttemptNotFound, CheckNotFound, Finished, InvalidName, InvalidRating,
  NotGraded, NotIncluded, NotInSubject, NotOpen, RecallCheckingConcept, Unrated,
} from "./RecallChecking.ts";

/** In Lemma, Registering's users own checks, and the items checked are Cueing's cues. */
class RecallChecking extends RecallCheckingConcept<User, Cue> {}

export const recallChecking = registerConcept({
  class: RecallChecking,
  spec,
  refusals: {
    INVALID_NAME: InvalidName,
    CHECK_NOT_FOUND: CheckNotFound,
    ALREADY_INCLUDED: AlreadyIncluded,
    NOT_INCLUDED: NotIncluded,
    ATTEMPT_IN_PROGRESS: AttemptInProgress,
    ATTEMPT_NOT_FOUND: AttemptNotFound,
    NOT_OPEN: NotOpen,
    NOT_GRADED: NotGraded,
    NOT_IN_SUBJECT: NotInSubject,
    INVALID_RATING: InvalidRating,
    UNRATED: Unrated,
    FINISHED: Finished,
  },
  floors: { mongo: ({ database }: { database: Db }, name: string) => new RecallChecking(database, name) },
});
