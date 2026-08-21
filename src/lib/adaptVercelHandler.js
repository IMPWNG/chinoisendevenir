import { NextResponse } from "next/server";

export function adaptVercelHandler(handler) {
  return async (request) => {
    let body = {};
    if (request.method !== "GET" && request.method !== "HEAD") {
      try {
        body = await request.json();
      } catch {
        body = {};
      }
    }

    const headers = Object.fromEntries(request.headers.entries());
    const req = { method: request.method, body, headers };

    let statusCode = 200;
    let payload = null;
    const headerBag = new Headers();

    const res = {
      setHeader(name, value) {
        headerBag.set(name, value);
      },
      status(code) {
        statusCode = code;
        return this;
      },
      json(data) {
        payload = data;
        return this;
      },
      end() {
        return this;
      },
    };

    await handler(req, res);

    if (payload !== null) {
      return NextResponse.json(payload, {
        status: statusCode,
        headers: headerBag,
      });
    }

    return new NextResponse(null, { status: statusCode, headers: headerBag });
  };
}
