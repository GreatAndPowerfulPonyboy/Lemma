import {describe, expect, test} from "bun:test";
import type {Check} from "../../src/concepts/RecallChecking/RecallChecking.ts";
import type {Session} from "../../src/concepts/Sessioning/Sessioning.ts";
import {startLemma} from "../support/app.ts";
import {ok} from "../support/reusable/results.ts";
import {type Lemma, matthewWithPrompt} from "../support/matthew.ts";

/** Matthew's "Explain Dijkstra" prompt, shared with Jonathan. */
async function matthewSharesWithJonathan(lemma: Lemma) {
  const {api, register} = lemma;
  const matthew = await matthewWithPrompt(lemma);
  const jonathan = await register("Jonathan");
  ok(await api.check.share({session: matthew.session, check: matthew.check, username: "Jonathan"}));
  return {matthew, jonathan};
}

/** Copies a prompt shared with `session` the way the frontend does: open a prompt, then create and include each point. */
async function copy({api}: Lemma, session: Session, shared: Check) {
  const {name, points} = ok(await api.shared.show({session, check: shared}));
  const {check} = ok(await api.check.open({session, name}));
  for (const {pointName} of points) {
    const {cue} = ok(await api.point.create({session, name: pointName}));
    ok(await api.check.include({session, check, cue}));
  }
  return check;
}

