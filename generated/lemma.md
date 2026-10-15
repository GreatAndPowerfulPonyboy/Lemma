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

- `Authenticating` — instance of `Authenticating` — [Lemma types](../design/types.md), line 6.
  - `User` is `Registering.User` — [Lemma types](../design/types.md), line 7.

### Categorizing

Defined in [Categorizing](../design/concepts/Categorizing.md), line 1.

#### Actions

- `create(owner: User, name: String) : returns (category: Category)`
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

- `_categories(owner: User) : many (category: Category, name: String)`
- `_get(category: Category) : optional (owner: User, name: String)`
- `_items(category: Category) : many (item: Item)`
- `_category(item: Item) : optional (category: Category)`

#### Instances

- `Categorizing` — instance of `Categorizing` — [Lemma types](../design/types.md), line 12.
  - `Item` is `Cueing.Cue` — [Lemma types](../design/types.md), line 14.
  - `User` is `Registering.User` — [Lemma types](../design/types.md), line 13.

### Cueing

Defined in [Cueing](../design/concepts/Cueing.md), line 1.

#### Actions

- `create(owner: User, name: String) : returns (cue: Cue)`
  - Refuses `INVALID_NAME`: A name must have 1 to 100 characters.
- `rename(cue: Cue, name: String) : returns (cue: Cue)`
  - Refuses `CUE_NOT_FOUND`: Cue does not exist.
  - Refuses `INVALID_NAME`: A name must have 1 to 100 characters.
- `delete(cue: Cue) : returns (cue: Cue)`
  - Refuses `CUE_NOT_FOUND`: Cue does not exist.

#### Queries

- `_cues(owner: User) : many (cue: Cue, name: String)`
- `_search(owner: User, text: String) : many (cue: Cue, name: String)`
- `_get(cue: Cue) : optional (owner: User, name: String)`

#### Instances

- `Cueing` — instance of `Cueing` — [Lemma types](../design/types.md), line 10.
  - `User` is `Registering.User` — [Lemma types](../design/types.md), line 11.

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

- `Registering` — instance of `Registering` — [Lemma types](../design/types.md), line 5.

### Sessioning

Defined in [Sessioning](../design/concepts/Sessioning.md), line 1.

#### Actions

- `start(subject: Subject) : returns (session: Session, expiresAt: DateTime)`
- `use(session: Session) : returns (subject: Subject)`
  - Refuses `NOT_SIGNED_IN`: Your session has ended. Sign in again.
- `end(session: Session) : returns (session: Session)`
  - Refuses `NOT_SIGNED_IN`: Your session has ended. Sign in again.

#### Instances

- `Sessioning` — instance of `Sessioning` — [Lemma types](../design/types.md), line 8.
  - `Subject` is `Registering.User` — [Lemma types](../design/types.md), line 9.

## Views

_Views name reusable conditions. Multiple `where` blocks are alternatives._

### (user) owns point (cue)

Authored path: `access.permissions.ownsCue`.
- Covered by [Access](../design/compositions/access.md), line 5.

```view
(user) owns point (cue) — inputs (user, cue); outputs (); bindings ()
  where Cueing._get (cue) has (owner: user)
```

### (user) owns topic (category)

Authored path: `access.permissions.ownsTopic`.
- Covered by [Access](../design/compositions/access.md), line 5.

```view
(user) owns topic (category) — inputs (user, category); outputs (); bindings ()
  where Categorizing._get (category) has (owner: user)
```

## Formers

_Formers name result shapes evaluated when asked. The source former owns_
_the authored explanation; this section records the generated shape._

### the topics of (user) with their points

Authored path: `home.showing.myTopics`.
- Covered by [Home](../design/compositions/home.md), line 3.

