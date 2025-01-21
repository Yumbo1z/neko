const {
    ActionRowBuilder,
    ModalBuilder,
    TextInputBuilder,
    ButtonBuilder,
    EmbedBuilder,
    InteractionCollector,
    ComponentType,
    InteractionType,
  } = require("discord.js");
  const { disableButtons } = require("../../functions/util.js");
  
  module.exports = {
    data: {
      name: "wordle",
      description: "Play a game of wordle",
      integration_types: [0, 1],
      contexts: [0, 1, 2],
    },
    run: async (client, interaction, args, username) => {
      let errorEmbed = new EmbedBuilder().setColor("Red");
      let gamedesc = [
        `⬛⬛⬛⬛⬛ - Empty`,
        `⬛⬛⬛⬛⬛ - Empty`,
        `⬛⬛⬛⬛⬛ - Empty`,
        `⬛⬛⬛⬛⬛ - Empty`,
        `⬛⬛⬛⬛⬛ - Empty`,
        `⬛⬛⬛⬛⬛ - Empty`,
      ];
  
      let options = {
        yellow: `🟨`,
        grey: `⬜`,
        green: `🟩`,
        black: `⬛`,
      };
  
      const modal = new ModalBuilder().setCustomId("wordle").setTitle("Wordle");
  
      const word = new TextInputBuilder()
        .setCustomId("wordleWord")
        .setLabel("What's your word?")
        .setStyle(1)
        .setMinLength(5)
        .setMaxLength(5)
        .setRequired(true);
  
      const firstActionRow = new ActionRowBuilder().addComponents(word);
  
      modal.addComponents(firstActionRow);
  
      let words = [
        "title",
        "words",
        "label",
        "white",
        "brown",
        "bacon",
        "black",
        "aware",
        "awake",
        "adopt",
        "actor",
        "above",
        "abort",
        "about",
        "dizzy",
        "fuzzy",
        "books",
        "apple",
        "color",
        "ready",
        "house",
        "table",
        "light",
        "sugar",
        "goals",
        "sweat",
        "water",
        "drink",
        "sport",
        "fluid",
        "foray",
        "elite",
        "plant",
        "spawn",
        "south",
        "tries",
        "guess",
        "world",
        "chart",
        "music",
        "human",
        "sweet",
        "dream",
        "power",
      ];
  
      let solution = words[Math.floor(Math.random() * words.length)];
      let tries = 0;
  
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(solution).setLabel("Guess").setStyle(1)
      );
  
      let game = new EmbedBuilder()
        .setTitle(`Wordle Game!`)
        .setDescription(gamedesc.join("\n"))
        .setFooter({
          text: `You have 6 tries to guess the wordle!`,
        })
        .setColor("#8c4ec4");
  
      let msg = await interaction.reply({
        embeds: [game],
        components: [row],
        fetchReply: true,
      });
  
      const collector = msg.createMessageComponentCollector({
        idle: 120000,
      });
      const collector2 = new InteractionCollector(client, {
        message: msg,
        interactionType: InteractionType.ModalSubmit,
      });
  
      collector.on("collect", async (i) => {
        if (i.user.id !== interaction.user.id)
          return i.reply({
            content: "This is not for you.",
            ephemeral: true,
          });
        if (i.customId === solution) {
          await i.showModal(modal);
        }
      });
  
      collector2.on("collect", async (c) => {
        if (c.customId === "wordle") {
          const wordleinput = c.fields.getTextInputValue("wordleWord");
          let guess = wordleinput.toLowerCase();
  
          let result = "";
          for (let i = 0; i < guess.length; i++) {
            let guessLetter = guess?.charAt(i);
            let solutionLetter = solution?.charAt(i);
            if (guessLetter === solutionLetter) {
              result = result.concat(options.green);
            } else if (solution?.indexOf(guessLetter) != -1) {
              result = result.concat(options.yellow);
            } else {
              result = result.concat(options.grey);
            }
          }
  
          if (result === "🟩🟩🟩🟩🟩") {
            gamedesc[tries] = `${result} - ${guess}`;
            await c
              .update({
                embeds: [
                  game
                    .setDescription(gamedesc.join("\n"))
                    .setFooter({
                      text: `Congrats! You guessed the right word!`,
                    })
                    .setColor("Green"),
                ],
              })
              .catch((err) => {});
            await c
              .followUp({
                content: `You got the correct word!`,
                ephemeral: true,
              })
              .catch((err) => {});
            collector.stop();
            collector2.stop();
          } else {
            gamedesc[tries] = `${result} - ${guess}`;
            tries++;
            if (tries === 6) {
              await c
                .update({
                  embeds: [
                    game
                      .setDescription(gamedesc.join("\n"))
                      .setFooter({
                        text: `You used your 6 tries, the correct word is ${solution}`,
                      })
                      .setColor("Red"),
                  ],
                })
                .catch((err) => {});
              collector.stop();
              collector2.stop();
            } else {
              await c
                .update({
                  embeds: [game.setDescription(gamedesc.join("\n"))],
                })
                .catch((err) => {});
            }
          }
        }
      });
  
      collector.on("end", async (i, reason) => {
        collector2.stop();
        if (reason === "time") {
          await interaction
            .editReply({
              embeds: [
                game
                  .setDescription(gamedesc.join("\n"))
                  .setFooter({
                    text: `You went idle, the correct word is ${solution}!`,
                  })
                  .setColor("Red"),
              ],
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
  