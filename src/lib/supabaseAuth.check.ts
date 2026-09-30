/**
 * Self-check for the student password-reset redirect.
 * Run: npx tsx src/lib/supabaseAuth.check.ts
 */
import { studentRecoveryRedirect } from "./supabaseAuth";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

const path = "/espace-etudiant/auth/callback?next=password";
assert(
  studentRecoveryRedirect("https://chinoisendevenir.com") ===
    `https://chinoisendevenir.com${path}`,
  "site",
);
assert(
  studentRecoveryRedirect("https://www.chinoisendevenir.com/espace") ===
    `https://www.chinoisendevenir.com${path}`,
  "www",
);
assert(
  studentRecoveryRedirect("http://localhost:3000") ===
    `http://localhost:3000${path}`,
  "local",
);
assert(
  studentRecoveryRedirect("https://evil.example") ===
    `https://chinoisendevenir.com${path}`,
  "unknown host",
);
assert(
  studentRecoveryRedirect("http://chinoisendevenir.com") ===
    `https://chinoisendevenir.com${path}`,
  "http site rejected",
);

console.log("supabaseAuth check ok");
