import type { Collection, Db } from "mongodb";

export class AlreadyEnrolled extends Error {}
export class NotEnrolled extends Error {}
export class InvalidCredit extends Error {}

const DAY_MS = 24 * 60 * 60 * 1000;
/** A review with less credit than this is a lapse. */
const PASSING = 0.5;

interface EntryDocument<Item> {
  _id: Item;
  due: Date;
  /** Days. Never less than 1. */
  interval: number;
  lapses: number;
  lastLapse?: Date;
}

/**
 * Brings each item back for retrieval at increasing intervals, sooner when it has just been lost.
 * The item is each entry's `_id`, so an item has at most one entry. The clock is injected so tests can fix the time.
 */
export class SpacedRepetitionConcept<Item extends string> {
  private readonly entries: Collection<EntryDocument<Item>>;
  private indexes: Promise<unknown> | undefined;

  constructor(
    database: Db,
    name = "SpacedRepetition",
    private readonly clock: () => Date = () => new Date(),
  ) {
    this.entries = database.collection(`${name.toLowerCase()}.entries`);
  }

  /** Creates the indexes `_due` and `_lapsed` read by, once. If creating them fails, the next action tries again. */
  #ready() {
    this.indexes ??= Promise.all([
      this.entries.createIndex({ due: 1 }),
      this.entries.createIndex({ lapses: -1, lastLapse: -1 }),
    ]).catch((error: unknown) => {
      this.indexes = undefined;
      throw error;
    });
    return this.indexes;
  }

  async enroll({ item }: { item: Item }) {
    await this.#ready();
    if ((await this.entries.countDocuments({ _id: item }, { limit: 1 })) > 0) {
      throw new AlreadyEnrolled("That item is already scheduled.");
    }
    await this.entries.insertOne({ _id: item, due: this.clock(), interval: 1, lapses: 0 });
    return { item };
  }

  async review({ item, credit }: { item: Item; credit: number }) {
    const entry = await this.entries.findOne({ _id: item });
    if (entry === null) throw new NotEnrolled("That item isn't scheduled.");
    // `!(… && …)` also refuses NaN, which every comparison is false for.
    if (!(credit >= 0 && credit <= 1)) throw new InvalidCredit("Credit must be between 0 and 1.");
    const now = this.clock();

    if (credit < PASSING) {
      const due = new Date(now.getTime() + DAY_MS);
      await this.entries.updateOne(
        { _id: item },
        { $set: { interval: 1, lapses: entry.lapses + 1, lastLapse: now, due } },
      );
      return { item, due };
    }

    const growth = Math.max(1.3, 2.5 - 0.2 * entry.lapses);
    const interval = Math.max(1, entry.interval * (1 + credit * (growth - 1)));
    const due = new Date(now.getTime() + interval * DAY_MS);
    await this.entries.updateOne({ _id: item }, { $set: { interval, due } });
    return { item, due };
  }

  async drop({ item }: { item: Item }) {
    const { deletedCount } = await this.entries.deleteOne({ _id: item });
    if (deletedCount === 0) throw new NotEnrolled("That item isn't scheduled.");
    return { item };
  }

  async _due({ before }: { before: Date }) {
    const found = await this.entries.find({ due: { $lte: new Date(before) } }).sort({ due: 1 }).toArray();
    return found.map(({ _id, due }) => ({ item: _id, due }));
  }

  async _entry({ item }: { item: Item }) {
    const found = await this.entries.findOne({ _id: item });
    return found === null ? [] : [{ due: found.due, interval: found.interval, lapses: found.lapses }];
  }

  async _lapsed({ atLeast }: { atLeast: number }) {
    const found = await this.entries
      .find({ lapses: { $gte: atLeast } })
      .sort({ lapses: -1, lastLapse: -1 })
      .toArray();
    // Every entry with at least one lapse has a lastLapse, and atLeast is meant to be 1 or more.
    return found.map(({ _id, lapses, lastLapse }) => ({ item: _id, lapses, lastLapse: lastLapse as Date }));
  }
}
