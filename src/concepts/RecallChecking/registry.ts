import { registerConcept } from "@mit-sdg/sync-engine/assembly";
import spec from "@design/concepts/RecallChecking.md" with { type: "text" };
import type { Db } from "mongodb";
import type { Cue } from "../Cueing/Cueing.ts";
import type { User } from "../Registering/Registering.ts";
import {
  AlreadyClosed, AlreadyIncluded, CheckNotFound, EmptyCheck, InvalidCredit, InvalidName,
  NotGraded, NotMentioned, NotOmitted, NotOpen, RecallCheckingConcept,
} from "./RecallChecking.ts";

/** In Lemma, Registering's users give the accounts, and the items checked are Cueing's cues. */
class RecallChecking extends RecallCheckingConcept<User, Cue> {}

export const recallChecking = registerConcept({
  class: RecallChecking,
  spec,
  refusals: {
    INVALID_NAME: InvalidName,
    CHECK_NOT_FOUND: CheckNotFound,
    NOT_OPEN: NotOpen,
    ALREADY_INCLUDED: AlreadyIncluded,
    EMPTY_CHECK: EmptyCheck,
    NOT_GRADED: NotGraded,
    NOT_OMITTED: NotOmitted,
    NOT_MENTIONED: NotMentioned,
    INVALID_CREDIT: InvalidCredit,
    ALREADY_CLOSED: AlreadyClosed,
  },
  floors: { mongo: ({ database }: { database: Db }, name: string) => new RecallChecking(database, name) },
});
