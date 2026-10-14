import { describe, expect, test } from "bun:test";
import { startLemma} from "../support/app.ts";
import { ok } from "../support/reusable/results.ts";
describe("Signing in", () => {
  test("a 5-character password is refused before `ben` is registered, so Ben can sign up again", async () => {
    const { api } = await startLemma();
    expect(await api.auth.register({ username: "ben", password: "short" })).toEqual({ error: "INVALID_PASSWORD" });
    const ben = ok(await api.auth.register({ username: "ben", password: "correct horse" }));
    expect(await api.auth.me({ session: ben.session })).toEqual({ username: "ben" });
  });

  test("Registering with a taken username is refused", async () => {
    const {api, register} = await startLemma();
    await register("CoolKid42");
    expect(await api.auth.register({username: "CoolKid42", password: "epic-password"})).toEqual({error: "USERNAME_TAKEN"})
  })
  test("a username nobody has gets the same refusal as a wrong password", async () => {
    const { api, register } = await startLemma();
    await register("ben");
    expect(await api.auth.login({ username: "ben", password: "guessed-password" })).toEqual({ error: "INVALID_CREDENTIALS" });
    expect(await api.auth.login({ username: "nobody", password: "guessed-password" })).toEqual({ error: "INVALID_CREDENTIALS" });
  });
});
