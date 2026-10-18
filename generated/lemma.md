<!-- Generated from the Lemma assembly. Do not edit. -->
<!-- Manifest producer: @mit-sdg/sync-engine@1.1.0; concept specification: sync-engine.concept-specification@1; renderer: @mit-sdg/sync-engine@1.1.0. -->

# Lemma — assembled read-back

_Assembled by sync-engine from registered concepts and composition. Edit the concept_
_specifications and composition source, then regenerate this file._

## Concepts

### Authenticating

Defined in [Authenticating](../design/concepts/Authenticating.md), line 1.

#### Actions

- `set(user: User, password: String) : returns (user: User)`
  - Refuses `INVALID_PASSWORD`: A password must have 8 to 128 characters.
  - Refuses `PASSWORD_SET`: This account already has a password.
- `authenticate(user: User, password: String) : returns (user: User)`
  - Refuses `INVALID_CREDENTIALS`: The username or password is incorrect.

#### Queries

- `_acceptable(password: String) : one (acceptable: Flag)`

#### Instances

- `Authenticating` — instance of `Authenticating` — [Lemma types](../design/types.md), line 19.
  - `User` is `Registering.User` — [Lemma types](../design/types.md), line 20.

### Categorizing

Defined in [Categorizing](../design/concepts/Categorizing.md), line 1.

#### Actions

- `create(creator: User, name: String) : returns (category: Category)`
  - Refuses `INVALID_CATEGORY`: A category name must have 1 to 80 characters.
  - Refuses `CATEGORY_EXISTS`: You already have a category with that name.
- `rename(category: Category, name: String) : returns (category: Category)`
  - Refuses `CATEGORY_NOT_FOUND`: There is no such category.
  - Refuses `INVALID_CATEGORY`: A category name must have 1 to 80 characters.
  - Refuses `CATEGORY_EXISTS`: You already have a category with that name.
- `delete(category: Category) : returns (category: Category)`
  - Refuses `CATEGORY_NOT_FOUND`: There is no such category.
  - Refuses `CATEGORY_NOT_EMPTY`: Move or delete this category's items before deleting it.
- `place(item: Item, category: Category) : returns (item: Item)`
  - Refuses `CATEGORY_NOT_FOUND`: There is no such category.
- `unplace(item: Item) : returns (item: Item)`
  - Refuses `NOT_PLACED`: That item is not in a category.

#### Queries

- `_categories(creator: User) : many (category: Category, name: String)`
- `_get(category: Category) : optional (creator: User, name: String)`
- `_items(category: Category) : many (item: Item)`
- `_category(item: Item) : optional (category: Category)`

#### Instances

- `Categorizing` — instance of `Categorizing` — [Lemma types](../design/types.md), line 15.
  - `Item` is `Cueing.Cue` — [Lemma types](../design/types.md), line 17.
  - `User` is `Registering.User` — [Lemma types](../design/types.md), line 16.

### Cueing

Defined in [Cueing](../design/concepts/Cueing.md), line 1.

#### Actions

- `create(creator: User, name: String) : returns (cue: Cue)`
  - Refuses `INVALID_NAME`: A name must have 1 to 80 characters.
- `rename(cue: Cue, name: String) : returns (cue: Cue)`
  - Refuses `CUE_NOT_FOUND`: Cue does not exist.
  - Refuses `INVALID_NAME`: A name must have 1 to 80 characters.
- `delete(cue: Cue) : returns (cue: Cue)`
  - Refuses `CUE_NOT_FOUND`: Cue does not exist.

#### Queries

- `_cues(creator: User) : many (cue: Cue, name: String)`
- `_search(creator: User, text: String) : many (cue: Cue, name: String)`
- `_get(cue: Cue) : optional (creator: User, name: String)`

#### Instances

- `Cueing` — instance of `Cueing` — [Lemma types](../design/types.md), line 12.
  - `User` is `Registering.User` — [Lemma types](../design/types.md), line 13.

