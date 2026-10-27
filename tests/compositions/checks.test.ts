import {describe, expect, test} from "bun:test";
import type {Session} from "../../src/concepts/Sessioning/Sessioning.ts";
import {startLemma} from "../support/app.ts";
import {ok} from "../support/reusable/results.ts";
import {matthewWithPrompt, matthewWithTopics} from "../support/matthew.ts";

describe("Prompts", () => {
  test("Matthew attempts Explain Dijkstra, marks two of three points mentioned, and closes it with 2/3 credit", async () => {
    const lemma = await startLemma();
    const {api} = lemma;
    const {session, check, mitochondria, ribosomes, newton} = await matthewWithPrompt(lemma);

    const {attempt} = ok(await api.check.attempt({session, check}));
    ok(await api.attempt.submit({session, attempt}));
    ok(await api.attempt.mention({session, attempt, cue: mitochondria}));
    ok(await api.attempt.mention({session, attempt, cue: newton}));
    expect(await api.attempt.close({session, attempt})).toEqual({credit: 2 / 3});

    expect(ok(await api.check.show({session, check}))).toEqual({
      name: "Explain Dijkstra",
      subject: [
        {cue: mitochondria, pointName: "Mitochondria make ATP"},
        {cue: ribosomes, pointName: "Ribosomes build proteins"},
        {cue: newton, pointName: "F = ma"},
      ],
      current: null,
      attempts: [{attempt, status: "CLOSED", credit: 2 / 3}],
      recipients: [],
      schedule: {tracked: false, due: null},
    });
    expect(ok(await api.attempt.show({session, attempt}))).toEqual({
      check,
      checkName: "Explain Dijkstra",
      status: "CLOSED",
      credit: 2 / 3,
      subject: [
        {cue: mitochondria, pointName: "Mitochondria make ATP"},
        {cue: ribosomes, pointName: "Ribosomes build proteins"},
        {cue: newton, pointName: "F = ma"},
      ],
      mentioned: [
        {cue: mitochondria, pointName: "Mitochondria make ATP", answer: null},
        {cue: newton, pointName: "F = ma", answer: null},
      ],
      omitted: [{cue: ribosomes, pointName: "Ribosomes build proteins", answer: null}],
    });
    expect(ok(await api.home({session})).myChecks).toEqual([{check, name: "Explain Dijkstra", current: {attempt: null, status: null}, pointCount: 3}]);
  });

  test("Matthew can't start a second attempt while one is unfinished, until he abandons it", async () => {
    const lemma = await startLemma();
    const {api} = lemma;
    const {session, check} = await matthewWithPrompt(lemma);
    // A closed attempt first, so abandoning the next one keeps the prompt.
    const {attempt: first} = ok(await api.check.attempt({session, check}));
    ok(await api.attempt.submit({session, attempt: first}));
    ok(await api.attempt.close({session, attempt: first}));

    const {attempt} = ok(await api.check.attempt({session, check}));
    expect(ok(await api.check.show({session, check})).current).toEqual({attempt, status: "OPEN"});
    expect(await api.check.attempt({session, check})).toEqual({error: "ATTEMPT_IN_PROGRESS"});
    ok(await api.attempt.submit({session, attempt}));
    expect(await api.check.attempt({session, check})).toEqual({error: "ATTEMPT_IN_PROGRESS"});
    expect(ok(await api.home({session})).myChecks).toEqual([{check, name: "Explain Dijkstra", current: {attempt, status: "GRADED"}, pointCount: 3}]);

    ok(await api.attempt.abandon({session, attempt}));
    const {attempt: next} = ok(await api.check.attempt({session, check}));
    expect(ok(await api.check.show({session, check})).attempts).toEqual([
      {attempt: next, status: "OPEN", credit: 0},
      {attempt, status: "ABANDONED", credit: 0},
      {attempt: first, status: "CLOSED", credit: 0},
    ]);
  });

  test("Deleting a point takes it out of every prompt, but an earlier attempt still lists it by name", async () => {
    const lemma = await startLemma();
    const {api} = lemma;
    const {session, check, mitochondria, ribosomes, newton} = await matthewWithPrompt(lemma);
    const {check: physics} = ok(await api.check.open({session, name: "Explain Newton"}));
    ok(await api.check.include({session, check: physics, cue: newton}));
    const {attempt} = ok(await api.check.attempt({session, check}));

    ok(await api.point.delete({session, cue: newton}));

    expect(ok(await api.check.show({session, check})).subject).toEqual([
      {cue: mitochondria, pointName: "Mitochondria make ATP"},
      {cue: ribosomes, pointName: "Ribosomes build proteins"},
    ]);
    expect(ok(await api.check.show({session, check: physics})).subject).toEqual([]);
    expect(ok(await api.attempt.show({session, attempt})).subject).toEqual([
      {cue: mitochondria, pointName: "Mitochondria make ATP"},
      {cue: ribosomes, pointName: "Ribosomes build proteins"},
      {cue: newton, pointName: "F = ma"},
    ]);
  });

  test("Renaming a point renames it in the prompt, while an attempt already begun keeps the old name", async () => {
    const lemma = await startLemma();
    const {api} = lemma;
    const {session, check, newton} = await matthewWithPrompt(lemma);
    const {attempt} = ok(await api.check.attempt({session, check}));

    ok(await api.point.rename({session, cue: newton, name: "  Newton's second law  "}));

    expect(ok(await api.check.show({session, check})).subject).toContainEqual({cue: newton, pointName: "Newton's second law"});
    expect(ok(await api.attempt.show({session, attempt})).subject).toContainEqual({cue: newton, pointName: "F = ma"});
  });

  test("Marking a point before submitting is NOT_GRADED, and marking one outside the attempt is NOT_IN_SUBJECT", async () => {
    const lemma = await startLemma();
    const {api} = lemma;
    const {session, check, mitochondria} = await matthewWithPrompt(lemma);
    const {cue: outsider} = ok(await api.point.create({session, name: "Not in the prompt"}));
    const {attempt} = ok(await api.check.attempt({session, check}));

    expect(await api.attempt.mention({session, attempt, cue: mitochondria})).toEqual({error: "NOT_GRADED"});
    ok(await api.attempt.submit({session, attempt}));
    expect(await api.attempt.mention({session, attempt, cue: outsider})).toEqual({error: "NOT_IN_SUBJECT"});
    expect(ok(await api.attempt.show({session, attempt})).mentioned).toEqual([]);
  });

  test("A prompt's name must have 1 to 200 characters once trimmed", async () => {
    const lemma = await startLemma();
    const {api} = lemma;
    const {session} = await matthewWithTopics(lemma);

    expect(await api.check.open({session, name: "   "})).toEqual({error: "INVALID_NAME"});
    expect(await api.check.open({session, name: "x".repeat(201)})).toEqual({error: "INVALID_NAME"});
    const {check} = ok(await api.check.open({session, name: "x".repeat(200)}));
    expect(ok(await api.home({session})).myChecks).toEqual([{check, name: "x".repeat(200), current: {attempt: null, status: null}, pointCount: 0}]);
  });

  test("Deleting a prompt deletes its attempts and takes it off the home screen", async () => {
    const lemma = await startLemma();
    const {api} = lemma;
    const {session, check} = await matthewWithPrompt(lemma);
    const {attempt} = ok(await api.check.attempt({session, check}));

    expect(await api.check.delete({session, check})).toEqual({check});
    expect(await api.attempt.show({session, attempt})).toEqual({error: "NOT_FOUND"});
    expect(await api.check.show({session, check})).toEqual({error: "NOT_FOUND"});
    expect(ok(await api.home({session})).myChecks).toEqual([]);
  });

  test("Deleting every point of a prompt leaves it on the home screen as empty, and it can't be started until it has a point", async () => {
    const lemma = await startLemma();
    const {api} = lemma;
    const {session, check, mitochondria, ribosomes, newton} = await matthewWithPrompt(lemma);

    for (const cue of [mitochondria, ribosomes, newton]) ok(await api.point.delete({session, cue}));

    expect(ok(await api.home({session})).myChecks).toEqual([
      {check, name: "Explain Dijkstra", current: {attempt: null, status: null}, pointCount: 0},
    ]);
    expect(ok(await api.check.show({session, check})).subject).toEqual([]);
    expect(await api.check.attempt({session, check})).toEqual({error: "EMPTY_PROMPT"});

    const {cue} = ok(await api.point.create({session, name: "Dijkstra's invariant"}));
    ok(await api.check.include({session, check, cue}));
    expect(await api.check.attempt({session, check})).toHaveProperty("attempt");
  });

  test("An attempt started before its prompt's points were deleted can still be submitted and closed", async () => {
    const lemma = await startLemma();
    const {api} = lemma;
    const {session, check, mitochondria, ribosomes, newton} = await matthewWithPrompt(lemma);
    const {attempt} = ok(await api.check.attempt({session, check}));

    for (const cue of [mitochondria, ribosomes, newton]) ok(await api.point.delete({session, cue}));

    ok(await api.attempt.submit({session, attempt}));
    ok(await api.attempt.mention({session, attempt, cue: newton}));
    expect(await api.attempt.close({session, attempt})).toEqual({credit: 1 / 3});
  });
});

