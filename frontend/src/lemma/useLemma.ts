import {ref} from "vue";
import type {LemmaWireHttp} from "../../../generated/wire.ts";
import {api} from "../api/client.ts";
import {messageFor} from "../api/errors.ts";
import {useSession} from "../reusable/session.ts";

type Wire = LemmaWireHttp;
type Path = keyof Wire;
export type Home = Wire["/home"]["output"];
export type MyPoint= Home["myPoints"][number];
export type MyTopic= Home["myTopics"][number];
export type MyCheck = Home["myChecks"][number];
export type CheckShown = Wire["/check/show"]["output"];
export type AttemptShown = Wire["/attempt/show"]["output"];
export type SharedPrompt = Wire["/shared"]["output"]["shared"][number];
export type SharedShown = Wire["/shared/show"]["output"];
type Check = MyCheck["check"];
type Attempt = Wire["/attempt/show"]["input"]["attempt"];

/** The tabs of the home screen. */
export type Tab = "points" | "topics" | "prompts" | "shared";

const home = ref<Home | null>(null);
const error = ref<string | null>(null);

/** True while 'change' waits for a call and the reload after it */
const working = ref(false);

/** The home screen's tab. It lives here so that coming back from an attempt lands on the tab I left. */
const tab = ref<Tab>("points");

/** Which screen shows: the home screen, an attempt I'm typing my account for, or the results of one I've submitted. */
const screen = ref<"home" | "recall" | "results">("home");
/** The attempt the recall or results screen shows. */
const attempt = ref<Attempt | null>(null);
/** The prompt of the attempt I last opened, so its row is expanded when I come back to the Prompts tab. Cleared once used. */
const recentCheck = ref<Check | null>(null);

/**
 * Waits for an endpoint call and returns its output, or `{ error }` with the sentence to show.
 * `path` picks the sentence. UNAUTHORIZED means the session ended, so the sign-in screen is shown.
 */
async function call<T extends object>(path: Path, request: Promise<T | { error: string }>): Promise<T | { error: string }> {
  const result = await request;
  if (!("error" in result)) return result;
  if (result.error === "UNAUTHORIZED") useSession().sessionEnded();
  return { error: messageFor(path, result.error) };
}

/** Loads my homepage from "/home". A successful load clears the banner, so an old refusal stops showing. */
async function refresh() {
  const result = await call("/home", api.home());
  if ("error" in result) error.value = result.error;
  else {
    home.value = result;
    error.value = null;
  }
}


/**
 * Waits for a call to an endpoint that changes my homepage, then reloads the homepage, or runs `reload` instead,
 * which is told whether the call succeeded. A refusal reloads too, since it usually means something changed in
 * another tab, and is shown in the banner after the reload, which would otherwise clear it. Controls are disabled
 * until the reload, so a second click can't send the request again.
 */
async function change<T extends object>(path: Path, request: Promise<T | { error: string }>,
                                        reload: (done: boolean) => Promise<void> = refresh) {
  working.value = true;
  const result = await call(path, request);
  await reload(!("error" in result));
  if ("error" in result) error.value = result.error;
  working.value = false;
  return result;
}

/** For a `change` or `inOrder` whose next screen loads its own data, so reloading the homepage would be wasted. */
const noReload = async () => {};

/** For a `change` or `inOrder` that leaves the home screen when it succeeds, but stays on it after a refusal. */
const reloadIfRefused = (done: boolean) => (done ? noReload() : refresh());

/**
 * Makes several calls one at a time, then reloads the homepage once, or runs `reload` instead, which is told
 * whether every call succeeded. Stops at the first refusal and shows it in the banner; the calls made before it
 * stay done, and the reload shows them. Returns whether every call succeeded.
 * Each call is a function, so it only starts once the one before it has finished.
 */
async function inOrder(calls: (() => Promise<object>)[], reload: (done: boolean) => Promise<void> = refresh) {
  working.value = true;
  let failed: string | null = null;
  for (const makeCall of calls) {
    const result = await makeCall();
    if ("error" in result) {
      failed = String(result.error);
      break;
    }
  }
  await reload(failed === null);
  if (failed) error.value = failed;
  working.value = false;
  return failed === null;
}

/** Moves each point into the topic. */
function move(cues: MyPoint["cue"][], category: MyTopic["category"]) {
  return inOrder(cues.map((cue) => () => call("/point/move", api.point.move({ cue, incidentCategory: category }))));
}

/** Takes each point out of its topic, so it becomes Unsorted. */
function unplace(cues: MyPoint["cue"][]) {
  return inOrder(cues.map((cue) => () => call("/point/unplace", api.point.unplace({ cue }))));
}

/** The points in any of these topics. */
function pointsIn(categories: MyTopic["category"][]) {
  return (home.value?.myPoints ?? []).filter((p) => p.category !== null && categories.includes(p.category)).map((p) => p.cue);
}

/** Empties each topic: every point in them becomes Unsorted. */
function emptyTopics(categories: MyTopic["category"][]) {
  return unplace(pointsIn(categories));
}

