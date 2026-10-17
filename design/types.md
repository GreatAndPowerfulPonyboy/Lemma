# Lemma types
Every person in Lemma is a Registering user. That user is the one who has a password in Authenticating, the one a session belongs to, and the creator of topics, points, and flashcards. They are the ones who open and own recall checks.
Lemma revolves around points that are placed within topics. A point is a Cueing cue and a topic is a Categorizing category. Flashcarding attaches answers to points at a user's request, and such a point is a Card. The items that are covered within a recall check are points.
The creator of a category or cue is its owner, and the access views define who may do what with a category or cue (and by extension, a Card).
In Lemma, SpacedRepetition has two instances, one named CardRepetition, which schedules cards, and another named OralRepetition, which schedules points.



```instances
instantiate Registering

instantiate Cueing with
  User is Registering.User
  
instantiate Categorizing with
  User is Registering.User
  Item is Cueing.cue
  
instantiate Authenticating with
  User is Registering.User

instantiate Sessioning with
  Subject is Registering.User
````
