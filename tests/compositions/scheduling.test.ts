import {describe, expect, test} from "bun:test";
import type {Session} from "../../src/concepts/Sessioning/Sessioning.ts";
import {startLemma} from "../support/app.ts";
import {ok} from "../support/reusable/results.ts";
import {type Lemma, matthewWithPrompt} from "../support/matthew.ts";

/** Matthew attempts his prompt, marks every point mentioned, and closes it, for full credit. */
async function recallEverything({api}: Lemma, matthew: Awaited<ReturnType<typeof matthewWithPrompt>>) {
  const {session, check} = matthew;
  const {attempt} = ok(await api.check.attempt({session, check}));
  ok(await api.attempt.submit({session, attempt}));
  for (const cue of [matthew.mitochondria, matthew.ribosomes, matthew.newton]) ok(await api.attempt.mention({session, attempt, cue}));
  return ok(await api.attempt.close({session, attempt}));
}

describe("Scheduling", () => {
  test("Matthew tracks a prompt, it's due straight away, and recalling all of it moves it into the future", async () => {
    const lemma = await startLemma();
    const {api} = lemma;
    const matthew = await matthewWithPrompt(lemma);
    const {session, check} = matthew;

    expect(await api.check.track({session, check})).toEqual({check});
    const home = ok(await api.home({session}));
    expect(home.dueChecks.map(({check, name}) => ({check, name}))).toEqual([{check, name: "Explain Dijkstra"}]);
    expect(home.scheduledChecks.map((c) => c.check)).toEqual([check]);

    expect(await recallEverything(lemma, matthew)).toEqual({credit: 1});

    expect(ok(await api.home({session})).dueChecks).toEqual([]);
    const {schedule} = ok(await api.check.show({session, check}));
    expect(schedule.tracked).toBe(true);
    expect(new Date(schedule.due!).getTime()).toBeGreaterThan(Date.now());
  });

  test("Closing an attempt at an untracked prompt schedules nothing", async () => {
    const lemma = await startLemma();
    const {api} = lemma;
    const matthew = await matthewWithPrompt(lemma);
    const {session, check} = matthew;

    await recallEverything(lemma, matthew);

    const home = ok(await api.home({session}));
    expect(home.dueChecks).toEqual([]);
    expect(home.scheduledChecks).toEqual([]);
    expect(ok(await api.check.show({session, check})).schedule).toEqual({tracked: false, due: null});
  });

  test("Tracking twice lists the prompt once, untracking takes it off, and untracking again succeeds", async () => {
    const lemma = await startLemma();
    const {api} = lemma;
    const {session, check} = await matthewWithPrompt(lemma);

    ok(await api.check.track({session, check}));
    expect(await api.check.track({session, check})).toEqual({check});
    expect(ok(await api.home({session})).dueChecks.map((c) => c.check)).toEqual([check]);

    expect(await api.check.untrack({session, check})).toEqual({check});
    expect(ok(await api.home({session})).dueChecks).toEqual([]);
    expect(await api.check.untrack({session, check})).toEqual({check});
  });

  test("Deleting a tracked prompt drops it from the schedule without an error", async () => {
    const lemma = await startLemma();
    const {api} = lemma;
    const {session, check} = await matthewWithPrompt(lemma);
    ok(await api.check.track({session, check}));

    expect(await api.check.delete({session, check})).toEqual({check});

    const home = ok(await api.home({session}));
    expect(home.dueChecks).toEqual([]);
    expect(home.scheduledChecks).toEqual([]);
  });

  test("A tracked prompt with no points isn't due, and comes back once it has a point", async () => {
    const lemma = await startLemma();
    const {api} = lemma;
    const {session, check, mitochondria, ribosomes, newton} = await matthewWithPrompt(lemma);
    ok(await api.check.track({session, check}));

    for (const cue of [mitochondria, ribosomes, newton]) ok(await api.point.delete({session, cue}));
    const home = ok(await api.home({session}));
    expect(home.dueChecks).toEqual([]);
    expect(home.scheduledChecks.map((c) => c.check)).toEqual([check]);

    const {cue} = ok(await api.point.create({session, name: "Dijkstra's invariant"}));
    ok(await api.check.include({session, check, cue}));
    expect(ok(await api.home({session})).dueChecks.map((c) => c.check)).toEqual([check]);
  });

  test("Jonathan can't track or untrack Matthew's prompt, and Matthew's due prompts never include Jonathan's", async () => {
    const lemma = await startLemma();
    const {api, register} = lemma;
    const matthew = await matthewWithPrompt(lemma);
    ok(await api.check.track({session: matthew.session, check: matthew.check}));

    const {session} = await register("Jonathan");
    expect(await api.check.track({session, check: matthew.check})).toEqual({error: "NOT_FOUND"});
    expect(await api.check.untrack({session, check: matthew.check})).toEqual({error: "NOT_FOUND"});
    const {check: jonathansCheck} = ok(await api.check.open({session, name: "Explain mitosis"}));
    ok(await api.check.track({session, check: jonathansCheck}));

    const home = ok(await api.home({session: matthew.session}));
    expect(home.dueChecks.map((c) => c.check)).toEqual([matthew.check]);
    expect(home.scheduledChecks.map((c) => c.check)).toEqual([matthew.check]);
    expect(ok(await api.check.show({session: matthew.session, check: matthew.check})).schedule.tracked).toBe(true);
  });

  test("every new scheduling endpoint refuses a signed-out or made-up session with NOT_SIGNED_IN", async () => {
    const lemma = await startLemma();
    const {api} = lemma;
    const {session: matthewsSession, check} = await matthewWithPrompt(lemma);
    ok(await api.auth.logout({session: matthewsSession}));

    for (const session of [matthewsSession, "made-up-session" as Session]) {
      const calls = [
        ["/check/track", () => api.check.track({session, check})],
        ["/check/untrack", () => api.check.untrack({session, check})],
      ] as const;
      for (const [path, call] of calls) {
        expect({path, result: await call()}).toEqual({path, result: {error: "NOT_SIGNED_IN"}});
      }
    }
  });
});
