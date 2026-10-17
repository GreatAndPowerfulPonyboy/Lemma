import { describe, expect, test } from "bun:test";
import {
  AlreadyEnrolled,
  InvalidCredit,
  NotEnrolled,
  SpacedRepetitionConcept,
} from "../../src/concepts/SpacedRepetition/SpacedRepetition.ts";
import { testDatabase } from "../support/reusable/mongo.ts";

const DAY = 24 * 60 * 60 * 1000;

/** A concept on a fresh database whose clock the test moves by hand. */
async function setup() {
  let now = new Date("2026-10-01T09:00:00Z");
  const repetition = new SpacedRepetitionConcept<string>(await testDatabase(), "SpacedRepetition", () => now);
  return { repetition, later: (days: number) => (now = new Date(now.getTime() + days * DAY)), at: () => now };
}

describe("SpacedRepetition", () => {
  test("its principle: passing reviews push an item further out, and a failing one brings it back the next day with slower growth", async () => {
    const { repetition, later, at } = await setup();

    await repetition.enroll({ item: "dijkstra" });
    expect(await repetition._due({ before: at() })).toEqual([{ item: "dijkstra", due: at() }]);

    await repetition.review({ item: "dijkstra", credit: 1 });
    expect(await repetition._entry({ item: "dijkstra" })).toEqual([
      { due: new Date(at().getTime() + 2.5 * DAY), interval: 2.5, lapses: 0 },
    ]);
    expect(await repetition._due({ before: at() })).toEqual([]);

    later(3);
    const failed = await repetition.review({ item: "dijkstra", credit: 0.2 });
    expect(failed).toEqual({ item: "dijkstra", due: new Date(at().getTime() + DAY) });
    expect(await repetition._entry({ item: "dijkstra" })).toEqual([{ due: failed.due, interval: 1, lapses: 1 }]);
    expect(await repetition._lapsed({ atLeast: 1 })).toEqual([{ item: "dijkstra", lapses: 1, lastLapse: at() }]);

    later(1);
    await repetition.review({ item: "dijkstra", credit: 1 });
    // One lapse: growth 2.3 rather than 2.5.
    expect(await repetition._entry({ item: "dijkstra" })).toEqual([
      { due: new Date(at().getTime() + 2.3 * DAY), interval: 2.3, lapses: 1 },
    ]);
  });

  test("credit scales the growth, and one half is the least that passes", async () => {
    const { repetition } = await setup();
    await repetition.enroll({ item: "half" });
    await repetition.review({ item: "half", credit: 0.5 });
    // 1 × (1 + 0.5 × (2.5 − 1)) = 1.75
    expect(await repetition._entry({ item: "half" })).toEqual([expect.objectContaining({ interval: 1.75, lapses: 0 })]);

    await repetition.enroll({ item: "just-under" });
    await repetition.review({ item: "just-under", credit: 0.49 });
    expect(await repetition._entry({ item: "just-under" })).toEqual([expect.objectContaining({ interval: 1, lapses: 1 })]);
  });

  test("growth never falls below 1.3, however many lapses", async () => {
    const { repetition } = await setup();
    await repetition.enroll({ item: "hard" });
    for (let i = 0; i < 8; i++) await repetition.review({ item: "hard", credit: 0 });
    await repetition.review({ item: "hard", credit: 1 });
    expect(await repetition._entry({ item: "hard" })).toEqual([expect.objectContaining({ interval: 1.3, lapses: 8 })]);
  });

  test("enrolling twice, reviewing or dropping what isn't enrolled, and credit outside 0 to 1 are refused", async () => {
    const { repetition } = await setup();
    await repetition.enroll({ item: "a" });
    await expect(repetition.enroll({ item: "a" })).rejects.toThrow(AlreadyEnrolled);
    await expect(repetition.review({ item: "a", credit: 1.1 })).rejects.toThrow(InvalidCredit);
    await expect(repetition.review({ item: "a", credit: Number.NaN })).rejects.toThrow("Credit must be between 0 and 1.");
    await expect(repetition.review({ item: "b", credit: 1 })).rejects.toThrow(NotEnrolled);
    // An unknown item is refused before its credit is looked at.
    await expect(repetition.review({ item: "b", credit: 7 })).rejects.toThrow(NotEnrolled);

    expect(await repetition.drop({ item: "a" })).toEqual({ item: "a" });
    expect(await repetition._entry({ item: "a" })).toEqual([]);
    await expect(repetition.drop({ item: "a" })).rejects.toThrow(NotEnrolled);
  });

  test("_due lists what is due by then, earliest first", async () => {
    const { repetition, later, at } = await setup();
    await repetition.enroll({ item: "first" });
    later(1);
    await repetition.enroll({ item: "second" });
    await repetition.review({ item: "second", credit: 1 });
    expect(await repetition._due({ before: at() })).toEqual([{ item: "first", due: new Date(at().getTime() - DAY) }]);
    expect((await repetition._due({ before: new Date(at().getTime() + 3 * DAY) })).map(({ item }) => item)).toEqual([
      "first",
      "second",
    ]);
  });
});
