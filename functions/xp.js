const serverSchema = require("./../models/serverData");
const xpModel = require("./../models/xp");
const { PermissionsBitField, EmbedBuilder } = require("discord.js");

async function xp(message) {
  if (!message.guild) return;
  if (message.author.bot) return;

  try {
    let server = await serverSchema.findOne({
      guildID: message.guild.id,
    });

    if (!server || !server.leveling.enabled) return;

    let member = message.guild.members.cache.get(message.author.id);
    let hasRole = member.roles.cache.some(
      (role) => role.id === server.leveling?.premiumRole
    );

    let xpToGive = Math.floor(Math.random() * (30 - 15)) + 15;

    if (hasRole) xpToGive = Math.floor(xpToGive * (1 + 0.5));

    let userData = await xpModel.findOne({
      server: message.guild.id,
      user: message.author.id,
    });

    //update user data
    if (!userData) {
      userData = new xpModel({
        server: message.guild.id,
        user: message.author.id,
        level: 1,
        xp: xpToGive,
      });
    } else {
      userData.xp += xpToGive;
    }

    let xpNeeded = userData.level * 500;

    //user has leveled up
    if (xpNeeded <= userData.xp) {
      userData.level++;
      userData.xp -= xpNeeded;

      let role = null;
      //find leveling role
      if (server.leveling?.roles) {
        const foundLevelingRole = server.leveling.roles.find(
          (role) => role.level === userData.level
        );
        if (foundLevelingRole) {
          role = message.guild.roles.cache.get(foundLevelingRole.role);
          message.member.roles.add(role, `Level Up`).catch((err) => {});
        }
      }

      try {
        let customMessage = `🎉 **${message.member.displayName}**, you have reached level **${userData.level}**!`;
        customMessage = role
          ? customMessage + ` **${role.name}** was given to you!`
          : customMessage;

        message.guild.channels.cache
          .get(
            server.leveling?.channel
              ? server.leveling.channel
              : message.channel.id
          )
          .send({ content: customMessage });
      } catch (e) {
        console.error(e);
      }
    }

    await userData.save();
  } catch (err) {
    console.error("Error in XP system:", err);
  }
}

module.exports = xp;
