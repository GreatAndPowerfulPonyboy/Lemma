import {type Collection, type Db, MongoServerError} from "mongodb"
export class InvalidCategory extends Error {}
export class NotPlaced extends Error {}
export class CategoryNotFound extends Error{}
export class CategoryExists  extends Error{}
export class CategoryNotEmpty extends Error{}
export type Category = string & {readonly __brand: "Category"}

interface CategoryDocument<User> {
  _id: Category
  creator: User,
  name: string,
}

interface ItemDocument<Item> {
  _id: Item,
  category: Category
}
/** Allows the partitioning of items into categories such that you can work throguh each category one at a time and see every categorized item exactly once */

export class CategorizingConcept<User extends string, Item extends string> {
  private readonly categories: Collection<CategoryDocument<User>>;
  private readonly items: Collection<ItemDocument<Item>>;
  private indexes: Promise<unknown> | undefined;

  constructor(database: Db, name = "Categorizing") {
    this.categories = database.collection(`${name.toLowerCase()}.categories`);
    this.items = database.collection(`${name.toLowerCase()}.items`);
  }

  /** Creates the unique index once. It makes MongoDB refuse the same category twice on one item, even when two  requests arrive at once. If creating it fails, the next action tries again. */

  #ready() {
    this.indexes ??= this.categories
        .createIndex({creator: 1, name: 1}, {unique: true})
        .catch((error:unknown) => {
          this.indexes = undefined;
          throw error;
        })
        return this.indexes;
  }

  async create({creator, name}: {creator: User, name: string}) {
    const trimmed = name.trim();
    if (!(trimmed.length <= 80 && trimmed.length >= 1)) throw new InvalidCategory("A category name must be between 1 and 80 characters.");
    const category = crypto.randomUUID() as Category;
    await this.#ready();
    try {
      await this.categories.insertOne({_id: category,creator, name: trimmed});
      
    } catch (error) {
      if (isDuplicate(error)) throw new CategoryExists ("You already have a category with that name.");
      throw error;
    }
    return {category};
    
  }

  async rename({category, name}: {category: Category, name: string}) {
    await this.#ready();
    const existingCategory = await this.categories.findOne({_id: category});
    if (existingCategory === null) throw new CategoryNotFound ("There is no such category");
    const trimmed = name.trim();
    if (!(trimmed.length <= 80 && trimmed.length >= 1)) throw new InvalidCategory("A category name must be between 1 and 80 characters.")
    try {
      await this.categories.updateOne({_id: existingCategory._id},
                    {$set: {name: trimmed}})
    } catch (error) {
      if (isDuplicate(error)) {
        throw new CategoryExists ("You already have a category with that name");
      }
      throw error;
    }
    return {category};
  }

  async delete({category} : {category: Category}) {
    await this.#ready();
    const existingCategory = await this.categories.findOne({_id: category})
    if (existingCategory === null) throw new CategoryNotFound ("There is no such category.");
    const placed = await this.items.countDocuments({category}, {limit: 1});
    if (placed !== 0) throw new CategoryNotEmpty("Move or delete this category's items before deleting it.");
    await this.categories.deleteOne({_id: category});

    return {category};
  }

  async place({category, item}: {category: Category, item: Item}) {
    const existingCategory = await this.categories.findOne({_id: category});
    if (existingCategory === null) throw new CategoryNotFound("There is no such category.");
    await this.items.updateOne(
      {_id: item},
      {$set: {category: existingCategory._id }},
      // Placing moves an item from one category to another, so we upsert
      {upsert: true}
    )
    return {item};
  }

  async unplace({item}:  {item: Item}) {
    const {deletedCount} = await this.items.deleteOne({_id: item});
    if (deletedCount === 0) throw new NotPlaced("That item is not in a category.");
    return {item};
    }

  async _categories({creator}: {creator: User}) {
    const found = await this.categories.find({creator}).sort( {name: 1}).toArray()
    return found.map(({_id, name}) => ({category: _id, name: name}));
  }

  async _get({category}:  {category: Category}) {
    const found = await this.categories.findOne({_id: category});
    return found === null ? [] : [{creator: found.creator, name: found.name}];
  }

  async _items({category}: {category: Category}) {
    const found = await this.items.find({category}).toArray();
    return found.map(({_id}) => ({item: _id}));
  }

  async _category({item}: {item: Item}) {
    const found = await this.items.findOne({_id: item});
    return found === null ? [] : [{category: found.category}];
  }
}


/** 11000 is the code MongoDB gives a write that breaks a unique index. */
const isDuplicate = (error: unknown) => error instanceof MongoServerError && error.code === 11000;
