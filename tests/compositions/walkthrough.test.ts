import {describe, expect, test} from "bun:test";
import type {Category} from "../../src/concepts/Categorizing/Categorizing.ts";
import type {Cue} from "../../src/concepts/Cueing/Cueing.ts";
import type {Session} from "../../src/concepts/Sessioning/Sessioning.ts";
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
    expect(await api.point.unplace({session, cue: ribosomes})).toEqual({cue: ribosomes});
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

describe("Access", () => {
  /**
   * One call to each of the nine write endpoints as `session`, naming Matthew's real points and topics, each
   * with its path so a failing assertion says which endpoint it was.
   */
  function everyWrite(api: Lemma["api"], session: Session, {newton, biology, physics}: {newton: Cue, biology: Category, physics: Category}) {
    return [
      ["/point/create", () => api.point.create({session, name: "A new point"})],
      ["/point/createIn", () => api.point.createIn({session, name: "A new point", category: biology})],
      ["/point/rename", () => api.point.rename({session, cue: newton, name: "Renamed"})],
      ["/point/delete", () => api.point.delete({session, cue: newton})],
      ["/point/move", () => api.point.move({session, cue: newton, incidentCategory: biology})],
      ["/point/unplace", () => api.point.unplace({session, cue: newton})],
      ["/topic/create", () => api.topic.create({session, name: "Chemistry"})],
      ["/topic/rename", () => api.topic.rename({session, category: physics, newName: "Renamed"})],
      ["/topic/delete", () => api.topic.delete({session, category: physics})],
    ] as const;
  }

  test("every write endpoint refuses a signed-out or made-up session with NOT_SIGNED_IN and changes nothing", async () => {
    const lemma = await startLemma();
    const {api} = lemma;
    const matthew = await matthewWithTopics(lemma);
    const before = ok(await api.home({session: matthew.session}));

    ok(await api.auth.logout({session: matthew.session}));
    for (const session of [matthew.session, "made-up-session" as Session]) {
      for (const [path, write] of everyWrite(api, session, matthew)) {
        expect({path, result: await write()}).toEqual({path, result: {error: "NOT_SIGNED_IN"}});
      }
    }

    const {session} = ok(await api.auth.login({username: "Matthew", password: "correct horse"}));
    expect(ok(await api.home({session}))).toEqual(before);
  });

  test("a point or topic Matthew deleted is NOT_FOUND for every endpoint that names it", async () => {
    const lemma = await startLemma();
    const {api} = lemma;
    const {session, mitochondria, newton, biology, physics} = await matthewWithTopics(lemma);
    ok(await api.point.delete({session, cue: newton}));
    ok(await api.topic.delete({session, category: physics}));
    const before = ok(await api.home({session}));

    expect(await api.point.rename({session, cue: newton, name: "Renamed"})).toEqual({error: "NOT_FOUND"});
    expect(await api.point.delete({session, cue: newton})).toEqual({error: "NOT_FOUND"});
    expect(await api.point.move({session, cue: newton, incidentCategory: biology})).toEqual({error: "NOT_FOUND"});
    expect(await api.point.unplace({session, cue: newton})).toEqual({error: "NOT_FOUND"});
    expect(await api.point.move({session, cue: mitochondria, incidentCategory: physics})).toEqual({error: "NOT_FOUND"});
    expect(await api.point.createIn({session, name: "A new point", category: physics})).toEqual({error: "NOT_FOUND"});
    expect(await api.topic.rename({session, category: physics, newName: "Renamed"})).toEqual({error: "NOT_FOUND"});
    expect(await api.topic.delete({session, category: physics})).toEqual({error: "NOT_FOUND"});

    expect(ok(await api.home({session}))).toEqual(before);
  });

  test("IDs that were never issued are NOT_FOUND, not an error, for every endpoint that takes a point or topic", async () => {
    const lemma = await startLemma();
    const {api} = lemma;
    const {session, mitochondria, biology} = await matthewWithTopics(lemma);
    const before = ok(await api.home({session}));

    for (const id of ["not-an-id", "", "000000000000000000000000", '{"$ne": null}']) {
      const cue = id as Cue, category = id as Category;
      const calls = [
        ["/point/rename", () => api.point.rename({session, cue, name: "Renamed"})],
        ["/point/delete", () => api.point.delete({session, cue})],
        ["/point/move (point)", () => api.point.move({session, cue, incidentCategory: biology})],
        ["/point/move (topic)", () => api.point.move({session, cue: mitochondria, incidentCategory: category})],
        ["/point/unplace", () => api.point.unplace({session, cue})],
        ["/point/createIn", () => api.point.createIn({session, name: "A new point", category})],
        ["/topic/rename", () => api.topic.rename({session, category, newName: "Renamed"})],
        ["/topic/delete", () => api.topic.delete({session, category})],
      ] as const;
      for (const [path, call] of calls) {
        expect({path, id, result: await call()}).toEqual({path, id, result: {error: "NOT_FOUND"}});
      }
    }

    expect(ok(await api.home({session}))).toEqual(before);
  });

  test("Matthew and Jonathan can each have topics with the same names, and each sees only his own", async () => {
    const lemma = await startLemma();
    const {api, register} = lemma;
    const matthew = await matthewWithTopics(lemma);
    const matthewsHome = ok(await api.home({session: matthew.session}));

    const {session} = await register("Jonathan");
    const {category: jonathansBiology} = ok(await api.topic.create({session, name: "Biology"}));
    const {category: jonathansPhysics} = ok(await api.topic.create({session, name: "Mechanics"}));
    ok(await api.topic.rename({session, category: jonathansPhysics, newName: "Physics"}));
    const {cue: jonathansPoint} = ok(await api.point.createIn({session, name: "Cells divide by mitosis", category: jonathansBiology}));

    expect(ok(await api.home({session}))).toEqual({
      myPoints: [{cue: jonathansPoint, pointName: "Cells divide by mitosis", category: jonathansBiology, topicName: "Biology"}],
      myTopics: [
        {category: jonathansBiology, name: "Biology"},
        {category: jonathansPhysics, name: "Physics"},
      ],
    });
    expect(ok(await api.home({session: matthew.session}))).toEqual(matthewsHome);
  });
});

