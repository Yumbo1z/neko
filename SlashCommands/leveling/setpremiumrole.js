const { PermissionFlagsBits } = require("discord.js");
const serverSchema = require("../../models/serverData");

module.exports = {
  data: {
    name: "setpremiumrole",
    description: "Set the premium role for the leveling system",
    default_member_permissions: PermissionFlagsBits.ManageRoles.toString(),
    options: [
      {
        name: "role",
        description: "The premium role to set",
        type: 8,
        required: true,
      },
    ],
    integration_types: [0],
  },
  run: async (client, interaction, args, username) => {
    const guildID = interaction.guild.id;
    const premiumRole = interaction.options.getRole("role");

    try {
      let server = await serverSchema.findOne({ guildID });
      if (!server)
        server = await serverSchema.create({
          guildID: interaction.guild.id,
        });

      // Set the premium role
      server.leveling.premiumRole = premiumRole.id;

      await server.save();

      // Inform the user about the change
      return interaction.reply(
        `Premium role has been set to <@&${premiumRole.id}> for the leveling system.`
      );
    } catch (err) {
      console.error("Error setting premium role:", err);
      return interaction.reply("An error occurred while setting premium role.");
    }
  },
};
