import { assemble } from "@mit-sdg/sync-engine/assembly";
import type { Db } from "mongodb";
import { applicationConceptSet } from "./concepts.ts";
import {composition as accounts} from "./compositions/reusable/accounts.ts";
import {composition as passwords} from "./compositions/reusable/passwords.ts";
import {composition as access} from "./compositions/access.ts";
import {composition as topics} from "./compositions/topics.ts";

export function assembleApplication(resources: {database: Db}) {
  return assemble({
    conceptSet: applicationConceptSet,
    instances:applicationConceptSet.implementations("mongo",resources),
    composition: {reusable: {accounts, passwords}, access, topics}
  });
}
