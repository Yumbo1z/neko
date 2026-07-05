const {
  EmbedBuilder,
  PermissionsBitField,
  PermissionFlagsBits,
} = require("discord.js");

module.exports = {
  name: "purge",
  default_member_permissions: PermissionFlagsBits.ManageMessages,
  //dm_permission: false,
  botPerms: ["ManageMessages"],
  description: "Delete a number of messages from a user or channel.",
  options: [
    {
      name: "amount",
      description:
        "The amount of messages you want to delete from the channel.",
      type: 4,
      required: true,
    },
    {
      name: "user",
      description: "The user you want to purge.",
      type: 6,
      required: false,
    },
  ],
  run: async (client, interaction, args) => {
    let errorEmbed = new EmbedBuilder().setColor("Red");

    let clear = interaction.options.getInteger("amount");
    let target = interaction.options.getMember("user");

    if (clear > 100)
      return interaction.reply({
        embeds: [
          errorEmbed.setDescription(
            `${client.error} I cannot purge more than 100 messages.`
          ),
        ],
        ephemeral: true,
      });

    if (clear < 0)
      return interaction.reply({
        embeds: [
          errorEmbed.setDescription(
            `${client.error} I cannot purge less than 0 messages.`
          ),
        ],
        ephemeral: true,
      });

    const botMember = interaction.guild.members.me;

    if (
      !interaction.channel
        .permissionsFor(botMember)
        .has(PermissionsBitField.Flags.ViewChannel)
    ) {
      return interaction.reply({
        embeds: [
          errorEmbed.setDescription(
            `${client.error} I do not have perms to view this channel.`
          ),
        ],
        ephemeral: true,
      });
    }

    if (
      !interaction.channel
        .permissionsFor(botMember)
        .has(PermissionsBitField.Flags.ManageMessages)
    ) {
      return interaction.reply({
        embeds: [
          errorEmbed.setDescription(
            `${client.error} I do not have perms to manage messages in this channel.`
          ),
        ],
        ephemeral: true,
      });
    }

    if (
      !interaction.channel
        .permissionsFor(botMember)
        .has(PermissionsBitField.Flags.ReadMessageHistory)
    ) {
      return interaction.reply({
        embeds: [
          errorEmbed.setDescription(
            `${client.error} I do not have perms to read message history in that channel.`
          ),
        ],
        ephemeral: true,
      });
    }

    if (!target) {
      const purged = await interaction.channel
        .bulkDelete(clear, true)
        .catch((err) => {
          console.log(err);
        });

      if (!purged || purged.size === 0)
        return interaction.reply({
          embeds: [
            errorEmbed.setDescription(
              `${client.error} I cannot delete messages that are more than 13 days old.`
            ),
          ],
          ephemeral: true,
        });

      await interaction.reply({
        embeds: [
          errorEmbed
            .setDescription(
              `${client.success} Deleted ${purged.size} messages!`
            )
            .setColor("Green"),
        ],
        ephemeral: true,
      });
    } else {
      const messages = await interaction.channel.messages.fetch({
        limit: 100,
      });
      const memberMessages = messages.filter((m) => m.author.id === target.id);

      const purged = await interaction.channel
        .bulkDelete(memberMessages.first(clear), true)
        .catch((err) => {
          console.log(err);
        });

      if (!purged || purged.size === 0)
        return interaction.reply({
          embeds: [
            errorEmbed.setDescription(
              `${client.error} I cannot delete messages that are more than 13 days old.`
            ),
          ],
          ephemeral: true,
        });

      await interaction.reply({
        embeds: [
          errorEmbed
            .setDescription(
              `${client.success} Deleted ${purged.size} messages from <@${target.id}>!`
            )
            .setColor("Green"),
        ],
        ephemeral: true,
      });
    }
  },
};
