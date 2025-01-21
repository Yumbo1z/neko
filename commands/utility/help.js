const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require("discord.js");

module.exports = {
  name: "help",
  aliases: ["h", "info"],
  description: "Get some help!",
  run: async (client, message, args) => {
    const helpEmbed = new EmbedBuilder()
      .setTitle("Here's all of my commands <a:A_toroDance:1146553585635696670>")
      .setColor("#8c4ec4");

    // Fetch all commands and group them by category (directory)
    const directories = [
      ...new Set(client.slashCommands.map((cmd) => cmd.directory)),
    ];

    let description = "";

    directories.forEach((dir) => {
      const commandsInDir = client.slashCommands
        .filter((cmd) => cmd.directory === dir)
        .map((cmd) => `\`/${cmd.data.name}\``)
        .join(" ");

      description += `**${dir}**\n${commandsInDir}\n\n`;
    });

    // Add the generated description to the embed
    helpEmbed.setDescription(description);

    const buttonRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("Support Server")
        .setStyle(5)
        .setURL("https://discord.gg/zABQqMNvNa"), // Your support server link
      new ButtonBuilder()
        .setLabel("Super Fighters")
        .setStyle(5)
        .setURL("https://gentleman-production.up.railway.app/home") // Your website link
    );

    await message.channel.send({
      embeds: [helpEmbed],
      components: [buttonRow],
    });
  },
};
