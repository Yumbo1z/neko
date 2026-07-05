const mongoose = require("mongoose");

const serverData = mongoose.Schema({
  guildID: {
    type: String,
    required: true,
  },
  //server systems
  leveling: {
    enabled: Boolean,
    roles: Array,
    channel: String,
    premiumRole: String,
  },
  countingSystem: {
    channel: String,
  },
  guessTheNumberSystem: {
    channel: String,
  },
  starboardSystem: {
    channel: String,
    interval: Number,
    emoji: String,
  },
  ticketsSystem: {
    category: String,
    ticketRoles: Array,
    //categories: Array, // category: [{ title: string, role: string, modal: boolean, questions: array }]
  },
  welcomer: {
    channelForWelcome: String,
    channelForLeaver: String,
    welcomeMessage: String,
    goodbyeMessage: String,
    delete_reply: Number,
  },
});

module.exports = mongoose.model("serverData", serverData);
