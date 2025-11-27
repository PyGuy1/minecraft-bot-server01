const { createClient } = require("bedrock-protocol");
const http = require("http");

// Keep Render alive
http.createServer((req, res) => {
  res.end("Bot is running");
}).listen(process.env.PORT || 10000);

// === CONFIG ===
const SERVER_IP = "MC_Player110.aternos.me";
const SERVER_PORT = 31682;
const BOT_NAME = "Herobrine"; // change if you want

function start() {
  console.log("Starting offline AFK bot...");

  const client = createClient({
    host: SERVER_IP,
    port: SERVER_PORT,
    username: BOT_NAME,
    offline: true,       // Aternos offline mode ONLY
    // protocolVersion: 589  // optional, leave disabled unless server mismatches
  });

  client.on("connect", () => {
    console.log("TCP connected — waiting for join...");
  });

  client.on("join", () => {
    console.log("Bot successfully joined the server!");
  });

  client.on("spawn", () => {
    console.log("Spawned into the world.");
  });

  client.on("text", (packet) => {
    try {
      console.log("[CHAT]", packet.message ?? JSON.stringify(packet));
    } catch {}
  });

  client.on("kick", (reason) => {
    console.log("Kicked:", reason);
    console.log("Reconnecting in 5 seconds...");
    setTimeout(start, 5000);
  });

  client.on("disconnect", (reason) => {
    console.log("Disconnected:", reason);
    console.log("Reconnecting in 5 seconds...");
    setTimeout(start, 5000);
  });

  // === Anti-AFK movement ===
  const moveInterval = setInterval(() => {
    try {
      client.queue("player_move", {
        position: {
          x: (Math.random() - 0.5) * 0.05,
          y: 70,
          z: (Math.random() - 0.5) * 0.05,
        },
        pitch: 0,
        yaw: 0,
        on_ground: true,
      });

      // Also try player_auth_input (newer servers support it)
      try {
        client.queue("player_auth_input", {
          pitch: 0,
          yaw: 0,
          head_yaw: 0,
          position: { x: 0, y: 70, z: 0 },
          on_ground: true,
          jump: false,
          sneak: false
        });
      } catch {}

      console.log("Anti-AFK movement sent.");

    } catch (err) {
      console.log("Movement error:", err?.message ?? err);
    }
  }, 15000);

  // Cleanup on server stop
  process.on("SIGINT", () => {
    console.log("Stopping bot...");
    clearInterval(moveInterval);
    try { client.close(); } catch {}
    process.exit(0);
  });
}

start();
