function json(data: unknown, init?: ResponseInit): Response {
  return Response.json(data, {
    ...init,
    headers: {
      "Cache-Control": "no-store",
      ...init?.headers,
    },
  });
}

export default {
  fetch(request: Request): Response {
    const url = new URL(request.url);

    if (request.method === "GET" && url.pathname === "/api/health") {
      return json({
        ok: true,
        service: "typeblade",
      });
    }

    return json(
      {
        error: "Not found",
      },
      { status: 404 },
    );
  },
} satisfies ExportedHandler;
