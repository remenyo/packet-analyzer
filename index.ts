import { serve } from "https://deno.land/std@0.140.0/http/server.ts";
import { getFreePort } from "https://deno.land/x/free_port@v1.2.0/mod.ts";
import { open } from "https://deno.land/x/opener@v1.0.1/mod.ts";
import readFileSync from "./bundle.js";

const port = await getFreePort(8000);
serve(handleRequest, { port: port });
open("http://localhost:" + port);

// 2 UDP ports
const ports = [
  Deno.listenDatagram({
    hostname: "0.0.0.0",
    port: 5683,
    transport: "udp",
  }),
  Deno.listenDatagram({
    hostname: "0.0.0.0",
    port: 0,
    transport: "udp",
  }),
];
//-------

// Control commands
async function openUDP(id: number, port: number) {
  try {
    ports[id].close();
    ports[id] = Deno.listenDatagram({
      hostname: "0.0.0.0",
      port: port,
      transport: "udp",
    });
    console.log(`UDP socket ${id} listnening on port ${port}`);
    while (true) {
      const data = await ports[id].receive();
      console.log(`UDP socket ${id} recieved data`);
      try {
        handleUDPrecieve(id, data[0], data[1]);
      } catch (error) {
        console.error("could not send packet", error);
      }
    }
  } catch (error) {
    console.error(error);
  }
}

function sendUDP(id: number, data: string, addr: Deno.Addr) {
  ports[id].send(
    new Uint8Array(JSON.parse("[" + data + "]")),
    addr, // {hostname,path,port,transport}
  );
}

// UDP handler commands
function handleUDPrecieve(id: number, data: Uint8Array, addr: Deno.Addr) {
  ws.send(
    JSON.stringify({ event: "udp_message", id, data: data.toString(), addr }),
  );
}

// WS handler commands
function logError(msg: string) {
  console.log(msg);
  // Deno.exit(1);
}

function handleConnected() {
  console.log("Connected to client");
}

function handleMessage(data: string) {
  console.log("CLIENT: " + data);
  try {
    const message = JSON.parse(data);
    switch (String(message.command)) {
      case "send":
        sendUDP(message.id, message.data, message.addr);
        break;
      case "open":
        openUDP(message.id, message.port);
        break;
      default:
        break;
    }
  } catch (error) {
    console.error(error);
  }

  /* const reply = prompt("Server >> ") || "No reply";
  if (reply === "exit") {
    return ws.close();
  }
  ws.send(reply as string); */
}

function handleError(e: Event | ErrorEvent) {
  console.log(e instanceof ErrorEvent ? e.message : e.type);
}

let ws: WebSocket;

function handleRequest(request: Request): Response {
  const { pathname } = new URL(request.url);

  // This is how the server works:
  // 1. A request comes in for a specific asset.
  // 2. We read the asset from the file system.
  // 3. We send the asset back to the client.

  // websocket extension
  if (request.headers.get("upgrade") == "websocket") {
    const wsUpgrade = Deno.upgradeWebSocket(request);
    ws = wsUpgrade.socket;
    ws.onopen = () => handleConnected();
    ws.onmessage = (m) => handleMessage(m.data);
    ws.onclose = () => logError("Disconnected from client ...");
    ws.onerror = (e) => handleError(e);
    return wsUpgrade.response;
  }

  if (pathname.startsWith("/defines.js")) {
    // Read the style.css file from the file system.
    const file = readFileSync("public/defines.js");
    // Respond to the request with the style.css file.
    return new Response(file, {
      headers: {
        "content-type": "text/javascript",
      },
    });
  }

  if (pathname.startsWith("/main.js")) {
    // Read the style.css file from the file system.
    const file = readFileSync("public/main.js");
    // Respond to the request with the style.css file.
    return new Response(file, {
      headers: {
        "content-type": "text/javascript",
      },
    });
  }

  if (pathname.startsWith("/wsWorker.js")) {
    // Read the style.css file from the file system.
    const file = readFileSync("public/wsWorker.js");
    // Respond to the request with the style.css file.
    return new Response(file, {
      headers: {
        "content-type": "text/javascript",
      },
    });
  }

  if (pathname.startsWith("/") || pathname.startsWith("/index.html")) {
    // Read the style.css file from the file system.
    const file = readFileSync("public/index.html");
    // Respond to the request with the style.css file.
    return new Response(file, {
      headers: {
        "content-type": "text/html; charset=utf-8",
      },
    });
  }

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
