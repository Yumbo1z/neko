const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  StringSelectMenuBuilder,
  ComponentType,
} = require("discord.js");

module.exports = {
  disableButtons(components) {
    for (let x = 0; x < components.length; x++) {
      for (let y = 0; y < components[x].components.length; y++) {
        components[x].components[y] = ButtonBuilder.from(
          components[x].components[y]
        );
        components[x].components[y].setDisabled(true);
      }
    }
    return components;
  },
  disableMenus(components) {
    for (let x = 0; x < components.length; x++) {
      for (let y = 0; y < components[x].components.length; y++) {
        components[x].components[y] = StringSelectMenuBuilder.from(
          components[x].components[y]
        );
        components[x].components[y].setDisabled(true);
      }
    }
    return components;
  },
  unixTimestamp(seconds) {
    let date = new Date(new Date().getTime() + seconds * 1000);

    return "<t:" + Math.floor(date / 1000) + ":R>";
  },
  formatTime(milliseconds) {
    if (!milliseconds) return "None";
    let seconds = Math.floor((milliseconds / 1000) % 60);
    let minutes = Math.floor((milliseconds / (1000 * 60)) % 60);
    let hours = Math.floor((milliseconds / (1000 * 60 * 60)) % 24);

    let timeString = "";

    if (hours > 0) {
      timeString += hours + " hours ";
    }

    if (minutes > 0) {
      timeString += minutes + " minutes ";
    }

    if (seconds > 0) {
      timeString += seconds + " seconds";
    }

    return timeString;
  },
  formatNumber(number) {
    const roundedNumber = Math.round(number);
    return roundedNumber.toLocaleString();
  },
  hasPizza(balance, amount) {
    if (!balance) {
      return false;
    }

   if(amount <= 0) return false;

    return balance.pizza >= amount;
  }
};
