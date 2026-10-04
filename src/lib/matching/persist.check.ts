/**
 * Self-check for deleting saved matching runs.
 * Run: npx tsx src/lib/matching/persist.check.ts
 */
import type { AdminClient } from "../supabaseAdmin";
import {
  deleteMatchingRuns,
  MATCHING_KIND_CHINESE,
  MATCHING_KIND_UNIVERSITY,
} from "./persist";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

function row(
  id: string,
  kind: string,
  name: string,
) {
  return {
    id,
    created_at: `2026-01-0${id.slice(-1)}T00:00:00.000Z`,
    created_by: "admin",
    recommended_formula: 2,
    top_university: name,
    top_score: 80,
    client_message: "",
    payload: {
      kind,
      matches: [{ university_name: name, score: 80, category: "Réaliste" }],
    },
  };
}

function makeAdmin(matching: ReturnType<typeof row>[]) {
  const store = { matching: matching.slice(), actions: [] as ReturnType<typeof row>[] };
  const deleted: { table: string; ids: string[] }[] = [];
  const admin = {
    from(table: string) {
      let mode = "select";
      let ids: string[] = [];
      const q: Record<string, unknown> = {
        select: () => q,
        eq: () => q,
        order: () => q,
        like: () => q,
        limit: () => q,
        delete: () => {
          mode = "delete";
          return q;
        },
        in: (_key: string, next: string[]) => {
          ids = next;
          return q;
        },
        then: (
          resolve: (value: unknown) => unknown,
          reject?: (error: unknown) => unknown,
        ) => {
          const list = table === "matching_runs" ? store.matching : store.actions;
          if (mode === "delete") {
            deleted.push({ table, ids });
            const drop = new Set(ids);
            if (table === "matching_runs") {
              store.matching = store.matching.filter((item) => !drop.has(item.id));
            } else {
              store.actions = store.actions.filter((item) => !drop.has(item.id));
            }
            return Promise.resolve({ data: null, error: null }).then(resolve, reject);
          }
          return Promise.resolve({ data: list, error: null }).then(resolve, reject);
        },
      };
      return q;
    },
  };
  return { admin: admin as unknown as AdminClient, store, deleted };
}

const uni = row("u1", MATCHING_KIND_UNIVERSITY, "Xiamen");
const uniOld = row("u2", MATCHING_KIND_UNIVERSITY, "SZU");
const zh = row("z1", MATCHING_KIND_CHINESE, "ECNU");

async function main() {
  {
    const { admin, store, deleted } = makeAdmin([uni, uniOld, zh]);
    const removed = await deleteMatchingRuns(admin, "c1", { runId: "u1" });
    assert(removed.deleted === 1 && removed.ids[0] === "u1", "delete one university run");
    assert(
      store.matching.map((item) => item.id).join(",") === "u2,z1",
      "leave other university and chinese runs",
    );
    assert(
      deleted.some((item) => item.table === "matching_runs" && item.ids.includes("u1")),
      "delete matching_runs row",
    );
  }

  {
    const { admin, store } = makeAdmin([uni, uniOld, zh]);
    const removed = await deleteMatchingRuns(admin, "c1", {
      kind: MATCHING_KIND_UNIVERSITY,
    });
    assert(removed.deleted === 2, "delete all university runs");
    assert(
      store.matching.map((item) => item.id).join(",") === "z1",
      "keep chinese run when wiping university",
    );
  }

  {
    const { admin, store } = makeAdmin([uni, zh]);
    const removed = await deleteMatchingRuns(admin, "c1", {
      kind: MATCHING_KIND_CHINESE,
    });
    assert(removed.deleted === 1 && removed.ids[0] === "z1", "delete chinese kind only");
    assert(store.matching.map((item) => item.id).join(",") === "u1", "keep university");
  }

  try {
    const { admin } = makeAdmin([uni]);
    await deleteMatchingRuns(admin, "c1", { runId: "missing" });
    throw new Error("expected missing run to throw");
  } catch (error) {
    assert(
      error instanceof Error && error.message === "Matching introuvable",
      "unknown runId",
    );
  }

  try {
    const { admin } = makeAdmin([uni]);
    await deleteMatchingRuns(admin, "  ");
    throw new Error("expected empty contact to throw");
  } catch (error) {
    assert(
      error instanceof Error && error.message === "contactId manquant",
      "empty contactId",
    );
  }

  {
    // PostgREST-style missing table (not an Error instance) must not 500.
    const store = { matching: [uni], actions: [] as ReturnType<typeof row>[] };
    const admin = {
      from(table: string) {
        let mode = "select";
        let ids: string[] = [];
        const q: Record<string, unknown> = {
          select: () => q,
          eq: () => q,
          order: () => q,
          like: () => q,
          limit: () => q,
          delete: () => {
            mode = "delete";
            return q;
          },
          in: (_key: string, next: string[]) => {
            ids = next;
            return q;
          },
          then: (
            resolve: (value: unknown) => unknown,
            reject?: (error: unknown) => unknown,
          ) => {
            if (mode === "delete" && table === "matching_runs") {
              return Promise.resolve({
                data: null,
                error: {
                  message:
                    'Could not find the table \'public.matching_runs\' in the schema cache',
                },
              }).then(resolve, reject);
            }
            if (mode === "delete" && table === "suivi_actions") {
              store.matching = store.matching.filter((item) => !ids.includes(item.id));
              return Promise.resolve({ data: null, error: null }).then(
                resolve,
                reject,
              );
            }
            return Promise.resolve({
              data: table === "matching_runs" ? store.matching : [],
              error: null,
            }).then(resolve, reject);
          },
        };
        return q;
      },
    };
    const removed = await deleteMatchingRuns(admin as unknown as AdminClient, "c1", {
      runId: "u1",
    });
    assert(removed.deleted === 1, "missing matching_runs table still deletes via journal path");
  }

  console.log("persist matching delete check ok");
}

main();
