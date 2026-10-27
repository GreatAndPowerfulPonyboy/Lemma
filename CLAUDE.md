@AGENTS.md

# Lemma

Lemma is a free-recall study app for MIT 6.1040. Users add short points, organize them into topics, and write
prompts (named recall checks) that can span topics. They explain a prompt from memory, then mark which points
they covered. Backend: sync-engine concepts and compositions on MongoDB. Frontend: Vue 3.5 in frontend/.

## How I work
- I make the design decisions. If a task leaves one open, or the code disagrees with the task, stop and ask.
  Don't choose for me.
- I list the test cases; you write the test code. Each chunk of work ends with its tests passing.
- I review every line. Prefer small, conventional, readable code. Build only what the task asks for.
- Don't push. Don't commit unless I ask.
- When you finish, give one short section per task item: files touched, what changed, one sentence on why.
  Then list anything you weren't sure about.

## Decisions in force
- Names (points, topics, prompts) are stored trimmed and have 1 to 80 characters. Capitalization makes a
  different name.
- Repeating an action succeeds quietly (moving a point to its current topic, renaming something to its current
  name).
- Points can be unsorted. A point is in at most one topic.
- A prompt is a RecallChecking check: a name plus a subject (the points a good explanation covers). Prompts can
  span topics.
- A check has at most one unfinished attempt. An attempt keeps the subject the check had when it began.
  Closing an attempt fixes its credit: the rating if one was given, otherwise the share of points mentioned.
- RecallChecking never stores the account itself, typed or spoken.
- Flashcarding answers are written after a miss and used as the reference when grading.
- SpacedRepetition schedules checks. Credit below 0.5 is a lapse.
- Actions that affect many items at once (delete, empty, move many) ask for confirmation first. A single action
  that's easy to undo doesn't.

## Copy these examples
- Concept: design/concepts/Categorizing.md and src/concepts/Categorizing/ (spec, class, registry), with
  tests/concepts/Categorizing.test.ts.
- Endpoints with ownership checks: src/compositions/points.ts and access.ts. Formers: home.ts. Reactions:
  UnplaceDeleted in points.ts.
- Composition tests: tests/compositions/walkthrough.test.ts. Each test is named for the story it tells, uses
  helpers like matthewWithTopics, and checks the home screen is unchanged after a refusal.
- Frontend store and writes: frontend/src/lemma/useLemma.ts. `change` and `move` call endpoints one at a
  time, stop at the first refusal, and reload once.
- Frontend components: PointsContainer.vue, useBoxSelect.ts, TopicPicker.vue, and Menu.vue and Dialog.vue in
  frontend/src/reusable/ui/. Screen-only state lives in the component that owns it; children update it through
  v-model or events.

## Wiring a new concept or composition
1. Concept: register it in src/concepts.ts and design/types.md.
2. Composition: its export keys must match the link names in its design/compositions/*.md. Register it in
   src/assembly.ts and in `design.documents` in generated.config.ts.
3. Every new refusal code gets a line in src/host/http.ts and a sentence in frontend/src/api/errors.ts.
4. Run `bun run generate`, then `bun run check`.

## Done means
- `bun test`, `bun run check` and `bun run --cwd frontend typecheck` pass. Show the summary lines.
- For UI work, run the app and show screenshots of each changed screen at about 700px wide and at full width.
- If something in the task turned out to be impossible or wrong, you stopped and told me instead of working
  around it.