### Registering

Defined in [Registering](../design/concepts/Registering.md), line 1.

#### Actions

- `register(username: String) : returns (user: User)`
  - Refuses `INVALID_USERNAME`: A username must have 3 to 32 letters, digits, underscores, or hyphens.
  - Refuses `USERNAME_TAKEN`: That username is taken.

#### Queries

- `_byUsername(username: String) : optional (user: User)`
- `_username(user: User) : optional (username: String)`

#### Instances

- `Registering` — instance of `Registering` — [Lemma types](../design/types.md), line 10.

### Sessioning

Defined in [Sessioning](../design/concepts/Sessioning.md), line 1.

#### Actions

- `start(subject: Subject) : returns (session: Session, expiresAt: DateTime)`
- `use(session: Session) : returns (subject: Subject)`
  - Refuses `NOT_SIGNED_IN`: Your session has ended. Sign in again.
- `end(session: Session) : returns (session: Session)`
  - Refuses `NOT_SIGNED_IN`: Your session has ended. Sign in again.

#### Instances

- `Sessioning` — instance of `Sessioning` — [Lemma types](../design/types.md), line 22.
  - `Subject` is `Registering.User` — [Lemma types](../design/types.md), line 23.

## Views

_Views name reusable conditions. Multiple `where` blocks are alternatives._

### (user) owns point (cue)

Authored path: `access.permissions.ownsPoint`.
- Covered by [Access](../design/compositions/access.md), line 3.
- Covered by [Home](../design/compositions/home.md), line 2.
- Covered by [Points](../design/compositions/points.md), line 10.
- Covered by [Points](../design/compositions/points.md), line 16.
- Covered by [Points](../design/compositions/points.md), line 24.

```view
(user) owns point (cue) — inputs (user, cue); outputs (); bindings ()
  where Cueing._get (cue) has (creator: user)
```

### (user) owns topic (category)

Authored path: `access.permissions.ownsTopic`.
- Covered by [Access](../design/compositions/access.md), line 3.
- Covered by [Home](../design/compositions/home.md), line 7.
- Covered by [Points](../design/compositions/points.md), line 5.
- Covered by [Points](../design/compositions/points.md), line 24.
- Covered by [Topics](../design/compositions/topics.md), line 10.
- Covered by [Topics](../design/compositions/topics.md), line 16.

```view
(user) owns topic (category) — inputs (user, category); outputs (); bindings ()
  where Categorizing._get (category) has (creator: user)
```

## Formers

_Formers name result shapes evaluated when asked. The source former owns_
_the authored explanation; this section records the generated shape._

### the points (user) owns

Authored path: `home.showing.myPoints`.
- Covered by [Home](../design/compositions/home.md), line 5.

```former
Former "the points (user) owns" — inputs (user); bindings (category, cue, name); promises exactly one record — forms:
  each Cueing._cues (creator: user) has (cue, name)
    where view "(user) owns point (cue)" with (cue, user)
    where whether Categorizing._category (item: cue) has (category)
    form a record of
      category
      cue
      name
```

### the topics (user) owns

Authored path: `home.showing.myTopics`.
- Covered by [Home](../design/compositions/home.md), line 7.

```former
Former "the topics (user) owns" — inputs (user); bindings (category, name); promises exactly one record — forms:
  each Categorizing._categories (creator: user) has (category, name)
    form a record of
      category
      name
```

## Reactions

### DeliverFaultToAsker

```reaction
when any action is faulted, not asked by DeliverFaultToAsker
where
  earlier, RequestBoundary.request (requestId)
then
  RequestBoundary.respondFramework (error: "INTERNAL_ERROR", requestId)
```

### DeliverRefusalToAsker

```reaction
when any action is refused (message), except RequestBoundary
where
  earlier, RequestBoundary.request (requestId)
then
  RequestBoundary.respond (error: message, requestId)
```

### home.showing.ShowHome

