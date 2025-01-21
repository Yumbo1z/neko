const client = require("../index");
const serverSchema = require("../models/serverData");

client.on("guildDelete", async (guild) => {
    await serverSchema
        .findOneAndDelete({
            guildID: guild.id,
        })
        .catch((err) => { });
});
