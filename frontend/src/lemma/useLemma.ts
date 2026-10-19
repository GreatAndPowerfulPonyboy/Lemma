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
 * Moves each point into the topic, one at a time, then reloads the homepage once. Stops at the first
 * refusal and shows it in the banner; the points moved before it stay moved, and the reload shows them.
 */
async function move(cues: MyPoint["cue"][], category: MyTopic["category"]) {
  working.value = true;
  let failed: string | null = null;
  for (const cue of cues) {
    const result = await call("/point/move", api.point.move({ cue, incidentCategory: category }));
    if ("error" in result) {
      failed = result.error;
      break;
    }
  }
  await refresh();
  if (failed) error.value = failed;
  working.value = false;
  return failed === null;
}


/**
 * Takes each point out of its topic, one at a time, so it becomes Unsorted, then reloads the homepage once.
 * Like `move`, it stops at the first refusal and shows it in the banner; the points taken out before it stay out.
 */
async function unplace(cues: MyPoint["cue"][]) {
  working.value = true;
  let failed: string | null = null;
  for (const cue of cues) {
    const result = await call("/point/unplace", api.point.unplace({ cue }));
    if ("error" in result) {
      failed = result.error;
      break;
    }
  }
  await refresh();
  if (failed) error.value = failed;
  working.value = false;
  return failed === null;
}


/** Clears my HomePage  when my session ends, so the next person to sign in on this tab doesn't see it. */
function reset() {
  home.value = null;
  error.value = null;
}

/** my topics and points, and the functiosn that load and change them, shared by every component. */

export function useHome() {
  return {error, working ,refresh, change, move, unplace, call, reset, home};
}
