const bedrock = require("bedrock-protocol");

const SERVER_IP = "MC_Player110.aternos.me";
const SERVER_PORT = 31682;

function startBot() {
  console.log("Starting AFK bot...");

  const client = bedrock.createClient({
    host: SERVER_IP,
    port: SERVER_PORT,
    username: "AFK_Bot",
    offline: true
  });

  client.on("join", () => {
    console.log("Bot joined successfully!");
  });

  client.on("disconnect", (msg) => {
    console.log("Bot disconnected:", msg);
    console.log("Reconnecting in 5 seconds...");
    setTimeout(startBot, 5000);
  });

  client.on("kick", (reason) => {
    console.log("Kicked:", reason);
    console.log("Reconnecting in 5 seconds...");
    setTimeout(startBot, 5000);
  });

  // Anti-AFK — movement loop
  setInterval(() => {
    try {
      client.write("player_move", {
        position: { x: Math.random(), y: 70, z: Math.random() },
        pitch: 0,
        yaw: 0,
        on_ground: true
      });

      console.log("Sent anti-AFK movement packet");
    } catch (e) {
      console.log("Movement error:", e);
    }
  }, 15000); // every 15 seconds
}

startBot();
