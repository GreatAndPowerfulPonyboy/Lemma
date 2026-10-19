# RecallChecking

## Purpose

Determining of what subset of information one can reliably dredge up unprompted as well as how confident one is in their answers.

*Prevents*: Unjustified confidence in understanding due to being able to produce information when cued that one cannot dredge up unprompted;Inability to separate points of high confidence from those with low confidence.

## Principle

A user opens a check named for what they will explain, and includes the items a good explanation should cover. Each time they attempt it, they give an account from memory and submit; submitting splits the items into those the account mentioned and those it omitted. The user corrects any item that was misjudged, rates the attempt if they wish, and closes it, which fixes its credit: the share of the items mentioned, or the rating. What remains omitted is what they could not produce without being prompted. The check stays, so they can attempt it again later and compare.

## Types

```types
external User
  The person giving the account.

external Item
  A thing the person means to cover.

AttemptStatus is OPEN or GRADED or CLOSED or ABANDONED
  OPEN while the account is being given, GRADED once it is submitted and being corrected, CLOSED once its credit is fixed, ABANDONED if it was given up.
```

## State

```state
a set of Checks with
  an owner User
  a name String
  a subject set of Items
  an itemNames seq of String

a set of Attempts with
  a check Check
  a status AttemptStatus
  a subject set of Items
  an itemNames seq of String
  a mentioned set of Items
  an omitted set of Items
  an optional rating Number
  a credit Number

Rule: a check's name is stored trimmed, and is never blank or longer than 200 characters.
Rule: itemNames holds the name of each item in subject, in the same order.
Rule: an attempt's subject and item names are the check's when the attempt began; later changes to the check don't change them.
Rule: a check has at most one attempt that is OPEN or GRADED.
Rule: an OPEN attempt has no mentioned or omitted items; in any other attempt, mentioned and omitted partition its subject.
Rule: rating and credit are between 0 and 1, and credit is 0 until the attempt is CLOSED.
Rule: RecallChecking never receives or stores the account itself; whoever reads the account marks the items it mentioned.
```

## Actions

