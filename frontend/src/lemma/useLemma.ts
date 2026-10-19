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

const home = ref<Home | null>(null);
const error = ref<string | null>(null);

/** True while 'change' waits for a call and the reload after it */
const working = ref(false);

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
 * Waits for a call to an endpoint that changes my homepage, then reloads the homepage. A refusal is shown in the banner.
 * Controls are disabled until the homepage reloads, so a second click can't send the request again.
 */
async function change<T extends object>(path: Path, request: Promise<T | { error: string }>) {
  working.value = true;
  const result = await call(path, request);
  if ("error" in result) error.value = result.error;
  else await refresh();
  working.value = false;
  return result;
}

/**
 * Makes several calls one at a time, then reloads the homepage once. Stops at the first refusal and shows it in
 * the banner; the calls made before it stay done, and the reload shows them. Returns whether every call succeeded.
 * Each call is a function, so it only starts once the one before it has finished.
 */
async function inOrder(calls: (() => Promise<object>)[]) {
  working.value = true;
  let failed: string | null = null;
  for (const makeCall of calls) {
    const result = await makeCall();
    if ("error" in result) {
      failed = String(result.error);
      break;
    }
  }
  await refresh();
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


/** Clears my HomePage  when my session ends, so the next person to sign in on this tab doesn't see it. */
function reset() {
  home.value = null;
  error.value = null;
}

/** my topics and points, and the functiosn that load and change them, shared by every component. */

export function useHome() {
  return {error, working ,refresh, change, move, unplace, pointsIn, emptyTopics, emptyAndDeleteTopics, call, reset, home};
}
