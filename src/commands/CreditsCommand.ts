import { Message } from "discord.js";
import { createEmbed } from "../discord/createEmbed";

export function processCreditsCommand(msg: Message) {
  return msg.reply(
    createEmbed()
      .setTitle("Claim Game Credits")
      .addFields([
        {
          name: "Development",
          value: "Prov https://www.github.com/provinite/claim-game",
        },
      ])
  );
}
