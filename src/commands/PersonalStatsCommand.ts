import { Message } from "discord.js";
import { claimService } from "../claim/ClaimService";
import { createEmbed } from "../discord/createEmbed";
import { isGuildChatMessage } from "../discord/isGuildChatMessage";
import { timeAgo } from "../util/timeAgo";

/**
 * Process a personal stats command message. Returns the user's personal claim game statistics
 * @param msg - The discord.js message to process
 * @returns void
 */
export const processPersonalStatsCommand = async (msg: Message) => {
  if (!isGuildChatMessage(msg)) {
    return;
  }

  const data = await claimService.getClaimCountLeaderBoard(
    {
      guildId: msg.guild.id,
      claimantId: msg.author.id,
    },
    { limit: 1 }
  );

  const embed = createEmbed().setTitle("Your Stats").setTimestamp(new Date());

  if (data.length === 0) {
    embed.setDescription("You haven't made any claims yet!");
  } else {
    const userStats = data[0];
    embed.setDescription(
      `You have made **${userStats.count}** claim${
        Number(userStats.count) > 1 ? "s" : ""
      } in this server.\n\nYou started playing ${timeAgo(
        userStats.firstClaimDate
      )}.`
    );
  }

  await msg.reply(embed);
};
