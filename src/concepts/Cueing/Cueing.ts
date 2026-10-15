import { type Collection, type Db, ObjectId } from "mongodb";

export class InvalidName extends Error {}
export class CueNotFound extends Error {}

const MAX_NAME = 100;

/**
 * A cue's identity. It is the hex string of a MongoDB ObjectId, which begins with the time it was made,
 * so sorting cues by identity sorts them by creation: that is the order the spec's `seq of Cues` keeps.
 */
export type Cue = string & { readonly __brand: "Cue" };

interface CueDocument<User> {
  _id: Cue;
  owner: User;
  name: string;
}

/** Lets a person name something they mean to produce from memory later, at the cost of naming it. */
export class CueingConcept<User extends string> {
  private readonly cues: Collection<CueDocument<User>>;

  constructor(database: Db, name = "Cueing") {
    this.cues = database.collection(`${name.toLowerCase()}.cues`);
  }

  async create({ owner, name }: { owner: User; name: string }) {
    const trimmed = accepted(name);
    const cue = new ObjectId().toHexString() as Cue;
    await this.cues.insertOne({ _id: cue, owner, name: trimmed });
    return { cue };
  }

  async rename({ cue, name }: { cue: Cue; name: string }) {
    // The spec refuses an unknown cue before it looks at the name, so check existence first when the name is bad.
    const trimmed = name.trim();
    if (!fits(trimmed)) {
      if ((await this.cues.countDocuments({ _id: cue }, { limit: 1 })) === 0) throw notFound();
      throw invalidName();
    }
    const { matchedCount } = await this.cues.updateOne({ _id: cue }, { $set: { name: trimmed } });
    if (matchedCount === 0) throw notFound();
    return { cue };
  }

  async delete({ cue }: { cue: Cue }) {
    const { deletedCount } = await this.cues.deleteOne({ _id: cue });
    if (deletedCount === 0) throw notFound();
    return { cue };
  }

  async _cues({ owner }: { owner: User }) {
    const found = await this.cues.find({ owner }).sort({ _id: -1 }).toArray();
    return found.map(({ _id, name }) => ({ cue: _id, name }));
  }

  async _search({ owner, text }: { owner: User; text: string }) {
    const words = text.trim();
    const filter = words === "" ? { owner } : { owner, name: { $regex: escapeRegExp(words), $options: "i" } };
    const found = await this.cues.find(filter).sort({ _id: -1 }).toArray();
    return found.map(({ _id, name }) => ({ cue: _id, name }));
  }

  async _get({ cue }: { cue: Cue }) {
    const found = await this.cues.findOne({ _id: cue });
    return found === null ? [] : [{ owner: found.owner, name: found.name }];
  }
}

function fits(trimmed: string): boolean {
  return trimmed.length > 0 && trimmed.length <= MAX_NAME;
}

/** Returns the trimmed name, or refuses it. */
function accepted(name: string): string {
  const trimmed = name.trim();
  if (!fits(trimmed)) throw invalidName();
  return trimmed;
}

const invalidName = () => new InvalidName("A name must have 1 to 100 characters.");
const notFound = () => new CueNotFound("Cue does not exist.");

/** Makes searched text match literally, so a name like "f(x) = x^2" can be found by typing it. */
function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
