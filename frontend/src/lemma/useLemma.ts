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

/** Loads homepage from "/home", and repeats the label search if one is showing. */
async function refresh() {
  const result = await call("/home", api.home());
  if ("error" in result) error.value = result.error;
  else home.value = result;
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
}


/** Clears my HomePage  when my session ends, so the next person to sign in on this tab doesn't see it. */
function reset() {
  home.value = null;
  error.value = null;
}

/** my topics and points, and the functiosn that load and change them, shared by every component. */

export function useHome() {
  return {error, working ,refresh, change, call, reset, home};
}
