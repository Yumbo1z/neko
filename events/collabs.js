const client = require("../index.js");
let collabsSchema = require("../models/collabs");

client.on("ready", () => {
  setInterval(async () => {
    let collabRemind = await collabsSchema.findOne({
      startsAt: Math.floor(new Date().getTime() / 1000),
    });
    let daybefore = await collabsSchema.findOne({
      startsAt: Math.floor(new Date().getTime() / 1000) + 86400,
    });
    let twohours = await collabsSchema.findOne({
      startsAt: Math.floor(new Date().getTime() / 1000) + 7200,
    });
    if (twohours) {
      let channel = await client.channels.fetch(twohours.channelId);
      let host = `<@${twohours.hostId}>`;
      let guests = twohours.guests.map((g) => `<@${g}>`).join(", ");
      channel.send(
        `⏰ **Reminder:** The collab with ID: **${twohours.collabId}** is starting in 2 hours!\n**Host:** ${host}\n**Guests:** ${guests}`
      );
    }
    if (daybefore) {
      let channel = await client.channels.fetch(daybefore.channelId);
      let host = `<@${daybefore.hostId}>`;
      let guests = daybefore.guests.map((g) => `<@${g}>`).join(", ");

      channel.send(
        `⏰ **Reminder:** The collab with ID: **${daybefore.collabId}** is starting in 24 hours!\n**Host:** ${host}\n**Guests:** ${guests}`
      );
    }
    if (collabRemind) {
      let channel = await client.channels.fetch(collabRemind.channelId);
      let host = `<@${collabRemind.hostId}>`;
      let guests = collabRemind.guests.map((g) => `<@${g}>`).join(", ");

      channel.send(
        `⏰ **Reminder:** The collab with ID: **${collabRemind.collabId}** is starting now!\n**Host:** ${host}\n**Guests:** ${guests}`
      );
      await collabsSchema.deleteOne({
        startsAt: Math.floor(new Date().getTime() / 1000),
      });
    }
  }, 1000);
});
