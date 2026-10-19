# Sharing
In Lemma, users can share a prompt with another user by their username, and that user can copy a snapshot of it into their own prompts. This lets a user start a recall check from points curated by someone else, such as a classmate or a lecturer. The copy is theirs: their attempts at it never affect the original prompt or the scheduling progress of the user who shared it, and later changes to the original never reach the copy.

When a person [owns](view:access.permissions.ownsCheck) a prompt, the [share endpoint](reaction:sharing.sharing.ShareCheck) shares it with the user who has the given username via `Sharing.share`. A username that belongs to nobody is refused with `NO_SUCH_USER`, and the owner's own username is refused with `SHARE_WITH_SELF`. Sharing a prompt with someone it is already shared with succeeds quietly and changes nothing. The [unshare endpoint](reaction:sharing.sharing.UnshareCheck) takes that access back via `Sharing.revoke`; unsharing with someone the prompt isn't shared with, or with a username that belongs to nobody, also succeeds quietly. For prompts the user does not own, both endpoints respond with `NOT_FOUND`. When showing a prompt they own, a user also sees the [recipients](former:sharing.showing.recipientsOf) it is shared with, by username.

```endpoints
sharing.sharing.ShareCheck at /check/share
sharing.sharing.UnshareCheck at /check/unshare
```

A prompt is [shared with](view:access.permissions.sharedWith) a person when its owner has shared it with them and hasn't taken it back. The [shared endpoint](reaction:sharing.showing.ShowShared) lists [the prompts shared with](former:sharing.showing.sharedWithMe) the signed-in user, each with its name and its owner's username. The [shared show endpoint](reaction:sharing.showing.ShowSharedCheck) gives a shared prompt's name, its owner's username, and [its points](former:sharing.showing.sharedPoints) by name, so the user can see what they would be copying. For a prompt that isn't shared with the user, it responds with `NOT_FOUND`, as it does for a prompt that doesn't exist.

```endpoints
sharing.showing.ShowShared at /shared
sharing.showing.ShowSharedCheck at /shared/show
```

Copying a shared prompt needs no endpoint of its own. The user [opens a prompt](reaction:checks.opening.OpenCheck) with the shared prompt's name, [creates a point](reaction:points.creating.CreatePoint) for each of its points, and [includes](reaction:checks.subjects.IncludePoint) each new point in the new prompt. The new prompt and points belong to the user who copied them, and the points start out Unsorted. Because the copy is made of new prompts and points, it keeps working after the original is changed, unshared, or deleted.

When a prompt is deleted, every share of it is [revoked](reaction:sharing.revoking.RevokeDeleted), so it disappears from what is shared with each recipient.