describe("Sharing", () => {
  test("Matthew shares Explain Dijkstra with Jonathan, who reads it and copies it into his own prompts", async () => {
    const lemma = await startLemma();
    const {api} = lemma;
    const {matthew, jonathan} = await matthewSharesWithJonathan(lemma);

    expect(ok(await api.shared({session: jonathan.session})).shared).toEqual([
      {check: matthew.check, name: "Explain Dijkstra", ownerUsername: "Matthew"},
    ]);
    expect(ok(await api.shared.show({session: jonathan.session, check: matthew.check}))).toEqual({
      name: "Explain Dijkstra",
      ownerUsername: "Matthew",
      points: [{pointName: "Mitochondria make ATP"}, {pointName: "Ribosomes build proteins"}, {pointName: "F = ma"}],
    });
    expect(ok(await api.check.show({session: matthew.session, check: matthew.check})).recipients).toEqual([
      {username: "Jonathan"},
    ]);

    const copied = await copy(lemma, jonathan.session, matthew.check);

    const home = ok(await api.home({session: jonathan.session}));
    expect(home.myChecks).toEqual([{check: copied, name: "Explain Dijkstra", current: {attempt: null, status: null}}]);
    expect(home.myPoints.map(({pointName, category}) => ({pointName, category}))).toEqual([
      {pointName: "F = ma", category: null},
      {pointName: "Ribosomes build proteins", category: null},
      {pointName: "Mitochondria make ATP", category: null},
    ]);
    expect(ok(await api.check.show({session: jonathan.session, check: copied})).subject.map((p) => p.pointName)).toEqual([
      "Mitochondria make ATP", "Ribosomes build proteins", "F = ma",
    ]);
  });

  test("Matthew renames the prompt and adds a point after Jonathan copies it, and Jonathan's copy doesn't change", async () => {
    const lemma = await startLemma();
    const {api} = lemma;
    const {matthew, jonathan} = await matthewSharesWithJonathan(lemma);
    const copied = await copy(lemma, jonathan.session, matthew.check);
    const before = ok(await api.check.show({session: jonathan.session, check: copied}));

    ok(await api.check.rename({session: matthew.session, check: matthew.check, name: "Prove Dijkstra correct"}));
    const {cue} = ok(await api.point.create({session: matthew.session, name: "Relaxation"}));
    ok(await api.check.include({session: matthew.session, check: matthew.check, cue}));

    expect(ok(await api.check.show({session: jonathan.session, check: copied}))).toEqual(before);
    expect(ok(await api.shared.show({session: jonathan.session, check: matthew.check})).name).toEqual("Prove Dijkstra correct");
  });

  test("When Matthew stops sharing, Jonathan loses the shared prompt but keeps his copy", async () => {
    const lemma = await startLemma();
    const {api} = lemma;
    const {matthew, jonathan} = await matthewSharesWithJonathan(lemma);
    const copied = await copy(lemma, jonathan.session, matthew.check);

    expect(await api.check.unshare({session: matthew.session, check: matthew.check, username: "Jonathan"})).toEqual({check: matthew.check});

    expect(ok(await api.shared({session: jonathan.session})).shared).toEqual([]);
    expect(await api.shared.show({session: jonathan.session, check: matthew.check})).toEqual({error: "NOT_FOUND"});
    expect(ok(await api.home({session: jonathan.session})).myChecks.map((c) => c.check)).toEqual([copied]);
  });

  test("Sharing refuses unknown usernames and Matthew's own, and repeats succeed quietly", async () => {
    const lemma = await startLemma();
    const {api, register} = lemma;
    const {matthew, jonathan} = await matthewSharesWithJonathan(lemma);
    await register("Ada");
    const {session, check} = matthew;

    expect(await api.check.share({session, check, username: "Nobody"})).toEqual({error: "NO_SUCH_USER"});
    expect(await api.check.share({session, check, username: "Matthew"})).toEqual({error: "SHARE_WITH_SELF"});
    expect(await api.check.share({session, check, username: "Jonathan"})).toEqual({check});
    expect(ok(await api.shared({session: jonathan.session})).shared).toHaveLength(1);
    expect(await api.check.unshare({session, check, username: "Ada"})).toEqual({check});
    expect(await api.check.unshare({session, check, username: "Nobody"})).toEqual({check});
    expect(ok(await api.check.show({session, check})).recipients).toEqual([{username: "Jonathan"}]);
  });

  test("Jonathan can't share, unshare or see the recipients of Matthew's prompt, and Ada can't read it", async () => {
    const lemma = await startLemma();
    const {api, register} = lemma;
    const {matthew, jonathan} = await matthewSharesWithJonathan(lemma);
    const ada = await register("Ada");
    const before = ok(await api.check.show({session: matthew.session, check: matthew.check}));

    const {session} = jonathan;
    expect(await api.check.share({session, check: matthew.check, username: "Ada"})).toEqual({error: "NOT_FOUND"});
    expect(await api.check.unshare({session, check: matthew.check, username: "Jonathan"})).toEqual({error: "NOT_FOUND"});
    expect(await api.check.show({session, check: matthew.check})).toEqual({error: "NOT_FOUND"});
    expect(await api.shared.show({session: ada.session, check: matthew.check})).toEqual({error: "NOT_FOUND"});

    expect(ok(await api.check.show({session: matthew.session, check: matthew.check}))).toEqual(before);
  });

  test("Deleting a shared prompt takes it off every recipient's shared list", async () => {
    const lemma = await startLemma();
    const {api, register} = lemma;
    const {matthew, jonathan} = await matthewSharesWithJonathan(lemma);
    const ada = await register("Ada");
    ok(await api.check.share({session: matthew.session, check: matthew.check, username: "Ada"}));

    ok(await api.check.delete({session: matthew.session, check: matthew.check}));

    expect(ok(await api.shared({session: jonathan.session})).shared).toEqual([]);
    expect(ok(await api.shared({session: ada.session})).shared).toEqual([]);
  });

  test("every new sharing endpoint refuses a signed-out or made-up session with NOT_SIGNED_IN", async () => {
    const lemma = await startLemma();
    const {api} = lemma;
    const {matthew} = await matthewSharesWithJonathan(lemma);
    const {check} = matthew;
    ok(await api.auth.logout({session: matthew.session}));

    for (const session of [matthew.session, "made-up-session" as Session]) {
      const calls = [
        ["/check/share", () => api.check.share({session, check, username: "Jonathan"})],
        ["/check/unshare", () => api.check.unshare({session, check, username: "Jonathan"})],
        ["/shared", () => api.shared({session})],
        ["/shared/show", () => api.shared.show({session, check})],
      ] as const;
      for (const [path, call] of calls) {
        expect({path, result: await call()}).toEqual({path, result: {error: "NOT_SIGNED_IN"}});
      }
    }
  });
});
