const { glob } = require("glob");
const { promisify } = require("util");
const { Client, SlashCommandBuilder, REST, Routes } = require("discord.js");
const mongoose = require("mongoose");

const globPromise = promisify(glob);

/**
 * @param {Client} client
 */
module.exports = async (client) => {
  try {
    // Command Handler
    const commandFiles = await globPromise(`${process.cwd()}/commands/**/*.js`);
    console.log(`Found ${commandFiles.length} command files.`);

    commandFiles.map((value) => {
      try {
        const file = require(value);
        const splitted = value.split("/");
        const directory = splitted[splitted.length - 2];

        if (file.name) {
          const properties = { directory, ...file };
          client.commands.set(file.name, properties);
          console.log(`Loaded command: ${file.name}`);
        } else {
          console.warn(`Command file ${value} is missing a 'name' property.`);
        }
      } catch (error) {
        console.error(`Error loading command file at ${value}:`, error);
      }
    });

    // Event Handler
    const eventFiles = await globPromise(`${process.cwd()}/events/*.js`);
    console.log(`Found ${eventFiles.length} event files.`);

    eventFiles.map((value) => {
      try {
        require(value);
        console.log(`Loaded event: ${value}`);
      } catch (error) {
        console.error(`Error loading event file at ${value}:`, error);
      }
    });

    // Slash Command Handler
    const slashCommands = await globPromise(`${process.cwd()}/SlashCommands/*/*.js`);
    console.log(`Found ${slashCommands.length} slash command files.`);

    const arrayOfSlashCommands = [];
    slashCommands.map((value) => {
      try {
        const command = require(value);
        const splitted = value.split("/");
        const directory = splitted[splitted.length - 2];

        if (!command?.data?.name) {
          console.warn(`Slash command file ${value} is missing 'data.name'.`);
          return;
        }

        const properties = { directory, ...command };
        client.slashCommands.set(command.data.name, properties);

        if (command.data instanceof SlashCommandBuilder) {
          arrayOfSlashCommands.push(command.data.toJSON());
        } else {
          arrayOfSlashCommands.push(command.data);
        }

        console.log(`Loaded slash command: ${command.data.name}`);
      } catch (error) {
        console.error(`Error loading slash command file at ${value}:`, error);
      }
    });

    // Register Slash Commands via Discord API
    const rest = new REST().setToken(process.env.token);
    try {
      const commands = await rest.put(
        Routes.applicationCommands("1327724156493762560"),
        {
          body: arrayOfSlashCommands,
        }
      );

      commands.map((cm) => {
        const obj = client.slashCommands.get(cm.name);
        if (obj) obj.id = cm.id;
      });

      console.log(`Successfully registered ${commands.length} slash commands.`);
    } catch (apiError) {
      console.error("Error registering slash commands via Discord API:", apiError);
    }

    // Connect to MongoDB
    mongoose.set("strictQuery", true);
    try {
      await mongoose.connect(process.env["mongo"]);
      console.log("Connected to MongoDB.");
    } catch (dbError) {
      console.error("Error connecting to MongoDB:", dbError);
    }
  } catch (mainError) {
    console.error("Error in handler initialization:", mainError);
  }
};