```former
Former "the topics of (user) with their points" — inputs (user); bindings (category, name, cue, cueName); promises exactly one record — forms:
  each Categorizing._categories (owner: user) has (category, name)
    form a record of
      category
      name
      points: each Categorizing._items (category) has (item: cue)
        where Cueing._get (cue) has (name: cueName)
        form a record of
          cue
          name: cueName
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

### cues.deleting.UnplaceDeleted

Authored path: `cues.deleting.UnplaceDeleted`.
- Covered by [Points](../design/compositions/cues.md), line 23.

```reaction
when Cueing.delete (cue)
where
  Categorizing._category (item: cue)
then
  Categorizing.unplace (item: cue)
```

### cues.editing.CreateCue

Authored path: `cues.editing.CreateCue`.
- Covered by [Points](../design/compositions/cues.md), line 5.
- Covered by [Points](../design/compositions/cues.md), line 8.

```reaction
when RequestBoundary.request (category, name, path: "/cues/create", requestId, session)
then
  Sessioning.use (session)
```

### cues.editing.CreateCue:owner#2

Authored path: `cues.editing.CreateCue`.
- Covered by [Points](../design/compositions/cues.md), line 5.
- Covered by [Points](../design/compositions/cues.md), line 8.

```reaction
when Sessioning.use (session, subject: user), asked by cues.editing.CreateCue
where
  earlier, RequestBoundary.request (category, name, path: "/cues/create", requestId, session)
  view "(user) owns topic (category)" with (category, user)
then
  Cueing.create (name, owner: user)
```

### cues.editing.CreateCue:owner#3

Authored path: `cues.editing.CreateCue`.
- Covered by [Points](../design/compositions/cues.md), line 5.
- Covered by [Points](../design/compositions/cues.md), line 8.

```reaction
when Cueing.create (name, owner: user, cue), asked by cues.editing.CreateCue:owner#2
where
  earlier, RequestBoundary.request (category, name, path: "/cues/create", requestId, session)
then
  Categorizing.place (category, item: cue)
```

### cues.editing.CreateCue:owner#4

Authored path: `cues.editing.CreateCue`.
- Covered by [Points](../design/compositions/cues.md), line 5.
- Covered by [Points](../design/compositions/cues.md), line 8.

```reaction
when Categorizing.place (category, item: cue), asked by cues.editing.CreateCue:owner#3
where
  earlier, RequestBoundary.request (category, name, path: "/cues/create", requestId, session)
then
  RequestBoundary.respond (cue, requestId)
```

### cues.editing.CreateCue:refused#2

Authored path: `cues.editing.CreateCue`.
- Covered by [Points](../design/compositions/cues.md), line 5.
- Covered by [Points](../design/compositions/cues.md), line 8.

```reaction
when Sessioning.use (session, subject: user), asked by cues.editing.CreateCue
where
  earlier, RequestBoundary.request (category, name, path: "/cues/create", requestId, session)
  no view "(user) owns topic (category)" with (category, user)
then
  RequestBoundary.respond (error: "NOT_FOUND", requestId)
```

### cues.editing.DeleteCue

Authored path: `cues.editing.DeleteCue`.
- Covered by [Points](../design/compositions/cues.md), line 23.
- Covered by [Points](../design/compositions/cues.md), line 26.

```reaction
when RequestBoundary.request (cue, path: "/cues/delete", requestId, session)
then
  Sessioning.use (session)
```

### cues.editing.DeleteCue:owner#2

Authored path: `cues.editing.DeleteCue`.
- Covered by [Points](../design/compositions/cues.md), line 23.
- Covered by [Points](../design/compositions/cues.md), line 26.

```reaction
when Sessioning.use (session, subject: user), asked by cues.editing.DeleteCue
where
  earlier, RequestBoundary.request (cue, path: "/cues/delete", requestId, session)
  view "(user) owns point (cue)" with (cue, user)
then
  Cueing.delete (cue)
