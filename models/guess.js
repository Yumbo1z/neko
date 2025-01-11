const mongoose = require("mongoose");

const count = mongoose.Schema({
    guildID: String,
    guessNumber: {
        type: Number,
        default: 0,
    },
    tries: {
        type: Number,
        default: 0,
    },
});

module.exports = mongoose.model("guessData", count);
