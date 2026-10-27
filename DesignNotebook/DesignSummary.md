# Design summary
Lemma is a free-recall app geared toward technical subjects. Users jot down short points, organize them later into topics and prompts, and test their ability to explain prompts by memory by checking the points they're able to cover. Prompts are scheduled into a spaced-repeition schedule, and the design urges the deferment of flashcard creation until a point keeps getting missed.


## Changes from initial concept design : Problem Framing
- **Domain Narrowed** from self-regulated learning in general to self-regulated learning of technical subjects, focusing on what I considered to be my most important bad situation: which was the lack of transference of flashcards to technical subject understanding.
- **Shift from ReDerive to Lemma**. Originally intended to design a spaced repetition + guided psetting app, but I got stuck ruminating on useful coincepts/features. In hindsight, I should have created a paper prototype with friends to gauge usability.
- **Final Direction** Decided to make a simpler spaced-repetition app that kept the technical focus by being centered on the elaboration of prompts.
## Changes from initial concept design: Concepts

| P1 | Final | Why |
|---|---|---|
| Prompting | Split into **Cueing** and **Flashcarding** | Two purposes in one concept: a cue only makes sense as a memory jog while explaining a topic; a flashcard is its own unit of review with an answer to grade against |
| Prompts as units of review (removed in the MVP, where topics were reviewed) | **Restored, as RecallChecking checks** scheduled by SpacedRepetition ‚Äî no Prompting concept | Studying with the app, I needed to test a topic at different levels of granularity. Prompting offered no behavior beyond RecallChecking, so a prompt is a frontend harness for a check |
| Tagging | **Removed** | A recall check already gives a cross-topic unit of review; tags weren't worth the extra testing and reactions. User testing may show demand (e.g. as a filter) |
| Categorizing: every point in a topic | **Points can be Unsorted** and moved into a topic later | The restriction was left over from topics being the review unit, and it broke the core philosophy: capture quickly during lecture, organize later. Categorizing stays because placing an idea in exactly one chunk is itself a learning strategy |
| RecallChecking: no history | **Stores attempts** | Without them it can't fulfil its purpose of comparing today's understanding with an earlier attempt |
| Nonexistent | **Sharing** (reused from ConceptBox) | Collaboration was added late; see below |

Specs at P1: [ProblemFraming.md @ mvp](https://github.com/GreatAndPowerfulPonyboy/lemma/blob/798a243/DesignNotebook/ProblemFraming.md). Final specs: [design/concepts @ main](https://github.com/GreatAndPowerfulPonyboy/lemma/tree/main/design/concepts).

### Addition of Sharing
- **Current Implementation** A user can share a prompt with another user, who copies a snapshot of its points to review themselves.
- **Design Mistake** Since I was focusing too much on my own needs, I added collaboration too late for anything substantial. The current implementation also goes against my framing's conviction that making your own points and organization is an important part of the learning process.
- **What I'd do instead**: Implement group recall sessions. I avoided them because integrating them with sapced-repetition scheduling and testeing them seemed difficult, but I should've seen that difficulty as an opportunity to provide something unique, instead of as proof that it shouldn't be done.

## Changes to visual design from P3
- **Search to Create**: My P2 UI was an AI-generated mockup because I was running out of time due to ruminating too much on the overall design of the app. Going into P3, I moved toward my paper sketches' infinite scroll of points, but doing almost anything (making or editing a point, making topics, making prompts) required moving to a different screen, which made it hard to jot points down during a lecture. Points and topics are now created from the main screen's search bar.
- **Tabs over Buttons**: My initial P3 UI utilized buttons as a way to move between working with points, topics, and prompts to align with the initial usage of buttons to create points and topics. With the shift to creating points and topics through the search bar, this UI synchronicity was no longer necessary, and a more familiar tabbing was used.
- **Additional Help Text**: With some playing around, it was clear to see that it was not obvious that recalling on points was what created prompts, nor that cards would be suggested after they were missed in three recall attempts. Thus, the empty prompts/scheduling states were amended with some help text to make it clearer.

## Behavioral changes from P3
- **Renaming 'Track' to 'Add to Scheduling'***: It was not clear to a user what tracking a prompt meant, even with the hint text. Changed it to 'Add To Scheduling' to improve learnability.
- **Changing Abandoning Behavior**: For a user, abandoning a prompt on the first time they attempt it should discard it from their history, but as of P3 the prompt would be saved anyway. This was even more confusing with the original track wording, because a user would expect an abandoned prompt that they never tracked to not be saved in anyway. This was amended such that abandoning an attempt of a prompt that has no previous attempts discards the prompt entirely, with some text for the user explaining that being the case.
- **No Duplicate prompt names**: Users in P3 could create prompts with the same name, confusing themselves in the scheduling screen. This was changed with a new refusal and amended behavior for sharing.
- **Removing copied prompts from shared**: Users in P3 would copy prompts, only to see the prompt back in their shared tab, clogging it. This was changed to copying a prompt removing it from the shared tab.
## No Oral Recall
Recall remained typed, instead of oral. This was a result of noticing that the Web Speech API has not yet been implemented on the stable build of Firefox, my primary browser. I didn't want to handle special casing recall checks based on the user's browser, so I kept things typed. I could've also utilized a local download of Whisper via webassembly, but I wasn't comfortable with asking users to make a 40-150MB download to use my app.
