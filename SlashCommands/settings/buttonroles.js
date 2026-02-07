const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  PermissionFlagsBits,
} = require("discord.js");
const brModel = require("../../models/button-roles");
const { disableButtons } = require("../../functions/util.js");

module.exports = {
  data: {
    name: "button-role",
    default_member_permissions: PermissionFlagsBits.ManageRoles.toString(),
    description: "Set up button roles for your server.",
    options: [
      {
        name: "setup",
        description: "Create or delete a role selection panel",
        type: 1,
        options: [
          {
            name: "name",
            description: "role panel to add or delete.",
            required: true,
            type: 3,
            required: true,
          },
        ],
      },
      {
        name: "add",
        description: "Add a button role to a panel",
        type: 1,
        options: [
          {
            name: "panel",
            description: "role panel to ad a role to.",
            type: 3,
            required: true,
            autocomplete: true,
          },
          {
            name: "role",
            description: "role to be assigned",
            type: 8,
            required: true,
          },
          {
            name: "color",
            description:
              "color for the role. Colors: Red, Blurple, Grey, Green",
            type: 3,
            required: true,
            choices: [
              { name: "Blue", value: "1" },
              { name: "Red", value: "4" },
              { name: "Grey", value: "2" },
              { name: "Green", value: "3" },
            ],
          },
          {
            name: "emoji",
            description:
              "emoji for the role. No custom emojis allowed. None if no emoji",
            type: 3,
            required: false,
          },
        ],
      },
      {
        name: "remove",
        description: "Remove a role from a panel",
        type: 1,
        options: [
          {
            name: "panel",
            description: "role panel to remove.",
            type: 3,
            required: true,
            autocomplete: true,
          },
          {
            name: "role",
            description: "role to be removed",
            type: 8,
            required: true,
          },
        ],
      },
      {
        name: "panel",
        description: "Send a role panel to this channel",
        type: 1,
        options: [
          {
            name: "panel",
            description: "role panel to show.",
            type: 3,
            required: true,
            autocomplete: true,
          },
        ],
      },
      {
        name: "list",
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

    if (SUB_COMMAND === "setup") {
      const name = interaction.options.getString("name");

      let da = await brModel.findOne({
        guildId: interaction.guild.id,
      });

      if (!da) {
        da = await brModel.create({
          guildId: interaction.guild.id,
        });
        da.panels.push({ name: name, roles: [] });
        da.save();
        return interaction.reply(`Role panel added successfully. ${name}`);
      }

      if (da.panels.find((v) => v.name === name)) {
        let buttons = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId("yes").setLabel("Accept").setStyle(3),
          new ButtonBuilder().setCustomId("no").setLabel("Decline").setStyle(4),
        );

        let confirm = await interaction.reply({
          embeds: [
            errorEmbed.setDescription(
              "**I can't assign that panel because it already exists, do you want me to delete it?**",
            ),
          ],
          components: [buttons],
          fetchReply: true,
        });

        const collector = confirm.createMessageComponentCollector({
          time: 25000,
        });

        collector.on("collect", async (i) => {
          if (i.user.id !== interaction.user.id)
            return i.reply({
              content: "These buttons are not for you.",
              ephemeral: true,
            });
          if (i.customId === "no") {
            await i
              .update({
                embeds: [
                  errorEmbed.setDescription(
                    "**I will not delete the panel then.**",
                  ),
                ],
                components: disableButtons(confirm.components),
              })
              .catch((e) => {});
            collector.stop();
          }
          if (i.customId === "yes") {
            let filtered = da.panels.filter((v) => v.name !== name);
            da.panels = filtered;
            da.markModified("panels");
            da.save();
            await i
              .update({
                embeds: [
                  errorEmbed
                    .setDescription(`**Role panel deleted \`${name}\`**`)
                    .setColor("Green"),
                ],
                components: disableButtons(confirm.components),
              })
              .catch((e) => {});
            collector.stop();
          }
        });
      } else {
        da.panels.push({ name: name, roles: [] });
        da.save();
        interaction.reply({
          embeds: [
            errorEmbed
              .setDescription(`**Role panel added successfully: ${name}**`)
              .setColor("Green"),
          ],
        });
      }
    }

    if (SUB_COMMAND === "add") {
      const panel = args[1];
      const role = interaction.options.getRole("role");
      const emoji = interaction.options.getString("emoji");

      // Get the bot's highest role position
      const botHighestPosition =
        interaction.guild.members.me.roles.highest.position;

      // Get the moderator's highest role position
      const moderatorHighestPosition =
        interaction.member.roles.highest.position;

      // Check if the role is higher than OR equal to the bot's position
      if (role.position >= botHighestPosition) {
        return interaction.reply({
          content:
            "I can't assign that role because it's higher than or equal to my highest role.",
          ephemeral: true,
        });
      }

      // Check if the role is higher than the moderator's position
      if (role.position >= moderatorHighestPosition) {
        return interaction.reply({
          content:
            "You can't assign roles that are higher than or equal to your highest role.",
          ephemeral: true,
        });
      }

      let validEmoji = null;
      if (args[4]) {
        const emoRegex = /(\p{Emoji_Presentation}|\p{Extended_Pictographic})/gu;
        if (!emoRegex.test(emoji)) {
          return interaction.reply({
            content:
              "Please specify a valid Unicode emoji! Custom emojis are not allowed.",
            ephemeral: true,
          });
        }
        validEmoji = emoji;
      }

      let da = await brModel.findOne({
        guildId: interaction.guild.id,
      });

      if (!da)
        return interaction.reply({
          embeds: [
            errorEmbed.setDescription(`**This server has no role panels!**`),
          ],
          ephemeral: true,
        });

      if (da.panels.length >= 5)
        return interaction.reply({
          embeds: [
            errorEmbed.setDescription(
              `**This server has reached the max ammount of role panels \`5\`**`,
            ),
          ],
          ephemeral: true,
        });

      let index = da.panels.findIndex((v) => v.name === panel);
      const roleGroup = da.panels[index];

      if (!da.panels[index])
        return interaction.reply({
          embeds: [errorEmbed.setDescription(`**That panel does not exist.**`)],
          ephemeral: true,
        });

      if (da.panels[index].roles.length >= 15)
        return interaction.reply({
          embeds: [
            errorEmbed.setDescription(
              `**This panel has reached the max ammount of roles \`15\`**`,
            ),
          ],
          ephemeral: true,
        });

      const newRole = {
        label: role.name,
        customId: role.id,
        style: args[3],
        emoji: validEmoji,
      };

      let roleData = da.panels[index].roles.find((x) => x.label === role.name);
      if (roleData) {
        roleData = newRole;
      } else {
        da.panels[index].roles = [...da.panels[index].roles, newRole];
      }
      da.markModified("panels");
      await da.save();

      interaction.reply({
        embeds: [
          errorEmbed
            .setDescription(
              `A new button role has been added to role group **${roleGroup.name}\n\nDo \`/button-role panel\` to display the role(s).`,
            )
            .addFields({ name: "Role", value: `${role}` })
            .setColor("Green"),
        ],
      });
    }

    if (SUB_COMMAND === "remove") {
      const panel = interaction.options.getString("panel");
      const role = interaction.options.getRole("role");

      let da = await brModel.findOne({
        guildId: interaction.guildId,
      });

      if (!da)
        return interaction.reply({
          embeds: [
            errorEmbed.setDescription(`**This server has no role panels!**`),
          ],
          ephemeral: true,
        });

      let index = da.panels.findIndex((v) => v.name === panel);

      if (!da.panels[index])
        return interaction.reply({
          embeds: [errorEmbed.setDescription(`**That panel does not exist.**`)],
          ephemeral: true,
        });

      let guildRoles = da.panels[index].roles;

      const findRole = guildRoles.find((x) => x.label === role.name);

      if (!findRole)
        return interaction.reply({
          embeds: [
            errorEmbed.setDescription(`**That role is not in the panel.**`),
          ],
          ephemeral: true,
        });

      const filteredRoles = guildRoles.filter((x) => x.label !== role.name);

      da.panels[index].roles = filteredRoles;
      da.markModified("panels");
      await da.save();

      interaction.reply({
        embeds: [
          errorEmbed
            .setDescription(
              `**Removed button role: ${role} | Do \`/role-panel panel\` to see the button roles panel**`,
            )
            .setColor("Green"),
        ],
      });
    }

    if (SUB_COMMAND === "panel") {
      const panel = interaction.options.getString("panel");

      let da = await brModel.findOne({
        guildId: interaction.guildId,
      });

      if (!da)
        return interaction.reply({
          embeds: [
            errorEmbed.setDescription(`**This server has no role panels!**`),
          ],
          ephemeral: true,
        });

      let index = da.panels.findIndex((v) => v.name === panel);

      if (!da.panels[index])
        return interaction.reply({
          embeds: [errorEmbed.setDescription(`**That panel does not exist.**`)],
          ephemeral: true,
        });

      if (da.panels[index].roles.length === 0)
        return interaction.reply({
          content: "There are no button roles set for this panel.",
          ephemeral: true,
        });

      const buttons = [];
      const rows = [];
      let foundPanel = da.panels[index];

      for (let i = 0; i < foundPanel.roles.length; i++) {
        const role = interaction.guild.roles.cache.find(
          (r) => r.id === foundPanel.roles[i].customId,
        );

        const button = new ButtonBuilder()
          .setLabel(role.name)
          .setStyle(foundPanel.roles[i].style)
          .setCustomId(`brole${foundPanel.roles[i].customId}`)
          .setDisabled(false);

        if (foundPanel.roles[i].emoji) {
          button.setEmoji(foundPanel.roles[i].emoji);
        }

        buttons.push(button);
      }

      // Create action rows and add buttons
      for (let i = 0; i < Math.ceil(buttons.length / 5); i++) {
        const row = new ActionRowBuilder();
        const buttonSlice = buttons.slice(i * 5, (i + 1) * 5);
        row.addComponents(buttonSlice);
        rows.push(row);
      }

      const panelEmbed = new EmbedBuilder()
        .setTitle(foundPanel.name)
        .setDescription(`Get your roles here!`);

      interaction.reply({ content: "panel sent.", ephemeral: true });
      interaction.channel.send({
        embeds: [panelEmbed],
        components: rows,
      });
    }
    if (SUB_COMMAND === "list") {
      let da = await brModel.findOne({
        guildId: interaction.guildId,
      });

      if (!da || da.panels.length === 0) {
        return interaction.reply({
          embeds: [
            errorEmbed.setDescription(`**This server has no role panels!**`),
          ],
          ephemeral: true,
        });
      }

      const panelList = da.panels
        .map((panel) => `**${panel.name}** - ${panel.roles.length} roles`)
        .join("\n");

      const listEmbed = new EmbedBuilder()
        .setTitle("Role Panels")
        .setDescription(panelList)
        .setColor("Blue")
        .setFooter({ text: `Total panels: ${da.panels.length}` });

      interaction.reply({
        embeds: [listEmbed],
        ephemeral: true,
      });
    }
  },

  autocomplete: async (client, interaction) => {
    try {
      const focused = interaction.options.getFocused();
      let sub = null;
      try {
        sub = interaction.options.getSubcommand();
      } catch (e) {}

      if (sub !== "add" && sub !== "remove" && sub !== "panel") return interaction.respond([]);

      const da = await brModel.findOne({ guildId: interaction.guild.id });
      if (!da || !da.panels || da.panels.length === 0)
        return interaction.respond([]);

      const choices = da.panels
        .map((p) => ({ name: p.name, value: p.name }))
        .filter((c) =>
          String(c.name).toLowerCase().includes(String(focused).toLowerCase()),
        )
        .slice(0, 25);

      return interaction.respond(choices);
    } catch (err) {
      console.error(err);
      return interaction.respond([]);
    }
  },
};