Authored path: `home.showing.ShowHome`.
- Covered by [Home](../design/compositions/home.md), line 3.
- Covered by [Home](../design/compositions/home.md), line 11.

```reaction
when RequestBoundary.request (path: "/home", requestId, session)
then
  Sessioning.use (session)
```

### home.showing.ShowHome#2

Authored path: `home.showing.ShowHome`.
- Covered by [Home](../design/compositions/home.md), line 3.
- Covered by [Home](../design/compositions/home.md), line 11.

```reaction
when Sessioning.use (session, subject: user), asked by home.showing.ShowHome
where
  earlier, RequestBoundary.request (path: "/home", requestId, session)
then
  RequestBoundary.respond (myPoints: former "the points (user) owns" with (user), myTopics: former "the topics (user) owns" with (user), requestId)
```

### points.creating.CreateAndPlace

Authored path: `points.creating.CreateAndPlace`.
- Covered by [Points](../design/compositions/points.md), line 5.
- Covered by [Points](../design/compositions/points.md), line 8.

```reaction
when RequestBoundary.request (category, name, path: "/point/createIn", requestId, session)
then
  Sessioning.use (session)
```

### points.creating.CreateAndPlace:creator#2

Authored path: `points.creating.CreateAndPlace`.
- Covered by [Points](../design/compositions/points.md), line 5.
- Covered by [Points](../design/compositions/points.md), line 8.

```reaction
when Sessioning.use (session, subject: user), asked by points.creating.CreateAndPlace
where
  earlier, RequestBoundary.request (category, name, path: "/point/createIn", requestId, session)
  view "(user) owns topic (category)" with (category, user)
then
  Cueing.create (creator: user, name)
```

### points.creating.CreateAndPlace:creator#3

Authored path: `points.creating.CreateAndPlace`.
- Covered by [Points](../design/compositions/points.md), line 5.
- Covered by [Points](../design/compositions/points.md), line 8.

```reaction
when Cueing.create (creator: user, name, cue), asked by points.creating.CreateAndPlace:creator#2
where
  earlier, RequestBoundary.request (category, name, path: "/point/createIn", requestId, session)
then
  Categorizing.place (category, item: cue)
```

### points.creating.CreateAndPlace:creator#4

Authored path: `points.creating.CreateAndPlace`.
- Covered by [Points](../design/compositions/points.md), line 5.
- Covered by [Points](../design/compositions/points.md), line 8.

```reaction
when Categorizing.place (category, item: cue), asked by points.creating.CreateAndPlace:creator#3
where
  earlier, RequestBoundary.request (category, name, path: "/point/createIn", requestId, session)
then
  RequestBoundary.respond (cue, requestId)
```

### points.creating.CreateAndPlace:refused#2

Authored path: `points.creating.CreateAndPlace`.
- Covered by [Points](../design/compositions/points.md), line 5.
- Covered by [Points](../design/compositions/points.md), line 8.

```reaction
when Sessioning.use (session, subject: user), asked by points.creating.CreateAndPlace
where
  earlier, RequestBoundary.request (category, name, path: "/point/createIn", requestId, session)
  no view "(user) owns topic (category)" with (category, user)
then
  RequestBoundary.respond (error: "NOT_FOUND", requestId)
```

### points.creating.CreatePoint

Authored path: `points.creating.CreatePoint`.
- Covered by [Points](../design/compositions/points.md), line 4.
- Covered by [Points](../design/compositions/points.md), line 7.

```reaction
when RequestBoundary.request (name, path: "/point/create", requestId, session)
then
  Sessioning.use (session)
```

### points.creating.CreatePoint#2

Authored path: `points.creating.CreatePoint`.
- Covered by [Points](../design/compositions/points.md), line 4.
- Covered by [Points](../design/compositions/points.md), line 7.

```reaction
when Sessioning.use (session, subject: user), asked by points.creating.CreatePoint
where
  earlier, RequestBoundary.request (name, path: "/point/create", requestId, session)
then
  Cueing.create (creator: user, name)
```

