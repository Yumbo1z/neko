const { EmbedBuilder } = require("discord.js");

module.exports = {
  data: {
    name: "enlarge",
    description: "enlarge emoji(s)",
    options: [
      {
        name: "emoji",
        description: "emoji(s)",
        type: 3,
        required: true,
      },
    ],
  },
  run: async (client, interaction, args, username) => {
    const emojis = interaction.options.getString("emoji");

    let errorEmbed = new EmbedBuilder().setColor("Red");

    const regex = /<?(a)?:\w{2,32}:(\d{17,19})>?/g;
    let match;
    const enlargedEmojis = [];

    while ((match = regex.exec(emojis)) !== null) {
      const [, animated, id] = match;
      const imageUrl = `https://cdn.discordapp.com/emojis/${id}.${
        animated ? "gif" : "png"
      }`;
      enlargedEmojis.push(`Enlarged ${match[0]}\n${imageUrl}`);
    }

    if (enlargedEmojis.length === 0) {
      interaction.reply({
        content: "Could not find or enlarge any emojis.",
        ephemeral: true,
      });
    } else {
      interaction.reply({
        content: enlargedEmojis.join("\n"),
        ephemeral: true,
      });
    }
  },
};
