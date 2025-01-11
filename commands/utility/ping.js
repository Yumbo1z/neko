const { EmbedBuilder } = require("discord.js");
let wait = require("node:timers/promises").setTimeout;
const moment = require("moment");
require("moment-duration-format");
const Discord = require("discord.js");

module.exports = {
  name: "ping",
  category: "info",
  description: "display bots latency",
  usage: "",
  msg: true,
  run: async (client, message, args) => {
    let embed1 = new EmbedBuilder()
      .setDescription("🏓 | Ping ...")
      .setColor("#8c4ec4");

    let msg = await message.reply({
      embeds: [embed1],
    });

    let ping = msg.createdTimestamp - message.createdTimestamp;

    const duration = moment
      .duration(client.uptime)
      .format(" D [days], H [hrs], m [mins], s [secs]");

    let pings = {
      zap: "⚡",
      snail: "🐌",
      green: "🟢",
      red: "🔴",
      yellow: "🟡",
    };
    let color = pings.zap;
    let color2 = pings.zap;
    let cPing = Math.round(client.ws.ping);
    if (cPing >= 40) color2 = pings.green;
    if (cPing >= 200) color2 = pings.yellow;
    if (cPing >= 400) color2 = pings.red;
    if (cPing >= 1000) color2 = pings.snail;
    if (ping >= 40) color = pings.green;
    if (ping >= 200) color = pings.yellow;
    if (ping >= 400) color = pings.red;
    if (ping >= 1000) color = pings.snail;

    let info = new EmbedBuilder()
      .setTitle("🏓 | Pong!")
      .addFields(
        {
          name: "API Latency",
          value: `${color2} | ${cPing}ms`,
          inline: true,
        },
        {
          name: "Message Latency",
          value: `${color} | ${ping}ms`,
          inline: true,
        },
        {
          name: "Uptime",
          value: `⏲️ | ${duration}`,
          inline: true,
        }
      )
      .setColor("#8c4ec4")
      .setFooter({
        text: `Requested by ${message.author.username}`,
        iconURL: message.author.displayAvatarURL(),
      });

    msg.edit({
      embeds: [info],
    });

    /*await wait(5000); // Wait 5 seconds
    await msg.delete().catch((e) => {}); // Delete command after 5 seconds*/
  },
};
