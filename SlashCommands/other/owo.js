const prefixes = [
    "<3 ",
    "0w0 ",
    "H-hewwo?? ",
    "HIIII! ",
    "Haiiii! ",
    "Huohhhh. ",
    "OWO ",
    "OwO ",
    "UwU ",
  ];
  
  const suffixes = [
    " ( ´•̥̥̥ω•̥̥̥` )",
    " ( ˘ ³˘)♥",
    " ( ͡° ᴥ ͡°)",
    " (^³^)",
    " (´・ω・｀)",
    " (ʘᗩʘ')",
    " (இωஇ )",
    " (๑•́ ₃ •̀๑)",
    " (• o •)",
    " (⁎˃ᆺ˂)",
    " (╯﹏╰）",
    " (●´ω｀●)",
    " (◠‿◠✿)",
    " (✿ ♡‿♡)",
    " (❁´◡`❁)",
    " (　'◟ ')",
    " (人◕ω◕)",
    " (；ω；)",
    " (｀へ´)",
    " ._.",
    " :3",
    " :3c",
    " :D",
    " :O",
    " :P",
    " ;-;",
    " ;3",
    " ;_;",
    " <{^v^}>",
    " >_<",
    " >_>",
    " UwU",
    " XDDD",
    " \\°○°/",
    " ^-^",
    " ^_^",
    " x3",
    " x3",
    " xD",
    " ÙωÙ",
    " ʕʘ‿ʘʔ",
    " ʕ•ᴥ•ʔ",
    " ミ(．．)ミ",
    " ㅇㅅㅇ",
    ", fwendo",
    "（＾ｖ＾）",
  ];
  
  const substitutions = {
    r: "w",
    l: "w",
    R: "W",
    L: "W",
    no: "nu",
    has: "haz",
    have: "haz",
    " says": " sez",
    you: "uu",
    "the ": "da ",
    "The ": "Da ",
    "THE ": "THE ",
  };
  const addAffixes = (str) =>
    prefixes[Math.floor(Math.random() * prefixes.length)] +
    str +
    suffixes[Math.floor(Math.random() * suffixes.length)];
  const substitute = (str) => {
    const replacements = Object.keys(substitutions);
    replacements.forEach((x) => {
      str = replaceString(str, x, substitutions[x]);
    });
    return str;
  };
  const owo = (str) => addAffixes(substitute(str));
  
  module.exports = {
    data: {
      name: "owofy",
      description: "Convert your text to a dumb owoified text.",
      options: [
        {
          name: "text-to-owofy",
          description: "OwO!",
          type: 3,
          minLength: 1,
          maxLength: 255,
          required: true,
        },
      ],
      integration_types: [0, 1],
      contexts: [0, 1, 2],
    },
    run: async (client, interaction, args, username) => {
      const text = interaction.options.getString("text-to-owofy");
  
      let toOWOFY = text.replaceAll("@", "");
  
      interaction.reply(owo(toOWOFY));
    },
  };
  
  function replaceString(string, needle, replacement, options = {}) {
    let result = "";
    let matchCount = 0;
    let previousIndex = options.fromIndex > 0 ? options.fromIndex : 0;
  
    if (previousIndex > string.length) {
      return string;
    }
    while (true) {
      const index = options.caseInsensitive
        ? string.toLowerCase().indexOf(needle.toLowerCase(), previousIndex)
        : string.indexOf(needle, previousIndex);
  
      if (index === -1) {
        break;
      }
  
      matchCount++;
      const replaceString_ =
        typeof replacement === "string"
          ? replacement
          : replacement(
              string.slice(index, index + needle.length),
              matchCount,
              string,
              index
            );
  
      const beginSlice = matchCount === 1 ? 0 : previousIndex;
  
      result += string.slice(beginSlice, index) + replaceString_;
  
      previousIndex = index + needle.length;
    }
    if (matchCount === 0) {
      return string;
    }
    return result + string.slice(previousIndex);
  }
  