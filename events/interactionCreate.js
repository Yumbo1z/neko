const client = require("../index");
const { unixTimestamp, nFormat } = require("../functions/util");
const cooldownSchema = require("../models/slash-cooldown");
const userBan = require("./../models/user-ban");
const { EmbedBuilder } = require("discord.js");


client.on("interactionCreate", async (interaction) => {
  if (interaction.isCommand()) {
    const cmd = client.slashCommands.get(interaction.commandName);
    if (!cmd)
      return interaction.reply({
        content: "An error has occured ",
      });

    const args = [];

    for (let option of interaction.options.data) {
      if (option.type === 1) {
        if (option.name) args.push(option.name);
        option.options?.forEach((x) => {
          if (x.value) args.push(x.value);
        });
      } else if (option.value) args.push(option.value);
    }

    let subCommand = new Object();
    if (args[0])
      subCommand.data = cmd.data.options.find((v) => v.name === args[0]);

    /*interaction.member = interaction.guild.members.cache.get(
      interaction.user.id
    );*/

    const username =
      interaction?.member?.displayName ||
      interaction?.user?.globalName ||
      interaction?.user?.username;

    let banned = await userBan.findOne({
      user: interaction.user.id,
    });

    if (banned) {
      const bannedRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel("Support Server")
          .setStyle(5)
          .setURL("https://discord.gg/zABQqMNvNa")
          .setEmoji("🏡")
      );

      const bannedEmbed = new EmbedBuilder()
        .setTitle("🚫 User Banned!")
        .setDescription(
          `**🚫 You are banned from using the bot. If you believe this was a mistake please report it to the support server.**`
        )
        .setColor("Red");

      return interaction.reply({
        embeds: [bannedEmbed],
        components: [bannedRow],
        ephemeral: true,
      });
    }

    async function cooldown(command) {
      let cooldown = await cooldownSchema.findOne({
        userID: interaction.user.id,
        commandName: command.data.name,
      });

      if (!cooldown) {
        cooldown = await cooldownSchema.create({
          userID: interaction.user.id,
          commandName: command.data.name,
          cooldown: 0,
        });
      }

      const timeElapsed = Date.now() - cooldown.cooldown;
      const remainingCooldown = command.data.timeout * 1000 - timeElapsed;

      if (remainingCooldown > 0) {
        const timeLeft = remainingCooldown / 1000;
        const timeLeftFormatted = unixTimestamp(timeLeft);

        let cooldownMessage =
          command.data.cooldownMsg ||
          `You have to wait for the command timeout, try again ${timeLeftFormatted}`;
        cooldownMessage = cooldownMessage
          .replace("[timeleft]", `${timeLeftFormatted}`)
          .replace("[cooldown]", `${command.data.timeout}`)
          .replace("[user]", `${interaction.user.username}`);

        let cooldownEmbed = new EmbedBuilder()
          .setTitle("Slow Down!")
          .setDescription(cooldownMessage)
          .setColor("Red");

        return interaction.reply({ embeds: [cooldownEmbed], ephemeral: true });
      } else {
        cmd.run(client, interaction, args, username);

        // Update the cooldown
        await cooldownSchema.findOneAndUpdate(
          {
            userID: interaction.user.id,
            commandName: command.data.name,
          },
          {
            cooldown: Date.now(),
          }
        );
      }
    }

    if (cmd.data.timeout) await cooldown(cmd);
    else if (subCommand?.data?.timeout) await cooldown(subCommand);
    else cmd.run(client, interaction, args, username);
  }
});