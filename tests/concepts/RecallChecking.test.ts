import { describe, expect, test } from "bun:test";
import {
  AlreadyIncluded, type Attempt, AttemptInProgress, AttemptNotFound, type Check, CheckNotFound, Finished, InvalidName,
  InvalidRating, NotGraded, NotIncluded, NotInSubject, NotOpen, RecallCheckingConcept, Unrated,
} from "../../src/concepts/RecallChecking/RecallChecking.ts";
import { testDatabase } from "../support/reusable/mongo.ts";

async function setup() {
  return { checking: new RecallCheckingConcept<string, string>(await testDatabase()) };
}

/** A check named for Dijkstra's proof, covering three points, each named for itself. */
async function dijkstra(checking: RecallCheckingConcept<string, string>) {
  const { check } = await checking.open({ owner: "matthew", name: "Explain the proof of correctness for Dijkstra" });
  for (const item of ["invariant", "relaxation", "non-negative weights"]) await checking.include({ check, item, name: item });
  return check;
}

/** The rows a subject query returns for items named for themselves. */
const named = (...items: string[]) => items.map((item) => ({ item, name: item }));

const ghostCheck = "000000000000000000000000" as Check;
const ghostAttempt = "000000000000000000000000" as Attempt;

describe("RecallChecking", () => {
  test("its principle: Matthew attempts a check, corrects the split, closes it, and attempts it again later", async () => {
    const { checking } = await setup();
    const check = await dijkstra(checking);

    const { attempt: first } = await checking.attempt({ check });
    expect(await checking._mentioned({ attempt: first })).toEqual([]);
    await checking.submit({ attempt: first });
    expect(await checking._omitted({ attempt: first })).toEqual(named("invariant", "relaxation", "non-negative weights"));
    await checking.mention({ attempt: first, item: "invariant" });
    await checking.mention({ attempt: first, item: "relaxation" });
    await checking.omit({ attempt: first, item: "relaxation" });
    expect(await checking._mentioned({ attempt: first })).toEqual(named("invariant"));
    expect(await checking._omitted({ attempt: first })).toEqual(named("relaxation", "non-negative weights"));
    expect(await checking.close({ attempt: first })).toEqual({ attempt: first, check, credit: 1 / 3 });

    const { attempt: second } = await checking.attempt({ check });
    await checking.submit({ attempt: second });
    for (const item of ["invariant", "relaxation", "non-negative weights"]) await checking.mention({ attempt: second, item });
    expect(await checking.close({ attempt: second })).toEqual({ attempt: second, check, credit: 1 });

    expect(await checking._attempts({ check })).toEqual([
      { attempt: second, status: "CLOSED", credit: 1 },
      { attempt: first, status: "CLOSED", credit: 1 / 3 },
    ]);
    expect(await checking._get({ check })).toEqual([{ owner: "matthew", name: "Explain the proof of correctness for Dijkstra" }]);
  });

  test("a rating replaces the share mentioned, and an attempt with no items must be rated", async () => {
    const { checking } = await setup();
    const check = await dijkstra(checking);
    const { attempt } = await checking.attempt({ check });
    await checking.submit({ attempt });
    await checking.rate({ attempt, rating: 0.8 });
    expect(await checking.close({ attempt })).toEqual({ attempt, check, credit: 0.8 });

    const { check: bare } = await checking.open({ owner: "matthew", name: "Explain heaps" });
    const { attempt: unrated } = await checking.attempt({ check: bare });
    await checking.submit({ attempt: unrated });
    await expect(checking.close({ attempt: unrated })).rejects.toThrow(Unrated);
    await expect(checking.rate({ attempt: unrated, rating: 1.5 })).rejects.toThrow(InvalidRating);
    await expect(checking.rate({ attempt: unrated, rating: Number.NaN })).rejects.toThrow(InvalidRating);
    await checking.rate({ attempt: unrated, rating: 0.4 });
    expect(await checking.close({ attempt: unrated })).toEqual({ attempt: unrated, check: bare, credit: 0.4 });
  });

  test("an attempt keeps the subject it began with, while the check's subject changes", async () => {
    const { checking } = await setup();
    const check = await dijkstra(checking);
    const { attempt } = await checking.attempt({ check });
    await checking.exclude({ check, item: "relaxation" });
    await checking.include({ check, item: "priority queue", name: "priority queue" });

    expect(await checking._subject({ check })).toEqual(named("invariant", "non-negative weights", "priority queue"));
    expect(await checking._attemptSubject({ attempt })).toEqual(named("invariant", "relaxation", "non-negative weights"));
    await checking.submit({ attempt });
    await expect(checking.mention({ attempt, item: "priority queue" })).rejects.toThrow(NotInSubject);
    expect(await checking._including({ item: "relaxation" })).toEqual([]);
    expect(await checking._including({ item: "invariant" })).toEqual([{ check }]);
  });

  test("relabeling renames an item in every check that includes it, while attempts keep the names they began with", async () => {
    const { checking } = await setup();
    const check = await dijkstra(checking);
    const { check: other } = await checking.open({ owner: "matthew", name: "Explain shortest paths" });
    await checking.include({ check: other, item: "relaxation", name: "relaxation" });
    const { attempt } = await checking.attempt({ check });

    expect(await checking.relabel({ item: "relaxation", name: "edge relaxation" })).toEqual({ item: "relaxation" });
    expect(await checking._subject({ check })).toEqual([
      ...named("invariant"), { item: "relaxation", name: "edge relaxation" }, ...named("non-negative weights"),
    ]);
    expect(await checking._subject({ check: other })).toEqual([{ item: "relaxation", name: "edge relaxation" }]);
    expect(await checking._attemptSubject({ attempt })).toEqual(named("invariant", "relaxation", "non-negative weights"));
    await expect(checking.relabel({ item: "nothing", name: "anything" })).resolves.toEqual({ item: "nothing" });
  });

  test("a check has one unfinished attempt at a time, and an abandoned one frees it", async () => {
    const { checking } = await setup();
    const check = await dijkstra(checking);
    const { attempt } = await checking.attempt({ check });
    expect(await checking._current({ check })).toEqual([{ attempt, status: "OPEN" }]);
    await expect(checking.attempt({ check })).rejects.toThrow(AttemptInProgress);
    await checking.submit({ attempt });
    await expect(checking.attempt({ check })).rejects.toThrow(AttemptInProgress);

    await checking.abandon({ attempt });
    expect(await checking._current({ check })).toEqual([]);
    await expect(checking.abandon({ attempt })).rejects.toThrow(Finished);
    await expect(checking.attempt({ check })).resolves.toHaveProperty("attempt");
  });

  test("each step refuses an attempt in the wrong status", async () => {
    const { checking } = await setup();
    const check = await dijkstra(checking);
    const { attempt } = await checking.attempt({ check });
    await expect(checking.mention({ attempt, item: "invariant" })).rejects.toThrow(NotGraded);
    await expect(checking.rate({ attempt, rating: 1 })).rejects.toThrow(NotGraded);
    await expect(checking.close({ attempt })).rejects.toThrow(NotGraded);
    await checking.submit({ attempt });
    await expect(checking.submit({ attempt })).rejects.toThrow(NotOpen);
    await checking.close({ attempt });
    await expect(checking.omit({ attempt, item: "invariant" })).rejects.toThrow(NotGraded);
    await expect(checking.abandon({ attempt })).rejects.toThrow(Finished);
  });

  test("names, subjects, and unknown checks and attempts are refused", async () => {
    const { checking } = await setup();
    await expect(checking.open({ owner: "a", name: "   " })).rejects.toThrow(InvalidName);
    await expect(checking.open({ owner: "a", name: "x".repeat(81) })).rejects.toThrow("A check name must have 1 to 80 characters.");
    const check = await dijkstra(checking);
    await expect(checking.include({ check, item: "invariant", name: "invariant" })).rejects.toThrow(AlreadyIncluded);
    await expect(checking.exclude({ check, item: "nothing" })).rejects.toThrow(NotIncluded);
    await checking.rename({ check, name: "  Prove Dijkstra correct  " });
    expect(await checking._get({ check })).toEqual([{ owner: "matthew", name: "Prove Dijkstra correct" }]);

    await expect(checking.rename({ check: ghostCheck, name: "" })).rejects.toThrow(CheckNotFound);
    await expect(checking.attempt({ check: ghostCheck })).rejects.toThrow("There is no such check.");
    await expect(checking.submit({ attempt: ghostAttempt })).rejects.toThrow(AttemptNotFound);
    expect(await checking._attempt({ attempt: ghostAttempt })).toEqual([]);
  });

  test("deleting a check deletes its attempts, and each owner sees only their own checks", async () => {
    const { checking } = await setup();
    const check = await dijkstra(checking);
    const { check: other } = await checking.open({ owner: "sam", name: "Explain union-find" });
    const { attempt } = await checking.attempt({ check });
    expect(await checking._checks({ owner: "matthew" })).toEqual([
      { check, name: "Explain the proof of correctness for Dijkstra" },
    ]);

    expect(await checking.delete({ check })).toEqual({ check });
    expect(await checking._attempt({ attempt })).toEqual([]);
    expect(await checking._checks({ owner: "matthew" })).toEqual([]);
    expect(await checking._checks({ owner: "sam" })).toEqual([{ check: other, name: "Explain union-find" }]);
    await expect(checking.delete({ check })).rejects.toThrow(CheckNotFound);
  });
});
