const { SlashCommandBuilder } = require("discord.js");
const { Font, RankCardBuilder } = require("canvacord");
const serverSchema = require("../../models/serverData");
const xpModel = require("../../models/xp");

module.exports = {
  data: {
    name: "rank",
    description: "Display your leveling rank",
    integration_types: [0],
    options: [
      {
        name: "user",
        description: "Check their leveling rank",
        type: 6,
        required: false,
      },
    ],
  },
  run: async (client, interaction, args, username) => {
    await interaction.deferReply();
    let user = interaction.user;
    if (args[0]) user = await client.users.fetch(args[0]);

    try {
      const guildID = interaction.guild.id;
      const server = await serverSchema.findOne({ guildID });

      if (!server || !server.leveling.enabled) {
        return interaction
          .editReply({
            content: "Leveling has not been enabled on this server.",
            ephemeral: true,
          })
          .catch(() => {});
      }

      const userData = await xpModel.findOne({
        server: guildID,
        user: user.id,
      });

      if (!userData) {
        return interaction
          .editReply({
            content: "You don't have any leveling data.",
            ephemeral: true,
          })
          .catch(() => {});
      }

      const allUsersData = await xpModel.find({ server: guildID });

      // Sort users based on XP and level
      allUsersData.sort((a, b) => {
        if (a.xp !== b.xp) {
          return b.xp - a.xp; // Sort by XP descending
        } else {
          return b.level - a.level; // If XP is equal, sort by level descending
        }
      });

      // Calculate user's rank
      const userRank =
        allUsersData.findIndex((data) => data.user === user.id) + 1;

      Font.loadDefault();

      const card = new RankCardBuilder()
        .setDisplayName(user.globalName)
        .setUsername(user.username)
        .setAvatar(user.avatarURL({ extension: "webp", forceStatic: true }))
        .setCurrentXP(userData.xp) // Set user's current XP here
        .setRequiredXP(userData.level * 500) // Adjust calculation for required XP as needed
        .setLevel(userData.level)
        .setRank(userRank) // You may want to implement ranking based on XP or level
        .setBackground("#23272a");

      const image = await card.build({ format: "png" });

      interaction.editReply({ files: [image] }).catch(() => {});
    } catch (error) {
      console.error("Error creating rank image:", error);
      interaction
        .editReply("An error occurred while creating the rank image.")
        .catch(() => {});
    }
  },
};
