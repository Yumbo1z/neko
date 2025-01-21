const serverSchema = require("../../models/serverData");
const { PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: {
    name: "leveling",
    description: "toggle leveling on your server",
    default_member_permissions: PermissionFlagsBits.ManageChannels.toString(),
    integration_types: [0],
  },
  run: async (client, interaction, args, username) => {
    const guildID = interaction.guild.id;

    try {
      const server = await serverSchema.findOne({ guildID });
      if (!server)
        server = await serverSchema.create({
          guildID: interaction.guild.id,
        });

      // Toggle levelingEnabled
      server.leveling.enabled = !server.leveling.enabled;

      await server.save();

      // Inform the user about the change
      return interaction.reply(
        `Leveling has been ${
          server.leveling.enabled ? "enabled" : "disabled"
        } for this server.`
      );
    } catch (err) {
      console.error("Error toggling leveling:", err);
      return interaction.reply("An error occurred while toggling leveling.");
    }
  },
};
