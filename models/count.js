const mongoose = require("mongoose");

const count = mongoose.Schema({
  guildID: String,
  lastNumber: Number,
  lastUser: String,
  highestNumber: Number,
});

module.exports = mongoose.model("countData", count);
