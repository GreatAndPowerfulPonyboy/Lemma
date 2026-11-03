#### Flaw 1: Points-first capture is too forced and isn't intuitive
-**Level**: Conceptual
Gap between workflow forced by app and user intention. Both participants wanted to categorize a point at the point of creation. 
-**Severity**: Critical
Both users demonstrated difficulty with connecting the foundational app workflow to what they intended to do. P1 wasn't able to continue without intervention, and P2 was able to recover. However, both participants had recurring issues with the inconsistency between when a search bar allows creation. 
-**Problem Description**
Both participants tried to give a point a topic near the moment of capture.
-P1 filled in both of the search fields and pressed Enter. They only saw the filtered home screen, and no point created. I needed to intervene because there was no signal of what to do next.
-P2 created the point, then typed a new topic name into the 'move to topic' search. Nothing happened until they investigated and found they needed to make the topic first.
-**Why it's occurring**
My design assumes users capture first and organize later to the extent that it adds unnecessary friction. Search fields are inconsistent since the point and topic searches create on eneter, but the 'move to topic' and 'add to prompt' searches only filter. The 'tutorial' UI on the home screen teaches behavior that other elements don't echo.
-**Potential Fixes**
#### Bandaid solutions
-Make every search field create on Enter when there's no match, and add placeholder text to signify that.
-If the topic field holds a value when a point is created, create the point in that topic and make the topic if it doesn't exist.
#### UI overhaul
-Instead of using search abrs to create points, have a button that opens a modal to fill in point text and optional topic, prompt, and answer fields. Within the modal, give a signifier that if you submit a topic and/or prompt name that don't exist, it will be created. A modal grants more space to add signifiers of intended usage, at the price of creating more button clicks.
### Flaw 2: Prompt creation is hard to discover
-**Level**: Linguistic
The intended user model exists in the UI, but the mapping between the words of the interface and the user model aren't connected.
-**Severity** Critical
For P1, they needed intervention to create a prompt. For P2, they made prompts without intervention, but considering that the UI is objectively misleading (add to prompt *moves* instead of adding), I think that's a fluke of their internal model aligning with mine. Since this is an intervention-requiring UI problem that's also necessary to interact with key app concepts, I think this is critical.
-**Problem Description**
P1 went to the prompts tab to create a prompt and found that there was no create action, just a prepopulated prompt. After my hint, they selected points and pressed 'add to prompt', which accomplished nothing for them
-**Why it's occurring**
Prompts are created from point selection, and nothing in anywhere a user looks says so. The tab's hint text appears when there are no prompts, so this error is a function of preseeding. However, a reasonable representation of a user might be someone who tries this app for a brief moment on a friend's suggestion and make an initial promp, forget about it until class time, and then logs back in, forgetting how they made the initial prompt. 
-**Potential Fixes**
#### Bandaid solutions
-Add a 'new prompt' action to the prompts tab
-Rename 'add to prompt' to 'move to prompt' 
-Make the hint text persistent

No UI overhauls here because this is a linguistic error. Could be understating the severity, but current assumption is that users would succeed at the task with the above changes.

### Flaw 3: Recall grading and its effect on scheduling is obfuscated
-**Level**: Conceptual
Users can't generate a correct model of how the results of a recall check will change the state of the system, and it wouldn't be fixed by a clearer label
-**Severity**: Major
Both participants in the study completed the task without intervention, but it was an issue across both. This wouldn't stop a user from using the app in a strict sense, but would impact how useful they would find it.
-**Problem Description**
Neither participant could determine what counted as 'mentioning' upon their first interaction with the recall check. P1 completed the check with a brief bit of confusion but didn't comment on it, and P2 learned after investigation.
-**Why it's occurring**
The system silently feeds results into scheduling, and while the user can correct mistakes on 'mentioning', they don't have a way to see how that will affect the schedule. 
-**Potential Fixes**
### Bandaid Solutions
-Within the check screen, have some text describing when the next due date is, and update it based on user corrections of mentioned points
### UI Overhauls
-Remove automatic matching entirely, and instead put a checkbox of the user's points side by side with what they entered.

### Flaw 4: Latency, especially for sharing prompts
-**Level**: Physical
Problem is in the response time of the UI, not in the user's ability to generate a correct mental model and map it to actions.
-**Severity**: Moderate
Didn't stop users from completing tasks, but it did recur on every task, cause frustation, and pull P2 out of the task. It threatens app adherence, but doesn't block actions.
-**Problem Description**
P1 called the sharing 'ragebait' since it took so long. P2 inspected the network tab to diagnose the error. P2 also said point creation was too slow to keep up with a lecture.
-**Why it's occurring**
Network tab shows that copying a snapshot issues a request per point instead of a batched action, and there isn't a loading bar while it runs, increasing frustration. For general app latency, I think it's due to the /home endpoint not being split into tabs, so every action goes to home, which involves reloading every point. 
-**Potential Fixes**
### Bandaid Solutions
-Make copying a batched action, give users a loading screen
-Let the user do other tasks while copying, ping them when a copy is done
### Overhaul solutions
-Investigate reaction queries and see if there are unnecessary views or checks causing more database queries than necessary
-Split home endpoint into different tabs and only reload the relevant tab on action


### Priority List
Flaw 1 definitely needs to be fixed first because it briefly blocked both aprticipants, recurs, and is central to every app workflow. Flaw 3 needs to be fixed afterward because it threatens another core concept of the app. Flaws 2 and 4 can probably be worked on in parallel/in between fixing flaws 1 and 3. I anticipate that flaw 2 is a linguistic error that can be fixed any time, and flaw 4 involves performance optimizations that don't affect the core workflow, so they can be done in parallel.
