import {no, where, when,  reaction} from "@mit-sdg/sync-engine/language";
import {concepts} from "../concepts.ts";
import {ownsTopic, ownsPoint} from "./access.ts";
import {textInput} from "./reusable/inputs.ts";
import {endpoint, receive, respond} from "@mit-sdg/sync-engine/boundary";

const {Categorizing, Sessioning, Cueing} = concepts;

export const CreatePoint = endpoint(
  "/point/create",
  ({ session, user, name, cue }) =>
    receive({ session, name,})
      .then(Sessioning.use({ session }).responds({ subject: user }))
          .then(Cueing.create({ creator: user, name }).responds({ cue }))
          .then(respond({ cue })),
  { validators: { input: textInput } },
);

export const CreateAndPlace= endpoint(
  "/point/createIn",
  ({ session, user, name, category, cue }) =>
    receive({ session, name, category })
      .then(Sessioning.use({ session }).responds({ subject: user }))
      .then(
        where(ownsTopic({ user, category }))
          .then(Cueing.create({ creator: user, name }).responds({ cue }))
          .then(Categorizing.place({ item: cue, category }).responds({}))
          .then(respond({ cue }))
          .named("creator"),
        where(no(ownsTopic({ user, category })))
          .then(respond({ error: "NOT_FOUND" }))
          .named("refused"),
      ),
  { validators: { input: textInput } },
);


export const RenamePoint = endpoint(
  "/point/rename",
  ({session, user, name, cue}) =>
  receive({session, name, cue})
  .then(Sessioning.use({session}).responds({subject: user}))
    .then(
      where(ownsPoint({user, cue}))
        .then(Cueing.rename({cue: cue, name: name}).responds({}))
        .then(respond({cue}))
        .named("creator"),
      where(no(ownsPoint({user, cue})))
        .then(respond({error: "NOT_FOUND"}))
        .named("refused"),
    ),
    {validators: {input: textInput}}
)

export const DeletePoint = endpoint(
  "/point/delete",
  ({session, user, cue}) =>
  receive({session, cue})
    .then(Sessioning.use({session}).responds({subject: user}))
    .then(
      where(ownsPoint({user, cue}))
        .then(Cueing.delete({cue}).responds({}))
        .then(respond({cue}))
        .named("creator"),
      where(no(ownsPoint({user, cue})))
        .then(respond({error: "NOT_FOUND"}))
        .named("refused"),
    ),
    {validators: {input:textInput}}
)

const UnplaceDeleted = reaction(({cue}) =>
  when(Cueing.delete({cue}).responds({}))
  .where(Categorizing._category({item: cue}))
  .then(Categorizing.unplace({item: cue}))
);


export const MovePoint = endpoint(
  "/point/move",
  ({session, user, cue, incidentCategory}) =>
  receive({session, cue,  incidentCategory})
    .then(Sessioning.use({session}).responds({subject:user}))
    .then (
      where(ownsPoint({user, cue}), ownsTopic({user, category:incidentCategory}))
        .then(Categorizing.place({item: cue, category: incidentCategory}).responds({}))
        .then(respond({cue}))
        .named("creator"),
      where(no(ownsPoint({user, cue})))
        .then(respond({error: "NOT_FOUND"}))
        .named("no-point"),
      where(ownsPoint({ user, cue }), no(ownsTopic({ user, category: incidentCategory})))
          .then(respond({ error: "NOT_FOUND" }))
          .named("no-topic"),
    ),
    {validators: {input: textInput}}
)

export const UnplacePoint = endpoint(
  "/point/unplace",
  ({session, user, cue}) =>
  receive({session, cue})
    .then(Sessioning.use({session}).responds({subject: user}))
    .then(
      where(ownsPoint({user, cue}), Categorizing._category({item: cue}))
        .then(Categorizing.unplace({item: cue}).responds({}))
        .then(respond({cue}))
        .named("creator"),
      where(ownsPoint({user, cue}), no(Categorizing._category({item: cue})))
        .then(respond({cue}))
        .named("unsorted"),
      where(no(ownsPoint({user, cue})))
        .then(respond({error: "NOT_FOUND"}))
        .named("refused"),
    ),
    {validators: {input: textInput}}
)

export const composition = {
  deleting: {DeletePoint, UnplaceDeleted},
  creating: {CreatePoint,CreateAndPlace},
  renaming: {RenamePoint},
  moving: {MovePoint, UnplacePoint}
}
