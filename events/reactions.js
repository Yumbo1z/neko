const client = require("../index");
const serverSchema = require("../models/serverData");
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require("discord.js");

client.on("messageReactionAdd", async (reaction, user) => {
  try {
    if (reaction.partial) {
      await reaction.fetch();
    }

    const { message, emoji } = reaction;

    let server = await serverSchema.findOne({
      guildID: message.guild.id,
    });

    if (!server) return;
    if (!server.starboardSystem) return;
    if (!server.starboardSystem.channel) return;

    const SBchannelId = server.starboardSystem.channel;
    const starBoardChannel = client.channels.cache.get(SBchannelId);
    if (!starBoardChannel) return;

    // reqs
    if (user.bot || !message.guild) return; // Ignore bot reactions and reactions in DMs

    if (
      message.channel.id === SBchannelId &&
      message.author.id === client.user.id
    )
      return;

    const starCount = server.starboardSystem.interval || 2; // the star interval
    const starEmoji = server.starboardSystem.emoji || "⭐"; // the star emoji

    if (reaction.count >= starCount && emoji.name === starEmoji) {
      const msgs = await starBoardChannel.messages
        .fetch({ limit: 50 })
        .catch((err) => { });

      const SentMessage = msgs.find((msg) =>
        msg.embeds.length >= 1
          ? msg.embeds[0].footer.text.endsWith(message.id)
            ? true
            : false
          : false
      );

      if (SentMessage) {
        SentMessage.edit(
          `${starEmoji} **${reaction.count}** ● ${message.channel}`
        );
      } else {
        const jumprow = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setLabel("Jump to the message")
            .setStyle(5)
            .setURL(
              `https://discord.com/channels/${message.guildId}/${message.channel.id}/${message.id}`
            )
        );

        const attachments = message.attachments;
        const embeds = [];

        const embed = new EmbedBuilder()
          .setAuthor({
            name: `${message.author.username}`,
            iconURL: message.author.displayAvatarURL({ forceStatic: true }),
          })
          .addFields({
            name: "Content",
            value: `${message.content || "There is no content in this message!"
              }`,
          })
          .setFooter({ text: `ID: ${message.id}` })
          .setTimestamp()
          .setImage(attachments.first()?.proxyURL || null)
          .setColor("Yellow");

        embeds.push(embed);

        let firstAttachmentSkipped = false;

        for (const [_, attachment] of attachments) {
          if (!firstAttachmentSkipped) {
            firstAttachmentSkipped = true;
            continue;
          }

          let extraEmbed = new EmbedBuilder()
            .setImage(attachment.proxyURL)
            .setColor("Yellow");

          embeds.push(extraEmbed);
        }

        await starBoardChannel.send({
          content: `${starEmoji} **${reaction.count}** ● ${message.channel}`,
          embeds: embeds,
          components: [jumprow],
        });
      }
    }
  } catch (error) {
    //console.log(error);
    return;
  }
});

client.on("messageReactionRemove", async (reaction, user) => {
  try {
    if (reaction.partial) {
      await reaction.fetch();
    }

    const { message, emoji } = reaction;

    let server = await serverSchema.findOne({
      guildID: message.guild.id,
    });

    if (!server) return;
    if (!server.starboardSystem) return;
    if (!server.starboardSystem.channel) return;

    const SBchannelId = server.starboardSystem.channel;
    const starBoardChannel = client.channels.cache.get(SBchannelId);
    if (!starBoardChannel) return;

    // reqs
    if (user.bot || !message.guild) return; // Ignore bot reactions and reactions in DMs

    const starCount = server.starboardSystem.interval || 2; // the star interval
    const starEmoji = server.starboardSystem.emoji || "⭐"; // the star emoji

    if (emoji.name === starEmoji) {
      const msgs = await starBoardChannel?.messages
        .fetch({ limit: 50 })
        .catch(() => { });

      const SentMessage = msgs.find((msg) => msg.embeds.length >= 1
        ? msg.embeds[0]?.footer?.text?.endsWith(message.id)
          ? true
          : false
        : false
      );

      //EmbedBuilder.from

      if (SentMessage) {
        if (reaction.count >= starCount) {
          await SentMessage.edit(
            `${starEmoji} **${reaction.count}** ● ${message.channel}`
          );
        } else {
          await SentMessage?.delete();
        }
      }
    }
  } catch (error) {
    console.log(error);
    return;
  }
});
