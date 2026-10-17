# Cueing

## Purpose

Allows a user to make a brief hint or signal toward doing a task they mostly understand

*Prevents*: Avoidance of making notes due to data entry fatigue;Spontaneous forgetfulness of something one knows.

## Principle

A user can create a cue with a short name so that they can refer to it when performing a task later. After creating a cue for a task, seeing the cue's name is enough to guide them
toward the task's completion, even though the cue was too short to include many details.

## Types

```types
external User
  The person who creates cues for themselves.
```

## State

```state
a seq of Cues with
  a creator User
  a name String

Rule: a cue's name is stored trimmed, and is never blank or longer than 100 characters.
```

## Actions

```actions
create(creator: User, name: String) : returns (cue: Cue)
  where name is blank or longer than 100 characters once trimmed
  then
    refuses INVALID_NAME "A name must have 1 to 100 characters."
  where name is accepted
  then
    append a new cue with creator and the trimmed name
    returns cue

rename(cue: Cue, name: String) : returns (cue: Cue)
  where cue is not in Cues
  then
    refuses CUE_NOT_FOUND "Cue does not exist."
  where cue is in Cues and name is blank or longer than 100 characters once trimmed
  then
    refuses INVALID_NAME "A name must have 1 to 100 characters."
  where cue is in Cues and name is accepted
  then
    set the name of cue to the trimmed name
    returns cue

delete(cue: Cue) : returns (cue: Cue)
  where cue is not in Cues
  then
    refuses CUE_NOT_FOUND "Cue does not exist."
  where cue is in Cues
  then
    remove cue
    returns cue
```

## Queries

```queries
_cues(creator: User) : many (cue: Cue, name: String)
  Returns each cue of the creator with its name, newest first, or no rows when the creator has none.

_search(creator: User, text: String) : many (cue: Cue, name: String)
  Returns each cue of the creator whose name contains the trimmed text, ignoring case, newest first.
  Returns no rows when none matches, and every cue of the creator when the text is blank.

_get(cue: Cue) : optional (creator: User, name: String)
  Returns the cue's creator and name, or no row when the cue is not in Cues.
```
