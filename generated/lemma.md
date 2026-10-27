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

### Flashcarding

Defined in [Flashcarding](../design/concepts/Flashcarding.md), line 1.

#### Actions

- `write(item: Item, answer: String) : returns (item: Item)`
  - Refuses `INVALID_ANSWER`: An answer must have 1 to 5000 characters.
  - Refuses `ALREADY_ANSWERED`: That item already has an answer.
- `revise(item: Item, answer: String) : returns (item: Item)`
  - Refuses `NO_ANSWER`: That item has no answer.
  - Refuses `INVALID_ANSWER`: An answer must have 1 to 5000 characters.
- `remove(item: Item) : returns (item: Item)`
  - Refuses `NO_ANSWER`: That item has no answer.

#### Queries

- `_answer(item: Item) : optional (answer: String)`

#### Instances

- `Flashcarding` — instance of `Flashcarding` — [Lemma types](../design/types.md), line 25.
  - `Item` is `Cueing.Cue` — [Lemma types](../design/types.md), line 26.

### RecallChecking

Defined in [RecallChecking](../design/concepts/RecallChecking.md), line 1.

#### Actions

- `open(owner: User, name: String) : returns (check: Check)`
  - Refuses `INVALID_NAME`: A check name must have 1 to 200 characters.
- `rename(check: Check, name: String) : returns (check: Check)`
  - Refuses `CHECK_NOT_FOUND`: There is no such check.
  - Refuses `INVALID_NAME`: A check name must have 1 to 200 characters.
- `include(check: Check, item: Item, name: String) : returns (check: Check)`
  - Refuses `CHECK_NOT_FOUND`: There is no such check.
  - Refuses `ALREADY_INCLUDED`: That item is already in this check.
- `exclude(check: Check, item: Item) : returns (check: Check)`
  - Refuses `CHECK_NOT_FOUND`: There is no such check.
  - Refuses `NOT_INCLUDED`: That item isn't in this check.
- `relabel(item: Item, name: String) : returns (item: Item)`
- `delete(check: Check) : returns (check: Check)`
  - Refuses `CHECK_NOT_FOUND`: There is no such check.
- `attempt(check: Check) : returns (attempt: Attempt)`
  - Refuses `CHECK_NOT_FOUND`: There is no such check.
  - Refuses `ATTEMPT_IN_PROGRESS`: Finish or abandon the current attempt first.
- `submit(attempt: Attempt) : returns (attempt: Attempt)`
  - Refuses `ATTEMPT_NOT_FOUND`: There is no such attempt.
  - Refuses `NOT_OPEN`: This attempt has already been submitted.
- `mention(attempt: Attempt, item: Item) : returns (attempt: Attempt)`
  - Refuses `ATTEMPT_NOT_FOUND`: There is no such attempt.
  - Refuses `NOT_GRADED`: This attempt can't be corrected now.
  - Refuses `NOT_IN_SUBJECT`: That item isn't part of this attempt.
- `omit(attempt: Attempt, item: Item) : returns (attempt: Attempt)`
  - Refuses `ATTEMPT_NOT_FOUND`: There is no such attempt.
  - Refuses `NOT_GRADED`: This attempt can't be corrected now.
  - Refuses `NOT_IN_SUBJECT`: That item isn't part of this attempt.
- `rate(attempt: Attempt, rating: Number) : returns (attempt: Attempt)`
  - Refuses `ATTEMPT_NOT_FOUND`: There is no such attempt.
  - Refuses `NOT_GRADED`: This attempt can't be corrected now.
  - Refuses `INVALID_RATING`: A rating must be between 0 and 1.
- `close(attempt: Attempt) : returns (attempt: Attempt, check: Check, credit: Number)`
  - Refuses `ATTEMPT_NOT_FOUND`: There is no such attempt.
  - Refuses `NOT_GRADED`: This attempt can't be closed now.
  - Refuses `UNRATED`: Rate an attempt with no items before closing it.
- `abandon(attempt: Attempt) : returns (attempt: Attempt)`
  - Refuses `ATTEMPT_NOT_FOUND`: There is no such attempt.
  - Refuses `FINISHED`: This attempt is already finished.

#### Queries

- `_checks(owner: User) : many (check: Check, name: String)`
- `_get(check: Check) : optional (owner: User, name: String)`
- `_subject(check: Check) : many (item: Item, name: String)`
- `_including(item: Item) : many (check: Check)`
- `_attempts(check: Check) : many (attempt: Attempt, status: AttemptStatus, credit: Number)`
- `_current(check: Check) : optional (attempt: Attempt, status: AttemptStatus)`
- `_attempt(attempt: Attempt) : optional (check: Check, status: AttemptStatus, credit: Number)`
- `_attemptSubject(attempt: Attempt) : many (item: Item, name: String)`
- `_mentioned(attempt: Attempt) : many (item: Item, name: String)`
- `_omitted(attempt: Attempt) : many (item: Item, name: String)`
- `_missed(owner: User, atLeast: Number) : many (item: Item, misses: Number)`

#### Instances

- `RecallChecking` — instance of `RecallChecking` — [Lemma types](../design/types.md), line 28.
  - `Item` is `Cueing.Cue` — [Lemma types](../design/types.md), line 30.
  - `User` is `Registering.User` — [Lemma types](../design/types.md), line 29.

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

### Sharing

Defined in [Sharing](../design/concepts/Sharing.md), line 1.

#### Actions

- `share(item: Item, recipient: Person) : returns (item: Item, recipient: Person)`
  - Refuses `ALREADY_SHARED`: This is already shared with that person.
- `revoke(item: Item, recipient: Person) : returns (item: Item, recipient: Person)`
  - Refuses `NOT_SHARED`: This is not shared with that person.

#### Queries

- `_recipients(item: Item) : many (recipient: Person)`
- `_sharedWith(recipient: Person) : many (item: Item)`

#### Instances

- `Sharing` — instance of `Sharing` — [Lemma types](../design/types.md), line 35.
  - `Item` is `RecallChecking.Check` — [Lemma types](../design/types.md), line 36.
  - `Person` is `Registering.User` — [Lemma types](../design/types.md), line 37.

### SpacedRepetition

Defined in [SpacedRepetition](../design/concepts/SpacedRepetition.md), line 1.

#### Actions

- `enroll(item: Item) : returns (item: Item)`
  - Refuses `ALREADY_ENROLLED`: That item is already scheduled.
- `review(item: Item, credit: Number) : returns (item: Item, due: DateTime)`
  - Refuses `NOT_ENROLLED`: That item isn't scheduled.
  - Refuses `INVALID_CREDIT`: Credit must be between 0 and 1.
- `drop(item: Item) : returns (item: Item)`
  - Refuses `NOT_ENROLLED`: That item isn't scheduled.

#### Queries

- `_due(before: DateTime) : many (item: Item, due: DateTime)`
- `_entry(item: Item) : optional (due: DateTime, interval: Number, lapses: Number)`
- `_lapsed(atLeast: Number) : many (item: Item, lapses: Number, lastLapse: DateTime)`

#### Instances

- `SpacedRepetition` — instance of `SpacedRepetition` — [Lemma types](../design/types.md), line 32.
  - `Item` is `RecallChecking.Check` — [Lemma types](../design/types.md), line 33.

## Computations

- `isTracked(due?: DateTime) : Boolean` — [Scheduling](../design/compositions/scheduling.md), line 16.

## Views

_Views name reusable conditions. Multiple `where` blocks are alternatives._

### (check) has points

```view
(check) has points — inputs (check); outputs (); bindings ()
  where RecallChecking._subject (check)
```

### (check) is shared with (user)

Authored path: `access.permissions.sharedWith`.
- Covered by [Sharing](../design/compositions/sharing.md), line 11.

```view
(check) is shared with (user) — inputs (user, check); outputs (); bindings ()
  where Sharing._recipients (item: check) has (recipient: user)
```

### (user) owns check (check)

Authored path: `access.permissions.ownsCheck`.
- Covered by [Access](../design/compositions/access.md), line 8.
- Covered by [Checks](../design/compositions/checks.md), line 28.
- Covered by [Home](../design/compositions/home.md), line 9.
- Covered by [Scheduling](../design/compositions/scheduling.md), line 4.
- Covered by [Sharing](../design/compositions/sharing.md), line 4.

```view
(user) owns check (check) — inputs (user, check); outputs (); bindings ()
  where RecallChecking._get (check) has (owner: user)
```

### (user) owns attempt (attempt)

Authored path: `access.permissions.ownsAttempt`.
- Covered by [Access](../design/compositions/access.md), line 8.
- Covered by [Checks](../design/compositions/checks.md), line 15.

```view
(user) owns attempt (attempt) — inputs (user, attempt); outputs (); bindings (check)
  where
    RecallChecking._attempt (attempt) has (check)
    view "(user) owns check (check)" with (check, user)
```

### (user) owns point (cue)

Authored path: `access.permissions.ownsPoint`.
- Covered by [Access](../design/compositions/access.md), line 3.
- Covered by [Cards](../design/compositions/cards.md), line 7.
- Covered by [Checks](../design/compositions/checks.md), line 4.
- Covered by [Home](../design/compositions/home.md), line 2.
- Covered by [Points](../design/compositions/points.md), line 10.
- Covered by [Points](../design/compositions/points.md), line 16.
- Covered by [Points](../design/compositions/points.md), line 24.
- Covered by [Points](../design/compositions/points.md), line 30.

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

### the attempts of (check)

Authored path: `checks.showing.attemptsOf`.
- Covered by [Checks](../design/compositions/checks.md), line 29.

```former
Former "the attempts of (check)" — inputs (check); bindings (attempt, status, credit); promises exactly one record — forms:
  each RecallChecking._attempts (check) has (attempt, credit, status)
    form a record of
      attempt
      credit
      status
```

