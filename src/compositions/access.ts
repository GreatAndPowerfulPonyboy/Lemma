import {no, view, where} from "@mit-sdg/sync-engine/language";
import {concepts} from "../concepts.ts";

const {Cueing, Categorizing, RecallChecking, Sharing} = concepts;

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

/** In Lemma, a check is shared with a user while its owner has shared it with them and hasn't taken it back. */

export const sharedWith = view("(check) is shared with (user)", ( {user, check} ) =>
  where(Sharing._recipients({item: check}).is({recipient: user})),
).holds();

/**
 * Whether a check has at least one point. It isn't an access rule, but it's shared by checks.ts and scheduling.ts,
 * which import each other's formers. A predicate holds once, however many points there are.
 */

export const hasPoints = view("(check) has points", ( {check} ) =>
  where(RecallChecking._subject({check})),
).holds();

export const composition = {
  permissions: {ownsTopic, ownsPoint, ownsCheck, ownsAttempt, sharedWith},
};
