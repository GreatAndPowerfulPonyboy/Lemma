import {endpoint, receive, respond} from "@mit-sdg/sync-engine/boundary";
import {compute, each, former, no, reaction, when, where, whether} from "@mit-sdg/sync-engine/language";
import {computations, concepts} from "../concepts.ts";
import {ownsCheck} from "./access.ts";
import {textInput} from "./reusable/inputs.ts";

const {RecallChecking, Sessioning, SpacedRepetition} = concepts;

/** Tracking a prompt that's already tracked succeeds quietly. A newly tracked prompt is due straight away. */
export const TrackCheck = endpoint(
  "/check/track",
  ({session, user, check}) =>
    receive({session, check})
      .then(Sessioning.use({session}).responds({subject: user}))
      .then(
        where(ownsCheck({user, check}), no(SpacedRepetition._entry({item: check})))
          .then(SpacedRepetition.enroll({item: check}).responds({}))
          .then(respond({check}))
          .named("owner"),
        where(ownsCheck({user, check}), SpacedRepetition._entry({item: check}))
          .then(respond({check}))
          .named("tracked"),
        where(no(ownsCheck({user, check})))
          .then(respond({error: "NOT_FOUND"}))
          .named("refused"),
      ),
  {validators: {input: textInput}},
);

/** Untracking a prompt that isn't tracked succeeds quietly. */
export const UntrackCheck = endpoint(
  "/check/untrack",
  ({session, user, check}) =>
    receive({session, check})
      .then(Sessioning.use({session}).responds({subject: user}))
      .then(
        where(ownsCheck({user, check}), SpacedRepetition._entry({item: check}))
          .then(SpacedRepetition.drop({item: check}).responds({}))
          .then(respond({check}))
          .named("owner"),
        where(ownsCheck({user, check}), no(SpacedRepetition._entry({item: check})))
          .then(respond({check}))
          .named("untracked"),
        where(no(ownsCheck({user, check})))
          .then(respond({error: "NOT_FOUND"}))
          .named("refused"),
      ),
  {validators: {input: textInput}},
);

/** Closing an attempt at a tracked prompt reviews the prompt with the attempt's credit. Untracked prompts are never reviewed. */
const ReviewClosed = reaction(({check, credit}) =>
  when(RecallChecking.close({}).responds({check, credit}))
    .where(SpacedRepetition._entry({item: check}))
    .then(SpacedRepetition.review({item: check, credit})),
);

/** A deleted prompt leaves the schedule. */
const DropDeleted = reaction(({check}) =>
  when(RecallChecking.delete({check}).responds({}))
    .where(SpacedRepetition._entry({item: check}))
    .then(SpacedRepetition.drop({item: check})),
);

/** Whether a prompt is tracked, and when it's next due; `due` is null when it isn't tracked. */
export const scheduleOf = former(
  "the schedule of (check)",
  ({check}, {due, tracked}) =>
    where(
      whether(SpacedRepetition._entry({item: check}).is({due})),
      compute(computations.isTracked, {due}, tracked),
    ).form({tracked, due}),
);

/** The user's tracked prompts that were due by `before`, earliest first. */
export const dueChecks = former(
  "the checks (user) has due by (before)",
  ({user, before}, {check, name, due}) =>
    each(SpacedRepetition._due({before}).is({item: check, due}))
      .where(ownsCheck({user, check}), RecallChecking._get({check}).is({name}))
      .form({check, name, due}),
);

/** Every prompt the user tracks, with when it's next due, earliest first. */
export const scheduledChecks = former(
  "the checks (user) tracks",
  ({user}, {check, name, due}) =>
    each(RecallChecking._checks({owner: user}).is({check, name}))
      .where(SpacedRepetition._entry({item: check}).is({due}))
      .arranged(due)
      .form({check, name, due}),
);

export const composition = {
  tracking: {TrackCheck, UntrackCheck, DropDeleted},
  reviewing: {ReviewClosed},
  showing: {scheduleOf, dueChecks, scheduledChecks},
};
