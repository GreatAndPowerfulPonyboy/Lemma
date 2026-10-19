import {endpoint, receive, respond} from "@mit-sdg/sync-engine/boundary";
import {each, former, no, reaction, when, where} from "@mit-sdg/sync-engine/language";
import {concepts} from "../concepts.ts";
import {ownsAttempt, ownsCheck, ownsPoint} from "./access.ts";
import {textInput} from "./reusable/inputs.ts";

const {Cueing, RecallChecking, Sessioning} = concepts;

export const OpenCheck = endpoint(
  "/check/open",
  ({session, user, name, check}) =>
    receive({session, name})
      .then(Sessioning.use({session}).responds({subject: user}))
      .then(RecallChecking.open({owner: user, name}).responds({check}))
      .then(respond({check})),
  {validators: {input: textInput}},
);

export const RenameCheck = endpoint(
  "/check/rename",
  ({session, user, check, name}) =>
    receive({session, check, name})
      .then(Sessioning.use({session}).responds({subject: user}))
      .then(
        where(ownsCheck({user, check}))
          .then(RecallChecking.rename({check, name}).responds({}))
          .then(respond({check}))
          .named("owner"),
        where(no(ownsCheck({user, check})))
          .then(respond({error: "NOT_FOUND"}))
          .named("refused"),
      ),
  {validators: {input: textInput}},
);

export const DeleteCheck = endpoint(
  "/check/delete",
  ({session, user, check}) =>
    receive({session, check})
      .then(Sessioning.use({session}).responds({subject: user}))
      .then(
        where(ownsCheck({user, check}))
          .then(RecallChecking.delete({check}).responds({}))
          .then(respond({check}))
          .named("owner"),
        where(no(ownsCheck({user, check})))
          .then(respond({error: "NOT_FOUND"}))
          .named("refused"),
      ),
  {validators: {input: textInput}},
);

/** Including a point the check already has succeeds quietly. The check keeps the point's name beside it. */
export const IncludePoint = endpoint(
  "/check/include",
  ({session, user, check, cue, pointName}) =>
    receive({session, check, cue})
      .then(Sessioning.use({session}).responds({subject: user}))
      .then(
        where(
          ownsCheck({user, check}),
          ownsPoint({user, cue}),
          no(RecallChecking._subject({check}).is({item: cue})),
          Cueing._get({cue}).is({name: pointName}),
        )
          .then(RecallChecking.include({check, item: cue, name: pointName}).responds({}))
          .then(respond({check}))
          .named("owner"),
        where(ownsCheck({user, check}), ownsPoint({user, cue}), RecallChecking._subject({check}).is({item: cue}))
          .then(respond({check}))
          .named("included"),
        where(no(ownsCheck({user, check})))
          .then(respond({error: "NOT_FOUND"}))
          .named("no-check"),
        where(ownsCheck({user, check}), no(ownsPoint({user, cue})))
          .then(respond({error: "NOT_FOUND"}))
          .named("no-point"),
      ),
  {validators: {input: textInput}},
);

/** Excluding a point the check doesn't have succeeds quietly. */
export const ExcludePoint = endpoint(
  "/check/exclude",
  ({session, user, check, cue}) =>
    receive({session, check, cue})
      .then(Sessioning.use({session}).responds({subject: user}))
      .then(
        where(ownsCheck({user, check}), ownsPoint({user, cue}), RecallChecking._subject({check}).is({item: cue}))
          .then(RecallChecking.exclude({check, item: cue}).responds({}))
          .then(respond({check}))
          .named("owner"),
        where(ownsCheck({user, check}), ownsPoint({user, cue}), no(RecallChecking._subject({check}).is({item: cue})))
          .then(respond({check}))
          .named("excluded"),
        where(no(ownsCheck({user, check})))
          .then(respond({error: "NOT_FOUND"}))
          .named("no-check"),
        where(ownsCheck({user, check}), no(ownsPoint({user, cue})))
          .then(respond({error: "NOT_FOUND"}))
          .named("no-point"),
      ),
  {validators: {input: textInput}},
);

