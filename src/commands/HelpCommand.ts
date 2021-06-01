import { Message } from "discord.js";
import { createEmbed } from "../discord/createEmbed";

export const processHelpCommand = async (msg: Message) => {
  const reply = createEmbed()
    .setTitle("Claim Game Help")
    .setDescription("How to use Claim Game")
    .addFields([
      {
        name: "Commands",
        value: `To use a command, mention this bot at the beginning of your message and follow it immediately with one of the following commands.\n\nFor example "${msg.client.user} help" to see this message`,
      },
      {
        name: "claim",
        value:
          "Use the `claim` command to continue the claim chain. Make sure to include a reference in your claim message.",
        inline: true,
      },
      {
        name: "myclaims",
        value:
          "Use the `myclaims` command (in channel or DM) to get a list of your outstanding claims.",
        inline: true,
      },
      {
        name: "bug",
        value:
          "Use the `bug` command (in channel or DM) to get info on how to submit a bug report.",
        inline: true,
      },
      {
        name: "credits",
        value:
          "Use the `credits` command (in channel or DM) to get info on the creators of this bot.",
        inline: true,
      },
      {
        name: "\u200B",
        value: "\u200B",
      },
    ]);

  // admin commands section
  if (msg.member?.hasPermission("ADMINISTRATOR")) {
    reply.addFields([
      {
        name: "Admin Commands",
        value:
          "These commands are used to configure the bot on your server and can only be used by server administrators.",
      },
      {
        name: "init",
        value:
          "Use the `init` command to configure guild settings for the bot. Admins only.",
        inline: true,
      },
      {
        name: "settings",
        value:
          "Use the `settings` command to see the current guild's settings.",
        inline: true,
      },
      {
        name: "\u200B",
        value: "\u200B",
      },
    ]);
  }

  reply
    .addFields([
      {
        name: "Fulfilling a claim",
        value:
          "To fullfil an outstanding claim, go to the fulfillment channel and send a message containing a link or uploaded image, and mention the user that the claim is owed to.",
      },
    ])
    .setFooter("If anything goes wrong, reach out to AJ or Prov please. Thx");
  msg.reply(reply);
};
