let {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    PermissionFlagsBits,
  } = require("discord.js");
  let giveawaySchema = require("../../models/giveaway");
  const { isWhole, isInteger } = require("../../functions/util.js");
  let ms = require("ms");
  
  module.exports = {
    data: {
      name: "giveaway",
      description: "Giveaway settings",
      options: [
        {
          name: "create",
          description: "Create a giveaway in the current channel.",
          type: 1,
          options: [
            {
              name: "duration",
              description:
                "how long should the giveaway last? Example: 5h, 2 days, 30m",
              type: 3,
              required: true,
            },
            {
              name: "winners",
              description: "how many winners should there be?",
              type: 4,
              required: true,
            },
            {
              name: "prize",
              description: "what are you going to be giving away?",
              type: 3,
              required: true,
            },
            {
              name: "requirement",
              description: "what's the requirement role for the giveaway?",
              type: 8,
              required: false,
            },
          ],
        },
  
        {
          name: "end",
          description: "End a giveaway.",
          type: 1,
          options: [
            {
              name: "giveaway",
              description: "giveaway message ID/link",
              type: 3,
              required: true,
            },
          ],
        },
  
        {
          name: "reroll",
          description: "Roll a new winner.",
          type: 1,
          options: [
            {
              name: "giveaway",
              description: "giveaway message ID/link",
              type: 3,
              required: true,
            },
          ],
        },
      ],
      integration_types: [0],
    },
    run: async (client, interaction, args, username) => {
      const { options } = interaction;
  
      const SUB_COMMAND = await options.getSubcommand();
  
      let errorEmbed = new EmbedBuilder().setColor("Red");
  
      if (SUB_COMMAND === "create") {
        if (!interaction.member.permissions.has(["ManageEvents"]))
          return interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setTitle("Missing Permisssion")
                .setDescription(
                  "My apologies but you do not have the required permissions to use this command."
                )
                .addFields({
                  name: "Required Permissions",
                  value: `\`\`\`ManageEvents\`\`\``,
                })
                .setColor("Red"),
            ],
            ephemeral: true,
          });
  
        const i2 = interaction.options.getString("duration");
        const i3 = interaction.options.getInteger("winners");
        const i4 = interaction.options.getString("prize");
        const i5 = interaction.options.getRole("requirement") || null;
  
        if (
          !interaction.guild.members.me
            .permissionsIn(interaction.channel)
            .has("SendMessages", "ViewMessages", "EmbedLinks")
        )
          return interaction.reply({
            embeds: [
              errorEmbed.setDescription(
                `**I don't have permissions to talk in this channel.**`
              ),
            ],
            ephemeral: true,
          });
  
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
  
        if (i3 <= 0 || i3 > 10)
          return interaction.reply({
            embeds: [
              errorEmbed.setDescription(
                `**Make sure winners are in between 1 through 10!**`
              ),
            ],
            ephemeral: true,
          });
  
        let winners = Number(i3);
        let role = i5;
  
        await interaction.reply({
          embeds: [
            errorEmbed
              .setDescription("**🎉 Giveaway Started!**")
              .setColor("Green"),
          ],
          ephemeral: true,
        });
  
        let giveawayEmbed = new EmbedBuilder()
          .setTitle(`🎁 - ${i4} (${winners} Winner${winners > 1 ? "s" : ""})`)
          .setDescription(`Click the button (🎉) to join the giveaway!`)
          .addFields(
            {
              name: "⌛ - Duration:",
              value: `<t:${Math.floor(date / 1000)}:R>`,
            },
            {
              name: "📝 - Requirement:",
              value: `${role ? `<@&${role.id}>` : "None"}`,
            },
            { name: "👤 - Hosted By:", value: interaction.user.username },
            { name: "👥 - Entries:", value: "0" }
          )
          .setColor("#8c4ec4");
  
        let row = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(interaction.id)
            .setEmoji("🎉")
            .setStyle(1)
        );
        try {
          interaction.guild.channels.cache
            .get(interaction.channel.id)
            .send({
              embeds: [giveawayEmbed],
              components: [row],
            })
            .then(async (msg) => {
              let r;
              if (i5) {
                r = role.id;
              } else {
                r = null;
              }
  
              await giveawaySchema.create({
                host: interaction.user.id,
                msg: msg.id,
                prize: i4,
                endsAt: Math.floor(
                  Math.floor(new Date().getTime() / 1000) + duration
                ),
                guild: msg.guild.id,
                channel: msg.channel.id,
                winners: winners,
                role: r,
              });
            });
        } catch (e) {
          interaction
            .editReply({
              content: `An error occured: ${e}`,
            })
            .catch(() => {});
        }
      }
  
      if (SUB_COMMAND === "end") {
        if (!interaction.member.permissions.has(["ManageEvents"]))
          return interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setTitle("Missing Permisssion")
                .setDescription(
                  "My apologies but you do not have the required permissions to use this command."
                )
                .addFields({
                  name: "Required Permissions",
                  value: `\`\`\`ManageEvents\`\`\``,
                })
                .setColor("Red"),
            ],
            ephemeral: true,
          });
  
        const i = interaction.options.getString("giveaway");
        let giveaway = await giveawaySchema.findOne({
          msg: i,
        });
  
        if (!giveaway)
          return interaction.reply({
            embeds: [errorEmbed.setDescription(`Could not find that giveaway.`)],
            ephemeral: true,
          });
  
        let winner = () => {
          let newArray = shuffle(giveaway.users);
          return newArray
            .sort(() => Math.random() - Math.random())
            .slice(0, giveaway.winners)
            .join("> & <@!");
        };
  
        if (giveaway.users.length == 0) {
          interaction.reply({
            embeds: [errorEmbed.setDescription(`No one joined the giveaway.`)],
          });
        } else {
          await interaction.reply({
            content: `🎉 | The winner is... <@!${winner()}>!\n**Congratulations!** you won ${
              giveaway.prize
            }!\n\`${giveaway.users.length} Entrants\``,
          });
        }
  
        await giveawaySchema.findOneAndDelete({
          msg: i,
        });
      }
  
      if (SUB_COMMAND === "reroll") {
        if (!interaction.member.permissions.has(["ManageEvents"]))
          return interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setTitle("Missing Permisssion")
                .setDescription(
                  "My apologies but you do not have the required permissions to use this command."
                )
                .addFields({
                  name: "Required Permissions",
                  value: `\`\`\`ManageEvents\`\`\``,
                })
                .setColor("Red"),
            ],
            ephemeral: true,
          });
  
        const i = interaction.options.getString("giveaway");
        let giveaway = await giveawaySchema.findOne({
          msg: i,
        });
  
        if (!giveaway)
          return interaction.reply({
            embeds: [errorEmbed.setDescription(`Could not find that giveaway.`)],
            ephemeral: true,
          });
  
        let winner = () => {
          let newArray = shuffle(giveaway.users);
          return newArray
            .sort(() => Math.random() - Math.random())
            .slice(0, giveaway.winners)
            .join("> & <@!");
        };
  
        if (giveaway.users.length == 0) {
          interaction.reply({
            embeds: [errorEmbed.setDescription(`No one joined the giveaway.`)],
          });
        } else {
          await interaction.reply({
            content: `🎉 | The new winner is <@!${winner()}>!\n**Congratulations!** you won ${
              giveaway.prize
            }!`,
          });
        }
      }
    },
  };
  
  function shuffle(array) {
    let currentIndex = array.length,
      randomIndex;
    while (currentIndex != 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex],
        array[currentIndex],
      ];
    }
  
    return array;
  }
  