import { conceptSet } from "@mit-sdg/sync-engine/assembly";
import {authenticating} from "./concepts/Authenticating/registry.ts";
import {registering} from "./concepts/Registering/registry.ts";
import {sessioning} from "./concepts/Sessioning/registry.ts";
import {cueing} from "./concepts/Cueing/registry.ts";
import {categorizing} from "./concepts/Categorizing/registry.ts";
import {flashcarding} from "./concepts/Flashcarding/registry.ts";
export const applicationConceptSet = conceptSet({
  Registering: registering,
  Authenticating: authenticating,
  Sessioning: sessioning,
  Cueing: cueing,
  Categorizing: categorizing,
  Flashcarding: flashcarding,
  
});
export const { concepts } = applicationConceptSet;
