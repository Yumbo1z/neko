const {
  EmbedBuilder,
  ButtonBuilder,
  ActionRowBuilder,
  PermissionFlagsBits,
} = require("discord.js");
const serverSchema = require("../../models/serverData");
const { disableButtons } = require("../../functions");
let ms = require("ms");

module.exports = {
  data: {
    name: "welcomer",
    description: "Configure welcomer in your server.",
    default_member_permissions: PermissionFlagsBits.ManageChannels.toString(),
    integration_types: [0],
    options: [
      {
        name: "type",
        description: "Which welcomer to configure.",
        type: 3,
        choices: [
          { name: "Hello (sent when member joins the server", value: "hello" },
          {
            name: "Goodbye (sent when member leaves the server",
            value: "leave",
          },
        ],
        required: true,
      },
      {
        name: "channel",
        description: "Specify the channel to setup for the chosen type.",
        type: 7, // Channel type
        channelTypes: [0, 5],
        required: true,
      },
      {
        name: "message",
        description:
          "Message for the chosen type. {user} {username} {server} {members} {nobots}",
        type: 3,
        minLength: 1,
        maxLength: 1000,
        required: true,
      },
      {
        name: "delete_reply",
        description: "Delete the reply after a certain time.",
        type: 3,
        required: false,
      },
    ],
  },
  run: async (client, interaction, args) => {
    const { options } = interaction;
    const type = options.getString("type");
    const channel = options.getChannel("channel");
    const message = options.getString("message");
    const delete_reply = options.getString("delete_reply");

    let errorEmbed = new EmbedBuilder().setColor("Red");

    let server = await serverSchema.findOne({
      serverID: interaction.guild.id,
    });

    if (!server)
      server = await serverSchema.create({
        serverID: interaction.guild.id,
        prefix: client.config.prefix,
      });

    if (delete_reply) {
      let time = ms(delete_reply);
      if (!time || time == undefined)
        return interaction.reply({
          content: "Please specify a valid time!",
          ephemeral: true,
        });
      server.welcomer.delete_reply = delete_reply;
    }

    if (type === "hello") {
      server.welcomer.channelForWelcome = channel.id;
      server.welcomer.welcomeMessage = message;

      await interaction.reply({
        content: `${
          client.success
        } Welcome message has been edited/configured.\n\n**DEMO:** ${await editWelcomerMessage(
          message,
          interaction.member,
        )}`,
        components: [
          new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId("disable_welcomer")
              .setLabel("Disable")
              .setStyle(4),
          ),
        ],
      });
    } else if (type === "leave") {
      server.welcomer.channelForLeaver = channel.id;
      server.welcomer.goodbyeMessage = message;

      await interaction.reply({
        content: `${
          client.success
        } Goodbye message has been edited/configured.\n\n**DEMO:** ${await editWelcomerMessage(
          message,
          interaction.member,
        )}`,
        components: [
          new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId("disable_leaver")
              .setLabel("Disable")
              .setStyle(4),
          ),
        ],
      });
    }

    await serverSchema.findOneAndUpdate(
      { serverID: interaction.guild.id },
      server,
    );
  },
};

async function editWelcomerMessage(content, member) {
  const reg = new RegExp("{username}");
  const reg2 = new RegExp("{server}");
  const reg3 = new RegExp("{members}");
  const reg4 = new RegExp("{user}");
  const reg5 = new RegExp("{nobots}");

  let nonBotCount;
  try {
    const fetched = await member.guild.members.fetch();
    nonBotCount = fetched.filter((m) => !m.user.bot).size;
  } catch (e) {
    nonBotCount = member.guild.members.cache.filter((m) => !m.user.bot).size;
  }

  let newStr;
  newStr = content.replace(reg, member.user.username);
  newStr = newStr.replace(reg2, member.guild.name);
  newStr = newStr.replace(reg3, member.guild.memberCount.toString());
  newStr = newStr.replace(reg4, member.user);
  newStr = newStr.replace(reg5, nonBotCount.toString());

  return newStr;
}