/** A deleted point leaves every check that includes it. Attempts keep their own copy of the subject. */
const ExcludeDeleted = reaction(({cue, check}) =>
  when(Cueing.delete({cue}).responds({}))
    .where(RecallChecking._including({item: cue}).is({check}))
    .then(RecallChecking.exclude({check, item: cue})),
);

/** A renamed point is renamed in every check that includes it, so a new attempt starts with its new name. */
const RelabelRenamed = reaction(({cue, name}) =>
  when(Cueing.rename({cue}).responds({}))
    .where(Cueing._get({cue}).is({name}))
    .then(RecallChecking.relabel({item: cue, name})),
);

export const StartAttempt = endpoint(
  "/check/attempt",
  ({session, user, check, attempt}) =>
    receive({session, check})
      .then(Sessioning.use({session}).responds({subject: user}))
      .then(
        where(ownsCheck({user, check}))
          .then(RecallChecking.attempt({check}).responds({attempt}))
          .then(respond({attempt}))
          .named("owner"),
        where(no(ownsCheck({user, check})))
          .then(respond({error: "NOT_FOUND"}))
          .named("refused"),
      ),
  {validators: {input: textInput}},
);

export const SubmitAttempt = endpoint(
  "/attempt/submit",
  ({session, user, attempt}) =>
    receive({session, attempt})
      .then(Sessioning.use({session}).responds({subject: user}))
      .then(
        where(ownsAttempt({user, attempt}))
          .then(RecallChecking.submit({attempt}).responds({}))
          .then(respond({attempt}))
          .named("owner"),
        where(no(ownsAttempt({user, attempt})))
          .then(respond({error: "NOT_FOUND"}))
          .named("refused"),
      ),
  {validators: {input: textInput}},
);

export const MentionPoint = endpoint(
  "/attempt/mention",
  ({session, user, attempt, cue}) =>
    receive({session, attempt, cue})
      .then(Sessioning.use({session}).responds({subject: user}))
      .then(
        where(ownsAttempt({user, attempt}))
          .then(RecallChecking.mention({attempt, item: cue}).responds({}))
          .then(respond({attempt}))
          .named("owner"),
        where(no(ownsAttempt({user, attempt})))
          .then(respond({error: "NOT_FOUND"}))
          .named("refused"),
      ),
  {validators: {input: textInput}},
);

export const OmitPoint = endpoint(
  "/attempt/omit",
  ({session, user, attempt, cue}) =>
    receive({session, attempt, cue})
      .then(Sessioning.use({session}).responds({subject: user}))
      .then(
        where(ownsAttempt({user, attempt}))
          .then(RecallChecking.omit({attempt, item: cue}).responds({}))
          .then(respond({attempt}))
          .named("owner"),
        where(no(ownsAttempt({user, attempt})))
          .then(respond({error: "NOT_FOUND"}))
          .named("refused"),
      ),
  {validators: {input: textInput}},
);

export const CloseAttempt = endpoint(
  "/attempt/close",
  ({session, user, attempt, credit}) =>
    receive({session, attempt})
      .then(Sessioning.use({session}).responds({subject: user}))
      .then(
        where(ownsAttempt({user, attempt}))
          .then(RecallChecking.close({attempt}).responds({credit}))
          .then(respond({credit}))
          .named("owner"),
        where(no(ownsAttempt({user, attempt})))
          .then(respond({error: "NOT_FOUND"}))
          .named("refused"),
      ),
  {validators: {input: textInput}},
);

