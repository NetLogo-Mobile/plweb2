import type { Handler } from "@netlify/functions";

const API_BASE = "https://physics-api-cn.turtlesim.com";

const handler: Handler = async (event) => {
  const path = event.queryStringParameters?.path || "/Contents/GetContents";
  const search = event.queryStringParameters?.search || "?Category=Discussion&Skip=0&Take=20";

  const target = `${API_BASE}${path}${search}`;

  try {
    const res = await fetch(target, {
      headers: {
        Referer: "https://www.turtlesim.com/",
      },
    });

    const body = await res.text();

    const html = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>plweb AI Snapshot</title>
</head>
<body>
  <main>
    <h1>plweb AI-friendly runtime snapshot</h1>
    <p>Generated at request time, not at build time.</p>
    <p>Source: <code>${target.replace(/</g, "&lt;")}</code></p>
    <script type="application/json" id="plweb-runtime-data">${body.replace(/</g, "\\u003c")}</script>
    <pre>${body.replace(/</g, "&lt;")}</pre>
  </main>
</body>
</html>`;

    return {
      statusCode: 200,
      body: html,
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "no-store",
      },
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        ok: false,
        error: (error as Error).message,
        target,
      }),
      headers: {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "no-store",
      },
    };
  }
};

export { handler };
