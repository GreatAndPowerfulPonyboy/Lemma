import {endpoint, receive, respond } from "@mit-sdg/sync-engine/boundary";
import {no, where} from "@mit-sdg/sync-engine/language";
import {concepts} from "../concepts.ts";
import {ownsTopic} from "./access.ts";
import { textInput } from "./reusable/inputs.ts";

const {Categorizing,Sessioning} = concepts;


export const CreateTopic = endpoint(
  "/topic/create",
  ({ session, name, user, category }) =>
    receive({ session, name})
    .then(Sessioning.use({session}).responds({ subject: user}))
    .then(Categorizing.create({ creator: user, name: name}).responds({category}))
    .then(respond({ category })),
    { validators: { input: textInput}},
);


export const RenameTopic = endpoint(
  "/topic/rename",
  ({session, user, newName, category}) =>
    receive( {session, newName, category})
      .then(Sessioning.use({session}).responds({ subject: user}))
      .then
      (
        where(ownsTopic({user, category}))
          .then(Categorizing.rename({category: category, name: newName}).responds({}))
          .then(respond({ category }))
          .named("creator"),
        where(no(ownsTopic({ user, category})))
          .then(respond({ error: "NOT_FOUND"}))
          .named("refused"),
        ),
      {validators: {input: textInput}},
)

export const DeleteTopic = endpoint(
  "/topic/delete",
  ({session, user, category}) =>
  receive({session, category })
  .then(Sessioning.use({session}).responds({ subject: user}))
  .then(
    where(ownsTopic({user, category}))
      .then(Categorizing.delete({category}).responds({}))
      .then(respond({category}))
      .named("creator"),
    where(no(ownsTopic({user, category})))
      .then(respond({ error: "NOT_FOUND"}))
      .named("refused"),
  ), 
    {validators: {input: textInput}}
)

export const composition = {
  creating: {CreateTopic},
  renaming: {RenameTopic},
  deleting: {DeleteTopic}
}
