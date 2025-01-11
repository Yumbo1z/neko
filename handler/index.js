const { glob } = require("glob");
const { promisify } = require("util");
const mongoose = require("mongoose");

const globPromise = promisify(glob);

module.exports = async (client) => {
  // Command handler
  const commandFiles = await globPromise(`${process.cwd()}/commands/**/*.js`); // looks for the folder named commands
  commandFiles.map((value) => {
    const file = require(value);
    const splitted = value.split("/");
    const directory = splitted[splitted.length - 2];

    if (file.name) {
      const properties = { directory, ...file };
      client.commands.set(file.name, properties);
    } //allows command
  });

  // Event handler
  const eventFiles = await globPromise(`${process.cwd()}/events/*.js`);
  eventFiles.map((value) => require(value));

  // Slash Commands handler
  const slashCommands = await globPromise(
    `${process.cwd()}/SlashCommands/*/*.js`
  );

  const arrayOfSlashCommands = [];
  slashCommands.map((value) => {
    const command = require(value);
    const splitted = value.split("/");
    const directory = splitted[splitted.length - 2];
    if (!command?.name) return;
    const properties = { directory, ...command };
    client.slashCommands.set(command.name, properties);
    if (["MESSAGE", "USER"].includes(command.type)) delete command.description;
    arrayOfSlashCommands.push(command);
  });

  client.once("ready", async () => {
    await client.application.commands.set(arrayOfSlashCommands).then((cmd) => {
      cmd.map((cm) => {
        let obj = client.slashCommands.get(cm.name);
        obj.id = cm.id;
      });
    });
    console.log("Bot is ready");
  });

  mongoose.set("strictQuery", true);
  await mongoose.connect(client.config.mongo);
  console.log("Connected to MongoDB");
};