### the card of (cue)

Authored path: `cards.showing.cardOf`.
- Covered by [Cards](../design/compositions/cards.md), line 17.

```former
Former "the card of (cue)" — inputs (cue); bindings (name, answer); promises exactly one record — forms:
  each Cueing._get (cue) has (name)
    where whether Flashcarding._answer (item: cue) has (answer)
    form a record of
      answer
      name
```

### the cards suggested to (user)

Authored path: `cards.promoting.suggestedCards`.
- Covered by [Cards](../design/compositions/cards.md), line 31.
- Covered by [Home](../design/compositions/home.md), line 3.

```former
Former "the cards suggested to (user)" — inputs (user); bindings (cue, pointName, misses); promises exactly one record — forms:
  each RecallChecking._missed (atLeast: 3, owner: user) has (item: cue, misses)
    where view "(user) owns point (cue)" with (cue, user)
    where Cueing._get (cue) has (name: pointName)
    where no Flashcarding._answer (item: cue)
    form a record of
      cue
      misses
      pointName
```

### the checks (user) has due by (before)

Authored path: `scheduling.showing.dueChecks`.
- Covered by [Home](../design/compositions/home.md), line 3.
- Covered by [Scheduling](../design/compositions/scheduling.md), line 20.

```former
Former "the checks (user) has due by (before)" — inputs (user, before); bindings (check, name, due); promises exactly one record — forms:
  each SpacedRepetition._due (before) has (due, item: check)
    where view "(user) owns check (check)" with (check, user)
    where view "(check) has points" with (check)
    where RecallChecking._get (check) has (name)
    form a record of
      check
      due
      name
```

### the current attempt of (check)

Authored path: `checks.showing.currentAttemptOf`.
- Covered by [Checks](../design/compositions/checks.md), line 29.

```former
Former "the current attempt of (check)" — inputs (check); bindings (attempt, status); promises at most one record — forms:
  a record of
    where RecallChecking._current (check) has (attempt, status)
    attempt
    status
```

### the number of points in (check)

Authored path: `checks.showing.pointCountOf`.
- Covered by [Checks](../design/compositions/checks.md), line 29.
- Covered by [Home](../design/compositions/home.md), line 10.

```former
Former "the number of points in (check)" — inputs (check); bindings (item); promises exactly one record — forms:
  the count of RecallChecking._subject (check) has (item)
```

### the checks (user) owns

Authored path: `home.showing.myChecks`.
- Covered by [Home](../design/compositions/home.md), line 9.

```former
Former "the checks (user) owns" — inputs (user); bindings (check, name); promises exactly one record — forms:
  each RecallChecking._checks (owner: user) has (check, name)
    form a record of
      check
      current: whether former "the current attempt of (check)" with (check)
      name
      pointCount: former "the number of points in (check)" with (check)
```

### the checks (user) tracks

Authored path: `scheduling.showing.scheduledChecks`.
- Covered by [Home](../design/compositions/home.md), line 3.
- Covered by [Scheduling](../design/compositions/scheduling.md), line 20.

```former
Former "the checks (user) tracks" — inputs (user); bindings (check, name, due); promises exactly one record — forms:
  each RecallChecking._checks (owner: user) has (check, name)
    where SpacedRepetition._entry (item: check) has (due)
    arranged by due
    form a record of
      check
      due
      name
```

### the checks shared with (user)

Authored path: `sharing.showing.sharedWithMe`.
- Covered by [Sharing](../design/compositions/sharing.md), line 11.

```former
Former "the checks shared with (user)" — inputs (user); bindings (check, name, owner, ownerUsername); promises exactly one record — forms:
  each Sharing._sharedWith (recipient: user) has (item: check)
    where RecallChecking._get (check) has (name, owner)
    where Registering._username (user: owner) has (username: ownerUsername)
    form a record of
      check
      name
      ownerUsername
```

### the points (user) owns

Authored path: `home.showing.myPoints`.
- Covered by [Home](../design/compositions/home.md), line 5.

```former
Former "the points (user) owns" — inputs (user); bindings (category, cue, pointName, topicName, answer); promises exactly one record — forms:
  each Cueing._cues (creator: user) has (cue, name: pointName)
    where view "(user) owns point (cue)" with (cue, user)
    where whether Categorizing._category (item: cue) has (category)
    where whether Categorizing._get (category) has (name: topicName)
    where whether Flashcarding._answer (item: cue) has (answer)
    form a record of
      answer
      category
      cue
      pointName
      topicName
```

### the points mentioned in (attempt)

Authored path: `checks.showing.mentionedIn`.
- Covered by [Checks](../design/compositions/checks.md), line 16.

```former
Former "the points mentioned in (attempt)" — inputs (attempt); bindings (cue, pointName, answer); promises exactly one record — forms:
  each RecallChecking._mentioned (attempt) has (item: cue, name: pointName)
    where whether Flashcarding._answer (item: cue) has (answer)
    form a record of
      answer
      cue
      pointName
```

### the points of (attempt)

Authored path: `checks.showing.attemptPoints`.
- Covered by [Checks](../design/compositions/checks.md), line 16.

```former
Former "the points of (attempt)" — inputs (attempt); bindings (cue, pointName); promises exactly one record — forms:
  each RecallChecking._attemptSubject (attempt) has (item: cue, name: pointName)
    form a record of
      cue
      pointName
```

### the points of shared (check)

Authored path: `sharing.showing.sharedPoints`.
- Covered by [Sharing](../design/compositions/sharing.md), line 11.

```former
Former "the points of shared (check)" — inputs (check); bindings (pointName); promises exactly one record — forms:
  each RecallChecking._subject (check) has (name: pointName)
    form a record of
      pointName
```

### the points omitted from (attempt)

Authored path: `checks.showing.omittedIn`.
- Covered by [Checks](../design/compositions/checks.md), line 16.

```former
Former "the points omitted from (attempt)" — inputs (attempt); bindings (cue, pointName, answer); promises exactly one record — forms:
  each RecallChecking._omitted (attempt) has (item: cue, name: pointName)
    where whether Flashcarding._answer (item: cue) has (answer)
    form a record of
      answer
      cue
      pointName
```

### the recipients of (check)

Authored path: `sharing.showing.recipientsOf`.
- Covered by [Sharing](../design/compositions/sharing.md), line 4.

```former
Former "the recipients of (check)" — inputs (check); bindings (recipient, username); promises exactly one record — forms:
  each Sharing._recipients (item: check) has (recipient)
    where Registering._username (user: recipient) has (username)
    form a record of
      username
```

### the schedule of (check)

Authored path: `scheduling.showing.scheduleOf`.
- Covered by [Scheduling](../design/compositions/scheduling.md), line 13.

```former
Former "the schedule of (check)" — inputs (check); bindings (due, tracked); promises exactly one record — forms:
  a record of
    where whether SpacedRepetition._entry (item: check) has (due)
    where tracked is isTracked (due)
    due
    tracked
```

### the subject of (check)

Authored path: `checks.showing.subjectOf`.
- Covered by [Checks](../design/compositions/checks.md), line 29.

```former
Former "the subject of (check)" — inputs (check); bindings (cue, pointName); promises exactly one record — forms:
  each RecallChecking._subject (check) has (item: cue, name: pointName)
    form a record of
      cue
      pointName
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

### cards.answering.RemoveAnswer

Authored path: `cards.answering.RemoveAnswer`.
- Covered by [Cards](../design/compositions/cards.md), line 7.
- Covered by [Cards](../design/compositions/cards.md), line 12.

```reaction
when RequestBoundary.request (cue, path: "/card/remove", requestId, session)
then
  Sessioning.use (session)
```

### cards.answering.RemoveAnswer:creator#2

Authored path: `cards.answering.RemoveAnswer`.
- Covered by [Cards](../design/compositions/cards.md), line 7.
- Covered by [Cards](../design/compositions/cards.md), line 12.

```reaction
when Sessioning.use (session, subject: user), asked by cards.answering.RemoveAnswer
where
  earlier, RequestBoundary.request (cue, path: "/card/remove", requestId, session)
  view "(user) owns point (cue)" with (cue, user)
then
  Flashcarding.remove (item: cue)
```

### cards.answering.RemoveAnswer:creator#3

Authored path: `cards.answering.RemoveAnswer`.
- Covered by [Cards](../design/compositions/cards.md), line 7.
- Covered by [Cards](../design/compositions/cards.md), line 12.

```reaction
when Flashcarding.remove (item: cue), asked by cards.answering.RemoveAnswer:creator#2
where
  earlier, RequestBoundary.request (cue, path: "/card/remove", requestId, session)
then
  RequestBoundary.respond (cue, requestId)
```

### cards.answering.RemoveAnswer:refused#2

Authored path: `cards.answering.RemoveAnswer`.
- Covered by [Cards](../design/compositions/cards.md), line 7.
- Covered by [Cards](../design/compositions/cards.md), line 12.

```reaction
when Sessioning.use (session, subject: user), asked by cards.answering.RemoveAnswer
where
  earlier, RequestBoundary.request (cue, path: "/card/remove", requestId, session)
  no view "(user) owns point (cue)" with (cue, user)
then
  RequestBoundary.respond (error: "NOT_FOUND", requestId)
```

### cards.answering.ReviseAnswer

Authored path: `cards.answering.ReviseAnswer`.
- Covered by [Cards](../design/compositions/cards.md), line 7.
- Covered by [Cards](../design/compositions/cards.md), line 11.

```reaction
when RequestBoundary.request (answer, cue, path: "/card/revise", requestId, session)
then
  Sessioning.use (session)
