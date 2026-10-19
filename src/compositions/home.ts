import {endpoint, receive, respond} from "@mit-sdg/sync-engine/boundary";
import {each, former, no, whether} from "@mit-sdg/sync-engine/language";
import {concepts} from "../concepts.ts";
import {ownsPoint, ownsTopic} from "./access.ts";
import {currentAttemptOf} from "./checks.ts";
import {textInput} from "./reusable/inputs.ts";

const {Sessioning, Cueing, Categorizing, RecallChecking} = concepts;


/** The points that a user owns, newest first, with the category that they belong to */

const myPoints = former(
  "the points (user) owns",
  ({user}, {category,cue, pointName , topicName}) =>
    each(Cueing._cues({creator: user}).is({cue, name: pointName}))
      .where(
        ownsPoint({user, cue}),
        whether(Categorizing._category({item:cue}).is({category})),
        whether(Categorizing._get({category}).is({name: topicName}))
          
      )
      .form({cue, pointName, category, topicName})
);

/** The topics that a user owns */
const myTopics = former(
  "the topics (user) owns",
  ({user}, {category, name, }) =>
    each(Categorizing._categories({creator: user}).is({category, name}))
    .form({category, name})
);

/** The checks that a user owns, newest first, each with its unfinished attempt so it can be resumed; both fields are null when it has none */
const myChecks = former(
  "the checks (user) owns",
  ({user}, {check, name}) =>
    each(RecallChecking._checks({owner: user}).is({check, name}))
    .form({check, name, current: whether(currentAttemptOf({check}))})
);

const ShowHome = endpoint(
  "/home",
  ({session, user}) =>
    receive({session})
      .then(Sessioning.use({session}).responds({ subject: user}))
      .then(
        respond({
          myPoints: myPoints({user}),
          myTopics: myTopics({user}),
          myChecks: myChecks({user})
        }),
      ),
      {validators: { input: textInput}},
);

export const composition = {
  showing: {ShowHome, myPoints, myTopics, myChecks}
}
