import { assembleApplication } from "./src/assembly.ts";
import {MongoClient} from "mongodb";
const database = new MongoClient("mongodb://localhost").db("lemma");
export default {
  assemble: () => assembleApplication({database}),
  title: "Lemma",
  wireName: "LemmaWire",
  design: { version: 1, documents: [
    new URL("./design/types.md", import.meta.url),
    new URL("./design/compositions/reusable/passwords.md", import.meta.url),
    new URL("./design/compositions/reusable/accounts.md", import.meta.url)    
  ] },
};
