import { httpPolicy, type HttpPolicy } from "@mit-sdg/sync-engine-http/policy";
import { accountsHttp } from "../compositions/reusable/accounts.ts";
import { passwordsHttp } from "../compositions/reusable/passwords.ts";

/**
 * The HTTP category the server returns for each refusal from the compositions in `src/compositions/`.
 * A refusal missing here reaches the browser as INTERNAL_ERROR (500), so each new refusal needs a line.
 * Each way of signing in declares its categories beside its endpoints. The browser receives only the
 * category; the sentence for each one is in `frontend/src/api/errors.ts`, or, for signing in, in the
 * component for that way of signing in.
 */
const publicErrors = {
  INVALID_CATEGORY: "INVALID_REQUEST",
  CATEGORY_EXISTS: "CONFLICT",
  CATEGORY_NOT_EMPTY: "CONFLICT",
  INVALID_NAME: "INVALID_REQUEST",
  CUE_NOT_FOUND: "INVALID_REQUEST",
  CATEGORY_NOT_FOUND: "INVALID_REQUEST",
  NOT_PLACED: "INVALID_REQUEST",
} as const;

/**
 * The HTTP settings: the API under /api, each refusal returned as an HTTP category, the session in
 * an HttpOnly cookie that each way of signing in sets and sign-out clears, and a Commons sign-in
 * attempt in a second cookie that only the browser that started it holds.
 */
export function lemmaPolicy(publicOrigin: string): HttpPolicy {
  return httpPolicy({
    publicOrigin,
    basePath: "/api",
    publicErrors: {
      ...accountsHttp.publicErrors,
      ...passwordsHttp.publicErrors,
      ...publicErrors,
    },
    cookies: {
      session: accountsHttp.sessionCookie("lemma-session", [
        ...passwordsHttp.startingSessions,
      ]),
    },
  });
}
