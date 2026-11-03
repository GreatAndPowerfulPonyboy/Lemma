### Participant background
The user was a friend in course 6 that uses spaced repetition software often. They consented to perform tasks understanding that I would ask for their thought process and intervene when necessary.

#### Making points and topics
They successfully made the point by typing into the search bar, so the UI guided that well. After the point was created, they noticed it at the top of the menu, and attempted to place it within the topic by selecting ‘move to topic’ in the edit dropdown and typing into that search bar. This didn’t do anything. They pursed their lips in frustration and discovered that the app makes them make the topic in that search bar first. Succeeded without intervention. Execution gulf caused by an asymmetry in the design; the search bar to create points guided them to doing so in other search forms. They noted that the screen updated too slow to follow along with a lecture, and not being able to input LaTeK stunk.

#### Using prompts
The prompt copying was so slow that they pressed F12, checked the network tab, and started analyzing the sequence of api calls. They noted that there was no reason for the POST to home to take 3 whole seconds, and that part of the slowdown was probably caused by copying a prompt creating a sequence of post requests instead of sending a batch. Noting this as an evaluation gulf: they couldn’t understand what in the system state was taking so much time, enough so that they began investigating themselves. Succeeded without intervention.

#### Scheduling
They successfully performed a check on the scheduled prompt. They looked for hint text on what counted as ‘mentioning’, but couldn’t find any. They generated some extra prompts and discovered that it was an exact match. Evaluation gulf: They had to do detective work to discover system state.

