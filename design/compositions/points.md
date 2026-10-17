# Points
In Lemma, users create points that they place within topics to guide recall sessions.

The [create endpoint](reaction:points.creating.CreatePoint) makes a point for the signed-in user with `Cueing.create` and responds with that point. To ensure that points are not flashcards with lengthy answers, a point's name must be between 1 and 80 characters in length once trimmed. Otherwise, the name is refused by Cueing with `INVALID_NAME`. This name restriction also applies to renaming.

```endpoints
points.creating.CreatePoint at /point/create
```
When a person [owns](view:access.permissions.ownsPoint) a point, the [rename endpoint](reaction:points.renaming.RenamePoint) renames it on their request via `Cueing.rename` and responds with the renamed point.

```endpoints
points.renaming.RenamePoint at /point/rename
````

When a person [owns](view:access.permissions.ownsPoint) a point, the [delete endpoint](reaction:points.deleting.DeletePoint) removes it on their request via `Cueing.delete` and responds with the point. To maintain the invariant that every point is attached to a topic, the point is also [removed](reaction:points.deleting.UnplaceDeleted) from its topic.

For those who do not own a point, the rename and delete endpoints respond with `NOT_FOUND`. An equivalent response is given for points that do not exist.

```endpoints
points.deleting.DeletePoint at /point/delete
```

In order to move a point from one topic to another, a user must [own](view:access.permissions.ownsPoint) the point and [own](view:access.permissions.ownsTopic) both the previous and incident topic, the [move endpoint](reaction:points.moving.MovePoint) moves it from one topic to another via `Categorizing.place` and `Categorizing.unplace`.

```endpoints
points.moving.MovePoint at /point/move
```
