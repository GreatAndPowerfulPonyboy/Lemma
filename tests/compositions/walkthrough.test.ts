import {describe, expect, test} from "bun:test";
import {startLemma} from "../support/app.ts";
import {ok} from "../support/reusable/results.ts";

type Lemma = Awaited<ReturnType<typeof startLemma>>;

/** Matthew registers and adds three points, none of them in a topic yet. */
async function matthewWithThreePoints({api, register}: Lemma) {
  const matthew = await register("Matthew");
  const {session} = matthew;
  const {cue: mitochondria} = ok(await api.point.create({session, name: "Mitochondria make ATP"}));
  const {cue: ribosomes} = ok(await api.point.create({session, name: "Ribosomes build proteins"}));
  const {cue: newton} = ok(await api.point.create({session, name: "F = ma"}));
  return {session, mitochondria, ribosomes, newton};
}

/** Matthew's three points, with biology and physics topics, and each point placed in one. */
async function matthewWithTopics(lemma: Lemma) {
  const {api} = lemma;
  const matthew = await matthewWithThreePoints(lemma);
  const {session} = matthew;
  const {category: biology} = ok(await api.topic.create({session, name: "Biology"}));
  const {category: physics} = ok(await api.topic.create({session, name: "Physics"}));
  ok(await api.point.move({session, cue: matthew.mitochondria, incidentCategory: biology}));
  ok(await api.point.move({session, cue: matthew.ribosomes, incidentCategory: biology}));
  ok(await api.point.move({session, cue: matthew.newton, incidentCategory: physics}));
  return {...matthew, biology, physics};
}

