const { PermissionFlagsBits } = require("discord.js");
const serverSchema = require("../../models/serverData");
const xpModel = require("../../models/xp");

module.exports = {
  data: {
    name: "setlevel",
    description: "Set level to a user",
    default_member_permissions: PermissionFlagsBits.ManageChannels.toString(),
    options: [
      {
        name: "user",
        description: "the user to give levels to",
        type: 6,
        required: true,
      },
      {
        name: "level",
        description: "level to set",
        type: 4,
        required: true,
      },
    ],
    integration_types: [0],
  },
  run: async (client, interaction, args, username) => {
    const targetUser = interaction.options.get("user").member;
    const amount = interaction.options.getInteger("level");

    if (!targetUser || isNaN(amount) || amount <= 0) {
      return interaction.reply({
        content:
          "Please provide a valid user and a positive integer amount of levels to give.",
        ephemeral: true,
      });
    }

    try {
      const server = await serverSchema.findOne({
        guildID: interaction.guild.id,
      });
      if (!server || !server.leveling.enabled) {
        return interaction.reply({
          content: "Leveling system is not enabled for this server.",
          ephemeral: true,
        });
      }

      let userData = await xpModel.findOne({
        server: interaction.guild.id,
        user: targetUser.id,
      });

      // Create new user data if not exists
      if (!userData) {
        userData = new xpModel({
          server: interaction.guild.id,
          user: targetUser.id,
          level: 1,
          xp: 0,
        });
      }

      userData.level = amount;

      // Inform user
      await interaction.reply(
        `Successfully set level ${amount} to ${targetUser}.`
      );

      // Save the updated user data
      await userData.save();
    } catch (err) {
      console.error("Error giving levels:", err);
      return interaction.reply({
        content: "An error occurred while giving levels.",
        ephemeral: true,
      });
    }
  },
};
