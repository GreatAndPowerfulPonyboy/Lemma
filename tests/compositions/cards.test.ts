import { describe, expect, test } from "bun:test";
import { startLemma } from "../support/app.ts";
import { ok } from "../support/reusable/results.ts";

/** Matthew, signed in, with a topic and one point in it. */
async function withPoint() {
  const lemma = await startLemma();
  const { session } = await lemma.register("matthew");
  const { category } = ok(await lemma.api.topic.create({ session, name: "Shortest paths" }));
  const { cue } = ok(await lemma.api.point.createIn({ session, category, name: "Dijkstra invariant" }));
  return { ...lemma, session, cue };
}

describe("Cards", () => {
  test("Matthew answers a point he missed, reads it back, revises it, and removes it", async () => {
    const { api, session, cue } = await withPoint();
    expect(await api.card.show({ session, cue })).toEqual({ card: [{ name: "Dijkstra invariant", answer: null }] });

    expect(await api.card.write({ session, cue, answer: "Popped vertices are final." })).toEqual({ cue });
    expect(await api.card.show({ session, cue })).toEqual({
      card: [{ name: "Dijkstra invariant", answer: "Popped vertices are final." }],
    });

    ok(await api.card.revise({ session, cue, answer: "Popped vertices are final, since weights are non-negative." }));
    expect(await api.card.show({ session, cue })).toEqual({
      card: [{ name: "Dijkstra invariant", answer: "Popped vertices are final, since weights are non-negative." }],
    });

    ok(await api.card.remove({ session, cue }));
    expect(await api.card.show({ session, cue })).toEqual({ card: [{ name: "Dijkstra invariant", answer: null }] });
  });

  test("a second answer, a blank one, and revising a point without one are refused", async () => {
    const { api, session, cue } = await withPoint();
    expect(await api.card.revise({ session, cue, answer: "x" })).toEqual({ error: "NO_ANSWER" });
    expect(await api.card.write({ session, cue, answer: "  " })).toEqual({ error: "INVALID_ANSWER" });
    ok(await api.card.write({ session, cue, answer: "first" }));
    expect(await api.card.write({ session, cue, answer: "second" })).toEqual({ error: "ALREADY_ANSWERED" });
  });

  test("deleting a point removes its answer", async () => {
    const { database, api, session, cue } = await withPoint();
    ok(await api.card.write({ session, cue, answer: "Popped vertices are final." }));
    ok(await api.point.delete({ session, cue }));
    // The point is gone, so no endpoint can show its answer any more; look at Flashcarding's collection directly.
    expect(await database.collection("flashcarding.answers").countDocuments({ _id: cue })).toBe(0);
  });

  test("nobody else can read, write, or remove Matthew's answers", async () => {
    const { api, register, session, cue } = await withPoint();
    ok(await api.card.write({ session, cue, answer: "mine" }));
    const sam = await register("sam");
    expect(await api.card.show({ session: sam.session, cue })).toEqual({ error: "NOT_FOUND" });
    expect(await api.card.revise({ session: sam.session, cue, answer: "theirs" })).toEqual({ error: "NOT_FOUND" });
    expect(await api.card.remove({ session: sam.session, cue })).toEqual({ error: "NOT_FOUND" });
    expect(await api.card.show({ session, cue })).toEqual({ card: [{ name: "Dijkstra invariant", answer: "mine" }] });
  });
});