describe("Refusals", () => {
  const longest = (letter: string) => letter.repeat(80);
  const tooLong = "x".repeat(81);

  test("a point name of 80 characters is accepted and 81 is refused with INVALID_NAME, on create, createIn and rename", async () => {
    const lemma = await startLemma();
    const {api} = lemma;
    const {session, newton, biology} = await matthewWithTopics(lemma);

    const {cue: created} = ok(await api.point.create({session, name: longest("a")}));
    const {cue: createdIn} = ok(await api.point.createIn({session, name: longest("b"), category: biology}));
    ok(await api.point.rename({session, cue: newton, name: longest("c")}));
    const before = ok(await api.home({session}));
    expect(before.myPoints).toEqual(expect.arrayContaining([
      expect.objectContaining({cue: created, pointName: longest("a")}),
      expect.objectContaining({cue: createdIn, pointName: longest("b")}),
      expect.objectContaining({cue: newton, pointName: longest("c")}),
    ]));

    expect(await api.point.create({session, name: tooLong})).toEqual({error: "INVALID_NAME"});
    expect(await api.point.createIn({session, name: tooLong, category: biology})).toEqual({error: "INVALID_NAME"});
    expect(await api.point.rename({session, cue: newton, name: tooLong})).toEqual({error: "INVALID_NAME"});
    expect(ok(await api.home({session}))).toEqual(before);
  });

  test("a topic name of 80 characters is accepted and 81 is refused with INVALID_CATEGORY, on create and rename", async () => {
    const lemma = await startLemma();
    const {api} = lemma;
    const {session, biology} = await matthewWithTopics(lemma);

    const {category: created} = ok(await api.topic.create({session, name: longest("a")}));
    ok(await api.topic.rename({session, category: biology, newName: longest("b")}));
    const before = ok(await api.home({session}));
    expect(before.myTopics).toEqual(expect.arrayContaining([
      {category: created, name: longest("a")},
      {category: biology, name: longest("b")},
    ]));

    expect(await api.topic.create({session, name: tooLong})).toEqual({error: "INVALID_CATEGORY"});
    expect(await api.topic.rename({session, category: biology, newName: tooLong})).toEqual({error: "INVALID_CATEGORY"});
    expect(ok(await api.home({session}))).toEqual(before);
  });

  test("blank names are refused on point create, createIn and rename and on topic create and rename", async () => {
    const lemma = await startLemma();
    const {api} = lemma;
    const {session, newton, biology} = await matthewWithTopics(lemma);
    const before = ok(await api.home({session}));

    for (const blank of ["", "   "]) {
      expect(await api.point.create({session, name: blank})).toEqual({error: "INVALID_NAME"});
      expect(await api.point.createIn({session, name: blank, category: biology})).toEqual({error: "INVALID_NAME"});
      expect(await api.point.rename({session, cue: newton, name: blank})).toEqual({error: "INVALID_NAME"});
      expect(await api.topic.create({session, name: blank})).toEqual({error: "INVALID_CATEGORY"});
      expect(await api.topic.rename({session, category: biology, newName: blank})).toEqual({error: "INVALID_CATEGORY"});
    }

    expect(ok(await api.home({session}))).toEqual(before);
  });

  test("accepted names are stored trimmed", async () => {
    const lemma = await startLemma();
    const {api} = lemma;
    const {session, newton, biology} = await matthewWithTopics(lemma);

    const {category: chemistry} = ok(await api.topic.create({session, name: "  Chemistry  "}));
    const {cue: krebs} = ok(await api.point.create({session, name: "  Krebs cycle  "}));
    ok(await api.point.rename({session, cue: newton, name: "  Newton's second law  "}));
    ok(await api.topic.rename({session, category: biology, newName: "  Cell biology  "}));

    const home = ok(await api.home({session}));
    expect(home.myTopics).toEqual(expect.arrayContaining([
      {category: chemistry, name: "Chemistry"},
      {category: biology, name: "Cell biology"},
    ]));
    expect(home.myPoints).toEqual(expect.arrayContaining([
      expect.objectContaining({cue: krebs, pointName: "Krebs cycle"}),
      expect.objectContaining({cue: newton, pointName: "Newton's second law"}),
    ]));
  });

  test("a topic name Matthew already uses is refused with CATEGORY_EXISTS, on create and on rename", async () => {
    const lemma = await startLemma();
    const {api} = lemma;
    const {session, physics} = await matthewWithTopics(lemma);
    const before = ok(await api.home({session}));

    expect(await api.topic.create({session, name: "Biology"})).toEqual({error: "CATEGORY_EXISTS"});
    expect(await api.topic.create({session, name: "  Biology "})).toEqual({error: "CATEGORY_EXISTS"});
    expect(await api.topic.rename({session, category: physics, newName: "Biology"})).toEqual({error: "CATEGORY_EXISTS"});

    expect(ok(await api.home({session}))).toEqual(before);
  });

  test("topic names that differ only in capitalization are different topics", async () => {
    const lemma = await startLemma();
    const {api} = lemma;
    const {session, biology} = await matthewWithTopics(lemma);

    const {category: lower} = ok(await api.topic.create({session, name: "biology"}));
    const {category: upper} = ok(await api.topic.create({session, name: "BIOLOGY"}));

    expect(ok(await api.home({session})).myTopics).toEqual(expect.arrayContaining([
      {category: biology, name: "Biology"},
      {category: lower, name: "biology"},
      {category: upper, name: "BIOLOGY"},
    ]));
  });
});

