# Access
Cueing and Categorizing keep track of who created a point or topic, but neither concept has rules for who may do what with them.
In Lemma, a person [owns a topic](view:access.permissions.ownsTopic) when they are its creator. Likewise, a person [owns a point](view:access.permissions.ownsPoint) when they are its creator.
In Lemma, a card is a point that has had an answer written to it by Flashcarding, so ownership policies on cards are covered under policies for their respective points. Thus, there is not a separate view for card ownership.
Only the owner of a topic may rename or delete the topic. Moreover, only the owner of a topic may create a point within that topic. Only the owner of a point may rename or delete the point or move it between topics that they also own.
Endpoints that interact with existing topics or points check these views besides topic creation; The creator of a topic is always the session's user, so another user cannot create a topic for someone else. 
