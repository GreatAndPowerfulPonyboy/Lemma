# Flashcarding

## Purpose

Keep an answer for an item, written once a person has found they need one, so that later attempts at the item can be checked against it.

*Prevents*: Writing answers for everything up front, before knowing which items need them; going back through one's notes every time an item that was missed before is checked again.

## Principle

After a person fails to recall an item, they write an answer for it while their notes are open. The next time they recall the item, they check what they produced against that answer instead of their notes. When their understanding changes, they revise the answer, and later checks use the revised one. Once they remove the answer, the item has none again.

## Types

```types
external Item
  The thing an answer is written for.
```

## State

```state
a set of Items with
  an answer String

Rule: an answer is never blank or longer than 5000 characters.
```

## Actions

```actions
write(item: Item, answer: String) : returns (item: Item)
  where answer is blank or longer than 5000 characters
  then
    refuses INVALID_ANSWER "An answer must have 1 to 5000 characters."
  where answer is accepted and item already has an answer
  then
    refuses ALREADY_ANSWERED "That item already has an answer."
  where answer is accepted and item has no answer
  then
    set the answer of item to answer
    returns item

revise(item: Item, answer: String) : returns (item: Item)
  where item has no answer
  then
    refuses NO_ANSWER "That item has no answer."
  where item has an answer and answer is blank or longer than 5000 characters
  then
    refuses INVALID_ANSWER "An answer must have 1 to 5000 characters."
  where item has an answer and answer is accepted
  then
    set the answer of item to answer
    returns item

remove(item: Item) : returns (item: Item)
  where item has no answer
  then
    refuses NO_ANSWER "That item has no answer."
  where item has an answer
  then
    remove item from Items
    returns item
```

## Queries

```queries
_answer(item: Item) : optional (answer: String)
  Returns the item's answer, or no row when it has none.
```
