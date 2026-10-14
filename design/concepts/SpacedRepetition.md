# SpacedRepetition

## Purpose

Scheduling of retrieval of items based on how many times an item is missed, such that items a user successfully retrieves are seen again at later dates than those a user has repeatedly missed.

*Prevents*: Administrative load of probing your own memory for what you've forgotten;Wasted effort on retrieving what is already known.

## Principle

After an item is enrolled, it is due at once. Each time it is retrieved successfully, it comes back after a longer gap than the last. When it is failed, its lapse count rises and it comes back the next day, and later successes lengthen its gaps more slowly than before. At any moment, the items that are due are the ones closest to being forgotten.

## Types

```types
external Item
  The thing being retrieved.
```

## State

```state
a set of Entries with
  a unique Item
  a due DateTime
  an interval Number
  a lapses Number
  an optional lastLapse DateTime

Rule: interval is a number of days, and is never less than 1.
```

## Actions

```actions
enroll(item: Item) : returns (item: Item)
  where some entry has item
  then
    refuses ALREADY_ENROLLED "That item is already scheduled."
  where no entry has item
  then
    add a new entry for item with interval 1, no lapses, and due now
    returns item

advance(item: Item, credit: Number) : returns (item: Item, due: DateTime)
  where no entry has item
  then
    refuses NOT_ENROLLED "That item isn't scheduled."
  where some entry has item and credit is not between 0 and 1
  then
    refuses INVALID_CREDIT "Credit must be between 0 and 1."
  where some entry has item and credit is between 0 and 1
  then
    let growth be 2.5 less 0.2 for each lapse of the entry, but never less than 1.3
    multiply the entry's interval by 1 plus credit times (growth minus 1)
    set the entry's due to now plus its interval
    returns item, due

lapse(item: Item) : returns (item: Item, due: DateTime)
  where no entry has item
  then
    refuses NOT_ENROLLED "That item isn't scheduled."
  where some entry has item
  then
    set the entry's interval to 1, add one to its lapses, and set its lastLapse to now
    set the entry's due to now plus its interval
    returns item, due

drop(item: Item) : returns (item: Item)
  where no entry has item
  then
    refuses NOT_ENROLLED "That item isn't scheduled."
  where some entry has item
  then
    remove the entry for item
    returns item
```

## Queries

```queries
_due(before: DateTime) : many (item: Item, due: DateTime)
  Returns each item whose entry is due at or before the given time, earliest due first, or no rows when none is.

_entry(item: Item) : optional (due: DateTime, interval: Number, lapses: Number)
  Returns the item's due time, interval and lapses, or no row when the item is not enrolled.

_lapsed(atLeast: Number) : many (item: Item, lapses: Number, lastLapse: DateTime)
  Returns each item that has lapsed at least the given number of times, with its lapses and last lapse, most lapses first and then most recent lapse first.
  Returns no rows when none has.
```
