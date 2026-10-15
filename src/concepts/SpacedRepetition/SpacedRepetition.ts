import type { Collection, Db } from "mongodb";

export class AlreadyEnrolled extends Error {}
export class NotEnrolled extends Error {}
export class InvalidCredit extends Error {}

const DAY_MS = 24 * 60 * 60 * 1000;

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

  constructor(
    database: Db,
    name = "SpacedRepetition",
    private readonly clock: () => Date = () => new Date(),
  ) {
    this.entries = database.collection(`${name.toLowerCase()}.entries`);
  }

  async enroll({ item }: { item: Item }) {
    if ((await this.entries.countDocuments({ _id: item }, { limit: 1 })) > 0) {
      throw new AlreadyEnrolled("That item is already scheduled.");
    }
    await this.entries.insertOne({ _id: item, due: this.clock(), interval: 1, lapses: 0 });
    return { item };
  }

  async advance({ item, credit }: { item: Item; credit: number }) {
    const entry = await this.#entry(item);
    if (!(credit >= 0 && credit <= 1)) throw new InvalidCredit("Credit must be between 0 and 1.");
    const growth = Math.max(1.3, 2.5 - 0.2 * entry.lapses);
    const interval = Math.max(1, entry.interval * (1 + credit * (growth - 1)));
    const due = new Date(this.clock().getTime() + interval * DAY_MS);
    await this.entries.updateOne({ _id: item }, { $set: { interval, due } });
    return { item, due };
  }

  async lapse({ item }: { item: Item }) {
    const entry = await this.#entry(item);
    const now = this.clock();
    const due = new Date(now.getTime() + DAY_MS);
    await this.entries.updateOne({ _id: item }, { $set: { interval: 1, lapses: entry.lapses + 1, lastLapse: now, due } });
    return { item, due };
  }

  async drop({ item }: { item: Item }) {
    const { deletedCount } = await this.entries.deleteOne({ _id: item });
    if (deletedCount === 0) throw new NotEnrolled("That item isn't scheduled.");
    return { item };
  }

  async _due({ before }: { before: Date }) {
    const found = await this.entries.find({ due: { $lte: new Date(before) } } as never).sort({ due: 1 }).toArray();
    return found.map(({ _id, due }) => ({ item: _id, due }));
  }

  async _entry({ item }: { item: Item }) {
    const found = await this.entries.findOne({ _id: item });
    return found === null ? [] : [{ due: found.due, interval: found.interval, lapses: found.lapses }];
  }

  async _lapsed({ atLeast }: { atLeast: number }) {
    const found = await this.entries
      .find({ lapses: { $gte: atLeast } } as never)
      .sort({ lapses: -1, lastLapse: -1 })
      .toArray();
    return found.map(({ _id, lapses, lastLapse }) => ({ item: _id, lapses, lastLapse: lastLapse as Date }));
  }

  async #entry(item: Item) {
    const found = await this.entries.findOne({ _id: item });
    if (found === null) throw new NotEnrolled("That item isn't scheduled.");
    return found;
  }
}
