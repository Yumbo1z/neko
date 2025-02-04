const serverSchema = require("../../models/serverData");
const { PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: {
    name: "setlevelingchannel",
    description: "Set the channel for leveling messages",
    default_member_permissions: PermissionFlagsBits.ManageChannels.toString(),
    options: [
      {
        name: "channel",
        description: "the channel to set for leveling messages",
        type: 7, // Channel type
        channelTypes: [0, 5],
        required: true,
      },
    ],
    integration_types: [0],
  },
  run: async (client, interaction, args, username) => {
    const guildID = interaction.guild.id;
    const channel = interaction.options.getChannel("channel");

    try {
      let server = await serverSchema.findOne({ guildID });
      if (!server)
        server = await serverSchema.create({
          guildID: interaction.guild.id,
        });

      // Set the leveling channel
      server.leveling.channel = channel.id;

      await server.save();

      // Inform the user about the change
      return interaction.reply(
        `Leveling channel has been set to <#${channel.id}>.`
      );
    } catch (err) {
      console.error("Error setting leveling channel:", err);
      return interaction.reply(
        "An error occurred while setting leveling channel."
      );
    }
  },
};
