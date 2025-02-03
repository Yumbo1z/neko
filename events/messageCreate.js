const client = require("../index");
const {
  EmbedBuilder,
  PermissionsBitField,
  ActionRowBuilder,
  ButtonBuilder,
} = require("discord.js");
const userBan = require("../models/user-ban");
const serverSchema = require("../models/serverData");

client.on("messageCreate", async (message) => {
  if (!message.guild) return;
  if (message.channel.type === "GUILD_PUBLIC_THREAD") return;
  const p = client.config.prefix;
  const mentionRegex = new RegExp(`^<@!?${client.user.id}>( |)$`);
  if (message.content.match(mentionRegex)) {
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setStyle(5)
        .setLabel(`Main Website`)
        .setURL(`https://gentleman-production.up.railway.app/home`),
      new ButtonBuilder()
        .setStyle(5)
        .setLabel("Support Server")
        .setURL("https://discord.gg/zABQqMNvNa")
    );

    const embed = new EmbedBuilder()
      .setTitle("Project Super, Gacha Game!")
      .setDescription(
        `Hey ${
          message?.member
            ? message?.member.displayName
            : message.author.globalName
        }, to get an array of my commands simply execute the command </help:0>! Have questions or regards, join the support server and we will assist you asap! Greetings by GuildNovel.`
      )
      .setColor("#8c4ec4");

    message
      .reply({
        embeds: [embed],
        components: [row],
      })
      .catch((err) => {});
  }
  if (!message.content.startsWith(p)) return;
  if (message.author.bot) return;
  if (!message.member)
    message.member = await message.guild.fetchMember(message);
  const args = message.content.slice(p.length).trim().split(/ +/g);
  const cmd = args.shift().toLowerCase();
  if (cmd.length == 0) return;
  const command =
    client.commands.get(cmd.toLowerCase()) ||
    client.commands.find((c) => c.aliases?.includes(cmd.toLowerCase()));

  if (!command) return;

  let banned = await userBan.findOne({
    user: message.author.id,
  });

  if (banned) return message.react("🚫").catch((err) => {});

  if (command?.staff === true && !client.staff.includes(message.author.id))
    return;

  if (command) {
    if (
      !message.guild.members.me
        .permissionsIn(message.channel)
        .has("SendMessages", "ViewMessages", "EmbedLinks")
    )
      return;

    command.run(client, message, args);
  }
});
