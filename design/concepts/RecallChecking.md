# RecallChecking

## Purpose

Determining of what subset of information one can reliably dredge up unprompted as well as how confident one is in their answers.

*Prevents*: Unjustified confidence in understanding due to being able to produce information when cued that one cannot dredge up unprompted;Inability to separate points of high confidence from those with low confidence.

## Principle

After a user chooses the items they mean to cover and gives an account from memory, submitting it splits the items into those the account mentioned and those it omitted. The user corrects any item that was misjudged and closes the check. What remains omitted is what they could not produce without being prompted.

## Types

```types
external User
  The person giving the account.

external Item
  A thing the person means to cover.

CheckStatus is OPEN or GRADED or CLOSED
  OPEN while items are being chosen, GRADED once the account is matched, CLOSED once the result is final.
```

## State

```state
a set of Checks with
  an owner User
  a name String
  a status CheckStatus
  a subject set of Items
  a mentioned set of Items
  an omitted set of Items
  a credit Number

Rule: an OPEN check has no mentioned or omitted items; in any other check, mentioned and omitted partition subject.
Rule: credit is between 0 and 1, and is 0 until the check is rated.
Rule: RecallChecking never receives or stores the account itself; whoever reads the account marks the items it mentioned before the check closes.
```

## Actions

```actions
open(owner: User, name: String) : returns (check: Check)
  where name is blank or longer than 80 characters once trimmed
  then
    refuses INVALID_NAME "A check name must have 1 to 80 characters."
  where name is accepted
  then
    add a new check with owner and the trimmed name, status OPEN, an empty subject, and credit 0
    returns check

include(check: Check, item: Item) : returns (check: Check)
  where check is not in Checks
  then
    refuses CHECK_NOT_FOUND "There is no such check."
  where check is in Checks and its status is not OPEN
  then
    refuses NOT_OPEN "This check has already been submitted."
  where check is OPEN and item is in its subject
  then
    refuses ALREADY_INCLUDED "That item is already in this check."
  where check is OPEN and item is not in its subject
  then
    add item to the subject of check
    returns check

submit(check: Check) : returns (check: Check)
  where check is not in Checks
  then
    refuses CHECK_NOT_FOUND "There is no such check."
  where check is in Checks and its status is not OPEN
  then
    refuses NOT_OPEN "This check has already been submitted."
  where check is OPEN and its subject is empty
  then
    refuses EMPTY_CHECK "Choose at least one item before submitting."
  where check is OPEN and its subject is not empty
  then
    put every item of the subject into omitted, and none into mentioned
    set the status of check to GRADED
    returns check

markMentioned(check: Check, item: Item) : returns (check: Check)
  where check is not in Checks
  then
    refuses CHECK_NOT_FOUND "There is no such check."
  where check is in Checks and its status is not GRADED
  then
    refuses NOT_GRADED "This check can't be corrected now."
  where check is GRADED and item is not in its omitted
  then
    refuses NOT_OMITTED "That item isn't marked as omitted."
  where check is GRADED and item is in its omitted
  then
    move item from omitted to mentioned
    returns check

markOmitted(check: Check, item: Item) : returns (check: Check)
  where check is not in Checks
  then
    refuses CHECK_NOT_FOUND "There is no such check."
  where check is in Checks and its status is not GRADED
  then
    refuses NOT_GRADED "This check can't be corrected now."
  where check is GRADED and item is not in its mentioned
  then
    refuses NOT_MENTIONED "That item isn't marked as mentioned."
  where check is GRADED and item is in its mentioned
  then
    move item from mentioned to omitted
    returns check

rate(check: Check, credit: Number) : returns (check: Check)
  where check is not in Checks
  then
    refuses CHECK_NOT_FOUND "There is no such check."
  where check is in Checks and its status is not GRADED
  then
    refuses NOT_GRADED "This check can't be corrected now."
  where check is GRADED and credit is not between 0 and 1
  then
    refuses INVALID_CREDIT "A rating must be between 0 and 1."
  where check is GRADED and credit is between 0 and 1
  then
    set the credit of check to credit
    returns check

close(check: Check) : returns (check: Check)
  where check is not in Checks
  then
    refuses CHECK_NOT_FOUND "There is no such check."
  where check is in Checks and its status is not GRADED
  then
    refuses NOT_GRADED "This check can't be closed now."
  where check is GRADED
  then
    set the status of check to CLOSED
    returns check

abandon(check: Check) : returns (check: Check)
  where check is not in Checks
  then
    refuses CHECK_NOT_FOUND "There is no such check."
  where check is in Checks and its status is CLOSED
  then
    refuses ALREADY_CLOSED "This check is already closed."
  where check is OPEN or GRADED
  then
    remove check
    returns check
```

## Queries

```queries
_get(check: Check) : optional (owner: User, name: String, status: CheckStatus, credit: Number)
  Returns the check's owner, name, status and credit, or no row when the check is not in Checks.

_subject(check: Check) : many (item: Item)
  Returns each item in the subject of the check, in the order they were included, or no rows when it has none or is unknown.

_mentioned(check: Check) : many (item: Item)
  Returns each mentioned item of the check, in the order they were included, or no rows when there are none or the check is OPEN or unknown.

_omitted(check: Check) : many (item: Item)
  Returns each omitted item of the check, in the order they were included, or no rows when there are none or the check is OPEN or unknown.
```
