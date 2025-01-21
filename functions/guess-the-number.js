const { EmbedBuilder } = require("discord.js");
const client = require("../index");
const serverSchema = require("./../models/serverData");
const guessSchema = require("./../models/guess");
const { isWhole, isInteger } = require("./../functions/util.js");

async function count(message) {
  if (!message.guild) return;
  if (message.author.bot) return;

  try {
    let server = await serverSchema.findOne({
      guildID: message.guild.id,
    });

    if (
      !server ||
      !server.guessTheNumberSystem ||
      !server.guessTheNumberSystem.channel
    )
      return;

    if (message.channel.id !== server.guessTheNumberSystem.channel) return;

    if (isNaN(message.content)) return;
    if (message.attachments.first()) return;
    if (!isWhole(message.content)) return;

    let guess = await guessSchema.findOne({
      guildID: message.guild.id,
    });

    if (!guess) guess = await guessSchema.create({
      guildID: message.guild.id,
      guessNumber: Math.floor(Math.random() * 5000) + 1,
      tries: 0
    });

    if (!guess.guessNumber) {
      guess.guessNumber = Math.floor(Math.random() * 5000) + 1;
      await guess.save();
    }

    let answer = guess.guessNumber;

    const guessedNumber = Number(message.content);
    const difference = guessedNumber - answer;
    const threshold = 555; // Adjust this threshold as needed

    if (guessedNumber === answer) {
      let embed = new EmbedBuilder()
        .setTitle(`${message.author.username} you guessed the number!`)
        .setDescription(
          "I am going to reset the number now, good luck guessing it now!"
        )
        .addFields({
          name: "Tries",
          value: `${guess.tries}`,
        })
        .setFooter({ text: "Hint: The number is between 1 and 5000" })
        .setColor("Green");

      guess.guessNumber = Math.floor(Math.random() * 5000) + 1;
      guess.tries = 0;

      await guess.save()
      message.react("✅").catch((e) => { });

      message.reply({ embeds: [embed], content: `<@${message.author.id}>` });
    } else if (Math.abs(difference) <= threshold) {
      if (difference < 0) {
        // Guess is lower than answer, react with 🔼
        message.react("🔼").catch((e) => { });
        guess.tries++;
        await guess.save();
      } else {
        // Guess is higher than answer, react with 🔽
        message.react("🔽").catch((e) => { });
        guess.tries++;
        await guess.save();
      }
    } else {
      message.react("❌").catch((e) => { });
      guess.tries++;
      await guess.save();
    }
  } catch (error) {
    console.error("Error updating server data:", error);
  }
}
module.exports = count;
