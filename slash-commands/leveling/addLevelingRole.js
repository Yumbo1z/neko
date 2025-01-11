const { PermissionFlagsBits } = require("discord.js");
const serverSchema = require("../../models/serverData");

module.exports = {
  data: {
    name: "addlevelingrole",
    description: "add a role to the leveling system",
    default_member_permissions: PermissionFlagsBits.ManageRoles.toString(),
    options: [
      {
        name: "level",
        description: "the level at which the role will be given",
        type: 4,
        required: true,
      },
      {
        name: "role",
        description: "the role to be given",
        type: 8,
        required: true,
      },
    ],
    integration_types: [0],
  },
  run: async (client, interaction, args, username) => {
    const guildID = interaction.guild.id;
    const level = interaction.options.getInteger("level");
    const role = interaction.options.getRole("role");

    try {
      let server = await serverSchema.findOne({ guildID });
      if (!server)
        server = await serverSchema.create({
          guildID: interaction.guild.id,
        });

      // Check if the role is already in the array
      if (server.leveling.roles.some((r) => r.role === role.id))
        return interaction.reply({
          content: "This role is already set for leveling.",
          ephemeral: true,
        });

      // Check if the level is already in the array
      if (server.leveling.roles.some((r) => r.level === level))
        return interaction.reply({
          content: "A role is already set for this level.",
          ephemeral: true,
        });

      // Add the role to the leveling roles array
      server.leveling.roles.push({ level, role: role.id });

      await server.save();

      // Inform the user about the change
      return interaction.reply(
        `Role <@&${role.id}> will now be given at level ${level}.`
      );
    } catch (err) {
      console.error("Error adding leveling role:", err);
      return interaction.reply("An error occurred while adding leveling role.");
    }
  },
};