describe("Lemma", () => {
  test("Matthew adds points, files them under topics, renames some, then deletes all his points and topics", async () => {
    const lemma = await startLemma();
    const {api} = lemma;
    const {session, mitochondria, ribosomes, newton} = await matthewWithThreePoints(lemma);

    expect(ok(await api.home({session}))).toEqual({
      myPoints: [
        {cue: newton, pointName: "F = ma", category: null, topicName: null},
        {cue: ribosomes, pointName: "Ribosomes build proteins", category: null, topicName: null},
        {cue: mitochondria, pointName: "Mitochondria make ATP", category: null, topicName: null},
      ],
      myTopics: [],
    });

    const {category: biology} = ok(await api.topic.create({session, name: "Biology"}));
    const {category: physics} = ok(await api.topic.create({session, name: "Physics"}));
    ok(await api.point.move({session, cue: mitochondria, incidentCategory: biology}));
    ok(await api.point.move({session, cue: ribosomes, incidentCategory: biology}));
    ok(await api.point.move({session, cue: newton, incidentCategory: physics}));

    expect(ok(await api.home({session}))).toEqual({
      myPoints: [
        {cue: newton, pointName: "F = ma", category: physics, topicName: "Physics"},
        {cue: ribosomes, pointName: "Ribosomes build proteins", category: biology, topicName: "Biology"},
        {cue: mitochondria, pointName: "Mitochondria make ATP", category: biology, topicName: "Biology"},
      ],
      myTopics: [
        {category: biology, name: "Biology"},
        {category: physics, name: "Physics"},
      ],
    });

    ok(await api.point.rename({session, cue: newton, name: "Newton's second law: F = ma"}));
    ok(await api.topic.rename({session, category: biology, newName: "Cell biology"}));

    expect(ok(await api.home({session}))).toEqual({
      myPoints: [
        {cue: newton, pointName: "Newton's second law: F = ma", category: physics, topicName: "Physics"},
        {cue: ribosomes, pointName: "Ribosomes build proteins", category: biology, topicName: "Cell biology"},
        {cue: mitochondria, pointName: "Mitochondria make ATP", category: biology, topicName: "Cell biology"},
      ],
      myTopics: [
        {category: biology, name: "Cell biology"},
        {category: physics, name: "Physics"},
      ],
    });

    for (const cue of [mitochondria, ribosomes, newton]) ok(await api.point.delete({session, cue}));

    expect(ok(await api.home({session}))).toEqual({
      myPoints: [],
      myTopics: [
        {category: biology, name: "Cell biology"},
        {category: physics, name: "Physics"},
      ],
    });

    ok(await api.topic.delete({session, category: biology}));
    ok(await api.topic.delete({session, category: physics}));
    expect(ok(await api.home({session}))).toEqual({myPoints: [], myTopics: []});
  });

  test("Jonathan cannot delete, rename, or move Matthew's points and topics, or add to Matthew's topics", async () => {
    const lemma = await startLemma();
    const {api, register} = lemma;
    const matthew = await matthewWithTopics(lemma);
    const before = ok(await api.home({session: matthew.session}));

    const {session} = await register("Jonathan");
    const {category: jonathansTopic} = ok(await api.topic.create({session, name: "Biology"}));
    const {cue: jonathansPoint} = ok(await api.point.create({session, name: "Cells divide by mitosis"}));

    expect(await api.point.delete({session, cue: matthew.newton})).toEqual({error: "NOT_FOUND"});
    expect(await api.topic.delete({session, category: matthew.physics})).toEqual({error: "NOT_FOUND"});
    expect(await api.point.rename({session, cue: matthew.newton, name: "Wrong"})).toEqual({error: "NOT_FOUND"});
    expect(await api.topic.rename({session, category: matthew.biology, newName: "Wrong"})).toEqual({error: "NOT_FOUND"});

    expect(await api.point.unplace({session, cue: matthew.mitochondria})).toEqual({error: "NOT_FOUND"});
    expect(await api.point.move({session, cue: matthew.mitochondria, incidentCategory: jonathansTopic})).toEqual({error: "NOT_FOUND"});
    expect(await api.point.move({session, cue: matthew.mitochondria, incidentCategory: matthew.physics})).toEqual({error: "NOT_FOUND"});
    expect(await api.point.move({session, cue: jonathansPoint, incidentCategory: matthew.biology})).toEqual({error: "NOT_FOUND"});
    expect(await api.point.createIn({session, name: "Sneaky point", category: matthew.biology})).toEqual({error: "NOT_FOUND"});

    expect(ok(await api.home({session: matthew.session}))).toEqual(before);
    expect(ok(await api.home({session}))).toEqual({
      myPoints: [{cue: jonathansPoint, pointName: "Cells divide by mitosis", category: null, topicName: null}],
      myTopics: [{category: jonathansTopic, name: "Biology"}],
    });
  });

  test("Matthew empties his Biology topic, so its points become unsorted and the topic can be deleted", async () => {
    const lemma = await startLemma();
    const {api} = lemma;
    const {session, mitochondria, ribosomes, newton, biology, physics} = await matthewWithTopics(lemma);

    expect(await api.topic.delete({session, category: biology})).toEqual({error: "CATEGORY_NOT_EMPTY"});
    ok(await api.point.unplace({session, cue: mitochondria}));
    ok(await api.point.unplace({session, cue: ribosomes}));
    expect(await api.point.unplace({session, cue: ribosomes})).toEqual({error: "NOT_PLACED"});
    ok(await api.topic.delete({session, category: biology}));

    expect(ok(await api.home({session}))).toEqual({
      myPoints: [
        {cue: newton, pointName: "F = ma", category: physics, topicName: "Physics"},
        {cue: ribosomes, pointName: "Ribosomes build proteins", category: null, topicName: null},
        {cue: mitochondria, pointName: "Mitochondria make ATP", category: null, topicName: null},
      ],
      myTopics: [{category: physics, name: "Physics"}],
    });
  });

  test("after Matthew signs out, his session has ended and only his own password signs him back in", async () => {
    const lemma = await startLemma();
    const {api} = lemma;
    const matthew = await matthewWithTopics(lemma);
    const before = ok(await api.home({session: matthew.session}));
    ok(await api.auth.register({username: "Jonathan", password: "jonathans password"}));

    ok(await api.auth.logout({session: matthew.session}));
    expect(await api.auth.me({session: matthew.session})).toEqual({error: "NOT_SIGNED_IN"});
    expect(await api.home({session: matthew.session})).toEqual({error: "NOT_SIGNED_IN"});

    expect(await api.auth.login({username: "Matthew", password: "jonathans password"})).toEqual({error: "INVALID_CREDENTIALS"});
    expect(await api.auth.login({username: "Matthew", password: "wrong password"})).toEqual({error: "INVALID_CREDENTIALS"});

    const {session} = ok(await api.auth.login({username: "Matthew", password: "correct horse"}));
    expect(await api.auth.me({session})).toEqual({username: "Matthew"});
    expect(ok(await api.home({session}))).toEqual(before);
  });
});

describe("Refusals", () => {
  const tooLong = "x".repeat(101);

  test("a point name that is too long is refused with INVALID_NAME", async () => {
    const lemma = await startLemma();
    const {api} = lemma;
    const {session, newton} = await matthewWithThreePoints(lemma);
    expect(await api.point.create({session, name: tooLong})).toEqual({error: "INVALID_NAME"});
    expect(await api.point.rename({session, cue: newton, name: tooLong})).toEqual({error: "INVALID_NAME"});
  });

  test("a topic name that is too long is refused with INVALID_CATEGORY", async () => {
    const lemma = await startLemma();
    const {api} = lemma;
    const {session, biology} = await matthewWithTopics(lemma);
    expect(await api.topic.create({session, name: tooLong})).toEqual({error: "INVALID_CATEGORY"});
    expect(await api.topic.rename({session, category: biology, newName: tooLong})).toEqual({error: "INVALID_CATEGORY"});
  });
});
