/**
 * A student space is an auth user created from the student register flow.
 * Run: npx tsx src/lib/authUsers.check.ts
 */
import { studentSpaceEmails } from "./authUsers";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

const emails = studentSpaceEmails([
  { email: "Eleve@Exemple.fr", user_metadata: { source: "espace_etudiant" } },
  { email: "eleve@exemple.fr", user_metadata: { source: "espace_etudiant" } },
  { email: "admin@chinoisendevenir.com", user_metadata: { source: "admin" } },
  { email: "sans-compte@exemple.fr" },
  { email: "  ", user_metadata: { source: "espace_etudiant" } },
]);

assert(emails.length === 1 && emails[0] === "eleve@exemple.fr", "only created student spaces");

console.log("student space emails ok");
