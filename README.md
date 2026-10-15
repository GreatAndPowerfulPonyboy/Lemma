# Lemma

Lemma is a study app for free recall. You name a topic, such as "Proof of the spectral theorem", and list short points under it. You don't write answers to them. To review, you choose the points you will try to recall, write out an explanation of the topic from memory, and then see which points you covered and which you missed. Points you miss come back the next day.

Lemma is my personal project for 6.1040 (Fall 2026). It is built from concepts on [sync-engine](https://github.com/mit-sdg/sync-engine), and its sign-in parts are copied from [ConceptBox](https://github.com/mit-sdg/conceptbox).

## Deliverables

### MVP


![Demo]https://github.com/user-attachments/assets/a9c7ca5e-59b3-4811-a1d0-b7be43f28d43


- [User journey: Matthew's journey with Lemma](DesignNotebook/UserJourney.md). This is the current version, matching the MVP.
- [Concept specifications](design/concepts/). These are the current versions; each is linked in [Concepts](#concepts).
- [How the concepts are instantiated](design/types.md)
- [Reactions, views, formers, and endpoints](design/compositions/). Each is linked in [Compositions](#compositions).
- [What the MVP leaves out](#what-the-mvp-leaves-out)

### Private

- [Design notes and reflections](https://github.com/GreatAndPowerfulPonyboy/6.1040/tree/main/DesignNotebook), in my 6.1040 repo

## Words in the app and in the design

| In the app | In the design |
|---|---|
| Topic | A category in [Categorizing](design/concepts/Categorizing.md) |
| Point | A cue in [Cueing](design/concepts/Cueing.md), placed in one category |
| Recall session | A check in [RecallChecking](design/concepts/RecallChecking.md) |
| Due | An entry in [SpacedRepetition](design/concepts/SpacedRepetition.md) whose due time has passed |

## Where things are

| | Design | Code | Tests |
|---|---|---|---|
| Concepts | [`design/concepts/`](design/concepts/) | [`src/concepts/`](src/concepts/) | [`tests/concepts/`](tests/concepts/) |
| Reactions, views, formers, endpoints | [`design/compositions/`](design/compositions/) | [`src/compositions/`](src/compositions/) | [`tests/compositions/`](tests/compositions/) |
| Which types each concept is instantiated with | [`design/types.md`](design/types.md) | [`src/concepts.ts`](src/concepts.ts) | |
| The assembled app | | [`src/assembly.ts`](src/assembly.ts) | [`tests/support/app.ts`](tests/support/app.ts) |
| The HTTP server | | [`src/host/`](src/host/) | [`tests/compositions/signing-in.test.ts`](tests/compositions/signing-in.test.ts) |
| The Vue frontend | | [`frontend/src/`](frontend/src/) | |

A design document and its code have the same name, such as [`design/compositions/checks.md`](design/compositions/checks.md) and [`src/compositions/checks.ts`](src/compositions/checks.ts). The `reusable` folders hold parts copied from ConceptBox.

## Concepts

Each concept has a specification, a class, and a test that runs the steps of its principle. No concept class imports another.

| Concept | Purpose | Code | Test |
|---|---|---|---|
| [Cueing](design/concepts/Cueing.md) | Make a brief signal toward something you mostly understand, so naming it costs little. | [Cueing.ts](src/concepts/Cueing/Cueing.ts) | [test](tests/concepts/Cueing.test.ts) |
| [Categorizing](design/concepts/Categorizing.md) | Partition items into categories, so each categorized item is seen exactly once. | [Categorizing.ts](src/concepts/Categorizing/Categorizing.ts) | [test](tests/concepts/Categorizing.test.ts) |
| [RecallChecking](design/concepts/RecallChecking.md) | Find out which items you can produce unprompted, as opposed to when cued. | [RecallChecking.ts](src/concepts/RecallChecking/RecallChecking.ts) | [test](tests/concepts/RecallChecking.test.ts) |
| [SpacedRepetition](design/concepts/SpacedRepetition.md) | Bring items back for retrieval sooner when missed, later when retrieved. | [SpacedRepetition.ts](src/concepts/SpacedRepetition/SpacedRepetition.ts) | [test](tests/concepts/SpacedRepetition.test.ts) |
| [Registering](design/concepts/Registering.md) | Usernames. From ConceptBox. | [Registering.ts](src/concepts/Registering/Registering.ts) | [test](tests/concepts/Registering.test.ts) |
| [Authenticating](design/concepts/Authenticating.md) | Passwords. From ConceptBox. | [Authenticating.ts](src/concepts/Authenticating/Authenticating.ts) | [test](tests/concepts/Authenticating.test.ts) |
| [Sessioning](design/concepts/Sessioning.md) | Staying signed in. From ConceptBox. | [Sessioning.ts](src/concepts/Sessioning/Sessioning.ts) | [test](tests/concepts/Sessioning.test.ts) |
| [Tagging](design/concepts/Tagging.md) | Retrieve items by any number of names, at varying specificity. | Not built | |
| [Flashcarding](design/concepts/Flashcarding.md) | Compare a recalled answer against one written in advance. | Not built | |
## Compositions

| Design | Code | What it does |
|---|---|---|
| [access](design/compositions/access.md) | [access.ts](src/compositions/access.ts) | Views `ownsTopic`, `ownsCue`, `ownsCheck`. Every endpoint that names a topic, point, or check checks one of them, and it answers `NOT_FOUND` to anyone else. |
| [topics](design/compositions/topics.md) | [topics.ts](src/compositions/topics.ts) | `/topics/create`, `/topics/rename`, `/topics/delete`. A topic with points can't be deleted. |
| [cues](design/compositions/cues.md) | [cues.ts](src/compositions/cues.ts) | `/cues/create` (creates the cue, then places it in its topic), `/cues/rename`, `/cues/move`, `/cues/delete`. The reaction `UnplaceDeleted` removes a deleted point from its topic. |
| [home](design/compositions/home.md) | [home.ts](src/compositions/home.ts) | `/home`, with the former `myTopics`: each topic with its points, and each point's due time. |
| [checks](design/compositions/checks.md) | [checks.ts](src/compositions/checks.ts) | `/checks/open`, `/include`, `/submit`, `/mention`, `/omit`, `/close`, `/abandon`, and `/show`, with the former `checkResult`. |
| [scheduling](design/compositions/scheduling.md) | [scheduling.ts](src/compositions/scheduling.ts) | Reactions: a new point is enrolled and due at once; a deleted point is dropped; when a check closes, each omitted point lapses and each mentioned point advances. |
| [accounts](design/compositions/reusable/accounts.md) | [accounts.ts](src/compositions/reusable/accounts.ts) | Sign-up and sign-out. From ConceptBox. |
| [passwords](design/compositions/reusable/passwords.md) | [passwords.ts](src/compositions/reusable/passwords.ts) | Sign-in with a password. From ConceptBox. |


## The frontend

- [`App.vue`](frontend/src/App.vue) shows the sign-in form, the home page, or a recall session.
- [`HomePage.vue`](frontend/src/lemma/HomePage.vue) and [`useHome.ts`](frontend/src/lemma/useHome.ts) show topics and points. `change` waits for a call, then reloads `/home`.
- [`RecallCheck.vue`](frontend/src/lemma/RecallCheck.vue) runs a session in three steps: choose the points, recall, see the results.
- [`client.ts`](frontend/src/api/client.ts) is typed from every endpoint in [`generated/wire.ts`](generated/wire.ts). [`errors.ts`](frontend/src/api/errors.ts) turns each refusal into a sentence.
- [`frontend/src/reusable/`](frontend/src/reusable/) is from ConceptBox.

## What the MVP leaves out

- There is no tagging, no flashcards, and no review screen. Recall is typed, not spoken.
- The match between an explanation and its points is crude: a point counts as mentioned when at least half its meaningful words appear in the account. You correct it by hand.
- Sessions can't be rated, so every check's credit is 0. A mentioned point therefore keeps its interval instead of lengthening it, and it also comes back the next day.
- Refusals like deleting a topic that still has points rely on the engine running every action on a concept one at a time. That holds for one server process only.
