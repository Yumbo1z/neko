const { EmbedBuilder } = require("discord.js");
let serverSchema = require("../../models/serverData");
const count = require("../../models/count");

module.exports = {
  name: "resetcount",
  aliases: ["setcount", "rc", "sc"],
  staff: true,
  run: async (client, message, args) => {
    let server = await serverSchema.findOne({
      guildID: message.guild.id,
    });

    if (!server) return message.reply(`> No server data found.`);

    if (!server.countingSystem) return message.reply(`> Count is not enabled.`);

    let countData = await count.findOne({
      guildID: message.guild.id,
    });

    if (!countData) return message.reply(`> Count data not found.`);

    countData.lastNumber = countData.highestNumber;

    await countData.save();

    message.reply(`> Resetted the count to ${countData.highestNumber}!`);
  },
};