```

### cards.answering.ReviseAnswer:creator#2

Authored path: `cards.answering.ReviseAnswer`.
- Covered by [Cards](../design/compositions/cards.md), line 7.
- Covered by [Cards](../design/compositions/cards.md), line 11.

```reaction
when Sessioning.use (session, subject: user), asked by cards.answering.ReviseAnswer
where
  earlier, RequestBoundary.request (answer, cue, path: "/card/revise", requestId, session)
  view "(user) owns point (cue)" with (cue, user)
then
  Flashcarding.revise (answer, item: cue)
```

### cards.answering.ReviseAnswer:creator#3

Authored path: `cards.answering.ReviseAnswer`.
- Covered by [Cards](../design/compositions/cards.md), line 7.
- Covered by [Cards](../design/compositions/cards.md), line 11.

```reaction
when Flashcarding.revise (answer, item: cue), asked by cards.answering.ReviseAnswer:creator#2
where
  earlier, RequestBoundary.request (answer, cue, path: "/card/revise", requestId, session)
then
  RequestBoundary.respond (cue, requestId)
```

### cards.answering.ReviseAnswer:refused#2

Authored path: `cards.answering.ReviseAnswer`.
- Covered by [Cards](../design/compositions/cards.md), line 7.
- Covered by [Cards](../design/compositions/cards.md), line 11.

```reaction
when Sessioning.use (session, subject: user), asked by cards.answering.ReviseAnswer
where
  earlier, RequestBoundary.request (answer, cue, path: "/card/revise", requestId, session)
  no view "(user) owns point (cue)" with (cue, user)
then
  RequestBoundary.respond (error: "NOT_FOUND", requestId)
```

### cards.answering.WriteAnswer

Authored path: `cards.answering.WriteAnswer`.
- Covered by [Cards](../design/compositions/cards.md), line 7.
- Covered by [Cards](../design/compositions/cards.md), line 10.

```reaction
when RequestBoundary.request (answer, cue, path: "/card/write", requestId, session)
then
  Sessioning.use (session)
```

### cards.answering.WriteAnswer:creator#2

Authored path: `cards.answering.WriteAnswer`.
- Covered by [Cards](../design/compositions/cards.md), line 7.
- Covered by [Cards](../design/compositions/cards.md), line 10.

```reaction
when Sessioning.use (session, subject: user), asked by cards.answering.WriteAnswer
where
  earlier, RequestBoundary.request (answer, cue, path: "/card/write", requestId, session)
  view "(user) owns point (cue)" with (cue, user)
then
  Flashcarding.write (answer, item: cue)
```

### cards.answering.WriteAnswer:creator#3

Authored path: `cards.answering.WriteAnswer`.
- Covered by [Cards](../design/compositions/cards.md), line 7.
- Covered by [Cards](../design/compositions/cards.md), line 10.

```reaction
when Flashcarding.write (answer, item: cue), asked by cards.answering.WriteAnswer:creator#2
where
  earlier, RequestBoundary.request (answer, cue, path: "/card/write", requestId, session)
then
  RequestBoundary.respond (cue, requestId)
```

### cards.answering.WriteAnswer:refused#2

Authored path: `cards.answering.WriteAnswer`.
- Covered by [Cards](../design/compositions/cards.md), line 7.
- Covered by [Cards](../design/compositions/cards.md), line 10.

```reaction
when Sessioning.use (session, subject: user), asked by cards.answering.WriteAnswer
where
  earlier, RequestBoundary.request (answer, cue, path: "/card/write", requestId, session)
  no view "(user) owns point (cue)" with (cue, user)
then
  RequestBoundary.respond (error: "NOT_FOUND", requestId)
```

### cards.deleting.RemoveAnswerOfDeleted

Authored path: `cards.deleting.RemoveAnswerOfDeleted`.
- Covered by [Cards](../design/compositions/cards.md), line 27.

```reaction
when Cueing.delete (cue)
where
  Flashcarding._answer (item: cue)
then
  Flashcarding.remove (item: cue)
```

### cards.showing.ShowCard

Authored path: `cards.showing.ShowCard`.
- Covered by [Cards](../design/compositions/cards.md), line 17.
- Covered by [Cards](../design/compositions/cards.md), line 20.

```reaction
when RequestBoundary.request (cue, path: "/card/show", requestId, session)
then
  Sessioning.use (session)
```

### cards.showing.ShowCard:creator#2

Authored path: `cards.showing.ShowCard`.
- Covered by [Cards](../design/compositions/cards.md), line 17.
- Covered by [Cards](../design/compositions/cards.md), line 20.

```reaction
when Sessioning.use (session, subject: user), asked by cards.showing.ShowCard
where
  earlier, RequestBoundary.request (cue, path: "/card/show", requestId, session)
  view "(user) owns point (cue)" with (cue, user)
then
  RequestBoundary.respond (card: former "the card of (cue)" with (cue), requestId)
```

### cards.showing.ShowCard:refused#2

Authored path: `cards.showing.ShowCard`.
- Covered by [Cards](../design/compositions/cards.md), line 17.
- Covered by [Cards](../design/compositions/cards.md), line 20.

```reaction
when Sessioning.use (session, subject: user), asked by cards.showing.ShowCard
where
  earlier, RequestBoundary.request (cue, path: "/card/show", requestId, session)
  no view "(user) owns point (cue)" with (cue, user)
then
  RequestBoundary.respond (error: "NOT_FOUND", requestId)
```

### checks.attempting.AbandonAttempt

Authored path: `checks.attempting.AbandonAttempt`.
- Covered by [Checks](../design/compositions/checks.md), line 13.
- Covered by [Checks](../design/compositions/checks.md), line 25.

```reaction
when RequestBoundary.request (attempt, path: "/attempt/abandon", requestId, session)
then
  Sessioning.use (session)
```

### checks.attempting.AbandonAttempt:owner#2

Authored path: `checks.attempting.AbandonAttempt`.
- Covered by [Checks](../design/compositions/checks.md), line 13.
- Covered by [Checks](../design/compositions/checks.md), line 25.

```reaction
when Sessioning.use (session, subject: user), asked by checks.attempting.AbandonAttempt
where
  earlier, RequestBoundary.request (attempt, path: "/attempt/abandon", requestId, session)
  view "(user) owns attempt (attempt)" with (attempt, user)
  RecallChecking._attempt (attempt) has (check)
  RecallChecking._attempts (check) has (status: "CLOSED")
then
  RecallChecking.abandon (attempt)
```

### checks.attempting.AbandonAttempt:owner#3

Authored path: `checks.attempting.AbandonAttempt`.
- Covered by [Checks](../design/compositions/checks.md), line 13.
- Covered by [Checks](../design/compositions/checks.md), line 25.

```reaction
when RecallChecking.abandon (attempt), asked by checks.attempting.AbandonAttempt:owner#2
where
  earlier, RequestBoundary.request (attempt, path: "/attempt/abandon", requestId, session)
then
  RequestBoundary.respond (attempt, deleted: false, requestId)
```

### checks.attempting.AbandonAttempt:refused#2

Authored path: `checks.attempting.AbandonAttempt`.
- Covered by [Checks](../design/compositions/checks.md), line 13.
- Covered by [Checks](../design/compositions/checks.md), line 25.

```reaction
when Sessioning.use (session, subject: user), asked by checks.attempting.AbandonAttempt
where
  earlier, RequestBoundary.request (attempt, path: "/attempt/abandon", requestId, session)
  no view "(user) owns attempt (attempt)" with (attempt, user)
then
  RequestBoundary.respond (error: "NOT_FOUND", requestId)
```

### checks.attempting.AbandonAttempt:unfinished#2

Authored path: `checks.attempting.AbandonAttempt`.
- Covered by [Checks](../design/compositions/checks.md), line 13.
- Covered by [Checks](../design/compositions/checks.md), line 25.

```reaction
when Sessioning.use (session, subject: user), asked by checks.attempting.AbandonAttempt
where
  earlier, RequestBoundary.request (attempt, path: "/attempt/abandon", requestId, session)
  view "(user) owns attempt (attempt)" with (attempt, user)
  RecallChecking._attempt (attempt) has (check)
  no RecallChecking._attempts (check) has (status: "CLOSED")
then
  RecallChecking.abandon (attempt)
```

### checks.attempting.AbandonAttempt:unfinished#3

Authored path: `checks.attempting.AbandonAttempt`.
- Covered by [Checks](../design/compositions/checks.md), line 13.
- Covered by [Checks](../design/compositions/checks.md), line 25.

```reaction
when RecallChecking.abandon (attempt), asked by checks.attempting.AbandonAttempt:unfinished#2
where
  earlier, RequestBoundary.request (attempt, path: "/attempt/abandon", requestId, session)
then
  RequestBoundary.respond (attempt, deleted: true, requestId)
```

### checks.attempting.CloseAttempt

Authored path: `checks.attempting.CloseAttempt`.
- Covered by [Checks](../design/compositions/checks.md), line 12.
- Covered by [Checks](../design/compositions/checks.md), line 24.

```reaction
when RequestBoundary.request (attempt, path: "/attempt/close", requestId, session)
then
  Sessioning.use (session)
```

### checks.attempting.CloseAttempt:owner#2

Authored path: `checks.attempting.CloseAttempt`.
- Covered by [Checks](../design/compositions/checks.md), line 12.
- Covered by [Checks](../design/compositions/checks.md), line 24.

```reaction
when Sessioning.use (session, subject: user), asked by checks.attempting.CloseAttempt
where
  earlier, RequestBoundary.request (attempt, path: "/attempt/close", requestId, session)
  view "(user) owns attempt (attempt)" with (attempt, user)
then
  RecallChecking.close (attempt)
```

### checks.attempting.CloseAttempt:owner#3

Authored path: `checks.attempting.CloseAttempt`.
- Covered by [Checks](../design/compositions/checks.md), line 12.
- Covered by [Checks](../design/compositions/checks.md), line 24.

```reaction
when RecallChecking.close (attempt, credit), asked by checks.attempting.CloseAttempt:owner#2
where
  earlier, RequestBoundary.request (attempt, path: "/attempt/close", requestId, session)