describe("Repeating an action", () => {
  test("moving a point into the topic it's already in succeeds quietly and changes nothing", async () => {
    const lemma = await startLemma();
    const {api} = lemma;
    const {session, mitochondria, biology} = await matthewWithTopics(lemma);
    const before = ok(await api.home({session}));

    expect(await api.point.move({session, cue: mitochondria, incidentCategory: biology})).toEqual({cue: mitochondria});
    expect(ok(await api.home({session}))).toEqual(before);
  });

  test("moving three points into Physics succeeds for all of them, even though one is already there", async () => {
    const lemma = await startLemma();
    const {api} = lemma;
    const {session, mitochondria, ribosomes, newton, physics} = await matthewWithTopics(lemma);

    for (const cue of [mitochondria, ribosomes, newton]) {
      expect(await api.point.move({session, cue, incidentCategory: physics})).toEqual({cue});
    }
    expect(ok(await api.home({session})).myPoints.map((p) => p.topicName)).toEqual(["Physics", "Physics", "Physics"]);
  });

  test("renaming a topic or a point to the name it already has succeeds quietly and changes nothing", async () => {
    const lemma = await startLemma();
    const {api} = lemma;
    const {session, newton, biology} = await matthewWithTopics(lemma);
    const before = ok(await api.home({session}));

    expect(await api.topic.rename({session, category: biology, newName: "Biology"})).toEqual({category: biology});
    expect(await api.topic.rename({session, category: biology, newName: "  Biology  "})).toEqual({category: biology});
    expect(await api.point.rename({session, cue: newton, name: "F = ma"})).toEqual({cue: newton});
    expect(ok(await api.home({session}))).toEqual(before);
  });
});
