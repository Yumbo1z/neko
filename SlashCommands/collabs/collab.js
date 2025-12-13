const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  PermissionFlagsBits,
} = require("discord.js");
const collabsSchema = require("../../models/collabs.js");
const { isWhole, isInteger } = require("../../functions/util.js");
let ms = require("ms");

module.exports = {
  data: {
    name: "collab",
    description: "Set up a new collab session.",
    options: [
      {
        name: "start",
        description: "Create or delete a role selection panel",
        type: 1,
        options: [
          {
            name: "starts in",
            description:
              "how long should the giveaway last? Example: 5h, 2 days, 30m",
            type: 3,
            required: true,
          },
          {
            name: "max guests",
            description: "how many guest can join?",
            type: 4,
            required: true,
          },
        ],
      },
      {
        name: "end",
        description: "Add a button role to a panel",
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
    }
  },
};