describe("Abandoning a prompt", () => {
  test("Matthew opens a prompt, attempts it and abandons it, so the prompt is deleted", async () => {
    const lemma = await startLemma();
    const {api} = lemma;
    const {session, check} = await matthewWithPrompt(lemma);
    const {attempt} = ok(await api.check.attempt({session, check}));

    expect(await api.attempt.abandon({session, attempt})).toEqual({attempt, deleted: true});
    expect(ok(await api.home({session})).myChecks).toEqual([]);
    expect(await api.check.show({session, check})).toEqual({error: "NOT_FOUND"});
  });

  test("Matthew closes an attempt, then abandons the next one, and the prompt stays with both in its history", async () => {
    const lemma = await startLemma();
    const {api} = lemma;
    const {session, check} = await matthewWithPrompt(lemma);
    const {attempt: first} = ok(await api.check.attempt({session, check}));
    ok(await api.attempt.submit({session, attempt: first}));
    ok(await api.attempt.close({session, attempt: first}));
    const {attempt: second} = ok(await api.check.attempt({session, check}));

    expect(await api.attempt.abandon({session, attempt: second})).toEqual({attempt: second, deleted: false});
    expect(ok(await api.check.show({session, check})).attempts).toEqual([
      {attempt: second, status: "ABANDONED", credit: 0},
      {attempt: first, status: "CLOSED", credit: 0},
    ]);
    expect(ok(await api.home({session})).myChecks).toEqual([{check, name: "Explain Dijkstra", current: {attempt: null, status: null}, pointCount: 3}]);
  });

  test("Abandoning a new prompt that was shared and added to Scheduling takes it off Jonathan's Shared tab and the schedule", async () => {
    const lemma = await startLemma();
    const {api, register} = lemma;
    const {session, check} = await matthewWithPrompt(lemma);
    const jonathan = await register("Jonathan");
    ok(await api.check.share({session, check, username: "Jonathan"}));
    ok(await api.check.track({session, check}));
    expect(ok(await api.shared({session: jonathan.session})).shared.map((s) => s.check)).toEqual([check]);
    expect(ok(await api.home({session})).dueChecks.map((c) => c.check)).toEqual([check]);
    const {attempt} = ok(await api.check.attempt({session, check}));

    expect(await api.attempt.abandon({session, attempt})).toEqual({attempt, deleted: true});
    expect(ok(await api.shared({session: jonathan.session})).shared).toEqual([]);
    expect(ok(await api.home({session})).dueChecks).toEqual([]);
  });
});

