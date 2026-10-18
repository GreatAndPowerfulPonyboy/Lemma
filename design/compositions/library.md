# Home
The home screen is the main screen of Lemma. It lists every point a user [owns](view:access.permissions.ownsPoint) and gives them the ability to filter them by topic and search for them by name. This makes it easy for users to quickly capture points and then reference and group them later to serve as the basis for a recall session.
The [home endpoint](reaction:home.showing.ShowHome) reads the user from the session and responds with two lists `myPoints` and `myTopics`.

[My points](former:home.showing.myPoints) are the points that the user has created, sorted newest first. Each point has its topic (if any) above it, as well as a 'tap to flip' indicator if an answer has been written for them.

[My topics](former:home.showing.myTopics) are the topics that a user [owns](view:access.permissions.ownsTopic). These topics can be used as a filter over the points a user has created.


```endpoints
home.showing.ShowHome at /home
```
