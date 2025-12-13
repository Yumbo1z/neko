const mongoose = require("mongoose");

const collabsSchema = new mongoose.Schema({
  collabId: { type: String },
  maxGuests: { type: Number },
  guests: { type: Array },
  startsAt: { type: Date },
  hostId: { type: String },
  channelId: { type: String },
  guiildId: { type: String },
});

module.exports = mongoose.model("Collabs", collabsSchema);
