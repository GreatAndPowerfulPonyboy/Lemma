Read CLAUDE.md first. This file holds the chunks we're building today: 0, 4a, 4b, 10, 9. I'm here while you
work, so we go one chunk at a time. I'll tell you which chunk to do; don't start the next one until I say so.

<working_rules>
- Each chunk's design doc is my spec: design/compositions/checks.md for 4a and 4b, sharing.md for 10,
  scheduling.md for 9. Match its link names exactly in the code (a link like
  `reaction:checks.attempting.StartAttempt` means an export `StartAttempt` in the `attempting` group of
  checks.ts). Where the doc and this file disagree, follow the doc and list the differences. If the doc for a
  chunk doesn't exist yet, stop and tell me.
- When something is unclear, a test fails for a reason outside the chunk, or the code disagrees with the task,
  stop and ask me in the chat, with what you found, where in the code, and the options as you see them. Don't
  work around it.
- When a chunk is done and the checks in "Done means" pass, show me the per-item summary from CLAUDE.md and wait.
  Commit only when I say so, with the message "Chunk <n>: <short title>". Never push.
- Screenshots need the app running: `bun run db:up`, `bun run dev` and `bun run --cwd frontend dev`. If the app
  can't start, tell me what failed instead of skipping the screenshots.
</working_rules>

<chunk_0>
Apply the three patches in my Downloads folder, in order:
`git am -3 ~/Downloads/0001-Add-Flashcarding-and-the-cards-composition.patch ~/Downloads/0002-Store-recall-checks-with-attempts-and-schedule-check.patch ~/Downloads/0005-Add-the-Sharing-concept-reused-unchanged-from-Concep.patch`

0001 and 0002 add the RecallChecking, Flashcarding and SpacedRepetition concepts, the cards composition, and
their tests. 0005 adds the Sharing concept, copied unchanged from ConceptBox, but doesn't register it (chunk 10
does). 0001 and 0002 were written before the home composition existed, so expect conflicts in src/assembly.ts,
generated.config.ts, src/host/http.ts and the generated/ files. Resolve each one by keeping both sides (the home
registrations and the new ones). For the generated/ files, take either side, then run `bun run generate`.
Continue with `git am --continue` after each resolution, so each patch stays its own commit. Don't make a
separate chunk 0 commit if `git am` already committed everything.

