const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require("discord.js");

module.exports = {
  data: {
    name: "avatar",
    description: "Get someones avatar.",
    options: [
      {
        name: "user",
        description: "The person you want to view its avatar.",
        type: 6,
        required: false,
      },
    ],
  },
  run: async (client, interaction, args, username) => {
    const user =
      (await interaction.options.getUser("user")) || interaction.user;
    const member =
      (await interaction.options.getMember("user")) || interaction.member;

    const embed = new EmbedBuilder()
      .setAuthor({
        name: username,
        iconURL: user.displayAvatarURL({ forceStatic: true }),
      })
      .setImage(
        member.avatarURL({ size: 1024 }) || user.avatarURL({ size: 1024 })
      )
      .setColor("#8c4ec4");

    interaction.reply({ embeds: [embed] });
  },
};
