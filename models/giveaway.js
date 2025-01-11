const mongoose = require(`mongoose`);

let reqString = {
  type: String,
  required: true,
};

const giveawaySchema = new mongoose.Schema({
  host: reqString,
  msg: reqString,
  prize: reqString,
  endsAt: reqString,
  guild: reqString,
  channel: reqString,
  winners: {
    type: Number,
    required: true,
  },
  users: {
    type: Array,
  },
  role: { type: String },
});

const model = mongoose.model("giveaway", giveawaySchema);

module.exports = model;
