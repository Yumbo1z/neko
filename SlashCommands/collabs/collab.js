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
const { channel } = require("diagnostics_channel");

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
            name: "collab-id",
            description: "The ID of the collab to join",
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
            name: "collab-id",
            description: "The ID of the collab to join",
            required: true,
            type: 3,
          },
        ],
      },
      {
        name: "join",
        description: "Join a collab session",
        type: 1,
        options: [
          {
            name: "collab-id",
            description: "The ID of the collab to join",
            required: true,
            type: 3,
          },
        ],
      },
      {
        name: "joined",
        description: "View the guests of a collab session",
        type: 1,
        options: [
          {
            name: "collab-id",
            description: "The ID of the collab to view",
            required: true,
            type: 3,
          },
        ],
      },
      {
        name: "involved-in",
        description: "List all collab sessions you are involved in",
        type: 1,
      },
      {
        name: "list",
        description: "List all collab sessions in this server",
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

      await giveawaySchema.create({
        collabId,
        maxGuests,
        startsAt: date,
        hostId: interaction.user.id,
        channelId: interaction.channel.id,
        guildId: interaction.guild.id,
        guests: [interaction.user.id],
      });

      await interaction.reply(
        `Congrats! Your collab has been created with ID: **${collabId}**. Guests use this ID to join!`
      );
    }
    if (SUB_COMMAND === "join") {
      const collabId = interaction.options.getString("collab-id");
      let collab = await collabsSchema.findOne({
        guildId: interaction.guild.id,
      });
      if (!collab)
        return interaction.reply({
          embeds: [errorEmbed.setDescription(`Collab not found!`)],
          ephemeral: true,
        });

      if (collab.guests.includes(interaction.user.id)) {
        return interaction.reply({
          embeds: [
            errorEmbed.setDescription(
              `You have already joined this collab! If you want to leave us /collab leave <collab id>`
            ),
          ],
          ephemeral: true,
        });
      }

      if (collab.guests.length >= collab.maxGuests) {
        return interaction.reply({
          embeds: [errorEmbed.setDescription(`This collab is already full!`)],
          ephemeral: true,
        });
      }

      collab.guests.push(interaction.user.id);
      await collab.save();

      return interaction.reply(
        `You have successfully joined the collab with ID: **${collabId}** We will remind you a day and hour before collab starts!`
      );
    }
    if (SUB_COMMAND === "list") {
      let collabs = await collabsSchema.find({ guildId: interaction.guild.id });
      if (!collabs || collabs.length === 0) {
        return interaction.reply({
          embeds: [
            errorEmbed.setDescription(`There are no collabs in this server!`),
          ],
          ephemeral: true,
        });
      }
      let collabList = collabs
        .map(
          (c) =>
            `**Collab ID:** ${c.collabId} | **Host:** <@${
              c.hostId
            }> | **Guests:** ${c.guests.length}/${
              c.maxGuests
            } | **Starts At:** <t:${Math.floor(c.startsAt.getTime() / 1000)}:F>`
        )
        .join("\n");
      let listEmbed = new EmbedBuilder()
        .setTitle("Collab Sessions in This Server")
        .setDescription(collabList)
        .setColor("Blue");
      return interaction.reply({ embeds: [listEmbed] });
    }
    if (SUB_COMMAND === "joined") {
      const collabId = interaction.options.getString("collab-id");
      let collab = await collabsSchema.findOne({
        collabId,
        guildId: interaction.guild.id,
      });
      if (!collab)
        return interaction.reply({
          embeds: [errorEmbed.setDescription(`Collab not found!`)],
          ephemeral: true,
        });
      let guestList = collab.guests.map((g) => `<@${g}>`).join("\n");
      let joinedEmbed = new EmbedBuilder()
        .setTitle(`Guests in Collab ID: ${collabId}`)
        .setDescription(guestList)
        .setColor("Green");
      return interaction.reply({ embeds: [joinedEmbed] });
    }
    if (SUB_COMMAND === "leave") {
      const collabId = interaction.options.getString("collab-id");
      let collab = await collabsSchema.findOne({
        collabId,
        guildId: interaction.guild.id,
      });
      if (!collab)
        return interaction.reply({
          embeds: [errorEmbed.setDescription(`Collab not found!`)],
          ephemeral: true,
        });
      if (!collab.guests.includes(interaction.user.id)) {
        return interaction.reply({
          embeds: [
            errorEmbed.setDescription(`You are not part of this collab!`),
          ],
          ephemeral: true,
        });
      }
      collab.guests = collab.guests.filter((g) => g !== interaction.user.id);
      await collab.save();
      return interaction.reply(
        `You have successfully left the collab with ID: **${collabId}**`
      );
    }
    if (SUB_COMMAND === "end") {
      const collabId = interaction.options.getString("collab-id");
      let collab = await collabsSchema.findOne({
        collabId,
        guildId: interaction.guild.id,
      });
      if (!collab)
        return interaction.reply({
          embeds: [errorEmbed.setDescription(`Collab not found!`)],
          ephemeral: true,
        });
      if (collab.hostId !== interaction.user.id) {
        return interaction.reply({
          embeds: [
            errorEmbed.setDescription(`Only the host can end this collab!`),
          ],
          ephemeral: true,
        });
      }
      await collabsSchema.deleteOne({
        collabId,
        guildId: interaction.guild.id,
      });
      return interaction.reply(
        `The collab with ID: **${collabId}** has been successfully ended.`
      );
    }
    if (SUB_COMMAND === "involved-in") {
      let collabs = await collabsSchema.find({
        guildId: interaction.guild.id,
        guests: interaction.user.id,
      });
      if (!collabs || collabs.length === 0) {
        return interaction.reply({
          embeds: [
            errorEmbed.setDescription(
              `You are not involved in any collabs in this server!`
            ),
          ],
          ephemeral: true,
        });
      }
      let collabList = collabs
        .map(
          (c) =>
            `**Collab ID:** ${c.collabId} | **Host:** <@${
              c.hostId
            }> | **Guests:** ${c.guests.length}/${
              c.maxGuests
            } | **Starts At:** <t:${Math.floor(c.startsAt.getTime() / 1000)}:F>`
        )
        .join("\n");
      let listEmbed = new EmbedBuilder()
        .setTitle("Collab Sessions You Are Involved In")
        .setDescription(collabList)
        .setColor("Blue");
      return interaction.reply({ embeds: [listEmbed] });
    }
  },
};
