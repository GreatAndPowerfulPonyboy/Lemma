import type { OperationalObserver } from "@mit-sdg/sync-engine/assembly";
import { createGateway } from "@mit-sdg/sync-engine/boundary";
import { createLocalClient } from "@mit-sdg/sync-engine/client";
import type { LemmaWire } from "../../generated/wire.ts";
import { assembleApplication } from "../../src/assembly.ts";
import type { Session } from "../../src/concepts/Sessioning/Sessioning.ts";
import { testDatabase } from "./reusable/mongo.ts";
import { ok } from "./reusable/results.ts";

/** ConceptBox on a fresh database, an in-memory bucket, and an in-memory Commons, called through its typed client. With TRACE set, it prints each action. */
export async function startLemma(observers: OperationalObserver[] = []) {
  const database = await testDatabase();
  // const logSink = process.env.TRACE ? printTrace() : undefined;
  const application = assembleApplication({ database,  });
  const api = createLocalClient<LemmaWire>({ invoker: createGateway<LemmaWire>({ application }) });

  async function register(username: string) {
    return ok(await api.auth.register({ username, password: "correct horse" }));
  }

  return { database, application, api, register,};
}
