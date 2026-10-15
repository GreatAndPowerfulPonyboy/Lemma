import { registerConcept } from "@mit-sdg/sync-engine/assembly";
import spec from "@design/concepts/Cueing.md" with { type: "text" };
import type { Db } from "mongodb";
import type { User } from "../Registering/Registering.ts";
import { CueNotFound, CueingConcept, InvalidName } from "./Cueing.ts";

/** Pins Cueing's owner to Registering's user, so registered signatures and wire types name that type. */
class Cueing extends CueingConcept<User> {}

export const cueing = registerConcept({
  class: Cueing,
  spec,
  refusals: {
    INVALID_NAME: InvalidName,
    CUE_NOT_FOUND: CueNotFound,
  },
  floors: { mongo: ({ database }: { database: Db }, name: string) => new Cueing(database, name) },
});
