import { type Collection, type Db, ObjectId } from "mongodb";

export class InvalidName extends Error {}
export class CheckNotFound extends Error {}
export class AlreadyIncluded extends Error {}
export class NotIncluded extends Error {}
export class AttemptInProgress extends Error {}
export class AttemptNotFound extends Error {}
export class NotOpen extends Error {}
export class NotGraded extends Error {}
export class NotInSubject extends Error {}
export class InvalidRating extends Error {}
export class Unrated extends Error {}
export class Finished extends Error {}

/** Both identities are ObjectId hex strings, which begin with the time they were made, so sorting by them sorts by age. */
export type Check = string & { readonly __brand: "Check" };
export type Attempt = string & { readonly __brand: "Attempt" };
export type AttemptStatus = "OPEN" | "GRADED" | "CLOSED" | "ABANDONED";

const MAX_NAME = 200;
const UNFINISHED: AttemptStatus[] = ["OPEN", "GRADED"];

/** An item in a subject, with the name it is shown by. */
interface Entry<Item> {
  item: Item;
  name: string;
}

interface CheckDocument<User, Item> {
  _id: Check;
  owner: User;
  name: string;
  /** In the order the items were included. */
  subject: Entry<Item>[];
}

interface AttemptDocument<Item> {
  _id: Attempt;
  check: Check;
  status: AttemptStatus;
  /** A copy of the check's subject, names included, when the attempt began; mentioned and omitted are read back in its order. */
  subject: Entry<Item>[];
  mentioned: Item[];
  omitted: Item[];
  rating?: number;
  credit: number;
}

/**
 * Finds out which of the items someone meant to cover they leave out of accounts given from memory, attempt after attempt.
 * The account itself never reaches this concept: whoever reads it marks the mentioned items.
 * Each change reads a document and writes back whole lists. The engine runs one action at a time per concept instance,
 * so nothing else changes the document in between; that is also what keeps a check to one unfinished attempt.
 */
export class RecallCheckingConcept<User extends string, Item extends string> {
  private readonly checks: Collection<CheckDocument<User, Item>>;
  private readonly attempts: Collection<AttemptDocument<Item>>;
  private indexes: Promise<unknown> | undefined;

  constructor(database: Db, name = "RecallChecking") {
    this.checks = database.collection(`${name.toLowerCase()}.checks`);
    this.attempts = database.collection(`${name.toLowerCase()}.attempts`);
  }

