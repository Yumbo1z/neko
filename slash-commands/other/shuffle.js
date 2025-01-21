const {
    ActionRowBuilder,
    ModalBuilder,
    TextInputBuilder,
    ButtonBuilder,
    EmbedBuilder,
    InteractionCollector,
    InteractionType,
  } = require("discord.js");
  const { disableButtons } = require("../../functions/util.js");
  
  module.exports = {
    data: {
      name: "shuffle",
      description: "scrambles a word and you try to guess what word it is",
      integration_types: [0, 1],
      contexts: [0, 1, 2],
    },
    run: async (client, interaction, args, username) => {
      let words = [
        "apple",
        "discord",
        "welcome",
        "banana",
        "school",
        "quest",
        "begin",
        "pencil",
        "excellent",
        "square",
        "progress",
        "random",
        "floor",
        "return",
        "title",
        "algebra",
        "language",
        "english",
        "subject",
        "vocabulary",
        "check",
        "correct",
        "section",
        "paper",
        "example",
        "review",
        "combine",
        "sentence",
        "water",
        "yellow",
        "create",
        "always",
        "today",
        "notebook",
        "shirt",
        "image",
        "pixel",
        "online",
        "cannot",
        "ready",
        "watching",
        "default",
        "sword",
        "error",
        "chair",
        "mushoom",
        "avocado",
        "blackberries",
        "blueberries",
        "cherries",
        "bread",
        "watermelon",
        "orange",
        "white",
        "green",
        "violet",
        "flower",
        "olive",
        "unknown",
        "words",
      ];
      const givenword = words[Math.floor(Math.random() * words.length)];
      let shuffled = givenword
        .split("")
        .sort(function () {
          return 0.5 - Math.random();
        })
        .join("");
  
      if (shuffled.split(" ").includes(givenword)) {
        shuffled = givenword
          .split("")
          .sort(function () {
            return 0.5 - Math.random();
          })
          .join("");
      }
  
      const modal = new ModalBuilder().setCustomId("shuffle").setTitle("Shuffle");
  
      const word = new TextInputBuilder()
        .setCustomId("shuffleWord")
        .setLabel("What's your word?")
        .setStyle(1)
        .setRequired(true);
  
      const firstActionRow = new ActionRowBuilder().addComponents(word);
  
      modal.addComponents(firstActionRow);
  
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(givenword).setLabel("Guess").setStyle(1)
      );
  
      const game = new EmbedBuilder()
        .setTitle("🔀 Shuffle Time! 🔀")
        .setColor("#8c4ec4")
        .setDescription("The shuffled word is: " + shuffled)
        .setFooter({
          text: "You have 65 seconds to try and guess it, the first person to answer correctly wins",
        });
  
      let msg = await interaction.reply({
        embeds: [game],
        components: [row],
        fetchReply: true,
      });
      const collector = interaction.channel.createMessageComponentCollector({
        time: 65000,
      });
      const collector2 = new InteractionCollector(client, {
        message: msg,
        interactionType: InteractionType.ModalSubmit,
      });
      collector.on("collect", async (i) => {
        if (i.customId === givenword) {
          await i.showModal(modal);
        }
      });
  
      collector2.on("collect", async (c) => {
        if (c.customId === "shuffle") {
          const input = c.fields.getTextInputValue("shuffleWord");
          let guess = input.toLowerCase();
          if (guess === givenword) {
            await c
              .update({
                components: disableButtons(msg.components),
              })
              .catch((err) => {});
            await c
              .followUp({
                content: `🤩 ${interaction.user.username} got the correct word!`,
              })
              .catch((err) => {});
            collector2.stop();
          } else {
            await c
              .reply({
                content: `😭 Incorrect try again`,
                ephemeral: true,
              })
              .catch((err) => {});
          }
        }
      });
  
      collector.on("end", async (i, reason) => {
        collector2.stop();
        if (reason === "time") {
          await interaction
            .editReply({
              content: `Times Up! The correct word is **\`${givenword}\`**`,
              components: disableButtons(msg.components),
            })
            .catch(() => {});
        } else {
          await interaction
            .editReply({
              components: disableButtons(msg.components),
            })
            .catch(() => {});
        }
      });
    },
  };
  