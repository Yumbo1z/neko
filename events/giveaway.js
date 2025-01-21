const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    Collection,
  } = require("discord.js");
  
  const client = require("../index.js");
  let giveawaySchema = require("../models/giveaway");
  const { disableButtons } = require("../functions/util.js");
  
  client.on("ready", () => {
    setInterval(async () => {
      let giveawayCheck = await giveawaySchema.findOne({
        endsAt: Math.floor(new Date().getTime() / 1000),
      });
      if (giveawayCheck) {
        let channel = await client.channels.fetch(giveawayCheck.channel);
        let message = await channel.messages.fetch(giveawayCheck.msg);
  
        message.edit({
          content: "**Giveaway Ended!**",
          components: disableButtons(message.components),
        });
  
        if (!giveawayCheck.users || giveawayCheck.users.length <= 0) {
          message.reply(
            `Failed to choose a winner! No one joined the giveaway...`
          );
          await giveawaySchema.deleteOne({
            endsAt: Math.floor(new Date().getTime() / 1000),
          });
        } else {
          let timeNow = Math.floor(new Date().getTime() / 1000);
          let winner = () => {
            return giveawayCheck.users
              .sort(() => Math.random() - Math.random())
              .slice(0, giveawayCheck.winners)
              .join("> & <@!");
          };
  
          await message.reply({
            content: `🎉 | The winner is... <@!${winner()}>!\n**Congratulations!** you won ${
              giveawayCheck.prize
            }!\n\`${giveawayCheck.users.length} Entrants\``,
          });
        }
      }
    }, 1000);
  });
  
  client.on("interactionCreate", async (i) => {
    if (!i.isButton()) return;
    if (!i.channel) return;
    let params = {
      msg: i.message.id,
      guild: i.guild.id,
      channel: i.channel.id,
    };
    let gw = await giveawaySchema.findOne(params);
  
    if (gw) {
      if (gw.host == i.user.id)
        return i.reply({
          content: "Host can not join the giveaway, sorry.",
          ephemeral: true,
        });
      if (gw.users.includes(i.user.id)) {
        //get embed and edit
        let value = gw.users.length;
        i.message.embeds[0].fields[3].value = `${(value -= 1)}`;
        await i.update({ embeds: [i.message.embeds[0]] });
        await i.followUp({
          content: "You left the giveaway!",
          ephemeral: true,
        });
        await giveawaySchema.findOneAndUpdate(params, {
          $pull: {
            users: i.user.id,
          },
        });
      } else {
        if (gw.role !== null) {
          if (!i.member.roles.cache.has(gw.role))
            return i.reply({
              content: `You can't join the giveaway because you don't have the required role`,
              ephemeral: true,
            });
        }
        //get embed and edit
        let value = gw.users.length;
        i.message.embeds[0].fields[3].value = `${(value += 1)}`;
        await i.update({ embeds: [i.message.embeds[0]] });
        await i.followUp({
          content: `You joined the giveaway!`,
          ephemeral: true,
        });
        await giveawaySchema.findOneAndUpdate(params, {
          $push: {
            users: i.user.id,
          },
        });
      }
    }
  });
  