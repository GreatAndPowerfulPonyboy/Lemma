import { describe, expect, test } from "bun:test";
import { startLemma } from "../support/app.ts";
import { eventually, ok } from "../support/reusable/results.ts";

describe("Matthew's journey", () => {
  test("he names points under a topic, recalls them, corrects the guess, and sees what he left out", async () => {
    const { api, register } = await startLemma();
    const { session } = await register("matthew");

    const { category } = ok(await api.topics.create({ session, name: "Proof of the spectral theorem" }));
    const { cue: symmetric } = ok(await api.cues.create({ session, category, name: "real symmetric matrices" }));
    const { cue: induction } = ok(await api.cues.create({ session, category, name: "induction on dimension" }));
    const home = ok(await api.home({ session }));
    // A new point is due at once.
    for (const point of home.topics[0]?.points ?? []) expect(new Date(point.due ?? 0).getTime()).toBeLessThanOrEqual(Date.now());
    expect(home.topics).toMatchObject([
      {
        category,
        name: "Proof of the spectral theorem",
        points: [
          { cue: symmetric, name: "real symmetric matrices" },
          { cue: induction, name: "induction on dimension" },
        ],
      },
    ]);

    const { check } = ok(await api.checks.open({ session, name: "first try" }));
    ok(await api.checks.include({ session, check, cue: symmetric }));
    ok(await api.checks.include({ session, check, cue: induction }));
    ok(await api.checks.submit({ session, check }));
    // The browser guessed he mentioned both; he knows he never explained the induction.
    ok(await api.checks.mention({ session, check, cue: symmetric }));
    ok(await api.checks.mention({ session, check, cue: induction }));
    ok(await api.checks.omit({ session, check, cue: induction }));
    ok(await api.checks.close({ session, check }));

    const { result } = ok(await api.checks.show({ session, check }));
    expect(result).toEqual([
      {
        name: "first try",
        status: "CLOSED",
        points: [
          { cue: symmetric, name: "real symmetric matrices" },
          { cue: induction, name: "induction on dimension" },
        ],
        mentioned: [{ cue: symmetric, name: "real symmetric matrices" }],
        omitted: [{ cue: induction, name: "induction on dimension" }],
      },
    ]);

    // Closing the check moved both points' next review out of today: the missed one lapsed, the covered one was held.
    await eventually(async () => {
      const after = ok(await api.home({ session }));
      for (const point of after.topics[0]?.points ?? []) expect(new Date(point.due ?? 0).getTime()).toBeGreaterThan(Date.now());
    });
  });

  test("a topic with points can't be deleted until its points are deleted, which also takes them out of it", async () => {
    const { api, register } = await startLemma();
    const { session } = await register("matthew");
    const { category } = ok(await api.topics.create({ session, name: "Linear Algebra" }));
    const { cue } = ok(await api.cues.create({ session, category, name: "rank-nullity" }));

    expect(await api.topics.delete({ session, category })).toEqual({ error: "CATEGORY_NOT_EMPTY" });
    ok(await api.cues.delete({ session, cue }));
    await eventually(async () => expect(ok(await api.topics.delete({ session, category }))).toEqual({ category }));
  });

  test("nobody else can see, change, or check Matthew's topics and points", async () => {
    const { api, register } = await startLemma();
    const matthew = await register("matthew");
    const sam = await register("sam");
    const { category } = ok(await api.topics.create({ session: matthew.session, name: "Linear Algebra" }));
    const { cue } = ok(await api.cues.create({ session: matthew.session, category, name: "rank-nullity" }));

    expect(await api.topics.rename({ session: sam.session, category, name: "Mine now" })).toEqual({ error: "NOT_FOUND" });
    expect(await api.cues.create({ session: sam.session, category, name: "sneaky" })).toEqual({ error: "NOT_FOUND" });
    expect(await api.cues.delete({ session: sam.session, cue })).toEqual({ error: "NOT_FOUND" });
    expect(ok(await api.home({ session: sam.session })).topics).toEqual([]);

    const { check } = ok(await api.checks.open({ session: sam.session, name: "borrowed" }));
    expect(await api.checks.include({ session: sam.session, check, cue })).toEqual({ error: "NOT_FOUND" });
  });
});
