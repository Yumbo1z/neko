const {
    ActionRowBuilder,
    ButtonBuilder,
    PermissionsBitField,
    EmbedBuilder,
    ChannelType,
  } = require("discord.js");
  const serverSchema = require("../models/serverData");
  const client = require("../index.js");
  
  client.on("interactionCreate", async (interaction) => {
    if (!interaction.guild) return;
    if (interaction.isButton()) {
      const server = await serverSchema.findOne({
        guildID: interaction.guild.id,
      });
      if (!server) return;
      const ticketData = server.ticketsSystem;
  
      if (interaction.customId === "createTicket") {
        const perms = [
          {
            id: interaction.guild.id,
            deny: [PermissionsBitField.Flags.ViewChannel],
          },
          {
            id: interaction.user.id,
            allow: [
              PermissionsBitField.Flags.ViewChannel,
              PermissionsBitField.Flags.SendMessages,
            ],
          },
        ];
  
        for (const roleId of ticketData.ticketRoles) {
          const validRole = interaction.guild.roles.cache.get(roleId);
          if (validRole) {
            perms.push({
              id: roleId,
              allow: [
                PermissionsBitField.Flags.ViewChannel,
                PermissionsBitField.Flags.SendMessages,
              ],
            });
          }
        }
  
        let channel;
        const channelOptions = {
          name: `📩${interaction.user.username}`,
          type: ChannelType.GuildText,
          permissionOverwrites: perms,
        };
  
        if (ticketData.category) {
          const category = interaction.guild.channels.cache.find(
            (c) => c.id === ticketData.category
          );
  
          if (category) channelOptions.parent = category;
        }
  
        channel = await interaction.guild.channels.create(channelOptions);
  
        const closeButton = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(`closeTicket`)
            .setLabel("Close")
            .setStyle(1)
            .setEmoji("🔒")
        );
  
        const closeEmbed = new EmbedBuilder()
          .setTitle(`**${interaction.user.username}'s Ticket**`)
          .setDescription(
            `Please wait for an Admin to respond!!\n\n__Please tell us what you need help on.__\n\nPress (🔒) to close this ticket.`
          );
  
        const ticketChannel = client.channels.cache.get(channel.id);
        ticketChannel
          .send({
            content: `${interaction.user}'s ticket`,
            embeds: [closeEmbed],
            components: [closeButton],
          })
          .then(() => {
            interaction.reply({
              content: `Ticket created at ${channel}`,
              ephemeral: true,
            });
          });
      }
  
      if (interaction.customId === "closeTicket") {
        await interaction.channel.delete();
      }
    }
  });
  