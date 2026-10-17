import { assembleApplication } from "./src/assembly.ts";
import { httpWire } from "@mit-sdg/sync-engine-http/tooling";
import {MongoClient} from "mongodb";
import { lemmaPolicy } from "./src/host/http.ts";
const database = new MongoClient("mongodb://localhost").db("lemma");
export default {
  assemble: () => assembleApplication({database}),
  title: "Lemma",
  wireName: "LemmaWire",
  design: { version: 1, documents: [
    new URL("./design/types.md", import.meta.url),
    new URL("./design/compositions/reusable/passwords.md", import.meta.url),
    new URL("./design/compositions/reusable/accounts.md", import.meta.url),
    new URL("./design/compositions/access.md", import.meta.url),
    new URL("./design/compositions/topics.md", import.meta.url),
    new URL("./design/compositions/points.md", import.meta.url),
    new URL("./design/compositions/home.md", import.meta.url),
    new URL("./design/compositions/cards.md", import.meta.url)
  ] },
    projections: [httpWire({ policy: lemmaPolicy("http://localhost:3000"), name: "LemmaWireHttp" })],
};
