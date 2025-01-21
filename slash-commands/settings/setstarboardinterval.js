let { EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const serverSchema = require("../../models/serverData");

module.exports = {
  data: {
    name: "setstarboardinterval",
    description: "set the starboard interval",
    default_member_permissions: PermissionFlagsBits.ManageChannels.toString(),
    options: [
      {
        name: "interval",
        description: "the starboard interval",
        type: 4,
        required: true,
      },
    ],
    integration_types: [0],
  },
  run: async (client, interaction, args, username) => {
    const { options } = interaction;
    let errorEmbed = new EmbedBuilder().setColor("Red");

    const interval = options.getInteger("interval");

    if (interval > 10 && 0 > interval)
      return interaction.reply({
        embeds: [
          errEmbed.setDescription(
            `Interval has to be bigger than 0 and less than 10.`
          ),
        ],
        ephemeral: true,
      });

    let server = await serverSchema.findOne({
      guildID: interaction.guild.id,
    });

    if (!server)
      server = await serverSchema.create({
        guildID: interaction.guild.id,
      });

    server.starboardSystem.interval = interval;

    await server.save();

    let embed = new EmbedBuilder()
      .setDescription(
        `Successfully set starboard interval to ${server.countingSystem.interval}!`
      )
      .setColor("#8c4ec4");

    await interaction.reply({
      embeds: [embed],
    });
  },
};
