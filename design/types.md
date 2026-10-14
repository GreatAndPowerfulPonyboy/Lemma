# Lemma types
Every person in Lemma is a Registering user, whether they signed up with a password or signed in with Commons. That user is hteo ne who has a password in Authenticating, the one a session belongs to, who creates and owns cues and cateogies,
People create categories, in which they categorize cues.
```instances
instantiate Registering
instantiate Authenticating with
  User is Registering.User
instantiate Sessioning with
  Subject is Registering.User
````
Not registered yet:

```text
instantiate Cueing with
  User is Registering.User
instantiate Categorizing with
  User is Registering.User
  Item is Cueing.Cue
````