### points.creating.CreatePoint#3

Authored path: `points.creating.CreatePoint`.
- Covered by [Points](../design/compositions/points.md), line 4.
- Covered by [Points](../design/compositions/points.md), line 7.

```reaction
when Cueing.create (creator: user, name, cue), asked by points.creating.CreatePoint#2
where
  earlier, RequestBoundary.request (name, path: "/point/create", requestId, session)
then
  RequestBoundary.respond (cue, requestId)
```

### points.deleting.DeletePoint

Authored path: `points.deleting.DeletePoint`.
- Covered by [Points](../design/compositions/points.md), line 16.
- Covered by [Points](../design/compositions/points.md), line 21.

```reaction
when RequestBoundary.request (cue, path: "/point/delete", requestId, session)
then
  Sessioning.use (session)
```

### points.deleting.DeletePoint:creator#2

Authored path: `points.deleting.DeletePoint`.
- Covered by [Points](../design/compositions/points.md), line 16.
- Covered by [Points](../design/compositions/points.md), line 21.

```reaction
when Sessioning.use (session, subject: user), asked by points.deleting.DeletePoint
where
  earlier, RequestBoundary.request (cue, path: "/point/delete", requestId, session)
  view "(user) owns point (cue)" with (cue, user)
then
  Cueing.delete (cue)
```

### points.deleting.DeletePoint:creator#3

Authored path: `points.deleting.DeletePoint`.
- Covered by [Points](../design/compositions/points.md), line 16.
- Covered by [Points](../design/compositions/points.md), line 21.

```reaction
when Cueing.delete (cue), asked by points.deleting.DeletePoint:creator#2
where
  earlier, RequestBoundary.request (cue, path: "/point/delete", requestId, session)
then
  RequestBoundary.respond (cue, requestId)
```

### points.deleting.DeletePoint:refused#2

Authored path: `points.deleting.DeletePoint`.
- Covered by [Points](../design/compositions/points.md), line 16.
- Covered by [Points](../design/compositions/points.md), line 21.

```reaction
when Sessioning.use (session, subject: user), asked by points.deleting.DeletePoint
where
  earlier, RequestBoundary.request (cue, path: "/point/delete", requestId, session)
  no view "(user) owns point (cue)" with (cue, user)
then
  RequestBoundary.respond (error: "NOT_FOUND", requestId)
```

### points.deleting.UnplaceDeleted

Authored path: `points.deleting.UnplaceDeleted`.
- Covered by [Points](../design/compositions/points.md), line 16.
- Covered by [Topics](../design/compositions/topics.md), line 22.

```reaction
when Cueing.delete (cue)
where
  Categorizing._category (item: cue)
then
  Categorizing.unplace (item: cue)
```

### points.moving.MovePoint

Authored path: `points.moving.MovePoint`.
- Covered by [Points](../design/compositions/points.md), line 24.
- Covered by [Points](../design/compositions/points.md), line 27.

```reaction
when RequestBoundary.request (cue, incidentCategory, path: "/point/move", requestId, session)
then
  Sessioning.use (session)
```

### points.moving.MovePoint:creator#2

Authored path: `points.moving.MovePoint`.
- Covered by [Points](../design/compositions/points.md), line 24.
- Covered by [Points](../design/compositions/points.md), line 27.

```reaction
when Sessioning.use (session, subject: user), asked by points.moving.MovePoint
where
  earlier, RequestBoundary.request (cue, incidentCategory, path: "/point/move", requestId, session)
  view "(user) owns point (cue)" with (cue, user)
  view "(user) owns topic (category)" with (category: incidentCategory, user)
then
  Categorizing.place (category: incidentCategory, item: cue)
```

### points.moving.MovePoint:creator#3

Authored path: `points.moving.MovePoint`.
- Covered by [Points](../design/compositions/points.md), line 24.
- Covered by [Points](../design/compositions/points.md), line 27.

