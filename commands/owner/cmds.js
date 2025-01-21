module.exports = {
    name: "cmds",
    staff: true,
    run: async (client, message) => {
      // Separate commands based on their staff status
      const staffCommands = client.commands
        .filter((cmd) => cmd.staff)
        .map((cmd) => {
          const aliases = cmd.aliases?.join(", ") || "No Aliases";
          return `**$${cmd.name.padEnd(12)}** \`${aliases}\``;
        });
  
      const userCommands = client.commands
        .filter((cmd) => !cmd.staff)
        .map((cmd) => {
          const aliases = cmd.aliases?.join(", ") || "No Aliases";
          return `**$${cmd.name.padEnd(12)}** \`${aliases}\``;
        });
  
      // Helper function to format commands into rows of 3
      const formatCommands = (commands) => {
        const formatted = [];
        for (let i = 0; i < commands.length; i += 3) {
          formatted.push(commands.slice(i, i + 3).join(" | "));
        }
        return formatted.join("\n");
      };
  
      const staffCommandsFormatted = formatCommands(staffCommands);
      const userCommandsFormatted = formatCommands(userCommands);
  
      // Send the formatted message
      message.reply(
        `**Staff Commands:**\n${staffCommandsFormatted}\n\n**User Commands:**\n${userCommandsFormatted}`
      );
    },
  };
  