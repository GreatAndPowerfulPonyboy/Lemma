import { type Collection, type Db, MongoServerError } from "mongodb";

export class InvalidAnswer extends Error {}
export class AlreadyAnswered extends Error {}
export class NoAnswer extends Error {}

const MAX_ANSWER = 5000;

interface AnswerDocument<Item> {
  _id: Item;
  answer: string;
}

/** Keeps an answer for an item, written once a person has found they need one, so later attempts can be checked against it. */
export class FlashcardingConcept<Item extends string> {
  private readonly answers: Collection<AnswerDocument<Item>>;

  constructor(database: Db, name = "Flashcarding") {
    this.answers = database.collection(`${name.toLowerCase()}.answers`);
  }

  async write({ item, answer }: { item: Item; answer: string }) {
    if (!fits(answer)) throw invalidAnswer();
    try {
      // The item is the document's _id, so MongoDB refuses a second answer for it, even when two requests arrive at once.
      await this.answers.insertOne({ _id: item, answer });
    } catch (error) {
      if (isDuplicate(error)) throw new AlreadyAnswered("That item already has an answer.");
      throw error;
    }
    return { item };
  }

  async revise({ item, answer }: { item: Item; answer: string }) {
    // The spec refuses an item without an answer before it looks at the new answer.
    if (!fits(answer)) {
      if ((await this.answers.countDocuments({ _id: item }, { limit: 1 })) === 0) throw noAnswer();
      throw invalidAnswer();
    }
    const { matchedCount } = await this.answers.updateOne({ _id: item }, { $set: { answer } });
    if (matchedCount === 0) throw noAnswer();
    return { item };
  }

  async remove({ item }: { item: Item }) {
    const { deletedCount } = await this.answers.deleteOne({ _id: item });
    if (deletedCount === 0) throw noAnswer();
    return { item };
  }

  async _answer({ item }: { item: Item }) {
    const found = await this.answers.findOne({ _id: item });
    return found === null ? [] : [{ answer: found.answer }];
  }
}

/** An answer is accepted when it has some text other than spaces, and no more than 5000 characters. */
function fits(answer: string): boolean {
  return answer.trim().length > 0 && answer.length <= MAX_ANSWER;
}

const invalidAnswer = () => new InvalidAnswer("An answer must have 1 to 5000 characters.");
const noAnswer = () => new NoAnswer("That item has no answer.");

/** 11000 is the code MongoDB gives a write that breaks a unique index. */
const isDuplicate = (error: unknown) => error instanceof MongoServerError && error.code === 11000;
