# Cards

In Lemma, a card is a point with an answer. Points start without one: a person writes an answer only after a recall attempt shows they need it, while their notes are open, and later attempts are checked against that answer instead of the notes. Answers are a reference to check against, never something shown before recall.

## Answering

When a person [owns](view:access.permissions.ownsPoint) a point, the [write endpoint](reaction:cards.answering.WriteAnswer) gives it an answer with `Flashcarding.write` and responds with the point. An answer must have 1 to 5000 characters, and Flashcarding refuses any other with `INVALID_ANSWER`. A point has at most one answer, so writing a second is refused with `ALREADY_ANSWERED`; to change an answer, the owner uses the [revise endpoint](reaction:cards.answering.ReviseAnswer), which calls `Flashcarding.revise`. The [remove endpoint](reaction:cards.answering.RemoveAnswer) takes the answer away with `Flashcarding.remove`, and the point stops being a card. Revising or removing a point that has no answer is refused with `NO_ANSWER`.

```endpoints
cards.answering.WriteAnswer at /card/write
cards.answering.ReviseAnswer at /card/revise
cards.answering.RemoveAnswer at /card/remove
```

## Showing

The [show endpoint](reaction:cards.showing.ShowCard) responds with [the card of a point](former:cards.showing.cardOf): the point's name, and its answer if it has one. The results screen of a recall attempt uses it to put each point's answer beside what the person wrote.

```endpoints
cards.showing.ShowCard at /card/show
```

For anyone who doesn't own the point, every endpoint here responds with `NOT_FOUND`, as it does for a point that doesn't exist, so nobody can read or change another person's answers or learn which of their points are cards.

## Deleting

When a point is deleted, a reaction [removes its answer](reaction:cards.deleting.RemoveAnswerOfDeleted), so no answer is left behind for a point that no longer exists.

## Promoting

A point only needs an answer once it has proved hard to produce. When a point has been omitted from at least three closed attempts at its owner's prompts, it is [suggested as a card](former:cards.promoting.suggestedCards), with how many times it was missed, most misses first. This is the promotion queue, shown in the Suggested cards tab of the home screen. Writing an answer for a suggested point makes it a card and takes it off the queue; deleting the point takes it off too.
