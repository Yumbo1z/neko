const { EmbedBuilder, AttachmentBuilder } = require("discord.js");
const client = require("../index");
const profileModel = require("./../models/profile");

client.on("ready", async () => {
  let servers = client.guilds.cache.size;
  let servercount = client.guilds.cache.reduce((a, b) => a + b.memberCount, 0);
  console.log(
    `Ready! Logged in as ${client.user.username}\ncurrently in ${servers} servers and watching over ${servercount} members`
  );
  console.log(`Ping: ${client.ws.ping}`);

  client.user.setPresence({
    activities: [{ name: "/help & /profile", type: 0 }],
  });
});
