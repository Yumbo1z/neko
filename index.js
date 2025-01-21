const express = require("express");
const app = express();
const {
  Client,
  Collection,
  Partials,
  GatewayIntentBits,
  IntentsBitField,
} = require("discord.js");

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.MessageContent
  ],
});

client.on("ready", async () => {
  let servers = client.guilds.cache.size;
  let servercount = client.guilds.cache.reduce((a, b) => a + b.memberCount, 0);
  console.log(
    `Ready! Logged in as ${client.user.username}\ncurrently in ${servers} servers and watching over ${servercount} members`
  );
  console.log(`Ping: ${client.ws.ping}`);

  client.user.setPresence({
    activities: [{ name: "meow", type: 0 }],
  });
});

module.exports = client;
client.slashCommands = new Collection();
client.commands = new Collection();
require("./handler")(client);

app.listen(process.env.PORT || 80, () => {
  console.log("Server Started");
});

client.login(process.env.token);

// ———————————————[Error Handling]———————————————
process.on("unhandledRejection", (reason, p) => {
  console.log(reason, p);
});
process.on("uncaughtException", (err, origin) => {
  console.log(err, origin);
});
process.on("uncaughtExceptionMonitor", (err, origin) => {
  console.log(err, origin);
});
