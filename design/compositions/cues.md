# Points

A point is a Cueing cue: a short name for something the person means to produce from memory. In Lemma every point is in exactly one topic. Categorizing guarantees a point is in at most one topic; these endpoints supply the rest, by placing every new point and unplacing every deleted one.

The owner of a topic may [create a point in it](reaction:cues.editing.CreateCue). The endpoint checks the topic before creating anything, then creates the cue and places it in the topic in the same request, so a point is never created without a topic. Because the topic's ownership was checked first, the placement cannot be refused, which is why the two steps need no undo.

```endpoints
cues.editing.CreateCue at /cues/create
```

The owner may [rename a point](reaction:cues.editing.RenameCue). Anything attached to it, such as its topic, stays attached, because it refers to the point's identity.

```endpoints
cues.editing.RenameCue at /cues/rename
```

The owner may [move a point](reaction:cues.editing.MoveCue) to another of their own topics. Placing it in the new topic takes it out of the old one, since Categorizing keeps at most one topic per item.

```endpoints
cues.editing.MoveCue at /cues/move
```

The owner may [delete a point](reaction:cues.editing.DeleteCue). A reaction then [takes it out of its topic](reaction:cues.deleting.UnplaceDeleted); without it, the deleted point would still count as being in its topic, and that topic could never be deleted.

```endpoints
cues.editing.DeleteCue at /cues/delete
```
