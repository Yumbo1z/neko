const { SlashCommandBuilder, AttachmentBuilder } = require("discord.js");
const axios = require("axios");

module.exports = {
  name: "neko",
  description: "Generate a neko image!",
  run: async (client, message, args) => {
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

      message.reply({
        files: [Image],
      });
    } catch (error) {
      console.error("Error fetching neko image:", error);
      message.reply(
        "An error occurred while fetching the neko image.\n" + error + ""
      );
    }
  },
};
