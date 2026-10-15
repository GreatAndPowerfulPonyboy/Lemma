import { ref } from "vue";
import type { LemmaWireHttp } from "../../../generated/wire.ts";
import { api } from "../api/client.ts";
import { messageFor } from "../api/errors.ts";
import { useSession } from "../reusable/session.ts";

type Wire = LemmaWireHttp;
type Path = keyof Wire;
export type Topic = Wire["/home"]["output"]["topics"][number];
export type Point = Topic["points"][number];

const topics = ref<Topic[] | null>(null);
const error = ref<string | null>(null);
/** True while `change` waits for a call and the reload after it, so a second click can't send it twice. */
const working = ref(false);

/** Waits for an endpoint call and returns its output, or `{ error }` with the sentence to show. */
async function call<T extends object>(path: Path, request: Promise<T | { error: string }>): Promise<T | { error: string }> {
  const result = await request;
  if (!("error" in result)) return result;
  if (result.error === "UNAUTHORIZED") useSession().sessionEnded();
  return { error: messageFor(path, result.error) };
}

/** Loads my topics and their points from `/home`. */
async function refresh() {
  const result = await call("/home", api.home());
  if ("error" in result) error.value = result.error;
  else topics.value = result.topics;
}

/** Waits for a call that changes my topics or points, then reloads them. A refusal is shown in the banner. */
async function change<T extends object>(path: Path, request: Promise<T | { error: string }>): Promise<boolean> {
  working.value = true;
  const result = await call(path, request);
  if ("error" in result) error.value = result.error;
  else {
    error.value = null;
    await refresh();
  }
  working.value = false;
  return !("error" in result);
}

/** My topics and points, and the functions that load and change them, shared by every component. */
export function useHome() {
  return { topics, error, working, refresh, change, call };
}
