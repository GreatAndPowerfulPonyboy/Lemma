# Scheduling
In Lemma, the unit of review is a prompt and the points within it. A user doesn't review points one at a time; they explain a prompt from memory and find out which of its points they could produce unprompted. Scheduling decides when a prompt should come back, so a user spends their time on the explanations they are close to losing rather than the ones they already know.

When a person [owns](view:access.permissions.ownsCheck) a prompt, the [track endpoint](reaction:scheduling.tracking.TrackCheck) enrolls it with `SpacedRepetition.enroll`, and it is due for review straight away. The [untrack endpoint](reaction:scheduling.tracking.UntrackCheck) takes it off the schedule with `SpacedRepetition.drop`. Tracking a prompt that is already tracked, or untracking one that isn't, succeeds quietly and changes nothing. For prompts the user does not own, both endpoints respond with `NOT_FOUND`.

```endpoints
scheduling.tracking.TrackCheck at /check/track
scheduling.tracking.UntrackCheck at /check/untrack
```

When an attempt at a tracked prompt is closed, it is [reviewed](reaction:scheduling.reviewing.ReviewClosed) with the attempt's credit: the share of the prompt's points the user mentioned from memory. Credit decides when the prompt is next due. Below 50%, the attempt is a lapse: the prompt is due again in a day, and its lapses count against how quickly its interval grows from then on. At 50% or more, the interval grows, and the more of the points the user mentioned, the longer it grows. Attempts at prompts that aren't tracked are never reviewed, so a user can practise a prompt freely without changing its schedule. A prompt copied from someone else is a separate prompt with its own schedule, so practising a copy never changes the original's. When a tracked prompt is deleted, it is [dropped](reaction:scheduling.tracking.DropDeleted) from the schedule.

Showing a prompt also gives [its schedule](former:scheduling.showing.scheduleOf): whether it [is tracked](computation:isTracked), and when it is next due, if it is.

```computations
isTracked(due?: DateTime) : Boolean
  Whether a prompt is tracked, given when it is next due, which is blank when it isn't.
```

The home screen lists [the prompts that are due](former:scheduling.showing.dueChecks): the user's tracked prompts whose due time has passed, earliest first. It also lists [the user's schedule](former:scheduling.showing.scheduledChecks): every prompt they track, with when it is next due, earliest first. Users view their schedule in the Scheduling tab of the home screen, alongside Points, Topics, Prompts and Shared; the tab replaces the old Review scheduling button.
