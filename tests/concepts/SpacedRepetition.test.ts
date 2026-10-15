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
  test("its principle: successes push an item further out, and a failure brings it back the next day with slower growth", async () => {
    const { repetition, later, at } = await setup();

    await repetition.enroll({ item: "spectral" });
    expect(await repetition._due({ before: at() })).toEqual([{ item: "spectral", due: at() }]);

    await repetition.advance({ item: "spectral", credit: 1 });
    expect(await repetition._entry({ item: "spectral" })).toEqual([{ due: new Date(at().getTime() + 2.5 * DAY), interval: 2.5, lapses: 0 }]);
    expect(await repetition._due({ before: at() })).toEqual([]);

    later(3);
    await repetition.advance({ item: "spectral", credit: 1 });
    expect((await repetition._entry({ item: "spectral" }))[0]?.interval).toBeCloseTo(6.25);

    later(7);
    const { due } = await repetition.lapse({ item: "spectral" });
    expect(due).toEqual(new Date(at().getTime() + DAY));
    expect(await repetition._entry({ item: "spectral" })).toEqual([{ due, interval: 1, lapses: 1 }]);

    later(1);
    await repetition.advance({ item: "spectral", credit: 1 });
    expect((await repetition._entry({ item: "spectral" }))[0]?.interval).toBeCloseTo(2.3);
  });

  test("credit 0 holds the interval: the item leaves today's queue without growing", async () => {
    const { repetition, at } = await setup();
    await repetition.enroll({ item: "a" });
    await repetition.advance({ item: "a", credit: 0 });
    expect(await repetition._entry({ item: "a" })).toEqual([{ due: new Date(at().getTime() + DAY), interval: 1, lapses: 0 }]);
  });

  test("refusals: enrolling twice, unknown items, and credit outside 0 to 1", async () => {
    const { repetition } = await setup();
    await repetition.enroll({ item: "a" });
    await expect(repetition.enroll({ item: "a" })).rejects.toThrow(AlreadyEnrolled);
    await expect(repetition.advance({ item: "a", credit: 1.5 })).rejects.toThrow(InvalidCredit);
    await expect(repetition.lapse({ item: "ghost" })).rejects.toThrow(NotEnrolled);
    await expect(repetition.drop({ item: "ghost" })).rejects.toThrow(NotEnrolled);
    expect(await repetition.drop({ item: "a" })).toEqual({ item: "a" });
    expect(await repetition._entry({ item: "a" })).toEqual([]);
  });
});