```

### cues.editing.DeleteCue:owner#3

Authored path: `cues.editing.DeleteCue`.
- Covered by [Points](../design/compositions/cues.md), line 23.
- Covered by [Points](../design/compositions/cues.md), line 26.

```reaction
when Cueing.delete (cue), asked by cues.editing.DeleteCue:owner#2
where
  earlier, RequestBoundary.request (cue, path: "/cues/delete", requestId, session)
then
  RequestBoundary.respond (cue, requestId)
```

### cues.editing.DeleteCue:refused#2

Authored path: `cues.editing.DeleteCue`.
- Covered by [Points](../design/compositions/cues.md), line 23.
- Covered by [Points](../design/compositions/cues.md), line 26.

```reaction
when Sessioning.use (session, subject: user), asked by cues.editing.DeleteCue
where
  earlier, RequestBoundary.request (cue, path: "/cues/delete", requestId, session)
  no view "(user) owns point (cue)" with (cue, user)
then
  RequestBoundary.respond (error: "NOT_FOUND", requestId)
```

### cues.editing.MoveCue

Authored path: `cues.editing.MoveCue`.
- Covered by [Points](../design/compositions/cues.md), line 17.
- Covered by [Points](../design/compositions/cues.md), line 20.

```reaction
when RequestBoundary.request (category, cue, path: "/cues/move", requestId, session)
then
  Sessioning.use (session)
```

### cues.editing.MoveCue:no-point#2

Authored path: `cues.editing.MoveCue`.
- Covered by [Points](../design/compositions/cues.md), line 17.
- Covered by [Points](../design/compositions/cues.md), line 20.

```reaction
when Sessioning.use (session, subject: user), asked by cues.editing.MoveCue
where
  earlier, RequestBoundary.request (category, cue, path: "/cues/move", requestId, session)
  no view "(user) owns point (cue)" with (cue, user)
then
  RequestBoundary.respond (error: "NOT_FOUND", requestId)
```

### cues.editing.MoveCue:no-topic#2

Authored path: `cues.editing.MoveCue`.
- Covered by [Points](../design/compositions/cues.md), line 17.
- Covered by [Points](../design/compositions/cues.md), line 20.

```reaction
when Sessioning.use (session, subject: user), asked by cues.editing.MoveCue
where
  earlier, RequestBoundary.request (category, cue, path: "/cues/move", requestId, session)
  view "(user) owns point (cue)" with (cue, user)
  no view "(user) owns topic (category)" with (category, user)
then
  RequestBoundary.respond (error: "NOT_FOUND", requestId)
```

### cues.editing.MoveCue:owner#2

Authored path: `cues.editing.MoveCue`.
- Covered by [Points](../design/compositions/cues.md), line 17.
- Covered by [Points](../design/compositions/cues.md), line 20.

```reaction
when Sessioning.use (session, subject: user), asked by cues.editing.MoveCue
where
  earlier, RequestBoundary.request (category, cue, path: "/cues/move", requestId, session)
  view "(user) owns point (cue)" with (cue, user)
  view "(user) owns topic (category)" with (category, user)
then
  Categorizing.place (category, item: cue)
```

### cues.editing.MoveCue:owner#3

Authored path: `cues.editing.MoveCue`.
- Covered by [Points](../design/compositions/cues.md), line 17.
- Covered by [Points](../design/compositions/cues.md), line 20.

```reaction
when Categorizing.place (category, item: cue), asked by cues.editing.MoveCue:owner#2
where
  earlier, RequestBoundary.request (category, cue, path: "/cues/move", requestId, session)
then
  RequestBoundary.respond (category, cue, requestId)
```

### cues.editing.RenameCue

Authored path: `cues.editing.RenameCue`.
- Covered by [Points](../design/compositions/cues.md), line 11.
- Covered by [Points](../design/compositions/cues.md), line 14.

```reaction
when RequestBoundary.request (cue, name, path: "/cues/rename", requestId, session)
then
  Sessioning.use (session)
