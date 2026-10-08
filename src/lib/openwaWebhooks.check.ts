/**
 * Run: npx tsx src/lib/openwaWebhooks.check.ts
 */
import {
  DEFAULT_OPENWA_WEBHOOK_EVENTS,
  inboundOnlyFilter,
  normalizeWebhookUrl,
  parseOpenwaWebhookCreate,
  parseOpenwaWebhookId,
  webhookMatchesCreate,
  webhookRows,
} from "./openwaWebhooks";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

const cursor =
  "https://api2.cursor.sh/automations/webhook/0fd1fd86-c1ea-5eec-961f-6c0237ed81b1";

const parsed = parseOpenwaWebhookCreate({
  url: cursor,
  events: ["message.received"],
});
assert(!("error" in parsed), "valid create");
if (!("error" in parsed)) {
  assert(parsed.url === cursor, "url kept");
  assert(parsed.events.join() === "message.received", "events");
  assert(parsed.retryCount === 3, "retry default");
  assert(parsed.inboundOnly === true, "inbound default");
}

const omitted = parseOpenwaWebhookCreate({ url: cursor });
assert(
  !("error" in omitted) && omitted.events.join() === DEFAULT_OPENWA_WEBHOOK_EVENTS.join(),
  "omit events",
);

assert("error" in parseOpenwaWebhookCreate(null), "null body");
assert("error" in parseOpenwaWebhookCreate({}), "missing url");
assert("error" in parseOpenwaWebhookCreate({ url: "not-a-url" }), "bad url");
assert(
  "error" in parseOpenwaWebhookCreate({ url: "https://user:pass@example.com/hook" }),
  "credentials",
);
assert("error" in parseOpenwaWebhookCreate({ url: cursor, events: [] }), "empty events");
assert(
  "error" in parseOpenwaWebhookCreate({ url: cursor, events: ["no spaces"] }),
  "bad event name",
);
assert(
  "error" in parseOpenwaWebhookCreate({ url: cursor, retryCount: 9 }),
  "retry too high",
);

const outbound = parseOpenwaWebhookCreate({ url: cursor, inboundOnly: false });
assert(!("error" in outbound) && outbound.inboundOnly === false, "inboundOnly false");

assert(parseOpenwaWebhookId("  abc  ") === "abc", "id trim");
assert(
  normalizeWebhookUrl(`${cursor}/`) === cursor,
  "strip trailing slash",
);

const listed = webhookRows({
  data: [
    {
      id: "wh_1",
      url: cursor,
      events: ["message.received"],
      filters: inboundOnlyFilter(),
      active: true,
      retryCount: 3,
    },
    { id: "", url: cursor },
  ],
});
assert(listed.length === 1, "skip empty id");
assert(listed[0].id === "wh_1", "id");

const create = parseOpenwaWebhookCreate({ url: cursor, events: ["message.received"] });
assert(!("error" in create), "create for match");
if (!("error" in create)) {
  assert(webhookMatchesCreate(listed[0], create), "same webhook is a no-op");
  assert(
    !webhookMatchesCreate({ ...listed[0], events: ["message.sent"] }, create),
    "events differ",
  );
}

assert(inboundOnlyFilter().conditions[0].field === "fromMe", "fromMe filter");
assert(inboundOnlyFilter().conditions[0].value === false, "not fromMe");

console.log("openwaWebhooks check ok");
