const mongoose = require("mongoose");

const Schema = new mongoose.Schema({
  user: String,
  reason: String,
});
module.exports = mongoose.model("bans", Schema);
