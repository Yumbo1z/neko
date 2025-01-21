const { ActionRowBuilder, ButtonBuilder } = require("discord.js");

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
  emojiCharacters(component) {
    let characters = {
      a: "🇦",
      b: "🇧",
      c: "🇨",
      d: "🇩",
      e: "🇪",
      f: "🇫",
      g: "🇬",
      h: "🇭",
      i: "🇮",
      j: "🇯",
      k: "🇰",
      l: "🇱",
      m: "🇲",
      n: "🇳",
      o: "🇴",
      p: "🇵",
      q: "🇶",
      r: "🇷",
      s: "🇸",
      t: "🇹",
      u: "🇺",
      v: "🇻",
      w: "🇼",
      x: "🇽",
      y: "🇾",
      z: "🇿",
      0: "0⃣",
      1: "1⃣",
      2: "2️⃣",
      3: "3️⃣",
      4: "4️⃣",
      5: "5️⃣",
      6: "6️⃣",
      7: "7️⃣",
      8: "8️⃣",
      9: "9️⃣",
      10: "🔟",
      "#": "#⃣",
      "*": "*⃣",
      "!": "❗",
      "?": "❓",
    };
    if (Object.keys(characters).includes(`${component}`)) {
      let index = Object.keys(characters).findIndex(
        (element) => element === `${component}`
      );
      if (index === -1) {
        return "Character not found.";
      } else {
        return Object.values(characters)[index];
      }
    }
  },
  isWhole(n) {
    return /^\d+$/.test(n);
  },
  isInteger(number) {
    return Number.isInteger(number);
  },
  nFormat(num) {
    const lookup = [
      { value: 1, symbol: "" },
      { value: 1e3, symbol: "k" },
      { value: 1e6, symbol: "M" },
      { value: 1e9, symbol: "B" },
      { value: 1e12, symbol: "T" },
      { value: 1e15, symbol: "$" },
      { value: 1e18, symbol: "$$" },
      { value: 1e20, symbol: "$$$" },
      { value: 1e22, symbol: "$$$$" },
    ];
    const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
    let item = lookup
      .slice()
      .reverse()
      .find(function (item) {
        return num >= item.value;
      });
    return item
      ? (num / item.value).toFixed(1).replace(rx, "$1") + item.symbol
      : "0";
  },
  ordinal(i) {
    const j = i % 10;
    const k = i % 100;
    if (j === 1 && k !== 11) return `${i}st`;
    if (j === 2 && k !== 12) return `${i}nd`;
    if (j === 3 && k !== 13) return `${i}rd`;
    return `${i}th`;
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
};
