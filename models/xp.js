const mongoose = require("mongoose");

const serverData = mongoose.Schema({
  server: {
    type: String,
    required: true,
  },
  user: {
    type: String,
    required: true,
  },
  level: {
    type: Number,
    default: 1,
  },
  xp: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model("xp", serverData);