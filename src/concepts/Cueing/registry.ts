import {registerConcept} from "@mit-sdg/sync-engine/assembly";
import spec from "@design/concepts/Cueing.md" with {type:"text"};
import type {Db} from "mongodb";
import type {User} from "../Registering/Registering.ts";
import {InvalidCue, CueNotFound, CueingConcept} from "./Cueing.ts";

/** Users from Registering own cues, and they can place those cues into Categories */

class Cueing extends CueingConcept<User> {};

export const cueing = registerConcept( {
  class: Cueing,
  spec,
  refusals: {
    INVALID_NAME : InvalidCue,
    CUE_NOT_FOUND: CueNotFound,
      },
  floors: {mongo: ({database}: {database: Db},name: string } => new Cueing(database, name));
})

