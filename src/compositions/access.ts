import {no, view, where} from "@mit-sdg/sync-engine/language";
import {concepts} from "../concepts.ts";

const {Cueing, Categorizing} = concepts;

/** In Lemma, whoever created a topic  owns it. */

export const ownsTopic = view("(user) owns topic (category)", ( {user, category}) =>
  where(Categorizing._get({category}).is({ creator: user})),
).holds();

/** In Lemma, whoever created a point owns it. */

export const ownsPoint = view("(user) owns point (cue)", ( {user, cue} ) =>
  where(Cueing._get({cue}).is( {creator: user})),
).holds();

export const composition = {
  permissions: {ownsTopic, ownsPoint},
};
