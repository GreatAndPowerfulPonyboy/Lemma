import {endpoint, receive, respond} from "@mit-sdg/sync-engine/boundary";
import {each, former, no, reaction, when, where} from "@mit-sdg/sync-engine/language";
import {concepts} from "../concepts.ts";
import {ownsCheck, sharedWith} from "./access.ts";
import {textInput} from "./reusable/inputs.ts";

const {Registering, RecallChecking, Sessioning, Sharing} = concepts;

/** Sharing with someone it's already shared with succeeds quietly. The owner's own username and unknown usernames are refused. */
export const ShareCheck = endpoint(
  "/check/share",
  ({session, user, check, username, recipient}) =>
    receive({session, check, username})
      .then(Sessioning.use({session}).responds({subject: user}))
      .then(
        where(
          ownsCheck({user, check}),
          Registering._byUsername({username}).is({user: recipient}),
          no(Registering._byUsername({username}).is({user})),
          no(Sharing._recipients({item: check}).is({recipient})),
        )
          .then(Sharing.share({item: check, recipient}).responds({}))
          .then(respond({check}))
          .named("owner"),
        where(
          ownsCheck({user, check}),
          Registering._byUsername({username}).is({user: recipient}),
          Sharing._recipients({item: check}).is({recipient}),
        )
          .then(respond({check}))
          .named("shared"),
        where(ownsCheck({user, check}), Registering._byUsername({username}).is({user}))
          .then(respond({error: "SHARE_WITH_SELF"}))
          .named("self"),
        where(ownsCheck({user, check}), no(Registering._byUsername({username})))
          .then(respond({error: "NO_SUCH_USER"}))
          .named("no-user"),
        where(no(ownsCheck({user, check})))
          .then(respond({error: "NOT_FOUND"}))
          .named("refused"),
      ),
  {validators: {input: textInput}},
);

/** Unsharing with someone it isn't shared with, or with an unknown username, succeeds quietly. */
export const UnshareCheck = endpoint(
  "/check/unshare",
  ({session, user, check, username, recipient}) =>
    receive({session, check, username})
      .then(Sessioning.use({session}).responds({subject: user}))
      .then(
        where(
          ownsCheck({user, check}),
          Registering._byUsername({username}).is({user: recipient}),
          Sharing._recipients({item: check}).is({recipient}),
        )
          .then(Sharing.revoke({item: check, recipient}).responds({}))
          .then(respond({check}))
          .named("owner"),
        where(
          ownsCheck({user, check}),
          Registering._byUsername({username}).is({user: recipient}),
          no(Sharing._recipients({item: check}).is({recipient})),
        )
          .then(respond({check}))
          .named("not-shared"),
        where(ownsCheck({user, check}), no(Registering._byUsername({username})))
          .then(respond({check}))
          .named("no-user"),
        where(no(ownsCheck({user, check})))
          .then(respond({error: "NOT_FOUND"}))
          .named("refused"),
      ),
  {validators: {input: textInput}},
);

/** A recipient takes a prompt off their Shared tab by revoking their own share. Their copies are their own and stay. */
export const DismissShared = endpoint(
  "/shared/dismiss",
  ({session, user, check}) =>
    receive({session, check})
      .then(Sessioning.use({session}).responds({subject: user}))
      .then(
        where(sharedWith({user, check}))
          .then(Sharing.revoke({item: check, recipient: user}).responds({}))
          .then(respond({check}))
          .named("recipient"),
        where(no(sharedWith({user, check})))
          .then(respond({error: "NOT_FOUND"}))
          .named("refused"),
      ),
  {validators: {input: textInput}},
);

/** The usernames a check is shared with, in the order it was shared with them. */
export const recipientsOf = former(
  "the recipients of (check)",
  ({check}, {recipient, username}) =>
    each(Sharing._recipients({item: check}).is({recipient}))
      .where(Registering._username({user: recipient}).is({username}))
      .form({username}),
);

/** The checks shared with a user, each with its owner's username. Checks deleted since are left out. */
const sharedWithMe = former(
  "the checks shared with (user)",
  ({user}, {check, name, owner, ownerUsername}) =>
    each(Sharing._sharedWith({recipient: user}).is({item: check}))
      .where(
        RecallChecking._get({check}).is({owner, name}),
        Registering._username({user: owner}).is({username: ownerUsername}),
      )
      .form({check, name, ownerUsername}),
);

/** The names of a shared check's points, in the order they were included. */
const sharedPoints = former(
  "the points of shared (check)",
  ({check}, {pointName}) =>
    each(RecallChecking._subject({check}).is({name: pointName}))
      .form({pointName}),
);

const ShowShared = endpoint(
  "/shared",
  ({session, user}) =>
    receive({session})
      .then(Sessioning.use({session}).responds({subject: user}))
      .then(respond({shared: sharedWithMe({user})})),
  {validators: {input: textInput}},
);

const ShowSharedCheck = endpoint(
  "/shared/show",
  ({session, user, check, name, owner, ownerUsername}) =>
    receive({session, check})
      .then(Sessioning.use({session}).responds({subject: user}))
      .then(
        where(
          sharedWith({user, check}),
          RecallChecking._get({check}).is({owner, name}),
          Registering._username({user: owner}).is({username: ownerUsername}),
        )
          .then(respond({name, ownerUsername, points: sharedPoints({check})}))
          .named("recipient"),
        where(no(sharedWith({user, check})))
          .then(respond({error: "NOT_FOUND"}))
          .named("refused"),
      ),
  {validators: {input: textInput}},
);

/** A deleted check stops being shared with anyone. */
const RevokeDeleted = reaction(({check, recipient}) =>
  when(RecallChecking.delete({check}).responds({}))
    .where(Sharing._recipients({item: check}).is({recipient}))
    .then(Sharing.revoke({item: check, recipient})),
);

export const composition = {
  sharing: {ShareCheck, UnshareCheck, DismissShared},
  showing: {ShowShared, ShowSharedCheck, recipientsOf, sharedWithMe, sharedPoints},
  revoking: {RevokeDeleted},
};
