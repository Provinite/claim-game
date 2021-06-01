import { Message } from "discord.js";
import { createEmbed } from "../discord/createEmbed";

export function processBugCommand(msg: Message) {
  return msg.reply(
    createEmbed()
      .setTitle("Bug Reports")
      .setDescription(
        "Please report all issues on the github issues page at https://www.github.com/provinite/claim-game/issues"
      )
      .setFooter("We appreciate all reports and suggestions!")
  );
}
