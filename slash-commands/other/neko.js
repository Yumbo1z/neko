const { SlashCommandBuilder, AttachmentBuilder } = require("discord.js");
const axios = require("axios");

module.exports = {
  data: {
    name: "neko",
    description: "Generate a neko image!",
    integration_types: [0, 1],
    contexts: [0, 1, 2],
  },
  run: async (client, interaction, args, username) => {
    await interaction.deferReply();
    try {
      // Include the API key in the headers
      const apiKey = "015445535454455354D6";
      const response = await axios.get(
        "https://nekobot.xyz/api/image?type=neko",
        {
          headers: {
            Authorization: apiKey,
          },
        }
      );

      const Image = response.data.message;

      interaction
        .editReply({
          files: [Image],
        })
        .catch(() => {});
    } catch (error) {
      console.error("Error fetching neko image:", error);
      interaction
        .editReply(
          "An error occurred while fetching the neko image.\n" + error + ""
        )
        .catch(() => {});
    }
  },
};
