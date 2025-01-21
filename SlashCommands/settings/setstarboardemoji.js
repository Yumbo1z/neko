let { EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const serverSchema = require("../../models/serverData");

module.exports = {
  data: {
    name: "setstarboardemoji",
    description: "set the starboard emoji",
    default_member_permissions: PermissionFlagsBits.ManageChannels.toString(),
    options: [
      {
        name: "emoji",
        description: "the starboard emoji",
        type: 3,
        required: true,
      },
    ],
    integration_types: [0],
  },
  run: async (client, interaction, args, username) => {
    const { options } = interaction;
    let errorEmbed = new EmbedBuilder().setColor("Red");

    const emoji = options.getString("emoji");

    const regex =
      /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/g;
    const regex2 =
      /(?:(?<!\\)<(a)?:[^:]+:(\d+)>)|\p{Emoji_Presentation}|\p{Extended_Pictographic}/gmu;

    const test = regex.test(emoji) || regex2.test(emoji);

    if (!test)
      return interaction.reply({
        embeds: [errEmbed.setDescription(`Invalid emoji!`)],
        ephemeral: true,
      });

    let server = await serverSchema.findOne({
      guildID: interaction.guild.id,
    });

    if (!server)
      server = await serverSchema.create({
        guildID: interaction.guild.id,
      });

    server.starboardSystem.emoji = emoji;

    await server.save();

    let embed = new EmbedBuilder()
      .setDescription(
        `Successfully set starboard emoji to ${server.countingSystem.emoji}!`
      )
      .setColor("#8c4ec4");

    await interaction.reply({
      embeds: [embed],
    });
  },
};
    