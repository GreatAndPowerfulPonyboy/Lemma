import {type Collection, type Db, ObjectId} from "mongodb";
export class InvalidCue extends Error {};
export class CueNotFound  extends Error {};

export type Cue = string & {readonly __brand: "Cue"}
function isValidName(name: string) : boolean {
  return (name.length <=  100 && name.length >= 1);
}

interface CueDocument<User>
{
  _id: Cue,
  owner: User,
  name: string
}

export class CueingConcept<User extends string>
{
  private readonly cues: Collection<CueDocument<User>>;
  private indexes: Promise<unknown> | undefined;

  public constructor(database: Db, name = "Cues") {
    this.cues = database.collection(`${name.toLowerCase()}.cues`);
    
  }

  #ready() {
    this.indexes ??= this.cues
          .createIndex({owner: 1, name: 1})
          .catch((error: unknown) => {
            this.indexes = undefined;
            throw error;
          })
          return this.indexes;
  }
  async create({owner, name}: {owner: User, name: string}) {
    const trimmed = name.trim();
    if (!(isValidName(trimmed))) {
      throw new InvalidCue("A name must have 1 to 100 characters."); 
    }
    await this.#ready();
    const cue = new ObjectId().toHexString() as Cue;
    await this.cues.insertOne({_id: cue, owner: owner,name: trimmed});
    return {cue};     
    }
  

  async rename({cue, name}: {cue: Cue, name: string}) {
    const existingCue = await this.cues.findOne({_id: cue});
    if (existingCue === null) throw new CueNotFound("Cue does not exist.");
    const trimmed = name.trim();
    if(!(isValidName(trimmed))) throw new InvalidCue("A cue's name must be between 1 and 100 characters.");
    await this.cues.updateOne({_id: existingCue._id},
                              {$set:{name: trimmed}});
    return {cue};
  }
  
  async delete({cue}: {cue: Cue})
  {
    await this.#ready();
    const existingCue = await this.cues.findOne({_id: cue});
    if (existingCue === null) throw new CueNotFound("Cue does not exist.");
    await this.cues.deleteOne({_id: cue});
    return {cue};
  }

  async _cues({owner}: {owner: User}) {
    const found = await this.cues.find({owner}).sort({_id : -1}).toArray();
    return found.map(({_id, name}) => ({cue: _id, name}));
  }

  async _get({cue}: {cue : Cue}) {
    const found = await this.cues.findOne({_id: cue});
    return found === null ? [] : [{owner: found.owner, name: found.name}];
  }
  

  async _search({owner, text}: {owner: User, text: string}) {
    const trimmed = text.trim();
    const filter = (trimmed === "" ? {owner} : {owner, name : {$regex: escapeRegExp(trimmed), $options: "i"}});
    const found = await this.cues.find(filter).sort({_id: -1}).toArray();
    return found.map(({_id, name}) => ({cue: _id, name}));
  }
  
}
  
                        
    
function escapeRegExp(text: string) : string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  } 