```reaction
when Categorizing.place (category: incidentCategory, item: cue), asked by points.moving.MovePoint:creator#2
where
  earlier, RequestBoundary.request (cue, incidentCategory, path: "/point/move", requestId, session)
then
  RequestBoundary.respond (cue, requestId)
```

### points.moving.MovePoint:no-point#2

Authored path: `points.moving.MovePoint`.
- Covered by [Points](../design/compositions/points.md), line 24.
- Covered by [Points](../design/compositions/points.md), line 27.

```reaction
when Sessioning.use (session, subject: user), asked by points.moving.MovePoint
where
  earlier, RequestBoundary.request (cue, incidentCategory, path: "/point/move", requestId, session)
  no view "(user) owns point (cue)" with (cue, user)
then
  RequestBoundary.respond (error: "NOT_FOUND", requestId)
```

### points.moving.MovePoint:no-topic#2

Authored path: `points.moving.MovePoint`.
- Covered by [Points](../design/compositions/points.md), line 24.
- Covered by [Points](../design/compositions/points.md), line 27.

```reaction
when Sessioning.use (session, subject: user), asked by points.moving.MovePoint
where
  earlier, RequestBoundary.request (cue, incidentCategory, path: "/point/move", requestId, session)
  view "(user) owns point (cue)" with (cue, user)
  no view "(user) owns topic (category)" with (category: incidentCategory, user)
then
  RequestBoundary.respond (error: "NOT_FOUND", requestId)
```

### points.renaming.RenamePoint

Authored path: `points.renaming.RenamePoint`.
- Covered by [Points](../design/compositions/points.md), line 10.
- Covered by [Points](../design/compositions/points.md), line 13.

```reaction
when RequestBoundary.request (cue, name, path: "/point/rename", requestId, session)
then
  Sessioning.use (session)
```

### points.renaming.RenamePoint:creator#2

Authored path: `points.renaming.RenamePoint`.
- Covered by [Points](../design/compositions/points.md), line 10.
- Covered by [Points](../design/compositions/points.md), line 13.

```reaction
when Sessioning.use (session, subject: user), asked by points.renaming.RenamePoint
where
  earlier, RequestBoundary.request (cue, name, path: "/point/rename", requestId, session)
  view "(user) owns point (cue)" with (cue, user)
then
  Cueing.rename (cue, name)
```

### points.renaming.RenamePoint:creator#3

Authored path: `points.renaming.RenamePoint`.
- Covered by [Points](../design/compositions/points.md), line 10.
- Covered by [Points](../design/compositions/points.md), line 13.

```reaction
when Cueing.rename (cue, name), asked by points.renaming.RenamePoint:creator#2
where
  earlier, RequestBoundary.request (cue, name, path: "/point/rename", requestId, session)
then
  RequestBoundary.respond (cue, requestId)
```

### points.renaming.RenamePoint:refused#2

Authored path: `points.renaming.RenamePoint`.
- Covered by [Points](../design/compositions/points.md), line 10.
- Covered by [Points](../design/compositions/points.md), line 13.

```reaction
when Sessioning.use (session, subject: user), asked by points.renaming.RenamePoint
where
  earlier, RequestBoundary.request (cue, name, path: "/point/rename", requestId, session)
  no view "(user) owns point (cue)" with (cue, user)
then
  RequestBoundary.respond (error: "NOT_FOUND", requestId)
```

### reusable.accounts.identifying.Me

Authored path: `reusable.accounts.identifying.Me`.
- Covered by [Accounts](../design/compositions/reusable/accounts.md), line 5.
- Covered by [Accounts](../design/compositions/reusable/accounts.md), line 8.

```reaction
when RequestBoundary.request (path: "/auth/me", requestId, session)
then
  Sessioning.use (session)
```

### reusable.accounts.identifying.Me#2

Authored path: `reusable.accounts.identifying.Me`.
- Covered by [Accounts](../design/compositions/reusable/accounts.md), line 5.
- Covered by [Accounts](../design/compositions/reusable/accounts.md), line 8.

