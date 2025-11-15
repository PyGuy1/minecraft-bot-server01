const { Client } = require("@minecraft/bedrock-protocol-xbox");

const SERVER_IP = "MC_Player110.aternos.me";
const SERVER_PORT = 31682;

async function startBot() {
  console.log("Starting AFK Bot with Xbox authentication...");

  const client = await Client.create(
    {
      host: SERVER_IP,
      port: SERVER_PORT,
      username: "AFK_Bot",               // Bot Gamertag (any name)
      xbox: {
        flow: "live",                    // Enables Microsoft Login
        authTitle: "MCPE",               // Required for Bedrock
        deviceTokenFile: "./xbox.json"   // Stores your login token
      }
    }
  );

  client.on("start_game", () => {
    console.log("Bot joined the server successfully!");
  });

  client.on("disconnect", (data) => {
    console.log("Disconnected:", data);
    console.log("Reconnecting in 5 seconds...");
    setTimeout(startBot, 5000);
  });

  setInterval(() => {
    try {
      client.queue("player_move", {
        position: {
          x: (Math.random() - 0.5) * 2,
          y: 70,
          z: (Math.random() - 0.5) * 2
        },
        on_ground: true
      });
      console.log("Anti-AFK movement sent");
    } catch (err) {
      console.log("Movement failed:", err);
    }
  }, 15000);
}

startBot();