/** Empties each topic, then deletes them all, since a topic with points can't be deleted. Stops at the first refusal, so a topic is only deleted once its points are out. */
function emptyAndDeleteTopics(categories: MyTopic["category"][]) {
  return inOrder([
    ...pointsIn(categories).map((cue) => () => call("/point/unplace", api.point.unplace({ cue }))),
    ...categories.map((category) => () => call("/topic/delete", api.topic.delete({ category }))),
  ]);
}


/**
 * Shows the recall or results screen for an attempt at a prompt. My homepage is forgotten until I come back, when
 * it reloads, so it never shows the prompt as it was before the attempt (still offering to resume it, say).
 */
function openAttempt(next: "recall" | "results", started: Attempt, check: Check) {
  home.value = null;
  attempt.value = started;
  recentCheck.value = check;
  error.value = null;
  screen.value = next;
}

/** Goes back to the home screen, on the tab I left; it reloads when it shows. */
function goHome() {
  screen.value = "home";
  attempt.value = null;
}

/** Starts an attempt at one of my prompts and opens the recall screen. */
async function startAttempt(check: Check) {
  const result = await change("/check/attempt", api.check.attempt({ check }), reloadIfRefused);
  if (!("error" in result)) openAttempt("recall", result.attempt, check);
}

/** Opens a prompt's unfinished attempt where I left it: the recall screen if it isn't submitted yet, otherwise the results. */
function resume(check: Check, current: { attempt: Attempt; status: string }) {
  openAttempt(current.status === "OPEN" ? "recall" : "results", current.attempt, check);
}

/**
 * Opens a prompt with this name and these points, then starts an attempt at it and opens the recall screen. The
 * calls go one at a time and stop at the first refusal, like `move`; whatever was made before it stays.
 */
async function startPrompt(name: string, cues: MyPoint["cue"][]) {
  let check: Check | null = null;
  let started: Attempt | null = null;
  const done = await inOrder([
    async () => {
      const result = await call("/check/open", api.check.open({ name }));
      if (!("error" in result)) check = result.check;
      return result;
    },
    ...cues.map((cue) => () => call("/check/include", api.check.include({ check: check!, cue }))),
    async () => {
      const result = await call("/check/attempt", api.check.attempt({ check: check! }));
      if (!("error" in result)) started = result.attempt;
      return result;
    },
    // Only a refusal keeps me on the home screen, where it should show any prompt made before it.
  ], reloadIfRefused);
  if (done && check && started) openAttempt("recall", started, check);
  return done;
}

/**
 * Submits the attempt I'm typing, then marks each of these points as mentioned, one at a time like `move`, and
 * opens the results screen. Only the points go to the server, never what I typed. Once the submit itself succeeds,
 * the results screen opens even if a mark is refused, since that's where marks are corrected and the attempt can't
 * be submitted again. Returns whether the submit itself succeeded.
 */
async function submitAttempt(cues: MyPoint["cue"][]) {
  const current = attempt.value;
  if (current === null) return false;
  let submitted = false;
  await inOrder([
    async () => {
      const result = await call("/attempt/submit", api.attempt.submit({ attempt: current }));
      submitted = !("error" in result);
      return result;
    },
    ...cues.map((cue) => () => call("/attempt/mention", api.attempt.mention({ attempt: current, cue }))),
  ], noReload);
  if (submitted) screen.value = "results";
  return submitted;
}

/** Gives up the attempt, so it's never graded, and goes back to the home screen. Returns whether it was abandoned. */
async function abandonAttempt() {
  const current = attempt.value;
  if (current === null) return false;
  // The home screen reloads when it shows, so this doesn't reload it first.
  const result = await change("/attempt/abandon", api.attempt.abandon({ attempt: current }), noReload);
  if ("error" in result) return false;
  goHome();
  return true;
}

/**
 * Copies a prompt someone shared with me into my own prompts: opens a prompt with its name, then creates each of
 * its points (Unsorted) and includes it, one call at a time like `move`. The copy is mine; nothing links it to the
 * original. Returns whether every call succeeded.
 */
async function copyShared(shared: SharedPrompt["check"]) {
  const original = await call("/shared/show", api.shared.show({ check: shared }));
  if ("error" in original) {
    error.value = original.error;
    return false;
  }
  let check: Check | null = null;
  return inOrder([
    async () => {
      const result = await call("/check/open", api.check.open({ name: original.name }));
      if (!("error" in result)) check = result.check;
      return result;
    },
    ...original.points.flatMap(({ pointName }) => {
      let cue: MyPoint["cue"] | null = null;
      return [
        async () => {
          const result = await call("/point/create", api.point.create({ name: pointName }));
          if (!("error" in result)) cue = result.cue;
          return result;
        },
        () => call("/check/include", api.check.include({ check: check!, cue: cue! })),
      ];
    }),
  ]);
}

/** Clears my HomePage  when my session ends, so the next person to sign in on this tab doesn't see it. */
function reset() {
  home.value = null;
  error.value = null;
  tab.value = "points";
  screen.value = "home";
  attempt.value = null;
  recentCheck.value = null;
}

/** my topics and points, and the functiosn that load and change them, shared by every component. */

export function useHome() {
  return {error, working ,refresh, change, move, unplace, pointsIn, emptyTopics, emptyAndDeleteTopics, call, reset, home,
    tab, screen, attempt, recentCheck, startPrompt, startAttempt, resume, goHome, submitAttempt, abandonAttempt, copyShared};
}