then
  RequestBoundary.respond (credit, requestId)
```

### checks.attempting.CloseAttempt:refused#2

Authored path: `checks.attempting.CloseAttempt`.
- Covered by [Checks](../design/compositions/checks.md), line 12.
- Covered by [Checks](../design/compositions/checks.md), line 24.

```reaction
when Sessioning.use (session, subject: user), asked by checks.attempting.CloseAttempt
where
  earlier, RequestBoundary.request (attempt, path: "/attempt/close", requestId, session)
  no view "(user) owns attempt (attempt)" with (attempt, user)
then
  RequestBoundary.respond (error: "NOT_FOUND", requestId)
```

### checks.attempting.DeleteUnfinished

Authored path: `checks.attempting.DeleteUnfinished`.
- Covered by [Checks](../design/compositions/checks.md), line 14.

```reaction
when RecallChecking.abandon (attempt)
where
  RecallChecking._attempt (attempt) has (check)
  no RecallChecking._attempts (check) has (status: "CLOSED")
then
  RecallChecking.delete (check)
```

### checks.attempting.MentionPoint

Authored path: `checks.attempting.MentionPoint`.
- Covered by [Checks](../design/compositions/checks.md), line 12.
- Covered by [Checks](../design/compositions/checks.md), line 22.

```reaction
when RequestBoundary.request (attempt, cue, path: "/attempt/mention", requestId, session)
then
  Sessioning.use (session)
```

### checks.attempting.MentionPoint:owner#2

Authored path: `checks.attempting.MentionPoint`.
- Covered by [Checks](../design/compositions/checks.md), line 12.
- Covered by [Checks](../design/compositions/checks.md), line 22.

```reaction
when Sessioning.use (session, subject: user), asked by checks.attempting.MentionPoint
where
  earlier, RequestBoundary.request (attempt, cue, path: "/attempt/mention", requestId, session)
  view "(user) owns attempt (attempt)" with (attempt, user)
then
  RecallChecking.mention (attempt, item: cue)
```

### checks.attempting.MentionPoint:owner#3

Authored path: `checks.attempting.MentionPoint`.
- Covered by [Checks](../design/compositions/checks.md), line 12.
- Covered by [Checks](../design/compositions/checks.md), line 22.

```reaction
when RecallChecking.mention (attempt, item: cue), asked by checks.attempting.MentionPoint:owner#2
where
  earlier, RequestBoundary.request (attempt, cue, path: "/attempt/mention", requestId, session)
then
  RequestBoundary.respond (attempt, requestId)
```

### checks.attempting.MentionPoint:refused#2

Authored path: `checks.attempting.MentionPoint`.
- Covered by [Checks](../design/compositions/checks.md), line 12.
- Covered by [Checks](../design/compositions/checks.md), line 22.

```reaction
when Sessioning.use (session, subject: user), asked by checks.attempting.MentionPoint
where
  earlier, RequestBoundary.request (attempt, cue, path: "/attempt/mention", requestId, session)
  no view "(user) owns attempt (attempt)" with (attempt, user)
then
  RequestBoundary.respond (error: "NOT_FOUND", requestId)
```

### checks.attempting.OmitPoint

Authored path: `checks.attempting.OmitPoint`.
- Covered by [Checks](../design/compositions/checks.md), line 12.
- Covered by [Checks](../design/compositions/checks.md), line 23.

```reaction
when RequestBoundary.request (attempt, cue, path: "/attempt/omit", requestId, session)
then
  Sessioning.use (session)
```

### checks.attempting.OmitPoint:owner#2

Authored path: `checks.attempting.OmitPoint`.
- Covered by [Checks](../design/compositions/checks.md), line 12.
- Covered by [Checks](../design/compositions/checks.md), line 23.

```reaction
when Sessioning.use (session, subject: user), asked by checks.attempting.OmitPoint
where
  earlier, RequestBoundary.request (attempt, cue, path: "/attempt/omit", requestId, session)
  view "(user) owns attempt (attempt)" with (attempt, user)
then
  RecallChecking.omit (attempt, item: cue)
```

### checks.attempting.OmitPoint:owner#3

Authored path: `checks.attempting.OmitPoint`.
- Covered by [Checks](../design/compositions/checks.md), line 12.
- Covered by [Checks](../design/compositions/checks.md), line 23.

```reaction
when RecallChecking.omit (attempt, item: cue), asked by checks.attempting.OmitPoint:owner#2
where
  earlier, RequestBoundary.request (attempt, cue, path: "/attempt/omit", requestId, session)
then
  RequestBoundary.respond (attempt, requestId)
```

### checks.attempting.OmitPoint:refused#2

Authored path: `checks.attempting.OmitPoint`.
- Covered by [Checks](../design/compositions/checks.md), line 12.
- Covered by [Checks](../design/compositions/checks.md), line 23.

```reaction
when Sessioning.use (session, subject: user), asked by checks.attempting.OmitPoint
where
  earlier, RequestBoundary.request (attempt, cue, path: "/attempt/omit", requestId, session)
  no view "(user) owns attempt (attempt)" with (attempt, user)
then
  RequestBoundary.respond (error: "NOT_FOUND", requestId)
```

### checks.attempting.StartAttempt

Authored path: `checks.attempting.StartAttempt`.
- Covered by [Checks](../design/compositions/checks.md), line 12.
- Covered by [Checks](../design/compositions/checks.md), line 19.

```reaction
when RequestBoundary.request (check, path: "/check/attempt", requestId, session)
then
  Sessioning.use (session)
```

### checks.attempting.StartAttempt:empty#2

Authored path: `checks.attempting.StartAttempt`.
- Covered by [Checks](../design/compositions/checks.md), line 12.
- Covered by [Checks](../design/compositions/checks.md), line 19.

```reaction
when Sessioning.use (session, subject: user), asked by checks.attempting.StartAttempt
where
  earlier, RequestBoundary.request (check, path: "/check/attempt", requestId, session)
  view "(user) owns check (check)" with (check, user)
  no view "(check) has points" with (check)
then
  RequestBoundary.respond (error: "EMPTY_PROMPT", requestId)
```

### checks.attempting.StartAttempt:owner#2

Authored path: `checks.attempting.StartAttempt`.
- Covered by [Checks](../design/compositions/checks.md), line 12.
- Covered by [Checks](../design/compositions/checks.md), line 19.

```reaction
when Sessioning.use (session, subject: user), asked by checks.attempting.StartAttempt
where
  earlier, RequestBoundary.request (check, path: "/check/attempt", requestId, session)
  view "(user) owns check (check)" with (check, user)
  view "(check) has points" with (check)
then
  RecallChecking.attempt (check)
```

### checks.attempting.StartAttempt:owner#3

Authored path: `checks.attempting.StartAttempt`.
- Covered by [Checks](../design/compositions/checks.md), line 12.
- Covered by [Checks](../design/compositions/checks.md), line 19.

```reaction
when RecallChecking.attempt (check, attempt), asked by checks.attempting.StartAttempt:owner#2
where
  earlier, RequestBoundary.request (check, path: "/check/attempt", requestId, session)
then
  RequestBoundary.respond (attempt, requestId)
```

### checks.attempting.StartAttempt:refused#2

Authored path: `checks.attempting.StartAttempt`.
- Covered by [Checks](../design/compositions/checks.md), line 12.
- Covered by [Checks](../design/compositions/checks.md), line 19.

```reaction
when Sessioning.use (session, subject: user), asked by checks.attempting.StartAttempt
where
  earlier, RequestBoundary.request (check, path: "/check/attempt", requestId, session)
  no view "(user) owns check (check)" with (check, user)
then
  RequestBoundary.respond (error: "NOT_FOUND", requestId)
```

### checks.attempting.SubmitAttempt

Authored path: `checks.attempting.SubmitAttempt`.
- Covered by [Checks](../design/compositions/checks.md), line 12.
- Covered by [Checks](../design/compositions/checks.md), line 20.

```reaction
when RequestBoundary.request (attempt, path: "/attempt/submit", requestId, session)
then
  Sessioning.use (session)
```

### checks.attempting.SubmitAttempt:owner#2

Authored path: `checks.attempting.SubmitAttempt`.
- Covered by [Checks](../design/compositions/checks.md), line 12.
- Covered by [Checks](../design/compositions/checks.md), line 20.

```reaction
when Sessioning.use (session, subject: user), asked by checks.attempting.SubmitAttempt
where
  earlier, RequestBoundary.request (attempt, path: "/attempt/submit", requestId, session)
  view "(user) owns attempt (attempt)" with (attempt, user)
then
  RecallChecking.submit (attempt)
```

### checks.attempting.SubmitAttempt:owner#3

Authored path: `checks.attempting.SubmitAttempt`.
- Covered by [Checks](../design/compositions/checks.md), line 12.
- Covered by [Checks](../design/compositions/checks.md), line 20.

```reaction
when RecallChecking.submit (attempt), asked by checks.attempting.SubmitAttempt:owner#2
where
  earlier, RequestBoundary.request (attempt, path: "/attempt/submit", requestId, session)
then
  RequestBoundary.respond (attempt, requestId)
```

### checks.attempting.SubmitAttempt:refused#2

Authored path: `checks.attempting.SubmitAttempt`.
- Covered by [Checks](../design/compositions/checks.md), line 12.
- Covered by [Checks](../design/compositions/checks.md), line 20.

```reaction
when Sessioning.use (session, subject: user), asked by checks.attempting.SubmitAttempt
where
  earlier, RequestBoundary.request (attempt, path: "/attempt/submit", requestId, session)
  no view "(user) owns attempt (attempt)" with (attempt, user)
