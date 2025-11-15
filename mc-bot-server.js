const { createClient } = require('bedrock-protocol');

const SERVER_IP = 'MC_Player110.aternos.me';
const SERVER_PORT = 31682;
const BOT_NAME = 'Herobrine'; // change if you want

function start() {
  console.log('Starting offline AFK bot...');

  const client = createClient({
    host: SERVER_IP,
    port: SERVER_PORT,
    username: BOT_NAME,
    offline: true,       // IMPORTANT: offline mode for Aternos with Online Mode OFF
    // protocolVersion: 582, // (optional) pin version if needed, otherwise leave out
  });

  client.on('connect', () => {
    console.log('TCP connected — waiting for join...');
  });

  client.on('join', () => {
    console.log('Bot joined the server!');
  });

  client.on('text', (packet) => {
    // optional: log server chat
    try {
      // packet.message is a JSON text component or string depending on server
      console.log('[CHAT]', packet.message ?? JSON.stringify(packet));
    } catch (e) {
      // ignore
    }
  });

  client.on('spawn', () => {
    console.log('Spawned into world.');
  });

  client.on('disconnect', (reason) => {
    console.log('Bot disconnected:', reason);
    console.log('Reconnecting in 5 seconds...');
    setTimeout(start, 5000);
  });

  client.on('kick', (packet) => {
    console.log('Kicked:', packet);
    console.log('Reconnecting in 5 seconds...');
    setTimeout(start, 5000);
  });

  // Anti-AFK: small random micro-movements and periodic keep-alive chat (optional)
  // The movement is tiny so it won't move you far from AFK spot.
  const moveInterval = setInterval(() => {
    try {
      // send a small position jitter
      client.queue('player_move', {
        position: {
          x: (Math.random() - 0.5) * 0.05,
          y: 70,
          z: (Math.random() - 0.5) * 0.05,
        },
        yaw: 0,
        pitch: 0,
        on_ground: true,
      });
      // some servers also accept player_auth_input - try to queue this too
      try {
        client.queue('player_auth_input', {
          pitch: 0,
          yaw: 0,
          position: {
            x: 0.0,
            y: 70,
            z: 0.0,
          },
          jump: false,
          sneak: false,
          head_yaw: 0,
        });
      } catch (e) {
        // ignore if not supported
      }

      console.log('Anti-AFK movement sent');
    } catch (err) {
      console.log('Failed to send anti-AFK packet:', err?.message ?? err);
    }
  }, 15_000); // every 15 seconds

  // Optional: send a very infrequent chat message so some servers don't mark you idle
  const chatInterval = setInterval(() => {
    try {
      // Many servers block bots talking; remove or comment this if unwanted.
      // client.queue('start_game', { }); // not used, left as note
      // Use text packet only if server accepts from client (some servers don't)
      // client.queue('text', { message: '/msg keepalive' }); // example (usually blocked)
    } catch (e) {
      // ignore
    }
  }, 10 * 60 * 1000); // every 10 minutes

  // Clean-up on process exit
  process.on('SIGINT', () => {
    console.log('Shutting down bot...');
    clearInterval(moveInterval);
    clearInterval(chatInterval);
    try { client.close(); } catch {}
    process.exit(0);
  });
}

start();
