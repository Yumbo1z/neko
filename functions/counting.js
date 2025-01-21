const { EmbedBuilder } = require("discord.js");
const client = require("../index");
const serverSchema = require("./../models/serverData");
const count = require("./../models/count");
const { isWhole, isInteger } = require("./../functions/util.js");

async function counting(message) {
  if (!message.guild || message.author.bot) return;

  try {
    const server = await serverSchema.findOne({
      guildID: message.guild.id,
    });

    if (!server || !server.countingSystem || !server.countingSystem.channel)
      return;

    if (message.channel.id !== server.countingSystem.channel) return;

    if (isNaN(message.content)) return;
    if (message.attachments.first()) return;
    if (!isWhole(message.content)) return;

    let countData = await count.findOne({
      guildID: message.guild.id,
    });

    if (!countData)
      await count.create({
        guildID: message.guild.id,
        lastNumber: 0,
        lastUser: client.user.id,
        highestNumber: 0,
      });

    const nextNumber = (countData.lastNumber || 0) + 1;

    if (
      Number(message.content) !== nextNumber ||
      message.author.id === countData.lastUser
    ) {
      const lastUser = countData.lastUser;
      countData.lastNumber = 0;
      countData.lastUser = client.user.id;

      await countData.save();

      message.reply(
        `😭 You messed up!! ${message.author.id === lastUser
          ? "You can't count twice!! Next number is **1**"
          : "Next number is **1**"
        }`
      );

      message.react("❌").catch((e) => { });
    } else {
      if (nextNumber > countData.highestNumber)
        countData.highestNumber = nextNumber;

      countData.lastNumber = nextNumber;
      countData.lastUser = message.author.id;

      await countData.save();

      if (Number(message.content) === 100 && nextNumber === 100) {
        message.react("💯").catch((e) => { });
      } else {
        message.react("✅").catch((e) => { });
      }
    }
  } catch (error) {
    console.error("Error updating server data:", error);
  }
}

module.exports = counting;
