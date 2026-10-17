import { describe, expect, test } from "bun:test";
import { type Cue, CueNotFound, CueingConcept, InvalidName } from "../../src/concepts/Cueing/Cueing.ts";
import { testDatabase } from "../support/reusable/mongo.ts";

async function setup() {
  return { cueing: new CueingConcept<string>(await testDatabase()) };
}

describe("Cueing", () => {
  test("its principle: Matthew names cues, finds them again, and a renamed cue stays the same cue", async () => {
    const { cueing } = await setup();

    const { cue: spectral } = await cueing.create({ creator: "matthew", name: "spectral theorem" });
    const { cue: rank } = await cueing.create({ creator: "matthew", name: "rank-nullity" });
    expect(await cueing._cues({ creator: "matthew" })).toEqual([
      { cue: rank, name: "rank-nullity" },
      { cue: spectral, name: "spectral theorem" },
    ]);

    expect(await cueing.rename({ cue: spectral, name: "proof of the spectral theorem" })).toEqual({ cue: spectral });
    expect(await cueing._get({ cue: spectral })).toEqual([{ creator: "matthew", name: "proof of the spectral theorem" }]);
    expect(await cueing._search({ creator: "matthew", text: "SPECTRAL" })).toEqual([
      { cue: spectral, name: "proof of the spectral theorem" },
    ]);

    expect(await cueing.delete({ cue: rank })).toEqual({ cue: rank });
    expect(await cueing._cues({ creator: "matthew" })).toEqual([{ cue: spectral, name: "proof of the spectral theorem" }]);
  });

  test("names are stored trimmed and must have 1 to 100 characters", async () => {
    const { cueing } = await setup();
    const { cue } = await cueing.create({ creator: "a", name: "  eigenvalues  " });
    expect(await cueing._get({ cue })).toEqual([{ creator: "a", name: "eigenvalues" }]);

    const blank = cueing.create({ creator: "a", name: "   " });
    await expect(blank).rejects.toThrow(InvalidName);
    await expect(blank).rejects.toThrow("A name must have 1 to 100 characters.");
    await expect(cueing.create({ creator: "a", name: "x".repeat(101) })).rejects.toThrow(InvalidName);
    await expect(cueing.create({ creator: "a", name: ` ${"x".repeat(100)} ` })).resolves.toHaveProperty("cue");

    await expect(cueing.rename({ cue, name: "" })).rejects.toThrow(InvalidName);
    expect(await cueing._get({ cue })).toEqual([{ creator: "a", name: "eigenvalues" }]);
  });

  test("renaming or deleting an unknown cue is refused, and an unknown cue comes before a bad name", async () => {
    const { cueing } = await setup();
    const ghost = "000000000000000000000000" as Cue;

    const rename = cueing.rename({ cue: ghost, name: "anything" });
    await expect(rename).rejects.toThrow(CueNotFound);
    await expect(rename).rejects.toThrow("Cue does not exist.");
    await expect(cueing.rename({ cue: ghost, name: "" })).rejects.toThrow(CueNotFound);
    await expect(cueing.delete({ cue: ghost })).rejects.toThrow(CueNotFound);
    expect(await cueing._get({ cue: ghost })).toEqual([]);

    const { cue } = await cueing.create({ creator: "a", name: "gone" });
    await cueing.delete({ cue });
    await expect(cueing.delete({ cue })).rejects.toThrow(CueNotFound);
  });

  test("each creator sees only their own cues", async () => {
    const { cueing } = await setup();
    await cueing.create({ creator: "ben", name: "determinants" });
    const { cue } = await cueing.create({ creator: "sam", name: "determinants" });
    expect(await cueing._cues({ creator: "sam" })).toEqual([{ cue, name: "determinants" }]);
    expect(await cueing._search({ creator: "sam", text: "det" })).toEqual([{ cue, name: "determinants" }]);
    expect(await cueing._cues({ creator: "nobody" })).toEqual([]);
  });

  test("search matches text literally, and blank text returns every cue", async () => {
    const { cueing } = await setup();
    const { cue: formula } = await cueing.create({ creator: "a", name: "f(x) = x^2" });
    const { cue: other } = await cueing.create({ creator: "a", name: "fx" });
    expect(await cueing._search({ creator: "a", text: "(x)" })).toEqual([{ cue: formula, name: "f(x) = x^2" }]);
    expect(await cueing._search({ creator: "a", text: "  " })).toEqual([
      { cue: other, name: "fx" },
      { cue: formula, name: "f(x) = x^2" },
    ]);
    expect(await cueing._search({ creator: "a", text: "matrix" })).toEqual([]);
  });
});
