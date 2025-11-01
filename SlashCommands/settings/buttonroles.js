const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  PermissionsBitField,
} = require("discord.js");
const brModel = require("../../models/bRoles");
const { disableButtons } = require("../../functions/util.js");
const serverSchema = require("../../models/serverData");

module.exports = {
  name: "role-panel",
  userPerms: ["Administrator"],
  description: "Set up button roles for your server.",
  options: [
    {
      name: "create-delete",
      description: "create or delete a role panel",
      type: 1,
      userPerms: ["MANAGE_GUILD"],
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
      name: "list",
      description: "see all of the role panels in the server.",
      type: 1,
    },
    {
      name: "add",
      description: "Add roles to a role panel",
      type: 1,
      userPerms: ["MANAGE_GUILD"],
      options: [
        {
          name: "panel",
          description: "role panel to ad a role to.",
          required: true,
          type: 3,
          required: true,
        },
        {
          name: "role",
          description: "role to be assigned",
          type: 8,
          required: true,
        },
        {
          name: "color",
          description: "color for the role. Colors: Red, Blurple, Grey, Green",
          type: 3,
          required: true,
        },
        {
          name: "emoji",
          description: "emoji for the role. No custom emojis allowed ",
          type: 3,
          required: true,
        },
      ],
    },
    {
      name: "remove",
      description: "Remove roles of a roles panel",
      type: 1,
      userPerms: ["MANAGE_GUILD"],
      options: [
        {
          name: "panel",
          description: "role panel to remove.",
          required: true,
          type: 3,
          required: true,
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
      description: "Send the role pannel to the current channel",
      type: 1,
      userPerms: ["MANAGE_GUILD"],
      options: [
        {
          name: "panel",
          description: "role panel to show.",
          required: true,
          type: 3,
          required: true,
        },
      ],
    },
  ],
  run: async (client, interaction, args) => {
    const { options } = interaction;

    const SUB_COMMAND = await options.getSubcommand();

    let errorEmbed = new EmbedBuilder().setColor("Red");

    if (SUB_COMMAND === "create-delete") {
      const name = interaction.options.getString("name");

      let perms = {
        userPerms: ["ManageRoles", "ManageChannels"],
        botPerms: ["ManageRoles", "SendMessages", "ViewChannel", "EmbedLinks"],
      };
      let perm = permCheck(perms, interaction);
      if (perm !== true) return;

      let da = await brModel.findOne({
        guild: interaction.guild.id,
      });

      if (!da) {
        da = await brModel.create({
          guild: interaction.guild.id,
        });
        da.panels.push({ name: name, roles: [] });
        da.save();
        return interaction.reply(`Role panel added successfully. ${name}`);
      }

      if (da.panels.find((v) => v.name === name)) {
        let buttons = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId("yes").setLabel("Accept").setStyle(3),
          new ButtonBuilder().setCustomId("no").setLabel("Decline").setStyle(4)
        );

        let confirm = await interaction.reply({
          embeds: [
            errorEmbed.setDescription(
              "**I can't assign that panel because it already exists, do you want me to delete it?**"
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
                    "**I will not delete the panel then.**"
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
      const panel = interaction.options.getString("panel");
      let dc = interaction.options.getString("color");
      let emo = interaction.options.getString("emoji");
      const role = interaction.options.getRole("role");

      let perms = {
        userPerms: ["Administrator"],
        botPerms: ["ManageRoles", "SendMessages", "ViewChannel", "EmbedLinks"],
      };
      let perm = permCheck(perms, interaction);
      if (perm !== true) return;

      if (role.position >= interaction.guild.members.me.roles.highest.position)
        return interaction.reply({
          content: "I can't assign that role that is higher or equal to me",
          ephemeral: true,
        });

      let emoRegex =
        /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/g;
      if (
        emo.toLowerCase() === "none" ||
        emo.toLowerCase() === "null" ||
        emo.toLowerCase() === "no emoji"
      ) {
        emo = null;
      } else {
        let test = emoRegex.test(emo);
        if (test == false) {
          return interaction.reply({
            content:
              "Please specify a valid discord emoji no custom emojis allowed!",
            ephemeral: true,
          });
        }
      }

      let da = await brModel.findOne({
        guild: interaction.guild.id,
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
              `**This server has reached the max ammount of role panels \`5\`**`
            ),
          ],
          ephemeral: true,
        });

      let index = da.panels.findIndex((v) => v.name === panel);

      if (!da.panels[index])
        return interaction.reply({
          embeds: [errorEmbed.setDescription(`**That panel does not exist.**`)],
          ephemeral: true,
        });

      if (da.panels[index].roles.length >= 15)
        return interaction.reply({
          embeds: [
            errorEmbed.setDescription(
              `**This panel has reached the max ammount of roles \`15\`**`
            ),
          ],
          ephemeral: true,
        });

      if (
        dc.toLowerCase() === "none" ||
        dc.toLowerCase() === "null" ||
        dc.toLowerCase() === "no color"
      ) {
        dc = 2;
      } else {
        let styles = ["red", "blurple", "gray", "green"];
        if (!styles.includes(dc.toLowerCase())) {
          return interaction.reply({
            content: `You did not provide a valid color enter \`none\` for a gray button`,
            ephemeral: true,
          });
        } else {
          if (dc.toLowerCase() === "red") dc = 4;
          if (dc.toLowerCase() === "blurple") dc = 1;
          if (dc.toLowerCase() === "gray") dc = 2;
          if (dc.toLowerCase() === "green") dc = 3;
        }
      }

      const newRole = {
        label: role.name,
        customId: role.id,
        style: dc,
        emoji: emo,
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
              `**I created a new button role: ${role} | Do \`/role-panel panel\` to see the roles panel.**`
            )
            .setColor("Green"),
        ],
      });
    }

    if (SUB_COMMAND === "remove") {
      const panel = interaction.options.getString("panel");
      const role = interaction.options.getRole("role");

      let perms = {
        userPerms: ["Administrator"],
        botPerms: ["ManageRoles", "SendMessages", "ViewChannel", "EmbedLinks"],
      };
      let perm = permCheck(perms, interaction);
      if (perm !== true) return;

      let da = await brModel.findOne({
        guild: interaction.guildId,
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
              `**Removed button role: ${role} | Do \`/role-panel panel\` to see the button roles panel**`
            )
            .setColor("Green"),
        ],
      });
    }

    if (SUB_COMMAND === "panel") {
      const panel = interaction.options.getString("panel");

      let da = await brModel.findOne({
        guild: interaction.guildId,
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
      let dex = 0;
      const Description = foundPanel.roles
        .map((x) => {
          const role = interaction.guild.roles.cache.get(x.customId);
          dex++;
          return `${x.emoji || dex} ➔ ${role}`;
        })
        .join("\n");

      for (let i = 0; i < foundPanel.roles.length; i++) {
        const role = interaction.guild.roles.cache.find(
          (r) => r.id === foundPanel.roles[i].customId
        );

        let obj = {
          label: role.name,
          emoji: foundPanel.roles[i].emoji,
          style: foundPanel.roles[i].style,
          custom_id: `brole${foundPanel.roles[i].customId}`,
          disabled: false,
          type: 2,
        };
        buttons.push(obj);
      }

      for (let i = 0; i < Math.ceil(foundPanel.roles.length / 5); i++) {
        rows.push(new ActionRowBuilder());
      }

      rows.forEach((row, i) => {
        row.addComponents(buttons.slice(0 + i * 5, 5 + i * 5));
      });

      const panelEmbed = new EmbedBuilder()
        .setTitle(foundPanel.name)
        .setDescription(
          `**Please click on a button below to get your roles.**\n\n${Description}`
        )
        .setThumbnail(
          interaction.guild.iconURL({
            forceStatic: true,
          })
        );

      interaction.reply({ content: "panel sent.", ephemeral: true });
      interaction.channel.send({
        embeds: [panelEmbed],
        components: rows,
      });
    }
  },
};

function permCheck(perms, interaction) {
  if (!interaction.memberPermissions.has(perms.userPerms || []))
    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("Missing Permisssion")
          .setDescription(
            "My apologies but you do not have the required permissions to use this command."
          )
          .addFields({
            name: "**Required Permissions**",
            value: `\`\`\`${perms.userPerms.join("\n")}\`\`\``,
          })
          .setColor("Red"),
      ],
      ephemeral: true,
    });

  if (!interaction.guild.members.me.permissions.has(perms.botPerms || []))
    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("Missing Permisssion")
          .setDescription(
            "My apologies but I do not have the required permissions to run this command."
          )
          .addFields({
            name: "**Required Permissions**",
            value: `\`\`\`${perms.botPerms.join("\n")}\`\`\``,
          })
          .setColor("Red"),
      ],
      ephemeral: true,
    });
  return true;
}
