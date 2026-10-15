/**
 * Every point has a schedule. A new point is due at once; a deleted point's schedule goes with it. When a recall
 * check closes, each point it omitted lapses and comes back the next day, and each point it mentioned is advanced
 * by the check's credit: 0 when unrated, which holds its interval, so the rough match never lengthens one by itself.
 * Points created before scheduling existed have no schedule, so every reaction that needs one checks for it first.
 */
import { reaction, when } from "@mit-sdg/sync-engine/language";
import { concepts } from "../concepts.ts";

const { Cueing, RecallChecking, SpacedRepetition } = concepts;

const ScheduleNewCue = reaction(({ cue }) =>
  when(Cueing.create({}).responds({ cue })).then(SpacedRepetition.enroll({ item: cue })),
);

const UnscheduleDeleted = reaction(({ cue }) =>
  when(Cueing.delete({ cue }).responds({}))
    .where(SpacedRepetition._entry({ item: cue }))
    .then(SpacedRepetition.drop({ item: cue })),
);

const LapseOmitted = reaction(({ check, item }) =>
  when(RecallChecking.close({ check }).responds({}))
    .where(RecallChecking._omitted({ check }).is({ item }), SpacedRepetition._entry({ item }))
    .then(SpacedRepetition.lapse({ item })),
);

const AdvanceMentioned = reaction(({ check, item, credit }) =>
  when(RecallChecking.close({ check }).responds({}))
    .where(
      RecallChecking._mentioned({ check }).is({ item }),
      RecallChecking._get({ check }).is({ credit }),
      SpacedRepetition._entry({ item }),
    )
    .then(SpacedRepetition.advance({ item, credit })),
);

export const composition = {
  starting: { ScheduleNewCue, UnscheduleDeleted },
  results: { LapseOmitted, AdvanceMentioned },
};
