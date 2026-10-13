## Problem Statement

### Domain

My problem domain of choice is self-regulated learning, where users create their own practice materials or grab good materials from others and generate a schedule for repetition in hopes of solidifying their understanding.

Some users are trying to memorize the meaning behind jargon related to their field of interest because it's a road block on their path of understanding. While they are learning new material, they find words or symbols that they don't understand and Google their definitions. They determine whether it's important enough to remember, and place the worthy information into some structure that makes it easy to pick a chunk of words to memorize at a time.

Other users are attempting to solidify their understanding of the concept by constructing a set of prompts and responses. Their prompts are more related to the why and how of a topic instead of just the what. These prompts may include how one concept connects to another, why a certain tool is used in a specific situation, and common justifications for a decision within their field of study. In my opinion, what this user is attempting to build for themselves are a series of prompts and responses akin to a self-made oral evaluation for a given topic. The organization of prompts for this user can involve greater interconnectedness of topics as they attempt to have their prompts and responses represent their mental model of how different concepts connect.


### Bad Situations

#### Making flashcards is annoying/boring

A student is studying for a subject and finding a lot of words that they don't know. For every important word that they encounter, they have to make a card for the word and place it into their organizational system. The process of making a card is boring, and doing so for as many times as they need is tedious. This pain is felt with every card and with every review session, so it can lead the user to not make important cards, and to just trust that they'll remember when the time comes, which can lead to forgetting important information.

#### Made too many flashcards / skipped too many reviews

A user built up a large amount of flashcards over some period of time, but got busy and didn't have the time to engage in review for a week or two. As a result, they've built up a large backlog of flashcards and the task of reviewing seems daunting. This creates anxiety around reviewing that exacerbates the problem, leading to the user feeling more stressed than if they had not been consistently making cards.

### Confident review, poor transfer in a technical subject
Confident review, poor transfer in a technical subject

A student is using Anki to study proof-based mathematics. They understand that they need to be able to reproduce the proofs from class, so they make cards prompting them to rederive each proof, and they add a hint ladder to help when they can't get to the next step. By exam week they are answering nearly all of them correctly and are confident they understand the material.

On the exam they meet variants they haven't seen and cannot handle them. The grade is worse than expected, and the discouragement is sharper than it would have been without the practice, because their expectations had been raised by the volume of it.

What makes this bad is not the grade but that the failure was undetectable in advance. Every signal they had was a cued signal: each card arrived with its own prompt, and the hint ladder cued them further whenever they stalled. Nothing in their study loop could distinguish "I understand this proof" from "I can follow this proof when its first line is in front of me." A learner who could not reconstruct a single proof unprompted would have received exactly the same encouraging statistics.

### Corroboration

#### Boredom of flashcard review

