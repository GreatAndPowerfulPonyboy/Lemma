import { describe, expect, test } from "bun:test";
import {
  CategorizingConcept,
  CategoryExists,
  CategoryNotEmpty,
  CategoryNotFound,
  type Category,
  InvalidCategory,
  NotPlaced,
} from "../../src/concepts/Categorizing/Categorizing.ts";
import { testDatabase } from "../support/reusable/mongo.ts";
import { expectOneWinner } from "../support/reusable/race.ts";

async function setup() {
  return { categorizing: new CategorizingConcept<string, string>(await testDatabase()) };
}

describe("Categorizing", () => {
  test("its principle: moving an item takes it out of its first category, so every placed item is in exactly one", async () => {
    const { categorizing } = await setup();

    const { category: algebra } = await categorizing.create({ owner: "matthew", name: "Linear Algebra" });
    const { category: proofs } = await categorizing.create({ owner: "matthew", name: "Proofs" });
    for (const item of ["spectral", "rank", "gram"]) await categorizing.place({ item, category: algebra });
    expect(await categorizing._items({ category: algebra })).toEqual([{ item: "spectral" }, { item: "rank" }, { item: "gram" }]);

    expect(await categorizing.place({ item: "spectral", category: proofs })).toEqual({ item: "spectral" });
    expect(await categorizing._items({ category: algebra })).toEqual([{ item: "rank" }, { item: "gram" }]);
    expect(await categorizing._items({ category: proofs })).toEqual([{ item: "spectral" }]);
    expect(await categorizing._category({ item: "spectral" })).toEqual([{ category: proofs }]);

    const everyItem = [
      ...(await categorizing._items({ category: algebra })),
      ...(await categorizing._items({ category: proofs })),
    ].map(({ item }) => item);
    expect(everyItem.sort()).toEqual(["gram", "rank", "spectral"]);
  });

  test("a category with items can't be deleted until they are moved or unplaced", async () => {
    const { categorizing } = await setup();
    const { category } = await categorizing.create({ owner: "a", name: "Topic" });
    await categorizing.place({ item: "x", category });

    const refused = categorizing.delete({ category });
    await expect(refused).rejects.toThrow(CategoryNotEmpty);
    await expect(refused).rejects.toThrow("Move or delete this category's items before deleting it.");

    expect(await categorizing.unplace({ item: "x" })).toEqual({ item: "x" });
    expect(await categorizing.delete({ category })).toEqual({ category });
    expect(await categorizing._get({ category })).toEqual([]);
    await expect(categorizing.delete({ category })).rejects.toThrow(CategoryNotFound);
  });

  test("an owner can't have two categories with the same name, even when both are created at once", async () => {
    const { categorizing } = await setup();
    const { category } = await categorizing.create({ owner: "a", name: "Topic" });
    await expect(categorizing.create({ owner: "a", name: " Topic " })).rejects.toThrow(CategoryExists);
    expect(await categorizing.create({ owner: "b", name: "Topic" })).toHaveProperty("category");

    const { category: other } = await categorizing.create({ owner: "a", name: "Other" });
    await expect(categorizing.rename({ category: other, name: "Topic" })).rejects.toThrow(CategoryExists);
    expect(await categorizing.rename({ category, name: "Renamed" })).toEqual({ category });
    expect(await categorizing._categories({ owner: "a" })).toEqual([
      { category: other, name: "Other" },
      { category, name: "Renamed" },
    ]);

    await expectOneWinner(
      [categorizing.create({ owner: "c", name: "Same" }), categorizing.create({ owner: "c", name: "Same" })],
      CategoryExists,
    );
  });

  test("names are trimmed and must have 1 to 80 characters; unknown categories and unplaced items are refused", async () => {
    const { categorizing } = await setup();
    const { category } = await categorizing.create({ owner: "a", name: "  Spaced  " });
    expect(await categorizing._get({ category })).toEqual([{ owner: "a", name: "Spaced" }]);
    await expect(categorizing.create({ owner: "a", name: "   " })).rejects.toThrow(InvalidCategory);
    await expect(categorizing.create({ owner: "a", name: "x".repeat(81) })).rejects.toThrow(InvalidCategory);
    await expect(categorizing.rename({ category, name: "" })).rejects.toThrow(InvalidCategory);

    const ghost = "no-such-category" as Category;
    await expect(categorizing.rename({ category: ghost, name: "Fine" })).rejects.toThrow(CategoryNotFound);
    await expect(categorizing.place({ item: "x", category: ghost })).rejects.toThrow(CategoryNotFound);
    await expect(categorizing.unplace({ item: "never-placed" })).rejects.toThrow(NotPlaced);
    expect(await categorizing._category({ item: "never-placed" })).toEqual([]);
  });
});
