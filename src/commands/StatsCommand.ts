import { Message } from "discord.js";
import { claimService } from "../claim/ClaimService";
import { createEmbed } from "../discord/createEmbed";
import { isGuildChatMessage } from "../discord/isGuildChatMessage";
import { timeAgo } from "../util/timeAgo";

/**
 * Process a stats command message. Returns a list of the top contributors to the claim game
 * @param msg - The discord.js message to process
 * @returns void
 */
export const processStatsCommand = async (msg: Message) => {
  if (!isGuildChatMessage(msg)) {
    return;
  }
  const data = await claimService.getClaimCountLeaderBoard({
    guildId: msg.guild.id,
  });

  const embed = createEmbed().setTitle("Top 10!").setTimestamp(new Date());

  let i = 0;
  for (const row of data) {
    i++;
    embed.addField(
      `#${i}`,
      `<@${row.claimantId}>, ${row.count} claim${
        Number(row.count) > 1 ? "s" : ""
      }. Started playing ${timeAgo(row.firstClaimDate)}`
    );
  }
  await msg.reply(embed);
};