```

### cues.editing.RenameCue:owner#2

Authored path: `cues.editing.RenameCue`.
- Covered by [Points](../design/compositions/cues.md), line 11.
- Covered by [Points](../design/compositions/cues.md), line 14.

```reaction
when Sessioning.use (session, subject: user), asked by cues.editing.RenameCue
where
  earlier, RequestBoundary.request (cue, name, path: "/cues/rename", requestId, session)
  view "(user) owns point (cue)" with (cue, user)
then
  Cueing.rename (cue, name)
```

### cues.editing.RenameCue:owner#3

Authored path: `cues.editing.RenameCue`.
- Covered by [Points](../design/compositions/cues.md), line 11.
- Covered by [Points](../design/compositions/cues.md), line 14.

```reaction
when Cueing.rename (cue, name), asked by cues.editing.RenameCue:owner#2
where
  earlier, RequestBoundary.request (cue, name, path: "/cues/rename", requestId, session)
then
  RequestBoundary.respond (cue, requestId)
```

### cues.editing.RenameCue:refused#2

Authored path: `cues.editing.RenameCue`.
- Covered by [Points](../design/compositions/cues.md), line 11.
- Covered by [Points](../design/compositions/cues.md), line 14.

```reaction
when Sessioning.use (session, subject: user), asked by cues.editing.RenameCue
where
  earlier, RequestBoundary.request (cue, name, path: "/cues/rename", requestId, session)
  no view "(user) owns point (cue)" with (cue, user)
then
  RequestBoundary.respond (error: "NOT_FOUND", requestId)
```

### home.showing.ShowHome

Authored path: `home.showing.ShowHome`.
- Covered by [Home](../design/compositions/home.md), line 3.
- Covered by [Home](../design/compositions/home.md), line 6.

```reaction
when RequestBoundary.request (path: "/home", requestId, session)
then
  Sessioning.use (session)
```

### home.showing.ShowHome#2

Authored path: `home.showing.ShowHome`.
- Covered by [Home](../design/compositions/home.md), line 3.
- Covered by [Home](../design/compositions/home.md), line 6.

```reaction
when Sessioning.use (session, subject: user), asked by home.showing.ShowHome
where
  earlier, RequestBoundary.request (path: "/home", requestId, session)
then
  RequestBoundary.respond (requestId, topics: former "the topics of (user) with their points" with (user))
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

### topics.managing.CreateTopic

Authored path: `topics.managing.CreateTopic`.
- Covered by [Topics](../design/compositions/topics.md), line 5.
- Covered by [Topics](../design/compositions/topics.md), line 8.

```reaction
when RequestBoundary.request (name, path: "/topics/create", requestId, session)
then
  Sessioning.use (session)
```

### topics.managing.CreateTopic#2

Authored path: `topics.managing.CreateTopic`.
- Covered by [Topics](../design/compositions/topics.md), line 5.
- Covered by [Topics](../design/compositions/topics.md), line 8.

```reaction
when Sessioning.use (session, subject: user), asked by topics.managing.CreateTopic
where
  earlier, RequestBoundary.request (name, path: "/topics/create", requestId, session)
then
  Categorizing.create (name, owner: user)
```

### topics.managing.CreateTopic#3

Authored path: `topics.managing.CreateTopic`.
- Covered by [Topics](../design/compositions/topics.md), line 5.
- Covered by [Topics](../design/compositions/topics.md), line 8.

```reaction
when Categorizing.create (name, owner: user, category), asked by topics.managing.CreateTopic#2
where
  earlier, RequestBoundary.request (name, path: "/topics/create", requestId, session)
then
  RequestBoundary.respond (category, requestId)
```

### topics.managing.DeleteTopic

Authored path: `topics.managing.DeleteTopic`.
- Covered by [Topics](../design/compositions/topics.md), line 17.
- Covered by [Topics](../design/compositions/topics.md), line 20.

