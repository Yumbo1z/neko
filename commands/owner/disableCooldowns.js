const { EmbedBuilder } = require("discord.js");
const cooldownSchema = require("../../models/slash-cooldown"); // Replace with the actual path

module.exports = {
  name: "remove-cooldowns",
  staff: true,
  run: async (client, message, args) => {
    try {
      let userID =
        message.mentions.users.first()?.id ||
        client.users.cache.get(args[0])?.id ||
        message.author.id;
      // Find and delete all cooldowns for the specified user
      await cooldownSchema.deleteMany({ userID: userID });

      // Inform the user that cooldowns have been removed
      message.reply(`> Removed all current cooldowns for ${userID}.`);
    } catch (error) {
      console.error(error);
      // Handle errors, e.g., sending an error message to the user
      message.reply(`> An error occured.`);
    }
  },
};
