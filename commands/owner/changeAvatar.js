const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "change-avatar",
  aliases: ["avatar", "change"],
  staff: true,
  run: async (client, message, args) => {
    if (
      !message.attachments.first() ||
      message.attachments.first() == undefined
    )
      return;

    let newAvatarURL = message.attachments.first().url;

    client.user.setAvatar(newAvatarURL);

    message.channel.send(
      `> Successfully updated bot avatar! Did you make me more handsome?`
    );

    client.channels.cache
      .get("1095819652011143279")
      .send(
        `> **${message.author.username}** changed the bot's [avatar](${newAvatarURL})`
      );
  },
};
