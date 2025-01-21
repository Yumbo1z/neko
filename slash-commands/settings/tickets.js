const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ChannelSelectMenuBuilder,
    ChannelType,
    ComponentType,
    RoleSelectMenuBuilder,
    PermissionFlagsBits,
  } = require("discord.js");
  const serverSchema = require("../../models/serverData");
  const { disableButtons } = require("../../functions/util.js");
  
  module.exports = {
    data: {
      name: "tickets",
      description: "Setup tickets in your server!",
      default_member_permissions: PermissionFlagsBits.ManageChannels.toString(),
      integration_types: [0],
    },
    async run(client, interaction, args) {
      // The following line retrieves the server data from the database.
      // If the server data doesn't exist, it creates a new one.
      const server = await serverSchema.findOneAndUpdate(
        { guildID: interaction.guild.id },
        { guildID: interaction.guild.id },
        { upsert: true, new: true }
      );
  
      const buttonRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("cat")
          .setLabel("Set Redirect")
          .setStyle(1),
        new ButtonBuilder()
          .setCustomId("ticketRoles")
          .setLabel("Set Ticket Roles")
          .setStyle(1),
        new ButtonBuilder()
          .setCustomId("menu")
          .setLabel("Ticket Panel")
          .setStyle(1)
      );
  
      const setTicketsEmbed = new EmbedBuilder()
        .setTitle("Setup Tickets")
        .setDescription("Interact with the buttons below to setup **Tickets**")
        .setColor("#8c4ec4");
  
      const reply = await interaction.reply({
        embeds: [setTicketsEmbed],
        components: [buttonRow],
        fetchReply: true,
      });
  
      const collector = reply.createMessageComponentCollector({ idle: 120000 });
  
      collector.on("collect", async (i) => {
        if (i.user.id !== interaction.user.id)
          return i.reply({
            content: "This interaction isn't for you.",
            ephemeral: true,
          });
  
        if (i.customId === "cat") {
          const ticketsSystem = server.ticketsSystem;
  
          const catEmbed = new EmbedBuilder()
            .setTitle("Set Ticket's Redirect")
            .setDescription("Redirect tickets under a category.")
            .setColor("#8c4ec4");
  
          const selectMenu = new ActionRowBuilder().addComponents(
            new ChannelSelectMenuBuilder({
              custom_id: "catSelect",
              placeholder: "Select a category",
              max_values: 1,
            }).addChannelTypes(ChannelType.GuildCategory)
          );
  
          const catCommand = await i.reply({
            embeds: [catEmbed],
            components: [selectMenu],
            ephemeral: true,
            fetchReply: true,
          });
  
          const selectMenuCollector = catCommand.createMessageComponentCollector({
            componentType: ComponentType.ChannelSelect,
            idle: 120000,
          });
  
          selectMenuCollector.on("collect", async (select) => {
            if (select.user.id !== interaction.user.id) {
              return select.reply({
                content: `This interaction isn't for you.`,
                ephemeral: true,
              });
            }
  
            if (select.customId !== "catSelect") return;
  
            if (select.replied) {
              return select.followUp({
                embeds: [
                  errorEmbed.setDescription(
                    `**You have already used this interaction.**`
                  ),
                ],
                ephemeral: true,
              });
            }
  
            if (ticketsSystem.category === select.values[0]) {
              ticketsSystem.category = null;
              await select
                .reply({
                  content: `Ticket redirect reset.`,
                  ephemeral: true,
                })
                .catch(() => {});
            } else {
              ticketsSystem.category = select.values[0];
              await select
                .reply({
                  content: `Tickets will now be redirected towards <#${select.values[0]}>. Select again to reset.`,
                  ephemeral: true,
                })
                .catch(() => {});
            }
  
            await serverSchema.findOneAndUpdate(
              { guildID: interaction.guild.id },
              server
            );
          });
        }
  
        if (i.customId === "ticketRoles") {
          // Handling ticket roles setup logic
          const rolesMenu = new ActionRowBuilder().addComponents(
            new RoleSelectMenuBuilder({
              custom_id: "ticketRoleSelect",
              placeholder: "Select up to 5 roles",
              min_values: 1,
              max_values: 5,
            })
          );
  
          const ticketRolesReply = await i.reply({
            content: "Please select up to 5 roles for ticket access:",
            components: [rolesMenu],
            ephemeral: true,
            fetchReply: true,
          });
  
          const rolesSelectMenuCollector =
            ticketRolesReply.createMessageComponentCollector({
              componentType: ComponentType.RoleSelect,
              time: 50000,
            });
  
          rolesSelectMenuCollector.on("collect", async (select) => {
            if (select.customId !== "ticketRoleSelect") return;
            let roles = select.values;
  
            await select.reply({
              content: "Ticket roles have been updated!",
              ephemeral: true,
            });
  
            server.ticketsSystem.ticketRoles = roles;
            await server.save();
          });
        }
  
        if (i.customId === "menu") {
          const ticketButton = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId("createTicket")
              .setLabel("Create Ticket")
              .setStyle(1)
              .setEmoji("📩")
          );
  
          const menu = new EmbedBuilder()
            .setTitle("Open a Ticket")
            .setDescription(
              `A staff member of ${interaction.guild.name} will be with you soon.\n\nPress 📩 to create a ticket.`
            )
            .setThumbnail(interaction.guild.iconURL({ forceStatic: true }));
  
          if (i.replied) {
            i.followUp({
              content: `Ticket panel sent.`,
              ephemeral: true,
            });
          } else {
            i.reply({
              content: `Ticket panel sent.`,
              ephemeral: true,
            });
          }
  
          await interaction.channel.send({
            embeds: [menu],
            components: [ticketButton],
          });
        }
      });
  
      collector.on("end", async () => {
        await interaction
          .editReply({
            components: disableButtons(reply.components),
          })
          .catch(() => {});
      });
    },
  };
  