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
  const isInGuild = isGuildChatMessage(msg);
  
  // Query parameters - if in guild, filter by guild; if in DM, get stats from all guilds
  const queryParams = isInGuild 
    ? { guildId: msg.guild.id, claimantId: msg.author.id }
    : { claimantId: msg.author.id };

  const data = await claimService.getClaimCountLeaderBoard(
    queryParams,
    { limit: isInGuild ? 1 : 50 } // Limit to more results for DM to show multiple guilds
  );

  const embed = createEmbed().setTitle("Your Stats").setTimestamp(new Date());

  if (data.length === 0) {
    embed.setDescription("You haven't made any claims yet!");
  } else if (isInGuild) {
    // Guild context - show stats for this server only
    const userStats = data[0];
    embed.setDescription(
      `You have made **${userStats.count}** claim${
        Number(userStats.count) > 1 ? "s" : ""
      } in this server.\n\nYou started playing ${timeAgo(
        userStats.firstClaimDate
      )}.`
    );
  } else {
    // DM context - show stats across all servers
    const totalClaims = data.reduce((sum, stats) => sum + Number(stats.count), 0);
    const earliestDate = data.reduce((earliest, stats) => 
      stats.firstClaimDate < earliest ? stats.firstClaimDate : earliest, 
      data[0].firstClaimDate
    );

    let description = `You have made **${totalClaims}** claim${
      totalClaims > 1 ? "s" : ""
    } across **${data.length}** server${data.length > 1 ? "s" : ""}.\n\n`;
    
    description += `You started playing ${timeAgo(earliestDate)}.\n\n`;
    
    description += "**Stats by server:**\n";
    for (const stats of data) {
      // Try to get guild name from client cache
      const guild = msg.client.guilds.cache.get(stats.guildId);
      const guildName = guild ? guild.name : `Server ${stats.guildId.slice(0, 8)}...`;
      description += `• ${guildName}: **${stats.count}** claim${Number(stats.count) > 1 ? "s" : ""}\n`;
    }

    embed.setDescription(description);
  }

  await msg.reply(embed);
};
