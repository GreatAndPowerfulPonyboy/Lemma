import {describe, expect, test} from "bun:test";
import type {Cue} from "../../src/concepts/Cueing/Cueing.ts";
import {startLemma} from "../support/app.ts";
import {ok} from "../support/reusable/results.ts";
import {type Lemma, matthewWithPrompt} from "../support/matthew.ts";

type Matthew = Awaited<ReturnType<typeof matthewWithPrompt>>;

/** Matthew attempts his prompt, mentions only `mentioned`, and closes it (or abandons it). */
async function attemptMentioning({api}: Lemma, {session, check}: Matthew, mentioned: Cue[], end: "close" | "abandon" = "close") {
  const {attempt} = ok(await api.check.attempt({session, check}));
  ok(await api.attempt.submit({session, attempt}));
  for (const cue of mentioned) ok(await api.attempt.mention({session, attempt, cue}));
  ok(await api.attempt[end]({session, attempt}));
  return attempt;
}

describe("Promoting points to cards", () => {
  test("A point Matthew misses in three closed attempts is suggested as a card until he writes its answer", async () => {
    const lemma = await startLemma();
    const {api} = lemma;
    const matthew = await matthewWithPrompt(lemma);
    const {session, mitochondria, ribosomes, newton} = matthew;

    await attemptMentioning(lemma, matthew, [mitochondria, newton]);
    await attemptMentioning(lemma, matthew, [mitochondria]);
    await attemptMentioning(lemma, matthew, [mitochondria], "abandon");
    expect(ok(await api.home({session})).suggestedCards).toEqual([]);

    await attemptMentioning(lemma, matthew, [mitochondria, newton]);
    expect(ok(await api.home({session})).suggestedCards).toEqual([
      {cue: ribosomes, pointName: "Ribosomes build proteins", misses: 3},
    ]);

    ok(await api.card.write({session, cue: ribosomes, answer: "They translate mRNA into proteins."}));
    const home = ok(await api.home({session}));
    expect(home.suggestedCards).toEqual([]);
    expect(home.myPoints.find((p) => p.cue === ribosomes)?.answer).toEqual("They translate mRNA into proteins.");
  });

  test("An attempt's points carry their answers, so Matthew can grade against them", async () => {
    const lemma = await startLemma();
    const {api} = lemma;
    const matthew = await matthewWithPrompt(lemma);
    const {session, mitochondria, ribosomes} = matthew;
    ok(await api.card.write({session, cue: ribosomes, answer: "They translate mRNA into proteins."}));

    const attempt = await attemptMentioning(lemma, matthew, [mitochondria]);

    const shown = ok(await api.attempt.show({session, attempt}));
    expect(shown.mentioned).toContainEqual({cue: mitochondria, pointName: "Mitochondria make ATP", answer: null});
    expect(shown.omitted).toContainEqual({cue: ribosomes, pointName: "Ribosomes build proteins", answer: "They translate mRNA into proteins."});
  });

  test("Deleting a suggested point takes it off the queue, and Jonathan never sees Matthew's suggestions", async () => {
    const lemma = await startLemma();
    const {api, register} = lemma;
    const matthew = await matthewWithPrompt(lemma);
    for (let i = 0; i < 3; i++) await attemptMentioning(lemma, matthew, [matthew.mitochondria, matthew.ribosomes]);
    expect(ok(await api.home({session: matthew.session})).suggestedCards.map((s) => s.cue)).toEqual([matthew.newton]);

    const jonathan = await register("Jonathan");
    expect(ok(await api.home({session: jonathan.session})).suggestedCards).toEqual([]);

    ok(await api.point.delete({session: matthew.session, cue: matthew.newton}));
    expect(ok(await api.home({session: matthew.session})).suggestedCards).toEqual([]);
  });
});
