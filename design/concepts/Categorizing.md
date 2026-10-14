# Categorizing

## Purpose

Allows the partitioning of items into categories such that you can work through each category one at a time and see every categorized item exactly once.

*Prevents*: Duplication of work when you are trying to see every item across your organizational scheme.

## Principle

A user can create a category and place items into it so that they can find every item within by that category.
They must move items from one category to another to change their organization scheme and after doing so the item leaves the first category and enters the second.
When they go through all their categories, they will see every categorized item exactly once.

## Types

```types
external User
  The person who owns a category.

external Item
  The thing placed in a category.
```

## State

```state
a set of Categories with
  an owner User
  a name String
  unique owner and name

a set of Items with
  a Category

Rule: a category's name is stored trimmed, and is never blank or longer than 80 characters.
```

## Actions

```actions
create(owner: User, name: String) : returns (category: Category)
  where name is blank or longer than 80 characters once trimmed
  then
    refuses INVALID_NAME "A category name must have 1 to 80 characters."
  where owner already has a category with the trimmed name
  then
    refuses CATEGORY_EXISTS "You already have a category with that name."
  where name is accepted and owner has no category with the trimmed name
  then
    add a new category with owner and the trimmed name
    returns category

rename(category: Category, name: String) : returns (category: Category)
  where category is not in Categories
  then
    refuses CATEGORY_NOT_FOUND "There is no such category."
  where category is in Categories and name is blank or longer than 80 characters once trimmed
  then
    refuses INVALID_NAME "A category name must have 1 to 80 characters."
  where category is in Categories and name is accepted and its owner has another category with the trimmed name
  then
    refuses CATEGORY_EXISTS "You already have a category with that name."
  where category is in Categories, name is accepted, and its owner has no other category with the trimmed name
  then
    set the name of category to the trimmed name
    returns category

delete(category: Category) : returns (category: Category)
  where category is not in Categories
  then
    refuses CATEGORY_NOT_FOUND "There is no such category."
  where some item is placed in category
  then
    refuses CATEGORY_NOT_EMPTY "Move or delete this category's items before deleting it."
  where category is in Categories and no item is placed in it
  then
    remove category
    returns category

place(item: Item, category: Category) : returns (item: Item)
  where category is not in Categories
  then
    refuses CATEGORY_NOT_FOUND "There is no such category."
  where category is in Categories
  then
    set the category of item to category, replacing any category it had
    returns item

unplace(item: Item) : returns (item: Item)
  where item is not placed in any category
  then
    refuses NOT_PLACED "That topic is not in a category."
  where item is placed in some category
  then
    remove item from Items
    returns item
```

## Queries

```queries
_categories(owner: User) : many (category: Category, name: String)
  Returns each category of the owner with its name, in alphabetical order of name, or no rows when the owner has none.

_get(category: Category) : optional (owner: User, name: String)
  Returns the category's owner and name, or no row when the category is not in Categories.

_items(category: Category) : many (item: Item)
  Returns each item placed in the category, in the order they were placed, or no rows when the category is empty or unknown.

_category(item: Item) : optional (category: Category)
  Returns the category the item is placed in, or no row when it is not placed.
```
