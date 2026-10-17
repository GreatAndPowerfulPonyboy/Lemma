# Topics
In Lemma, every point belongs to exactly one topic. This ensures that by going through reviews of all their topics, a user covers every point once. A topic serves as grounding for a recall session such that the points within a topic can be connected without looking at each point individually.

The [create endpoint](reaction:topics.creating.CreateTopic) makes a topic for the signed-in user with `Categorizing.create` and responds with that topic. To encourage topics that are not flashcards with detailed answers, a topic's name must have 1 to 80 characters once trimmed. A name that is blank or longer than that is refused by Categorizing with `INVALID_CATEGORY`. A user also cannot have two topics with the same name, and Categorizing refuses a duplicate with `CATEGORY_EXISTS`. Both rules apply when creating and when renaming a topic.

```endpoints
topics.creating.CreateTopic at /topic/create
```

When a person [owns](view:access.permissions.ownsTopic) a topic, the [rename endpoint](reaction:topics.renaming.RenameTopic) renames it on their request via `Categorizing.rename` and responds with the topic.

```endpoints
topics.renaming.RenameTopic at /topic/rename
```

Every point must be attached to some topic at all times, because a point outside every topic would never come up when a user reviews their topics, which breaks the coverage promised above. When a person [owns](view:access.permissions.ownsTopic) a topic, the [delete endpoint](reaction:topics.deleting.DeleteTopic) removes it on their request through `Categorizing.delete` and responds with the topic. A topic cannot be deleted until its points are deleted or moved, so a request to delete a topic that still has points is refused by Categorizing with `CATEGORY_NOT_EMPTY`.

```endpoints
topics.deleting.DeleteTopic at /topic/delete
```

The invariant is also kept from the points side: a point is placed in a topic when it is created, and when a point is deleted, it is [removed from its topic](reaction:points.deleting.UnplaceDeleted).

For those who do not own a topic, the rename and delete endpoints respond with `NOT_FOUND`. A topic that does not exist has no owner, so it gets the same response; this way a person cannot tell another user's topic apart from one that does not exist, and Categorizing's `CATEGORY_NOT_FOUND` never reaches them.
