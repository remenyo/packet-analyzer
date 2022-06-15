let ws = new WebSocket("ws://" + window.location.host);
let url = null;
let initialized = false;
const messageQueue = [];

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

init("ws://" + window.location.host);

async function init(wsurl) {
  console.log("Connecting to", wsurl);
  if (initialized) return;
  initialized = true;
  url = wsurl;
  while (true) {
    if (ws.readyState != WebSocket.OPEN) {
      startWebsocket();
      sendData(null);
    }

    await delay(5000);
  }
}

function openUDP(id, port) {
  sendData(
    JSON.stringify({
      command: "open",
      id: parseInt(id),
      port: parseInt(port),
    }),
  );
}

function sendUDP(id, data, hostname, port) {
  sendData(
    JSON.stringify({
      command: "send",
      id: id,
      data: data,
      addr: addrMaker(hostname, "", port),
    }),
  );
}

function addrMaker(hostname, path, port) {
  return { hostname, path, port, transport: "udp" };
}

function sendWSstate() {
  console.log("WSState", {
    src: entities.worker,
    command: responses.wsState,
    data: { readyState: ws.readyState },
  });
}

function sendData(data) {
  if (data != null) {
    messageQueue.push(data);
  }

  if (messageQueue.length != 0) {
    if (ws.readyState != WebSocket.OPEN) {
      console.info("Can not send data, ws is closed");
    } else {
      while (messageQueue.length != 0) {
        const d = messageQueue[messageQueue.length - 1];
        try {
          ws.send(d);
          messageQueue.pop();
        } catch (error) {
          console.error("Failed to send data...", d, error);
          break;
        }
      }
    }
  }
}

let nat_cache = 0;

function nat(sender_id, sender_port, new_port) {
  nat_cache = sender_port;
  // for two way nat, (which would be the proper solution here) add magic here.
  return sender_id == 0 ? new_port : nat_cache;
}

function udp_message(data) {
  if (document.getElementById("relay").value) {
    sendUDP(
      data.id == 0 ? 1 : 0,
      data.data,
      document.getElementById("nat_address").value,
      nat(
        data.id,
        data.addr.port,
        parseInt(document.getElementById("nat_port").value),
      ),
    );
  }
}

function startWebsocket() {
  if (url == null) {
    console.error("url should not be null on websocket start");
    return;
  }
  /* if (ws.readyState != ws.CLOSED) {
      console.error("ws is not closed, closing now...");
      ws.close();
    } */

  sendWSstate();

  ws = new WebSocket(url);

  sendWSstate();

  if (ws.readyState == ws.CLOSED || ws.readyState == ws.CLOSING) {
    console.error("Failed to connect to ws server.");
    if (loop_de_loop) setTimeout(startWebsocket(loop_de_loop), 1000);
    return;
  }

  ws.onmessage = function (e) {
    const data = JSON.parse(e.data);
    console.log("WS data", data);
    switch (data.event) {
      case "udp_message":
        udp_message(data);
        break;
      case "status":
        status(data);
        break;

      default:
        break;
    }
  };

  ws.onclose = function () {
    console.log("WebSocket connection closed.");
    // connection closed, discard old websocket and create a new one in 5s
    sendWSstate();
  };

  ws.onopen = function () {
    console.log("WS Opened.");
    // todo push two buttons
    document.getElementById("");
  };
}

function saveVal(e) {
  // for (e of document.getElementsByClassName("saveme")) {
  localStorage.setItem(
    e.id,
    e.type == "checkbox" ? e.checked : e.value,
  );
  // }
}

window.onload = function () {
  for (e of document.getElementsByClassName("saveme")) {
    const value = localStorage.getItem(e.id);
    if (value != null) {
      if (e.type != "checkbox") e.value = value;
      else e.checked = value;
    }
  }

  for (e of document.getElementsByClassName("saveme")) {
    e.onchange = (n) => {
      saveVal(n.srcElement);
    };
  }
};
