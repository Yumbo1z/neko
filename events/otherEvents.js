const count = require("../functions/counting");
const gtn = require("../functions/guess-the-number");
const xp = require("../functions/xp");
const userBan = require("../models/user-ban");
const { EmbedBuilder } = require("discord.js");

const client = require("../index");

client.on("messageCreate", async (message) => {
  let banned = await userBan.findOne({
    user: message.author.id,
  });
  if (banned) return;
  count(message);
  gtn(message);
  xp(message);
});
