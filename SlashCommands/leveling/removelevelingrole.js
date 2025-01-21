const { PermissionFlagsBits } = require("discord.js");
const serverSchema = require("../../models/serverData");

module.exports = {
  data: {
    name: "removelevelingrole",
    description: "Remove a role from the leveling system",
    default_member_permissions: PermissionFlagsBits.ManageRoles.toString(),
    options: [
      {
        name: "level",
        description: "The level of the role to remove",
        type: 4,
        required: true,
      },
    ],
    integration_types: [0],
  },
  run: async (client, interaction, args, username) => {
    const guildID = interaction.guild.id;
    const level = interaction.options.getInteger("level");

    try {
      let server = await serverSchema.findOne({ guildID });
      if (!server || !server.leveling.roles.length) {
        return interaction.reply({
          content: "There are no leveling roles set on this server.",
          ephemeral: true,
        });
      }

      // Find the index of the role to remove
      const index = server.leveling.roles.findIndex(
        (role) => role.level === level
      );

      if (index === -1) {
        return interaction.reply({
          content: `There is no role set for level ${level}.`,
          ephemeral: true,
        });
      }

      // Remove the role from the leveling roles array
      server.leveling.roles.splice(index, 1);

      await server.save();

      // Inform the user about the change
      return interaction.reply(
        `Role for level ${level} has been removed from the leveling system.`
      );
    } catch (err) {
      console.error("Error removing leveling role:", err);
      return interaction.reply(
        "An error occurred while removing leveling role."
      );
    }
  },
};