/**
 * Guesses which points a typed account mentions. It is deliberately crude: the person corrects every guess before the
 * check closes, and nothing is scheduled from a guess alone. A point counts as mentioned when at least half of the
 * meaningful words in its name appear in the account, ignoring case and punctuation.
 */
const IGNORED = new Set([
  "the", "and", "for", "with", "from", "into", "that", "this", "its", "are", "was", "how", "why", "what", "when",
  "proof", "of", "a", "an", "to", "in", "on", "is", "by",
]);

function words(text: string): string[] {
  return text.toLowerCase().split(/[^\p{L}\p{N}]+/u).filter((word) => word.length > 0);
}

function meaningful(name: string): string[] {
  return words(name).filter((word) => word.length >= 3 && !IGNORED.has(word));
}

/** True when the account mentions the point named `name`. */
export function mentions(account: string, name: string): boolean {
  const said = new Set(words(account));
  const needed = meaningful(name);
  if (needed.length === 0) return account.toLowerCase().includes(name.trim().toLowerCase());
  const found = needed.filter((word) => said.has(word)).length;
  return found >= Math.ceil(needed.length / 2);
}
