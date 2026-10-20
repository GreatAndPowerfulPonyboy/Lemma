# Readme
All about Lemma, my personal project for 6.1040

[My public Design decisions](DesignNotebook/ProblemFraming.md)
[My private Design decisions](https://github.com/GreatAndPowerfulPonyboy/6.1040/tree/main/DesignNotebook)

## Tests

The tests cover each concept on its own (`tests/concepts/`) and the app's endpoints and reactions working together
(`tests/compositions/`):

| File | What it tests |
|---|---|
| `tests/concepts/*.test.ts` | Each concept's operational principle, refusals and queries, against its spec in `design/concepts/` |
| `tests/compositions/walkthrough.test.ts` | Points and topics end to end: creating, moving, renaming, deleting, who can do what, and refusals |
| `tests/compositions/signing-in.test.ts` | Registering, signing in and out |
| `tests/compositions/checks.test.ts` | Prompts and recall attempts: starting, submitting, correcting, closing, abandoning, empty prompts |
| `tests/compositions/scheduling.test.ts` | Tracking prompts, reviews when an attempt closes, what's due |
| `tests/compositions/sharing.test.ts` | Sharing prompts by username, copying them as snapshots, unsharing |
| `tests/compositions/cards.test.ts` | Writing, revising and removing answers |
| `tests/compositions/promoting.test.ts` | Suggesting cards for points missed in at least three attempts |

### Running them

You need [Bun](https://bun.sh). No database setup is needed: the tests start their own in-memory MongoDB
(with `mongodb-memory-server`) and give every test a fresh, empty database.

```sh
bun install
bun run test
```

The first run downloads a MongoDB binary (about 100 MB, cached afterwards), so it needs an internet connection
and takes longer than later runs.

To check the design documents and generated files as well:

```sh
bun run check
```

The output of the latest full run is saved in [`tests/output.txt`](tests/output.txt).

### Running the app (not needed for the tests)

The app itself uses MongoDB in Docker:

```sh
bun run db:up                  # start MongoDB
bun run dev                    # backend
bun run --cwd frontend dev     # frontend, at http://localhost:5173
```