```actions
open(owner: User, name: String) : returns (check: Check)
  where name is blank or longer than 200 characters once trimmed
  then
    refuses INVALID_NAME "A check name must have 1 to 200 characters."
  where name is accepted
  then
    add a new check with owner, the trimmed name, and an empty subject
    returns check

rename(check: Check, name: String) : returns (check: Check)
  where check is not in Checks
  then
    refuses CHECK_NOT_FOUND "There is no such check."
  where check is in Checks and name is blank or longer than 200 characters once trimmed
  then
    refuses INVALID_NAME "A check name must have 1 to 200 characters."
  where check is in Checks and name is accepted
  then
    set the name of check to the trimmed name
    returns check

include(check: Check, item: Item, name: String) : returns (check: Check)
  where check is not in Checks
  then
    refuses CHECK_NOT_FOUND "There is no such check."
  where check is in Checks and item is in its subject
  then
    refuses ALREADY_INCLUDED "That item is already in this check."
  where check is in Checks and item is not in its subject
  then
    add item to the subject of check, with name as its name
    returns check

exclude(check: Check, item: Item) : returns (check: Check)
  where check is not in Checks
  then
    refuses CHECK_NOT_FOUND "There is no such check."
  where check is in Checks and item is not in its subject
  then
    refuses NOT_INCLUDED "That item isn't in this check."
  where check is in Checks and item is in its subject
  then
    remove item and its name from the subject of check
    returns check

relabel(item: Item, name: String) : returns (item: Item)
  where any checks include item, or none do
  then
    set the name of item in the subject of every check that includes it
    returns item

delete(check: Check) : returns (check: Check)
  where check is not in Checks
  then
    refuses CHECK_NOT_FOUND "There is no such check."
  where check is in Checks
  then
    remove check and every attempt of it
    returns check

attempt(check: Check) : returns (attempt: Attempt)
  where check is not in Checks
  then
    refuses CHECK_NOT_FOUND "There is no such check."
  where check is in Checks and some attempt of it is OPEN or GRADED
  then
    refuses ATTEMPT_IN_PROGRESS "Finish or abandon the current attempt first."
  where check is in Checks and no attempt of it is OPEN or GRADED
  then
    add a new OPEN attempt of check with the check's subject and item names, no mentioned or omitted items, no rating, and credit 0
    returns attempt

submit(attempt: Attempt) : returns (attempt: Attempt)
  where attempt is not in Attempts
  then
    refuses ATTEMPT_NOT_FOUND "There is no such attempt."
  where attempt is in Attempts and its status is not OPEN
  then
    refuses NOT_OPEN "This attempt has already been submitted."
  where attempt is OPEN
  then
    put every item of its subject into omitted, and none into mentioned
    set the status of attempt to GRADED
    returns attempt

mention(attempt: Attempt, item: Item) : returns (attempt: Attempt)
  where attempt is not in Attempts
  then
    refuses ATTEMPT_NOT_FOUND "There is no such attempt."
  where attempt is in Attempts and its status is not GRADED
  then
    refuses NOT_GRADED "This attempt can't be corrected now."
  where attempt is GRADED and item is not in its subject
  then
    refuses NOT_IN_SUBJECT "That item isn't part of this attempt."
  where attempt is GRADED and item is in its subject
  then
    remove item from omitted and add it to mentioned
    returns attempt

omit(attempt: Attempt, item: Item) : returns (attempt: Attempt)
  where attempt is not in Attempts
  then
    refuses ATTEMPT_NOT_FOUND "There is no such attempt."
  where attempt is in Attempts and its status is not GRADED
  then
    refuses NOT_GRADED "This attempt can't be corrected now."
  where attempt is GRADED and item is not in its subject
  then
    refuses NOT_IN_SUBJECT "That item isn't part of this attempt."
  where attempt is GRADED and item is in its subject
  then
    remove item from mentioned and add it to omitted
    returns attempt

rate(attempt: Attempt, rating: Number) : returns (attempt: Attempt)
  where attempt is not in Attempts
  then
    refuses ATTEMPT_NOT_FOUND "There is no such attempt."
  where attempt is in Attempts and its status is not GRADED
  then
    refuses NOT_GRADED "This attempt can't be corrected now."
  where attempt is GRADED and rating is not between 0 and 1
  then
    refuses INVALID_RATING "A rating must be between 0 and 1."
  where attempt is GRADED and rating is between 0 and 1
  then
    set the rating of attempt to rating
    returns attempt

close(attempt: Attempt) : returns (attempt: Attempt, check: Check, credit: Number)
  where attempt is not in Attempts
  then
    refuses ATTEMPT_NOT_FOUND "There is no such attempt."
  where attempt is in Attempts and its status is not GRADED
  then
    refuses NOT_GRADED "This attempt can't be closed now."
  where attempt is GRADED, has no rating, and its subject is empty
  then
    refuses UNRATED "Rate an attempt with no items before closing it."
  where attempt is GRADED and has a rating
  then
    let check be the check of attempt
    set the credit of attempt to its rating
    set the status of attempt to CLOSED
    returns attempt, check, credit
  where attempt is GRADED, has no rating, and its subject is not empty
  then
    let check be the check of attempt
    set the credit of attempt to the number of mentioned items divided by the number of items in its subject
    set the status of attempt to CLOSED
    returns attempt, check, credit

abandon(attempt: Attempt) : returns (attempt: Attempt)
  where attempt is not in Attempts
  then
    refuses ATTEMPT_NOT_FOUND "There is no such attempt."
  where attempt is in Attempts and its status is CLOSED or ABANDONED
  then
    refuses FINISHED "This attempt is already finished."
  where attempt is OPEN or GRADED
  then
    set the status of attempt to ABANDONED
    returns attempt
```

## Queries

```queries
_checks(owner: User) : many (check: Check, name: String)
  Returns each check of the owner with its name, newest first, or no rows when the owner has none.

_get(check: Check) : optional (owner: User, name: String)
  Returns the check's owner and name, or no row when the check is not in Checks.

_subject(check: Check) : many (item: Item, name: String)
  Returns each item in the subject of the check with its name, in the order they were included, or no rows when it has none or is unknown.

_including(item: Item) : many (check: Check)
  Returns each check whose subject includes the item, or no rows when there are none.

_attempts(check: Check) : many (attempt: Attempt, status: AttemptStatus, credit: Number)
  Returns each attempt of the check with its status and credit, newest first, or no rows when it has none or is unknown.

_current(check: Check) : optional (attempt: Attempt, status: AttemptStatus)
  Returns the check's attempt that is OPEN or GRADED, or no row when it has none.

_attempt(attempt: Attempt) : optional (check: Check, status: AttemptStatus, credit: Number)
  Returns the attempt's check, status and credit, or no row when the attempt is not in Attempts.

_attemptSubject(attempt: Attempt) : many (item: Item, name: String)
  Returns each item in the subject of the attempt with the name it had when the attempt began, in the order they were included, or no rows when it has none or is unknown.

_mentioned(attempt: Attempt) : many (item: Item, name: String)
  Returns each mentioned item of the attempt with its name, in the order they were included, or no rows when there are none or the attempt is OPEN or unknown.

_omitted(attempt: Attempt) : many (item: Item, name: String)
  Returns each omitted item of the attempt with its name, in the order they were included, or no rows when there are none or the attempt is OPEN or unknown.

_missed(owner: User, atLeast: Number) : many (item: Item, misses: Number)
  Returns each item omitted from at least atLeast CLOSED attempts at the owner's checks, with how many, most misses first, or no rows when there are none.
```
