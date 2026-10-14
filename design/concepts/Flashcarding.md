# Flashcarding

## Purpose

Allows testing of understanding by comparing a recalled answer from an answer made in advance.

*Prevents*: Inability to discover a gap in knowledge due to lack of self-testing.

## Principle

After a user writes an answer for an item, they can test their understanding of that item at a later date by comparing a recalled answer to the answer they stored.
To reflect a change in understanding, they can revise their answer and future reviews will show the revised answer.

## Types

```types
external Item
  The thing an answer is written for.
```

## State

```state
a set of Items with
  an optional answer String

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
    refuses NO_ANSWER "Answer does not exist for item."
  where item has an answer and answer is blank or longer than 5000 characters
  then
    refuses INVALID_ANSWER "An answer must have 1 to 5000 characters."
  where item has an answer and answer is accepted
  then
    set the answer of item to answer
    returns item

confirm(item: Item) : returns (item: Item)
  where item has no answer
  then
    refuses NO_ANSWER "Answer does not exist for item."
  where item has an answer
  then
    returns item

miss(item: Item) : returns (item: Item)
  where item has no answer
  then
    refuses NO_ANSWER "Answer does not exist for item."
  where item has an answer
  then
    returns item

remove(item: Item) : returns (item: Item)
  where item has no answer
  then
    refuses NO_ANSWER "Answer does not exist for item."
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
