import { describe, expect, test } from "bun:test";
import { AlreadyAnswered, FlashcardingConcept, InvalidAnswer, NoAnswer } from "../../src/concepts/Flashcarding/Flashcarding.ts";
import { testDatabase } from "../support/reusable/mongo.ts";

async function setup() {
  return { flashcarding: new FlashcardingConcept<string>(await testDatabase()) };
}

describe("Flashcarding", () => {
  test("its principle: Matthew writes an answer after missing a point, checks against it, revises it, and removes it", async () => {
    const { flashcarding } = await setup();
    expect(await flashcarding._answer({ item: "dijkstra-invariant" })).toEqual([]);

    expect(await flashcarding.write({ item: "dijkstra-invariant", answer: "Every popped vertex has its final distance." })).toEqual({
      item: "dijkstra-invariant",
    });
    expect(await flashcarding._answer({ item: "dijkstra-invariant" })).toEqual([
      { answer: "Every popped vertex has its final distance." },
    ]);

    await flashcarding.revise({ item: "dijkstra-invariant", answer: "Popped vertices are final, because weights are non-negative." });
    expect(await flashcarding._answer({ item: "dijkstra-invariant" })).toEqual([
      { answer: "Popped vertices are final, because weights are non-negative." },
    ]);

    expect(await flashcarding.remove({ item: "dijkstra-invariant" })).toEqual({ item: "dijkstra-invariant" });
    expect(await flashcarding._answer({ item: "dijkstra-invariant" })).toEqual([]);
  });

  test("an item has at most one answer, and the first one stays", async () => {
    const { flashcarding } = await setup();
    await flashcarding.write({ item: "heap", answer: "first" });
    const second = flashcarding.write({ item: "heap", answer: "second" });
    await expect(second).rejects.toThrow(AlreadyAnswered);
    await expect(second).rejects.toThrow("That item already has an answer.");
    expect(await flashcarding._answer({ item: "heap" })).toEqual([{ answer: "first" }]);
  });

  test("an answer must have 1 to 5000 characters, and spaces alone don't count", async () => {
    const { flashcarding } = await setup();
    const blank = flashcarding.write({ item: "a", answer: "   " });
    await expect(blank).rejects.toThrow(InvalidAnswer);
    await expect(blank).rejects.toThrow("An answer must have 1 to 5000 characters.");
    await expect(flashcarding.write({ item: "a", answer: "x".repeat(5001) })).rejects.toThrow(InvalidAnswer);
    await expect(flashcarding.write({ item: "a", answer: "x".repeat(5000) })).resolves.toEqual({ item: "a" });

    await expect(flashcarding.revise({ item: "a", answer: "" })).rejects.toThrow(InvalidAnswer);
    expect(await flashcarding._answer({ item: "a" })).toEqual([{ answer: "x".repeat(5000) }]);
  });

  test("revising or removing an item without an answer is refused, before the new answer is looked at", async () => {
    const { flashcarding } = await setup();
    const revise = flashcarding.revise({ item: "none", answer: "anything" });
    await expect(revise).rejects.toThrow(NoAnswer);
    await expect(revise).rejects.toThrow("That item has no answer.");
    await expect(flashcarding.revise({ item: "none", answer: "" })).rejects.toThrow(NoAnswer);
    await expect(flashcarding.remove({ item: "none" })).rejects.toThrow(NoAnswer);

    await flashcarding.write({ item: "once", answer: "x" });
    await flashcarding.remove({ item: "once" });
    await expect(flashcarding.remove({ item: "once" })).rejects.toThrow(NoAnswer);
  });
});
