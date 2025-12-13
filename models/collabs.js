const mongoose = require("mongoose");

const collabsSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  collabs: [
    {
      collabId: { type: String },
      maxGuests: { type: Number },
      guests: { type: Array },
      startsAt: { type: Date },
      hostId: { type: String },
    },
  ],
});

module.exports = mongoose.model("Collabs", collabsSchema);