- [Study in which a majority of the medical students researched used pre-made flash cards](https://pmc.ncbi.nlm.nih.gov/articles/PMC12662189/#sec3)
- [Larger study showcasing that over half of the studied students utilize pre-made flash cards in order to save time, but they recognize that the information isn't always trustworthy](https://sc-pan.github.io/pdf/ZIP_2022.pdf)
- [HackerNews article on the boredom of flash card review](https://news.ycombinator.com/item?id=24879467)
- [Post on r/anki asking for tips on how to make studying flashcards less boring](https://www.reddit.com/r/Anki/comments/1n5isk1/studying_flashcards_are_so_boring_not_a_rant_post/)
- [Post on r/languagelearning asking for advice on a more creative way to learn vocabulary](https://www.reddit.com/r/languagelearning/comments/1m18qa0/i_hate_flashcards/)

#### Skipped too many reviews

- [Study of Jordanian medical students that concluded that potential for burnout using Anki could result in a triage approach to review and/or a skipping of review sessions](https://pmc.ncbi.nlm.nih.gov/articles/PMC13126877/)
- [Different study on medical students using Anki that didn't demonstrate burnout potential](https://journals.sagepub.com/doi/10.1177/23821205231173289)
- [Reddit post containing advice on what to do when you've made too much of a backlog](https://www.reddit.com/r/Anki/comments/oh2tb3/too_many_anki_reviews_how_to_clear_an/)
- [Post on Anki forums describing how to make a filtered deck to tackle too many reviews](https://forums.ankiweb.net/t/too-many-cards-to-review-whats-the-best-way-to-tackle-this/23419/2)
- [Another post on the Anki forums with slightly different advice](https://forums.ankiweb.net/t/adressing-backlog/43842/2)
- [HackerNews post about an Anki backlog](https://news.ycombinator.com/item?id=22386479)

#### Didn't improve grades

- [Post on r/Anki reporting no improvement in grades despite consistent review](https://www.reddit.com/r/Anki/comments/1iw1yd8/anki_did_not_improve_my_grades_at_all/)
- [Post on r/medicalschoolanki asking why the poster isn't seeing results from Anki](https://www.reddit.com/r/medicalschoolanki/comments/oewzo0/why_im_not_seeing_results_from_using_anki_getting/)

### Workarounds and Comparables

#### Workarounds for avoiding card creation

Users often use a pre-made deck of prompts and responses in order to avoid the tedium of typing them up on their own. However, studies have shown that the process of creating the card itself confers learning benefits, so these users are missing out on their real goal in order to reduce some friction.

Other services such as Remnote allow for the easy AI-generation of flashcards, which also deprives of learning opportunities while introducing unique quality control concerns.

#### Workarounds for queue buildup

To handle queue buildup, users generate custom study schedules to filter out cards that they don't want to deal with. Not only does this require a certain level of fluency with the tool in particular, it also allows users to cheat by removing important, but difficult to remember, topics from their schedule. Users that aren't knowledgeable about how to create a custom schedule may instead delete prompts entirely, which leads them back into the first bad situation of having to make them again.

#### Workarounds for bad scoring / lack of transfer

A particularly demoralized learner may give up on the topic entirely if the effort they put into generating their own learning schedule didn't confer any benefits. A learner may also go back to paper-and-pencil tools, giving up on the ability for software to keep track of which topics were missed in a previous study session.

#### Comparables

Anki is the leader in spaced-repetition scheduling, but its default settings are punishing for missed reviews and its more powerful features are hard to learn. However, it provides lots of flexibility in the style of prompt and response, which can give motivated users powerful tools to stave boredom. Remnote and Obsidian provide a way to embed flashcards within one's notes, which simplifies the workflow and keeps learners engaged by always having the context of what they wanted to remember nearby.


### Application Pitch

To maximize understanding, learners need to move away from relying on cued recall. Lemma is a spaced-repetition app whose primary unit of review is a topic you explain from memory.

### Features

**Free Recall Coverage Checking**:  A learner clicks into some topic and can highlight a subsection of cards. After highlighting their cards, they will be asked to state a name for their Explanation Session.  After submitting their declaration, everything will fade away and the learner will not be able to reference their notes until they stop the explanation session. Afer the explanation session, the system will do a pretty crude keyword check on their transcript and give a prompt on whether to update the learning schedules for topics the user did/didn't cover.
By default, topics that the learner didn't cover will be placed earlier on the review schedule, but topics that the learner did cover will receive a further prompt by which the learner can self-grade their explanation and update their placement on the review schedule accordingly.

**stakeholder impact** Comprehension learners get to make the self-administered oral exam they were trying to create with other resources, and learners of technical subjects can create units of work that matter with less friction.

**Lazy Card Generation**: In Lemma, what would typically always be a flashcard in a differnet app instead just starts as a Point to guide an oral explanation. A point just has a name, like 'loop invariant of mergesort' that is missed across several recall sessions enters a promotion queue, after which a user can convert it into a typical flashcard.

**stakeholder impact** Both Jargon and Comprehension learners get to spend less time typing up answers to things they already remember. 

**Work Units**: Lemma's review queue shows units of work via user-defined boundaries. Instead of being put on a queue as 15 separate cards, you just see *Explain Krebs Cycle*, and a queue incremented by 1. These units can expand if you want to see them indiidiually, and their constituent points/flashcards can be individually practiced in this expanded view, but the default is bundled.
A learner coming back after three weeks will see a handful of topics to explain, not hundreds of cards, even if the real work hasn't changed.

**Stakeholder impact** Both jargon and comprehension learners have a smoother transition into coming back to review after a couple weeks' or longer break. 
 

### Concept Design

### Concept Specifications

```
concept UserAuthenticating[User]
  purpose let someone return to work they created earlier and be treated as the same person who created it;
    prevent anyone else from reading or changing it
  principle
    a person registers with a username and a password;
    later they return and supply that same username and password,
    and are recognized as the same person, with everything they made still theirs;
    someone who supplies a different password is not recognized and sees none of it.
  state
    a set of Users with
      a unique username String
      a password String
  actions
    register (username: String, password: String) : return (user: User)
      where username and password are well formed and username is not already in use
      then
        create a new user with the given username and password
        return user
      where username or password is not well formed
      then
        refuse INVALID_CREDENTIALS "The username or password is not well formed."
      where username and password are well formed and username is already in use
      then
        refuse USERNAME_TAKEN "The username is already in use."
    authenticate (username: String, password: String) : return (user: User)
      where some user has the given username and password
      then return that user
      where no user has the given username and password
      then refuse BAD_CREDENTIALS "No account matches that username and password."
    changePassword (user: User, newPassword: String)
      where user exists and newPassword is well formed
      then set password of user to newPassword
```
```
concept Prompting [User]

purpose
  record something a user wants to be able to produce from memory, and hold an expected answer for it once it has proved hard to produce; prevent the cost of writing out an answer from being paid before there is any evidence it is needed.

principle
  A user names a topic they want to be able to produce from memory, and notes it as a point.
  They can review that point in the future by confirming their answer from memory.
  In the future, if they find that they keep forgetting a crucial detail, they can promote it to a prompt with a question and answer.
  From then on, they can be asked the question tied to the note directly, and compare it to their answer.

state
a set of Points with
  an owner User
  a topic String
  an optional question String
  an optional answer String

actions
  note (owner: User, topic: String) : return (point: Point)
    then
    create a new Point owned by owner with this topic and no question or answer
    return point

  promote (point: Point, question: String, answer: String)
    where point exists and point has no question
    then set point's question and answer to question and answer

  revise (point: Point, question: String, answer: String)
    where point exists and has a question
    then set point's question and answer to question and answer

  rename (point: Point, topic: String)
    where point exists
    then set point's topic to topic

  confirm (point: Point) : return(point: Point)
    where point exists and has an answer
    then return the point

  miss (point: Point) : return (point: Point)
    where point exists and has an answer
    then return the point

  discard (point: Point)
    where point is in the set of points
    then remove point

Queries
  _question (point: Point) : optional (question: String)
  Returns the question written for the point, or no row if it has not been promoted.

  _answer (point: Point) : optional (answer: String)
  Returns the expected answer, or no row if the point has not been promoted.

  _unpromoted (owner: User) : many (point: Point)
  Returns a point for each of the owner's points that has no question yet.
  The order of the rows is unspecified.
````
Concept RecallChecking [User, Item]

purpose
  find out which of the things a learner meant to cover they failed to say from memory; prevent a learner confusing recognition for recall

principle
  A learner commits to the set of items they intend to cover and names the overarching topic. The items are removed from their view and they give an account from memory.
  After submitting that account, the items that they failed to mention are shown to them as omissions. They can look over the prospective omissions and correct mistakes of the system.
  After checking over, they can close their recall session and what remains omitted is what they could not produce from memory.

state
a set of Checks with
  a name String
  a subject set of Item
  a status one of OPEN, GRADED, CLOSED
  a mentioned set of Items
  an omitted set of Items

actions
  commit (name: String, items: set Item) : return (check: Check)
  where items is not empty
  then
    create a new Check with this name and subject items, status OPEN,
      and empty mentioned and omitted
    return check

  submit (check: Check, account: String)
  where check's status is OPEN
  then
    partition check's subject into mentioned and omitted
      according to which items the account covers
    set check's status to GRADED

  markMentioned (check: Check, item: Item)
  where check's status is GRADED and item is in check's omitted
  then move item from omitted to mentioned

  markOmitted (check: Check, item: Item)
  where check's status is GRADED and item is in check's mentioned
  then move item from mentioned to omitted

  close (check: Check)
  where check's status is GRADED
  then set check's status to CLOSED

  abandon (check: Check)
  where check's status is OPEN
  then delete check

Queries
  _omitted (check: Check) : many (item: Item)
  Returns an item for each item in the check's omitted set, or no rows if there are none.
  The order of the rows is unspecified.

  _mentioned (check: Check) : many (item: Item)
  Returns an item for each item in the check's mentioned set, or no rows if there are none.
  The order of the rows is unspecified.
  
concept SpacedRepetition [Item]

purpose
  Bring an item back for retrieval when it is about to be forgotten, and keep track of how often it has been forgotten; prevent effort being spent on what is already known and prevent what is not remembered from being forgotten unnoticably

principle
  An item is enrolled into an entry, and will become due at some date. When it is due, the user will be shown the item again and if they retrieve it successfully, will come back after a longer gap than before. If they fail to retrieve it, the count of failed retrievals will increment and it will be scheduled to rearrive earlier.

state
  a set of Entries with
    an item Item
    a due Date
    an interval Duration
    a lapses Number

actions
  enroll (item: Item, at: Date) : return (entry: Entry)
  where no Entry has this item
  then
    create a new Entry for item with a starting interval and ease, zero lapses, due at at
    return entry
  where an Entry already has this item
  then refuse ALREADY_ENROLLED "That item is already scheduled."

  advance (entry: Entry, credit: Number, at: Date)
  where some Entry has this item and credit is between 0 and 1
  then
    lengthen entry's interval in proportion to credit, with growth slowing as lapses increase 
    set entry's due to at plus the new interval

  lapse (entry: Entry, at: Date)
  where entry exists
  then
    reduce entry's interval to its minimum and add one to its lapses
    set entry's due to at plus the new interval

  due (before: Date) : return (entries: set Entry)
  then return the Entries whose due is at or before before

  drop (entry: Entry)
  where entry exists
  then delete entry

Queries

  _due (date: Date) : many (item: Item)
  Returns an item for each Entry whose due is at or before the given date,
  or no rows if none are due. Rows are ordered by due date, earliest first.

  _lapseCount (item: Item) : one (count: Number)
  Returns the number of times the item has lapsed, and zero for an item
  that is not enrolled.

Tagging [User, Item]

purpose
  Let a user group items under specified names so they can find related items all at once;prevent a growing collection from becoming an unparseable pile that's difficult to search through

principle
  A user creates a tag with a meaningful name, and attaches it to several items. Later they ask for that tag and get back exactly the items grouped under it. They can detach tags from items, after which
  they will no longer be able to see that item grouped under the tag.
state
  a set of Tags with
    an owner User
    a name String
    a set of Items

actions
  create (owner: User, name: String) : return (tag: Tag)
  where owner has no Tag with this name
  then
    create a new Tag owned by owner with this name and no items
    return tag
  where owner already has a Tag with this name
  then
    refuse TAG_EXISTS "You already have a tag with that name."

  affix (tag: Tag, item: Item)
  where tag exists
  then add item to tag's items

  detach (tag: Tag, item: Item)
  where tag exists and item is in tag's items
  then remove item from tag's items

  lookup (owner: User, name: String) : return (tag: Tag)
  where tag exists and  owner has a Tag with this name
  then return that Tag

  rename (tag: Tag, name: String)
  where tag exists and tag's owner has no other Tag with this name
  then set tag's name to name

  delete (tag: Tag)
  where tag exists
  then delete tag

Queries
  _lookup (owner: User, name: String) : optional (tag: Tag)
  Returns the owner's tag with the given name, or no row if they have none.

  _items (tag: Tag) : many (item: Item)
  Returns an item for each item affixed to the tag, or no rows if it is empty.
  The order of the rows is unspecified.

  _tagsOf (item: Item) : many (tag: Tag)
  Returns a tag for each tag the item is affixed to, or no rows if it has none.
  The order of the rows is unspecified.
  
```
### Reactions

```
reaction Authenticate
Note: This is a model for any user-requested action interacting with concepts that take an owner
  when Requesuting.notePoint (topic)
  UserAuthenticating.authenticate () : (user)
  then Prompting.note (owner: user, topic)

reaction schedulePoint
  when Prompting.note (): (point)
  then SpacedRepetition.enroll (item: point)

reaction checkFromTag
  when
    Requesting.startRecallCheck (tag, name)
    UserAuthenticating.authenticate (): (user)
  then RecallChecking.commit (name, items: Tagging._items (tag))

reaction lapseOmission
  when RecallChecking.reportOmission (item)
  then SpacedRepetition.lapse (item)

reaction advanceOnConfirm
  when Prompting.confirm (point)
  then SpacedRepetition.advance (item: point, credit: 1)

reaction lapseOnMiss
  when Prompting.miss (point)
  then SpacedRepetition.lapse (item: point)
  
  
```

### How they tie together

UserAuthenticating establishes the identity that owns everything else, and thet identity is synchronized via reactions. This ensures that the actions of other users can't affect a learner's scheduling.
Prompting holds the thigns a learner wants to be able to produce at a level of detail they believe it has earned. It can either be a abrae name, or a flashcard with a question and an answer.
Tagging both allows for the filing of points/prompts under course, topic. or subject groups, which is synchronized with RecallChecking, which can take a group and make the user produce its members from memory and report their gaps.
SpacedRepetition decides when these prompts come back, and lapses on points can inform a user when something may have earned promotion to a flashcard.
The distinctive behavior of this app is that the primary driver of card creation and scheduling advancement are omissions during free recall.

### UI Sketches
![Set of UI Sketches for Lemma](../img/UISketches.pdf)
### User Journey
Victor (That's me) is a third-year studying linear algebra. He's been making Anki cards for a while based on the proofs in class. Each card prompts him to rederive the proof, and he's added a hint ladder for when he stalls. By the time the exam rolls around, he's pretty confident about his upcoming performance.
Unfortunately for him, the exam gives him variants he hasn't seen, and while he can recognize some techniques and their use cases, he can't assemble them with enough fluency to get past a C+. From this, he almost concludes that he's just not built for that level of abstract math, but he powers through the uncertainty and instead analyzes his review system.
He trusted in a system that didn't warn him of the shallowness of his understanding, a shallowness baked into the system's design. Each proof he rederived came with its own cue, and he hadn't produced anything from close to scratch. He knows he needs something with less crutches.

Come next week, Victor has changed his studying method up a bit. Instead of writing flashcards immediately and chucking them into Anki, he's reading up on vector spaces and listing points he think he's ought to remember into Lemma: *Spectral theorem's reliance on self-adjointedness*, *Why 0v = 0 matters*, the works. He doesn't add answers to these immediately, and tags them under Axler.
A week later, he opens Lemma and the group of Axler points are due. He sets up a recall session by clicking on the tag, confirming the set of points he wants to review, names the session and presses begin. The points vanish and the screen goes nearly blank as he dumps what he can remember.
The results screen says he covered only a subset of the points he said he would remember, and he reads the transcript and finds that he talked around some of them, but never stated or explained them. He marks them both as omitted and closes the check, rescheduling them two days out. The covered ones are untouched.

Two or three weeks after that, he misses that same subset of points again, which causes *spectral theorem's reliance on self-adjointedness* to appear in the promotion queue with a miss count behind it. He's failed to conjure this bit of information three different times, which is more signaling than he got from Anki. He spends a couple of minutes writing an actual question and answer for it, and it becomes a card he can drill on its own.

After some hectic weeks at his educational institution, Victor reopens Lemma epecting a dreaded backlog, but the queue only shows three topics. The underlying work is tens of items, but he's never shown that number, so he gets back to it.

Before the next exam, Victor does another run of the relevant topics, and covers them all with a bit of struggle, but he can definitely feel a higher level of overall fluency.

It's not that Lemma suddenly made him a genius, it just reduced the friction of performing the kind of free recall the exam would cover.
 
