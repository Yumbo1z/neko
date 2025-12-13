const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  PermissionFlagsBits,
} = require("discord.js");
const collabsSchema = require("../../models/collabs.js");
const { isWhole, isInteger } = require("../../functions/util.js");
let ms = require("ms");
const crypto = require("crypto");

module.exports = {
  data: {
    name: "collab",
    description: "Set up a new collab session.",
    options: [
      {
        name: "start",
        description: "Start a new collab session",
        type: 1,
        options: [
          {
            name: "starts-in",
            description:
              "When should the collab start? Example: 5h, 2 days, 30m",
            type: 3,
            required: true,
          },
          {
            name: "max-guests",
            description: "Maximum number of guests allowed in the collab",
            type: 4,
            required: true,
          },
        ],
      },
      {
        name: "end",
        description: "End a collab session",
        type: 1,
        options: [
          {
            name: "collab id",
            description: "role panel to ad a role to.",
            required: true,
            type: 3,
          },
        ],
      },
      {
        name: "leave",
        description: "Remove a role from a panel",
        type: 1,
        options: [
          {
            name: "collab id",
            description: "role panel to remove.",
            required: true,
            type: 3,
          },
        ],
      },
      {
        name: "join",
        description: "Send a role panel to this channel",
        type: 1,
        options: [
          {
            name: "collab id",
            description: "role panel to show.",
            required: true,
            type: 3,
          },
        ],
      },
      {
        name: "check-availability",
        description: "See all role panels in this server",
        type: 1,
      },
    ],
    integration_types: [0],
  },
  run: async (client, interaction, args, username) => {
    const { options } = interaction;

    const SUB_COMMAND = await options.getSubcommand();

    let errorEmbed = new EmbedBuilder().setColor("Red");

    if (SUB_COMMAND === "start") {
      const i2 = interaction.options.getString("starts-in");
      const i3 = interaction.options.getInteger("max-guests");

      let time = ms(i2);
      if (!time || time == undefined)
        return interaction.reply({
          embeds: [errorEmbed.setDescription(`Please specify a valid time!`)],
          ephemeral: true,
        });

      let duration = Math.floor(time / 1000);
      let date = new Date(new Date().getTime() + time);

      if (!isWhole(i3))
        return interaction.reply({
          embeds: [errorEmbed.setDescription(`**Not a valid number!**`)],
          ephemeral: true,
        });

      if (!isInteger(i3))
        return interaction.reply({
          embeds: [errorEmbed.setDescription(`**Not a valid number!**`)],
          ephemeral: true,
        });

      let maxGuests = Number(i3);
      const collabId = crypto.randomBytes(4).toString("hex");

      let collab = await giveawaySchema.create({
        collabId,
        maxGuests,
        startsAt: date,
        hostId: interaction.user.id,
      });

      await interaction.reply(
        `Congrats! Your collab has been created with ID: **${collabId}**. Guests use this ID to join!`
      );
    }
  },
};
