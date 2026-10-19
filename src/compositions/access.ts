import {no, view, where} from "@mit-sdg/sync-engine/language";
import {concepts} from "../concepts.ts";

const {Cueing, Categorizing, RecallChecking} = concepts;

/** In Lemma, whoever created a topic  owns it. */

export const ownsTopic = view("(user) owns topic (category)", ( {user, category}) =>
  where(Categorizing._get({category}).is({ creator: user})),
).holds();

/** In Lemma, whoever created a point owns it. */

export const ownsPoint = view("(user) owns point (cue)", ( {user, cue} ) =>
  where(Cueing._get({cue}).is( {creator: user})),
).holds();

/** In Lemma, whoever opened a check owns it. */

export const ownsCheck = view("(user) owns check (check)", ( {user, check} ) =>
  where(RecallChecking._get({check}).is({owner: user})),
).holds();

/** In Lemma, whoever owns a check owns each of its attempts. */

export const ownsAttempt = view("(user) owns attempt (attempt)", ( {user, attempt}, _output, {check} ) =>
  where(RecallChecking._attempt({attempt}).is({check}), ownsCheck({user, check})),
).holds();

export const composition = {
  permissions: {ownsTopic, ownsPoint, ownsCheck, ownsAttempt},
};