then
  RequestBoundary.respond (error: "NOT_FOUND", requestId)
```

### checks.deleting.DeleteCheck

Authored path: `checks.deleting.DeleteCheck`.
- Covered by [Checks](../design/compositions/checks.md), line 28.
- Covered by [Checks](../design/compositions/checks.md), line 33.

```reaction
when RequestBoundary.request (check, path: "/check/delete", requestId, session)
then
  Sessioning.use (session)
```

### checks.deleting.DeleteCheck:owner#2

Authored path: `checks.deleting.DeleteCheck`.
- Covered by [Checks](../design/compositions/checks.md), line 28.
- Covered by [Checks](../design/compositions/checks.md), line 33.

```reaction
when Sessioning.use (session, subject: user), asked by checks.deleting.DeleteCheck
where
  earlier, RequestBoundary.request (check, path: "/check/delete", requestId, session)
  view "(user) owns check (check)" with (check, user)
then
  RecallChecking.delete (check)
```

### checks.deleting.DeleteCheck:owner#3

Authored path: `checks.deleting.DeleteCheck`.
- Covered by [Checks](../design/compositions/checks.md), line 28.
- Covered by [Checks](../design/compositions/checks.md), line 33.

```reaction
when RecallChecking.delete (check), asked by checks.deleting.DeleteCheck:owner#2
where
  earlier, RequestBoundary.request (check, path: "/check/delete", requestId, session)
then
  RequestBoundary.respond (check, requestId)
```

### checks.deleting.DeleteCheck:refused#2

Authored path: `checks.deleting.DeleteCheck`.
- Covered by [Checks](../design/compositions/checks.md), line 28.
- Covered by [Checks](../design/compositions/checks.md), line 33.

```reaction
when Sessioning.use (session, subject: user), asked by checks.deleting.DeleteCheck
where
  earlier, RequestBoundary.request (check, path: "/check/delete", requestId, session)
  no view "(user) owns check (check)" with (check, user)
then
  RequestBoundary.respond (error: "NOT_FOUND", requestId)
```

### checks.opening.OpenCheck

Authored path: `checks.opening.OpenCheck`.
- Covered by [Checks](../design/compositions/checks.md), line 4.
- Covered by [Checks](../design/compositions/checks.md), line 7.
- Covered by [Sharing](../design/compositions/sharing.md), line 18.

```reaction
when RequestBoundary.request (name, path: "/check/open", requestId, session)
then
  Sessioning.use (session)
```

### checks.opening.OpenCheck#2

Authored path: `checks.opening.OpenCheck`.
- Covered by [Checks](../design/compositions/checks.md), line 4.
- Covered by [Checks](../design/compositions/checks.md), line 7.
- Covered by [Sharing](../design/compositions/sharing.md), line 18.

```reaction
when Sessioning.use (session, subject: user), asked by checks.opening.OpenCheck
where
  earlier, RequestBoundary.request (name, path: "/check/open", requestId, session)
then
  RecallChecking.open (name, owner: user)
```

### checks.opening.OpenCheck#3

Authored path: `checks.opening.OpenCheck`.
- Covered by [Checks](../design/compositions/checks.md), line 4.
- Covered by [Checks](../design/compositions/checks.md), line 7.
- Covered by [Sharing](../design/compositions/sharing.md), line 18.

```reaction
when RecallChecking.open (name, owner: user, check), asked by checks.opening.OpenCheck#2
where
  earlier, RequestBoundary.request (name, path: "/check/open", requestId, session)
then
  RequestBoundary.respond (check, requestId)
```

### checks.renaming.RenameCheck

Authored path: `checks.renaming.RenameCheck`.
- Covered by [Checks](../design/compositions/checks.md), line 28.
- Covered by [Checks](../design/compositions/checks.md), line 32.

```reaction
when RequestBoundary.request (check, name, path: "/check/rename", requestId, session)
then
  Sessioning.use (session)
```

### checks.renaming.RenameCheck:owner#2

Authored path: `checks.renaming.RenameCheck`.
- Covered by [Checks](../design/compositions/checks.md), line 28.
- Covered by [Checks](../design/compositions/checks.md), line 32.

```reaction
when Sessioning.use (session, subject: user), asked by checks.renaming.RenameCheck
where
  earlier, RequestBoundary.request (check, name, path: "/check/rename", requestId, session)
  view "(user) owns check (check)" with (check, user)
then
  RecallChecking.rename (check, name)
```

### checks.renaming.RenameCheck:owner#3

Authored path: `checks.renaming.RenameCheck`.
- Covered by [Checks](../design/compositions/checks.md), line 28.
- Covered by [Checks](../design/compositions/checks.md), line 32.

```reaction
when RecallChecking.rename (check, name), asked by checks.renaming.RenameCheck:owner#2
where
  earlier, RequestBoundary.request (check, name, path: "/check/rename", requestId, session)
then
  RequestBoundary.respond (check, requestId)
```

### checks.renaming.RenameCheck:refused#2

Authored path: `checks.renaming.RenameCheck`.
- Covered by [Checks](../design/compositions/checks.md), line 28.
- Covered by [Checks](../design/compositions/checks.md), line 32.

```reaction
when Sessioning.use (session, subject: user), asked by checks.renaming.RenameCheck
where
  earlier, RequestBoundary.request (check, name, path: "/check/rename", requestId, session)
  no view "(user) owns check (check)" with (check, user)
then
  RequestBoundary.respond (error: "NOT_FOUND", requestId)
```

### checks.showing.ShowAttempt

Authored path: `checks.showing.ShowAttempt`.
- Covered by [Checks](../design/compositions/checks.md), line 12.
- Covered by [Checks](../design/compositions/checks.md), line 21.

```reaction
when RequestBoundary.request (attempt, path: "/attempt/show", requestId, session)
then
  Sessioning.use (session)
```

### checks.showing.ShowAttempt:owner#2

Authored path: `checks.showing.ShowAttempt`.
- Covered by [Checks](../design/compositions/checks.md), line 12.
- Covered by [Checks](../design/compositions/checks.md), line 21.

```reaction
when Sessioning.use (session, subject: user), asked by checks.showing.ShowAttempt
where
  earlier, RequestBoundary.request (attempt, path: "/attempt/show", requestId, session)
  view "(user) owns attempt (attempt)" with (attempt, user)
  RecallChecking._attempt (attempt) has (check, credit, status)
  RecallChecking._get (check) has (name: checkName)
then
  RequestBoundary.respond (check, checkName, credit, mentioned: former "the points mentioned in (attempt)" with (attempt), omitted: former "the points omitted from (attempt)" with (attempt), requestId, status, subject: former "the points of (attempt)" with (attempt))
```

### checks.showing.ShowAttempt:refused#2

Authored path: `checks.showing.ShowAttempt`.
- Covered by [Checks](../design/compositions/checks.md), line 12.
- Covered by [Checks](../design/compositions/checks.md), line 21.

```reaction
when Sessioning.use (session, subject: user), asked by checks.showing.ShowAttempt
where
  earlier, RequestBoundary.request (attempt, path: "/attempt/show", requestId, session)
  no view "(user) owns attempt (attempt)" with (attempt, user)
then
  RequestBoundary.respond (error: "NOT_FOUND", requestId)
```

### checks.showing.ShowCheck

Authored path: `checks.showing.ShowCheck`.
- Covered by [Checks](../design/compositions/checks.md), line 28.
- Covered by [Checks](../design/compositions/checks.md), line 34.

```reaction
when RequestBoundary.request (check, path: "/check/show", requestId, session)
then
  Sessioning.use (session)
```

### checks.showing.ShowCheck:owner#2

Authored path: `checks.showing.ShowCheck`.
- Covered by [Checks](../design/compositions/checks.md), line 28.
- Covered by [Checks](../design/compositions/checks.md), line 34.

```reaction
when Sessioning.use (session, subject: user), asked by checks.showing.ShowCheck
where
  earlier, RequestBoundary.request (check, path: "/check/show", requestId, session)
  view "(user) owns check (check)" with (check, user)
  RecallChecking._get (check) has (name)
then
  RequestBoundary.respond (attempts: former "the attempts of (check)" with (check), current: former "the current attempt of (check)" with (check), name, recipients: former "the recipients of (check)" with (check), requestId, schedule: former "the schedule of (check)" with (check), subject: former "the subject of (check)" with (check))
```

### checks.showing.ShowCheck:refused#2

Authored path: `checks.showing.ShowCheck`.
- Covered by [Checks](../design/compositions/checks.md), line 28.
- Covered by [Checks](../design/compositions/checks.md), line 34.

```reaction
when Sessioning.use (session, subject: user), asked by checks.showing.ShowCheck
where
  earlier, RequestBoundary.request (check, path: "/check/show", requestId, session)
  no view "(user) owns check (check)" with (check, user)
then
  RequestBoundary.respond (error: "NOT_FOUND", requestId)
```

### checks.subjects.ExcludeDeleted

Authored path: `checks.subjects.ExcludeDeleted`.
- Covered by [Checks](../design/compositions/checks.md), line 4.

```reaction
when Cueing.delete (cue)
where
  RecallChecking._including (item: cue) has (check)
then
  RecallChecking.exclude (check, item: cue)
```

### checks.subjects.ExcludePoint

Authored path: `checks.subjects.ExcludePoint`.
- Covered by [Checks](../design/compositions/checks.md), line 4.
- Covered by [Checks](../design/compositions/checks.md), line 9.

```reaction
when RequestBoundary.request (check, cue, path: "/check/exclude", requestId, session)
then
  Sessioning.use (session)
