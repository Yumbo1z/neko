const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const serverSchema = require("../../models/serverData");

module.exports = {
  data: {
    name: "setstarboardinterval",
    description: "Set the starboard interval (1-10)",
    default_member_permissions: PermissionFlagsBits.ManageChannels.toString(),
    options: [
      {
        name: "interval",
        description: "The starboard interval (1-10)",
        type: 4, // INTEGER
        required: true,
        min_value: 1,
        max_value: 10,
      },
    ],
    integration_types: [0],
  },
  run: async (client, interaction, args, username) => {
    try {
      const interval = interaction.options.getInteger("interval");
      const errorEmbed = new EmbedBuilder().setColor("Red");

      // This check is redundant because of min/max_value in options, but kept for safety
      if (interval < 1 || interval > 10) {
        return interaction.reply({
          embeds: [
            errorEmbed.setDescription("Interval must be between 1 and 10."),
          ],
          ephemeral: true,
        });
      }

      // Use findOneAndUpdate to both find and update in one operation
      const server = await serverSchema.findOneAndUpdate(
        { guildID: interaction.guild.id },
        { $set: { "starboardSystem.interval": interval } },
        {
          upsert: true,
          new: true, // Return the updated document
          setDefaultsOnInsert: true,
        }
      );

      const successEmbed = new EmbedBuilder()
        .setDescription(`Successfully set starboard interval to ${interval}!`)
        .setColor("#8c4ec4");

      await interaction.reply({
        embeds: [successEmbed],
      });
    } catch (error) {
      console.error("Error in setstarboardinterval command:", error);

      const errorEmbed = new EmbedBuilder()
        .setColor("Red")
        .setDescription(
          "An error occurred while updating the starboard interval."
        );

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ embeds: [errorEmbed], ephemeral: true });
      } else {
        await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
      }
    }
  },
};