Change nothing else. If a conflict is anything other than two lists of registrations or the generated files,
run `git am --abort` and show it to me. Afterwards, run the checks in "Done means" (no screenshots;
there's no UI change) and list the files each patch added.
</chunk_0>

<chunk_4a>
This is the backend for prompts and typed recall. Don't change the frontend except frontend/src/api/errors.ts.

<context>
- After chunk 0, RecallChecking (design/concepts/RecallChecking.md, src/concepts/RecallChecking/) is registered
  with Registering's users as owners and Cueing's cues as items. A check is a prompt: an owner, a name, and a
  subject (a set of points). An attempt keeps the subject the check had when it began. `submit` puts every
  point in omitted; `mention` and `omit` correct the split; `close` fixes the credit (the rating if one was
  given, otherwise mentioned / subject); `abandon` gives up. A check has at most one unfinished (OPEN or
  GRADED) attempt.
- The typed account is never sent to the server. The frontend will guess which points it mentions and call
  `mention` for each one, and the user corrects the guesses before closing.
- `textInput` (src/compositions/reusable/inputs.ts) accepts only string fields.
</context>

<task>
Write src/compositions/checks.ts from my design/compositions/checks.md, following points.ts and home.ts. Don't
rewrite my prose in checks.md; if it's missing something the code needs, ask me. Document the new views in
design/compositions/access.md in the style already there.
1. In access.ts, add two views: ownsCheck(user, check), using RecallChecking._get; and ownsAttempt(user,
   attempt), using RecallChecking._attempt and then ownsCheck.
2. Endpoints. Each one calls Sessioning.use, then branches on ownership with named branches as in points.ts,
   responding NOT_FOUND when the user doesn't own what's named:
   - /check/open {name} → check
   - /check/rename {check, name}
   - /check/delete {check}
   - /check/include {check, cue} and /check/exclude {check, cue}: the user must own both the check and the cue
   - /check/attempt {check} → attempt
   - /attempt/submit {attempt}
   - /attempt/mention {attempt, cue} and /attempt/omit {attempt, cue}
   - /attempt/close {attempt} → credit
   - /attempt/abandon {attempt}
   Leave out `rate` for now: it needs a number, and textInput accepts only strings. The UI won't start a check
   with no points.
3. Reading endpoints, built with formers as in home.ts:
   - /check/show {check} → name; subject (cue, pointName); the current unfinished attempt (attempt, status) or
     null; and the attempts (attempt, status, credit), newest first
   - /attempt/show {attempt} → check, checkName, status, credit, and subject, mentioned and omitted (each as
     cue, pointName)
   - Add myChecks (check, name) to /home.
4. Reaction: when a point is deleted, exclude it from every check whose subject includes it (use
   RecallChecking._including). Attempts keep their own copy of the subject.
5. Give every RecallChecking refusal code a line in src/host/http.ts and a sentence in
   frontend/src/api/errors.ts.
6. Wire everything in, following the checklist in CLAUDE.md.
</task>

<tests>
Write tests/compositions/checks.test.ts. Reuse the helpers in walkthrough.test.ts; if you need them in two
files, move them to tests/support/ without changing them.
1. Matthew picks three points from two topics, opens "Explain Dijkstra" with them, attempts it, submits, marks
   two as mentioned, and closes it: the credit is 2/3, and /check/show and /home show the check and its closed
   attempt.
2. Attempting while an attempt is unfinished is refused with ATTEMPT_IN_PROGRESS; abandoning frees the check
   for a new attempt.
3. Jonathan gets NOT_FOUND when he includes his point in Matthew's check, includes Matthew's point in his own
   check, calls attempt, submit, mention, close or abandon on Matthew's check or attempt, or renames, deletes
   or shows it. Matthew's data is unchanged afterwards.
4. Deleting a point removes it from every check's subject, but an earlier attempt still lists it.
5. Mentioning before submitting is refused with NOT_GRADED; mentioning a point that isn't in the attempt's
   subject is refused with NOT_IN_SUBJECT.
6. Blank and 81-character prompt names are refused with INVALID_NAME, and 80 characters is accepted.
7. A signed-out session is refused with NOT_SIGNED_IN on every new endpoint.
8. Deleting a check deletes its attempts and removes it from /home.
</tests>

<flag_dont_guess>
If a former can't produce point names for a subject, or ownsAttempt can't be written as a view, record what you
found and ask me instead of working around it.
</flag_dont_guess>

<verification>
Follow "Done means" in CLAUDE.md (skip screenshots; there's no UI change). Also remove the cue-ownership check
from /check/include, confirm test 3 fails, then restore it.
</verification>
</chunk_4a>
<chunk_4b>
This is the frontend for prompts and typed recall, using the chunk 4a endpoints.

<context>
- There's no router: App.vue renders HomePage when someone is signed in. Add a small screen state to the store
  (home, recall or results, plus the current attempt) instead of adding a router.
- Reuse the old matching helper exactly as it is: `git show main:frontend/src/lemma/matching.ts`. Its
  `mentions(account, pointName)` guesses whether a typed account mentions a point.
</context>

<task>
0. Tabs instead of toggle buttons. Replace the Topics toggle in the filter row with tabs above the tools zone:
   Points | Topics | Prompts. (Chunk 10 adds a Shared tab and chunk 9 a due count on Prompts, so build the tabs
   to take more.) The filter row shows only the filters that apply to the current tab: point search, topic
   filter and Clear filters on Points; topic search on Topics; nothing on Prompts for now. The current tab lives
   in the store, so returning from the recall or results screen lands on the tab you left (Prompts, when you
   came from a prompt). Use proper tab semantics (role="tablist", aria-selected, arrow keys move between tabs).
1. Starting a prompt from the home screen:
   - When points are selected, the bulk bar gets "Recall selected". It opens a Dialog asking for the prompt:
     an input with maxlength 80 and placeholder "Explain …", which can't be empty. Confirming calls
     /check/open, then /check/include for each selected point (one at a time, like `move`), then
     /check/attempt, then opens the recall screen.
   - Each topic card gets "Recall this topic". It opens the same dialog, prefilled "Explain <topic name>", with
     that topic's points. It's disabled for a topic with no points.
   - The Prompts tab lists myChecks as rows (a single-column list, not the card grid, so expanding a row never
     leaves gaps in a grid). Each row shows the name, "Start", or "Resume" when it has an unfinished attempt,
     and a menu with Rename and Delete (Delete asks for confirmation).
   - Clicking a row's background expands it to show the prompt's points and its past attempts, newest first,
     as percentages like "67%" (from the credit in /check/show; ignore ABANDONED attempts). Attempts don't
     store dates, so don't show any. Show at most the
     five latest attempts, with "Show all" for the rest. Clicking the background again collapses it. Several
     rows may be open at once.
1b. Make the new pieces fit with what's already on the home screen. Handle each of these and say what you did:
   - Selection and the bulk bar: switching tabs clears the selection, so a bulk bar never acts on items that
     aren't visible. Drag-selection and the crosshair cursor only work on the Points and Topics tabs; the
     Prompts tab has no selection yet.
   - Expanded rows: clicking Start, Resume or the menu inside a row doesn't toggle it. Expansion uses
     aria-expanded and works with Enter and Space. A menu opened inside an expanded row isn't clipped by the
     row. A long list of points inside a row scrolls within a capped height instead of pushing everything off
     screen.
   - Data changes: renaming or deleting a prompt keeps the other rows' expanded state; after finishing an
     attempt and returning, that prompt's row is expanded and shows the new result first.
   - Each tab has an empty state ("No prompts yet. Select points and choose Recall selected.").
   - The zone divider and the tinted content area from earlier apply under every tab.
2. Recall screen (RecallScreen.vue): the prompt as the heading, a large textarea, and "Submit" and "Abandon"
   buttons. The points stay hidden. The account lives only in component state and is never sent. Submitting
   calls /attempt/submit, then /attempt/mention for each point where `mentions(account, pointName)` is true,
   then opens the results screen.
3. Results screen (ResultsScreen.vue): the account, read-only, on one side. On the other, the attempt's points
   in two lists, "Mentioned" and "Missed", each with a control that moves a point to the other list (calling
   mention or omit). "Finish" calls /attempt/close and shows "You recalled 2 of 3 points" with a "Back to home"
   button. "Abandon" stays available until the attempt is finished.
4. Resuming an attempt that was submitted but not finished opens the results screen, with the note "Your typed
   account isn't saved" where the account would be.
</task>

<constraints>
Reuse Dialog.vue, Menu.vue, the store's `change` pattern, and the existing tokens. Don't style beyond matching
the home screen; a styling pass comes later.
</constraints>

<verification>
Follow "Done means" in CLAUDE.md. Screenshots: the tabs on each of Points, Topics and Prompts (showing which
filters appear), the "Recall selected" dialog, the recall screen, the results screen before and after
finishing, and the Prompts tab with one prompt to start, one to resume, and one row expanded with three past
attempts and a menu open inside it.
</verification>
</chunk_4b>

<chunk_10>
This is direct sharing of prompts: a user shares a prompt with another user by username, and the recipient can
copy it into their own collection. The copy is a snapshot (see CLAUDE.md).

<context>
- Chunk 0 added design/concepts/Sharing.md and src/concepts/Sharing/, copied unchanged from ConceptBox. Item is
  RecallChecking's Check, Person is Registering's User. Keep the concept unchanged. It refuses sharing twice
  (ALREADY_SHARED) and revoking a share that doesn't exist (NOT_SHARED); per CLAUDE.md, repeated actions must
  succeed quietly, so the composition checks first and skips the action, instead of letting those refusals
  reach the user.
- Registering has `_byUsername` and `_username`.
- Copying uses endpoints that already exist: the frontend calls /check/open with the shared prompt's name, then
  /point/create for each of its points, then /check/include for each new point. No copy endpoint is needed.
</context>

<task>
Backend: src/compositions/sharing.ts, implemented from my design/compositions/sharing.md (don't rewrite
my prose; ask me if it's missing something the code needs).
1. Register Sharing (src/concepts.ts, design/types.md).
2. A view sharedWith(user, check), using Sharing._sharedWith or _recipients.
3. Endpoints, each calling Sessioning.use first:
   - /check/share {check, username}: owner only (NOT_FOUND otherwise). An unknown username responds
     NO_SUCH_USER; the owner's own username responds SHARE_WITH_SELF; already shared succeeds quietly.
   - /check/unshare {check, username}: owner only. Not currently shared (or unknown username) succeeds quietly.
   - Add recipients (username) to /check/show.
   - /shared → the prompts shared with me: check, name, ownerUsername. Prompts deleted since are left out.
   - /shared/show {check} → name, ownerUsername, and points (pointName), only if the prompt is shared with me
     (NOT_FOUND otherwise).
4. Reaction: when a check is deleted, revoke every share of it.
5. NO_SUCH_USER → INVALID_REQUEST and SHARE_WITH_SELF → INVALID_REQUEST in http.ts, with sentences in errors.ts
   ("There's no user with that username." and "You can't share a prompt with yourself.").

Frontend:
6. In the Prompts view, each prompt's menu gets "Share…". It opens a Dialog with a username input, a "Share"
   button, the current recipients each with "Stop sharing", and the note "People you share with can copy this
   prompt. Their copies are theirs to keep, even if you stop sharing."
7. A "Shared" tab, after Prompts, lists /shared as rows in the same style as the Prompts tab: each prompt's
   name, "from <username>", its points when its row is expanded, and "Copy to my prompts". Copying runs open,
   create and include as described above, then shows "Copied. It's in your Prompts, and its points are in
   Unsorted." The tab has no filters and no selection, and an empty state ("Nothing shared with you yet.").
   Keep the expand and menu behavior consistent with the Prompts tab from chunk 4b.
</task>

<tests>
tests/compositions/sharing.test.ts:
1. Matthew shares "Explain Dijkstra" with Jonathan; Jonathan sees it in /shared from "Matthew" and can read its
   points with /shared/show; he copies it with open, create and include, and his copy has the same name and
   point names, with points he owns that are unsorted.
2. After Jonathan copies it, Matthew renames the prompt and adds a point; Jonathan's copy doesn't change.
3. Matthew stops sharing: Jonathan no longer sees it in /shared, /shared/show is NOT_FOUND, and his copy
   remains.
4. Sharing with an unknown username is NO_SUCH_USER; with himself is SHARE_WITH_SELF; sharing twice succeeds
   and Jonathan sees it once; unsharing someone it isn't shared with succeeds.
5. Jonathan can't share or unshare Matthew's prompt, or read its recipients (NOT_FOUND); Ada, who wasn't shared
   with, gets NOT_FOUND from /shared/show.
6. Deleting a shared prompt removes it from every recipient's /shared.
7. A signed-out session is refused with NOT_SIGNED_IN on every new endpoint.
</tests>

<flag_dont_guess>
If the composition can't check "already shared" before calling share, or can't compare the recipient with the
owner, tell me what you found.
</flag_dont_guess>

<verification>
Follow "Done means" in CLAUDE.md. Screenshots: the Share dialog with one recipient, and the Shared tab before
and after copying, with one row expanded.
</verification>
</chunk_10>

<chunk_9>
This is spaced repetition: a user can track a prompt, and a tracked prompt comes back when it's due.

<context>
- SpacedRepetition (design/concepts/SpacedRepetition.md) schedules RecallChecking's checks: enroll, review(item,
  credit), drop; `_due({before})` and `_entry({item})`. It refuses enrolling twice (ALREADY_ENROLLED) and
  reviewing or dropping what isn't enrolled (NOT_ENROLLED). As in chunk 10, the composition checks first, so
  repeated actions succeed quietly.
- Listing what's due needs the current time. If a composition can't supply "now" to `_due`, add a query to
  SpacedRepetition that uses the concept's own clock, for example `_overdue : many (item, due)`, with a line in
  its spec and a concept test.
</context>

<task>
Backend: src/compositions/scheduling.ts, implemented from my design/compositions/scheduling.md (don't rewrite
my prose; ask me if it's missing something the code needs).
1. /check/track {check} enrolls it (owner only; already tracked succeeds quietly). /check/untrack {check} drops
   it (owner only; not tracked succeeds quietly).
2. Reactions: when an attempt of a tracked check closes, review the check with the attempt's credit. When a
   tracked check is deleted, drop it. Untracked checks are never reviewed.
3. Add tracked (true or false) and due (or null) to /check/show. Add dueChecks (check, name, due) to /home: the
   user's tracked prompts that are due now, earliest first.

Frontend:
4. After "Finish" on the results screen, an untracked prompt offers "Track this prompt" (one click, no dialog).
   Each prompt's menu has Track or Untrack.
5. The Prompts tab shows "Due now" at the top, listing dueChecks with "Start", above the rest of the prompts,
   and the tab label shows the number due ("Prompts · 2") when any are. Remove the disabled "Review
   scheduling" button; the tab replaces it. Tracked prompts show their next due date in their row, and an
   expanded row says whether the prompt is tracked. A prompt that's due appears only once, in "Due now".
</task>

<tests>
tests/compositions/scheduling.test.ts:
1. Matthew tracks a prompt, and it's in dueChecks right away; he closes an attempt with full credit, and it
   leaves dueChecks, while /check/show gives a due date in the future.
2. Closing an attempt of an untracked prompt schedules nothing, and it never appears in dueChecks.
3. Tracking twice succeeds and the prompt is listed once; untracking removes it from dueChecks; untracking
   again succeeds.
4. Deleting a tracked prompt drops it without an error, and it leaves dueChecks.
5. Jonathan can't track or untrack Matthew's prompt (NOT_FOUND), and Matthew's dueChecks never include
   Jonathan's prompts.
6. A signed-out session is refused with NOT_SIGNED_IN on every new endpoint.
</tests>

<verification>
Follow "Done means" in CLAUDE.md. Screenshots: "Track this prompt" after finishing, and the "Due now" list.
</verification>
</chunk_9>
