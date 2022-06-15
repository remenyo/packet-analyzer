import { serve } from "https://deno.land/std@0.140.0/http/server.ts";
import readFileSync from "./bundle.js";

const files = [
  { path: "defines.js", name: "defines.js", content_type: "text/javascript" },
  { path: "main.js", name: "main.js", content_type: "text/javascript" },
  { path: "wsWorker.js", name: "wsWorker.js", content_type: "text/javascript" },
  { path: "index.html", name: "index.html", content_type: "text/html" },
  { path: "", name: "index.html", content_type: "text/html" },
];

function handleRequest(request: Request): Promise<Response> {
  const { pathname } = new URL(request.url);

  // This is how the server works:
  // 1. A request comes in for a specific asset.
  // 2. We read the asset from the file system.
  // 3. We send the asset back to the client.

  files.forEach((element) => {
    if (pathname.startsWith("/" + element.path)) {
      // Read the style.css file from the file system.
      const file = readFileSync("public/" + element.name);
      // Respond to the request with the style.css file.
      return new Response(file, {
        headers: {
          "content-type": element.content_type,
        },
      });
    }
  });

  return new Response(
    `<html>
      <body>
        <h1>404</h1>
        <h2>🤷bruh</h2>
        <a href="index.html">go back</a>
      </body>
    </html>`,
    {
      headers: {
        "content-type": "text/html; charset=utf-8",
      },
    },
  );
}

serve(handleRequest);
