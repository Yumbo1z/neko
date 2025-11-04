const client = require("../index");
const buttonRolesSchema = require("../models/button-roles");
const { EmbedBuilder } = require("discord.js");

client.on("interactionCreate", async (interaction) => {
  // Handle button interactions for role assignments
  if (interaction.isButton()) {
    // Check if it's a button role interaction
    if (interaction.customId.startsWith("brole")) {
      await handleButtonRole(interaction);
      return;
    }
  }
});

async function handleButtonRole(interaction) {
  try {
    // Extract role ID from customId (remove 'brole' prefix)
    const roleId = interaction.customId.replace("brole", "");

    // Get the role from the guild
    const role = interaction.guild.roles.cache.get(roleId);

    if (!role) {
      return await interaction.reply({
        content:
          "❌ This role no longer exists. Please contact an administrator.",
        ephemeral: true,
      });
    }

    // Check if bot can manage this role
    const botMember = interaction.guild.members.me;
    if (role.position >= botMember.roles.highest.position) {
      return await interaction.reply({
        content:
          "❌ I cannot assign this role as it is higher than my highest role.",
        ephemeral: true,
      });
    }

    const member = interaction.member;

    // Check if user already has the role
    if (member.roles.cache.has(roleId)) {
      // Remove the role
      try {
        await member.roles.remove(roleId);
        await interaction.reply({
          content: `✅ Removed the **${role.name}** role from you.`,
          ephemeral: true,
        });
      } catch (error) {
        console.error("Error removing role:", error);
        await interaction.reply({
          content: "❌ Failed to remove the role. Please check my permissions.",
          ephemeral: true,
        });
      }
    } else {
      // Add the role
      try {
        await member.roles.add(roleId);
        await interaction.reply({
          content: `✅ Added the **${role.name}** role to you!`,
          ephemeral: true,
        });
      } catch (error) {
        console.error("Error adding role:", error);
        await interaction.reply({
          content: "❌ Failed to add the role. Please check my permissions.",
          ephemeral: true,
        });
      }
    }
  } catch (error) {
    console.error("Error in button role handler:", error);
    await interaction.reply({
      content: "❌ An error occurred while processing your request.",
      ephemeral: true,
    });
  }
}
