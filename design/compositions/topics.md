# Topics
In Lemma, every point belongs to exactly one topic.  This ensures that by going through reviews of all their topics, a user covers every point once. A topic serves as grounding for a recall session such that the points within a topic are able to be connected without looking at each point individually.

The [create endpoint](reaction:topics.creating.CreateTopic) makes a topic for the signed-in user with `Categorizing.create` and responds with that topic. If a user attempts to create a topic with the same name as one they already own, `Categorizing.create` refuses with `CATEGORY_EXISTS`. Furthermore, to encourage the creation of topics that are not flashcards with detailed answers, topic names are between 1 and 80 characters. An attempt to create a topic with a name beyond that length results in a `INVALID_CATEGORY` refusal from `Categorizing.create`.

In Lemma, every point must be attached to some topic at all times. This is because the developer of Lemma made the decision that points only have meaning when attached to a topic. As a result, a topic cannot be deleted until its points are deleted or moved so that there aren't 'loose' points. A deletion operation on a non-empty category will result in a `CATEGORY_NOT_EMPTY` refusal from `Categorizing.delete`.
Moreover, when a point is deleted, it is [removed from its topic](reaction:topics.deleting.UnplaceDeleted).

When a person [owns](view:access.permissions.ownsTopic) a topic, the [delete endpoint](reaction:topics.deleting.DeleteTopic) will respond to their request to delete a topic by removing that topic through `Categorizing.delete`.
Likewise, when a person [owns](view:access.permissions.ownsTopic) a topic, the [rename endpoint](reaction:topics.renaming.RenameTopic) will respond to their request to rename a topic by changing its name via `Categorizing.rename`.
For those who do not own a topic, both of these endpoints respond with `NOT_FOUND`.

```endpoints
topics.creating.CreateTopic at /topic/create
topics.deleting.DeleteTopic at /topic/delete
topics.renaming.RenameTopic at /topic/rename
```


