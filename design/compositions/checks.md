# Checks
In Lemma, users can create recall checks to test their ability to produce their points and the connections between them unprompted.

A user studying for a unit exam would [open a check](reaction:checks.opening.OpenCheck) under the name 'Explain Unit 4'. A check's name must be between 1 and 200 characters once trimmed; otherwise it is refused with `INVALID_NAME`. They would then [include](reaction:checks.subjects.IncludePoint) or [exclude](reaction:checks.subjects.ExcludePoint) points that they [own](view:access.permissions.ownsPoint). Including or excluding a point the user does not own, or in a check they do not own, is refused with `NOT_FOUND`. When a point is deleted, it is [excluded](reaction:checks.subjects.ExcludeDeleted) from every check that includes it, but attempts that were already made keep the points they began with. When a point is renamed, it is [renamed](reaction:checks.subjects.RelabelRenamed) in every check that includes it, while attempts that were already made keep the names their points had when they began.

```endpoints
checks.opening.OpenCheck at /check/open
checks.subjects.IncludePoint at /check/include
checks.subjects.ExcludePoint at /check/exclude
```

From there, they can [make an attempt](reaction:checks.attempting.StartAttempt). A check can only have one unfinished attempt at a time, so starting another is refused with `ATTEMPT_IN_PROGRESS`. A check whose points have all been deleted or excluded stays, with its history, but it can't be attempted until it has points again: starting it is refused with `EMPTY_PROMPT`. An attempt that was already underway keeps its own points, so it can still be submitted and closed. Their points disappear from the screen and they make a typed account of what they can mention from memory. Once they've recalled all they can, the user [submits](reaction:checks.attempting.SubmitAttempt) their attempt. After submitting, they will be [presented](reaction:checks.showing.ShowAttempt) with the browser's check of which points were mentioned and which were omitted. A user can [mark mentioned points](reaction:checks.attempting.MentionPoint) and [mark omitted points](reaction:checks.attempting.OmitPoint) to correct the browser's scoring. Marking a point before the attempt is submitted is refused with `NOT_GRADED`, and marking a point that is not part of the attempt is refused with `NOT_IN_SUBJECT`. Afterward, they can [close the attempt](reaction:checks.attempting.CloseAttempt) to finish their grading of the attempt.
If the user would rather the attempt not be graded, they can [abandon](reaction:checks.attempting.AbandonAttempt) the attempt and it will not be tracked.
If the prompt has no closed attempt yet, abandoning its attempt also [deletes the prompt](reaction:checks.attempting.DeleteUnfinished), with its shares and its place in Scheduling, and the response says `deleted: true`; otherwise only the attempt is abandoned. 
A user who does not [own](view:access.permissions.ownsAttempt) an attempt, meaning they do not own its check, is refused with `NOT_FOUND` by every endpoint that names it.
Showing an attempt gives its [points](former:checks.showing.attemptPoints), split into those [mentioned](former:checks.showing.mentionedIn) and those [omitted](former:checks.showing.omittedIn), each with the name it had when the attempt began.

```endpoints
checks.attempting.StartAttempt at /check/attempt
checks.attempting.SubmitAttempt at /attempt/submit
checks.showing.ShowAttempt at /attempt/show
checks.attempting.MentionPoint at /attempt/mention
checks.attempting.OmitPoint at /attempt/omit
checks.attempting.CloseAttempt at /attempt/close
checks.attempting.AbandonAttempt at /attempt/abandon
```

A user can [rename](reaction:checks.renaming.RenameCheck) or [delete](reaction:checks.deleting.DeleteCheck) checks that they [own](view:access.permissions.ownsCheck). The owner of a check is the user who opened it. Renaming follows the same naming rules as opening, and deleting a check also deletes its attempts. Moreover, a user can [see](reaction:checks.showing.ShowCheck) checks that they own by clicking the 'Prompts' tab in the home screen. From this screen, they can also view a history of all the attempts they own under that prompt. For checks the user does not own, these endpoints respond with `NOT_FOUND`.
Showing a check gives its name, its [points](former:checks.showing.subjectOf), its [unfinished attempt](former:checks.showing.currentAttemptOf) if it has one, and [every attempt](former:checks.showing.attemptsOf) with its status and credit, newest first. Each of a user's checks on the home screen also carries [how many points it has](former:checks.showing.pointCountOf), so an empty one can say so.

```endpoints
checks.renaming.RenameCheck at /check/rename
checks.deleting.DeleteCheck at /check/delete
checks.showing.ShowCheck at /check/show
```

A different app could have the grading tied to an llm call, but the creator of Lemma decided that the ability to grade one's own explanation against notes that they've taken, or in comparison to a lecturer, is a desirable difficulty for learning.


