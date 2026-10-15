# Recall checks

A recall check is how Lemma finds out which points a person can't produce unprompted. The person chooses the points they mean to cover, gives an account from memory with none of them in view, and sees which ones the account left out.

RecallChecking never receives the account itself. The browser reads the typed account, [submits the check](reaction:checks.running.SubmitCheck), which marks every point omitted, and then marks each point whose name the account mentions as [mentioned](reaction:checks.correcting.MarkMentioned). The person then corrects anything the browser misjudged, in either direction, with the same endpoint or by [marking a point omitted](reaction:checks.correcting.MarkOmitted). Keeping the matching out of the concept means a better matcher, or a spoken account, changes only the browser, and the account is never stored.

A person [opens a check](reaction:checks.running.OpenCheck) under a name, then [includes points](reaction:checks.running.IncludePoint) one at a time. Only their own points can go in their own check; anything else is answered with `NOT_FOUND`.

```endpoints
checks.running.OpenCheck at /checks/open
checks.running.IncludePoint at /checks/include
checks.running.SubmitCheck at /checks/submit
checks.correcting.MarkMentioned at /checks/mention
checks.correcting.MarkOmitted at /checks/omit
```

When the result is right, the person [closes the check](reaction:checks.running.CloseCheck), after which it can't be corrected. A check that hasn't been closed can be [abandoned](reaction:checks.running.AbandonCheck), which removes it.

```endpoints
checks.running.CloseCheck at /checks/close
checks.running.AbandonCheck at /checks/abandon
```

The [results screen](reaction:checks.showing.ShowCheck) shows the [check's result](former:checks.showing.checkResult): its name and status, the points it includes, and which were mentioned and omitted, each with the point's name, in the order they were included. Anyone but the owner is answered with `NOT_FOUND`.

```endpoints
checks.showing.ShowCheck at /checks/show
```
