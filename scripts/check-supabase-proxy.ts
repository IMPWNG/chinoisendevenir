import assert from "node:assert/strict";
import { browserUrlToProxy, supabaseProxyPath } from "../src/lib/supabaseProxy.ts";

const base = "https://example.supabase.co";

assert.equal(supabaseProxyPath(["auth", "v1", "user"]), "auth/v1/user");
assert.equal(supabaseProxyPath(["rest", "v1", "contacts"]), "rest/v1/contacts");
assert.equal(supabaseProxyPath(["auth", "v1", "..", "user"]), null);
assert.equal(supabaseProxyPath(["graphql", "v1"]), null);
assert.equal(supabaseProxyPath(["auth", "v2", "token"]), null);

assert.equal(
  browserUrlToProxy(base, `${base}/auth/v1/user`),
  "/api/sb/auth/v1/user",
);
assert.equal(
  browserUrlToProxy(base, `${base}/rest/v1/contacts?select=*`),
  "/api/sb/rest/v1/contacts?select=*",
);
assert.equal(browserUrlToProxy(`${base}/`, `${base}/storage/v1/object/x`), "/api/sb/storage/v1/object/x");
assert.equal(browserUrlToProxy(base, "https://evil.example/auth/v1/user"), null);
assert.equal(browserUrlToProxy(base, `${base}/auth/v1/user?x=\n`), null);

console.log("supabase proxy ok");