```reaction
when Sessioning.use (session, subject: user), asked by reusable.accounts.identifying.Me
where
  Registering._username (user) has (username)
  earlier, RequestBoundary.request (path: "/auth/me", requestId, session)
then
  RequestBoundary.respond (requestId, username)
```

### reusable.accounts.leaving.SignOut

Authored path: `reusable.accounts.leaving.SignOut`.
- Covered by [Accounts](../design/compositions/reusable/accounts.md), line 11.
- Covered by [Accounts](../design/compositions/reusable/accounts.md), line 14.

```reaction
when RequestBoundary.request (path: "/auth/logout", requestId, session)
then
  Sessioning.end (session)
```

### reusable.accounts.leaving.SignOut#2

Authored path: `reusable.accounts.leaving.SignOut`.
- Covered by [Accounts](../design/compositions/reusable/accounts.md), line 11.
- Covered by [Accounts](../design/compositions/reusable/accounts.md), line 14.

```reaction
when Sessioning.end (session), asked by reusable.accounts.leaving.SignOut
where
  earlier, RequestBoundary.request (path: "/auth/logout", requestId, session)
then
  RequestBoundary.respond (requestId)
```

### reusable.passwords.entering.Register:accepted

Authored path: `reusable.passwords.entering.Register`.
- Covered by [Passwords](../design/compositions/reusable/passwords.md), line 5.
- Covered by [Passwords](../design/compositions/reusable/passwords.md), line 12.

```reaction
when RequestBoundary.request (password, path: "/auth/register", requestId, username)
where
  Authenticating._acceptable (password) has (acceptable: true)
then
  Registering.register (username)
```

### reusable.passwords.entering.Register:accepted#2

Authored path: `reusable.passwords.entering.Register`.
- Covered by [Passwords](../design/compositions/reusable/passwords.md), line 5.
- Covered by [Passwords](../design/compositions/reusable/passwords.md), line 12.

```reaction
when Registering.register (username, user), asked by reusable.passwords.entering.Register:accepted
where
  earlier, RequestBoundary.request (password, path: "/auth/register", requestId, username)
then
  Authenticating.set (password, user)
```

### reusable.passwords.entering.Register:accepted#3

Authored path: `reusable.passwords.entering.Register`.
- Covered by [Passwords](../design/compositions/reusable/passwords.md), line 5.
- Covered by [Passwords](../design/compositions/reusable/passwords.md), line 12.

```reaction
when Authenticating.set (password, user), asked by reusable.passwords.entering.Register:accepted#2
then
  Sessioning.start (subject: user)
```

### reusable.passwords.entering.Register:accepted#4

Authored path: `reusable.passwords.entering.Register`.
- Covered by [Passwords](../design/compositions/reusable/passwords.md), line 5.
- Covered by [Passwords](../design/compositions/reusable/passwords.md), line 12.

```reaction
when Sessioning.start (subject: user, expiresAt, session), asked by reusable.passwords.entering.Register:accepted#3
where
  earlier, RequestBoundary.request (password, path: "/auth/register", requestId, username)
then
  RequestBoundary.respond (expiresAt, requestId, session, user)
```

### reusable.passwords.entering.Register:refused

Authored path: `reusable.passwords.entering.Register`.
- Covered by [Passwords](../design/compositions/reusable/passwords.md), line 5.
- Covered by [Passwords](../design/compositions/reusable/passwords.md), line 12.

```reaction
when RequestBoundary.request (password, path: "/auth/register", requestId, username)
where
  Authenticating._acceptable (password) has (acceptable: false)
then
  RequestBoundary.respond (error: "INVALID_PASSWORD", requestId)
```

### reusable.passwords.entering.SignIn:known

Authored path: `reusable.passwords.entering.SignIn`.
- Covered by [Passwords](../design/compositions/reusable/passwords.md), line 7.
- Covered by [Passwords](../design/compositions/reusable/passwords.md), line 13.

