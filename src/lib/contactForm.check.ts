/**
 * Self-check for an alternate send address.
 * Run: npx tsx src/lib/contactForm.check.ts
 */
import { resolveOutboundEmail } from "./contactForm";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

const own = resolveOutboundEmail("Awa@Example.com", "  ");
assert(own.ok && own.email === "awa@example.com", "empty override keeps the student");

const parent = resolveOutboundEmail("awa@example.com", "Parent@Famille.fr");
assert(parent.ok && parent.email === "parent@famille.fr", "parent address wins");

assert(resolveOutboundEmail("awa@example.com", "pas un mail").ok === false, "reject a bad address");
assert(resolveOutboundEmail("", "").ok === false, "missing both");

console.log("contact form check ok");