```

### checks.subjects.ExcludePoint:excluded#2

Authored path: `checks.subjects.ExcludePoint`.
- Covered by [Checks](../design/compositions/checks.md), line 4.
- Covered by [Checks](../design/compositions/checks.md), line 9.

```reaction
when Sessioning.use (session, subject: user), asked by checks.subjects.ExcludePoint
where
  earlier, RequestBoundary.request (check, cue, path: "/check/exclude", requestId, session)
  view "(user) owns check (check)" with (check, user)
  view "(user) owns point (cue)" with (cue, user)
  no RecallChecking._subject (check) has (item: cue)
then
  RequestBoundary.respond (check, requestId)
```

### checks.subjects.ExcludePoint:no-check#2

Authored path: `checks.subjects.ExcludePoint`.
- Covered by [Checks](../design/compositions/checks.md), line 4.
- Covered by [Checks](../design/compositions/checks.md), line 9.

```reaction
when Sessioning.use (session, subject: user), asked by checks.subjects.ExcludePoint
where
  earlier, RequestBoundary.request (check, cue, path: "/check/exclude", requestId, session)
  no view "(user) owns check (check)" with (check, user)
then
  RequestBoundary.respond (error: "NOT_FOUND", requestId)
```

### checks.subjects.ExcludePoint:no-point#2

Authored path: `checks.subjects.ExcludePoint`.
- Covered by [Checks](../design/compositions/checks.md), line 4.
- Covered by [Checks](../design/compositions/checks.md), line 9.

```reaction
when Sessioning.use (session, subject: user), asked by checks.subjects.ExcludePoint
where
  earlier, RequestBoundary.request (check, cue, path: "/check/exclude", requestId, session)
  view "(user) owns check (check)" with (check, user)
  no view "(user) owns point (cue)" with (cue, user)
then
  RequestBoundary.respond (error: "NOT_FOUND", requestId)
```

### checks.subjects.ExcludePoint:owner#2

Authored path: `checks.subjects.ExcludePoint`.
- Covered by [Checks](../design/compositions/checks.md), line 4.
- Covered by [Checks](../design/compositions/checks.md), line 9.

```reaction
when Sessioning.use (session, subject: user), asked by checks.subjects.ExcludePoint
where
  earlier, RequestBoundary.request (check, cue, path: "/check/exclude", requestId, session)
  view "(user) owns check (check)" with (check, user)
  view "(user) owns point (cue)" with (cue, user)
  RecallChecking._subject (check) has (item: cue)
then
  RecallChecking.exclude (check, item: cue)
```

### checks.subjects.ExcludePoint:owner#3

Authored path: `checks.subjects.ExcludePoint`.
- Covered by [Checks](../design/compositions/checks.md), line 4.
- Covered by [Checks](../design/compositions/checks.md), line 9.

```reaction
when RecallChecking.exclude (check, item: cue), asked by checks.subjects.ExcludePoint:owner#2
where
  earlier, RequestBoundary.request (check, cue, path: "/check/exclude", requestId, session)
then
  RequestBoundary.respond (check, requestId)
```

### checks.subjects.IncludePoint

Authored path: `checks.subjects.IncludePoint`.
- Covered by [Checks](../design/compositions/checks.md), line 4.
- Covered by [Checks](../design/compositions/checks.md), line 8.
- Covered by [Sharing](../design/compositions/sharing.md), line 18.

```reaction
when RequestBoundary.request (check, cue, path: "/check/include", requestId, session)
then
  Sessioning.use (session)
```

### checks.subjects.IncludePoint:included#2

Authored path: `checks.subjects.IncludePoint`.
- Covered by [Checks](../design/compositions/checks.md), line 4.
- Covered by [Checks](../design/compositions/checks.md), line 8.
- Covered by [Sharing](../design/compositions/sharing.md), line 18.

```reaction
when Sessioning.use (session, subject: user), asked by checks.subjects.IncludePoint
where
  earlier, RequestBoundary.request (check, cue, path: "/check/include", requestId, session)
  view "(user) owns check (check)" with (check, user)
  view "(user) owns point (cue)" with (cue, user)
  RecallChecking._subject (check) has (item: cue)
then
  RequestBoundary.respond (check, requestId)
```

### checks.subjects.IncludePoint:no-check#2

Authored path: `checks.subjects.IncludePoint`.
- Covered by [Checks](../design/compositions/checks.md), line 4.
- Covered by [Checks](../design/compositions/checks.md), line 8.
- Covered by [Sharing](../design/compositions/sharing.md), line 18.

```reaction
when Sessioning.use (session, subject: user), asked by checks.subjects.IncludePoint
where
  earlier, RequestBoundary.request (check, cue, path: "/check/include", requestId, session)
  no view "(user) owns check (check)" with (check, user)
then
  RequestBoundary.respond (error: "NOT_FOUND", requestId)
```

### checks.subjects.IncludePoint:no-point#2

Authored path: `checks.subjects.IncludePoint`.
- Covered by [Checks](../design/compositions/checks.md), line 4.
- Covered by [Checks](../design/compositions/checks.md), line 8.
- Covered by [Sharing](../design/compositions/sharing.md), line 18.

```reaction
when Sessioning.use (session, subject: user), asked by checks.subjects.IncludePoint
where
  earlier, RequestBoundary.request (check, cue, path: "/check/include", requestId, session)
  view "(user) owns check (check)" with (check, user)
  no view "(user) owns point (cue)" with (cue, user)
then
  RequestBoundary.respond (error: "NOT_FOUND", requestId)
```

### checks.subjects.IncludePoint:owner#2

Authored path: `checks.subjects.IncludePoint`.
- Covered by [Checks](../design/compositions/checks.md), line 4.
- Covered by [Checks](../design/compositions/checks.md), line 8.
- Covered by [Sharing](../design/compositions/sharing.md), line 18.

```reaction
when Sessioning.use (session, subject: user), asked by checks.subjects.IncludePoint
where
  earlier, RequestBoundary.request (check, cue, path: "/check/include", requestId, session)
  view "(user) owns check (check)" with (check, user)
  view "(user) owns point (cue)" with (cue, user)
  no RecallChecking._subject (check) has (item: cue)
  Cueing._get (cue) has (name: pointName)
then
  RecallChecking.include (check, item: cue, name: pointName)
```

### checks.subjects.IncludePoint:owner#3

Authored path: `checks.subjects.IncludePoint`.
- Covered by [Checks](../design/compositions/checks.md), line 4.
- Covered by [Checks](../design/compositions/checks.md), line 8.
- Covered by [Sharing](../design/compositions/sharing.md), line 18.

```reaction
when RecallChecking.include (check, item: cue, name: pointName), asked by checks.subjects.IncludePoint:owner#2
where
  earlier, RequestBoundary.request (check, cue, path: "/check/include", requestId, session)
then
  RequestBoundary.respond (check, requestId)
```

### checks.subjects.RelabelRenamed

Authored path: `checks.subjects.RelabelRenamed`.
- Covered by [Checks](../design/compositions/checks.md), line 4.

```reaction
when Cueing.rename (cue)
where
  Cueing._get (cue) has (name)
then
  RecallChecking.relabel (item: cue, name)
```

### home.showing.ShowHome

Authored path: `home.showing.ShowHome`.
- Covered by [Home](../design/compositions/home.md), line 3.
- Covered by [Home](../design/compositions/home.md), line 12.

```reaction
when RequestBoundary.request (path: "/home", requestId, session)
then
  Sessioning.use (session)
```

### home.showing.ShowHome#2

Authored path: `home.showing.ShowHome`.
- Covered by [Home](../design/compositions/home.md), line 3.
- Covered by [Home](../design/compositions/home.md), line 12.

```reaction
when Sessioning.use (session, subject: user), asked by home.showing.ShowHome
where
  instant is the current flow's instant
  earlier, RequestBoundary.request (path: "/home", requestId, session)
then
  RequestBoundary.respond (dueChecks: former "the checks (user) has due by (before)" with (before: instant, user), myChecks: former "the checks (user) owns" with (user), myPoints: former "the points (user) owns" with (user), myTopics: former "the topics (user) owns" with (user), requestId, scheduledChecks: former "the checks (user) tracks" with (user), suggestedCards: former "the cards suggested to (user)" with (user))
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
- Covered by [Sharing](../design/compositions/sharing.md), line 18.

```reaction
when RequestBoundary.request (name, path: "/point/create", requestId, session)
then
  Sessioning.use (session)
```

### points.creating.CreatePoint#2

Authored path: `points.creating.CreatePoint`.
- Covered by [Points](../design/compositions/points.md), line 4.
- Covered by [Points](../design/compositions/points.md), line 7.
- Covered by [Sharing](../design/compositions/sharing.md), line 18.

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
- Covered by [Sharing](../design/compositions/sharing.md), line 18.

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

### points.moving.UnplacePoint

Authored path: `points.moving.UnplacePoint`.
- Covered by [Points](../design/compositions/points.md), line 30.
- Covered by [Points](../design/compositions/points.md), line 33.

```reaction
when RequestBoundary.request (cue, path: "/point/unplace", requestId, session)
then
  Sessioning.use (session)
```

### points.moving.UnplacePoint:creator#2

Authored path: `points.moving.UnplacePoint`.
- Covered by [Points](../design/compositions/points.md), line 30.
- Covered by [Points](../design/compositions/points.md), line 33.

```reaction
when Sessioning.use (session, subject: user), asked by points.moving.UnplacePoint
where
  earlier, RequestBoundary.request (cue, path: "/point/unplace", requestId, session)
  view "(user) owns point (cue)" with (cue, user)
  Categorizing._category (item: cue)
then
  Categorizing.unplace (item: cue)
```

### points.moving.UnplacePoint:creator#3

Authored path: `points.moving.UnplacePoint`.
- Covered by [Points](../design/compositions/points.md), line 30.
- Covered by [Points](../design/compositions/points.md), line 33.

```reaction
when Categorizing.unplace (item: cue), asked by points.moving.UnplacePoint:creator#2
where
  earlier, RequestBoundary.request (cue, path: "/point/unplace", requestId, session)
then
  RequestBoundary.respond (cue, requestId)
```

