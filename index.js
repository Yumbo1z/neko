const express = require("express");
const app = express();
const {
  Client,
  Collection,
  Partials,
  GatewayIntentBits,
} = require("discord.js");

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

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
