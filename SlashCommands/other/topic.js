const { ActionRowBuilder, EmbedBuilder, ButtonBuilder } = require("discord.js");
const { disableButtons } = require("../../functions/util.js");

module.exports = {
  data: {
    name: "topic",
    description: "replies with a random topic to talk about",
    integration_types: [0, 1],
    contexts: [0, 1, 2],
  },
  run: async (client, interaction, args, username) => {
    const revivers = require("../../revivers.json");

    let btn = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("newTopic")
        .setLabel("New Topic")
        .setStyle(1)
    );

    let item = revivers[Math.floor(Math.random() * revivers.length)];
    let topic = new EmbedBuilder()
      .setTitle(`🗣️ Topic`)
      .setDescription(`**__${item}__**`)
      .setFooter({
        text: interaction.user.username,
      })
      .setColor("#8c4ec4");

    let msg = await interaction.reply({
      embeds: [topic],
      components: [btn],
      fetchReply: true,
    });

    const collector = msg.createMessageComponentCollector({
      idle: 120000,
    });

    collector.on("collect", async (i) => {
      if (i.user.id !== interaction.user.id)
        return i.reply({
          content: "This is not for you.",
          ephemeral: true,
        });

      if (i.customId === "newTopic") {
        await i
          .update({
            embeds: [
              topic.setDescription(
                `**__${
                  revivers[Math.floor(Math.random() * revivers.length)]
                }__**`
              ),
            ],
          })
          .catch((e) => {});
      }
    });

    collector.on("end", () => {
      interaction
        .editReply({
          components: [],
        })
        .catch(() => {});
    });
  },
};
