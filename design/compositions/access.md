# Access

Every topic and every point belongs to the person who created it. Categorizing records each topic's owner and Cueing each point's owner, so ownership is read from those concepts rather than stored again.

A person [owns a topic](view:access.permissions.ownsTopic) when Categorizing records them as its owner, and [owns a point](view:access.permissions.ownsCue) when Cueing does. Every endpoint that acts on an existing topic or point checks one of these views after resolving the session, and answers `NOT_FOUND` to anyone else, so a request can neither change nor confirm the existence of someone else's topic or point.
