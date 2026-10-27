# Lemma

Lemma is a free-recall study app for technical subjects. You capture short points, organize them into topics later, and test yourself by explaining a prompt from memory and checking which points you covered; prompts come back on a spaced-repetition schedule, and points you keep missing are suggested as flashcards.

**Deployed app:** <https://lemma.mit-sdg.dev/>
**Demo video (P4):** <https://youtu.be/wkhgukMKRZc>

## Project materials

| | |
|---|---|
| Design summary (P4) | [DesignNotebook/DesignSummary.md](DesignNotebook/DesignSummary.md) |
| Problem framing and initial concept design (P1) | [DesignNotebook/ProblemFraming.md](DesignNotebook/ProblemFraming.md) |
| User journey | [DesignNotebook/UserJourney.md](DesignNotebook/UserJourney.md) · [video](https://youtu.be/sUGFLZlyrLI) |
| Visual design study (P3) | [page 1](img/Study1.jpg) · [page 2](img/Study2.jpg) |
| Concept specifications | [design/concepts/](design/concepts/) |
| Reactions and endpoints (compositions) | [design/compositions/](design/compositions/) |
| How concepts are instantiated | [design/types.md](design/types.md) |

Code: concepts in [`src/concepts/`](src/concepts/), compositions in [`src/compositions/`](src/compositions/), the Vue frontend in [`frontend/src/`](frontend/src/).

## Running locally

You need [Bun](https://bun.sh) (1.4.2, as pinned in `package.json`) and [Docker](https://www.docker.com/) for the database.

1. Install dependencies. Installing the frontend's dependencies also builds it.

   ```sh
   bun install
   bun install --cwd frontend
   ```

2. Start MongoDB and tell the app where it is. Create a `.env` file in the repo root:

   ```sh
   bun run db:up
   echo 'MONGODB_URI=mongodb://dev:dev@127.0.0.1:27017/lemma?authSource=admin' > .env
   ```

   Without `MONGODB_URI`, the server falls back to an in-memory database and loses everything when it stops.

3. Run it, either for development (with reloading) or as it runs when deployed:

   ```sh
   # development: two terminals
   bun run dev                    # backend on :3000
   bun run --cwd frontend dev     # frontend at http://localhost:5173

   # or, built
   bun run build && bun run start # http://localhost:3000
   ```

   `bun run db:reset` deletes all local data.

## Tests

You need only Bun: the tests start their own in-memory MongoDB, with a fresh database for every test (the first run downloads a MongoDB binary of about 100 MB).

```sh
bun run test     # concept and composition tests
bun run check    # specs against code, generated files, and TypeScript
```

The latest full run is saved in [`tests/output.txt`](tests/output.txt).

| File | What it tests |
|---|---|
| `tests/concepts/*.test.ts` | Each concept's operational principle, refusals and queries, against its spec |
| `tests/compositions/walkthrough.test.ts` | Points and topics end to end, who can do what, refusals |
| `tests/compositions/signing-in.test.ts` | Registering, signing in and out |
| `tests/compositions/checks.test.ts` | Prompts and attempts: starting, grading, closing, abandoning, empty prompts |
| `tests/compositions/scheduling.test.ts` | Adding prompts to Scheduling, reviews when an attempt closes, what's due |
| `tests/compositions/sharing.test.ts` | Sharing prompts by username, copying them as snapshots, removing them from Shared, unsharing |
| `tests/compositions/cards.test.ts` | Writing, revising and removing answers |
| `tests/compositions/promoting.test.ts` | Suggesting cards for points missed in at least three attempts |

## Built with

[sync-engine](https://github.com/mit-sdg/sync-engine); the Authenticating, Registering, Sessioning and Sharing concepts are reused from [ConceptBox](https://github.com/GreatAndPowerfulPonyboy/conceptbox). Built with help from Claude Code: I wrote the composition documents and directed tests; Claude Code implemented from them.