### points.moving.UnplacePoint:refused#2

Authored path: `points.moving.UnplacePoint`.
- Covered by [Points](../design/compositions/points.md), line 30.
- Covered by [Points](../design/compositions/points.md), line 33.

```reaction
when Sessioning.use (session, subject: user), asked by points.moving.UnplacePoint
where
  earlier, RequestBoundary.request (cue, path: "/point/unplace", requestId, session)
  no view "(user) owns point (cue)" with (cue, user)
then
  RequestBoundary.respond (error: "NOT_FOUND", requestId)
```

### points.moving.UnplacePoint:unsorted#2

Authored path: `points.moving.UnplacePoint`.
- Covered by [Points](../design/compositions/points.md), line 30.
- Covered by [Points](../design/compositions/points.md), line 33.

```reaction
when Sessioning.use (session, subject: user), asked by points.moving.UnplacePoint
where
  earlier, RequestBoundary.request (cue, path: "/point/unplace", requestId, session)
  view "(user) owns point (cue)" with (cue, user)
  no Categorizing._category (item: cue)
then
  RequestBoundary.respond (cue, requestId)
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

### scheduling.reviewing.ReviewClosed

Authored path: `scheduling.reviewing.ReviewClosed`.
- Covered by [Scheduling](../design/compositions/scheduling.md), line 11.

```reaction
when RecallChecking.close (check, credit)
where
  SpacedRepetition._entry (item: check)
then
  SpacedRepetition.review (credit, item: check)
```

### scheduling.tracking.DropDeleted

Authored path: `scheduling.tracking.DropDeleted`.
- Covered by [Scheduling](../design/compositions/scheduling.md), line 11.

```reaction
when RecallChecking.delete (check)
where
  SpacedRepetition._entry (item: check)
then
  SpacedRepetition.drop (item: check)
```

### scheduling.tracking.TrackCheck

Authored path: `scheduling.tracking.TrackCheck`.
- Covered by [Scheduling](../design/compositions/scheduling.md), line 4.
- Covered by [Scheduling](../design/compositions/scheduling.md), line 7.

```reaction
when RequestBoundary.request (check, path: "/check/track", requestId, session)
then
  Sessioning.use (session)
```

### scheduling.tracking.TrackCheck:owner#2

Authored path: `scheduling.tracking.TrackCheck`.
- Covered by [Scheduling](../design/compositions/scheduling.md), line 4.
- Covered by [Scheduling](../design/compositions/scheduling.md), line 7.

```reaction
when Sessioning.use (session, subject: user), asked by scheduling.tracking.TrackCheck
where
  earlier, RequestBoundary.request (check, path: "/check/track", requestId, session)
  view "(user) owns check (check)" with (check, user)
  no SpacedRepetition._entry (item: check)
then
  SpacedRepetition.enroll (item: check)
```

### scheduling.tracking.TrackCheck:owner#3

Authored path: `scheduling.tracking.TrackCheck`.
- Covered by [Scheduling](../design/compositions/scheduling.md), line 4.
- Covered by [Scheduling](../design/compositions/scheduling.md), line 7.

```reaction
when SpacedRepetition.enroll (item: check), asked by scheduling.tracking.TrackCheck:owner#2
where
  earlier, RequestBoundary.request (check, path: "/check/track", requestId, session)
then
  RequestBoundary.respond (check, requestId)
```

### scheduling.tracking.TrackCheck:refused#2

Authored path: `scheduling.tracking.TrackCheck`.
- Covered by [Scheduling](../design/compositions/scheduling.md), line 4.
- Covered by [Scheduling](../design/compositions/scheduling.md), line 7.

```reaction
when Sessioning.use (session, subject: user), asked by scheduling.tracking.TrackCheck
where
  earlier, RequestBoundary.request (check, path: "/check/track", requestId, session)
  no view "(user) owns check (check)" with (check, user)
then
  RequestBoundary.respond (error: "NOT_FOUND", requestId)
```

### scheduling.tracking.TrackCheck:tracked#2

Authored path: `scheduling.tracking.TrackCheck`.
- Covered by [Scheduling](../design/compositions/scheduling.md), line 4.
- Covered by [Scheduling](../design/compositions/scheduling.md), line 7.

```reaction
when Sessioning.use (session, subject: user), asked by scheduling.tracking.TrackCheck
where
  earlier, RequestBoundary.request (check, path: "/check/track", requestId, session)
  view "(user) owns check (check)" with (check, user)
  SpacedRepetition._entry (item: check)
then
  RequestBoundary.respond (check, requestId)
```

### scheduling.tracking.UntrackCheck

Authored path: `scheduling.tracking.UntrackCheck`.
- Covered by [Scheduling](../design/compositions/scheduling.md), line 4.
- Covered by [Scheduling](../design/compositions/scheduling.md), line 8.

```reaction
when RequestBoundary.request (check, path: "/check/untrack", requestId, session)
then
  Sessioning.use (session)
```

### scheduling.tracking.UntrackCheck:owner#2

Authored path: `scheduling.tracking.UntrackCheck`.
- Covered by [Scheduling](../design/compositions/scheduling.md), line 4.
- Covered by [Scheduling](../design/compositions/scheduling.md), line 8.

```reaction
when Sessioning.use (session, subject: user), asked by scheduling.tracking.UntrackCheck
where
  earlier, RequestBoundary.request (check, path: "/check/untrack", requestId, session)
  view "(user) owns check (check)" with (check, user)
  SpacedRepetition._entry (item: check)
then
  SpacedRepetition.drop (item: check)
```

### scheduling.tracking.UntrackCheck:owner#3

Authored path: `scheduling.tracking.UntrackCheck`.
- Covered by [Scheduling](../design/compositions/scheduling.md), line 4.
- Covered by [Scheduling](../design/compositions/scheduling.md), line 8.

```reaction
when SpacedRepetition.drop (item: check), asked by scheduling.tracking.UntrackCheck:owner#2
where
  earlier, RequestBoundary.request (check, path: "/check/untrack", requestId, session)
then
  RequestBoundary.respond (check, requestId)
```

### scheduling.tracking.UntrackCheck:refused#2

Authored path: `scheduling.tracking.UntrackCheck`.
- Covered by [Scheduling](../design/compositions/scheduling.md), line 4.
- Covered by [Scheduling](../design/compositions/scheduling.md), line 8.

```reaction
when Sessioning.use (session, subject: user), asked by scheduling.tracking.UntrackCheck
where
  earlier, RequestBoundary.request (check, path: "/check/untrack", requestId, session)
  no view "(user) owns check (check)" with (check, user)
then
  RequestBoundary.respond (error: "NOT_FOUND", requestId)
```

### scheduling.tracking.UntrackCheck:untracked#2

Authored path: `scheduling.tracking.UntrackCheck`.
- Covered by [Scheduling](../design/compositions/scheduling.md), line 4.
- Covered by [Scheduling](../design/compositions/scheduling.md), line 8.

```reaction
when Sessioning.use (session, subject: user), asked by scheduling.tracking.UntrackCheck
where
  earlier, RequestBoundary.request (check, path: "/check/untrack", requestId, session)
  view "(user) owns check (check)" with (check, user)
  no SpacedRepetition._entry (item: check)
then
  RequestBoundary.respond (check, requestId)
```

### sharing.revoking.RevokeDeleted

Authored path: `sharing.revoking.RevokeDeleted`.
- Covered by [Sharing](../design/compositions/sharing.md), line 20.

```reaction
when RecallChecking.delete (check)
where
  Sharing._recipients (item: check) has (recipient)
then
  Sharing.revoke (item: check, recipient)
```

### sharing.sharing.ShareCheck

Authored path: `sharing.sharing.ShareCheck`.
- Covered by [Sharing](../design/compositions/sharing.md), line 4.
- Covered by [Sharing](../design/compositions/sharing.md), line 7.

```reaction
when RequestBoundary.request (check, path: "/check/share", requestId, session, username)
then
  Sessioning.use (session)
```

### sharing.sharing.ShareCheck:no-user#2

Authored path: `sharing.sharing.ShareCheck`.
- Covered by [Sharing](../design/compositions/sharing.md), line 4.
- Covered by [Sharing](../design/compositions/sharing.md), line 7.

```reaction
when Sessioning.use (session, subject: user), asked by sharing.sharing.ShareCheck
where
  earlier, RequestBoundary.request (check, path: "/check/share", requestId, session, username)
  view "(user) owns check (check)" with (check, user)
  no Registering._byUsername (username)
then
  RequestBoundary.respond (error: "NO_SUCH_USER", requestId)
```

### sharing.sharing.ShareCheck:owner#2

Authored path: `sharing.sharing.ShareCheck`.
- Covered by [Sharing](../design/compositions/sharing.md), line 4.
- Covered by [Sharing](../design/compositions/sharing.md), line 7.

```reaction
when Sessioning.use (session, subject: user), asked by sharing.sharing.ShareCheck
where
  earlier, RequestBoundary.request (check, path: "/check/share", requestId, session, username)
  view "(user) owns check (check)" with (check, user)
  Registering._byUsername (username) has (user: recipient)
  no Registering._byUsername (username) has (user)
  no Sharing._recipients (item: check) has (recipient)
then
  Sharing.share (item: check, recipient)
```

### sharing.sharing.ShareCheck:owner#3

Authored path: `sharing.sharing.ShareCheck`.
- Covered by [Sharing](../design/compositions/sharing.md), line 4.
- Covered by [Sharing](../design/compositions/sharing.md), line 7.

```reaction
when Sharing.share (item: check, recipient), asked by sharing.sharing.ShareCheck:owner#2
where
  earlier, RequestBoundary.request (check, path: "/check/share", requestId, session, username)
