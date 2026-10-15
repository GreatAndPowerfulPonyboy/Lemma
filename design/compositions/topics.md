# Topics

A topic is a Categorizing category. Topics divide a person's points so they can be worked through one topic at a time, with every point appearing in exactly one.

Anyone signed in may [create a topic](reaction:topics.managing.CreateTopic); the session's user becomes its owner, so a request cannot create a topic for someone else. Categorizing refuses a blank or overlong name with `INVALID_CATEGORY`, and a second topic with the same name for the same owner with `CATEGORY_EXISTS`. The endpoint responds with the new topic, because the caller has no other way to learn its identity.

```endpoints
topics.managing.CreateTopic at /topics/create
```

The owner may [rename a topic](reaction:topics.managing.RenameTopic). Its points stay in it, because they refer to the topic's identity, not its name.

```endpoints
topics.managing.RenameTopic at /topics/rename
```

The owner may [delete a topic](reaction:topics.managing.DeleteTopic) once it is empty. Categorizing refuses to delete a topic that still has points with `CATEGORY_NOT_EMPTY`, so deleting a topic never leaves a point without one. The person moves or deletes the points first.

```endpoints
topics.managing.DeleteTopic at /topics/delete
```

Renaming or deleting a topic someone else owns is answered with `NOT_FOUND`, as described in [access](access.md).
