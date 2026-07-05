const {
  EmbedBuilder,
  ButtonBuilder,
  ActionRowBuilder,
  AuditLogEvent,
} = require("discord.js");
const client = require("../index");
const serverSchema = require("../models/serverData");
let wait = require("node:timers/promises").setTimeout;

client.on("guildDelete", async (guild) => {
  await serverSchema
    .findOneAndDelete({
      guildID: guild.id,
    })
    .catch((err) => {});
});



client.on("guildMemberAdd", async (member) => {
  let server = await serverSchema.findOne({
    serverID: member.guild.id,
  });
  if (!server) return;
  if (!server.welcomer.channelForWelcome || !server.welcomer.welcomeMessage)
    return;

  const content = await editWelcomerMessage(
    server.welcomer.welcomeMessage,
    member,
  );

  try {
    let message = await client.channels.cache
      .get(server.welcomer.channelForWelcome)
      .send({
        content,
      });

    if (server.welcomer.delete_reply) {
      await wait(server.welcomer.delete_reply);
      await message.delete();
    }
  } catch (e) {
    console.log(e);
  }
});

client.on("guildMemberRemove", async (member) => {
  let server = await serverSchema.findOne({
    serverID: member.guild.id,
  });
  
  if (!server) return;
  if (!server.welcomer.channelForLeaver || !server.welcomer.goodbyeMessage)
    return;

  const content = await editWelcomerMessage(
    server.welcomer.goodbyeMessage,
    member,
  );

  try {
    let message = await client.channels.cache
      .get(server.welcomer.channelForLeaver)
      .send({
        content,
      });

    if (server.welcomer.delete_reply) {
      await wait(server.welcomer.delete_reply);
      await message.delete();
    }
  } catch (e) {
    console.log(e);
  }
});

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