export const AbandonAttempt = endpoint(
  "/attempt/abandon",
  ({session, user, attempt}) =>
    receive({session, attempt})
      .then(Sessioning.use({session}).responds({subject: user}))
      .then(
        where(ownsAttempt({user, attempt}))
          .then(RecallChecking.abandon({attempt}).responds({}))
          .then(respond({attempt}))
          .named("owner"),
        where(no(ownsAttempt({user, attempt})))
          .then(respond({error: "NOT_FOUND"}))
          .named("refused"),
      ),
  {validators: {input: textInput}},
);

/** The points a check covers, in the order they were included. */
const subjectOf = former(
  "the subject of (check)",
  ({check}, {cue, pointName}) =>
    each(RecallChecking._subject({check}).is({item: cue, name: pointName}))
      .form({cue, pointName}),
);

/** The check's attempt that is OPEN or GRADED, if it has one. */
const currentAttemptOf = former(
  "the current attempt of (check)",
  ({check}, {attempt, status}) =>
    where(RecallChecking._current({check}).is({attempt, status}))
      .form({attempt, status}),
).optional();

/** Every attempt of a check, newest first. */
const attemptsOf = former(
  "the attempts of (check)",
  ({check}, {attempt, status, credit}) =>
    each(RecallChecking._attempts({check}).is({attempt, status, credit}))
      .form({attempt, status, credit}),
);

/** The points an attempt covers, with the names they had when it began. */
const attemptPoints = former(
  "the points of (attempt)",
  ({attempt}, {cue, pointName}) =>
    each(RecallChecking._attemptSubject({attempt}).is({item: cue, name: pointName}))
      .form({cue, pointName}),
);

const mentionedIn = former(
  "the points mentioned in (attempt)",
  ({attempt}, {cue, pointName}) =>
    each(RecallChecking._mentioned({attempt}).is({item: cue, name: pointName}))
      .form({cue, pointName}),
);

const omittedIn = former(
  "the points omitted from (attempt)",
  ({attempt}, {cue, pointName}) =>
    each(RecallChecking._omitted({attempt}).is({item: cue, name: pointName}))
      .form({cue, pointName}),
);

export const ShowCheck = endpoint(
  "/check/show",
  ({session, user, check, name}) =>
    receive({session, check})
      .then(Sessioning.use({session}).responds({subject: user}))
      .then(
        where(ownsCheck({user, check}), RecallChecking._get({check}).is({name}))
          .then(respond({
            name,
            subject: subjectOf({check}),
            current: currentAttemptOf({check}),
            attempts: attemptsOf({check}),
          }))
          .named("owner"),
        where(no(ownsCheck({user, check})))
          .then(respond({error: "NOT_FOUND"}))
          .named("refused"),
      ),
  {validators: {input: textInput}},
);

export const ShowAttempt = endpoint(
  "/attempt/show",
  ({session, user, attempt, check, checkName, status, credit}) =>
    receive({session, attempt})
      .then(Sessioning.use({session}).responds({subject: user}))
      .then(
        where(
          ownsAttempt({user, attempt}),
          RecallChecking._attempt({attempt}).is({check, status, credit}),
          RecallChecking._get({check}).is({name: checkName}),
        )
          .then(respond({
            check,
            checkName,
            status,
            credit,
            subject: attemptPoints({attempt}),
            mentioned: mentionedIn({attempt}),
            omitted: omittedIn({attempt}),
          }))
          .named("owner"),
        where(no(ownsAttempt({user, attempt})))
          .then(respond({error: "NOT_FOUND"}))
          .named("refused"),
      ),
  {validators: {input: textInput}},
);

export const composition = {
  opening: {OpenCheck},
  renaming: {RenameCheck},
  deleting: {DeleteCheck},
  subjects: {IncludePoint, ExcludePoint, ExcludeDeleted, RelabelRenamed},
  attempting: {StartAttempt, SubmitAttempt, MentionPoint, OmitPoint, CloseAttempt, AbandonAttempt},
  showing: {ShowCheck, ShowAttempt, subjectOf, currentAttemptOf, attemptsOf, attemptPoints, mentionedIn, omittedIn},
};