then
  RequestBoundary.respond (check, requestId)
```

### sharing.sharing.ShareCheck:refused#2

Authored path: `sharing.sharing.ShareCheck`.
- Covered by [Sharing](../design/compositions/sharing.md), line 4.
- Covered by [Sharing](../design/compositions/sharing.md), line 7.

```reaction
when Sessioning.use (session, subject: user), asked by sharing.sharing.ShareCheck
where
  earlier, RequestBoundary.request (check, path: "/check/share", requestId, session, username)
  no view "(user) owns check (check)" with (check, user)
then
  RequestBoundary.respond (error: "NOT_FOUND", requestId)
```

### sharing.sharing.ShareCheck:self#2

Authored path: `sharing.sharing.ShareCheck`.
- Covered by [Sharing](../design/compositions/sharing.md), line 4.
- Covered by [Sharing](../design/compositions/sharing.md), line 7.

```reaction
when Sessioning.use (session, subject: user), asked by sharing.sharing.ShareCheck
where
  earlier, RequestBoundary.request (check, path: "/check/share", requestId, session, username)
  view "(user) owns check (check)" with (check, user)
  Registering._byUsername (username) has (user)
then
  RequestBoundary.respond (error: "SHARE_WITH_SELF", requestId)
```

### sharing.sharing.ShareCheck:shared#2

Authored path: `sharing.sharing.ShareCheck`.
- Covered by [Sharing](../design/compositions/sharing.md), line 4.
- Covered by [Sharing](../design/compositions/sharing.md), line 7.

```reaction
when Sessioning.use (session, subject: user), asked by sharing.sharing.ShareCheck
where
  earlier, RequestBoundary.request (check, path: "/check/share", requestId, session, username)
  view "(user) owns check (check)" with (check, user)
  Registering._byUsername (username) has (user: recipient)
  Sharing._recipients (item: check) has (recipient)
then
  RequestBoundary.respond (check, requestId)
```

### sharing.sharing.UnshareCheck

Authored path: `sharing.sharing.UnshareCheck`.
- Covered by [Sharing](../design/compositions/sharing.md), line 4.
- Covered by [Sharing](../design/compositions/sharing.md), line 8.

```reaction
when RequestBoundary.request (check, path: "/check/unshare", requestId, session, username)
then
  Sessioning.use (session)
```

### sharing.sharing.UnshareCheck:no-user#2

Authored path: `sharing.sharing.UnshareCheck`.
- Covered by [Sharing](../design/compositions/sharing.md), line 4.
- Covered by [Sharing](../design/compositions/sharing.md), line 8.

```reaction
when Sessioning.use (session, subject: user), asked by sharing.sharing.UnshareCheck
where
  earlier, RequestBoundary.request (check, path: "/check/unshare", requestId, session, username)
  view "(user) owns check (check)" with (check, user)
  no Registering._byUsername (username)
then
  RequestBoundary.respond (check, requestId)
```

### sharing.sharing.UnshareCheck:not-shared#2

Authored path: `sharing.sharing.UnshareCheck`.
- Covered by [Sharing](../design/compositions/sharing.md), line 4.
- Covered by [Sharing](../design/compositions/sharing.md), line 8.

```reaction
when Sessioning.use (session, subject: user), asked by sharing.sharing.UnshareCheck
where
  earlier, RequestBoundary.request (check, path: "/check/unshare", requestId, session, username)
  view "(user) owns check (check)" with (check, user)
  Registering._byUsername (username) has (user: recipient)
  no Sharing._recipients (item: check) has (recipient)
then
  RequestBoundary.respond (check, requestId)
```

### sharing.sharing.UnshareCheck:owner#2

Authored path: `sharing.sharing.UnshareCheck`.
- Covered by [Sharing](../design/compositions/sharing.md), line 4.
- Covered by [Sharing](../design/compositions/sharing.md), line 8.

```reaction
when Sessioning.use (session, subject: user), asked by sharing.sharing.UnshareCheck
where
  earlier, RequestBoundary.request (check, path: "/check/unshare", requestId, session, username)
  view "(user) owns check (check)" with (check, user)
  Registering._byUsername (username) has (user: recipient)
  Sharing._recipients (item: check) has (recipient)
then
  Sharing.revoke (item: check, recipient)
```

### sharing.sharing.UnshareCheck:owner#3

Authored path: `sharing.sharing.UnshareCheck`.
- Covered by [Sharing](../design/compositions/sharing.md), line 4.
- Covered by [Sharing](../design/compositions/sharing.md), line 8.

```reaction
when Sharing.revoke (item: check, recipient), asked by sharing.sharing.UnshareCheck:owner#2
where
  earlier, RequestBoundary.request (check, path: "/check/unshare", requestId, session, username)
then
  RequestBoundary.respond (check, requestId)
```

### sharing.sharing.UnshareCheck:refused#2

Authored path: `sharing.sharing.UnshareCheck`.
- Covered by [Sharing](../design/compositions/sharing.md), line 4.
- Covered by [Sharing](../design/compositions/sharing.md), line 8.

```reaction
when Sessioning.use (session, subject: user), asked by sharing.sharing.UnshareCheck
where
  earlier, RequestBoundary.request (check, path: "/check/unshare", requestId, session, username)
  no view "(user) owns check (check)" with (check, user)
then
  RequestBoundary.respond (error: "NOT_FOUND", requestId)
```

### sharing.showing.ShowShared

Authored path: `sharing.showing.ShowShared`.
- Covered by [Sharing](../design/compositions/sharing.md), line 11.
- Covered by [Sharing](../design/compositions/sharing.md), line 14.

```reaction
when RequestBoundary.request (path: "/shared", requestId, session)
then
  Sessioning.use (session)
```

### sharing.showing.ShowShared#2

Authored path: `sharing.showing.ShowShared`.
- Covered by [Sharing](../design/compositions/sharing.md), line 11.
- Covered by [Sharing](../design/compositions/sharing.md), line 14.

```reaction
when Sessioning.use (session, subject: user), asked by sharing.showing.ShowShared
where
  earlier, RequestBoundary.request (path: "/shared", requestId, session)
then
  RequestBoundary.respond (requestId, shared: former "the checks shared with (user)" with (user))
```

### sharing.showing.ShowSharedCheck

Authored path: `sharing.showing.ShowSharedCheck`.
- Covered by [Sharing](../design/compositions/sharing.md), line 11.
- Covered by [Sharing](../design/compositions/sharing.md), line 15.

```reaction
when RequestBoundary.request (check, path: "/shared/show", requestId, session)
then
  Sessioning.use (session)
```

### sharing.showing.ShowSharedCheck:recipient#2

Authored path: `sharing.showing.ShowSharedCheck`.
- Covered by [Sharing](../design/compositions/sharing.md), line 11.
- Covered by [Sharing](../design/compositions/sharing.md), line 15.

```reaction
when Sessioning.use (session, subject: user), asked by sharing.showing.ShowSharedCheck
where
  earlier, RequestBoundary.request (check, path: "/shared/show", requestId, session)
  view "(check) is shared with (user)" with (check, user)
  RecallChecking._get (check) has (name, owner)
  Registering._username (user: owner) has (username: ownerUsername)
then
  RequestBoundary.respond (name, ownerUsername, points: former "the points of shared (check)" with (check), requestId)
```

### sharing.showing.ShowSharedCheck:refused#2

Authored path: `sharing.showing.ShowSharedCheck`.
- Covered by [Sharing](../design/compositions/sharing.md), line 11.
- Covered by [Sharing](../design/compositions/sharing.md), line 15.

```reaction
when Sessioning.use (session, subject: user), asked by sharing.showing.ShowSharedCheck
where
  earlier, RequestBoundary.request (check, path: "/shared/show", requestId, session)
  no view "(check) is shared with (user)" with (check, user)
then
  RequestBoundary.respond (error: "NOT_FOUND", requestId)
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

- `/attempt/abandon` — requires `attempt`, `session`
- `/attempt/close` — requires `attempt`, `session`
- `/attempt/mention` — requires `attempt`, `cue`, `session`
- `/attempt/omit` — requires `attempt`, `cue`, `session`
- `/attempt/show` — requires `attempt`, `session`
- `/attempt/submit` — requires `attempt`, `session`
- `/auth/login` — requires `password`, `username`
- `/auth/logout` — requires `session`
- `/auth/me` — requires `session`
- `/auth/register` — requires `password`, `username`
- `/card/remove` — requires `cue`, `session`
- `/card/revise` — requires `answer`, `cue`, `session`
- `/card/show` — requires `cue`, `session`
- `/card/write` — requires `answer`, `cue`, `session`
- `/check/attempt` — requires `check`, `session`
- `/check/delete` — requires `check`, `session`
- `/check/exclude` — requires `check`, `cue`, `session`
- `/check/include` — requires `check`, `cue`, `session`
- `/check/open` — requires `name`, `session`
- `/check/rename` — requires `check`, `name`, `session`
- `/check/share` — requires `check`, `session`, `username`
- `/check/show` — requires `check`, `session`
- `/check/track` — requires `check`, `session`
- `/check/unshare` — requires `check`, `session`, `username`
- `/check/untrack` — requires `check`, `session`
- `/home` — requires `session`
- `/point/create` — requires `name`, `session`
- `/point/createIn` — requires `category`, `name`, `session`
- `/point/delete` — requires `cue`, `session`
- `/point/move` — requires `cue`, `incidentCategory`, `session`
- `/point/rename` — requires `cue`, `name`, `session`
- `/point/unplace` — requires `cue`, `session`
- `/shared` — requires `session`
- `/shared/show` — requires `check`, `session`
- `/topic/create` — requires `name`, `session`
- `/topic/delete` — requires `category`, `session`
- `/topic/rename` — requires `category`, `newName`, `session`
