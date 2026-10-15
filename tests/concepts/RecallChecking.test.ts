import { describe, expect, test } from "bun:test";
import {
  AlreadyClosed,
  AlreadyIncluded,
  type Check,
  CheckNotFound,
  EmptyCheck,
  InvalidCredit,
  NotGraded,
  NotOmitted,
  NotOpen,
  RecallCheckingConcept,
} from "../../src/concepts/RecallChecking/RecallChecking.ts";
import { testDatabase } from "../support/reusable/mongo.ts";

async function setup() {
  return { checking: new RecallCheckingConcept<string, string>(await testDatabase()) };
}

describe("RecallChecking", () => {
  test("its principle: what is still omitted at close is what the person couldn't produce unprompted", async () => {
    const { checking } = await setup();

    const { check } = await checking.open({ owner: "matthew", name: "eigen-stuff" });
    for (const item of ["spectral", "diagonalization", "gram"]) await checking.include({ check, item });
    expect(await checking._subject({ check })).toEqual([{ item: "spectral" }, { item: "diagonalization" }, { item: "gram" }]);

    expect(await checking.submit({ check })).toEqual({ check });
    expect(await checking._omitted({ check })).toEqual([{ item: "spectral" }, { item: "diagonalization" }, { item: "gram" }]);

    // The account mentioned spectral and diagonalization; he knows he explained diagonalization badly.
    await checking.markMentioned({ check, item: "spectral" });
    await checking.markMentioned({ check, item: "diagonalization" });
    await checking.markOmitted({ check, item: "diagonalization" });
    await checking.rate({ check, credit: 0.5 });
    expect(await checking.close({ check })).toEqual({ check });

    expect(await checking._mentioned({ check })).toEqual([{ item: "spectral" }]);
    expect(await checking._omitted({ check })).toEqual([{ item: "diagonalization" }, { item: "gram" }]);
    expect(await checking._get({ check })).toEqual([{ owner: "matthew", name: "eigen-stuff", status: "CLOSED", credit: 0.5 }]);
  });

  test("items are chosen only while the check is open, and an empty check can't be submitted", async () => {
    const { checking } = await setup();
    const { check } = await checking.open({ owner: "a", name: "c" });
    await expect(checking.submit({ check })).rejects.toThrow(EmptyCheck);
    await checking.include({ check, item: "x" });
    await expect(checking.include({ check, item: "x" })).rejects.toThrow(AlreadyIncluded);
    expect(await checking._mentioned({ check })).toEqual([]);

    await checking.submit({ check });
    await expect(checking.include({ check, item: "y" })).rejects.toThrow(NotOpen);
    await expect(checking.submit({ check })).rejects.toThrow(NotOpen);
  });

  test("corrections and ratings happen only between submitting and closing", async () => {
    const { checking } = await setup();
    const { check } = await checking.open({ owner: "a", name: "c" });
    await checking.include({ check, item: "x" });
    await expect(checking.markMentioned({ check, item: "x" })).rejects.toThrow(NotGraded);

    await checking.submit({ check });
    await expect(checking.markMentioned({ check, item: "not-in-check" })).rejects.toThrow(NotOmitted);
    await expect(checking.rate({ check, credit: 2 })).rejects.toThrow(InvalidCredit);
    await checking.close({ check });

    await expect(checking.markOmitted({ check, item: "x" })).rejects.toThrow(NotGraded);
    await expect(checking.close({ check })).rejects.toThrow(NotGraded);
    await expect(checking.abandon({ check })).rejects.toThrow(AlreadyClosed);
  });

  test("an unfinished check can be abandoned, and unknown checks are refused", async () => {
    const { checking } = await setup();
    const { check } = await checking.open({ owner: "a", name: "c" });
    expect(await checking.abandon({ check })).toEqual({ check });
    expect(await checking._get({ check })).toEqual([]);

    const ghost = "no-such-check" as Check;
    await expect(checking.include({ check: ghost, item: "x" })).rejects.toThrow(CheckNotFound);
    await expect(checking.submit({ check: ghost })).rejects.toThrow(CheckNotFound);
    expect(await checking._subject({ check: ghost })).toEqual([]);
  });
});
