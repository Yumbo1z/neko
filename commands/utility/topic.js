const { ActionRowBuilder, EmbedBuilder, ButtonBuilder } = require("discord.js");
const { disableButtons } = require("../../functions/util.js");

module.exports = {
  name: "topic",
  description: "replies with a random topic to talk about",
  run: async (client, message, args) => {
    const revivers = require("../../revivers.json");

    let item = revivers[Math.floor(Math.random() * revivers.length)];
    let topic = new EmbedBuilder()
      .setTitle(`🗣️ Topic`)
      .setDescription(`**__${item}__**`)
      .setFooter({
        text: message.author.username,
      })
      .setColor("#8c4ec4");

    await message.reply({ embeds: [topic] });
  },
};
