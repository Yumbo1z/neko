const mongoose = require("mongoose");

const collabsSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  collabs: [
    {
      id: { type: String },
      maxGuests: { type: Number },
      guests: { type: Array },
      endsAt: { type: Date },
    },
  ],
});

module.exports = mongoose.model("Collabs", collabsSchema);
