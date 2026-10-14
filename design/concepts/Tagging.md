# Tagging

## Purpose

Allows for the retrieval of items by any number of a set of named references such that a user may retrieve items under varying levels of specificity. 

*Prevents*: Wasting cognitive effort trying to come up with the perfect single reference organizational scheme.

## Principle
After a user affixes a tag to several items, asking for that tag returns exactly those items, including items that also carry other tags. An item with two tags is found under each of them. Once the user detaches a tag from an item, that tag no longer returns it, and its other tags still do.

## Types

```types
external User
  The person who owns a tag.

external Item
  The thing a tag is affixed to.
```

## State

```state
a set of Tags with
  an owner User
  a name String
  an items set of Items
  unique owner and name

Rule: a tag's name is stored trimmed, and is never blank or longer than 80 characters.
```

## Actions

```actions
create(owner: User, name: String) : returns (tag: Tag)
  where name is blank or longer than 80 characters once trimmed
  then
    refuses INVALID_NAME "A tag name must have 1 to 80 characters."
  where name is accepted and owner already has a tag with the trimmed name
  then
    refuses TAG_EXISTS "You already have a tag with that name."
  where name is accepted and owner has no tag with the trimmed name
  then
    add a new tag with owner, the trimmed name, and no items
    returns tag

rename(tag: Tag, name: String) : returns (tag: Tag)
  where tag is not in Tags
  then
    refuses TAG_NOT_FOUND "Tag does not exist."
  where tag is in Tags and name is blank or longer than 80 characters once trimmed
  then
    refuses INVALID_NAME "A tag name must have 1 to 80 characters."
  where tag is in Tags, name is accepted, and its owner has another tag with the trimmed name
  then
    refuses TAG_EXISTS "You already have a tag with that name."
  where tag is in Tags, name is accepted, and its owner has no other tag with the trimmed name
  then
    set the name of tag to the trimmed name
    returns tag

delete(tag: Tag) : returns (tag: Tag)
  where tag is not in Tags
  then
    refuses TAG_NOT_FOUND "Tag does not exist.."
  where tag is in Tags
  then
    remove tag
    returns tag

affix(tag: Tag, item: Item) : returns (tag: Tag)
  where tag is not in Tags
  then
    refuses TAG_NOT_FOUND "Tag does not exist."
  where tag is in Tags and item is in its items
  then
    refuses ALREADY_TAGGED "Tag already affixed to item.."
  where tag is in Tags and item is not in its items
  then
    add item to the items of tag
    returns tag

detach(tag: Tag, item: Item) : returns (tag: Tag)
  where tag is not in Tags
  then
    refuses TAG_NOT_FOUND "Tag does not exist."
  where tag is in Tags and item is not in its items
  then
    refuses NOT_TAGGED "That item doesn't have this tag."
  where tag is in Tags and item is in its items
  then
    remove item from the items of tag
    returns tag
```

## Queries

```queries
_tags(owner: User) : many (tag: Tag, name: String)
  Returns each tag of the owner with its name, in alphabetical order of name, or no rows when the owner has none.

_get(tag: Tag) : optional (owner: User, name: String)
  Returns the tag's owner and name, or no row when the tag is not in Tags.

_items(tag: Tag) : many (item: Item)
  Returns each item of the tag, in the order they were affixed, or no rows when the tag has none or is unknown.

_tagsOf(item: Item) : many (tag: Tag, name: String)
  Returns each tag whose items include the item, with its name, in alphabetical order of name, or no rows when there are none.
```