```reaction
when RequestBoundary.request (category, path: "/topics/delete", requestId, session)
then
  Sessioning.use (session)
```

### topics.managing.DeleteTopic:owner#2

Authored path: `topics.managing.DeleteTopic`.
- Covered by [Topics](../design/compositions/topics.md), line 17.
- Covered by [Topics](../design/compositions/topics.md), line 20.

```reaction
when Sessioning.use (session, subject: user), asked by topics.managing.DeleteTopic
where
  earlier, RequestBoundary.request (category, path: "/topics/delete", requestId, session)
  view "(user) owns topic (category)" with (category, user)
then
  Categorizing.delete (category)
```

### topics.managing.DeleteTopic:owner#3

Authored path: `topics.managing.DeleteTopic`.
- Covered by [Topics](../design/compositions/topics.md), line 17.
- Covered by [Topics](../design/compositions/topics.md), line 20.

```reaction
when Categorizing.delete (category), asked by topics.managing.DeleteTopic:owner#2
where
  earlier, RequestBoundary.request (category, path: "/topics/delete", requestId, session)
then
  RequestBoundary.respond (category, requestId)
```

### topics.managing.DeleteTopic:refused#2

Authored path: `topics.managing.DeleteTopic`.
- Covered by [Topics](../design/compositions/topics.md), line 17.
- Covered by [Topics](../design/compositions/topics.md), line 20.

```reaction
when Sessioning.use (session, subject: user), asked by topics.managing.DeleteTopic
where
  earlier, RequestBoundary.request (category, path: "/topics/delete", requestId, session)
  no view "(user) owns topic (category)" with (category, user)
then
  RequestBoundary.respond (error: "NOT_FOUND", requestId)
```

### topics.managing.RenameTopic

Authored path: `topics.managing.RenameTopic`.
- Covered by [Topics](../design/compositions/topics.md), line 11.
- Covered by [Topics](../design/compositions/topics.md), line 14.

```reaction
when RequestBoundary.request (category, name, path: "/topics/rename", requestId, session)
then
  Sessioning.use (session)
```

### topics.managing.RenameTopic:owner#2

Authored path: `topics.managing.RenameTopic`.
- Covered by [Topics](../design/compositions/topics.md), line 11.
- Covered by [Topics](../design/compositions/topics.md), line 14.

```reaction
when Sessioning.use (session, subject: user), asked by topics.managing.RenameTopic
where
  earlier, RequestBoundary.request (category, name, path: "/topics/rename", requestId, session)
  view "(user) owns topic (category)" with (category, user)
then
  Categorizing.rename (category, name)
```

### topics.managing.RenameTopic:owner#3

Authored path: `topics.managing.RenameTopic`.
- Covered by [Topics](../design/compositions/topics.md), line 11.
- Covered by [Topics](../design/compositions/topics.md), line 14.

```reaction
when Categorizing.rename (category, name), asked by topics.managing.RenameTopic:owner#2
where
  earlier, RequestBoundary.request (category, name, path: "/topics/rename", requestId, session)
then
  RequestBoundary.respond (category, requestId)
```

### topics.managing.RenameTopic:refused#2

Authored path: `topics.managing.RenameTopic`.
- Covered by [Topics](../design/compositions/topics.md), line 11.
- Covered by [Topics](../design/compositions/topics.md), line 14.

```reaction
when Sessioning.use (session, subject: user), asked by topics.managing.RenameTopic
where
  earlier, RequestBoundary.request (category, name, path: "/topics/rename", requestId, session)
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
- `/cues/create` — requires `category`, `name`, `session`
- `/cues/delete` — requires `cue`, `session`
- `/cues/move` — requires `category`, `cue`, `session`
- `/cues/rename` — requires `cue`, `name`, `session`
- `/home` — requires `session`
- `/topics/create` — requires `name`, `session`
- `/topics/delete` — requires `category`, `session`
- `/topics/rename` — requires `category`, `name`, `session`