  /** Creates the indexes the queries read by, once. If creating them fails, the next action tries again. */
  #ready() {
    this.indexes ??= Promise.all([
      this.checks.createIndex({ owner: 1 }),
      this.checks.createIndex({ "subject.item": 1 }),
      this.attempts.createIndex({ check: 1 }),
    ]).catch((error: unknown) => {
      this.indexes = undefined;
      throw error;
    });
    return this.indexes;
  }

  // Checks

  async open({ owner, name }: { owner: User; name: string }) {
    const trimmed = acceptedName(name);
    await this.#ready();
    const check = new ObjectId().toHexString() as Check;
    await this.checks.insertOne({ _id: check, owner, name: trimmed, subject: [] });
    return { check };
  }

  async rename({ check, name }: { check: Check; name: string }) {
    await this.#check(check);
    const trimmed = acceptedName(name);
    await this.checks.updateOne({ _id: check }, { $set: { name: trimmed } });
    return { check };
  }

  async include({ check, item, name }: { check: Check; item: Item; name: string }) {
    const found = await this.#check(check);
    if (includes(found.subject, item)) throw new AlreadyIncluded("That item is already in this check.");
    await this.checks.updateOne({ _id: check }, { $set: { subject: [...found.subject, { item, name }] } });
    return { check };
  }

  async exclude({ check, item }: { check: Check; item: Item }) {
    const found = await this.#check(check);
    if (!includes(found.subject, item)) throw new NotIncluded("That item isn't in this check.");
    await this.checks.updateOne({ _id: check }, { $set: { subject: found.subject.filter((entry) => entry.item !== item) } });
    return { check };
  }

  /** Renames the item in every check that includes it. Attempts keep the names they began with. */
  async relabel({ item, name }: { item: Item; name: string }) {
    await this.#ready();
    // `$[entry]` updates each element the array filter matches, in every matching check.
    await this.checks.updateMany(
      { "subject.item": item },
      { $set: { "subject.$[entry].name": name } },
      { arrayFilters: [{ "entry.item": item }] },
    );
    return { item };
  }

  async delete({ check }: { check: Check }) {
    const { deletedCount } = await this.checks.deleteOne({ _id: check });
    if (deletedCount === 0) throw checkNotFound();
    await this.attempts.deleteMany({ check });
    return { check };
  }

  // Attempts

  async attempt({ check }: { check: Check }) {
    const found = await this.#check(check);
    await this.#ready();
    if ((await this.attempts.countDocuments({ check, status: { $in: UNFINISHED } }, { limit: 1 })) > 0) {
      throw new AttemptInProgress("Finish or abandon the current attempt first.");
    }
    const attempt = new ObjectId().toHexString() as Attempt;
    await this.attempts.insertOne({
      _id: attempt, check, status: "OPEN", subject: found.subject, mentioned: [], omitted: [], credit: 0,
    });
    return { attempt };
  }

  async submit({ attempt }: { attempt: Attempt }) {
    const found = await this.#attempt(attempt);
    if (found.status !== "OPEN") throw new NotOpen("This attempt has already been submitted.");
    await this.attempts.updateOne(
      { _id: attempt },
      { $set: { status: "GRADED", omitted: found.subject.map(({ item }) => item), mentioned: [] } },
    );
    return { attempt };
  }

  async mention({ attempt, item }: { attempt: Attempt; item: Item }) {
    const found = await this.#correctable(attempt, item);
    await this.attempts.updateOne(
      { _id: attempt },
      { $set: { omitted: without(found.omitted, item), mentioned: [...without(found.mentioned, item), item] } },
    );
    return { attempt };
  }

  async omit({ attempt, item }: { attempt: Attempt; item: Item }) {
    const found = await this.#correctable(attempt, item);
    await this.attempts.updateOne(
      { _id: attempt },
      { $set: { mentioned: without(found.mentioned, item), omitted: [...without(found.omitted, item), item] } },
    );
    return { attempt };
  }

  async rate({ attempt, rating }: { attempt: Attempt; rating: number }) {
    const found = await this.#attempt(attempt);
    if (found.status !== "GRADED") throw new NotGraded("This attempt can't be corrected now.");
    // `!(… && …)` also refuses NaN, which every comparison is false for.
    if (!(rating >= 0 && rating <= 1)) throw new InvalidRating("A rating must be between 0 and 1.");
    await this.attempts.updateOne({ _id: attempt }, { $set: { rating } });
    return { attempt };
  }

  async close({ attempt }: { attempt: Attempt }) {
    const found = await this.#attempt(attempt);
    if (found.status !== "GRADED") throw new NotGraded("This attempt can't be closed now.");
    let credit: number;
    if (found.rating !== undefined) credit = found.rating;
    else if (found.subject.length === 0) throw new Unrated("Rate an attempt with no items before closing it.");
    else credit = found.mentioned.length / found.subject.length;
    await this.attempts.updateOne({ _id: attempt }, { $set: { status: "CLOSED", credit } });
    return { attempt, check: found.check, credit };
  }

  async abandon({ attempt }: { attempt: Attempt }) {
    const found = await this.#attempt(attempt);
    if (!UNFINISHED.includes(found.status)) throw new Finished("This attempt is already finished.");
    await this.attempts.updateOne({ _id: attempt }, { $set: { status: "ABANDONED" } });
    return { attempt };
  }

  // Queries

  async _checks({ owner }: { owner: User }) {
    const found = await this.checks.find({ owner }).sort({ _id: -1 }).toArray();
    return found.map(({ _id, name }) => ({ check: _id, name }));
  }

  async _get({ check }: { check: Check }) {
    const found = await this.checks.findOne({ _id: check });
    return found === null ? [] : [{ owner: found.owner, name: found.name }];
  }

  async _subject({ check }: { check: Check }) {
    const found = await this.checks.findOne({ _id: check });
    return found?.subject ?? [];
  }

  async _including({ item }: { item: Item }) {
    // On an array of documents, MongoDB matches a check when any element's item equals the value.
    const found = await this.checks.find({ "subject.item": item }).sort({ _id: -1 }).toArray();
    return found.map(({ _id }) => ({ check: _id }));
  }

  async _attempts({ check }: { check: Check }) {
    const found = await this.attempts.find({ check }).sort({ _id: -1 }).toArray();
    return found.map(({ _id, status, credit }) => ({ attempt: _id, status, credit }));
  }

  async _current({ check }: { check: Check }) {
    const found = await this.attempts.findOne({ check, status: { $in: UNFINISHED } });
    return found === null ? [] : [{ attempt: found._id, status: found.status }];
  }

  async _attempt({ attempt }: { attempt: Attempt }) {
    const found = await this.attempts.findOne({ _id: attempt });
    return found === null ? [] : [{ check: found.check, status: found.status, credit: found.credit }];
  }

  async _attemptSubject({ attempt }: { attempt: Attempt }) {
    const found = await this.attempts.findOne({ _id: attempt });
    return found?.subject ?? [];
  }

  async _mentioned({ attempt }: { attempt: Attempt }) {
    const found = await this.attempts.findOne({ _id: attempt });
    return found === null ? [] : inSubjectOrder(found, found.mentioned);
  }

  async _omitted({ attempt }: { attempt: Attempt }) {
    const found = await this.attempts.findOne({ _id: attempt });
    return found === null ? [] : inSubjectOrder(found, found.omitted);
  }

  async _missed({ owner, atLeast }: { owner: User; atLeast: number }) {
    const checks = await this.checks.find({ owner }, { projection: { _id: 1 } }).toArray();
    // One row per omitted item of each closed attempt, then counted per item.
    const found = await this.attempts.aggregate<{ _id: Item; misses: number }>([
      { $match: { check: { $in: checks.map(({ _id }) => _id) }, status: "CLOSED" } },
      { $unwind: "$omitted" },
      { $group: { _id: "$omitted", misses: { $sum: 1 } } },
      { $match: { misses: { $gte: atLeast } } },
      { $sort: { misses: -1, _id: 1 } },
    ]).toArray();
    return found.map(({ _id, misses }) => ({ item: _id, misses }));
  }

  // Lookups that refuse

  async #check(check: Check) {
    const found = await this.checks.findOne({ _id: check });
    if (found === null) throw checkNotFound();
    return found;
  }

  async #attempt(attempt: Attempt) {
    const found = await this.attempts.findOne({ _id: attempt });
    if (found === null) throw new AttemptNotFound("There is no such attempt.");
    return found;
  }

  /** The attempt, if it is GRADED and the item is part of it; mention and omit refuse in the same order. */
  async #correctable(attempt: Attempt, item: Item) {
    const found = await this.#attempt(attempt);
    if (found.status !== "GRADED") throw new NotGraded("This attempt can't be corrected now.");
    if (!includes(found.subject, item)) throw new NotInSubject("That item isn't part of this attempt.");
    return found;
  }
}

/** Returns the trimmed name, or refuses it. */
function acceptedName(name: string): string {
  const trimmed = name.trim();
  if (trimmed.length === 0 || trimmed.length > MAX_NAME) throw new InvalidName("A check name must have 1 to 200 characters.");
  return trimmed;
}

function without<Item>(items: Item[], item: Item): Item[] {
  return items.filter((other) => other !== item);
}

function includes<Item>(subject: Entry<Item>[], item: Item): boolean {
  return subject.some((entry) => entry.item === item);
}

function inSubjectOrder<Item>(attempt: AttemptDocument<Item>, items: Item[]) {
  return attempt.subject.filter(({ item }) => items.includes(item));
}

const checkNotFound = () => new CheckNotFound("There is no such check.");
