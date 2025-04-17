const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', function connection(ws) {
  console.log('MC connected!');

  ws.on('message', function incoming(message) {
    const data = JSON.parse(message);

    // Listen to chat
    if (data.body?.eventName === "PlayerMessage") {
      const msg = data.body.properties.Message;
      const name = data.body.properties.Sender;

      console.log(`${name}: ${msg}`);

      if (msg === "start farming") {
        ws.send(JSON.stringify({
          body: {
            origin: { type: "player" },
            commandLine: `/say Bot: Starting farm!`,
            version: 1
          },
          header: {
            requestId: "123",
            messagePurpose: "commandRequest",
            version: 1,
            messageType: "commandRequest"
          }
        }));
      }

      if (msg === "come here") {
        ws.send(JSON.stringify({
          body: {
            origin: { type: "player" },
            commandLine: `/tp @e[type=armor_stand,name=farmbot] @p`,
            version: 1
          },
          header: {
            requestId: "124",
            messagePurpose: "commandRequest",
            version: 1,
            messageType: "commandRequest"
          }
        }));
      }
    }
  });
});
