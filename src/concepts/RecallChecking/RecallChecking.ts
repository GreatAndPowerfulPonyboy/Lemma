import type { Collection, Db } from "mongodb";

export class InvalidName extends Error {}
export class CheckNotFound extends Error {}
export class NotOpen extends Error {}
export class AlreadyIncluded extends Error {}
export class EmptyCheck extends Error {}
export class NotGraded extends Error {}
export class NotOmitted extends Error {}
export class NotMentioned extends Error {}
export class InvalidCredit extends Error {}
export class AlreadyClosed extends Error {}

export type Check = string & { readonly __brand: "Check" };
export type CheckStatus = "OPEN" | "GRADED" | "CLOSED";

const MAX_NAME = 80;

interface CheckDocument<User, Item> {
  _id: Check;
  owner: User;
  name: string;
  status: CheckStatus;
  /** In the order the items were included; the other lists are read back in this order. */
  subject: Item[];
  mentioned: Item[];
  omitted: Item[];
  credit: number;
}

/**
 * Finds out which of the items someone meant to cover they left out of an account given from memory.
 * The account itself never reaches this concept: whoever reads it marks the mentioned items before the check closes.
 * Each change reads the check and writes back whole lists; the engine runs one action at a time per concept instance,
 * so no other action can change the check in between.
 */
export class RecallCheckingConcept<User extends string, Item extends string> {
  private readonly checks: Collection<CheckDocument<User, Item>>;

  constructor(database: Db, name = "RecallChecking") {
    this.checks = database.collection(`${name.toLowerCase()}.checks`);
  }

  async open({ owner, name }: { owner: User; name: string }) {
    const trimmed = name.trim();
    if (trimmed.length === 0 || trimmed.length > MAX_NAME) {
      throw new InvalidName("A check name must have 1 to 80 characters.");
    }
    const check = crypto.randomUUID() as Check;
    await this.checks.insertOne({
      _id: check, owner, name: trimmed, status: "OPEN", subject: [], mentioned: [], omitted: [], credit: 0,
    });
    return { check };
  }

  async include({ check, item }: { check: Check; item: Item }) {
    const found = await this.#find(check);
    if (found.status !== "OPEN") throw new NotOpen("This check has already been submitted.");
    if (found.subject.includes(item)) throw new AlreadyIncluded("That item is already in this check.");
    await this.checks.updateOne({ _id: check }, { $set: { subject: [...found.subject, item] } });
    return { check };
  }

  async submit({ check }: { check: Check }) {
    const found = await this.#find(check);
    if (found.status !== "OPEN") throw new NotOpen("This check has already been submitted.");
    if (found.subject.length === 0) throw new EmptyCheck("Choose at least one item before submitting.");
    await this.checks.updateOne({ _id: check }, { $set: { status: "GRADED", omitted: found.subject, mentioned: [] } });
    return { check };
  }

  async markMentioned({ check, item }: { check: Check; item: Item }) {
    const found = await this.#graded(check, "This check can't be corrected now.");
    if (!found.omitted.includes(item)) throw new NotOmitted("That item isn't marked as omitted.");
    await this.checks.updateOne(
      { _id: check },
      { $set: { omitted: found.omitted.filter((other) => other !== item), mentioned: [...found.mentioned, item] } },
    );
    return { check };
  }

  async markOmitted({ check, item }: { check: Check; item: Item }) {
    const found = await this.#graded(check, "This check can't be corrected now.");
    if (!found.mentioned.includes(item)) throw new NotMentioned("That item isn't marked as mentioned.");
    await this.checks.updateOne(
      { _id: check },
      { $set: { mentioned: found.mentioned.filter((other) => other !== item), omitted: [...found.omitted, item] } },
    );
    return { check };
  }

  async rate({ check, credit }: { check: Check; credit: number }) {
    await this.#graded(check, "This check can't be corrected now.");
    if (!(credit >= 0 && credit <= 1)) throw new InvalidCredit("A rating must be between 0 and 1.");
    await this.checks.updateOne({ _id: check }, { $set: { credit } });
    return { check };
  }

  async close({ check }: { check: Check }) {
    await this.#graded(check, "This check can't be closed now.");
    await this.checks.updateOne({ _id: check }, { $set: { status: "CLOSED" } });
    return { check };
  }

  async abandon({ check }: { check: Check }) {
    const found = await this.#find(check);
    if (found.status === "CLOSED") throw new AlreadyClosed("This check is already closed.");
    await this.checks.deleteOne({ _id: check });
    return { check };
  }

  async _get({ check }: { check: Check }) {
    const found = await this.checks.findOne({ _id: check });
    return found === null
      ? []
      : [{ owner: found.owner, name: found.name, status: found.status, credit: found.credit }];
  }

  async _subject({ check }: { check: Check }) {
    const found = await this.checks.findOne({ _id: check });
    return (found?.subject ?? []).map((item) => ({ item }));
  }

  async _mentioned({ check }: { check: Check }) {
    const found = await this.checks.findOne({ _id: check });
    if (found === null || found.status === "OPEN") return [];
    return found.subject.filter((item) => found.mentioned.includes(item)).map((item) => ({ item }));
  }

  async _omitted({ check }: { check: Check }) {
    const found = await this.checks.findOne({ _id: check });
    if (found === null || found.status === "OPEN") return [];
    return found.subject.filter((item) => found.omitted.includes(item)).map((item) => ({ item }));
  }

  async #find(check: Check) {
    const found = await this.checks.findOne({ _id: check });
    if (found === null) throw new CheckNotFound("There is no such check.");
    return found;
  }

  async #graded(check: Check, sentence: string) {
    const found = await this.#find(check);
    if (found.status !== "GRADED") throw new NotGraded(sentence);
    return found;
  }
}
