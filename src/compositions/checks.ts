/**
 * Recall checks: the person picks the points they mean to cover, gives an account from memory, and sees which
 * points it left out. RecallChecking never receives the account: the browser reads it, submits the check (which marks
 * every point omitted), and then marks each point the account mentioned. The person corrects any point the browser
 * misjudged before closing the check.
 */
import { endpoint, receive, respond } from "@mit-sdg/sync-engine/boundary";
import { each, former, no, where } from "@mit-sdg/sync-engine/language";
import { concepts } from "../concepts.ts";
import { ownsCheck, ownsCue } from "./access.ts";
import { textInput } from "./reusable/inputs.ts";

const { Cueing, RecallChecking, Sessioning } = concepts;

const OpenCheck = endpoint(
  "/checks/open",
  ({ session, name, user, check }) =>
    receive({ session, name })
      .then(Sessioning.use({ session }).responds({ subject: user }))
      .then(RecallChecking.open({ owner: user, name }).responds({ check }))
      .then(respond({ check })),
  { validators: { input: textInput } },
);

/** Only the user's own points can go in the user's own check. */
const IncludePoint = endpoint(
  "/checks/include",
  ({ session, check, cue, user }) =>
    receive({ session, check, cue })
      .then(Sessioning.use({ session }).responds({ subject: user }))
      .then(
        where(ownsCheck({ user, check }), ownsCue({ user, cue }))
          .then(RecallChecking.include({ check, item: cue }).responds({}))
          .then(respond({ check }))
          .named("owner"),
        where(no(ownsCheck({ user, check })))
          .then(respond({ error: "NOT_FOUND" }))
          .named("not-their-check"),
        where(ownsCheck({ user, check }), no(ownsCue({ user, cue })))
          .then(respond({ error: "NOT_FOUND" }))
          .named("not-their-point"),
      ),
  { validators: { input: textInput } },
);

/** One endpoint per check action that takes only the check: submit, close, and abandon. */
function checkAction(path: string, act: "submit" | "close" | "abandon") {
  return endpoint(
    path,
    ({ session, check, user }) =>
      receive({ session, check })
        .then(Sessioning.use({ session }).responds({ subject: user }))
        .then(
          where(ownsCheck({ user, check }))
            .then(RecallChecking[act]({ check }).responds({}))
            .then(respond({ check }))
            .named("owner"),
          where(no(ownsCheck({ user, check })))
            .then(respond({ error: "NOT_FOUND" }))
            .named("refused"),
        ),
    { validators: { input: textInput } },
  );
}

const SubmitCheck = checkAction("/checks/submit", "submit");
const CloseCheck = checkAction("/checks/close", "close");
const AbandonCheck = checkAction("/checks/abandon", "abandon");

/** One endpoint per correction: marking a point mentioned, or marking it omitted. */
function correction(path: string, act: "markMentioned" | "markOmitted") {
  return endpoint(
    path,
    ({ session, check, cue, user }) =>
      receive({ session, check, cue })
        .then(Sessioning.use({ session }).responds({ subject: user }))
        .then(
          where(ownsCheck({ user, check }))
            .then(RecallChecking[act]({ check, item: cue }).responds({}))
            .then(respond({ check }))
            .named("owner"),
          where(no(ownsCheck({ user, check })))
            .then(respond({ error: "NOT_FOUND" }))
            .named("refused"),
        ),
    { validators: { input: textInput } },
  );
}

const MarkMentioned = correction("/checks/mention", "markMentioned");
const MarkOmitted = correction("/checks/omit", "markOmitted");

/** A check's name and status, and its mentioned and omitted points with their names, in the order they were included. */
const checkResult = former(
  "the result of (check)",
  ({ check }, { name, status, cue, cueName }) =>
    each(RecallChecking._get({ check }).is({ name, status })).form({
      name,
      status,
      points: each(RecallChecking._subject({ check }).is({ item: cue }))
        .where(Cueing._get({ cue }).is({ name: cueName }))
        .form({ cue, name: cueName }),
      mentioned: each(RecallChecking._mentioned({ check }).is({ item: cue }))
        .where(Cueing._get({ cue }).is({ name: cueName }))
        .form({ cue, name: cueName }),
      omitted: each(RecallChecking._omitted({ check }).is({ item: cue }))
        .where(Cueing._get({ cue }).is({ name: cueName }))
        .form({ cue, name: cueName }),
    }),
);

const ShowCheck = endpoint(
  "/checks/show",
  ({ session, check, user }) =>
    receive({ session, check })
      .then(Sessioning.use({ session }).responds({ subject: user }))
      .then(
        where(ownsCheck({ user, check }))
          .then(respond({ result: checkResult({ check }) }))
          .named("owner"),
        where(no(ownsCheck({ user, check })))
          .then(respond({ error: "NOT_FOUND" }))
          .named("refused"),
      ),
  { validators: { input: textInput } },
);

export const composition = {
  running: { OpenCheck, IncludePoint, SubmitCheck, CloseCheck, AbandonCheck },
  correcting: { MarkMentioned, MarkOmitted },
  showing: { ShowCheck, checkResult },
};