describe("Prompt access", () => {
  test("Jonathan gets NOT_FOUND for everything he tries with Matthew's prompt and attempt, and nothing changes", async () => {
    const lemma = await startLemma();
    const {api, register} = lemma;
    const matthew = await matthewWithPrompt(lemma);
    const {attempt} = ok(await api.check.attempt({session: matthew.session, check: matthew.check}));
    ok(await api.attempt.submit({session: matthew.session, attempt}));
    const before = {
      home: ok(await api.home({session: matthew.session})),
      check: ok(await api.check.show({session: matthew.session, check: matthew.check})),
      attempt: ok(await api.attempt.show({session: matthew.session, attempt})),
    };

    const {session} = await register("Jonathan");
    const {cue: jonathansPoint} = ok(await api.point.create({session, name: "Cells divide by mitosis"}));
    const {check: jonathansCheck} = ok(await api.check.open({session, name: "Explain mitosis"}));
    const calls = [
      ["/check/include (his point)", () => api.check.include({session, check: matthew.check, cue: jonathansPoint})],
      ["/check/include (his check)", () => api.check.include({session, check: jonathansCheck, cue: matthew.newton})],
      ["/check/attempt", () => api.check.attempt({session, check: matthew.check})],
      ["/attempt/submit", () => api.attempt.submit({session, attempt})],
      ["/attempt/mention", () => api.attempt.mention({session, attempt, cue: matthew.newton})],
      ["/attempt/close", () => api.attempt.close({session, attempt})],
      ["/attempt/abandon", () => api.attempt.abandon({session, attempt})],
      ["/check/rename", () => api.check.rename({session, check: matthew.check, name: "Mine now"})],
      ["/check/delete", () => api.check.delete({session, check: matthew.check})],
      ["/check/show", () => api.check.show({session, check: matthew.check})],
      ["/attempt/show", () => api.attempt.show({session, attempt})],
    ] as const;
    for (const [path, call] of calls) {
      expect({path, result: await call()}).toEqual({path, result: {error: "NOT_FOUND"}});
    }

    expect({
      home: ok(await api.home({session: matthew.session})),
      check: ok(await api.check.show({session: matthew.session, check: matthew.check})),
      attempt: ok(await api.attempt.show({session: matthew.session, attempt})),
    }).toEqual(before);
  });

  test("every new prompt endpoint refuses a signed-out or made-up session with NOT_SIGNED_IN", async () => {
    const lemma = await startLemma();
    const {api} = lemma;
    const {session: matthewsSession, check, newton} = await matthewWithPrompt(lemma);
    const {attempt} = ok(await api.check.attempt({session: matthewsSession, check}));
    ok(await api.auth.logout({session: matthewsSession}));

    for (const session of [matthewsSession, "made-up-session" as Session]) {
      const calls = [
        ["/check/open", () => api.check.open({session, name: "Explain heaps"})],
        ["/check/rename", () => api.check.rename({session, check, name: "Renamed"})],
        ["/check/delete", () => api.check.delete({session, check})],
        ["/check/include", () => api.check.include({session, check, cue: newton})],
        ["/check/exclude", () => api.check.exclude({session, check, cue: newton})],
        ["/check/attempt", () => api.check.attempt({session, check})],
        ["/check/show", () => api.check.show({session, check})],
        ["/attempt/submit", () => api.attempt.submit({session, attempt})],
        ["/attempt/mention", () => api.attempt.mention({session, attempt, cue: newton})],
        ["/attempt/omit", () => api.attempt.omit({session, attempt, cue: newton})],
        ["/attempt/close", () => api.attempt.close({session, attempt})],
        ["/attempt/abandon", () => api.attempt.abandon({session, attempt})],
        ["/attempt/show", () => api.attempt.show({session, attempt})],
      ] as const;
      for (const [path, call] of calls) {
        expect({path, result: await call()}).toEqual({path, result: {error: "NOT_SIGNED_IN"}});
      }
    }
  });
});

describe("Repeating a prompt action", () => {
  test("including a point twice, or excluding one that isn't there, succeeds quietly and changes nothing", async () => {
    const lemma = await startLemma();
    const {api} = lemma;
    const {session, check, newton} = await matthewWithPrompt(lemma);
    const {cue: outsider} = ok(await api.point.create({session, name: "Not in the prompt"}));
    const before = ok(await api.check.show({session, check}));

    expect(await api.check.include({session, check, cue: newton})).toEqual({check});
    expect(await api.check.exclude({session, check, cue: outsider})).toEqual({check});
    expect(ok(await api.check.show({session, check}))).toEqual(before);
  });
});