```reaction
when RequestBoundary.request (password, path: "/auth/login", requestId, username)
where
  Registering._byUsername (username) has (user)
then
  Authenticating.authenticate (password, user)
```

### reusable.passwords.entering.SignIn:known#2

Authored path: `reusable.passwords.entering.SignIn`.
- Covered by [Passwords](../design/compositions/reusable/passwords.md), line 7.
- Covered by [Passwords](../design/compositions/reusable/passwords.md), line 13.

```reaction
when Authenticating.authenticate (password, user), asked by reusable.passwords.entering.SignIn:known
then
  Sessioning.start (subject: user)
```

### reusable.passwords.entering.SignIn:known#3

Authored path: `reusable.passwords.entering.SignIn`.
- Covered by [Passwords](../design/compositions/reusable/passwords.md), line 7.
- Covered by [Passwords](../design/compositions/reusable/passwords.md), line 13.

```reaction
when Sessioning.start (subject: user, expiresAt, session), asked by reusable.passwords.entering.SignIn:known#2
where
  earlier, RequestBoundary.request (password, path: "/auth/login", requestId, username)
then
  RequestBoundary.respond (expiresAt, requestId, session, user)
```

### reusable.passwords.entering.SignIn:unknown

Authored path: `reusable.passwords.entering.SignIn`.
- Covered by [Passwords](../design/compositions/reusable/passwords.md), line 7.
- Covered by [Passwords](../design/compositions/reusable/passwords.md), line 13.

```reaction
when RequestBoundary.request (password, path: "/auth/login", requestId, username)
where
  no Registering._byUsername (username)
then
  RequestBoundary.respond (error: "INVALID_CREDENTIALS", requestId)
```

### topics.creating.CreateTopic

Authored path: `topics.creating.CreateTopic`.
- Covered by [Topics](../design/compositions/topics.md), line 4.
- Covered by [Topics](../design/compositions/topics.md), line 7.

```reaction
when RequestBoundary.request (name, path: "/topic/create", requestId, session)
then
  Sessioning.use (session)
```

### topics.creating.CreateTopic#2

Authored path: `topics.creating.CreateTopic`.
- Covered by [Topics](../design/compositions/topics.md), line 4.
- Covered by [Topics](../design/compositions/topics.md), line 7.

```reaction
when Sessioning.use (session, subject: user), asked by topics.creating.CreateTopic
where
  earlier, RequestBoundary.request (name, path: "/topic/create", requestId, session)
then
  Categorizing.create (creator: user, name)
```

### topics.creating.CreateTopic#3

Authored path: `topics.creating.CreateTopic`.
- Covered by [Topics](../design/compositions/topics.md), line 4.
- Covered by [Topics](../design/compositions/topics.md), line 7.

```reaction
when Categorizing.create (creator: user, name, category), asked by topics.creating.CreateTopic#2
where
  earlier, RequestBoundary.request (name, path: "/topic/create", requestId, session)
then
  RequestBoundary.respond (category, requestId)
```

### topics.deleting.DeleteTopic

Authored path: `topics.deleting.DeleteTopic`.
- Covered by [Topics](../design/compositions/topics.md), line 16.
- Covered by [Topics](../design/compositions/topics.md), line 19.

```reaction
when RequestBoundary.request (category, path: "/topic/delete", requestId, session)
then
  Sessioning.use (session)
```

### topics.deleting.DeleteTopic:creator#2

Authored path: `topics.deleting.DeleteTopic`.
- Covered by [Topics](../design/compositions/topics.md), line 16.
- Covered by [Topics](../design/compositions/topics.md), line 19.

```reaction
when Sessioning.use (session, subject: user), asked by topics.deleting.DeleteTopic
where
  earlier, RequestBoundary.request (category, path: "/topic/delete", requestId, session)
  view "(user) owns topic (category)" with (category, user)
then
  Categorizing.delete (category)
```

### topics.deleting.DeleteTopic:creator#3

