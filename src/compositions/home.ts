import {endpoint, receive, respond} from "@mit-sdg/sync-engine/boundary";
import {each, former, no, whether} from "@mit-sdg/sync-engine/language";
import {concepts} from "../concepts.ts";
import {ownsPoint, ownsTopic} from "./access.ts";
import {textInput} from "./reusable/inputs.ts";

const {Sessioning, Cueing, Categorizing} = concepts;


/** The points that a user owns, newest first, with the category that they belong to */

const myPoints = former(
  "the points (user) owns",
  ({user}, {category,cue, name }) =>
    each(Cueing._cues({creator: user}).is({cue, name}))
      .where(
        ownsPoint({user, cue}),
        whether(Categorizing._category({item:cue}).is({category}))
      )
      .form({cue, name, category})
);

/** The topics that a user owns */
const myTopics = former(
  "the topics (user) owns",
  ({user}, {category, name, }) =>
    each(Categorizing._categories({creator: user}).is({category, name}))
    .form({category, name})
);

const ShowHome = endpoint(
  "/home",
  ({session, user}) =>
    receive({session})
      .then(Sessioning.use({session}).responds({ subject: user}))
      .then(
        respond({
          myPoints: myPoints({user}),
          myTopics: myTopics({user})
        }),
      ),
      {validators: { input: textInput}},
);

export const composition = {
  showing: {ShowHome, myPoints, myTopics}
}
