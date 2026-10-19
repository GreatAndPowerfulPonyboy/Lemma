import {startLemma} from "./app.ts";
import {ok} from "./reusable/results.ts";

export type Lemma = Awaited<ReturnType<typeof startLemma>>;

/** Matthew registers and adds three points, none of them in a topic yet. */
export async function matthewWithThreePoints({api, register}: Lemma) {
  const matthew = await register("Matthew");
  const {session} = matthew;
  const {cue: mitochondria} = ok(await api.point.create({session, name: "Mitochondria make ATP"}));
  const {cue: ribosomes} = ok(await api.point.create({session, name: "Ribosomes build proteins"}));
  const {cue: newton} = ok(await api.point.create({session, name: "F = ma"}));
  return {session, mitochondria, ribosomes, newton};
}

/** Matthew's three points, with biology and physics topics, and each point placed in one. */
export async function matthewWithTopics(lemma: Lemma) {
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