Authored path: `topics.deleting.DeleteTopic`.
- Covered by [Topics](../design/compositions/topics.md), line 16.
- Covered by [Topics](../design/compositions/topics.md), line 19.

```reaction
when Categorizing.delete (category), asked by topics.deleting.DeleteTopic:creator#2
where
  earlier, RequestBoundary.request (category, path: "/topic/delete", requestId, session)
then
  RequestBoundary.respond (category, requestId)
```

### topics.deleting.DeleteTopic:refused#2

Authored path: `topics.deleting.DeleteTopic`.
- Covered by [Topics](../design/compositions/topics.md), line 16.
- Covered by [Topics](../design/compositions/topics.md), line 19.

```reaction
when Sessioning.use (session, subject: user), asked by topics.deleting.DeleteTopic
where
  earlier, RequestBoundary.request (category, path: "/topic/delete", requestId, session)
  no view "(user) owns topic (category)" with (category, user)
then
  RequestBoundary.respond (error: "NOT_FOUND", requestId)
```

### topics.renaming.RenameTopic

Authored path: `topics.renaming.RenameTopic`.
- Covered by [Topics](../design/compositions/topics.md), line 10.
- Covered by [Topics](../design/compositions/topics.md), line 13.

```reaction
when RequestBoundary.request (category, newName, path: "/topic/rename", requestId, session)
then
  Sessioning.use (session)
```

### topics.renaming.RenameTopic:creator#2

Authored path: `topics.renaming.RenameTopic`.
- Covered by [Topics](../design/compositions/topics.md), line 10.
- Covered by [Topics](../design/compositions/topics.md), line 13.

```reaction
when Sessioning.use (session, subject: user), asked by topics.renaming.RenameTopic
where
  earlier, RequestBoundary.request (category, newName, path: "/topic/rename", requestId, session)
  view "(user) owns topic (category)" with (category, user)
then
  Categorizing.rename (category, name: newName)
```

### topics.renaming.RenameTopic:creator#3

Authored path: `topics.renaming.RenameTopic`.
- Covered by [Topics](../design/compositions/topics.md), line 10.
- Covered by [Topics](../design/compositions/topics.md), line 13.

```reaction
when Categorizing.rename (category, name: newName), asked by topics.renaming.RenameTopic:creator#2
where
  earlier, RequestBoundary.request (category, newName, path: "/topic/rename", requestId, session)
then
  RequestBoundary.respond (category, requestId)
```

### topics.renaming.RenameTopic:refused#2

Authored path: `topics.renaming.RenameTopic`.
- Covered by [Topics](../design/compositions/topics.md), line 10.
- Covered by [Topics](../design/compositions/topics.md), line 13.

```reaction
when Sessioning.use (session, subject: user), asked by topics.renaming.RenameTopic
where
  earlier, RequestBoundary.request (category, newName, path: "/topic/rename", requestId, session)
  no view "(user) owns topic (category)" with (category, user)
then
  RequestBoundary.respond (error: "NOT_FOUND", requestId)
```

## Endpoint input contracts

Before recording an action ask, the boundary rejects a body that is not an
object or lacks a required key. The response uses `INVALID_INPUT` and names
the path or missing key. A declared default fills an absent key. Endpoints
not listed here have no explicit input contract.

- `/auth/login` — requires `password`, `username`
- `/auth/logout` — requires `session`
- `/auth/me` — requires `session`
- `/auth/register` — requires `password`, `username`
- `/home` — requires `session`
- `/point/create` — requires `name`, `session`
- `/point/createIn` — requires `category`, `name`, `session`
- `/point/delete` — requires `cue`, `session`
- `/point/move` — requires `cue`, `incidentCategory`, `session`
- `/point/rename` — requires `cue`, `name`, `session`
- `/topic/create` — requires `name`, `session`
- `/topic/delete` — requires `category`, `session`
- `/topic/rename` — requires `category`, `newName`, `session`
