import { registerConcept } from "@mit-sdg/sync-engine/assembly";
import spec from "@design/concepts/Sharing.md" with { type: "text" };
import type { Db } from "mongodb";
import type { Check } from "../RecallChecking/RecallChecking.ts";
import type { User } from "../Registering/Registering.ts";
import { AlreadyShared, NotShared, SharingConcept } from "./Sharing.ts";

/** Reused unchanged from ConceptBox. In Lemma, the things shared are RecallChecking's checks (prompts), and the people shared with are Registering's users. */
class Sharing extends SharingConcept<Check, User> {}

export const sharing = registerConcept({
  class: Sharing,
  spec,
  refusals: {
    ALREADY_SHARED: AlreadyShared,
    NOT_SHARED: NotShared,
  },
  floors: { mongo: ({ database }: { database: Db }, name: string) => new Sharing(database, name) },
});
